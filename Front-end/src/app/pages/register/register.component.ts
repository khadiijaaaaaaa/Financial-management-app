import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../../api.service';
@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent {
  userData = {
    name: '',
    email: '',
    password: '',
    profile_picture: null as File | null,
    total_balance: 0,
    gender: '',
    birthdate: '',
    city: '',
    country: '',
  };

  selectedFile: File | null = null; // Store the selected file
  imagePreview: string | ArrayBuffer | null = null; // Store the image preview URL

  constructor(private apiService: ApiService, private router: Router) {}

  onRegister() {
    if (this.selectedFile) {
      this.userData.profile_picture = this.selectedFile;
    }

    this.apiService.register(this.userData).subscribe(
      (response: any) => {
        this.router.navigate(['/dashboard']); // Navigate to the dashboard page after successful registration
      },
      (error) => {
        console.error('Registration failed', error);
      }
    );
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];

      // Display image preview
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result;
      };
      reader.readAsDataURL(this.selectedFile);
    }
  }
}