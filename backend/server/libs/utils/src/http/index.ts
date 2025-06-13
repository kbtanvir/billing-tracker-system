import fetch from 'node-fetch';
import { URLSearchParams } from 'url';

type Headers = Record<string, string>;
type Body = Record<string, any>;
type FormBody = Record<string, string>;
type Methods = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

export class HttpService {
  private get defaultHeaders() {
    return { 'content-type': 'application/json' };
  }

  constructor(private baseURL: string) {}

  async get<T>(endpoint: string, headers: Headers = {}) {
    return this.request<T>(endpoint, 'GET', headers);
  }

  async post<T>(endpoint: string, body: Body = {}, headers: Headers = {}) {
    return this.request<T>(endpoint, 'POST', headers, body);
  }

  async put<T>(endpoint: string, body: Body = {}, headers: Headers = {}) {
    return this.request<T>(endpoint, 'PUT', headers, body);
  }

  async patch<T>(endpoint: string, body: Body = {}, headers: Headers = {}) {
    return this.request<T>(endpoint, 'PATCH', headers, body);
  }

  async delete<T>(endpoint: string, headers: Headers = {}) {
    return this.request<T>(endpoint, 'DELETE', headers);
  }

  async postForm<T>(endpoint: string, body: FormBody, headers: Headers = {}) {
    const form = new URLSearchParams();

    Object.entries(body).forEach(([key, value]) => {
      form.append(key, value);
    });

    const res = await fetch(`${this.baseURL}/${endpoint}`, {
      method: 'POST',
      headers: {
        ...headers,
        'content-type': 'application/x-www-form-urlencoded',
      },
      body: form.toString(),
    });

    return (await res.json()) as T;
  }

  private async request<T>(
    endpoint: string,
    method: Methods,
    headers: Headers = {},
    body?: Body,
  ) {
    const res = await fetch(`${this.baseURL}/${endpoint}`, {
      headers: { ...this.defaultHeaders, ...headers },
      method,
      body: body ? JSON.stringify(body) : undefined,
    });
    //[TODO] handle !res.ok cases

    return (await res.json()) as T;
  }
}
