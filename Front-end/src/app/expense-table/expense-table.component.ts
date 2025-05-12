import { Component, OnInit } from '@angular/core';
import { ApiService } from '../api.service'; // Import ApiService
import { NotificationService } from '../notification.service'; // Import NotificationService
import { SharedService } from '../shared.service'; // Import SharedService

@Component({
  selector: 'app-expense-table',
  templateUrl: './expense-table.component.html',
  styleUrls: ['./expense-table.component.scss'],
})
export class ExpenseTableComponent implements OnInit {
  transactions: any[] = []; // All transactions fetched from the backend
  filteredTransactions: any[] = []; // Only expense transactions
  itemsPerPage: number = 5; // Default items per page
  currentPage: number = 1; // Current page
  totalPages: number = 1; // Total pages

  constructor(
    private apiService: ApiService, // Inject ApiService
    private notificationService: NotificationService, // Inject NotificationService
    private sharedService: SharedService // Inject SharedService
  ) {}

  ngOnInit(): void {
    // Fetch transactions from the backend
    this.fetchTransactions();
  }

  // Fetch transactions from the backend
  fetchTransactions(): void {
    this.apiService.getTransactions().subscribe(
      (response: any) => {
        this.transactions = response; // Update transactions
        this.filteredTransactions = this.transactions.filter((t) => t.type === 'Expense'); // Filter only expense transactions
        this.sharedService.setExpenseData(this.filteredTransactions); // Store expense data in SharedService
        this.applyPagination(); // Apply pagination
      },
      (error) => {
        console.error('Failed to fetch transactions:', error);
        this.notificationService.addNotification('Failed to fetch transactions. Please try again.'); // Add error notification
      }
    );
  }

  // Apply pagination logic
  applyPagination(): void {
    this.totalPages = Math.ceil(this.filteredTransactions.length / this.itemsPerPage);
  }

  // Go to the next page
  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  // Go to the previous page
  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  // Get the displayed range of results
  getDisplayedRange(): string {
    const start = (this.currentPage - 1) * this.itemsPerPage + 1;
    const end = Math.min(this.currentPage * this.itemsPerPage, this.filteredTransactions.length);
    return `${start} - ${end}`;
  }

  // Format date_time for display
  formatDateTime(dateTime: string): string {
    return new Date(dateTime).toLocaleString(); // Format as a readable date and time
  }
}