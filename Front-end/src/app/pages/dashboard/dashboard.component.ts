import { Component, OnInit } from '@angular/core';
import Chart from 'chart.js';
import { ApiService } from '../../api.service'; // Import ApiService
import { NotificationService } from '../../notification.service'; 
import { Router } from '@angular/router'; // Import Router
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { TranslateService } from '@ngx-translate/core';
import { SharedService } from '../../shared.service'; // Import the SharedService
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';




@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})


export class DashboardComponent implements OnInit {
  activeFilter = 'both';
  timeFilter = 'month';
  transactions = [];
  isCollapsed: boolean = false;
  topCategories: { category: string, amount: number, percentage: string }[] = [];
  pieChartTimeFilter = 'month'; // Default to monthly

  // Metrics
  totalIncome: number = 0;
  totalExpenses: number = 0;
  currentBalance: number = 0;

  private barChart: Chart;
  private pieChart: Chart;
  expenseLimit: number | null = null;

  // Quick Transaction Form Data
  quickTransaction = {
    category: '',
    amount: null,
    type: 'Expense'
  };

  constructor(
    private apiService: ApiService,
    private notificationService: NotificationService,
    private breakpointObserver: BreakpointObserver,
    private router: Router, // Inject Router
    private translate: TranslateService,
    private sharedService: SharedService
  ) {
    this.translate.setDefaultLang('en');
  } // Inject ApiService

  ngOnInit(): void {
    this.renderBarChart();
    this.renderPieChart();
    this.breakpointObserver
      .observe([Breakpoints.Handset, Breakpoints.TabletPortrait])
      .subscribe((result) => {
        this.isCollapsed = result.matches;
      });
    // Fetch the latest 4 transactions
    this.fetchLatestTransactions();
    this.fetchAllTransactions();
    // Subscribe to changes in the expense limit
    this.sharedService.expenseLimit$.subscribe((limit) => {
      this.expenseLimit = limit;
      this.updateBarChart(); // Update the chart with the new limit
    });
  }

  // Set the time filter for the pie chart
  setPieChartTimeFilter(filter: string): void {
    console.log('Pie Chart Time Filter Changed:', filter); // Debugging line
    this.pieChartTimeFilter = filter;
    this.renderPieChart(); // Re-render the pie chart with the new filter
  }

  navigateToExpenseTable(): void {
    this.router.navigate(['/expense-table']);
  }

  navigateToIncomeTable(): void {
    this.router.navigate(['/income-table']);
  }

  navigateToTable(): void {
    this.router.navigate(['/activity']);
  }

  // Method to export the table as a PDF
exportExpenseTableAsPDF(): void {
  const expenseData = this.sharedService.getExpenseData(); // Get expense data from SharedService

  if (expenseData.length > 0) {
    // Create a temporary table element
    const tableElement = document.createElement('table');

    // Add custom styles to the table
    tableElement.style.borderCollapse = 'collapse';
    tableElement.style.width = '100%';
    tableElement.style.color = 'black'; // Ensure text is black

    // Add table headers and rows
    tableElement.innerHTML = `
      <thead>
        <tr>
          <th style="border: 1px solid black; padding: 8px; text-align: left;">Category</th>
          <th style="border: 1px solid black; padding: 8px; text-align: left;">Amount</th>
          <th style="border: 1px solid black; padding: 8px; text-align: left;">Date and Time</th>
          <th style="border: 1px solid black; padding: 8px; text-align: left;">Type</th>
        </tr>
      </thead>
      <tbody>
        ${expenseData
          .map(
            (transaction) => `
          <tr>
            <td style="border: 1px solid black; padding: 8px; text-align: left;">${transaction.category}</td>
            <td style="border: 1px solid black; padding: 8px; text-align: left;">${transaction.amount}</td>
            <td style="border: 1px solid black; padding: 8px; text-align: left;">${new Date(transaction.date_time).toLocaleString()}</td>
            <td style="border: 1px solid black; padding: 8px; text-align: left;">${transaction.type}</td>
          </tr>
        `
          )
          .join('')}
      </tbody>
    `;

    // Append the table to the body temporarily
    document.body.appendChild(tableElement);

    // Use html2canvas to convert the table to an image
    html2canvas(tableElement).then((canvas) => {
      const imgData = canvas.toDataURL('image/png'); // Convert canvas to image data
      const pdf = new jsPDF('p', 'mm', 'a4'); // Create a new PDF document

      const imgWidth = 210; // A4 page width in mm
      const pageHeight = 297; // A4 page height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width; // Calculate image height to maintain aspect ratio

      let heightLeft = imgHeight;
      let position = 0;

      // Add the image to the PDF
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // Add additional pages if the table is too long
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      // Save the PDF
      pdf.save('expense-table.pdf');

      // Remove the temporary table element
      document.body.removeChild(tableElement);
    });
  } else {
    console.error('No expense data found');
  }
}


  // Fetch all transactions from the database
  fetchAllTransactions(): void {
    this.apiService.getTransactions().subscribe(
      (response: any) => {
        // Calculate metrics based on all transactions
        this.calculateMetrics(response);

        // Sort transactions by date_time in descending order (latest first)
        this.transactions = response
          .sort((a: any, b: any) => new Date(b.date_time).getTime() - new Date(a.date_time).getTime())
          .slice(0, 4); // Get the first 4 transactions for the recent transactions table
      },
      (error) => {
        console.error('Failed to fetch transactions:', error);
        this.notificationService.addNotification('Failed to fetch transactions. Please try again.'); // Add error notification
      }
    );
  }

  // Calculate Total Income, Total Expenses, and Current Balance
// Calculate Total Income, Total Expenses, and Current Balance
calculateMetrics(transactions: any[]): void {
  // Fetch the user's total_balance from the API
  this.apiService.getUser().subscribe(
    (user: any) => {
      // Calculate Total Income (sum of all income transactions)
      this.totalIncome = transactions
        .filter((t) => t.type === 'Income')
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);

      // Calculate Total Expenses (sum of all expense transactions)
      this.totalExpenses = transactions
        .filter((t) => t.type === 'Expense')
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);
      
      // Calculate Current Balance (user.total_balance + totalIncome - totalExpenses)
      this.currentBalance = user.total_balance - this.totalExpenses + transactions
      .filter((t) => t.type === 'Income')
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);

    },
    (error) => {
      console.error('Failed to fetch user data:', error);
      this.notificationService.addNotification('Failed to fetch user data. Please try again.'); // Add error notification
    }
  );
}



  // Fetch the latest 4 transactions
  fetchLatestTransactions(): void {
    this.apiService.getTransactions().subscribe(
      (response: any) => {
        // Sort transactions by date_time in descending order (latest first)
        this.transactions = response
          .sort((a: any, b: any) => new Date(b.date_time).getTime() - new Date(a.date_time).getTime())
          .slice(0, 4); // Get the first 4 transactions
      },
      (error) => {
        console.error('Failed to fetch transactions:', error);
        this.notificationService.addNotification('Failed to fetch transactions. Please try again.'); // Add error notification
      }
    );
  }

  


  editTransaction(transaction: any): void {
    this.router.navigate(['/edit-transaction', transaction.id]);
  }

  // Delete a transaction
  deleteTransaction(transaction: any): void {
    // Show confirmation dialog
    const isConfirmed = window.confirm('Are you sure you want to delete this transaction?');
    if (isConfirmed) {
      // Call the API to delete the transaction
      this.apiService.deleteTransaction(transaction.id).subscribe(
        () => {
          this.notificationService.addNotification('Transaction deleted successfully!'); // Add success notification
          this.fetchLatestTransactions(); // Refresh the transactions list
        },
        (error) => {
          console.error('Failed to delete transaction:', error);
          this.notificationService.addNotification('Failed to delete transaction. Please try again.'); // Add error notification
        }
      );
    }
  }

  setFilter(filter: string): void {
    this.activeFilter = filter;
    this.updateBarChart();
  }

  setTimeFilter(filter: string): void {
    this.timeFilter = filter;
    this.updateBarChart();
  }

  // Render the bar chart
  renderBarChart(): void {
    const ctx = document.getElementById('chart-financial-activity') as HTMLCanvasElement;
    const data = this.getChartData();
    this.barChart = new Chart(ctx, {
      type: 'bar',
      data: data,
      options: {
        scales: {
          yAxes: [
            {
              ticks: { beginAtZero: true },
              gridLines: {
                display: true,
              },
            },
          ],
          xAxes: [
            {
              gridLines: {
                display: false,
              },
            },
          ],
        },
        tooltips: {
          callbacks: {
            label: (tooltipItem, data) => {
              const label = data.datasets[tooltipItem.datasetIndex].label || '';
              const value = tooltipItem.yLabel;
              return `${label}: ${value} MAD`;
            },
          },
        },
        legend: {
          display: false,
        },
      },
    });
  }

  // Update the bar chart with the expense limit
  updateBarChart(): void {
    if (this.barChart) {
      const data = this.getChartData();
      this.barChart.data.labels = data.labels;
      this.barChart.data.datasets = data.datasets;
  
      // Remove the expense limit dataset if it exists
      this.barChart.data.datasets = this.barChart.data.datasets.filter(
        (dataset) => dataset.label !== 'Expense Limit'
      );
  
      // Add or update the red horizontal line for the expense limit (only for monthly data and not for "Income only" filter)
      if (
        this.timeFilter === 'month' &&
        this.expenseLimit !== null &&
        this.activeFilter !== 'income' // Do not show the line if the filter is "Income only"
      ) {
        const dataset = {
          label: 'Expense Limit',
          data: new Array(data.labels.length).fill(this.expenseLimit), // Fill all months with the same limit value
          borderColor: 'red',
          borderWidth: 2,
          type: 'line', // Use a line dataset
          fill: false, // Do not fill under the line
          pointRadius: 0, // Hide points
          order: 0, // Ensure the line is rendered on top of the bars
        };
  
        // Add the dataset to the chart
        this.barChart.data.datasets.push(dataset);
      }
  
      this.barChart.update();
    }
  }

  getChartData(): { labels: string[], datasets: any[] } {
    let labels: string[];
    let incomeData: number[];
    let expensesData: number[];
  
    switch (this.timeFilter) {
      case 'day':
  labels = ['00:00 - 06:00', '06:00 - 12:00', '12:00 - 18:00', '18:00 - 00:00'];
  incomeData = new Array(4).fill(0); // Initialize income data for 4 time intervals
  expensesData = new Array(4).fill(0); // Initialize expenses data for 4 time intervals

  // Fetch all transactions from the database
  this.apiService.getTransactions().subscribe(
    (transactions: any[]) => {
      // Get the current date (today)
      const today = new Date();
      const startOfDay = new Date(today);
      startOfDay.setHours(0, 0, 0, 0); // Start of the day (00:00:00)
      const endOfDay = new Date(today);
      endOfDay.setHours(23, 59, 59, 999); // End of the day (23:59:59.999)

      // Filter transactions for the current day
      transactions.forEach((transaction) => {
        const date = new Date(transaction.date_time);

        // Check if the transaction is within the current day
        if (date >= startOfDay && date <= endOfDay) {
          const hours = date.getHours(); // Get the hour of the transaction

          // Determine the time interval index
          let intervalIndex: number;
          if (hours >= 0 && hours < 6) {
            intervalIndex = 0; // 00:00 - 06:00
          } else if (hours >= 6 && hours < 12) {
            intervalIndex = 1; // 06:00 - 12:00
          } else if (hours >= 12 && hours < 18) {
            intervalIndex = 2; // 12:00 - 18:00
          } else {
            intervalIndex = 3; // 18:00 - 00:00
          }

          // Add the transaction amount to the appropriate interval
          if (transaction.type === 'Income') {
            incomeData[intervalIndex] += parseFloat(transaction.amount);
          } else if (transaction.type === 'Expense') {
            expensesData[intervalIndex] += parseFloat(transaction.amount);
          }
        }
      });

      // Update the chart with the new data
      if (this.barChart) {
        this.barChart.data.datasets[0].data = incomeData;
        this.barChart.data.datasets[1].data = expensesData;
        this.barChart.update();
      }
    },
    (error) => {
      console.error('Failed to fetch transactions:', error);
      this.notificationService.addNotification('Failed to fetch transactions. Please try again.'); // Add error notification
    }
  );
  break;
  case 'week':
    labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    incomeData = new Array(7).fill(0); // Initialize income data for 7 days
    expensesData = new Array(7).fill(0); // Initialize expenses data for 7 days
  
    // Fetch all transactions from the database
    this.apiService.getTransactions().subscribe(
      (transactions: any[]) => {
        // Define the start and end of the week (Monday to Sunday)
        const startDate = new Date('2025-01-06T00:00:00'); // Start of the week (Monday)
        const endDate = new Date('2025-01-12T23:59:59'); // End of the week (Sunday)
  
        // Filter transactions for the week (Monday to Sunday)
        transactions.forEach((transaction) => {
          const date = new Date(transaction.date_time);
  
          // Check if the transaction is within the week
          if (date >= startDate && date <= endDate) {
            const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
            const index = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Map to labels array (Mon = 0, Sun = 6)
  
            // Add the transaction amount to the appropriate day
            if (transaction.type === 'Income') {
              incomeData[index] += parseFloat(transaction.amount);
            } else if (transaction.type === 'Expense') {
              expensesData[index] += parseFloat(transaction.amount);
            }
          }
        });
  
        // Update the chart with the new data
        if (this.barChart) {
          this.barChart.data.datasets[0].data = incomeData;
          this.barChart.data.datasets[1].data = expensesData;
          this.barChart.update();
        }
      },
      (error) => {
        console.error('Failed to fetch transactions:', error);
        this.notificationService.addNotification('Failed to fetch transactions. Please try again.'); // Add error notification
      }
    );
    break;
      case 'month':
      default:
        labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
        // Initialize income and expenses arrays with zeros
        incomeData = new Array(12).fill(0);
        expensesData = new Array(12).fill(0);
  
        // Fetch all transactions from the database
        this.apiService.getTransactions().subscribe(
          (transactions: any[]) => {
            // Group transactions by month and calculate totals
            transactions.forEach((transaction) => {
              const date = new Date(transaction.date_time);
              const year = date.getFullYear();
              const month = date.getMonth(); // 0 = January, 11 = December
  
              // Only consider transactions from 2024
              if (year === 2024) {
                if (transaction.type === 'Income') {
                  incomeData[month] += parseFloat(transaction.amount);
                } else if (transaction.type === 'Expense') {
                  expensesData[month] += parseFloat(transaction.amount);
                }
              }
            });
  
            // Update the chart with the new data
            if (this.barChart) {
              this.barChart.data.datasets[0].data = incomeData;
              this.barChart.data.datasets[1].data = expensesData;
              this.barChart.update();
            }
          },
          (error) => {
            console.error('Failed to fetch transactions:', error);
            this.notificationService.addNotification('Failed to fetch transactions. Please try again.'); // Add error notification
          }
        );
        break;
    }
  
    return {
      labels: labels,
      datasets: [
        {
          label: 'Income',
          data: incomeData,
          backgroundColor: '#90EE90', // Light green
          hidden: this.activeFilter === 'expenses'
        },
        {
          label: 'Expenses',
          data: expensesData,
          backgroundColor: '#FF7F7F', // Light red
          hidden: this.activeFilter === 'income'
        }
      ]
    };
  }

  // Render the pie chart
  renderPieChart(): void {
    const ctx = document.getElementById('chart-pie') as HTMLCanvasElement;

    // Fetch all transactions from the database
    this.apiService.getTransactions().subscribe(
      (transactions: any[]) => {
        let filteredTransactions = transactions;

        // Filter transactions based on the selected time filter
        switch (this.pieChartTimeFilter) {
          case 'day':
            const today = new Date();
            const startOfDay = new Date(today);
            startOfDay.setHours(0, 0, 0, 0);
            const endOfDay = new Date(today);
            endOfDay.setHours(23, 59, 59, 999);
            filteredTransactions = transactions.filter((transaction) => {
              const date = new Date(transaction.date_time);
              return date >= startOfDay && date <= endOfDay;
            });
            break;

          case 'week':
            const startOfWeek = new Date('2024-01-06T00:00:00'); // Example: Start of the week (Monday)
            const endOfWeek = new Date('2024-01-12T23:59:59'); // Example: End of the week (Sunday)
            filteredTransactions = transactions.filter((transaction) => {
              const date = new Date(transaction.date_time);
              return date >= startOfWeek && date <= endOfWeek;
            });
            break;

          case 'month':
          default:
            filteredTransactions = transactions.filter((transaction) => {
              const date = new Date(transaction.date_time);
              return date.getFullYear() === 2024;
            });
            break;
        }

        // Group transactions by category and calculate totals
        const categoryTotals: { [key: string]: number } = {};

        filteredTransactions.forEach((transaction) => {
          if (transaction.type === 'Expense') {
            const category = transaction.category;
            const amount = parseFloat(transaction.amount);

            if (categoryTotals[category]) {
              categoryTotals[category] += amount;
            } else {
              categoryTotals[category] = amount;
            }
          }
        });

        // Convert to an array of { category, amount } objects
        const categoriesArray = Object.keys(categoryTotals).map((category) => ({
          category,
          amount: categoryTotals[category]
        }));

        // Sort by amount in descending order
        categoriesArray.sort((a, b) => b.amount - a.amount);

        // Calculate total expenses
        const totalExpenses = categoriesArray.reduce((sum, cat) => sum + cat.amount, 0);

        // Calculate percentage for each category and take the top 5
        this.topCategories = categoriesArray.slice(0, 5).map((cat) => ({
          category: cat.category,
          amount: cat.amount,
          percentage: ((cat.amount / totalExpenses) * 100).toFixed(2) + '%'
        }));

        // Extract labels and data for the pie chart
        const labels = this.topCategories.map((cat) => cat.category);
        const data = this.topCategories.map((cat) => cat.amount);

        // Define colors for the pie chart
        const backgroundColors = [
          '#FFD700', '#87CEEB', '#98FB98', '#FFA07A', '#DDA0DD', '#FF6347', '#40E0D0', '#FF69B4', '#7B68EE', '#00FA9A'
        ];

        // Create or update the pie chart
        if (this.pieChart) {
          this.pieChart.data.labels = labels;
          this.pieChart.data.datasets[0].data = data;
          this.pieChart.data.datasets[0].backgroundColor = backgroundColors.slice(0, labels.length);
          this.pieChart.update();
        } else {
          this.pieChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
              labels: labels,
              datasets: [{
                data: data,
                backgroundColor: backgroundColors.slice(0, labels.length)
              }]
            },
            options: {
              responsive: true,
              legend: { display: false },
              tooltips: { enabled: false },
              elements: {
                arc: {
                  borderWidth: 0
                }
              },
              onHover: (event, elements) => {
                if (elements && elements.length > 0) {
                  const index = elements[0]._index;
                  const label = labels[index];
                  const value = data[index];
                  const percentage = ((value / totalExpenses) * 100).toFixed(2);

                  // Update the dynamic text inside the ring
                  document.getElementById('pie-chart-percentage').textContent = `${percentage}%`;
                  document.getElementById('pie-chart-label').textContent = label;
                }
              }
            }
          });
        }
      },
      (error) => {
        console.error('Failed to fetch transactions:', error);
        this.notificationService.addNotification('Failed to fetch transactions. Please try again.');
      }
    );
  }


  // Handle Quick Transaction Form Submission
onSubmitQuickTransaction(): void {
  const transactionData = {
    category: this.quickTransaction.category,
    amount: this.quickTransaction.amount,
    date_time: new Date().toISOString(), // Use current date and time
    type: this.quickTransaction.type
  };

  this.apiService.createTransaction(transactionData).subscribe(
    (response) => {
      console.log('Transaction added successfully:', response);
      this.notificationService.addNotification('Transaction added successfully!'); // Add notification
      this.resetQuickTransactionForm();
      this.fetchAllTransactions(); // Refresh transactions and metrics
    },
    (error) => {
      console.error('Error adding transaction:', error);
      alert('Failed to add transaction. Please try again.');
    }
  );
}

  // Reset Quick Transaction Form
  resetQuickTransactionForm(): void {
    this.quickTransaction = {
      category: '',
      amount: null,
      type: 'Expense'
    };
  }
}