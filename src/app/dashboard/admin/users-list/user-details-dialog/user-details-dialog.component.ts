import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { User } from '../../../../shared/models/user';

@Component({
    selector: 'app-user-details-dialog',
    templateUrl: './user-details-dialog.component.html',
    styleUrls: ['./user-details-dialog.component.scss']
})
export class UserDetailsDialogComponent {
    constructor(
        public dialogRef: MatDialogRef<UserDetailsDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public user: User
    ) { }

    close(): void {
        this.dialogRef.close();
    }

    isImage(url: string): boolean {
        return url.match(/\.(jpeg|jpg|gif|png)$/) != null;
    }
}
