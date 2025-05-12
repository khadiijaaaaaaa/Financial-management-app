import { Component, OnInit } from '@angular/core';
import { ApiService } from '../api.service'; // Import ApiService
import { NotificationService } from '../notification.service'; // Import NotificationService

@Component({
  selector: 'app-newtransaction',
  templateUrl: './new-transaction.component.html',
  styleUrls: ['./new-transaction.component.scss'],
})
export class NewTransactionComponent implements OnInit {
  transaction = {
    category: '',
    amount: null,
    date: new Date().toISOString().slice(0, 16), // Pre-fill with current date and time
    type: 'Expense',
  };

  // Updated categories to match the "Quick Transaction" form
  categories = [
    'Food',
    'Gym',
    'Pet',
    'Clothes',
    'Salary',
    'Freelance',
    'Rental Income',
    'Bonus',
    'Groceries',
    'Restaurant',
    'Transport',
    'Taxes',
    'Health',
    'Other',
  ];

  constructor(
    private apiService: ApiService, // Inject ApiService
    private notificationService: NotificationService // Inject NotificationService
  ) {}

  ngOnInit(): void {}

  // Get Font Awesome icon for each category
  getCategoryIcon(category: string): string {
    switch (category) {
      case 'Food':
        return 'fas fa-utensils';
      case 'Gym':
        return 'fas fa-dumbbell';
      case 'Pet':
        return 'fas fa-paw';
      case 'Clothes':
        return 'fas fa-tshirt';
      case 'Other':
        return 'fas fa-question-circle';
      default:
        return 'fas fa-question-circle';
    }
  }

  // Update the color of the type dropdown based on the selected value
  updateTypeColor(): void {
    const typeSelect = document.querySelector('select[name="type"]') as HTMLSelectElement;
    if (this.transaction.type === 'Expense') {
      typeSelect.style.color = '#dc3545'; // Red for Expense
    } else {
      typeSelect.style.color = '#28a745'; // Green for Income
    }
  }

  // Handle form submission
  onSubmit(): void {
    const transactionData = {
      category: this.transaction.category,
      amount: this.transaction.amount,
      date_time: this.transaction.date,
      type: this.transaction.type,
    };

    this.apiService.createTransaction(transactionData).subscribe(
      (response) => {
        console.log('Transaction added successfully:', response);
        this.notificationService.addNotification('Transaction added successfully!'); // Add notification
        this.resetForm();
      },
      (error) => {
        console.error('Error adding transaction:', error);
        this.notificationService.addNotification('Failed to add transaction. Please try again.'); // Add error notification
      }
    );
  }

  // Reset the form after submission
  resetForm(): void {
    this.transaction = {
      category: '',
      amount: null,
      date: new Date().toISOString().slice(0, 16),
      type: 'Expense',
    };
  }
}