# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

   In the output, you'll find options to open the app in a
   - [development build](https://docs.expo.dev/develop/development-builds/introduction/)
   - [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
   - [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
   - [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

   ### iOS Simulator Setup (Optional)

   To run the app on a specific iOS simulator device:
   1. List all available simulator devices:

      ```bash
      xcrun simctl list devices available
      ```

      This will show available devices with their UUIDs.

   2. Boot a specific simulator (replace `UUID` with the actual device UUID):

      ```bash
      xcrun simctl boot UUID
      ```

   3. Start the app on iOS:
      ```bash
      npx expo start --ios
      ```

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Database Management

### Auto-Seeding

The app automatically initializes the database with test data on first launch:

1. **First Launch:** Empty database is created → auto-seeds with categories and transactions
2. **Subsequent Launches:** Database loads existing data (no re-seeding)

This works seamlessly on both **iOS Simulator** and **Android Emulator**.

### Debug Menu (In-App Controls)

During development, use the **Debug Menu** to manage test data directly in the app:

1. **Start the app:**

   ```bash
   npm start
   ```

2. **Open simulator:**
   - Press `i` for iOS simulator
   - Press `a` for Android emulator

3. **Access Debug Menu:**
   - Look for the red 🛠️ button at the bottom-right corner
   - Tap it to open the debug menu

4. **Available Options:**
   - **📊 Database Stats** — Shows transaction and category counts
   - **🗑️ Reset Database** — Clear all data (keeps structure)
   - **🌱 Reseed Data** — Clear all data and reload test data

### How Page Refresh Works

When you use the Debug Menu to reset or reseed the database, the app automatically refreshes the Timeline and Overview pages **without requiring navigation**:

- **Architecture:** `devMenu.tsx` → calls `triggerRefresh()` → `DatabaseContext` broadcasts change → Timeline/Overview hooks detect refresh trigger → Pages auto-reload data
- **Result:** Data updates in place, pages stay visible, modal closes automatically
- **No reload flashing:** Pages update smoothly within the same navigation context

This is implemented via `DatabaseContext` (in `src/contexts/`), which provides a lightweight notification system for database changes. Development-only feature.

### Development Workflows

**Fresh Start:**

```bash
npm start
# Tap 🛠️ → Reseed Data → Fresh test data loaded
```

**Clean Test Session:**

```bash
npm start
# Tap 🛠️ → Reset Database → All data cleared
# Tap 🛠️ → Reseed Data → Fresh test data
```

**Just Delete & Restart (Nuclear Option):**

```bash
# Stop app (Ctrl+C)
# Delete app from simulator
# npm start → Select simulator (i/a)
# Fresh empty database → Auto-seeded
```

## Database Testing & Introspection

### Viewing Database Contents

The database is automatically initialized and the schema is created when running on iOS. To populate it with test data, use one of the database scripts above.

You'll see logs in the console showing:

### Access Database via Command Line (macOS)

Inspect the actual SQLite database file directly:
x

1. Find your iOS simulator database:

   ```bash
   find ~/Library/Developer/CoreSimulator/Devices -name "spendly.db" -type f
   ```

2. Open it with sqlite3 (pre-installed on macOS):

   ```bash
   sqlite3 "/path/to/spendly.db"
   ```

3. Inside sqlite3, run queries:
   ```sql
   .tables                             -- List tables
   .schema                             -- View table structure
   .mode column                        -- Pretty output format
   .headers on                         -- Pretty output format
   SELECT * FROM categories;           -- View all categories
   SELECT * FROM transactions;         -- View all transactions
   SELECT COUNT(*) FROM transactions;  -- Count records
   DROP TABLE IF EXISTS transactions;  -- Drop tables
   DROP TABLE IF EXISTS categories;    -- Drop tables
   .exit
   ```

### Note on Web Support

SQLite database functionality only works on native platforms (iOS/Android). The web version uses stub implementations and displays appropriate messages. For database testing, use iOS Simulator or Android Emulator.

## Start project

When you're ready, run:

```bash
npm run start
```

### Other setup steps

- To set up ESLint for linting, run `npx expo lint`, or follow our guide on ["Using ESLint and Prettier"](https://docs.expo.dev/guides/using-eslint/)
- If you'd like to set up unit testing, follow our guide on ["Unit Testing with Jest"](https://docs.expo.dev/develop/unit-testing/)
- Learn more about the TypeScript setup in this template in our guide on ["Using TypeScript"](https://docs.expo.dev/guides/typescript/)
