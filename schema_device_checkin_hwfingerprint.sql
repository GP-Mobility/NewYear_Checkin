-- เพิ่ม column hwFingerprint ในตาราง device_checkin
-- Hardware fingerprint ที่เสถียรข้าม browser สำหรับป้องกันการทำซ้ำ

ALTER TABLE device_checkin 
ADD COLUMN IF NOT EXISTS hwFingerprint VARCHAR(100) AFTER device_signature;

-- เพิ่ม index สำหรับ hwFingerprint เพื่อเร่งการค้นหา
CREATE INDEX IF NOT EXISTS idx_hwFingerprint ON device_checkin(hwFingerprint);

-- เพิ่ม composite index สำหรับ hwFingerprint + checked_in
CREATE INDEX IF NOT EXISTS idx_hwFingerprint_checked_in ON device_checkin(hwFingerprint, checked_in);

