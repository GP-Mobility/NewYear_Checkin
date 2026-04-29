-- Database Schema for NYCheckin
-- Run this SQL to create the necessary tables

CREATE DATABASE IF NOT EXISTS NYCheckin;
USE NYCheckin;

-- Feedback table
CREATE TABLE IF NOT EXISTS feedback (
  id INT AUTO_INCREMENT PRIMARY KEY,
  starrate INT NOT NULL DEFAULT 0,
  comment TEXT NOT NULL,
  INDEX idx_starrate (starrate)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Check-in log table
CREATE TABLE IF NOT EXISTS checkinlog (
  id INT AUTO_INCREMENT PRIMARY KEY,
  staffid VARCHAR(50) NOT NULL,
  name VARCHAR(255) NOT NULL,
  reward VARCHAR(255),
  INDEX idx_staffid (staffid)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Reward table
CREATE TABLE IF NOT EXISTS reward (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  status INT NOT NULL DEFAULT 0 COMMENT '0 = available, 1 = used',
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

