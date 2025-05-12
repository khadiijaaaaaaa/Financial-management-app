import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service'; // Import AuthService

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private baseUrl = 'http://localhost:8000/api';

  constructor(private http: HttpClient, private authService: AuthService) {} // Inject AuthService

  // Helper method to get headers with token
  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken(); // Get the token from AuthService
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    });
  }

  // Register a new user
  register(userData: {
    name: string;
    email: string;
    password: string;
    profile_picture?: File | null;
    total_balance?: number;
    gender?: string;
    birthdate?: string;
    city?: string;
    country?: string;
  }): Observable<any> {
    const formData = new FormData();
    formData.append('name', userData.name);
    formData.append('email', userData.email);
    formData.append('password', userData.password);
    if (userData.profile_picture) {
      formData.append('profile_picture', userData.profile_picture);
    }
    if (userData.total_balance) {
      formData.append('total_balance', userData.total_balance.toString());
    }
    if (userData.gender) {
      formData.append('gender', userData.gender);
    }
    if (userData.birthdate) {
      formData.append('birthdate', userData.birthdate);
    }
    if (userData.city) {
      formData.append('city', userData.city);
    }
    if (userData.country) {
      formData.append('country', userData.country);
    }

    return this.http.post(`${this.baseUrl}/register`, formData);
  }

  // Login a user
  login(credentials: { email: string; password: string }): Observable<any> {
    return this.http.post(`${this.baseUrl}/login`, credentials);
  }

  // Get the authenticated user
  getUser(): Observable<any> {
    const headers = this.getAuthHeaders(); // Add headers with token
    return this.http.get(`${this.baseUrl}/user`, { headers });
  }

  // Logout the user
  logout(): Observable<any> {
    const headers = this.getAuthHeaders(); // Add headers with token
    return this.http.post(`${this.baseUrl}/logout`, {}, { headers });
  }

  // Update the authenticated user's profile
  updateUser(userData: FormData): Observable<any> {
  const headers = new HttpHeaders({
    'Authorization': `Bearer ${this.authService.getToken()}`,
    // Do NOT set 'Content-Type' here; let the browser set it automatically for FormData
  });

  return this.http.put(`${this.baseUrl}/user`, userData, { headers });
}

  // Update the authenticated user's password
  updatePassword(passwordData: {
    current_password: string;
    new_password: string;
  }): Observable<any> {
    const headers = this.getAuthHeaders(); // Add headers with token
    return this.http.put(`${this.baseUrl}/user/password`, passwordData, { headers });
  }

  // Delete the authenticated user's account
  deleteUser(): Observable<any> {
    const headers = this.getAuthHeaders(); // Add headers with token
    return this.http.delete(`${this.baseUrl}/user`, { headers });
  }

  // Get all transactions for the authenticated user
  getTransactions(): Observable<any> {
    const headers = this.getAuthHeaders(); // Add headers with token
    return this.http.get(`${this.baseUrl}/transactions`, { headers });
  }

  // Create a new transaction
  createTransaction(transactionData: {
    category: string;
    amount: number;
    date_time?: string;
    type: string;
  }): Observable<any> {
    const headers = this.getAuthHeaders(); // Add headers with token
    return this.http.post(`${this.baseUrl}/transactions`, transactionData, { headers });
  }

  // Get a specific transaction
  getTransaction(id: number): Observable<any> {
    const headers = this.getAuthHeaders(); // Add headers with token
    return this.http.get(`${this.baseUrl}/transactions/${id}`, { headers });
  }

  // Update a specific transaction
  updateTransaction(
    id: number,
    transactionData: {
      category?: string;
      amount?: number;
      date_time?: string;
      type?: string;
    }
  ): Observable<any> {
    const headers = this.getAuthHeaders(); // Add headers with token
    return this.http.put(`${this.baseUrl}/transactions/${id}`, transactionData, { headers });
  }

  // Delete a specific transaction
  deleteTransaction(id: number): Observable<any> {
    const headers = this.getAuthHeaders(); // Add headers with token
    return this.http.delete(`${this.baseUrl}/transactions/${id}`, { headers });
  }

  // Get the authenticated user's settings
  getSettings(): Observable<any> {
    const headers = this.getAuthHeaders(); // Add headers with token
    return this.http.get(`${this.baseUrl}/settings`, { headers });
  }

  // Update the authenticated user's settings
  updateSettings(settingsData: {
    total_balance?: number;
    gender?: string;
    birthdate?: string;
    city?: string;
    country?: string;
  }): Observable<any> {
    const headers = this.getAuthHeaders(); // Add headers with token
    return this.http.put(`${this.baseUrl}/settings`, settingsData, { headers });
  }

  // Submit a support request
  submitSupport(message: { message: string }): Observable<any> {
    const headers = this.getAuthHeaders(); // Add headers with token
    return this.http.post(`${this.baseUrl}/support`, message, { headers });
  }

  // Submit a contact form
  submitContact(contactData: {
    name: string;
    email: string;
    message: string;
  }): Observable<any> {
    const headers = this.getAuthHeaders(); // Add headers with token
    return this.http.post(`${this.baseUrl}/contact`, contactData, { headers });
  }

  uploadProfilePicture(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('profile_picture', file);
  
    return this.http.post(`${this.baseUrl}/upload-profile-picture`, formData);
  }
}