// src/app/api/proxy/[...path]/route.ts
import { NextRequest, NextResponse } from 'next/server';

async function handler(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  try {
    const { path } = await params;
    const pathString = path.join('/');
    const url = `${process.env.NEXT_PUBLIC_API_URL}/${pathString}`;
    
    const headers: HeadersInit = {};
    const token = request.cookies.get('token')?.value;
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    if (request.method !== 'GET') {
      headers['Content-Type'] = 'application/json';
    }

    const fetchOptions: RequestInit = {
      method: request.method,
      headers,
    };

    if (request.method !== 'GET' && request.method !== 'HEAD') {
      const contentType = request.headers.get('content-type');
      if (contentType?.includes('multipart/form-data')) {
        fetchOptions.body = await request.formData();
        delete (headers as any)['Content-Type'];
      } else {
        fetchOptions.body = await request.text();
      }
    }

    const response = await fetch(url, fetchOptions);
    const data = await response.json();

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    return NextResponse.json({ message: 'Proxy error' }, { status: 500 });
  }
}

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const DELETE = handler;
export const PATCH = handler;