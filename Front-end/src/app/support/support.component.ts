import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-support',
  templateUrl: './support.component.html',
  styleUrls: ['./support.component.scss']
})
export class SupportComponent {
  questions = [
    {
      question: 'How do I reset my password?',
      answer: 'You can reset your password by clicking on the "Forgot Password" link on the login page.',
      isOpen: false
    },
    {
      question: 'How can I update my profile information?',
      answer: 'You can update your profile information by navigating to the "Profile" section in your account settings.',
      isOpen: false
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept credit cards, PayPal, and bank transfers.',
      isOpen: false
    },
    {
      question: 'How do I contact customer support?',
      answer: 'You can contact customer support by emailing support@example.com or using the contact form on this page.',
      isOpen: false
    },
    {
      question: 'Is there a mobile app available?',
      answer: 'Yes, you can download our mobile app from the App Store or Google Play.',
      isOpen: false
    },
    {
      question: 'How do I cancel my subscription?',
      answer: 'You can cancel your subscription by going to the "Billing" section in your account settings.',
      isOpen: false
    },
    {
      question: 'What is your refund policy?',
      answer: 'We offer a 30-day money-back guarantee for all subscriptions.',
      isOpen: false
    },
    {
      question: 'How do I change my email address?',
      answer: 'You can change your email address in the "Account Settings" section.',
      isOpen: false
    },
    {
      question: 'How do I report a bug?',
      answer: 'You can report a bug by emailing bugs@example.com or using the "Report a Bug" feature in the app.',
      isOpen: false
    },
    {
      question: 'How do I upgrade my plan?',
      answer: 'You can upgrade your plan by visiting the "Billing" section in your account settings.',
      isOpen: false
    }
  ];

  constructor(private router: Router) {}

  // Toggle the answer for a question
  toggleAnswer(index: number): void {
    this.questions[index].isOpen = !this.questions[index].isOpen;
  }

  // Navigate to the contact section
  navigateToContact(): void {
    this.router.navigate(['/contact-us']);
  }
}