-- อัปเดตตาราง device_checkin เพื่อเก็บ state ของ device
-- Run this SQL to add state columns

USE NYCheckin;

-- เพิ่ม columns สำหรับเก็บ state (ใช้วิธีตรวจสอบก่อนเพิ่ม)
-- ถ้า column มีอยู่แล้วจะ error แต่ไม่เป็นไร

ALTER TABLE device_checkin 
ADD COLUMN feedback_submitted TINYINT(1) DEFAULT 0;

ALTER TABLE device_checkin 
ADD COLUMN checked_in TINYINT(1) DEFAULT 0;

ALTER TABLE device_checkin 
ADD COLUMN employee_staffid VARCHAR(50) DEFAULT NULL;

ALTER TABLE device_checkin 
ADD COLUMN employee_name VARCHAR(255) DEFAULT NULL;

ALTER TABLE device_checkin 
ADD COLUMN employee_reward VARCHAR(255) DEFAULT NULL;

ALTER TABLE device_checkin 
ADD COLUMN user_group INT DEFAULT NULL;

ALTER TABLE device_checkin 
ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- เพิ่ม index สำหรับค้นหาเร็วขึ้น (ถ้ามีอยู่แล้วจะ error แต่ไม่เป็นไร)
CREATE INDEX idx_device_checkin_state ON device_checkin(checked_in, feedback_submitted);

CREATE INDEX idx_device_checkin_updated ON device_checkin(updated_at);

