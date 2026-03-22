/**
 * Web-only database module
 * 
 * File Structure:
 * - db.web.ts: IndexedDB implementation (persistent storage, real data)
 * - mock-db.web.ts: Mock implementation (read-only, seed data only)
 * 
 * Git History Note:
 * Original db.web.ts (mock) has been preserved as mock-db.web.ts
 * New db.web.ts contains the IndexedDB implementation
 * 
 * To switch between implementations, change the import below.
 */

// ============================================
// ACTIVE IMPLEMENTATION (change to switch)
// ============================================

// IndexedDB with persistent storage (DEFAULT)
export { database } from './db.web';

// Mock implementation with seed data (FALLBACK - only reads, no persistence)
// export { database } from './mock-db.web';

export { DATABASE_SCHEMA, DATABASE_VERSION } from './schema';
