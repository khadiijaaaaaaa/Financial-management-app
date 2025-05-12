import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  // BehaviorSubject to hold the list of notifications
  private notificationsSubject = new BehaviorSubject<{ message: string; viewed: boolean }[]>([]);

  // Observable to allow components to subscribe to notifications
  notifications$ = this.notificationsSubject.asObservable();

  constructor() {}

  // Method to add a new notification
  addNotification(message: string): void {
    const currentNotifications = this.notificationsSubject.value; // Get current notifications
    const newNotification = { message, viewed: false }; // Create a new notification object
    this.notificationsSubject.next([...currentNotifications, newNotification]); // Update notifications
  }

  // Method to mark all notifications as viewed
  markNotificationsAsViewed(): void {
    const currentNotifications = this.notificationsSubject.value;
    const updatedNotifications = currentNotifications.map((notification) => ({
      ...notification,
      viewed: true, // Mark all notifications as viewed
    }));
    this.notificationsSubject.next(updatedNotifications); // Update notifications
  }

  // Method to clear all notifications
  clearNotifications(): void {
    this.notificationsSubject.next([]); // Reset notifications to an empty array
  }
}