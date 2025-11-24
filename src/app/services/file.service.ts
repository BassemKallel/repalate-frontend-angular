import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

interface UploadResponse {
  url: string;
}

@Injectable({
  providedIn: 'root'
})
export class FileService {
  private readonly apiUrl = '/api/v1/files';

  constructor(private http: HttpClient) {}

  upload(file: File, type: string): Observable<UploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    return this.http
      .post(`${this.apiUrl}/upload`, formData, { responseType: 'text' })
      .pipe(
        map((url) => ({ url } as UploadResponse)),
        catchError((error) => {
          console.error('Upload failed with details:', {
            status: error.status,
            statusText: error.statusText,
            error: error.error,
            url: error.url
          });
          throw error;
        })
      );
  }

  delete(url: string): Observable<void> {
    return this.http.request<void>('delete', `${this.apiUrl}/delete`, {
      body: { url }
    });
  }
}
