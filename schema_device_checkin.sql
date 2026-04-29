-- Table สำหรับเก็บ device check-in เพื่อป้องกันการเช็คอินซ้ำ
-- Run this SQL to add device tracking

USE NYCheckin;

-- Device check-in table
CREATE TABLE IF NOT EXISTS device_checkin (
  id INT AUTO_INCREMENT PRIMARY KEY,
  device_signature VARCHAR(255) NOT NULL UNIQUE,
  device_id VARCHAR(255),
  staffid VARCHAR(50) NOT NULL,
  ip_address VARCHAR(100),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_device_signature (device_signature),
  INDEX idx_device_id (device_id),
  INDEX idx_staffid (staffid),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

