# Database Scripts

Utility scripts for managing the development database.

## ⚠️ Important

These scripts are for **development purposes only** and should NOT be used in production.

---

## Scripts

### `db:seed` - Populate Database with Test Data

Populates the database with initial test data:

- **Categories**: From `src/constants/categories.ts`
- **Transactions**: Sample transactions from `src/data/transactions.ts`

#### Usage

```bash
npm run db:seed
```

#### What it does:

1. Creates database tables (if they don't exist)
2. Seeds categories from constants
3. Seeds sample transactions
4. Shows summary with counts

#### Options

**Skip if data exists (default):**

```bash
npm run db:seed
```

**Force re-seed (clears existing data):**

```bash
npm run db:seed:force
```

#### Output Example

```
🌱 Starting database seeding...

✓ Database connection opened
✓ Database tables created
✓ Categories seeded
✓ Transactions seeded

✅ Seeding complete!
   Categories: 8
   Transactions: 45

✓ Database connection closed
```

---

### `db:reset` - Clear Database Data

Clears all data from the database while preserving structure.

#### Usage

```bash
npm run db:reset
```

#### What it does:

1. Deletes all transactions
2. Deletes all categories
3. Keeps table structure intact

#### Output Example

```
⚠️  Database Reset

This will DELETE all data from the database.

✓ Database connection opened
✓ Transactions cleared
✓ Categories cleared
✓ Database connection closed

✅ Database reset complete!
💡 Tip: Run "npm run db:seed" to repopulate with test data
```

---

### `db:reset:hard` - Delete Entire Database

Completely removes the database file.

#### Usage

```bash
npm run db:reset:hard
```

#### What it does:

1. Closes database connection
2. Deletes the database file
3. Removes temporary files (-shm, -wal)

#### When to use:

- Complete reset needed
- Database corruption
- Starting fresh development

#### Output Example

```
⚠️  Database Reset

This will DELETE the entire database file.

✓ Database file deleted: spendly.db
✓ Temp file deleted: spendly.db-shm
✓ Temp file deleted: spendly.db-wal

✅ Database reset complete!
💡 Tip: Run "npm run db:seed" to repopulate with test data
```

---

## Development Workflow

### First Time Setup

```bash
npm start          # Start the app (creates empty DB)
npm run db:seed    # Populate with test data
```

### Start Fresh

```bash
npm run db:reset        # Clear all data
npm run db:seed         # Re-populate
```

### Complete Reset

```bash
npm run db:reset:hard   # Delete entire DB
npm start               # Create new empty DB
npm run db:seed         # Populate with test data
```

### Testing Features

```bash
npm run db:reset        # Clear data between test sessions
npm run db:seed         # Use fresh test data
```

---

## How Scripts Work

### `db-seed.ts`

- Located at `scripts/db-seed.ts`
- Runs independently of the app
- Uses direct SQLite access
- Idempotent (safe to run multiple times)
- Reads data from:
  - `src/constants/categories.ts`
  - `src/data/transactions.ts`

### `db-reset.ts`

- Located at `scripts/db-reset.ts`
- Runs independently of the app
- Supports soft reset (data only) and hard reset (entire DB)
- Safe to run multiple times

---

## TypeScript Support

Both scripts are written in TypeScript and require `ts-node`:

```bash
npm install ts-node --save-dev  # If not already installed
```

Or use precompiled versions if available in `dist/scripts/`

---

## Troubleshooting

### Script not found error

```
'ts-node' is not recognized...
```

**Solution:**

```bash
npm install ts-node ts-node --save-dev
```

### Permission denied error

```
scripts/db-seed.ts: Permission denied
```

**Solution:**

```bash
chmod +x scripts/db-seed.ts
chmod +x scripts/db-reset.ts
```

### Database locked error

```
database is locked
```

**Solution:**

1. Stop the running Expo app (press 'q' in terminal)
2. Run the script again
3. Restart the app

### Path resolution error

```
Cannot find module '@/constants/categories'
```

**Solution:**

- Ensure you're running from project root: `cd /path/to/spendly`
- Check `tsconfig.json` paths configuration

---

## Production Notes

🚫 **Never use these scripts in production:**

- No data validation
- No backup mechanisms
- Destructive operations
- Development data only

For production database management:

- Use proper migration tools
- Implement backup strategies
- Use read-only database access patterns
- Implement proper seeding in backend services
