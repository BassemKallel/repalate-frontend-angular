import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface Transaction {
    paymentId: number;
    transactionId: number;
    status: string;
    amount: number;
    providerPaymentId: string;
    createdAt: string;
    message: string;
    user?: {
        username: string;
        email: string;
    };
    reservation?: {
        id: number;
        announcementTitle: string;
    };
}

@Injectable({
    providedIn: 'root'
})
export class PaymentService {
    private readonly apiUrl = '/api/v1/payments';

    constructor(private http: HttpClient) { }

    getAllPayments(): Observable<Transaction[]> {
        return this.http.get<Transaction[]>(`${this.apiUrl}/admin/all`);
    }

    getMyPayments(): Observable<Transaction[]> {
        return this.http.get<Transaction[]>(`${this.apiUrl}/my-payments`);
    }
}
