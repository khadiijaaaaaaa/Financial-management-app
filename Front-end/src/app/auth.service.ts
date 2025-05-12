import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(private router: Router) {}

  // Save the token to localStorage
  setToken(token: string): void {
    localStorage.setItem('token', token);
  }

  // Get the token from localStorage
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  // Check if the user is logged in
  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  // Logout the user
  logout(): void {
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
  }
}