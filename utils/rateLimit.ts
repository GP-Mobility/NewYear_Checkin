// Simple in-memory rate limiting for API protection
// Note: For production, consider using Redis or a proper rate limiting library

interface RateLimitEntry {
  count: number
  resetTime: number
}

const rateLimitStore = new Map<string, RateLimitEntry>()

// Clean up old entries every 5 minutes
setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetTime) {
      rateLimitStore.delete(key)
    }
  }
}, 5 * 60 * 1000)

/**
 * ตรวจสอบ rate limit
 * @param key - Unique key (เช่น IP, deviceId, fingerprint)
 * @param maxRequests - จำนวน request สูงสุด
 * @param windowMs - ระยะเวลาใน milliseconds
 * @returns true ถ้าเกิน limit, false ถ้ายังไม่เกิน
 */
export const checkRateLimit = (
  key: string,
  maxRequests: number = 10,
  windowMs: number = 60 * 1000 // 1 minute default
): boolean => {
  const now = Date.now()
  const entry = rateLimitStore.get(key)
  
  if (!entry || now > entry.resetTime) {
    // สร้าง entry ใหม่
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + windowMs
    })
    return false
  }
  
  // เพิ่ม count
  entry.count++
  
  if (entry.count > maxRequests) {
    return true // เกิน limit
  }
  
  return false
}

/**
 * ลบ rate limit entry
 */
export const clearRateLimit = (key: string): void => {
  rateLimitStore.delete(key)
}

/**
 * ตรวจสอบ pattern การใช้งานที่น่าสงสัย
 * เช่น เช็คอินเร็วเกินไป, หลาย staffid จาก device เดียวกัน
 */
export const checkSuspiciousPattern = (
  deviceSignature: string,
  staffid: string,
  timestamp: number
): { suspicious: boolean; reason?: string } => {
  // ตรวจสอบว่า device นี้เคยเช็คอินเร็วเกินไปหรือไม่
  // (น้อยกว่า 30 วินาที ระหว่างเช็คอิน)
  const recentKey = `recent_${deviceSignature}`
  const recentEntry = rateLimitStore.get(recentKey)
  
  if (recentEntry && timestamp - (recentEntry.resetTime - 30000) < 30000) {
    return {
      suspicious: true,
      reason: 'เช็คอินเร็วเกินไป'
    }
  }
  
  // บันทึก timestamp ล่าสุด
  rateLimitStore.set(recentKey, {
    count: 1,
    resetTime: timestamp + 30000
  })
  
  return { suspicious: false }
}

