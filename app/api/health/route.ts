import { NextResponse } from 'next/server'
import { testConnection } from '@/lib/db'

export async function GET() {
  try {
    const dbConnected = await testConnection()
    
    return NextResponse.json(
      {
        status: 'ok',
        timestamp: new Date().toISOString(),
        database: dbConnected ? 'connected' : 'disconnected',
      },
      { status: dbConnected ? 200 : 503 }
    )
  } catch (error: any) {
    return NextResponse.json(
      {
        status: 'error',
        timestamp: new Date().toISOString(),
        error: error.message || 'Unknown error',
      },
      { status: 503 }
    )
  }
}

