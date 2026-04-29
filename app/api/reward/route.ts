import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

// GET method to get remaining reward
// Query parameter: ?all=true to get all rewards
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const getAll = searchParams.get('all') === 'true'
    
    if (getAll) {
      // ดึงรางวัลทั้งหมดสำหรับ animation
      const sql = 'SELECT running, name, addon FROM reward WHERE status = 0 ORDER BY running'
      const results = await query<any[]>(sql)
      
      return NextResponse.json(
        {
          message: 'All remaining rewards',
          rewards: results || []
        },
        { status: 200 }
      )
    } else {
      // ดึงรางวัลเดียว (เดิม)
      const sql = 'SELECT * FROM reward WHERE status = 0 LIMIT 1'
      const results = await query<any[]>(sql)
      
      if (results && results.length > 0) {
        return NextResponse.json(
          {
            message: 'Remaining reward',
            reward: results[0]
          },
          { status: 200 }
        )
      } else {
        return NextResponse.json(
          {
            message: 'No remaining reward',
            reward: null
          },
          { status: 200 }
        )
      }
    }
  } catch (error: any) {
    console.error('Error fetching reward:', error)
    
    return NextResponse.json(
      {
        error: 'Failed to fetch reward',
        message: error.message || 'Unknown error'
      },
      { status: 500 }
    )
  }
}

