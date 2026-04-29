// Advanced browser fingerprinting for public IP/DNS protection

/**
 * สร้าง Canvas fingerprint
 */
export const getCanvasFingerprint = (): string => {
  if (typeof window === 'undefined') return ''
  
  try {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx) return ''
    
    canvas.width = 200
    canvas.height = 50
    ctx.textBaseline = 'top'
    ctx.font = '14px Arial'
    ctx.textBaseline = 'alphabetic'
    ctx.fillStyle = '#f60'
    ctx.fillRect(125, 1, 62, 20)
    ctx.fillStyle = '#069'
    ctx.fillText('Browser fingerprint 🎨', 2, 15)
    ctx.fillStyle = 'rgba(102, 204, 0, 0.7)'
    ctx.fillText('Browser fingerprint 🎨', 4, 17)
    
    return canvas.toDataURL()
  } catch (e) {
    return ''
  }
}

/**
 * สร้าง WebGL fingerprint
 */
export const getWebGLFingerprint = (): string => {
  if (typeof window === 'undefined') return ''
  
  try {
    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
    if (!gl) return ''
    
    // Cast to WebGLRenderingContext for TypeScript
    const webglContext = gl as WebGLRenderingContext
    
    const debugInfo = webglContext.getExtension('WEBGL_debug_renderer_info')
    if (debugInfo) {
      const vendor = webglContext.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL)
      const renderer = webglContext.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL)
      return `${vendor}_${renderer}`
    }
    
    return webglContext.getParameter(webglContext.VENDOR) + '_' + webglContext.getParameter(webglContext.RENDERER)
  } catch (e) {
    return ''
  }
}

/**
 * สร้าง Audio fingerprint
 */
export const getAudioFingerprint = async (): Promise<string> => {
  if (typeof window === 'undefined') return ''
  
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    const oscillator = audioContext.createOscillator()
    const analyser = audioContext.createAnalyser()
    const gainNode = audioContext.createGain()
    const scriptProcessor = audioContext.createScriptProcessor(4096, 1, 1)
    
    gainNode.gain.value = 0
    oscillator.type = 'triangle'
    oscillator.connect(analyser)
    analyser.connect(scriptProcessor)
    scriptProcessor.connect(gainNode)
    gainNode.connect(audioContext.destination)
    
    oscillator.start(0)
    
    return new Promise((resolve) => {
      scriptProcessor.onaudioprocess = (event) => {
        const output = event.inputBuffer.getChannelData(0)
        let sum = 0
        for (let i = 0; i < output.length; i++) {
          sum += Math.abs(output[i])
        }
        oscillator.stop()
        audioContext.close()
        resolve(sum.toString())
      }
      
      // Timeout after 100ms
      setTimeout(() => {
        oscillator.stop()
        audioContext.close()
        resolve('timeout')
      }, 100)
    })
  } catch (e) {
    return ''
  }
}

/**
 * สร้าง comprehensive browser fingerprint
 */
export const getAdvancedFingerprint = async (): Promise<string> => {
  if (typeof window === 'undefined') return ''
  
  try {
    const components = [
      navigator.userAgent,
      navigator.language,
      navigator.languages?.join(',') || '',
      screen.width + 'x' + screen.height,
      screen.colorDepth?.toString() || '',
      screen.pixelDepth?.toString() || '',
      new Date().getTimezoneOffset().toString(),
      navigator.platform,
      navigator.hardwareConcurrency?.toString() || '',
      (navigator as any).deviceMemory?.toString() || '',
      (navigator as any).maxTouchPoints?.toString() || '',
      window.devicePixelRatio?.toString() || '',
      getCanvasFingerprint(),
      getWebGLFingerprint(),
      await getAudioFingerprint(),
      navigator.cookieEnabled ? '1' : '0',
      navigator.doNotTrack || '0',
      (navigator as any).webdriver ? '1' : '0',
    ]

    const fingerprint = components.join('|')
    
    // สร้าง hash
    let hash = 0
    for (let i = 0; i < fingerprint.length; i++) {
      const char = fingerprint.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash
    }
    
    return Math.abs(hash).toString(36)
  } catch (e) {
    console.error('Error generating advanced fingerprint:', e)
    return ''
  }
}

/**
 * สร้าง device signature สำหรับ public IP/DNS
 * รวมหลายๆ ปัจจัยเพื่อให้ unique มากขึ้น
 */
export const getDeviceSignature = async (ip?: string): Promise<string> => {
  if (typeof window === 'undefined') return ''
  
  try {
    const fingerprint = await getAdvancedFingerprint()
    const basicFingerprint = [
      navigator.userAgent,
      screen.width + 'x' + screen.height,
      navigator.language,
      new Date().getTimezoneOffset().toString(),
    ].join('|')
    
    const signature = `${fingerprint}_${basicFingerprint}${ip ? `_${ip}` : ''}`
    
    // Hash
    let hash = 0
    for (let i = 0; i < signature.length; i++) {
      const char = signature.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash
    }
    
    return Math.abs(hash).toString(36)
  } catch (e) {
    console.error('Error generating device signature:', e)
    return ''
  }
}

