-- เพิ่ม column addon ในตาราง reward สำหรับของแถม
-- Run this SQL to add addon column

USE NYCheckin;

-- เพิ่ม column addon
ALTER TABLE reward 
ADD COLUMN addon VARCHAR(255) DEFAULT NULL;

-- เพิ่ม comment เพื่ออธิบาย
ALTER TABLE reward 
MODIFY COLUMN addon VARCHAR(255) DEFAULT NULL COMMENT 'ของแถม (ถ้ามี)';

