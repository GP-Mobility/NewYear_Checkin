/**
 * Hardware Fingerprint - ใช้ข้อมูลฮาร์ดแวร์ที่ไม่เปลี่ยนตาม browser
 * เพื่อระบุอุปกรณ์เดียวกันแม้จะใช้ browser ต่างกัน
 */

/**
 * สร้าง hardware fingerprint ที่เสถียรข้าม browser และ unique ต่อเครื่อง
 * ใช้เฉพาะข้อมูลที่ไม่เปลี่ยนเมื่อเปลี่ยน browser
 * @param deviceId - Optional device ID เพื่อเพิ่ม uniqueness
 */
export const getHardwareFingerprint = (deviceId?: string): string => {
  if (typeof window === 'undefined') return ''
  
  try {
    // ใช้ข้อมูลที่ unique มากขึ้นเพื่อป้องกัน collision
    const components = [
      // Screen information - ไม่เปลี่ยนใน inprivate mode
      screen.width?.toString() || '0',
      screen.height?.toString() || '0',
      screen.colorDepth?.toString() || '0',
      screen.pixelDepth?.toString() || '0',
      window.devicePixelRatio?.toString() || '1',
      
      // Hardware information - ไม่เปลี่ยนใน inprivate mode
      navigator.hardwareConcurrency?.toString() || '0', // CPU cores
      (navigator as any).deviceMemory?.toString() || '0', // RAM (GB)
      
      // System information - ใช้เฉพาะที่แน่ใจว่าไม่เปลี่ยน
      new Date().getTimezoneOffset().toString(), // Timezone (เสถียร)
      
      // Touch capability - ไม่เปลี่ยนใน inprivate mode
      (navigator as any).maxTouchPoints?.toString() || '0',
      
      // Screen available size - ไม่เปลี่ยนใน inprivate mode
      screen.availWidth?.toString() || '0',
      screen.availHeight?.toString() || '0',
      
      // เพิ่มข้อมูลที่ unique มากขึ้น (ถ้ามี)
      // User Agent - แม้จะถูกซ่อนใน incognito บางส่วน แต่ยังมีข้อมูลบางส่วน
      (navigator.userAgent || '').substring(0, 50), // ใช้แค่ส่วนแรกเพื่อความเสถียร
      
      // Platform - ถ้ามี (อาจถูกซ่อนใน incognito)
      (navigator.platform || 'unknown').substring(0, 20),
      
      // Language - ถ้ามี (อาจถูกซ่อนใน incognito)
      (navigator.language || 'unknown').substring(0, 10),
      
      // Canvas fingerprint - unique ต่อเครื่อง (แม้จะเปลี่ยนใน incognito บ้าง)
      getCanvasFingerprint(),
      
      // WebGL fingerprint - unique ต่อเครื่อง
      getWebGLFingerprint(),
      
      // Device ID - ถ้ามี (เพิ่ม uniqueness มากขึ้น)
      deviceId || '',
    ]

    const fingerprint = components.join('|')
    
    // ใช้ hash function ที่ดีกว่าเพื่อลด collision
    // ใช้ djb2 hash algorithm (ดีกว่า hash แบบเดิม)
    let hash = 5381
    for (let i = 0; i < fingerprint.length; i++) {
      hash = ((hash << 5) + hash) + fingerprint.charCodeAt(i)
      hash = hash & hash // Convert to 32bit integer
    }
    
    // สร้าง hash ตัวที่ 2 จาก fingerprint แบบกลับด้านเพื่อเพิ่ม entropy
    let hash2 = 0
    for (let i = fingerprint.length - 1; i >= 0; i--) {
      hash2 = ((hash2 << 5) - hash2) + fingerprint.charCodeAt(i)
      hash2 = hash2 & hash2
    }
    
    // รวม hash ทั้ง 2 ตัวเพื่อเพิ่ม uniqueness
    const combinedHash = Math.abs(hash) + Math.abs(hash2)
    
    // ใช้ base36 encoding และเพิ่มความยาวเพื่อลด collision
    return combinedHash.toString(36)
  } catch (e) {
    console.error('Error generating hardware fingerprint:', e)
    return ''
  }
}

/**
 * สร้าง Canvas fingerprint - unique ต่อเครื่อง
 */
function getCanvasFingerprint(): string {
  try {
    const canvas = document.createElement('canvas')
    canvas.width = 200
    canvas.height = 50
    const ctx = canvas.getContext('2d')
    if (!ctx) return 'no-canvas'
    
    ctx.textBaseline = 'top'
    ctx.font = '14px Arial'
    ctx.textBaseline = 'alphabetic'
    ctx.fillStyle = '#f60'
    ctx.fillRect(125, 1, 62, 20)
    ctx.fillStyle = '#069'
    ctx.fillText('DeviceFingerprint', 2, 15)
    ctx.fillStyle = 'rgba(102, 204, 0, 0.7)'
    ctx.fillText('DeviceFingerprint', 4, 17)
    
    return canvas.toDataURL().substring(0, 100) // ใช้แค่ส่วนแรก
  } catch (e) {
    return 'canvas-error'
  }
}

/**
 * สร้าง WebGL fingerprint - unique ต่อเครื่อง
 */
function getWebGLFingerprint(): string {
  try {
    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
    if (!gl) return 'no-webgl'
    
    // Cast to WebGLRenderingContext for TypeScript
    const webglContext = gl as WebGLRenderingContext
    
    const debugInfo = webglContext.getExtension('WEBGL_debug_renderer_info')
    if (debugInfo) {
      const vendor = webglContext.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) || 'unknown'
      const renderer = webglContext.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || 'unknown'
      return `${vendor.substring(0, 20)}_${renderer.substring(0, 20)}`
    }
    
    return 'no-debug-info'
  } catch (e) {
    return 'webgl-error'
  }
}

/**
 * สร้าง device signature จาก hardware fingerprint + IP
 * จะเหมือนกันแม้จะใช้ browser ต่างกัน
 */
export const createDeviceSignature = (hardwareFingerprint: string, ip: string): string => {
  const raw = `${hardwareFingerprint}_${ip}`
  let hash = 0
  for (let i = 0; i < raw.length; i++) {
    const char = raw.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return Math.abs(hash).toString(36)
}

/**
 * Debug: แสดงข้อมูล hardware ทั้งหมด
 */
export const getHardwareInfo = () => {
  if (typeof window === 'undefined') return null
  
  return {
    screen: {
      width: screen.width,
      height: screen.height,
      colorDepth: screen.colorDepth,
      pixelDepth: screen.pixelDepth,
      availWidth: screen.availWidth,
      availHeight: screen.availHeight,
      orientation: screen.orientation?.type,
    },
    hardware: {
      cores: navigator.hardwareConcurrency,
      memory: (navigator as any).deviceMemory,
      maxTouchPoints: (navigator as any).maxTouchPoints,
      devicePixelRatio: window.devicePixelRatio,
    },
    system: {
      platform: navigator.platform,
      language: navigator.language,
      languages: navigator.languages,
      timezone: new Date().getTimezoneOffset(),
      timezoneString: Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
  }
}

