# MySQL Init Schema
# You can run this directly in MySQL Workbench, phpMyAdmin, or mysql CLI:
# mysql -u root -p < init.sql

CREATE DATABASE IF NOT EXISTS `forge_insight`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE `forge_insight`;

CREATE TABLE IF NOT EXISTS `contact_submissions` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `phone` VARCHAR(50) DEFAULT NULL,
  `message` TEXT NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_email` (`email`),
  INDEX `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
