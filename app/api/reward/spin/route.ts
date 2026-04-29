import { NextRequest, NextResponse } from 'next/server'
import { query, executeTransaction } from '@/lib/db'
import * as mysql from 'mysql2/promise'

export const dynamic = 'force-dynamic'

// Rate limiting สำหรับการสุ่มรางวัล
const rewardSpinAttempts = new Map<string, { count: number; resetTime: number }>()

function checkRewardSpinRateLimit(key: string, maxAttempts: number = 3, windowMs: number = 60000): boolean {
  const now = Date.now()
  const record = rewardSpinAttempts.get(key)
  
  if (!record || now > record.resetTime) {
    rewardSpinAttempts.set(key, { count: 1, resetTime: now + windowMs })
    return true
  }
  
  if (record.count >= maxAttempts) {
    return false
  }
  
  record.count++
  return true
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { staffid, deviceId, hwFingerprint, deviceFingerprint, source } = body

    // Validate input
    if (!staffid) {
      return NextResponse.json(
        { error: 'กรุณาระบุ staffid' },
        { status: 400 }
      )
    }

    // แปลง staffid เป็น string และ trim
    const staffidStr = String(staffid || '').trim()
    if (!staffidStr) {
      return NextResponse.json(
        { error: 'กรุณาระบุ staffid' },
        { status: 400 }
      )
    }

    // ถ้าไม่ใช่จาก station ต้องมี deviceId
    if (source !== 'station' && !deviceId) {
      return NextResponse.json(
        { error: 'กรุณาระบุ deviceId' },
        { status: 400 }
      )
    }

    // Rate limiting - ป้องกันการสุ่มซ้ำๆ
    const rateLimitKey = source === 'station' 
      ? `station_${staffidStr}` 
      : `${deviceId}_${staffidStr}`
    if (!checkRewardSpinRateLimit(rateLimitKey, 3, 60000)) {
      return NextResponse.json(
        { error: 'คุณสุ่มรางวัลบ่อยเกินไป กรุณารอสักครู่' },
        { status: 429 }
      )
    }

    // ตรวจสอบว่า staff นี้เคยได้รางวัลแล้วหรือยัง
    const userCheckSql = 'SELECT rewardid FROM user WHERE staffid = ?'
    const userResults = await query<any[]>(userCheckSql, [staffidStr])
    
    if (!userResults || userResults.length === 0) {
      return NextResponse.json(
        { error: 'ไม่พบรหัสพนักงานนี้' },
        { status: 404 }
      )
    }

    const existingRewardId = userResults[0].rewardid
    
    // ถ้ามี rewardid แล้ว (ไม่ว่าจะเป็น 0 หรือค่าอื่น) แสดงว่าสุ่มไปแล้ว ไม่ให้สุ่มซ้ำ
    // rewardid = 0 หมายความว่าไม่ได้รับรางวัล (รางวัลหมด) และไม่ให้สุ่มซ้ำ
    if (existingRewardId !== null && existingRewardId !== undefined) {
      if (existingRewardId === 0) {
        // ไม่ได้รับรางวัล (รางวัลหมด) - ไม่ให้สุ่มซ้ำ
        return NextResponse.json(
          {
            message: 'คุณได้สุ่มรางวัลไปแล้ว แต่ไม่ได้รับรางวัลในครั้งนี้',
            reward: null,
            alreadyAssigned: true
          },
          { status: 200 }
        )
      } else {
        // ได้รับรางวัลแล้ว - ดึงข้อมูลรางวัลที่ได้ไปแล้ว โดยใช้ reward.running = user.rewardid
        const rewardSql = 'SELECT running, name, addon FROM reward WHERE running = ?'
        const rewardResults = await query<any[]>(rewardSql, [existingRewardId])
        
        if (rewardResults && rewardResults.length > 0) {
          return NextResponse.json(
            {
              message: 'คุณได้รับรางวัลไปแล้ว',
              reward: {
                name: rewardResults[0].name || null,
                addon: rewardResults[0].addon || null
              },
              alreadyAssigned: true
            },
            { status: 200 }
          )
        }
      }
    }

    // สุ่มรางวัลด้วย transaction และ row-level locking
    const maxRetries = 20
    let rewardData: { running: number; name: string; addon?: string | null } | null = null

    try {
      const transactionResult = await executeTransaction<{ running: number; name: string; addon?: string | null }>(async (connection: mysql.PoolConnection) => {
        let attempts = 0
        let selectedReward: { running: number; name: string; addon?: string | null } | null = null
        
        while (attempts < maxRetries && !selectedReward) {
          // สุ่มรางวัล - ใช้ FOR UPDATE SKIP LOCKED เพื่อลด lock contention
          const rewardSql = 'SELECT running, name, addon FROM reward WHERE status = 0 ORDER BY RAND() LIMIT 1 FOR UPDATE SKIP LOCKED'
          const [rewardResults] = await connection.execute<any[]>(rewardSql)
          
          if (rewardResults && rewardResults.length > 0) {
            const candidateReward = rewardResults[0]
            const rewardId = candidateReward.running
            
            // ตรวจสอบอีกครั้งว่า reward นี้ยัง status = 0 อยู่หรือไม่
            const checkSql = 'SELECT running, status FROM reward WHERE running = ? FOR UPDATE SKIP LOCKED'
            const [checkResults] = await connection.execute<any[]>(checkSql, [rewardId])
            
            if (checkResults && checkResults.length > 0 && checkResults[0].status === 0) {
              // Reward นี้ยังไม่ถูกใช้ ใช้ได้เลย
              selectedReward = candidateReward
              
              // Update status เป็น 1 ทันที (lock ไว้)
              const updateSql = 'UPDATE reward SET status = 1 WHERE running = ?'
              await connection.execute(updateSql, [rewardId])
              
              console.log(`Reward ${rewardId} selected and locked for staff ${staffidStr}`)
              break
            } else {
              // Reward นี้ถูกใช้ไปแล้ว ให้สุ่มใหม่
              console.log(`Reward ${rewardId} already taken, retrying... (attempt ${attempts + 1}/${maxRetries})`)
              attempts++
              
              // รอสักครู่ก่อนสุ่มใหม่ (exponential backoff)
              const backoffDelay = Math.min(50 * (attempts + 1), 500)
              await new Promise(resolve => setTimeout(resolve, backoffDelay))
            }
          } else {
            // ไม่มีรางวัลเหลือแล้ว
            console.log('No rewards available')
            break
          }
        }
        
        if (!selectedReward) {
          // ไม่มีรางวัลเหลือแล้ว - throw error พิเศษเพื่อจับไว้ภายนอก
          const noRewardError: any = new Error('รางวัลหมดแล้ว')
          noRewardError.isNoReward = true
          throw noRewardError
        }
        
        const rewardId = selectedReward.running
        
        // Update rewardid in user table (ภายใน transaction เดียวกัน)
        const updateUserRewardSql = 'UPDATE user SET rewardid = ? WHERE staffid = ?'
        await connection.execute(updateUserRewardSql, [rewardId, staffidStr])
        
        // Update reward column in checkinlog
        const updateCheckinLogSql = 'UPDATE checkinlog SET reward = ? WHERE staffid = ? ORDER BY recordid DESC LIMIT 1'
        await connection.execute(updateCheckinLogSql, [rewardId, staffidStr])
        
        console.log(`Reward ${rewardId} assigned to staff ${staffidStr}`)
        
        return selectedReward
      })
      
      rewardData = transactionResult
    } catch (error: any) {
      console.error('Error in reward spin transaction:', error)
      // ถ้าเป็นกรณีที่ไม่มีรางวัลเหลือ ให้ update rewardid เป็น 0 และ return null
      if (error.isNoReward || (error.message && error.message.includes('รางวัลหมด'))) {
        rewardData = null
        // Update rewardid เป็น 0 เพื่อป้องกันการกดสุ่มใหม่ได้เรื่อยๆ
        try {
          const updateNoRewardSql = 'UPDATE user SET rewardid = 0 WHERE staffid = ?'
          await query(updateNoRewardSql, [staffidStr])
          console.log(`Updated rewardid to 0 for staff ${staffidStr} (no reward available)`)
        } catch (updateError) {
          console.error('Error updating rewardid to 0:', updateError)
          // ไม่ throw error เพราะรางวัลหมดแล้วอยู่แล้ว
        }
      } else {
        return NextResponse.json(
          {
            error: 'ไม่สามารถสุ่มรางวัลได้',
            message: error.message || 'กรุณาลองใหม่อีกครั้ง'
          },
          { status: 500 }
        )
      }
    }

    // Update device_checkin table (เฉพาะกรณีที่ไม่ใช่ station)
    if (source !== 'station') {
      try {
        // ใช้เฉพาะ hardware fingerprint เท่านั้น (ไม่ใช้ IP) เพื่อป้องกันเครื่องอื่นใน network เดียวกันถูก detect เป็นเครื่องเดียวกัน
        const primaryFingerprint = hwFingerprint || deviceFingerprint
        const deviceSignature = primaryFingerprint // ใช้ hardware fingerprint โดยตรง (ไม่รวม IP)
        
        const updateDeviceSql = `
          UPDATE device_checkin 
          SET employee_reward = ?
          WHERE hwFingerprint = ? OR device_id = ?
        `
        const rewardName = rewardData ? 
          (rewardData.addon ? `${rewardData.name} + ${rewardData.addon}` : rewardData.name) : 
          null
        
        await query(updateDeviceSql, [
          rewardName,
          primaryFingerprint, // hwFingerprint (เช็คเป็นอันดับแรก)
          deviceId || null
        ])
        console.log('Device reward updated with hwFingerprint:', primaryFingerprint)
      } catch (error) {
        console.error('Error updating device_checkin:', error)
        // ไม่ throw error เพราะรางวัลได้ถูก assign แล้ว
      }
    } else {
      console.log('[Station] Skipped device_checkin update for station check-in')
    }

    return NextResponse.json(
      {
        message: 'สุ่มรางวัลสำเร็จ',
        reward: rewardData ? {
          name: rewardData.name || null,
          addon: rewardData.addon || null
        } : null,
        alreadyAssigned: false
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Reward spin error:', error)
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการสุ่มรางวัล' },
      { status: 500 }
    )
  }
}

