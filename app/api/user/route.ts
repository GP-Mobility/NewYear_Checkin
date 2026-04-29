import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'

// GET method to get remaining reward
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const staffid = searchParams.get('staffid')
  if (!staffid) {
    return NextResponse.json(
      { error: 'Staff ID is required' },
      { status: 400 }
    )
  }
  // Validate staffid is numeric
  if (!/^\d+$/.test(staffid)) {
    return NextResponse.json(
      { error: 'รหัสพนักงานต้องเป็นตัวเลข' },
      { status: 400 }
    )
  }
  try {
    // Join กับตาราง reward เพื่อดึงข้อมูลรางวัล โดยใช้ user.rewardid = reward.running
    const sql = `
      SELECT 
        u.staffid,
        u.staffname,
        u.rewardid,
        r.name as reward_name,
        r.addon as reward_addon
      FROM user u
      LEFT JOIN reward r ON u.rewardid = r.running
      WHERE u.staffid = ?
    `
    const results = await query<any[]>(sql, [staffid])
    
    if (results && results.length > 0) {
      const userData = results[0]
      // Format response ให้เหมือนเดิม (เพื่อความเข้ากันได้)
      return NextResponse.json(
        {
          success: true,
          data: {
            staffid: userData.staffid,
            staffname: userData.staffname,
            rewardid: userData.rewardid,
            reward: userData.reward_name ? {
              name: userData.reward_name,
              addon: userData.reward_addon || null
            } : null
          }
        },
        { status: 200 }
      )
    } else {
      return NextResponse.json(
        {
          success: false,
          error: 'User not found'
        },
        { status: 404 }
      )
    }
  } catch (error: any) {
    console.error('Error fetching user:', error)
    
    return NextResponse.json(
      {
        error: 'Failed to fetch user',
        message: error.message || 'Unknown error'
      },
      { status: 500 }
    )
  }
}

