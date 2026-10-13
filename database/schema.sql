-- Personal Expense Tracker — Database Schema
-- Run this in the Neon SQL Editor

-- ============================================================
-- Table 1: users
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
    id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name        VARCHAR(100)  NOT NULL,
    email       VARCHAR(255)  NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- ============================================================
-- Table 2: categories
-- ============================================================
CREATE TABLE IF NOT EXISTS categories (
    id      BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name    VARCHAR(60) NOT NULL,
    type    VARCHAR(10) NOT NULL CHECK (type IN ('INCOME', 'EXPENSE')),
    UNIQUE (user_id, name, type),
    UNIQUE (id, user_id)   -- required for composite FK on transactions
);

-- ============================================================
-- Table 3: transactions
-- ============================================================
CREATE TABLE IF NOT EXISTS transactions (
    id               BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id          BIGINT        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category_id      BIGINT        NOT NULL,
    type             VARCHAR(10)   NOT NULL CHECK (type IN ('INCOME', 'EXPENSE')),
    amount           NUMERIC(12,2) NOT NULL CHECK (amount > 0),
    description      TEXT,
    transaction_date DATE          NOT NULL DEFAULT CURRENT_DATE,
    created_at       TIMESTAMPTZ   NOT NULL DEFAULT NOW(),

    -- Composite FK ensures user cannot use another user's category
    FOREIGN KEY (category_id, user_id) REFERENCES categories(id, user_id)
);

-- ============================================================
-- Indexes for performance
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_transactions_user_date
    ON transactions(user_id, transaction_date DESC);

CREATE INDEX IF NOT EXISTS idx_transactions_user_category
    ON transactions(user_id, category_id);
