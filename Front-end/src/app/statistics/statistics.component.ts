import { Component, OnInit } from '@angular/core';
import Chart from 'chart.js';
import { ApiService } from '../api.service'; // Import ApiService
import { NotificationService } from '../notification.service'; // Import NotificationService

@Component({
  selector: 'app-statistics',
  templateUrl: './statistics.component.html',
  styleUrls: ['./statistics.component.scss']
})
export class StatisticsComponent implements OnInit {
  activeFilter = 'both';
  timeFilter = 'month';

  private pieChart: Chart;
  private lineChart: Chart; // Declare lineChart property
  private horizontalBarChart: Chart

  // Add topCategories for pie chart
  topCategories: { category: string, amount: number, percentage: string }[] = [];

  constructor(
    private apiService: ApiService, // Inject ApiService
    private notificationService: NotificationService // Inject NotificationService
  ) {}

  ngOnInit(): void {
    this.renderLineChart();
    this.renderPieChart();
    this.renderHorizontalBarChart();
  }

  setFilter(filter: string): void {
    this.activeFilter = filter;
    this.updateLineChart();
  }

  setTimeFilter(filter: string): void {
    this.timeFilter = filter;
    this.updateLineChart();
  }

  renderLineChart(): void {
    const ctx = document.getElementById('chart-line') as HTMLCanvasElement;
    const data = this.getLineChartData();
    this.lineChart = new Chart(ctx, { // Store the chart instance in lineChart
      type: 'line',
      data: data,
      options: {
        scales: {
          yAxes: [
            {
              ticks: { beginAtZero: true },
              gridLines: {
                display: true, // Keep horizontal grid lines
              },
            },
          ],
          xAxes: [
            {
              gridLines: {
                display: false, // Remove vertical grid lines
              },
            },
          ],
        },
        legend: {
          display: false
        }
      }
    });
  }

  updateLineChart(): void {
    const data = this.getLineChartData();
    if (this.lineChart) {
      this.lineChart.data = data;
      this.lineChart.update();
    }
  }

  getLineChartData(): { labels: string[], datasets: any[] } {
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
            if (this.lineChart) {
              this.lineChart.data.datasets[0].data = incomeData;
              this.lineChart.data.datasets[1].data = expensesData;
              this.lineChart.update();
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
            // Get the start and end of the current week (Monday to Sunday)
            const today = new Date();
            const startOfWeek = new Date(today);
            startOfWeek.setDate(today.getDate() - today.getDay() + 1); // Start of the week (Monday)
            startOfWeek.setHours(0, 0, 0, 0); // Start of the day (00:00:00)
            const endOfWeek = new Date(today);
            endOfWeek.setDate(today.getDate() - today.getDay() + 7); // End of the week (Sunday)
            endOfWeek.setHours(23, 59, 59, 999); // End of the day (23:59:59.999)
  
            // Filter transactions for the current week
            transactions.forEach((transaction) => {
              const date = new Date(transaction.date_time);
  
              // Check if the transaction is within the current week
              if (date >= startOfWeek && date <= endOfWeek) {
                const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
                const index = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Map to labels array (Mon = 0, Sun = 6)
  
                if (transaction.type === 'Income') {
                  incomeData[index] += parseFloat(transaction.amount);
                } else if (transaction.type === 'Expense') {
                  expensesData[index] += parseFloat(transaction.amount);
                }
              }
            });
  
            // Update the chart with the new data
            if (this.lineChart) {
              this.lineChart.data.datasets[0].data = incomeData;
              this.lineChart.data.datasets[1].data = expensesData;
              this.lineChart.update();
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
            if (this.lineChart) {
              this.lineChart.data.datasets[0].data = incomeData;
              this.lineChart.data.datasets[1].data = expensesData;
              this.lineChart.update();
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
          borderColor: '#90EE90', // Light green
          fill: false,
          hidden: this.activeFilter === 'expenses'
        },
        {
          label: 'Expenses',
          data: expensesData,
          borderColor: '#FF7F7F', // Light red
          fill: false,
          hidden: this.activeFilter === 'income'
        }
      ]
    };
  }

  renderPieChart(): void {
    const ctx = document.getElementById('chart-pie') as HTMLCanvasElement;
  
    // Fetch all transactions from the database
    this.apiService.getTransactions().subscribe(
      (transactions: any[]) => {
        // Filter transactions for the year 2024
        const filteredTransactions = transactions.filter((transaction) => {
          const date = new Date(transaction.date_time);
          return date.getFullYear() === 2024 && transaction.type === 'Expense';
        });
  
        // Group transactions by category and calculate totals
        const categoryTotals: { [key: string]: number } = {};
  
        filteredTransactions.forEach((transaction) => {
          const category = transaction.category;
          const amount = parseFloat(transaction.amount);
  
          if (categoryTotals[category]) {
            categoryTotals[category] += amount;
          } else {
            categoryTotals[category] = amount;
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
          percentage: ((cat.amount / totalExpenses) * 100).toFixed(2)
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
              cutoutPercentage: 60, // Adjust the inner diameter (60% means 40% hole)
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
  
        // Update the horizontal bar chart with the same data
        this.renderHorizontalBarChart();
      },
      (error) => {
        console.error('Failed to fetch transactions:', error);
        this.notificationService.addNotification('Failed to fetch transactions. Please try again.');
      }
    );
  }

  renderHorizontalBarChart(): void {
    const ctx = document.getElementById('chart-bar-horizontal') as HTMLCanvasElement;
  
    // Use the same data as the pie chart
    const labels = this.topCategories.map((cat) => cat.category);
    const percentages = this.topCategories.map((cat) => parseFloat(cat.percentage));
  
    // Define colors for the bar chart
    const backgroundColors = [
      '#FFD700', '#87CEEB', '#98FB98', '#FFA07A', '#DDA0DD', '#FF6347', '#40E0D0', '#FF69B4', '#7B68EE', '#00FA9A'
    ];
  
    // Create or update the horizontal bar chart
    if (this.horizontalBarChart) {
      this.horizontalBarChart.data.labels = labels;
      this.horizontalBarChart.data.datasets[0].data = percentages;
      this.horizontalBarChart.data.datasets[0].backgroundColor = backgroundColors.slice(0, labels.length);
      this.horizontalBarChart.update();
    } else {
      this.horizontalBarChart = new Chart(ctx, {
        type: 'horizontalBar',
        data: {
          labels: labels,
          datasets: [{
            label: 'Percentage',
            data: percentages,
            backgroundColor: backgroundColors.slice(0, labels.length)
          }]
        },
        options: {
          scales: {
            yAxes: [
              {
                ticks: { beginAtZero: true },
                gridLines: {
                  display: false, // Keep horizontal grid lines
                },
              },
            ],
            xAxes: [
              {
                ticks: {
                  beginAtZero: true,
                  callback: (value) => `${value}%` // Add percentage sign to x-axis labels
                },
                gridLines: {
                  display: false, // Remove vertical grid lines
                },
              },
            ],
          },
          legend: { display: false },
          tooltips: {
            callbacks: {
              label: (tooltipItem, data) => {
                const label = data.labels[tooltipItem.index];
                const value = data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index];
                return `${label}: ${value}%`;
              }
            }
          }
        }
      });
    }
  }
}