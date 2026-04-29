import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic'

// GET /api/checkin/device?hwFingerprint=...&fingerprint=...&deviceId=...
// ใช้ตรวจว่ามี device นี้เคยเช็คอินแล้วหรือไม่ เพื่อบล็อกตั้งแต่หน้าแรก
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const hwFingerprint = searchParams.get('hwFingerprint') || '' // Hardware fingerprint (เสถียรข้าม browser)
    const fingerprint = searchParams.get('fingerprint') || '' // Advanced fingerprint (สำหรับ fallback)
    const deviceId = searchParams.get('deviceId') || ''
    
    console.log('Device Check:', { hwFingerprint, fingerprint, deviceId })
    
    // ใช้ hardware fingerprint เป็นหลัก (เสถียรข้าม browser)
    const primaryFingerprint = hwFingerprint || fingerprint
    
    // ถ้าไม่มี fingerprint ถือว่าไม่สามารถระบุอุปกรณ์ได้
    if (!primaryFingerprint) {
      return NextResponse.json(
        {
          alreadyUsed: false,
        },
        { status: 200 }
      )
    }

    // สร้าง device signature จาก hardware fingerprint เท่านั้น (ไม่ใช้ IP)
    // เพื่อป้องกันเครื่องอื่นใน network เดียวกันถูก detect เป็นเครื่องเดียวกัน
    // ใช้เฉพาะ hardware fingerprint ที่ unique ต่อเครื่องจริงๆ
    const deviceSignature = primaryFingerprint // ใช้ hardware fingerprint โดยตรง
    
    console.log('Device Signature (hwFingerprint only):', deviceSignature)

    // ขั้นที่ 1: ใช้ hwFingerprint หา employee_staffid (หลัก - เสถียรข้าม browser)
    let employeeStaffid: string | null = null
    try {
      const findStaffidSql = `
        SELECT employee_staffid
        FROM device_checkin
        WHERE hwFingerprint = ?
        ORDER BY updated_at DESC
        LIMIT 1
      `
      const staffidResults = await query<any[]>(findStaffidSql, [primaryFingerprint])
      if (staffidResults && staffidResults.length > 0 && staffidResults[0].employee_staffid) {
        employeeStaffid = staffidResults[0].employee_staffid
        console.log('Found by hwFingerprint:', employeeStaffid)
      }
    } catch (error) {
      console.error('Error finding employee_staffid by hwFingerprint:', error)
    }

    // ถ้าไม่เจอจาก hwFingerprint ให้ลองหาจาก device_id เท่านั้น (ไม่ใช้ device_signature ที่มี IP)
    // เพื่อป้องกันเครื่องอื่นใน network เดียวกันถูก detect เป็นเครื่องเดียวกัน
    if (!employeeStaffid && deviceId) {
      try {
        const fallbackSql = `
          SELECT employee_staffid, staffid
          FROM device_checkin
          WHERE device_id = ?
          ORDER BY updated_at DESC
          LIMIT 1
        `
        const fallbackResults = await query<any[]>(fallbackSql, [deviceId])
        if (fallbackResults && fallbackResults.length > 0) {
          employeeStaffid = fallbackResults[0].employee_staffid || fallbackResults[0].staffid || null
          console.log('Found by device_id:', employeeStaffid)
        }
      } catch (error) {
        console.log('device_checkin table not found, skip device guard')
      }
    }

    // ถ้าไม่เจอ employee_staffid แสดงว่ายังไม่เคยเช็คอิน
    if (!employeeStaffid) {
      return NextResponse.json(
        {
          alreadyUsed: false,
        },
        { status: 200 }
      )
    }

    // ขั้นที่ 2: ใช้ employee_staffid หา employee_reward และข้อมูลอื่นๆ
    let name = null
    let rewardName = null
    let rewardAddon = null
    let group = null
    let checkinTime = null
    let feedbackSubmitted = false
    let checkedIn = false

    try {
      const deviceSql = `
        SELECT employee_name, employee_reward, user_group, created_at,
               feedback_submitted, checked_in
        FROM device_checkin
        WHERE employee_staffid = ?
        ORDER BY created_at DESC
        LIMIT 1
      `
      const deviceResults = await query<any[]>(deviceSql, [employeeStaffid])
      if (deviceResults && deviceResults.length > 0) {
        name = deviceResults[0].employee_name || null
        checkinTime = deviceResults[0].created_at || null
        feedbackSubmitted = deviceResults[0].feedback_submitted === 1
        checkedIn = deviceResults[0].checked_in === 1
        
        // ดึงรางวัลจาก employee_reward
        if (deviceResults[0].employee_reward) {
          const rewardParts = deviceResults[0].employee_reward.split(' + ')
          rewardName = rewardParts[0]
          if (rewardParts.length > 1) {
            rewardAddon = rewardParts.slice(1).join(' + ')
          }
        }
        
        group = deviceResults[0].user_group || null
      }
    } catch (error) {
      console.error('Error fetching device_checkin by employee_staffid:', error)
    }

    // ถ้ายังไม่มี name ให้ดึงจาก checkinlog (ตาราง checkinlog ใช้ column name)
    if (!name) {
      try {
        const logSql = `
          SELECT name
          FROM checkinlog
          WHERE staffid = ?
          ORDER BY recordid DESC
          LIMIT 1
        `
        const logs = await query<any[]>(logSql, [employeeStaffid])
        if (logs && logs.length > 0) {
          name = logs[0].name
        }
      } catch (error) {
        console.error('Error fetching checkinlog for device guard:', error)
      }
    }

    // ดึง rewardid และ group จาก user table
    let rewardid = null
    if (!group) {
      try {
        const userSql = 'SELECT `group`, rewardid FROM user WHERE staffid = ? LIMIT 1'
        const users = await query<any[]>(userSql, [employeeStaffid])
        if (users && users.length > 0) {
          group = users[0].group
          rewardid = users[0].rewardid
        }
      } catch (error) {
        console.error('Error fetching user group and rewardid:', error)
      }
    } else {
      // ถ้ามี group แล้ว แต่ยังไม่มี rewardid ให้ดึง rewardid
      try {
        const rewardidSql = 'SELECT rewardid FROM user WHERE staffid = ? LIMIT 1'
        const rewardidResults = await query<any[]>(rewardidSql, [employeeStaffid])
        if (rewardidResults && rewardidResults.length > 0) {
          rewardid = rewardidResults[0].rewardid
        }
      } catch (error) {
        console.error('Error fetching rewardid:', error)
      }
    }

    // ถ้ามี rewardid = 0 (ไม่ได้รับรางวัล) ให้แสดงข้อความ
    let finalReward = null
      if (rewardid === 0) {
        finalReward = { name: 'อุ๊ย! รอบนี้ยังไม่ได้นะ 😄', addon: null }
    } else if (rewardid && rewardid > 0) {
      // ถ้ามี rewardid > 0 ให้ดึงข้อมูลรางวัลจาก reward table โดยใช้ reward.running = user.rewardid
      try {
        const rewardSql = 'SELECT name, addon FROM reward WHERE running = ? LIMIT 1'
        const rewardResults = await query<any[]>(rewardSql, [rewardid])
        if (rewardResults && rewardResults.length > 0) {
          finalReward = {
            name: rewardResults[0].name || null,
            addon: rewardResults[0].addon || null
          }
        }
      } catch (error) {
        console.error('Error fetching reward:', error)
      }
    } else if (rewardName) {
      // Fallback: ใช้ rewardName จาก device_checkin (กรณีเก่า)
      finalReward = {
        name: rewardName,
        addon: rewardAddon
      }
    }

    return NextResponse.json(
      {
        alreadyUsed: true,
        feedbackSubmitted: feedbackSubmitted,
        checkedIn: checkedIn,
        staffid: employeeStaffid,
        name: name,
        reward: finalReward,
        rewardid: rewardid,
        group: group ?? null,
        checkinTime: checkinTime || null,
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Error in device guard API:', error)
    return NextResponse.json(
      {
        error: 'Failed to check device',
        message: error.message || 'Unknown error',
      },
      { status: 500 }
    )
  }
}

