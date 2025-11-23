import { Component } from '@angular/core';

@Component({
  selector: 'app-usage-in-form',
  templateUrl: './usage-in-form.component.html',
  styleUrls: ['./usage-in-form.component.css']
})
export class UsageInFormComponent {
  location: string = '';
  showDialog = false;

  openDialog() {
    this.showDialog = true;
  }

  onLocationSelected(location: string) {
    this.location = location;
    this.showDialog = false;
  }
}
