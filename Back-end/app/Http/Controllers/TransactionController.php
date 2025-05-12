<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Transaction;
use Carbon\Carbon;

class TransactionController extends Controller
{
    /**
     * Display a listing of the transactions.
     */
    public function index(Request $request)
    {
        // Return all transactions for the authenticated user
        return $request->user()->transactions;
    }

    /**
     * Store a newly created transaction in storage.
     */
    public function store(Request $request)
    {
        // Validate the request data
        $request->validate([
            'category' => 'required|string',
            'amount' => 'required|numeric',
            'date_time' => 'sometimes|date', // Make date_time optional
            'type' => 'required|string',
        ]);

        // Set the date_time to the current date and time if not provided
        $dateTime = $request->has('date_time') ? $request->date_time : Carbon::now();

        // Create the transaction
        $transaction = $request->user()->transactions()->create([
            'category' => $request->category,
            'amount' => $request->amount,
            'date_time' => $dateTime,
            'type' => $request->type,
        ]);

        // Return the created transaction
        return response()->json($transaction, 201);
    }

    /**
     * Display the specified transaction.
     */
    public function show(Request $request, Transaction $transaction)
    {
        // Ensure the transaction belongs to the authenticated user
        if ($transaction->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Return the specified transaction
        return response()->json($transaction);
    }

    /**
     * Update the specified transaction in storage.
     */
    public function update(Request $request, Transaction $transaction)
    {
        // Ensure the transaction belongs to the authenticated user
        if ($transaction->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Validate the request data
        $request->validate([
            'category' => 'sometimes|string',
            'amount' => 'sometimes|numeric',
            'date_time' => 'sometimes|date',
            'type' => 'sometimes|string',
        ]);

        // Update the transaction
        $transaction->update($request->all());

        // Return the updated transaction
        return response()->json($transaction);
    }

    /**
     * Remove the specified transaction from storage.
     */
    public function destroy(Request $request, Transaction $transaction)
    {
        // Ensure the transaction belongs to the authenticated user
        if ($transaction->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Delete the transaction
        $transaction->delete();

        // Return a success response
        return response()->json(null, 204);
    }
}
?>