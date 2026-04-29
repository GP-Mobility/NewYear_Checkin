import { NextRequest, NextResponse } from 'next/server'
import { query, executeTransaction } from '@/lib/db'
import mysql from 'mysql2/promise'

export const dynamic = 'force-dynamic'

interface CheckInRequest {
  staffid: string
  name: string
}

export async function POST(request: NextRequest) {
  try {
    const body: CheckInRequest = await request.json()
    const { staffid, name } = body

    // Validate input
    if (!staffid) {
      return NextResponse.json(
        { error: 'กรุณากรอกรหัสพนักงาน' },
        { status: 400 }
      )
    }

    // Validate staffid format (5-6 digits)
    if (!/^\d{5,6}$/.test(staffid.trim())) {
      return NextResponse.json(
        { error: 'รหัสพนักงานต้องเป็นตัวเลข 5-6 หลัก' },
        { status: 400 }
      )
    }
    
    // ถ้า name เป็นค่าว่าง แสดงว่าเป็นการเช็คสถานะเท่านั้น
    const isStatusCheck = !name || name.trim() === ''

    // ตรวจสอบว่ารหัสพนักงานนี้เคยเช็คอินแล้วหรือยัง (เช็คจาก checkinlog) - เหมือนหน้า index
    const checkExistingSql = `
      SELECT staffid, name, reward
      FROM checkinlog
      WHERE staffid = ?
      ORDER BY recordid DESC
      LIMIT 1
    `
    const existingCheckins = await query<any[]>(checkExistingSql, [staffid.trim()])

    if (existingCheckins && existingCheckins.length > 0) {
      // เคยเช็คอินแล้ว - ดึง rewardid จาก user table
      const existingCheckin = existingCheckins[0]
      let rewardid = null
      let reward = null
      
      try {
        const userRewardSql = 'SELECT rewardid FROM user WHERE staffid = ? LIMIT 1'
        const userRewardResults = await query<any[]>(userRewardSql, [staffid.trim()])
        if (userRewardResults && userRewardResults.length > 0) {
          rewardid = userRewardResults[0].rewardid
          
          // ถ้ามี rewardid = 0 (ไม่ได้รับรางวัล)
          if (rewardid === 0) {
            reward = { name: 'อุ๊ย! รอบนี้ยังไม่ได้นะ 😄', addon: null }
          } else if (rewardid && rewardid > 0) {
            // ถ้ามี rewardid > 0 ให้ดึงข้อมูลรางวัล โดยใช้ reward.running = user.rewardid
            const rewardSql = 'SELECT name, addon FROM reward WHERE running = ? LIMIT 1'
            const rewardResults = await query<any[]>(rewardSql, [rewardid])
            if (rewardResults && rewardResults.length > 0) {
              reward = {
                name: rewardResults[0].name || null,
                addon: rewardResults[0].addon || null
              }
            }
          }
        }
      } catch (error) {
        console.error('Error fetching rewardid:', error)
      }
      
      return NextResponse.json(
        {
          error: 'รหัสพนักงานนี้ได้ทำการเช็คอินไปแล้ว',
          message: 'ไม่สามารถเช็คอินซ้ำได้',
          alreadyCheckedIn: true,
          existingStaffid: existingCheckin.staffid,
          staffid: existingCheckin.staffid,
          name: existingCheckin.name || '',
          reward: reward,
          rewardid: rewardid,
          checkinTime: null
        },
        { status: 409 } // 409 Conflict
      )
    }

    // ยังไม่เคยเช็คอิน - ตรวจสอบว่ามีในระบบไหม
    const userSql = `
      SELECT staffid, staffname, rewardid, \`group\` as user_group
      FROM user
      WHERE staffid = ?
      LIMIT 1
    `
    const userData = await query<any[]>(userSql, [staffid.trim()])

    if (!userData || userData.length === 0) {
      return NextResponse.json(
        { 
          error: 'ไม่พบรหัสพนักงานนี้ในระบบ',
          message: 'ไม่พบรหัสพนักงานนี้ในระบบ กรุณาตรวจสอบรหัสพนักงานอีกครั้ง'
        },
        { status: 404 }
      )
    }

    const user = userData[0]

    // ถ้าเป็นการเช็คสถานะเท่านั้น (name เป็นค่าว่าง) ไม่ต้อง insert check-in
    if (isStatusCheck) {
      // Return ข้อมูลสถานะ
      let reward = null
      const rewardid = user.rewardid
      
      if (rewardid === 0) {
        reward = { name: 'อุ๊ย! รอบนี้ยังไม่ได้นะ 😄', addon: null }
      } else if (rewardid && rewardid > 0) {
        try {
          const rewardSql = 'SELECT name, addon FROM reward WHERE running = ? LIMIT 1'
          const rewardResults = await query<any[]>(rewardSql, [rewardid])
          if (rewardResults && rewardResults.length > 0) {
            reward = {
              name: rewardResults[0].name || null,
              addon: rewardResults[0].addon || null
            }
          }
        } catch (error) {
          console.error('Error fetching reward:', error)
        }
      }
      
      return NextResponse.json({
        success: true,
        staffid: user.staffid,
        name: user.staffname || '',
        checkinTime: null,
        group: user.user_group || null,
        hasReward: false,
        reward: reward,
        rewardid: rewardid
      })
    }

    // Insert check-in เข้า database (ไม่มีรางวัลตอนนี้)
    try {
      await executeTransaction<null>(async (connection: mysql.PoolConnection) => {
        // Insert check-in into database (ไม่มีรางวัล)
        const insertCheckinSql = `
          INSERT INTO checkinlog (staffid, name, reward)
          VALUES (?, ?, NULL)
        `
        await connection.execute(insertCheckinSql, [
          staffid.trim(), 
          name.trim()
        ])
        
        console.log(`[Station] Check-in completed for staff ${staffid.trim()}`)
        
        return null
      })

      // Return success - ส่ง rewardid มาด้วย
      return NextResponse.json({
        success: true,
        staffid: user.staffid,
        name: user.staffname || name.trim(),
        checkinTime: new Date().toISOString(),
        group: user.user_group || null,
        hasReward: false,
        reward: null,
        rewardid: user.rewardid || null
      })

    } catch (error: any) {
      console.error('Error in check-in transaction:', error)
      return NextResponse.json(
        {
          error: 'ไม่สามารถเช็คอินได้',
          message: error.message || 'กรุณาลองใหม่อีกครั้ง'
        },
        { status: 500 }
      )
    }

  } catch (error: any) {
    console.error('Station check-in error:', error)
    return NextResponse.json(
      { 
        error: 'เกิดข้อผิดพลาด',
        message: error.message 
      },
      { status: 500 }
    )
  }
}

