  import { Component, OnInit } from '@angular/core';
  import { FormBuilder, FormGroup, Validators } from '@angular/forms';
  import { MatSnackBar } from '@angular/material/snack-bar';
  import { AuthService } from '../../auth/auth.service';
  import { LocationData } from '../../shared/components/location-dialog/location-dialog.component';


  export interface SettingSection {
    title: string;
    icon: string;
    expanded: boolean;
    formGroup: FormGroup;
    fields: SettingField[];
    showLocationPicker?: boolean; 
  }

  export interface SettingField {
    name: string;
    label: string;
    type: 'text' | 'email' | 'password' | 'tel' | 'select' | 'toggle' | 'file';
    required?: boolean;
    options?: { value: any; label: string }[];
    disabled?: boolean;
    hint?: string;
    minLength?: number;
    maxLength?: number;
    pattern?: string;
  }

  @Component({
    selector: 'app-settings',
    templateUrl: './settings.component.html',
    styleUrls: ['./settings.component.scss']
  })
  export class SettingsComponent implements OnInit {
    settingsSections: SettingSection[] = [];
    loading = false;
    selectedFile: File | null = null;
    profileImage: string | ArrayBuffer | null = null;
    isLocating = false; 


    constructor(
      private fb: FormBuilder,
      private authService: AuthService,
      private snackBar: MatSnackBar
    ) {}

     ngOnInit(): void {
    this.initializeSettings();
  }

    openLocationPicker(section: SettingSection) {
      section.showLocationPicker = true;
    }

    closeLocationPicker(section: SettingSection) {
      section.showLocationPicker = false;
    }

    onLocationSelected(location: LocationData, section: SettingSection) {
      section.formGroup.get('location')?.setValue(location.address);
      section.showLocationPicker = false;
    }

    getCurrentLocation(formGroup: FormGroup): void {
      if (!navigator.geolocation) {
        this.snackBar.open('Geolocation is not supported by your browser', 'Dismiss', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
        return;
      }

      this.isLocating = true;
      const locationControl = formGroup.get('location');
      
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          this.getAddressFromCoords(latitude, longitude)
            .then(address => {
              locationControl?.setValue(address);
              this.isLocating = false;
            })
            .catch(() => {
              locationControl?.setValue(`${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
              this.isLocating = false;
            });
        },
        (error) => {
          this.isLocating = false;
          let errorMessage = 'Unable to retrieve your location';
          switch(error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Location access was denied. Please enable location services in your browser settings.';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Location information is unavailable.';
              break;
            case error.TIMEOUT:
              errorMessage = 'The request to get user location timed out.';
              break;
          }
          this.snackBar.open(errorMessage, 'Dismiss', { duration: 5000, panelClass: ['error-snackbar'] });
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    }

    private async getAddressFromCoords(lat: number, lng: number): Promise<string> {
      try {
        const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=YOUR_GOOGLE_MAPS_API_KEY`);
        const data = await response.json();
        if (data.status === 'OK' && data.results?.length) {
          return data.results[0].formatted_address;
        }
        throw new Error('No address found');
      } catch (error) {
        throw error;
      }
    }


    private initializeSettings(): void {
      this.settingsSections = [
        {
          title: 'Profile',
          icon: 'person',
          expanded: true,
          formGroup: this.fb.group({
            username: ['', [Validators.required, Validators.minLength(3)]],
            email: ['', [Validators.required, Validators.email]],
            phone: ['', [Validators.pattern('^[0-9+\-\s()]*$')]],
            location: [''],
            bio: [''],
            website: ['', Validators.pattern('https?://.+')]
          }),
          fields: [
            { name: 'username', label: 'Username', type: 'text', required: true, minLength: 3 },
            { name: 'email', label: 'Email', type: 'email', required: true },
            { name: 'phone', label: 'Phone Number', type: 'tel', hint: 'Include country code', pattern: '^[0-9+\-\s()]*$' },
            { name: 'location', label: 'Location', type: 'text' },
            { name: 'bio', label: 'Bio', type: 'text' },
            { name: 'website', label: 'Website', type: 'text', pattern: 'https?://.+' }
          ]
        },
        {
          title: 'Security',
          icon: 'security',
          expanded: false,
          formGroup: this.fb.group({
            currentPassword: ['', [Validators.minLength(8)]],
            newPassword: ['', [Validators.minLength(8)]],
            confirmPassword: ['', [Validators.minLength(8)]],
            twoFactorAuth: [false],
            loginAlerts: [true],
            showRecentActivity: [true]
          }, { validators: this.passwordMatchValidator }),
          fields: [
            { name: 'currentPassword', label: 'Current Password', type: 'password', minLength: 8 },
            { name: 'newPassword', label: 'New Password', type: 'password', minLength: 8 },
            { name: 'confirmPassword', label: 'Confirm New Password', type: 'password', minLength: 8 },
            //{ name: 'twoFactorAuth', label: 'Two-Factor Authentication', type: 'toggle' },
            //{ name: 'loginAlerts', label: 'Login Alerts', type: 'toggle' },
            //{ name: 'showRecentActivity', label: 'Show Recent Activity', type: 'toggle' }
          ]
        },
        /*
        {
          title: 'Preferences',
          icon: 'settings',
          expanded: false,
          formGroup: this.fb.group({
            language: ['en'],
            theme: ['light'],
            timezone: ['UTC'],
            dateFormat: ['MM/DD/YYYY'],
            timeFormat: ['12h'],
            itemsPerPage: [10]
          }),
          fields: [
            {
              name: 'language',
              label: 'Language',
              type: 'select',
              options: [
                { value: 'en', label: 'English' },
                { value: 'fr', label: 'Français' },
                { value: 'es', label: 'Español' },
                { value: 'ar', label: 'العربية' }
              ]
            },
            {
              name: 'theme',
              label: 'Theme',
              type: 'select',
              options: [
                { value: 'light', label: 'Light' },
                { value: 'dark', label: 'Dark' },
                { value: 'system', label: 'System Default' }
              ]
            },
            {
              name: 'timezone',
              label: 'Timezone',
              type: 'select',
              options: [
                { value: 'UTC', label: 'UTC' },
                { value: 'EST', label: 'Eastern Time (EST)' },
                { value: 'CET', label: 'Central European Time (CET)' },
                { value: 'GMT+1', label: 'Greenwich Mean Time (GMT+1)' }
              ]
            },
            {
              name: 'dateFormat',
              label: 'Date Format',
              type: 'select',
              options: [
                { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY' },
                { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY' },
                { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD' },
                { value: 'MMM D, YYYY', label: 'MMM D, YYYY' }
              ]
            },
            {
              name: 'timeFormat',
              label: 'Time Format',
              type: 'select',
              options: [
                { value: '12h', label: '12-hour' },
                { value: '24h', label: '24-hour' }
              ]
            },
            {
              name: 'itemsPerPage',
              label: 'Items Per Page',
              type: 'select',
              options: [
                { value: 10, label: '10 items' },
                { value: 25, label: '25 items' },
                { value: 50, label: '50 items' },
                { value: 100, label: '100 items' }
              ]
            }
          ]
        },*/

        /*
        {
          title: 'Privacy',
          icon: 'privacy_tip',
          expanded: false,
          formGroup: this.fb.group({
            profileVisibility: ['public'],
            showEmail: [false],
            showPhone: [false],
            showLocation: [false],
            dataSharing: [false],
            personalizedAds: [false],
            activityStatus: [true]
          }),
          fields: [
            {
              name: 'profileVisibility',
              label: 'Profile Visibility',
              type: 'select',
              options: [
                { value: 'public', label: 'Public' },
                { value: 'connections', label: 'Connections Only' },
                { value: 'private', label: 'Private' }
              ]
            },
            { name: 'showEmail', label: 'Show Email Address', type: 'toggle' },
            { name: 'showPhone', label: 'Show Phone Number', type: 'toggle' },
            { name: 'showLocation', label: 'Show Location', type: 'toggle' },
            { name: 'dataSharing', label: 'Allow Data Sharing', type: 'toggle' },
            { name: 'personalizedAds', label: 'Personalized Ads', type: 'toggle' },
            { name: 'activityStatus', label: 'Show Activity Status', type: 'toggle' }
          ]
        }
        */
      ];
    }

    toggleSection(section: SettingSection): void {
      section.expanded = !section.expanded;
    }

    onFileSelected(event: any): void {
      const file = event.target.files[0];
      if (file) {
        this.selectedFile = file;
        const reader = new FileReader();
        reader.onload = () => {
          this.profileImage = reader.result;
        };
        reader.readAsDataURL(file);
      }
    }

    saveSection(section: SettingSection): void {
      if (section.formGroup.invalid) {
        section.formGroup.markAllAsTouched();
        return;
      }
      
      this.loading = true;
      // In a real app, you would call your API to save these settings
      setTimeout(() => {
        this.loading = false;
        this.snackBar.open(`${section.title} settings saved successfully`, 'Close', { duration: 3000 });
        
        // If this was the security section with a password change, clear the form
        if (section.title === 'Security') {
          section.formGroup.patchValue({
            currentPassword: '',
            newPassword: '',
            confirmPassword: ''
          });
          section.formGroup.markAsPristine();
        }
      }, 1000);
    }

    private passwordMatchValidator(formGroup: FormGroup): { [key: string]: any } | null {
      const newPassword = formGroup.get('newPassword')?.value;
      const confirmPassword = formGroup.get('confirmPassword')?.value;
      
      if (newPassword && confirmPassword && newPassword !== confirmPassword) {
        return { passwordMismatch: true };
      }
      return null;
    }

    getFieldError(form: FormGroup, fieldName: string): string {
      const control = form.get(fieldName);
      if (!control?.errors || !control.touched) return '';

      if (control.hasError('required')) {
        return 'This field is required';
      }
      if (control.hasError('email')) {
        return 'Please enter a valid email address';
      }
      if (control.hasError('minlength')) {
        return `Minimum length is ${control.errors['minlength'].requiredLength} characters`;
      }
      if (control.hasError('pattern')) {
        if (fieldName === 'phone') {
          return 'Please enter a valid phone number';
        }
        if (fieldName === 'website') {
          return 'Please enter a valid URL (include http:// or https://)';
        }
        return 'Invalid format';
      }
      if (control.hasError('passwordMismatch')) {
        return 'Passwords do not match';
      }
      return '';
    }
  }

