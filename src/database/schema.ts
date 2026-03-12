/**
 * SQLite Database Schema
 * Defines all CREATE TABLE statements for the application
 */

export const DATABASE_SCHEMA = `
  CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    icon_ios TEXT NOT NULL,
    icon_android TEXT NOT NULL,
    icon_web TEXT NOT NULL,
    color TEXT NOT NULL,
    type TEXT NOT NULL CHECK(type IN ('income', 'expense')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category_id INTEGER NOT NULL,
    amount REAL NOT NULL,
    date TEXT NOT NULL,
    note TEXT,
    labels TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT
  );

  CREATE INDEX IF NOT EXISTS idx_transactions_category_id 
    ON transactions(category_id);
    
  CREATE INDEX IF NOT EXISTS idx_transactions_date 
    ON transactions(date DESC);
`;

export const DATABASE_VERSION = 1;
