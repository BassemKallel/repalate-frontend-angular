import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { environment } from '../../../../environments/environment';

export interface PaymentDialogData {
    transactionId: number;
    announcementTitle: string;
    price: number;
    paymentClientSecret: string;
}

declare var Stripe: any;

@Component({
    selector: 'app-payment-dialog',
    templateUrl: './payment-dialog.component.html',
    styleUrls: ['./payment-dialog.component.scss']
})
export class PaymentDialogComponent implements OnInit {
    stripe: any;
    cardElement: any;
    processing = false;
    errorMessage = '';

    constructor(
        private dialogRef: MatDialogRef<PaymentDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: PaymentDialogData
    ) { }

    ngOnInit(): void {
        this.initializeStripe();
    }

    private initializeStripe(): void {
        // Initialize Stripe
        this.stripe = Stripe(environment.stripePublishableKey);

        // Create Elements instance
        const elements = this.stripe.elements();

        // Create and mount Card Element
        this.cardElement = elements.create('card', {
            style: {
                base: {
                    fontSize: '16px',
                    color: '#32325d',
                    fontFamily: '"Roboto", sans-serif',
                    '::placeholder': {
                        color: '#aab7c4'
                    }
                },
                invalid: {
                    color: '#fa755a',
                    iconColor: '#fa755a'
                }
            }
        });

        // Mount to DOM
        setTimeout(() => {
            this.cardElement.mount('#card-element');
        }, 100);
    }

    async onSubmit(): Promise<void> {
        if (this.processing) return;

        this.processing = true;
        this.errorMessage = '';

        try {
            const { error, paymentIntent } = await this.stripe.confirmCardPayment(
                this.data.paymentClientSecret,
                {
                    payment_method: {
                        card: this.cardElement
                    }
                }
            );

            if (error) {
                this.errorMessage = error.message;
                this.processing = false;
            } else if (paymentIntent.status === 'succeeded') {
                // Payment successful
                this.dialogRef.close({ success: true, paymentIntent });
            }
        } catch (err: any) {
            this.errorMessage = err.message || 'Une erreur est survenue';
            this.processing = false;
        }
    }

    onCancel(): void {
        this.dialogRef.close({ success: false });
    }
}
