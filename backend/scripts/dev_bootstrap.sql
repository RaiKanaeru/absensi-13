-- Minimal bootstrap DB for local dev/smoke testing
-- Creates database, essential table, and seeds an admin user

CREATE DATABASE IF NOT EXISTS db_HoyoKelas;
USE db_HoyoKelas;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  salt VARCHAR(32) NOT NULL DEFAULT '',
  role ENUM('admin','guru','wali_kelas','siswa') NOT NULL DEFAULT 'admin',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed admin (password: admin123)
INSERT INTO users (username, password_hash, salt, role, is_active)
VALUES ('admin', '$2a$10$I9Fk2UqOk6BglCUILAE12.WnXS0yZoZ6Qtd5tXTdKK175ShmHswMG', '', 'admin', TRUE)
ON DUPLICATE KEY UPDATE password_hash=VALUES(password_hash), salt=VALUES(salt), role=VALUES(role), is_active=VALUES(is_active);


