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

The database is automatically initialized and tables are created on first app startup. For development, you can manage test data using the following scripts:

### Quick Start (Development)

```bash
# Start the app with an empty database
npm start

# In another terminal, seed the database with test data
npm run db:seed

# The app will immediately reflect the seeded data
```

### Available Database Scripts

| Command                 | Description                                                         |
| ----------------------- | ------------------------------------------------------------------- |
| `npm run db:seed`       | Populate database with test data (categories + sample transactions) |
| `npm run db:seed:force` | Force re-seed, clearing existing data first                         |
| `npm run db:reset`      | Clear all data from database (keeps structure)                      |
| `npm run db:reset:hard` | Delete entire database file                                         |

### Common Development Workflows

**Start Fresh:**

```bash
npm run db:reset        # Clear all data
npm run db:seed         # Repopulate with test data
npm start               # Launch app
```

**Complete Reset:**

```bash
npm run db:reset:hard   # Delete database entirely
npm start               # Create new empty database
npm run db:seed         # Seed with test data
```

**Between Test Sessions:**

```bash
npm run db:reset        # Clear previous test data
npm run db:seed         # Get fresh test data
# Now you can test features with clean state
```

For detailed documentation, see [scripts/README.md](scripts/README.md)

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
