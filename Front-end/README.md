# Trackly Frontend (Angular)

This is the Angular frontend for the Trackly personal finance application.

## 🧩 Key Features

- User-friendly dashboard with income/expense summary
- Charts (bar, pie) for financial insights
- Add/edit/delete transactions
- Register/Login/Logout
- Auth token management via HTTP interceptors
- Notifications for user actions
- Contact form

## 📁 Key Folders

- `components/`: Reusable UI components (navbar, footer, sidebar)
- `layouts/`: Main application layout templates
- `pages/`: Main views like dashboard, login, register, etc.
- `services/`: Angular services including `api.service.ts`, `auth.service.ts`
- `interceptors/`: `auth.interceptor.ts` for token injection

## 🚀 How to Run

```bash
npm install
ng serve
```

App will be accessible at: `http://localhost:4200`

## 🔐 Authentication

- Uses tokens issued by Laravel Sanctum
- Token is stored in `localStorage` and attached to every API request using `AuthInterceptor`

## 🧠 Services

- `api.service.ts`: Centralized API communication
- `auth.service.ts`: Manages authentication and session logic
- `notification.service.ts`: Displays action-based alerts
- `shared.service.ts`: Shares state/data across components

## 🧪 Notes

- Works in sync with Laravel backend running on `http://localhost:8000`
- Ensure CORS is enabled and configured on the Laravel API
