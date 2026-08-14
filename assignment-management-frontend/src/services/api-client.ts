// src\services\api-client.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

class ApiClient {
  private getToken(): string | null {
    if (typeof window !== 'undefined') return localStorage.getItem('token');
    return null;
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = { 'Content-Type': 'application/json' };
    const token = this.getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return headers;
  }

  async get<T>(endpoint: string): Promise<T> {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, { headers: this.getHeaders() });
    if (!res.ok) throw new Error((await res.json().catch(() => ({ message: 'Error' }))).message);
    return res.json();
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, { method: 'POST', headers: this.getHeaders(), body: data ? JSON.stringify(data) : undefined });
    if (!res.ok) throw new Error((await res.json().catch(() => ({ message: 'Error' }))).message);
    return res.json();
  }

  async put<T>(endpoint: string, data: any): Promise<T> {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, { method: 'PUT', headers: this.getHeaders(), body: JSON.stringify(data) });
    if (!res.ok) throw new Error((await res.json().catch(() => ({ message: 'Error' }))).message);
    return res.json();
  }

  async delete(endpoint: string): Promise<void> {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, { method: 'DELETE', headers: this.getHeaders() });
    if (!res.ok) throw new Error((await res.json().catch(() => ({ message: 'Error' }))).message);
  }

  async uploadFile<T>(endpoint: string, file: File, onProgress?: (p: number) => void): Promise<T> {
    const formData = new FormData();
    formData.append('file', file);
    const token = this.getToken();
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.upload.onprogress = (e) => { if (e.lengthComputable && onProgress) onProgress(Math.round((e.loaded / e.total) * 100)); };
      xhr.onload = () => { if (xhr.status >= 200 && xhr.status < 300) resolve(JSON.parse(xhr.responseText)); else reject(new Error('Upload failed')); };
      xhr.onerror = () => reject(new Error('Upload failed'));
      xhr.open('POST', `${API_BASE_URL}${endpoint}`);
      if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      xhr.send(formData);
    });
  }
}

export const apiClient = new ApiClient();