// Utility functions for detecting and preventing incognito/private mode

/**
 * ตรวจสอบว่า localStorage ใช้งานได้จริงหรือไม่
 * ใน incognito mode บางเบราว์เซอร์จะจำกัด localStorage
 */
export const isLocalStorageAvailable = (): boolean => {
  if (typeof window === 'undefined') return false
  
  try {
    const test = '__incognito_test__'
    localStorage.setItem(test, test)
    const retrieved = localStorage.getItem(test)
    localStorage.removeItem(test)
    
    // ตรวจสอบว่าจริงๆ แล้วเก็บข้อมูลได้
    if (retrieved !== test) {
      return false
    }
    
    return true
  } catch (e) {
    // บางเบราว์เซอร์จะ throw error ใน incognito mode
    return false
  }
}

/**
 * ตรวจสอบว่า sessionStorage ใช้งานได้จริงหรือไม่
 */
export const isSessionStorageAvailable = (): boolean => {
  if (typeof window === 'undefined') return false
  
  try {
    const test = '__incognito_test_session__'
    sessionStorage.setItem(test, test)
    const retrieved = sessionStorage.getItem(test)
    sessionStorage.removeItem(test)
    
    if (retrieved !== test) {
      return false
    }
    
    return true
  } catch (e) {
    return false
  }
}

/**
 * ตรวจสอบว่า IndexedDB ใช้งานได้หรือไม่
 */
export const isIndexedDBAvailable = (): boolean => {
  if (typeof window === 'undefined') return false
  
  try {
    return !!window.indexedDB
  } catch (e) {
    return false
  }
}

/**
 * ตรวจสอบว่าเป็น incognito/private mode หรือไม่
 * โดยตรวจสอบหลายๆ วิธี
 */
export const isIncognitoMode = async (): Promise<boolean> => {
  if (typeof window === 'undefined') return false

  // วิธีที่ 1: ตรวจสอบ localStorage
  if (!isLocalStorageAvailable()) {
    console.warn('⚠️ localStorage ไม่สามารถใช้งานได้ - อาจเป็น incognito mode')
    return true
  }

  // วิธีที่ 2: ตรวจสอบ sessionStorage
  if (!isSessionStorageAvailable()) {
    console.warn('⚠️ sessionStorage ไม่สามารถใช้งานได้ - อาจเป็น incognito mode')
    return true
  }

  // วิธีที่ 3: ตรวจสอบ FileSystem API (Safari private mode)
  try {
    if (navigator.storage && navigator.storage.estimate) {
      // Safari private mode จะ return 0 สำหรับ quota
      try {
        const estimate = await navigator.storage.estimate()
        if (estimate.quota && estimate.quota === 0) {
          console.warn('⚠️ Storage quota เป็น 0 - อาจเป็น incognito mode')
          return true
        }
      } catch (e) {
        // ignore
      }
    }
  } catch (e) {
    // ignore
  }

  // วิธีที่ 4: ตรวจสอบว่าสามารถอ่านข้อมูลที่เก็บไว้ได้หรือไม่
  try {
    const testKey = '__incognito_persistence_test__'
    const testValue = Date.now().toString()
    
    localStorage.setItem(testKey, testValue)
    
    // รอสักครู่เพื่อให้แน่ใจว่าข้อมูลถูกบันทึก (สำคัญสำหรับ Safari private mode)
    await new Promise(resolve => setTimeout(resolve, 10))
    
    const retrieved = localStorage.getItem(testKey)
    
    if (retrieved !== testValue) {
      console.warn('⚠️ localStorage ไม่สามารถเก็บข้อมูลได้ - อาจเป็น incognito mode')
      localStorage.removeItem(testKey)
      return true
    }
    
    // ลบ test data
    localStorage.removeItem(testKey)
  } catch (e) {
    console.warn('⚠️ เกิดข้อผิดพลาดในการทดสอบ localStorage - อาจเป็น incognito mode')
    return true
  }

  // วิธีที่ 5: ตรวจสอบ Safari Private Mode (iOS)
  try {
    // Safari private mode บน iOS จะมี navigator.standalone = false
    // และ localStorage อาจใช้งานได้แต่จะไม่ persist
    if (navigator.userAgent.includes('iPhone') || navigator.userAgent.includes('iPad')) {
      // ทดสอบ persistence อีกครั้ง
      const testKey2 = '__safari_private_test__'
      const testValue2 = Date.now().toString()
      localStorage.setItem(testKey2, testValue2)
      await new Promise(resolve => setTimeout(resolve, 50))
      const retrieved2 = localStorage.getItem(testKey2)
      localStorage.removeItem(testKey2)
      
      if (retrieved2 !== testValue2) {
        console.warn('⚠️ Safari private mode detected (iOS)')
        return true
      }
    }
  } catch (e) {
    // ignore
  }

  return false
}

/**
 * ตรวจสอบและบันทึก device fingerprint
 * ใช้สำหรับตรวจสอบว่าเป็น device เดียวกันหรือไม่
 */
export const getDeviceFingerprint = (): string => {
  if (typeof window === 'undefined') return ''

  try {
    const components = [
      navigator.userAgent,
      navigator.language,
      screen.width + 'x' + screen.height,
      screen.colorDepth?.toString() || '',
      new Date().getTimezoneOffset().toString(),
      navigator.platform,
      navigator.hardwareConcurrency?.toString() || '',
      (navigator as any).deviceMemory?.toString() || '',
    ]

    // สร้าง hash จาก components
    const fingerprint = components.join('|')
    
    // ใช้ simple hash function
    let hash = 0
    for (let i = 0; i < fingerprint.length; i++) {
      const char = fingerprint.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32bit integer
    }
    
    return Math.abs(hash).toString(36)
  } catch (e) {
    console.error('Error generating device fingerprint:', e)
    return Date.now().toString(36)
  }
}

/**
 * ตรวจสอบว่า storage ใช้งานได้และสามารถเก็บข้อมูลได้จริง
 */
export const testStoragePersistence = async (): Promise<boolean> => {
  if (typeof window === 'undefined') return false

  try {
    // ทดสอบ localStorage
    const testKey = '__persistence_test__'
    const testValue = Date.now().toString()
    
    localStorage.setItem(testKey, testValue)
    await new Promise(resolve => setTimeout(resolve, 100)) // รอสักครู่
    const retrieved = localStorage.getItem(testKey)
    localStorage.removeItem(testKey)
    
    if (retrieved !== testValue) {
      return false
    }

    // ทดสอบ sessionStorage
    const sessionTestKey = '__persistence_test_session__'
    const sessionTestValue = Date.now().toString()
    
    sessionStorage.setItem(sessionTestKey, sessionTestValue)
    await new Promise(resolve => setTimeout(resolve, 100))
    const sessionRetrieved = sessionStorage.getItem(sessionTestKey)
    sessionStorage.removeItem(sessionTestKey)
    
    if (sessionRetrieved !== sessionTestValue) {
      return false
    }

    return true
  } catch (e) {
    return false
  }
}

