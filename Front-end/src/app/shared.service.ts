import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SharedService {
  private expenseLimitSubject = new BehaviorSubject<number | null>(null);
  expenseLimit$ = this.expenseLimitSubject.asObservable();

  private userSubject = new BehaviorSubject<any>(null);
  user$ = this.userSubject.asObservable();

  private expenseDataSubject = new BehaviorSubject<any[]>([]); // New BehaviorSubject for expense data
  expenseData$ = this.expenseDataSubject.asObservable();

  setExpenseLimit(limit: number): void {
    this.expenseLimitSubject.next(limit);
  }

  setUser(user: any): void {
    this.userSubject.next(user);
  }

  // Method to set expense data
  setExpenseData(data: any[]): void {
    this.expenseDataSubject.next(data);
  }

  // Method to get expense data
  getExpenseData(): any[] {
    return this.expenseDataSubject.getValue();
  }

}