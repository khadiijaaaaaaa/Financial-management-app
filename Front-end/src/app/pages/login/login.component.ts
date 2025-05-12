import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../../api.service'; // Update the path to your ApiService
import { AuthService } from '../../auth.service'; // Update the path to your AuthService

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  email: string = '';
  password: string = '';
  errorMessage: string = '';

  constructor(
    private router: Router,
    private apiService: ApiService,
    private authService: AuthService
  ) {}

  ngOnInit() {}

  onLogin() {
    // Reset error message
    this.errorMessage = '';

    // Call the login API
    this.apiService.login({ email: this.email, password: this.password }).subscribe(
      (response: any) => {
        // Save the token to localStorage
        this.authService.setToken(response.token);

        // Navigate to the dashboard
        this.router.navigate(['/dashboard']);
      },
      (error) => {
        // Handle incorrect credentials
        if (error.status === 401) {
          this.errorMessage = 'Incorrect email or password. Please try again.';
        } else {
          this.errorMessage = 'An error occurred. Please try again later.';
        }
      }
    );
  }
}