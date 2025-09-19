## Problem

Watching crypto market in apps like TradingView and Bybit is hard when you want to watch a high number of coins because you need to swtich screens to change the coin chart, for example if you added 20 coins in favorite list on Bybit it will be super hard to navigate and check all their charts, even when you only want to do it once every 4 hours.

## Solution

If a user can swipe to switch coin charts like in TikTok, Youtube shorts then watching any number of coins will be super easy.

## Requirement

1. The user should be able to select any number of coins to watch - add/delete coins to favorite list. For now Bybit coins is enough to pick from.
2. The user should be able to see his coins with the previous 24 hours change percentage and volume.
3. The user can pick a coin to see its candlestick chart.
    - The user should be able to change chart intervals.
    - The user should be able to manipulate the chart - zoom in/out.
4. The user should be able to swipe up/down to move between coins from his favorite list.
5. The user should be able to change the order of the coins on this favorite list.

## Implementation

### I. Components
The React components which will represent the UI using shadcu/ui.

### II. Hooks
A layer to manage the state of API data from backend and any external APIs.

### III. Services
The layer that will do the actual API call and any needed data manipulation.

### IV. Middlewares
The layer between frontend and backend to handle operations like authentication.

### V. Routes
A layer to handle coming request from the frontend services.

### VI. Controllers
A layer to handle backend logic like calling the database.

### VII. Data and Auth
This app now uses MongoDB for data storage and a minimal cookie-based auth for simplicity.

- Storage: Each user's data is stored in a single document in the `users` collection, including their `watchlist` array.
- Auth: The login form creates/fetches a user by email and stores a `user_id` cookie. Passwords are not verified in this demo setup.

Environment variables:
- MONGODB_URI: The MongoDB connection string (required)
- MONGODB_DB: The database name (optional, defaults to `chart-swipe`)
- NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: Clerk publishable key (required)
- CLERK_SECRET_KEY: Clerk secret key (required)
