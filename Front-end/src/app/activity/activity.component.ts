import { Component, OnInit } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { ApiService } from '../api.service'; // Import ApiService
import { NotificationService } from '../notification.service'; // Import NotificationService
import { Router } from '@angular/router'; // Add this import

@Component({
  selector: 'app-activity',
  templateUrl: './activity.component.html',
  styleUrls: ['./activity.component.scss'],
})
export class ActivityComponent implements OnInit {
  transactions: any[] = []; // Transactions fetched from the backend
  filteredTransactions: any[] = []; // Transactions after applying filters
  categories: string[] = []; // Categories for filtering
  selectedCategory: string = '';
  selectedDateOrder: string = 'latest'; // Default to 'latest'
  amountMin: number | null = null;
  amountMax: number | null = null;
  searchText: string = '';
  itemsPerPage: number = 5;
  currentPage: number = 1;
  totalPages: number = 1;
  showFilters: boolean = false; // Toggle filters visibility
  isCollapsed: boolean = false; // Track if the page is collapsed

  constructor(
    private breakpointObserver: BreakpointObserver,
    private apiService: ApiService, // Inject ApiService
    private notificationService: NotificationService, // Inject NotificationService
    private router: Router // Inject Router
  ) {}

  ngOnInit(): void {
    // Detect if the page is collapsed (small screen)
    this.breakpointObserver
      .observe([Breakpoints.Handset, Breakpoints.TabletPortrait])
      .subscribe((result) => {
        this.isCollapsed = result.matches;
      });

    // Fetch transactions from the backend
    this.fetchTransactions();
  }

  // Fetch transactions from the backend
  fetchTransactions(): void {
    this.apiService.getTransactions().subscribe(
      (response: any) => {
        this.transactions = response; // Update transactions
        this.filteredTransactions = response; // Initialize filtered transactions
        this.categories = this.getUniqueCategories(response); // Extract unique categories
        this.applyFilters(); // Apply initial filters
      },
      (error) => {
        console.error('Failed to fetch transactions:', error);
        this.notificationService.addNotification('Failed to fetch transactions. Please try again.'); // Add error notification
      }
    );
  }

  // Get unique categories from transactions
  getUniqueCategories(transactions: any[]): string[] {
    const categories = transactions.map((t) => t.category);
    return [...new Set(categories)]; // Remove duplicates
  }

  applyFilters(): void {
    // Apply filters
    this.filteredTransactions = this.transactions.filter((transaction) => {
      const matchesCategory = this.selectedCategory
        ? transaction.category === this.selectedCategory
        : true;
      const matchesAmount =
        (this.amountMin ? transaction.amount >= this.amountMin : true) &&
        (this.amountMax ? transaction.amount <= this.amountMax : true);
      const matchesSearch = this.searchText
        ? transaction.category.toLowerCase().includes(this.searchText.toLowerCase())
        : true;
      return matchesCategory && matchesAmount && matchesSearch;
    });

    // Sort by date order
    if (this.selectedDateOrder === 'latest') {
      this.filteredTransactions.sort((a, b) => new Date(b.date_time).getTime() - new Date(a.date_time).getTime());
    } else if (this.selectedDateOrder === 'oldest') {
      this.filteredTransactions.sort((a, b) => new Date(a.date_time).getTime() - new Date(b.date_time).getTime());
    }

    // Update pagination
    this.totalPages = Math.ceil(this.filteredTransactions.length / this.itemsPerPage);
  }

  resetFilters(): void {
    this.selectedCategory = '';
    this.selectedDateOrder = 'latest'; // Reset to default
    this.amountMin = null;
    this.amountMax = null;
    this.searchText = '';
    this.applyFilters();
  }

  sortTransactions(column: string): void {
    this.filteredTransactions.sort((a, b) => {
      if (column === 'date_time') {
        // Sort by date_time in descending order (latest first)
        return new Date(b.date_time).getTime() - new Date(a.date_time).getTime();
      } else {
        // Sort by other columns
        if (a[column] < b[column]) return 1;
        if (a[column] > b[column]) return -1;
        return 0;
      }
    });
  }

  editTransaction(transaction: any): void {
    this.router.navigate(['/edit-transaction', transaction.id]);
  }

  deleteTransaction(transaction: any): void {
    // Show confirmation dialog
    const isConfirmed = window.confirm('Are you sure you want to delete this transaction?');
    if (isConfirmed) {
      // Call the API to delete the transaction
      this.apiService.deleteTransaction(transaction.id).subscribe(
        () => {
          this.notificationService.addNotification('Transaction deleted successfully!'); // Add success notification
          this.fetchTransactions(); // Refresh the transactions list
        },
        (error) => {
          console.error('Failed to delete transaction:', error);
          this.notificationService.addNotification('Failed to delete transaction. Please try again.'); // Add error notification
        }
      );
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  getDisplayedRange(): string {
    const start = (this.currentPage - 1) * this.itemsPerPage + 1;
    const end = Math.min(this.currentPage * this.itemsPerPage, this.filteredTransactions.length);
    return `${start} - ${end}`;
  }

  toggleFilters(): void {
    this.showFilters = !this.showFilters;
  }

  // Format date_time for display
  formatDateTime(dateTime: string): string {
    return new Date(dateTime).toLocaleString(); // Format as a readable date and time
  }
}