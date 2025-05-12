<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    /**
     * Display the authenticated user's details.
     */
    public function show(Request $request)
    {
        return response()->json($request->user());
    }

    /**
     * Update the authenticated user's profile.
     */
    public function update(Request $request)
    {
        // Log the update attempt (avoid sensitive data)
        \Log::info('User update attempt:', ['user_id' => $request->user()->id, 'email' => $request->email]);

        $request->validate([
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|string|email|max:255|unique:users,email,' . $request->user()->id,
            'password' => 'sometimes|string|min:4',
            'profile_picture' => 'sometimes|image|mimes:jpeg,png,jpg,gif|max:2048',
            'total_balance' => 'sometimes|numeric',
            'gender' => 'sometimes|string',
            'birthdate' => 'sometimes|date',
            'city' => 'sometimes|string',
            'country' => 'sometimes|string',
        ]);

        $user = $request->user();

        // Update user data
        if ($request->filled('name')) $user->name = $request->name;
        if ($request->filled('email')) $user->email = $request->email;
        if ($request->filled('password')) $user->password = Hash::make($request->password);
        if ($request->hasFile('profile_picture')) {
            $path = $request->file('profile_picture')->store('profile_pictures', 'public');
            $user->profile_picture = $path;
        }
        if ($request->filled('total_balance')) $user->total_balance = $request->total_balance;
        if ($request->filled('gender')) $user->gender = $request->gender;
        if ($request->filled('birthdate')) $user->birthdate = $request->birthdate;
        if ($request->filled('city')) $user->city = $request->city;
        if ($request->filled('country')) $user->country = $request->country;

        $saved = $user->save();

        // Log the save result
        \Log::info('Save result:', ['user_id' => $user->id, 'saved' => $saved]);

        if ($saved) {
            // Return full URL for profile picture
            if ($user->profile_picture) {
                $user->profile_picture = asset('storage/' . $user->profile_picture);
            }

            return response()->json([
                'message' => 'User updated successfully!',
                'user' => $user
            ], 200);
        }

        return response()->json([
            'message' => 'Failed to update user.'
        ], 500);
    }

    /**
     * Update the authenticated user's password.
     */
    public function updatePassword(Request $request)
    {
        $request->validate([
            'current_password' => 'required|string',
            'new_password' => 'required|string|min:8',
        ]);

        $user = $request->user();

        if (!Hash::check($request->current_password, $user->password)) {
            return response()->json(['message' => 'Current password is incorrect'], 400);
        }

        $user->password = Hash::make($request->new_password);
        $user->save();

        return response()->json(['message' => 'Password updated successfully']);
    }

    /**
     * Delete the authenticated user's account.
     */
    public function destroy(Request $request)
    {
        $request->user()->delete();
        return response()->json(['message' => 'Account deleted successfully']);
    }

    /**
     * Get the authenticated user's settings.
     */
    public function settings(Request $request)
    {
        return response()->json($request->user());
    }

    /**
     * Update the authenticated user's settings.
     */
    public function updateSettings(Request $request)
    {
        $request->validate([
            'total_balance' => 'sometimes|numeric',
            'gender' => 'sometimes|string',
            'birthdate' => 'sometimes|date',
            'city' => 'sometimes|string',
            'country' => 'sometimes|string',
        ]);

        $user = $request->user();
        $user->update($request->all());

        return response()->json($user);
    }

    /**
     * Handle a support request from the authenticated user.
     */
    public function support(Request $request)
    {
        $request->validate([
            'message' => 'required|string',
        ]);

        // Logic to handle support request (e.g., send email)
        return response()->json(['message' => 'Support request submitted successfully']);
    }

    /**
     * Handle a contact form submission from the authenticated user.
     */
    public function contact(Request $request)
    {
        $request->validate([
            'name' => 'required|string',
            'email' => 'required|string|email',
            'message' => 'required|string',
        ]);

        // Logic to handle contact form submission (e.g., send email)
        return response()->json(['message' => 'Contact form submitted successfully']);
    }
}
