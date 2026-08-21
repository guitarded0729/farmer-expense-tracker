# 🌾 Farmer Expense Tracker — Full-Stack Application

A modern, production-ready full-stack application for managing agricultural expenses, income, field ledgers, multi-season tracking, category budgets, outlier detection, linear regression forecasting, and co-farmer sharing.

---

## 🏗️ Architecture

```
                  ┌─────────────────────────────────┐
                  │      React + Vite Frontend      │
                  │       (Port 5173 / Deployed)    │
                  └────────────────┬────────────────┘
                                   │ HTTP REST API
                                   ▼
                  ┌─────────────────────────────────┐
                  │      Node.js + Express API      │
                  │       (Port 5000 / Deployed)    │
                  └────────────────┬────────────────┘
                                   │ Parameterized SQL (pg)
                                   ▼
                  ┌─────────────────────────────────┐
                  │       PostgreSQL Database       │
                  │   (farmers, seasons, tx, etc.)  │
                  └─────────────────────────────────┘
```

---

## ✨ Features

- **Farmer Profiles & Co-Farmers**: Manage primary operators, co-farmers, landowners, and partners with equity shares.
- **Multi-Season Field Ledger**: Organize transactions (expenses and income) across seasons (Kharif, Rabi, Zaid, custom seasons).
- **Expense Classification & Categorization**: Categorize spending across Seeds, Fertilizer, Labor, and Equipment.
- **Budget Tracking**: Set per-category budget thresholds with real-time over-budget warnings.
- **Outlier / Emergency Detection**: Flag unusual expenses for quick auditing.
- **Linear Regression Forecast Engine**: Ordinary Least Squares (OLS) prediction algorithm to estimate next-season costs based on historical multi-season trends.
- **Interactive Recharts Visualization**: Category pie charts and multi-season comparative bar charts.
- **Working Share URL**: Generate live share links for co-farmers with QR code display.

---

## 🛠️ Technology Stack

- **Frontend**: React 19, Vite, Recharts, Lucide Icons, Vanilla CSS Design System
- **Backend**: Node.js, Express.js, Express-Validator, CORS, Dotenv
- **Database**: PostgreSQL with UUID primary keys, foreign key constraints, indexes, triggers
- **DB Client**: `pg` (node-postgres) with connection pooling and parameterized queries

---

## 📂 Project Structure

```
farmer-expense-tracker/
├── backend/                      # Node.js + Express Backend
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.js       # PostgreSQL Pool connection
│   │   │   └── schema.sql        # Database tables & migration SQL
│   │   ├── controllers/
│   │   │   ├── farmerController.js
│   │   │   ├── seasonController.js
│   │   │   ├── transactionController.js
│   │   │   └── budgetController.js
│   │   ├── middleware/
│   │   │   ├── errorHandler.js   # Global Express error handler
│   │   │   └── validateRequest.js# Input validation middleware
│   │   ├── routes/
│   │   │   ├── farmerRoutes.js   # /api/farmers
│   │   │   ├── seasonRoutes.js   # /api/seasons
│   │   │   ├── transactionRoutes.js # /api/transactions
│   │   │   └── budgetRoutes.js   # /api/budgets
│   │   └── server.js             # Express app entry point
│   ├── .env.example
│   └── package.json
├── src/                          # React + Vite Frontend
│   ├── services/
│   │   └── api.js                # API service layer (fetch abstraction)
│   ├── App.jsx                   # Main React application
│   ├── App.css
│   ├── index.css
│   └── main.jsx
├── .env                          # Frontend environment config (VITE_API_URL)
├── .gitignore
├── package.json
└── README.md
```

---

## 🚀 Quick Start & Local Setup

### Prerequisites

- **Node.js**: v18 or higher
- **PostgreSQL**: Installed and running locally or accessible via URL

---

### Step 1: PostgreSQL Setup

1. Create a new PostgreSQL database:
   ```sql
   CREATE DATABASE farmer_expense_tracker;
   ```

2. Run the database migration script:
   ```bash
   psql -U postgres -d farmer_expense_tracker -f backend/src/config/schema.sql
   ```
   *Or execute the contents of `backend/src/config/schema.sql` in your SQL tool (pgAdmin, DBeaver, TablePlus, etc.).*

---

### Step 2: Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create environment configuration file:
   ```bash
   cp .env.example .env
   ```

4. Configure your `.env` file:
   ```env
   DATABASE_URL=postgresql://postgres:your_password@localhost:5432/farmer_expense_tracker
   PORT=5000
   FRONTEND_URL=http://localhost:5173
   NODE_ENV=development
   ```

5. Start the backend development server:
   ```bash
   npm run dev
   ```
   *The Express server will start on `http://localhost:5000`.*

---

### Step 3: Frontend Setup

1. Open a new terminal in the project root directory (`farmer-expense-tracker/`):
   ```bash
   npm install
   ```

2. Verify `.env` file exists in project root:
   ```env
   VITE_API_URL=http://localhost:5000
   ```

3. Start the React Vite development server:
   ```bash
   npm run dev
   ```

4. Open `http://localhost:5173` in your browser.

---

## 📡 API Documentation

### Farmers API
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/farmers` | Fetch all farmer profiles |
| `GET` | `/api/farmers/:id` | Fetch farmer profile by ID |
| `POST` | `/api/farmers` | Create a new farmer profile |
| `PUT` | `/api/farmers/:id` | Update farmer profile |
| `DELETE` | `/api/farmers/:id` | Delete farmer profile |

### Seasons API
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/seasons` | Fetch all seasons ordered by sort_order |
| `GET` | `/api/seasons/:id` | Fetch season by ID |
| `POST` | `/api/seasons` | Create a new season |
| `PUT` | `/api/seasons/:id` | Update season name/order |
| `DELETE` | `/api/seasons/:id` | Delete season |

### Transactions API
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/transactions` | Fetch transactions (Query params: `farmerId`, `seasonId`, `type`) |
| `GET` | `/api/transactions/:id` | Fetch transaction by ID |
| `POST` | `/api/transactions` | Log a new transaction (expense or income) |
| `PUT` | `/api/transactions/:id` | Update transaction details |
| `DELETE` | `/api/transactions/:id` | Delete transaction |

### Budgets API
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/budgets` | Fetch budgets (Query param: `farmerId`) |
| `POST` | `/api/budgets` | Create or update category budget threshold |
| `PUT` | `/api/budgets/:id` | Update budget amount |

---

## 📦 Production Build & Deployment

### Build Frontend
```bash
npm run build
```
This produces optimized production assets in the `dist/` directory.

### Start Backend in Production
```bash
cd backend
NODE_ENV=production npm start
```

### Hosted PostgreSQL Connection
To connect to a cloud PostgreSQL provider (e.g., Supabase, Neon, Railway, Render, AWS RDS):
1. Copy the external PostgreSQL connection string.
2. Set the `DATABASE_URL` environment variable on your backend hosting platform:
   ```env
   DATABASE_URL=postgres://user:password@hostname:5432/dbname?sslmode=require
   ```
3. Run `backend/src/config/schema.sql` against the hosted database once.
