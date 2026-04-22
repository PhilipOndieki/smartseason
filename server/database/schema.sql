CREATE DATABASE IF NOT EXISTS smartseason;
USE smartseason;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('admin', 'agent') DEFAULT 'agent',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS fields (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  crop_type VARCHAR(100),
  planting_date DATE,
  current_stage ENUM('planted', 'growing', 'ready', 'harvested') DEFAULT 'planted',
  status ENUM('active', 'at_risk', 'completed') DEFAULT 'active',
  assigned_agent_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_field_agent FOREIGN KEY (assigned_agent_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS field_updates (
  id INT AUTO_INCREMENT PRIMARY KEY,
  field_id INT NOT NULL,
  agent_id INT NOT NULL,
  stage ENUM('planted', 'growing', 'ready', 'harvested') NOT NULL,
  notes TEXT,
  risk_flags JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_update_field FOREIGN KEY (field_id) REFERENCES fields(id) ON DELETE CASCADE,
  CONSTRAINT fk_update_agent FOREIGN KEY (agent_id) REFERENCES users(id) ON DELETE CASCADE
);

ALTER TABLE users ADD COLUMN is_super TINYINT(1) DEFAULT 0;
UPDATE users SET is_super = 1 WHERE id = 1; 