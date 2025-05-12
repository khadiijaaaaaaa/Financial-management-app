# Trackly - Personal Finance Management App

Trackly is a full-stack web application designed to help users manage their personal finances. It provides features to track income and expenses, visualize financial data, manage budgets, and receive personalized financial advice.

## 🔧 Tech Stack

- **Frontend:** Angular
- **Backend:** Laravel (REST API)
- **Database:** MySQL
- **Authentication:** Laravel Sanctum (token-based)

## 🎯 Features

- Dashboard with charts and summaries
- Transaction management (add/edit/delete)
- Budget tracking and notifications
- User account management
- Personalized financial tips
- Secure login and registration system
- Data export (PDF)
- Contact and support form

## 📂 Project Structure

```
/frontend       → Angular app (UI)
/backend        → Laravel app (API)
/README.md      → This file
```

## 🚀 How to Run

### 1. Backend (Laravel)
- Navigate to `/backend`
- Run:
  ```bash
  composer install
  cp .env.example .env
  php artisan key:generate
  php artisan migrate --seed
  php artisan serve
  ```

### 2. Frontend (Angular)
- Navigate to `/frontend`
- Run:
  ```bash
  npm install
  ng serve
  ```

Frontend will run on `http://localhost:4200`, and backend on `http://localhost:8000`.

## 🛡️ Authentication

- Token-based using Laravel Sanctum
- Authenticated routes require `Bearer` token in headers
- Angular's `AuthService` and `AuthInterceptor` handle token storage and transmission
