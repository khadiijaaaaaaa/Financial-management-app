import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../api.service'; // Update the path to your ApiService
import { AuthService } from '../auth.service'; // Update the path to your AuthService
import { NotificationService } from '../notification.service'; // Import NotificationService
import { SharedService } from '../shared.service'; // Import SharedService

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
})
export class SettingsComponent implements OnInit {
  user = {
    id: '', // Add user ID for deletion
    name: '',
    email: '',
    firstName: '',
    lastName: '',
    password: '',
    profilePicture: null,
    totalBalance: 0,
    gender: 'Male',
    birthdate: '',
    city: '',
    country: '',
  };

  constructor(
    private apiService: ApiService,
    private authService: AuthService,
    private router: Router,
    private notificationService: NotificationService, // Inject NotificationService
    private sharedService: SharedService
  ) {}

  ngOnInit(): void {
    // Load user data from a service or API
    this.loadUserData();
  }

  // Load user data
  loadUserData(): void {
    this.apiService.getUser().subscribe(
      (response: any) => {
        this.user = {
          id: response.id,
          name: response.name,
          email: response.email,
          firstName: response.firstName,
          lastName: response.lastName,
          password: '', // Password is not fetched for security reasons
          profilePicture: response.profile_picture,
          totalBalance: response.total_balance,
          gender: response.gender,
          birthdate: response.birthdate,
          city: response.city,
          country: response.country,
        };
      },
      (error) => {
        console.error('Failed to load user data:', error);
      }
    );
  }

  // Handle file input change for profile picture
  onFileChange(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.user.profilePicture = file;
      const reader = new FileReader();
      reader.onload = () => {
        const preview = document.getElementById('profilePicturePreview') as HTMLImageElement;
        if (preview) {
          preview.src = reader.result as string;
        }
      };
      reader.readAsDataURL(file);
    }
  }

  onSubmit(): void {
    const formData = new FormData();

    // Append all fields to formData
    formData.append('name', this.user.name);
    formData.append('email', this.user.email);
    if (this.user.password) {
      formData.append('password', this.user.password);
    }
    if (this.user.profilePicture) {
      formData.append('profile_picture', this.user.profilePicture);
    }
    formData.append('total_balance', this.user.totalBalance.toString());
    formData.append('gender', this.user.gender);
    formData.append('birthdate', this.user.birthdate);
    formData.append('city', this.user.city);
    formData.append('country', this.user.country);

    // Call the API to update user data
    this.apiService.updateUser(formData).subscribe(
      (response: any) => {
        console.log('User updated successfully:', response);
        this.notificationService.addNotification('Information updated successfully!'); // Add success notification
        // Update the user data in SharedService
        this.sharedService.setUser({
          name: this.user.name,
          email: this.user.email,
        });
        this.loadUserData(); // Refresh user data after successful update
      },
      (error) => {
        console.error('Failed to save settings:', error);
        this.notificationService.addNotification('Failed to update information. Please try again.'); // Add error notification
      }
    );
  }

  // Handle logout
  logout(): void {
    if (confirm('Are you sure you want to logout?')) {
      this.apiService.logout().subscribe(
        () => {
          this.authService.logout(); // Clear token and session
          this.router.navigate(['/login']); // Redirect to login page
        },
        (error) => {
          console.error('Failed to logout:', error);
        }
      );
    }
  }

  // Handle account deletion
  deleteAccount(): void {
    if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      this.apiService.deleteUser().subscribe(
        () => {
          this.authService.logout(); // Clear token and session
          this.router.navigate(['/register']); // Redirect to register page
        },
        (error) => {
          console.error('Failed to delete account:', error);
        }
      );
    }
  }
}