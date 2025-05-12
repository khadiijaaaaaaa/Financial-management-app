# Trackly Backend (Laravel API)

This is the Laravel-based REST API backend for the Trackly financial management app.

## ⚙️ Features

- User registration and login (via Laravel Sanctum)
- Authenticated routes for:
  - Profile management
  - Password updates
  - Transaction CRUD
  - Account deletion
- Public routes for support and contact
- Upload endpoint for profile pictures

## 🗄️ Database

- **Users Table**: Stores user info
- **Transactions Table**: Linked via `user_id` (foreign key)
- **Migrations**:
  - `create_users_table`
  - `create_transactions_table`
  - `create_personal_access_tokens_table`

## 🔐 Authentication

- Token-based with Sanctum
- `AuthController` handles register, login, logout, and profile
- Middleware: `auth:sanctum` for protected routes

## 📂 Key Files and Folders

- `routes/api.php`: Defines all REST endpoints
- `app/Http/Controllers/`: Includes `AuthController`, `TransactionController`, `UserController`
- `app/Models/`: Contains `User.php`, `Transaction.php`
- `config/sanctum.php`: Sanctum config
- `.env`: Environment settings (DB credentials, API keys)

## 🚀 Getting Started

```bash
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate
php artisan serve
```

Runs at: `http://localhost:8000`

## 📬 API Endpoints Overview

### Auth
- `POST /register`
- `POST /login`
- `POST /logout`
- `GET /user`
- `PUT /user/password`
- `DELETE /user`

### Transactions
- `GET/POST /transactions`
- `GET/PUT/DELETE /transactions/{id}`

### Misc
- `GET/PUT /settings`
- `POST /support`
- `POST /contact`
- `POST /upload-profile-picture`

## 📦 Dependencies

- Laravel 10+
- Sanctum
- MySQL
- Composer
