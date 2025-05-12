import { Component, OnInit, ElementRef } from '@angular/core';
import { ROUTES } from '../sidebar/sidebar.component';
import { Location } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { NotificationService } from '../../notification.service'; // Import NotificationService
import { ApiService } from '../../api.service'; // Import ApiService
import { TranslateService } from '@ngx-translate/core'; // Import TranslateService
import { SharedService } from '../../shared.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
})
export class NavbarComponent implements OnInit {
  public focus;
  public listTitles: any[];
  public location: Location;
  isDarkMode = false;
  notifications: { message: string; viewed: boolean }[] = [];
  notificationsOpen = false; // Add this variable to control dropdown visibility
  activeSection: string = 'overview';
  currentRouteTitle: string = 'Dashboard'; // Default title
  user: any = {}; // Add a user object to store user data
  inputValue: string = '';

  // Map routes to their corresponding titles
  routeTitles = {
    dashboard: 'Dashboard',
    statistics: 'Statistics',
    activity: 'Activity',
    'new-transaction': 'New Transaction',
    settings: 'Settings',
    support: 'Support',
    privacy: 'Privacy',
    'about-us': 'About Us',
    'contact-us': 'Contact Us',
  };

  constructor(
    location: Location,
    private element: ElementRef,
    private router: Router,
    private notificationService: NotificationService, // Inject NotificationService
    private apiService: ApiService, // Inject ApiService
    private translate: TranslateService,
    private sharedService: SharedService
  ) {
    this.location = location;
    this.translate.setDefaultLang('en');
  }

  ngOnInit() {
    // Subscribe to notifications
    this.notificationService.notifications$.subscribe((notifications) => {
      this.notifications = notifications; // Update notifications array
    });

    // Listen to route changes to update the title
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        // Extract the route path (e.g., 'dashboard', 'statistics')
        const routePath = event.url.split('/')[1] || 'dashboard';
        // Update the title based on the route
        this.currentRouteTitle = this.routeTitles[routePath] || 'Dashboard';
      });

      this.fetchUserData(); // Fetch user data when the component initializes

      // Subscribe to user updates from SharedService
    this.sharedService.user$.subscribe((user) => {
      if (user) {
        this.user.name = user.name;
        this.user.email = user.email;
      }
    });
  }

  // Change language
  changeLanguage(lang: string): void {
    this.translate.use(lang); // Switch to the selected language
  }

  // Add this method to handle input changes
  onInputChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.inputValue = target.value;
  }

  // Handle Enter button click
  onEnterClick(): void {
    const limit = parseFloat(this.inputValue);
    if (!isNaN(limit)) {
      this.sharedService.setExpenseLimit(limit); // Emit the value to the shared service
    }
  }

  fetchUserData() {
    this.apiService.getUser().subscribe(
      (user: any) => {
        this.user = user;
        if (this.user.profile_picture) {
          this.user.profile_picture = this.user.profile_picture.startsWith('http')
            ? this.user.profile_picture
            : `/storage/${this.user.profile_picture}`;
        }
      },
      (error) => {
        console.error('Failed to fetch user data', error);
      }
    );
  } 

  // Method to handle dropdown toggle
  onDropdownToggle(isOpen: boolean): void {
    if (isOpen) {
      this.notificationService.markNotificationsAsViewed(); // Mark notifications as viewed when dropdown is opened
    }
  }

  // Get the count of unviewed notifications
  getUnviewedNotificationsCount(): number {
    return this.notifications.filter((n) => !n.viewed).length;
  }

  getTitle() {
    return this.currentRouteTitle;
  }

  toggleTheme(): void {
    this.isDarkMode = !this.isDarkMode;
    document.body.classList.toggle('dark-theme', this.isDarkMode);
  }

  toggleNotifications(): void {
    this.notificationsOpen = !this.notificationsOpen; // Toggle the visibility of the notifications dropdown
  }

  deleteAccount(): void {
    if (confirm('Are you sure you want to delete your account?')) {
      // Call API to delete account
      this.router.navigate(['/login']);
    }
  }

  logout(): void {
    // Call API to logout
    this.router.navigate(['/login']);
  }
}