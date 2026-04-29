import { NextResponse } from 'next/server'
import crypto from 'crypto'

const FIVE_MINUTES = 5 * 60 * 1000

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic'
export const revalidate = 0

const getSecret = () => process.env.QR_SECRET || 'change-me-please'

const sign = (payload: string) => {
  return crypto.createHmac('sha256', getSecret()).update(payload).digest('base64url')
}

export async function GET() {
  try {
    const nonce = crypto.randomBytes(16).toString('hex')
    const expiresAt = Date.now() + FIVE_MINUTES
    const payload = `${nonce}.${expiresAt}`
    const signature = sign(payload)
    const token = `${payload}.${signature}`

    return NextResponse.json(
      {
        success: true,
        token,
        expiresAt,
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Error generating QR token:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to generate token',
        message: error?.message || 'Unknown error'
      },
      { status: 500 }
    )
  }
}

