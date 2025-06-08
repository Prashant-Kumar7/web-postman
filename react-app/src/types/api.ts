export interface HttpRequest {
  id: string;
  name: string;
  method: HttpMethod;
  url: string;
  headers: Record<string, string>;
  params: Record<string, string>;
  body: string;
  bodyType: 'json' | 'form-data' | 'x-www-form-urlencoded' | 'raw';
  auth: AuthConfig;
  createdAt: Date;
}

export interface HttpResponse {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  data: any;
  duration: number;
  size: number;
}

export interface AuthConfig {
  type: 'null' | 'bearer' | 'basic' | 'api-key';
  token?: string;
  username?: string;
  password?: string;
  key?: string;
  value?: string;
  addTo?: 'header' | 'query';
}

export interface Collection {
  id: string;
  name: string;
  requests: HttpRequest[];
  createdAt: Date;
}

export interface Environment {
  id: string;
  name: string;
  variables: Record<string, string>;
  active: boolean;
}

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS';

export interface RequestHistory {
  id: string;
  request: HttpRequest;
  response: HttpResponse;
  timestamp: Date;
}