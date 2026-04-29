'use client'

import { useEffect, useMemo, useState, useCallback } from 'react'
import { RefreshCw, Clock3, Link as LinkIcon, QrCode, Brain, Cpu, Zap } from 'lucide-react'

const FIVE_MINUTES = 5 * 60 * 1000

// Microsoft Edge inspired colors
const EDGE_COLORS = {
  blue: '#0078D4',
  cyan: '#00BCF2',
  purple: '#6B5AED',
  blueLight: '#1A86FF',
  cyanLight: '#00D9FF',
  purpleLight: '#8B7AFF'
}

// Cute AI Character Icon Component (Microsoft Edge inspired)
function AICuteCharacter({ size = 32, className = '' }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Glow effect */}
      <defs>
        <linearGradient id="aiGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={EDGE_COLORS.blue} />
          <stop offset="50%" stopColor={EDGE_COLORS.cyan} />
          <stop offset="100%" stopColor={EDGE_COLORS.purple} />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      
      {/* Main body (rounded square with rounded corners) */}
      <rect
        x="12"
        y="12"
        width="40"
        height="40"
        rx="12"
        ry="12"
        fill="url(#aiGradient)"
        filter="url(#glow)"
        className="animate-pulse"
      />
      
      {/* Eyes (cute and friendly) */}
      <circle
        cx="24"
        cy="28"
        r="4"
        fill="white"
        className="animate-pulse"
        style={{ animationDelay: '0s' }}
      >
        <animate
          attributeName="r"
          values="4;3.5;4"
          dur="2s"
          repeatCount="indefinite"
        />
      </circle>
      <circle
        cx="40"
        cy="28"
        r="4"
        fill="white"
        className="animate-pulse"
        style={{ animationDelay: '0.1s' }}
      >
        <animate
          attributeName="r"
          values="4;3.5;4"
          dur="2s"
          repeatCount="indefinite"
        />
      </circle>
      
      {/* Eye pupils */}
      <circle cx="24" cy="28" r="2" fill={EDGE_COLORS.blue} />
      <circle cx="40" cy="28" r="2" fill={EDGE_COLORS.blue} />
      
      {/* Sparkle in eyes */}
      <circle cx="25" cy="27" r="0.8" fill="white" opacity="0.9" />
      <circle cx="41" cy="27" r="0.8" fill="white" opacity="0.9" />
      
      {/* Smile (cute curved smile) */}
      <path
        d="M 20 38 Q 32 44 44 38"
        stroke="white"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
        className="animate-pulse"
        style={{ animationDelay: '0.3s' }}
      >
        <animate
          attributeName="d"
          values="M 20 38 Q 32 44 44 38;M 20 39 Q 32 45 44 39;M 20 38 Q 32 44 44 38"
          dur="3s"
          repeatCount="indefinite"
        />
      </path>
      
      {/* Decorative elements (AI circuit pattern) */}
      <circle cx="18" cy="18" r="1.5" fill={EDGE_COLORS.cyanLight} opacity="0.8">
        <animate
          attributeName="opacity"
          values="0.8;0.3;0.8"
          dur="2s"
          repeatCount="indefinite"
        />
      </circle>
      <circle cx="46" cy="18" r="1.5" fill={EDGE_COLORS.purpleLight} opacity="0.8">
        <animate
          attributeName="opacity"
          values="0.8;0.3;0.8"
          dur="2s"
          repeatCount="indefinite"
          begin="0.5s"
        />
      </circle>
      <circle cx="18" cy="46" r="1.5" fill={EDGE_COLORS.blueLight} opacity="0.8">
        <animate
          attributeName="opacity"
          values="0.8;0.3;0.8"
          dur="2s"
          repeatCount="indefinite"
          begin="1s"
        />
      </circle>
      <circle cx="46" cy="46" r="1.5" fill={EDGE_COLORS.cyanLight} opacity="0.8">
        <animate
          attributeName="opacity"
          values="0.8;0.3;0.8"
          dur="2s"
          repeatCount="indefinite"
          begin="1.5s"
        />
      </circle>
    </svg>
  )
}

// AI Neural Network Background Component
function NeuralNetworkBackground() {
  const [nodes, setNodes] = useState<Array<{ id: number; x: number; y: number; delay: number }>>([])

  useEffect(() => {
    // สร้าง nodes แบบสุ่ม
    const newNodes = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 2
    }))
    setNodes(newNodes)
  }, [])

  return (
    <div className="absolute inset-0 overflow-hidden rounded-2xl opacity-20">
      <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        {nodes.map((node, i) => (
          <g key={node.id}>
            {/* Connection lines */}
            {i < nodes.length - 1 && (
              <line
                x1={node.x}
                y1={node.y}
                x2={nodes[i + 1].x}
                y2={nodes[i + 1].y}
                stroke="url(#gradient)"
                strokeWidth="0.3"
                opacity="0.3"
                className="animate-pulse"
                style={{ animationDelay: `${node.delay}s` }}
              />
            )}
            {/* Nodes */}
            <circle
              cx={node.x}
              cy={node.y}
              r="1"
              fill="url(#gradient)"
              className="animate-pulse"
              style={{ animationDelay: `${node.delay}s` }}
            >
              <animate
                attributeName="r"
                values="1;1.5;1"
                dur="2s"
                repeatCount="indefinite"
                begin={node.delay}
              />
            </circle>
          </g>
        ))}
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={EDGE_COLORS.blue} stopOpacity="0.8" />
            <stop offset="50%" stopColor={EDGE_COLORS.cyan} stopOpacity="0.6" />
            <stop offset="100%" stopColor={EDGE_COLORS.purple} stopOpacity="0.8" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  )
}

// AI Particle Effects Component
function AIParticles() {
  const [particles, setParticles] = useState<Array<{
    id: number;
    size: number;
    duration: number;
    delay: number;
    x: number;
    drift: number;
  }>>([])

  useEffect(() => {
    // Generate particles only on client side
    const particlesData = Array.from({ length: 30 }, (_, i) => ({
      id: i,
      size: Math.random() * 4 + 2,
      duration: Math.random() * 3 + 2,
      delay: Math.random() * 2,
      x: Math.random() * 100,
      drift: Math.random() * 50 - 25 // Random horizontal drift
    }))
    setParticles(particlesData)
  }, [])

  if (particles.length === 0) return null

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute rounded-full blur-sm ai-particle"
          style={{
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            left: `${particle.x}%`,
            top: '-10px',
            animation: `floatDown ${particle.duration}s linear infinite`,
            animationDelay: `${particle.delay}s`,
            '--drift': `${particle.drift}px`,
            background: `linear-gradient(to right, ${EDGE_COLORS.blue}66, ${EDGE_COLORS.cyan}66)`
          } as React.CSSProperties & { '--drift': string }}
        />
      ))}
    </div>
  )
}

// AI Circuit Pattern Component
function CircuitPattern() {
  return (
    <div className="absolute inset-0 overflow-hidden rounded-2xl opacity-10">
      <svg className="w-full h-full" viewBox="0 0 200 200" preserveAspectRatio="none">
        {/* Horizontal lines */}
        {[20, 40, 60, 80, 100, 120, 140, 160, 180].map((y, i) => (
          <line
            key={`h-${i}`}
            x1="0"
            y1={y}
            x2="200"
            y2={y}
            stroke={EDGE_COLORS.blue}
            strokeWidth="0.5"
            strokeDasharray="4 4"
            className="animate-pulse"
            style={{ animationDelay: `${i * 0.2}s` }}
          />
        ))}
        {/* Vertical lines */}
        {[20, 40, 60, 80, 100, 120, 140, 160, 180].map((x, i) => (
          <line
            key={`v-${i}`}
            x1={x}
            y1="0"
            x2={x}
            y2="200"
            stroke={EDGE_COLORS.cyan}
            strokeWidth="0.5"
            strokeDasharray="4 4"
            className="animate-pulse"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
        {/* Connection nodes */}
        {[20, 40, 60, 80, 100, 120, 140, 160, 180].map((x, i) =>
          [20, 40, 60, 80, 100, 120, 140, 160, 180].map((y, j) => (
            <circle
              key={`node-${i}-${j}`}
              cx={x}
              cy={y}
              r="1.5"
              fill={EDGE_COLORS.purple}
              className="animate-pulse"
              style={{ animationDelay: `${(i + j) * 0.1}s` }}
            >
              <animate
                attributeName="r"
                values="1.5;2.5;1.5"
                dur="2s"
                repeatCount="indefinite"
                begin={`${(i + j) * 0.1}s`}
              />
            </circle>
          ))
        )}
      </svg>
    </div>
  )
}

// AI Glow Effect Component
function AIGlowEffect() {
  return (
    <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
      <div 
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full blur-3xl animate-pulse"
        style={{ backgroundColor: `${EDGE_COLORS.blue}33` }}
      />
      <div 
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full blur-2xl animate-pulse"
        style={{ backgroundColor: `${EDGE_COLORS.cyan}4D`, animationDelay: '0.5s' }}
      />
      <div 
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full blur-xl animate-pulse"
        style={{ backgroundColor: `${EDGE_COLORS.purple}66`, animationDelay: '1s' }}
      />
    </div>
  )
}

// Confetti Celebration Component
function ConfettiCelebration() {
  const [confetti, setConfetti] = useState<Array<{
    id: number;
    x: number;
    delay: number;
    duration: number;
    size: number;
    color: string;
    rotation: number;
    drift: number;
  }>>([])

  useEffect(() => {
    // Generate confetti only on client side
    const confettiData = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 3,
      duration: Math.random() * 2 + 3,
      size: Math.random() * 8 + 4,
      color: [EDGE_COLORS.blue, EDGE_COLORS.cyan, EDGE_COLORS.purple, EDGE_COLORS.blueLight, EDGE_COLORS.cyanLight, EDGE_COLORS.purpleLight][Math.floor(Math.random() * 6)],
      rotation: Math.random() * 360,
      drift: (Math.random() - 0.5) * 100
    }))
    setConfetti(confettiData)
  }, [])

  if (confetti.length === 0) return null

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {confetti.map((piece) => (
        <div
          key={piece.id}
          className="absolute rounded-sm celebration-confetti"
          style={{
            left: `${piece.x}%`,
            top: '-10px',
            width: `${piece.size}px`,
            height: `${piece.size}px`,
            backgroundColor: piece.color,
            animation: `confettiFall ${piece.duration}s linear infinite`,
            animationDelay: `${piece.delay}s`,
            '--drift': `${piece.drift}px`,
            '--rotation': `${piece.rotation}deg`
          } as React.CSSProperties & { '--drift': string; '--rotation': string }}
        />
      ))}
    </div>
  )
}

// Sparkles Celebration Component
function SparklesCelebration() {
  const [sparkles, setSparkles] = useState<Array<{
    id: number;
    x: number;
    y: number;
    delay: number;
    duration: number;
    size: number;
  }>>([])

  useEffect(() => {
    // Generate sparkles only on client side
    const sparklesData = Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 2,
      duration: Math.random() * 1.5 + 1,
      size: Math.random() * 6 + 3
    }))
    setSparkles(sparklesData)
  }, [])

  if (sparkles.length === 0) return null

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {sparkles.map((sparkle) => (
        <div
          key={sparkle.id}
          className="absolute rounded-full celebration-sparkle"
          style={{
            left: `${sparkle.x}%`,
            top: `${sparkle.y}%`,
            width: `${sparkle.size}px`,
            height: `${sparkle.size}px`,
            background: `radial-gradient(circle, ${EDGE_COLORS.cyan} 0%, transparent 70%)`,
            boxShadow: `0 0 ${sparkle.size * 2}px ${EDGE_COLORS.cyan}80`,
            animation: `sparklePulse ${sparkle.duration}s ease-in-out infinite`,
            animationDelay: `${sparkle.delay}s`
          }}
        />
      ))}
    </div>
  )
}

// Floating Celebration Icons
function FloatingCelebrationIcons() {
  const [floatingIcons, setFloatingIcons] = useState<Array<{
    id: number;
    icon: string;
    x: number;
    delay: number;
    duration: number;
    size: number;
  }>>([])

  useEffect(() => {
    // Generate floating icons only on client side
    const icons = ['🎉', '✨', '🎊', '🌟', '🎈', '⭐']
    const iconsData = Array.from({ length: 12 }, (_, i) => ({
      id: i,
      icon: icons[Math.floor(Math.random() * icons.length)],
      x: Math.random() * 100,
      delay: Math.random() * 3,
      duration: Math.random() * 4 + 4,
      size: Math.random() * 20 + 16
    }))
    setFloatingIcons(iconsData)
  }, [])

  if (floatingIcons.length === 0) return null

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {floatingIcons.map((item) => (
        <div
          key={item.id}
          className="absolute celebration-float"
          style={{
            left: `${item.x}%`,
            top: '100%',
            fontSize: `${item.size}px`,
            animation: `floatUp ${item.duration}s linear infinite`,
            animationDelay: `${item.delay}s`,
            filter: 'drop-shadow(0 0 8px rgba(255, 255, 255, 0.5))'
          }}
        >
          {item.icon}
        </div>
      ))}
    </div>
  )
}

// Fireworks Effect Component
function FireworksEffect() {
  const [fireworks, setFireworks] = useState<Array<{
    id: number;
    x: number;
    y: number;
    delay: number;
    duration: number;
  }>>([])

  useEffect(() => {
    // Generate fireworks only on client side
    const fireworksData = Array.from({ length: 8 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 40 + 10,
      delay: Math.random() * 4,
      duration: Math.random() * 1.5 + 2
    }))
    setFireworks(fireworksData)
  }, [])

  if (fireworks.length === 0) return null

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {fireworks.map((firework) => (
        <div
          key={firework.id}
          className="absolute celebration-firework"
          style={{
            left: `${firework.x}%`,
            top: `${firework.y}%`,
            animation: `fireworkBurst ${firework.duration}s ease-out infinite`,
            animationDelay: `${firework.delay}s`
          }}
        >
          {Array.from({ length: 12 }, (_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 rounded-full"
              style={{
                backgroundColor: [EDGE_COLORS.blue, EDGE_COLORS.cyan, EDGE_COLORS.purple][i % 3],
                transform: `rotate(${i * 30}deg) translateY(-30px)`,
                boxShadow: `0 0 8px ${[EDGE_COLORS.blue, EDGE_COLORS.cyan, EDGE_COLORS.purple][i % 3]}`
              }}
            />
          ))}
        </div>
      ))}
    </div>
  )
}

export default function QrCodePage() {
  const [token, setToken] = useState<string | null>(null)
  const [expiresAt, setExpiresAt] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const baseUrl = useMemo(() => {
    if (typeof window === 'undefined') return ''
    const url = new URL(window.location.href)
    // เปลี่ยน path เป็น root
    url.pathname = '/'
    return url.toString()
  }, [])

  const fetchToken = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const timestamp = Date.now()
      const res = await fetch(`/api/qr/generate?t=${timestamp}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
        }
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || 'ไม่สามารถสร้าง QR ได้')
      }
      const data = await res.json()
      console.log('QR token fetched successfully:', { token: data.token?.substring(0, 20) + '...', expiresAt: new Date(data.expiresAt).toLocaleString() })
      setToken(data.token)
      setExpiresAt(data.expiresAt)
    } catch (err: any) {
      console.error('Error fetching QR token:', err)
      setError(err?.message || 'ไม่สามารถสร้าง QR ได้')
    } finally {
      setIsLoading(false)
    }
  }, [])

  // ดึง token ครั้งแรก
  useEffect(() => {
    fetchToken()
  }, [fetchToken])

  // รีเฟรชทุก 5 นาที
  useEffect(() => {
    console.log('Setting up auto-refresh interval (5 minutes)')
    const interval = setInterval(() => {
      console.log('Auto refreshing QR token...', new Date().toLocaleTimeString())
      fetchToken()
    }, FIVE_MINUTES)
    
    return () => {
      console.log('Clearing auto-refresh interval')
      clearInterval(interval)
    }
  }, [fetchToken])

  const qrUrl = useMemo(() => {
    if (!token || !baseUrl) return ''
    return `${baseUrl}?token=${encodeURIComponent(token)}`
  }, [token, baseUrl])

  const [currentTime, setCurrentTime] = useState(Date.now())

  // อัพเดทเวลาปัจจุบันทุกวินาทีเพื่อแสดง countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(Date.now())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const timeLeftText = useMemo(() => {
    if (!expiresAt) return ''
    const diff = expiresAt - currentTime
    if (diff <= 0) return 'หมดอายุแล้ว'
    const minutes = Math.floor(diff / 60000)
    const seconds = Math.floor((diff % 60000) / 1000)
    return `${minutes} นาที ${seconds.toString().padStart(2, '0')} วินาที`
  }, [expiresAt, currentTime])

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-blue-950 text-white relative overflow-hidden">
      {/* Celebration Animations */}
      <ConfettiCelebration />
      <SparklesCelebration />
      <FloatingCelebrationIcons />
      <FireworksEffect />
      
      {/* AI Background Effects */}
      <AIParticles />
      <CircuitPattern />
      
      <div className="max-w-3xl mx-auto px-4 py-10 relative z-10">
        {/* GP Autoparts Logo */}
        <div className="flex justify-center mb-8">
          <div className="relative group">
            {/* Glow effect */}
            <div 
              className="absolute inset-0 rounded-2xl blur-2xl opacity-40 group-hover:opacity-60 transition-opacity duration-300"
              style={{
                background: `linear-gradient(to right, ${EDGE_COLORS.blue}66, ${EDGE_COLORS.cyan}66, ${EDGE_COLORS.purple}66)`,
                top: '-10px',
                left: '-10px',
                right: '-10px',
                bottom: '-10px'
              }}
            />
            {/* Logo container with border */}
            <div 
              className="relative bg-white/5 backdrop-blur-sm rounded-2xl p-4 border"
              style={{
                borderColor: `${EDGE_COLORS.blue}40`
              }}
            >
              <img 
                src="/GP.png" 
                alt="GP Autoparts Logo" 
                className="h-20 w-auto object-contain drop-shadow-2xl transition-transform duration-300 group-hover:scale-105"
                style={{ maxWidth: '250px' }}
              />
            </div>
            {/* Pulse ring */}
            <div 
              className="absolute inset-0 rounded-2xl border-2 animate-pulse"
              style={{
                borderColor: `${EDGE_COLORS.cyan}40`,
                top: '-5px',
                left: '-5px',
                right: '-5px',
                bottom: '-5px'
              }}
            />
          </div>
        </div>
        <div className="flex items-center justify-between mb-6">
          <div className="relative">
            <div className="flex items-center gap-3">
              <div className="relative">
                <AICuteCharacter size={40} className="drop-shadow-lg" />
                <div 
                  className="absolute inset-0 rounded-full blur-xl animate-ping" 
                  style={{ 
                    backgroundColor: `${EDGE_COLORS.blue}33`,
                    animationDuration: '2s',
                    top: '-10px',
                    left: '-10px',
                    right: '-10px',
                    bottom: '-10px'
                  }} 
                />
              </div>
              <div>
                <h1 
                  className="text-3xl font-bold bg-clip-text text-transparent"
                  style={{
                    backgroundImage: `linear-gradient(to right, ${EDGE_COLORS.blue}, ${EDGE_COLORS.cyan}, ${EDGE_COLORS.purple})`
                  }}
                >
                  QR สำหรับเช็คอิน
                </h1>
              </div>
            </div>
            {/*<p className="text-gray-400 mt-1">รีเฟรชอัตโนมัติทุก 5 นาที</p>*/}
          </div>
          <button
            onClick={(e) => {
              e.preventDefault()
              console.log('Manual refresh clicked')
              fetchToken()
            }}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 rounded-lg disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl relative overflow-hidden group"
            style={{
              background: isLoading 
                ? 'linear-gradient(to right, #4b5563, #4b5563)'
                : `linear-gradient(to right, ${EDGE_COLORS.blue}, ${EDGE_COLORS.cyan})`,
              boxShadow: isLoading 
                ? '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                : `0 10px 15px -3px ${EDGE_COLORS.blue}80`
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
            <RefreshCw className={`w-4 h-4 relative z-10 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="relative z-10">{isLoading ? 'กำลังโหลด...' : 'รีเฟรช'}</span>
          </button>
        </div>

        {error && (
          <div className="mb-4 bg-red-900/40 border border-red-500/50 rounded-xl p-4 text-red-200 backdrop-blur-sm">
            {error}
          </div>
        )}

        <div 
          className="bg-gray-900/70 border rounded-2xl p-6 shadow-2xl relative overflow-hidden backdrop-blur-xl"
          style={{ borderColor: `${EDGE_COLORS.blue}33` }}
        >
          {/* AI Background Layers */}
          <NeuralNetworkBackground />
          <AIGlowEffect />
          
          <div className="grid md:grid-cols-1 gap-6 items-center relative z-10">
            <div className="flex flex-col items-center gap-4">
              {/* QR Code Container with AI Glow */}
              <div className="relative">
                <div 
                  className="absolute inset-0 rounded-3xl blur-2xl animate-pulse"
                  style={{
                    background: `linear-gradient(to right, ${EDGE_COLORS.blue}4D, ${EDGE_COLORS.cyan}4D, ${EDGE_COLORS.purple}4D)`
                  }}
                />
                <div 
                  className="bg-white p-3 rounded-2xl shadow-lg relative z-10 border-2"
                  style={{
                    borderColor: `${EDGE_COLORS.blue}4D`
                  }}
                >
                  {qrUrl ? (
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(qrUrl)}&size=260x260&margin=0`}
                      alt="Check-in QR"
                      className="w-64 h-64 relative z-10"
                    />
                  ) : (
                    <div className="w-64 h-64 flex items-center justify-center text-gray-500 bg-gray-100 rounded-2xl">
                      <QrCode className="w-12 h-12 animate-pulse" />
                    </div>
                  )}
                </div>
                {/* Floating AI Characters around QR */}
                <div 
                  className="absolute -top-4 -left-4 w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-sm border animate-bounce" 
                  style={{ 
                    animationDuration: '3s',
                    backgroundColor: `${EDGE_COLORS.blue}33`,
                    borderColor: `${EDGE_COLORS.blue}4D`
                  }}
                >
                  <AICuteCharacter size={20} />
                </div>
                <div 
                  className="absolute -top-4 -right-4 w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-sm border animate-bounce" 
                  style={{ 
                    animationDuration: '2.5s', 
                    animationDelay: '0.5s',
                    backgroundColor: `${EDGE_COLORS.cyan}33`,
                    borderColor: `${EDGE_COLORS.cyan}4D`
                  }}
                >
                  <AICuteCharacter size={20} />
                </div>
                <div 
                  className="absolute -bottom-4 -left-4 w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-sm border animate-bounce" 
                  style={{ 
                    animationDuration: '2.8s', 
                    animationDelay: '1s',
                    backgroundColor: `${EDGE_COLORS.purple}33`,
                    borderColor: `${EDGE_COLORS.purple}4D`
                  }}
                >
                  <AICuteCharacter size={20} />
                </div>
                <div 
                  className="absolute -bottom-4 -right-4 w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-sm border animate-bounce" 
                  style={{ 
                    animationDuration: '3.2s', 
                    animationDelay: '1.5s',
                    backgroundColor: `${EDGE_COLORS.blue}33`,
                    borderColor: `${EDGE_COLORS.blue}4D`
                  }}
                >
                  <AICuteCharacter size={20} />
                </div>
              </div>
              <p className="text-gray-400 text-sm flex items-center gap-2">
                <span 
                  className="w-2 h-2 rounded-full animate-pulse"
                  style={{ backgroundColor: EDGE_COLORS.blue }}
                ></span>
                สแกนเพื่อเช็คอินเข้างาน
                <span 
                  className="w-2 h-2 rounded-full animate-pulse" 
                  style={{ 
                    backgroundColor: EDGE_COLORS.cyan,
                    animationDelay: '0.5s' 
                  }}
                ></span>
              </p>
            </div>

            <div className="space-y-4">
              {<div 
                className="bg-gray-800/60 rounded-xl p-4 border backdrop-blur-sm relative overflow-hidden"
                style={{ borderColor: `${EDGE_COLORS.blue}33` }}
              >
                <div 
                  className="absolute inset-0 animate-pulse"
                  style={{
                    background: `linear-gradient(to right, ${EDGE_COLORS.blue}0D, ${EDGE_COLORS.cyan}0D, ${EDGE_COLORS.purple}0D)`
                  }}
                ></div>
                <div className="relative z-10">
                  <p className="text-sm text-gray-400 flex items-center gap-2">
                    <LinkIcon 
                      className="w-4 h-4 animate-pulse" 
                      style={{ color: EDGE_COLORS.blue }}
                    />
                    ลิงก์ปลายทาง
                  </p>
                  <p 
                    className="text-sm break-all mt-1 font-mono"
                    style={{ color: `${EDGE_COLORS.cyan}CC` }}
                  >
                    {qrUrl || 'กำลังสร้าง...'}
                  </p>
                </div>
              </div>}

              {/*<div className="bg-gray-800/60 rounded-xl p-4 border border-blue-500/20 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock3 className="w-5 h-5 text-yellow-400" />
                  <div>
                    <p className="text-sm text-gray-400">หมดอายุภายใน</p>
                    <p className="text-lg font-semibold text-yellow-300">
                      {token ? timeLeftText : 'กำลังสร้าง...'}
                    </p>
                  </div>
                </div>
                <span className="text-xs text-gray-400">รีเฟรชอัตโนมัติทุก 5 นาที</span>
              </div>*/}

              
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

