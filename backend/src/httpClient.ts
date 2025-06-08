import axios, { type AxiosRequestConfig, type AxiosResponse } from 'axios';
import type { HttpRequest, HttpResponse, AuthConfig } from './types/api';

export class HttpClient {
  static async sendRequest(request: HttpRequest, environment?: Record<string, string>): Promise<HttpResponse> {
    const startTime = Date.now();
    
    try {
      // Process URL with environment variables
      let processedUrl = this.processEnvironmentVariables(request.url, environment);
      
      // Build query parameters
      const params = new URLSearchParams();
      Object.entries(request.params).forEach(([key, value]) => {
        if (key && value) {
          params.append(key, this.processEnvironmentVariables(value, environment));
        }
      });
      
      if (params.toString()) {
        processedUrl += (processedUrl.includes('?') ? '&' : '?') + params.toString();
      }

      // Build headers
      const headers: Record<string, string> = {};
      Object.entries(request.headers).forEach(([key, value]) => {
        if (key && value) {
          headers[key] = this.processEnvironmentVariables(value, environment);
        }
      });

      // Apply authentication
      this.applyAuth(headers, request.auth, environment);

      // Prepare request body
      let data;
      if (['POST', 'PUT', 'PATCH'].includes(request.method) && request.body) {
        if (request.bodyType === 'json') {
          try {
            data = JSON.parse(this.processEnvironmentVariables(request.body, environment));
            headers['Content-Type'] = 'application/json';
          } catch {
            data = this.processEnvironmentVariables(request.body, environment);
          }
        } else if (request.bodyType === 'x-www-form-urlencoded') {
          data = new URLSearchParams(this.processEnvironmentVariables(request.body, environment));
          headers['Content-Type'] = 'application/x-www-form-urlencoded';
        } else {
          data = this.processEnvironmentVariables(request.body, environment);
        }
      }

      const config: AxiosRequestConfig = {
        method: request.method.toLowerCase() as any,
        url: processedUrl,
        headers,
        data,
        timeout: 30000,
        validateStatus: () => true, // Don't throw on any status code
      };

      const response: AxiosResponse = await axios(config);
      const endTime = Date.now();

      return {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers as Record<string, string>,
        data: response.data,
        duration: endTime - startTime,
        size: JSON.stringify(response.data).length,
      };
    } catch (error: any) {
      const endTime = Date.now();
      
      if (error.response) {
        return {
          status: error.response.status,
          statusText: error.response.statusText,
          headers: error.response.headers,
          data: error.response.data,
          duration: endTime - startTime,
          size: 0,
        };
      } else {
        throw new Error(error.message || 'Network error occurred');
      }
    }
  }

  private static processEnvironmentVariables(text: string, environment?: Record<string, string>): string {
    if (!environment) return text;
    
    return text.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return environment[key] || match;
    });
  }

  private static applyAuth(headers: Record<string, string>, auth: AuthConfig, environment?: Record<string, string>) {
    switch (auth.type) {
      case 'bearer':
        if (auth.token) {
          headers['Authorization'] = `Bearer ${this.processEnvironmentVariables(auth.token, environment)}`;
        }
        break;
      case 'basic':
        if (auth.username && auth.password) {
          const credentials = btoa(`${auth.username}:${auth.password}`);
          headers['Authorization'] = `Basic ${credentials}`;
        }
        break;
      case 'api-key':
        if (auth.key && auth.value) {
          if (auth.addTo === 'header') {
            headers[auth.key] = this.processEnvironmentVariables(auth.value, environment);
          }
          // Query params are handled separately
        }
        break;
    }
  }
}