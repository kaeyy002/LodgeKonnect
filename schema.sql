-- LodgeKonnect Database Schema v2
-- Run this to set up a fresh database

CREATE DATABASE IF NOT EXISTS lodgekonnect CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE lodgekonnect;

-- ── Users ─────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
    id                    INT AUTO_INCREMENT PRIMARY KEY,
    full_name             VARCHAR(120)  NOT NULL,
    email                 VARCHAR(180)  NOT NULL UNIQUE,
    phone                 VARCHAR(15)   NOT NULL UNIQUE,
    gender                ENUM('male','female') NOT NULL,
    department            VARCHAR(120)  DEFAULT NULL,
    level                 VARCHAR(10)   DEFAULT NULL,
    password              VARCHAR(255)  NOT NULL,
    user_type             ENUM('student','caretaker') NOT NULL,
    profile_image         VARCHAR(255)  DEFAULT NULL,
    bio                   TEXT          DEFAULT NULL,
    preferences           JSON          DEFAULT NULL,
    budget                DECIMAL(10,2) DEFAULT NULL,
    available_for_matching ENUM('yes','no') DEFAULT 'no',
    matching_bio          TEXT          DEFAULT NULL,
    session_token         VARCHAR(64)   DEFAULT NULL,
    token_expiry          DATETIME      DEFAULT NULL,
    created_at            DATETIME      DEFAULT CURRENT_TIMESTAMP,
    updated_at            DATETIME      DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_token (session_token),
    INDEX idx_email (email),
    INDEX idx_phone (phone),
    INDEX idx_matching (available_for_matching, gender)
) ENGINE=InnoDB;

-- ── Lodges ───────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS lodges (
    id                INT AUTO_INCREMENT PRIMARY KEY,
    caretaker_id      INT           NOT NULL,
    lodge_name        VARCHAR(120)  NOT NULL,
    location          ENUM('eziobodo','umuchima') NOT NULL,
    price             DECIMAL(10,2) NOT NULL,
    description       TEXT          DEFAULT NULL,
    room_number       INT           DEFAULT NULL,
    gender_preference ENUM('male','female','any') DEFAULT 'any',
    amenities         TEXT          DEFAULT NULL,
    status            ENUM('active','occupied','unavailable') DEFAULT 'active',
    created_at        DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at        DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (caretaker_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_location (location),
    INDEX idx_status (status),
    INDEX idx_price (price)
) ENGINE=InnoDB;

-- ── Lodge photos ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS lodge_photos (
    id         INT AUTO_INCREMENT PRIMARY KEY,
    lodge_id   INT NOT NULL,
    photo_path VARCHAR(255) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (lodge_id) REFERENCES lodges(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ── Favorites ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS favorites (
    id         INT AUTO_INCREMENT PRIMARY KEY,
    user_id    INT NOT NULL,
    lodge_id   INT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uniq_fav (user_id, lodge_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (lodge_id) REFERENCES lodges(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ── Notifications ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notifications (
    id         INT AUTO_INCREMENT PRIMARY KEY,
    user_id    INT NOT NULL,
    type       VARCHAR(40) NOT NULL,       -- 'new_lodge', 'match_request', 'system', etc.
    title      VARCHAR(120) NOT NULL,
    message    TEXT NOT NULL,
    is_read    TINYINT(1) DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_read (user_id, is_read)
) ENGINE=InnoDB;
