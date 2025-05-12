import { Component } from '@angular/core';
import { NotificationService } from '../notification.service'; // Import NotificationService

@Component({
  selector: 'app-contact-us',
  templateUrl: './contact-us.component.html',
  styleUrls: ['./contact-us.component.scss']
})
export class ContactUsComponent {
  constructor(private notificationService: NotificationService) {} // Inject NotificationService

  onSubmit() {
    // Display a success notification
    this.notificationService.addNotification('Message sent!');
  }
}