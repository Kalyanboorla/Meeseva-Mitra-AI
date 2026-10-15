-- MeeSeva Mitra AI - Database Schema
-- Created: 2026-10-14
-- Database: MySQL 8.0+

CREATE DATABASE IF NOT EXISTS meeseva_mitra CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE meeseva_mitra;

-- ============================================================
-- Table: departments
-- ============================================================
CREATE TABLE IF NOT EXISTS departments (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    name_en VARCHAR(255) NOT NULL,
    name_te VARCHAR(255),
    description_en TEXT,
    description_te TEXT,
    official_url VARCHAR(500),
    contact_info JSON,
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_code (code),
    INDEX idx_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Table: services
-- ============================================================
CREATE TABLE IF NOT EXISTS services (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    service_code VARCHAR(100) NOT NULL UNIQUE,
    department_id INT UNSIGNED NOT NULL,
    name_en VARCHAR(500) NOT NULL,
    name_te VARCHAR(500),
    slug VARCHAR(200) NOT NULL UNIQUE,
    description_en TEXT NOT NULL,
    description_te TEXT,
    eligibility_en TEXT,
    eligibility_te TEXT,
    procedure_en TEXT,
    procedure_te TEXT,
    fee_en VARCHAR(500),
    fee_te VARCHAR(500),
    processing_time_en VARCHAR(255),
    processing_time_te VARCHAR(255),
    official_url VARCHAR(1000),
    alternate_url VARCHAR(1000),
    portal_label_en VARCHAR(255),
    portal_label_te VARCHAR(255),
    keywords_en TEXT,
    keywords_te TEXT,
    category VARCHAR(100),
    is_online_available TINYINT(1) DEFAULT 1,
    is_offline_available TINYINT(1) DEFAULT 1,
    is_verified TINYINT(1) DEFAULT 0,
    verification_note TEXT,
    is_active TINYINT(1) DEFAULT 1,
    display_order INT DEFAULT 100,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (department_id) REFERENCES departments(id) ON UPDATE CASCADE,
    INDEX idx_slug (slug),
    INDEX idx_category (category),
    INDEX idx_active (is_active),
    FULLTEXT INDEX ft_search_en (name_en, description_en, keywords_en),
    FULLTEXT INDEX ft_search_te (name_te, keywords_te)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Table: requirements (documents / eligibility items per service)
-- ============================================================
CREATE TABLE IF NOT EXISTS requirements (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    service_id INT UNSIGNED NOT NULL,
    req_type ENUM('document','eligibility','note') NOT NULL DEFAULT 'document',
    is_mandatory TINYINT(1) NOT NULL DEFAULT 1,
    condition_note_en VARCHAR(500),
    condition_note_te VARCHAR(500),
    name_en VARCHAR(500) NOT NULL,
    name_te VARCHAR(500),
    description_en TEXT,
    description_te TEXT,
    sort_order INT DEFAULT 10,
    FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE ON UPDATE CASCADE,
    INDEX idx_service (service_id),
    INDEX idx_type (req_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Table: sources (verification evidence per service)
-- ============================================================
CREATE TABLE IF NOT EXISTS sources (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    service_id INT UNSIGNED NOT NULL,
    title VARCHAR(500) NOT NULL,
    url VARCHAR(1000) NOT NULL,
    domain VARCHAR(255),
    verified_at DATE,
    is_official TINYINT(1) DEFAULT 1,
    notes TEXT,
    FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE ON UPDATE CASCADE,
    INDEX idx_service (service_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Table: feedback
-- ============================================================
CREATE TABLE IF NOT EXISTS feedback (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    service_id INT UNSIGNED,
    session_id VARCHAR(100),
    rating TINYINT UNSIGNED CHECK (rating BETWEEN 1 AND 5),
    helpful TINYINT(1),
    comment_text VARCHAR(1000),
    language_used ENUM('en','te') DEFAULT 'en',
    page_context VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE SET NULL ON UPDATE CASCADE,
    INDEX idx_service (service_id),
    INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Table: chat_sessions (lightweight, no personal data stored)
-- ============================================================
CREATE TABLE IF NOT EXISTS chat_sessions (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    session_token VARCHAR(100) NOT NULL UNIQUE,
    language ENUM('en','te') DEFAULT 'en',
    interaction_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_active TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_token (session_token)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
