'use client'

import { useState, useEffect } from 'react'
import { User, Hash, LogIn, Sparkles, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react'

interface StationCheckInFormProps {
  onSubmit: (data: { staffid: string; name: string; group?: number; rewardid?: number | null; reward?: { name: string; addon?: string | null } | null }) => void
}

export default function StationCheckInForm({ onSubmit }: StationCheckInFormProps) {
  const [formData, setFormData] = useState({
    staffid: '',
    name: ''
  })
  const [errors, setErrors] = useState({
    staffid: '',
    name: '',
    submit: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [alreadyCheckedIn, setAlreadyCheckedIn] = useState(false)

  // Auto-search เมื่อกรอกรหัสพนักงานครบ 5 หลัก
  useEffect(() => {
    const searchStaff = async () => {
      if (formData.staffid.length >= 5 && /^\d+$/.test(formData.staffid)) {
        setIsSearching(true)
        try {
          // เช็คว่าเคยเช็คอินแล้วหรือไม่
          const checkInRes = await fetch('/api/checkin/station', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              staffid: formData.staffid.trim(),
              name: '' // ส่ง name ว่างเพื่อเช็คสถานะเท่านั้น
            })
          })
          
          const checkInData = await checkInRes.json()
          
          // ถ้าเคยเช็คอินแล้ว (status 409)
          if (checkInRes.status === 409 && checkInData.alreadyCheckedIn) {
            // แสดงเตือนว่าเคยเช็คอินแล้ว (เหมือนหน้า index)
            setAlreadyCheckedIn(true)
            setErrors(prev => ({
              ...prev,
              staffid: 'รหัสพนักงานนี้ได้ทำการเช็คอินไปแล้ว',
              submit: ''
            }))
            setIsSearching(false)
            return
          }
          
          // ถ้าเช็คสถานะสำเร็จ (status 200) แต่เคยเช็คอินแล้ว (มี rewardid)
          if (checkInRes.ok && checkInData.success && checkInData.rewardid !== null && checkInData.rewardid !== undefined) {
            // แสดงเตือนว่าเคยเช็คอินแล้ว (เหมือนหน้า index)
            setAlreadyCheckedIn(true)
            setErrors(prev => ({
              ...prev,
              staffid: 'รหัสพนักงานนี้ได้ทำการเช็คอินไปแล้ว',
              submit: ''
            }))
            setIsSearching(false)
            return
          }
          
          // ถ้ายังไม่เคยเช็คอิน ให้ reset alreadyCheckedIn
          setAlreadyCheckedIn(false)
          
          // ถ้ายังไม่เคยเช็คอิน ให้ดึงข้อมูลพนักงาน
          const res = await fetch(`/api/user?staffid=${formData.staffid}`)
          const data = await res.json()
          
          if (data.success && data.data) {
            // พบรหัสพนักงาน ให้ดึงชื่อมาแสดง
            setFormData(prev => ({
              ...prev,
              name: data.data.staffname || ''
            }))
            setErrors(prev => ({
              ...prev,
              staffid: '',
              submit: '' // Clear submit error
            }))
          } else {
            // ไม่พบรหัสพนักงาน
            setErrors(prev => ({
              ...prev,
              staffid: 'ไม่พบรหัสพนักงานในระบบ',
              submit: '' // Clear submit error
            }))
            setFormData(prev => ({
              ...prev,
              name: ''
            }))
          }
        } catch (error) {
          console.error('Error searching staff:', error)
        } finally {
          setIsSearching(false)
        }
      } else if (formData.staffid.length < 5) {
        // Clear name ถ้ารหัสพนักงานไม่ครบ
        if (formData.name && formData.staffid.length < 5) {
          setFormData(prev => ({
            ...prev,
            name: ''
          }))
        }
        setErrors(prev => ({
          ...prev,
          staffid: '',
          submit: '' // Clear submit error
        }))
      }
    }

    const timer = setTimeout(searchStaff, 300)
    return () => clearTimeout(timer)
  }, [formData.staffid])

  const validate = () => {
    const newErrors = {
      staffid: '',
      name: '',
      submit: ''
    }

    if (!formData.staffid.trim()) {
      newErrors.staffid = 'กรุณากรอกรหัสพนักงาน'
    } else if (formData.staffid.length < 5 || formData.staffid.length > 6) {
      newErrors.staffid = 'รหัสพนักงานต้องเป็น 5-6 หลัก'
    } else if (!/^\d+$/.test(formData.staffid)) {
      newErrors.staffid = 'รหัสพนักงานต้องเป็นตัวเลขเท่านั้น'
    }

    if (!formData.name.trim()) {
      newErrors.name = 'กรุณากรอกชื่อ-นามสกุล'
    }

    setErrors(newErrors)
    return !newErrors.staffid && !newErrors.name
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    
    if (name === 'staffid') {
      const numericValue = value.replace(/\D/g, '')
      setFormData(prev => ({ ...prev, [name]: numericValue.slice(0, 6) }))
      // Reset alreadyCheckedIn เมื่อเปลี่ยนรหัสพนักงาน
      setAlreadyCheckedIn(false)
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
    
    // Clear error เมื่อเริ่มพิมพ์
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
    
    // Clear submit error
    if (errors.submit) {
      setErrors(prev => ({ ...prev, submit: '' }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // ห้าม submit ถ้าเคยเช็คอินไปแล้ว
    if (alreadyCheckedIn) {
      setErrors(prev => ({
        ...prev,
        submit: 'รหัสพนักงานนี้ได้ทำการเช็คอินไปแล้ว ไม่สามารถเช็คอินซ้ำได้'
      }))
      return
    }
    
    if (!validate()) {
      return
    }

    setIsSubmitting(true)
    setErrors({ staffid: '', name: '', submit: '' })

    try {
      const response = await fetch('/api/checkin/station', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          staffid: formData.staffid.trim(),
          name: formData.name.trim()
        })
      })

      const data = await response.json()

      if (!response.ok) {
        // แสดง error message ที่ชัดเจนตาม status code
        if (response.status === 409 && data.alreadyCheckedIn) {
          // เคยเช็คอินแล้ว - ส่งข้อมูลไปให้ parent component เพื่อแสดงผลลัพธ์
          if (data.staffid && (data.rewardid !== null && data.rewardid !== undefined)) {
            setSubmitSuccess(true)
            onSubmit({
              staffid: data.staffid,
              name: data.name || formData.name.trim(),
              group: data.group || undefined,
              rewardid: data.rewardid,
              reward: data.reward
            })
            return
          }
          setErrors({ 
            staffid: '', 
            name: '', 
            submit: data.message || data.error || 'รหัสพนักงานนี้ได้ทำการเช็คอินไปแล้ว' 
          })
        } else if (response.status === 404) {
          // ไม่พบรหัสพนักงานในระบบ
          setErrors({ 
            staffid: data.message || data.error || 'ไม่พบรหัสพนักงานนี้ในระบบ', 
            name: '', 
            submit: '' 
          })
        } else {
          // Error อื่นๆ
          setErrors({ 
            staffid: '', 
            name: '', 
            submit: data.message || data.error || 'เกิดข้อผิดพลาดในการเช็คอิน' 
          })
        }
        return
      }

      // เช็คอินสำเร็จ
      setSubmitSuccess(true)
      onSubmit({
        staffid: data.staffid,
        name: data.name,
        group: data.group || undefined
      })
    } catch (error: any) {
      console.error('Check-in error:', error)
      setErrors({ 
        staffid: '', 
        name: '', 
        submit: error.message || 'เกิดข้อผิดพลาดในการเช็คอิน' 
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="bg-gray-900/80 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-blue-500/30">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Submit Error Message */}
        {errors.submit && (
          <div className="bg-red-900/30 border-2 border-red-500/50 rounded-xl p-4 backdrop-blur-sm flex items-start">
            <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5 text-red-400" />
            <span className="text-red-200">{errors.submit}</span>
          </div>
        )}

        {/* รหัสพนักงาน */}
        <div>
          <label htmlFor="staffid" className="block text-sm font-medium text-blue-400 mb-2">
            รหัสพนักงาน (5-6 หลัก) <span className="text-red-400">*</span>
          </label>
          <div className="relative">
            <input
              type="text"
              id="staffid"
              name="staffid"
              value={formData.staffid}
              onChange={handleChange}
              maxLength={6}
              placeholder="กรอกรหัสพนักงาน"
              className={`w-full px-4 py-3 bg-gray-800/50 border-2 ${
                errors.staffid ? 'border-red-500/50' : 'border-blue-500/30'
              } text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all placeholder-gray-500`}
              required
            />
            {isSearching && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
              </div>
            )}
            {formData.name && !isSearching && !errors.staffid && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <CheckCircle2 className="w-5 h-5 text-green-400" />
              </div>
            )}
          </div>
          {errors.staffid && (
            <p className="mt-2 text-sm text-red-400 flex items-start">
              <AlertCircle className="w-4 h-4 mr-1 flex-shrink-0 mt-0.5" />
              {errors.staffid}
            </p>
          )}
        </div>

        {/* ชื่อ-นามสกุล */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-blue-400 mb-2">
            ชื่อ-นามสกุล <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="กรอกชื่อ-นามสกุล"
            className={`w-full px-4 py-3 bg-gray-800/50 border-2 ${
              errors.name ? 'border-red-500/50' : 'border-blue-500/30'
            } text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all placeholder-gray-500`}
            required
          />
          {errors.name && (
            <p className="mt-2 text-sm text-red-400 flex items-start">
              <AlertCircle className="w-4 h-4 mr-1 flex-shrink-0 mt-0.5" />
              {errors.name}
            </p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting || submitSuccess || alreadyCheckedIn}
          className="w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-cyan-700 transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center shadow-lg shadow-blue-500/50"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              กำลังเช็คอิน...
            </>
          ) : submitSuccess ? (
            <>
              <CheckCircle2 className="w-5 h-5 mr-2" />
              เช็คอินสำเร็จ!
            </>
          ) : (
            <>
              <LogIn className="w-5 h-5 mr-2" />
              เช็คอิน
            </>
          )}
        </button>
      </form>
    </div>
  )
}

