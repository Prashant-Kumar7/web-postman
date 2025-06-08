export interface HttpRequest {
  method: string;
  url: string;
  headers: Record<string, string>;
  params: Record<string, string>;
  body?: string;
  bodyType?: 'json' | 'x-www-form-urlencoded' | 'raw';
  auth: AuthConfig;
}

export interface HttpResponse {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  data: any;
  duration: number;
  size: number;
}

export interface RequestHistory {
  id: string;
  request: HttpRequest;
  response: HttpResponse;
  timestamp: Date;
}


export type HttpRequestResponse = {
  method: string;
  url: string;
  headers: Record<string, string>;
  body?: any;             // Could be string, object, or undefined, depending on usage
  params: Record<string, string>;
  response: any;          // You can narrow this type if you know the structure
  statusCode: number;
};


export type AuthConfig =
  | { type: 'bearer'; token: string }
  | { type: 'basic'; username: string; password: string }
  | { type: 'api-key'; key: string; value: string; addTo: 'header' | 'query' }
  | { type: 'none' };


