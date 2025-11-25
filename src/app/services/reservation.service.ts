import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export enum TransactionStatus {
    PENDING = 'PENDING',
    PENDING_CONFIRMATION = 'PENDING_CONFIRMATION',
    COMPLETED = 'COMPLETED',
    CANCELLED = 'CANCELLED'
}

export interface Reservation {
    transactionId: number;
    status: TransactionStatus;
    active: boolean;
    price: number;
    availableQuantity: number;
    message: string;
    paymentClientSecret: string;
    transactionDate: string;
    userId: number;
    announcementId: number;
    announcementTitle: string;
}

@Injectable({
    providedIn: 'root'
})
export class ReservationService {
    private readonly apiUrl = '/api/v1/reservations';

    constructor(private http: HttpClient) { }

    getMyHistory(): Observable<Reservation[]> {
        return this.http.get<Reservation[]>(`${this.apiUrl}/my-history`);
    }

    getAdminHistory(): Observable<Reservation[]> {
        return this.http.get<Reservation[]>(`${this.apiUrl}/admin/history`);
    }

    accept(id: number): Observable<void> {
        return this.http.post<void>(`${this.apiUrl}/${id}/accept`, {});
    }

    refuse(id: number): Observable<void> {
        return this.http.post<void>(`${this.apiUrl}/${id}/refuse`, {});
    }

    create(payload: any): Observable<Reservation> {
        return this.http.post<Reservation>(`${this.apiUrl}/create`, payload);
    }

    pay(id: number): Observable<void> {
        return this.http.post<void>(`${this.apiUrl}/${id}/pay`, {});
    }

    cancel(id: number): Observable<void> {
        return this.http.post<void>(`${this.apiUrl}/${id}/cancel`, {});
    }
}
