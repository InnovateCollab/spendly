/**
 * Web-only database module - uses mock data
 * Avoids loading expo-sqlite WASM on web platform
 */

export { database } from './db.web';
export { DATABASE_SCHEMA, DATABASE_VERSION } from './schema';
