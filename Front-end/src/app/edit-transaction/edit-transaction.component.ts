import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../api.service';
import { NotificationService } from '../notification.service';

@Component({
  selector: 'app-edit-transaction',
  templateUrl: './edit-transaction.component.html',
  styleUrls: ['./edit-transaction.component.scss']
})
export class EditTransactionComponent implements OnInit {
  transaction: any = {
    id: null,
    category: '',
    amount: null,
    date_time: new Date().toISOString().slice(0, 16),
    type: 'Expense',
  };

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
    private route: ActivatedRoute,
    private router: Router,
    private apiService: ApiService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    const transactionId = this.route.snapshot.paramMap.get('id');
    if (transactionId) {
      this.apiService.getTransaction(+transactionId).subscribe(
        (response) => {
          this.transaction = response;
          this.transaction.date_time = new Date(this.transaction.date_time).toISOString().slice(0, 16);
        },
        (error) => {
          console.error('Failed to fetch transaction:', error);
          this.notificationService.addNotification('Failed to fetch transaction. Please try again.');
        }
      );
    }
  }

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

  updateTypeColor(): void {
    const typeSelect = document.querySelector('select[name="type"]') as HTMLSelectElement;
    if (this.transaction.type === 'Expense') {
      typeSelect.style.color = '#dc3545'; // Red for Expense
    } else {
      typeSelect.style.color = '#28a745'; // Green for Income
    }
  }

  onSubmit(): void {
    this.apiService.updateTransaction(this.transaction.id, this.transaction).subscribe(
      (response) => {
        console.log('Transaction updated successfully:', response);
        this.notificationService.addNotification('Transaction updated successfully!');
        this.router.navigate(['/activity']);
      },
      (error) => {
        console.error('Error updating transaction:', error);
        this.notificationService.addNotification('Failed to update transaction. Please try again.');
      }
    );
  }
}