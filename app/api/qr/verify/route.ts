import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

const getSecret = () => process.env.QR_SECRET || 'change-me-please'

const sign = (payload: string) => {
  return crypto.createHmac('sha256', getSecret()).update(payload).digest('base64url')
}

function verifyToken(token: string) {
  const parts = token.split('.')
  if (parts.length !== 3) return { valid: false, reason: 'invalid_format' }

  const [nonce, expStr, signature] = parts
  const payload = `${nonce}.${expStr}`
  const expectedSig = sign(payload)
  if (expectedSig !== signature) return { valid: false, reason: 'invalid_signature' }

  const exp = parseInt(expStr, 10)
  if (Number.isNaN(exp)) return { valid: false, reason: 'invalid_exp' }
  if (Date.now() > exp) return { valid: false, reason: 'expired' }

  return { valid: true, expiresAt: exp }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const token = body?.token as string | undefined
    if (!token) {
      return NextResponse.json(
        { success: false, valid: false, reason: 'missing_token' },
        { status: 400 }
      )
    }

    const result = verifyToken(token)
    if (!result.valid) {
      return NextResponse.json(
        { success: true, valid: false, reason: result.reason },
        { status: 200 }
      )
    }

    return NextResponse.json(
      { success: true, valid: true, expiresAt: result.expiresAt },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Error verifying QR token:', error)
    return NextResponse.json(
      { success: false, valid: false, reason: 'server_error', message: error?.message || 'Unknown error' },
      { status: 500 }
    )
  }
}

