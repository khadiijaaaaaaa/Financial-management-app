<?php
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\TransactionController;
use App\Http\Controllers\UserController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

// Public routes (no authentication required)
Route::post('/register', [AuthController::class, 'register']); // User registration
Route::post('/login', [AuthController::class, 'login']); // User login

// Protected routes (require authentication)
Route::middleware('auth:sanctum')->group(function () {
    // User-related routes
    Route::get('/user', [AuthController::class, 'user']); // Get authenticated user details
    Route::post('/logout', [AuthController::class, 'logout']); // User logout

    // Update user profile
    Route::put('/user', [UserController::class, 'update']); // Update user details
    Route::put('/user/password', [UserController::class, 'updatePassword']); // Update password
    Route::delete('/user', [UserController::class, 'destroy']); // Delete user account

    // Transaction-related routes
    Route::apiResource('transactions', TransactionController::class); // CRUD for transactions

    // Settings-related routes
    Route::get('/settings', [UserController::class, 'settings']); // Get user settings
    Route::put('/settings', [UserController::class, 'updateSettings']); // Update user settings

    // Support and contact routes
    Route::post('/support', [UserController::class, 'support']); // Submit support request
    Route::post('/contact', [UserController::class, 'contact']); // Submit contact form
});

?>
