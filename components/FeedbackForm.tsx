'use client'

import { useState } from 'react'
import { getDeviceId } from '@/utils/device'
import { getAdvancedFingerprint } from '@/utils/browserFingerprint'
import { getDeviceFingerprint } from '@/utils/incognito'
import { MessageSquare, Star, Send, Sparkles, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react'

interface FeedbackFormProps {
  onSubmit: (feedback: { comment: string; rating?: number }) => void
}

export default function FeedbackForm({ onSubmit }: FeedbackFormProps) {
  const [formData, setFormData] = useState({
    comment: '',
    rating: 0
  })
  const [errors, setErrors] = useState({
    comment: '',
    submit: ''
  })
  const [hoveredRating, setHoveredRating] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)

  const validate = () => {
    const newErrors = {
      comment: '',
      submit: ''
    }

    if (!formData.comment.trim()) {
      newErrors.comment = 'กรุณากรอกความเห็นต่อบริษัท'
    } else if (formData.comment.trim().length < 10) {
      newErrors.comment = 'ความเห็นต้องมีอย่างน้อย 10 ตัวอักษร'
    }

    setErrors(newErrors)
    return !newErrors.comment
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validate()) {
      return
    }

    setIsSubmitting(true)
    setErrors(prev => ({ ...prev, submit: '' }))
    setSubmitSuccess(false)

    try {
      // ดึง deviceId และ fingerprint
      let deviceId = ''
      let deviceFingerprint = ''
      try {
        deviceId = getDeviceId()
        deviceFingerprint = await getAdvancedFingerprint() || getDeviceFingerprint()
      } catch (error) {
        // ถ้า incognito จะไม่มี deviceId
        console.warn('Cannot get device info for feedback')
      }

      const payload = {
        starrate: formData.rating > 0 ? formData.rating : 0,
        comment: formData.comment.trim(),
        deviceId,
        deviceFingerprint
      }

      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`)
      }

      // พยายาม parse JSON แต่ถ้าไม่ได้ก็ไม่เป็นไร
      let data
      try {
        data = await response.json()
      } catch {
        data = { success: true }
      }
      
      console.log('Feedback submitted successfully:', data)
      setSubmitSuccess(true)
      
      // เรียก onSubmit หลังจากส่งข้อมูลสำเร็จ
      setTimeout(() => {
        onSubmit({
          comment: formData.comment.trim(),
          rating: formData.rating > 0 ? formData.rating : undefined
        })
      }, 1000) // รอสักครู่เพื่อแสดง success message

    } catch (error) {
      console.error('Error submitting feedback:', error)
      let errorMessage = 'ไม่สามารถส่งความเห็นได้ กรุณาลองใหม่อีกครั้ง'
      
      if (error instanceof TypeError && error.message.includes('fetch')) {
        errorMessage = 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ กรุณาตรวจสอบการเชื่อมต่อ'
      } else if (error instanceof Error) {
        errorMessage = error.message.includes('HTTP error') 
          ? `เกิดข้อผิดพลาดจากเซิร์ฟเวอร์: ${error.message}`
          : errorMessage
      }
      
      setErrors(prev => ({
        ...prev,
        submit: errorMessage
      }))
      setIsSubmitting(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { value } = e.target
    setFormData(prev => ({
      ...prev,
      comment: value
    }))
    // Clear error when user starts typing
    if (errors.comment) {
      setErrors(prev => ({
        ...prev,
        comment: ''
      }))
    }
  }

  const handleRatingClick = (rating: number) => {
    setFormData(prev => ({
      ...prev,
      rating: prev.rating === rating ? 0 : rating
    }))
  }

  return (
    <div className="bg-gray-900/80 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-blue-500/30 relative overflow-hidden">
      {/* Glowing border effect */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/10 via-cyan-500/10 to-blue-500/10 opacity-50 blur-xl"></div>
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500 to-transparent"></div>
      
      <div className="relative z-10">
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-5 h-5 text-blue-400" />
            <h2 className="text-2xl font-bold text-transparent bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text">
              ความเห็นต่อบริษัท
            </h2>
          </div>
          <p className="text-orange-400">
            บริษัทจะดำเนินการเก็บรวบรวมความคิดเห็นในลักษณะไม่เปิดเผยตัวตน เพื่อใช้ในการปรับปรุงและพัฒนาองค์กร
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Rating (Optional) */}
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-3">
              ให้คะแนนบริษัท (ไม่บังคับ)
            </label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => handleRatingClick(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-8 h-8 ${
                      star <= (hoveredRating || formData.rating)
                        ? 'text-yellow-400 fill-yellow-400'
                        : 'text-gray-600'
                    } transition-colors`}
                  />
                </button>
              ))}
              {formData.rating > 0 && (
                <span className="ml-2 text-sm text-gray-400">
                  ({formData.rating}/5)
                </span>
              )}
            </div>
          </div>

          {/* Comment Field */}
          <div>
            <label htmlFor="comment" className="block text-sm font-semibold text-gray-300 mb-2">
              ความเห็น <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 pt-3 pointer-events-none">
                <MessageSquare className="h-5 w-5 text-blue-400/70" />
              </div>
              <textarea
                id="comment"
                name="comment"
                value={formData.comment}
                onChange={handleChange}
                rows={6}
                className={`block w-full pl-10 pr-3 py-3 bg-gray-800/50 border ${
                  errors.comment 
                    ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/50' 
                    : 'border-blue-500/30 focus:border-blue-500 focus:ring-blue-500/50'
                } rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:outline-none transition-all resize-none`}
                placeholder="กรุณาแชร์ความคิดเห็นของคุณต่อบริษัท เช่น ความรู้สึก การทำงาน สิ่งที่ชอบ หรือข้อเสนอแนะ..."
              />
              {formData.comment && !errors.comment && (
                <div className="absolute bottom-3 right-3 flex items-center pointer-events-none">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                </div>
              )}
            </div>
            {errors.comment && (
              <p className="mt-1 text-sm text-red-400 flex items-center gap-1">
                <span>⚠️</span>
                {errors.comment}
              </p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              ความเห็นต้องมีอย่างน้อย 10 ตัวอักษร ({formData.comment.length}/10)
            </p>
          </div>

          {/* Error Message */}
          {errors.submit && (
            <div className="bg-red-900/30 border border-red-500/50 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-red-400 font-medium">เกิดข้อผิดพลาด</p>
                <p className="text-xs text-red-300 mt-1">{errors.submit}</p>
              </div>
            </div>
          )}

          {/* Success Message */}
          {submitSuccess && (
            <div className="bg-green-900/30 border border-green-500/50 rounded-lg p-4 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-green-400 font-medium">ส่งความเห็นสำเร็จ!</p>
                <p className="text-xs text-green-300 mt-1">กำลังเข้าสู่ระบบเช็คอิน...</p>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting || submitSuccess}
            className="w-full bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 hover:from-blue-500 hover:via-blue-400 hover:to-cyan-400 disabled:from-gray-600 disabled:via-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed text-white font-semibold py-4 px-6 rounded-lg shadow-lg shadow-blue-500/50 hover:shadow-xl hover:shadow-blue-500/70 transition-all duration-200 flex items-center justify-center space-x-2 relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 relative z-10 animate-spin" />
                <span className="relative z-10">กำลังส่งข้อมูล...</span>
              </>
            ) : submitSuccess ? (
              <>
                <CheckCircle2 className="w-5 h-5 relative z-10" />
                <span className="relative z-10">ส่งสำเร็จ</span>
              </>
            ) : (
              <>
                <Send className="w-5 h-5 relative z-10" />
                <span className="relative z-10">ส่งความเห็นและเข้าสู่ระบบเช็คอิน</span>
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-blue-500/20">
          <p className="text-xs text-gray-500 text-center flex items-center justify-center gap-2">
            <span className="w-1 h-1 bg-blue-400 rounded-full"></span>
            ความเห็นของคุณจะถูกเก็บเป็นความลับและใช้เพื่อพัฒนาบริษัทเท่านั้น
            <span className="w-1 h-1 bg-blue-400 rounded-full"></span>
          </p>
        </div>
      </div>
    </div>
  )
}

