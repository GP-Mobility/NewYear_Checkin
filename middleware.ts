import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// รายการไฟล์ที่ bot มักจะสแกนหา (ไม่ใช่ไฟล์จริงของเรา)
const commonBotRequests = [
  '/index.js',
  '/api.js',
  '/stripe.js',
  '/stripe.json',
  '/stripe.yml',
  '/stripe.yaml',
  '/stripe.config.js',
  '/stripe.config.json',
  '/stripe-config.js',
  '/stripe-config.json',
  '/stripe-keys.js',
  '/stripe-keys.json',
  '/stripe-secret.js',
  '/stripe-secret.json',
  '/.env',
  '/.env.local',
  '/.env.production',
  '/.git',
  '/.git/config',
  '/robots.txt',
  '/sitemap.xml',
  '/package.json',
  '/package-lock.json',
  '/yarn.lock',
  '/composer.json',
  '/wp-config.php',
  '/wp-admin',
  '/admin',
  '/administrator',
  '/phpinfo.php',
  '/.well-known',
]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // ตรวจสอบว่าเป็น request ที่ bot มักจะสแกนหาหรือไม่
  if (commonBotRequests.some(path => pathname === path || pathname.startsWith(path))) {
    // Return 204 No Content เพื่อไม่ให้ log 404
    return new NextResponse(null, { status: 204 })
  }

  // ตรวจสอบไฟล์ .js, .json, .yml, .yaml ที่ root level (ไม่ใช่ Next.js routes)
  if (
    pathname.match(/^\/([^/]+)\.(js|json|yml|yaml|config\.js|config\.json)$/) &&
    !pathname.startsWith('/_next/') &&
    !pathname.startsWith('/api/')
  ) {
    return new NextResponse(null, { status: 204 })
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}

