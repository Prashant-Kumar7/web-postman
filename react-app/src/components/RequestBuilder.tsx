import  { useState } from 'react';
import { Send, Save, Plus, Trash2, Eye, EyeOff } from 'lucide-react';
import type { HttpRequest, HttpMethod, AuthConfig } from '../types/api';

interface RequestBuilderProps {
  request: HttpRequest;
  onRequestChange: (request: HttpRequest) => void;
  onSendRequest: () => void;
  onSaveRequest: () => void;
  isLoading: boolean;
  environments: Array<{ id: string; name: string; variables: Record<string, string>; active: boolean }>;
}

const HTTP_METHODS: HttpMethod[] = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'];

export default function RequestBuilder({
  request,
  onRequestChange,
  onSendRequest,
  onSaveRequest,
  isLoading,
  environments
}: RequestBuilderProps) {
  const [activeTab, setActiveTab] = useState<'params' | 'headers' | 'body' | 'auth'>('params');
  const [showAuthDetails, setShowAuthDetails] = useState(false);

  const updateRequest = (updates: Partial<HttpRequest>) => {
    onRequestChange({ ...request, ...updates });
  };

  const addParam = () => {
    updateRequest({
      params: { ...request.params, '': '' }
    });
  };

  const updateParam = (oldKey: string, newKey: string, value: string) => {
    const newParams = { ...request.params };
    if (oldKey !== newKey) {
      delete newParams[oldKey];
    }
    newParams[newKey] = value;
    updateRequest({ params: newParams });
  };

  const removeParam = (key: string) => {
    const newParams = { ...request.params };
    delete newParams[key];
    updateRequest({ params: newParams });
  };

  const addHeader = () => {
    updateRequest({
      headers: { ...request.headers, '': '' }
    });
  };

  const updateHeader = (oldKey: string, newKey: string, value: string) => {
    const newHeaders = { ...request.headers };
    if (oldKey !== newKey) {
      delete newHeaders[oldKey];
    }
    newHeaders[newKey] = value;
    updateRequest({ headers: newHeaders });
  };

  const removeHeader = (key: string) => {
    const newHeaders = { ...request.headers };
    delete newHeaders[key];
    updateRequest({ headers: newHeaders });
  };

  const updateAuth = (updates: Partial<AuthConfig>) => {
    updateRequest({
      auth: { ...request.auth, ...updates }
    });
  };

  const getMethodColor = (method: HttpMethod) => {
    const colors = {
      GET: 'bg-emerald-600 hover:bg-emerald-700 border-emerald-500',
      POST: 'bg-blue-600 hover:bg-blue-700 border-blue-500',
      PUT: 'bg-amber-600 hover:bg-amber-700 border-amber-500',
      DELETE: 'bg-red-600 hover:bg-red-700 border-red-500',
      PATCH: 'bg-purple-600 hover:bg-purple-700 border-purple-500',
      HEAD: 'bg-gray-600 hover:bg-gray-700 border-gray-500',
      OPTIONS: 'bg-orange-600 hover:bg-orange-700 border-orange-500',
    };
    return colors[method];
  };

  const activeEnvironment = environments.find(env => env.active);

  return (
    <div className="flex-1 bg-gray-800 flex flex-col">
      {/* Request Line */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex gap-3 mb-3">
          <input
            type="text"
            value={request.name}
            onChange={(e) => updateRequest({ name: e.target.value })}
            placeholder="Request name"
            className="flex-1 bg-gray-700 text-white px-3 py-2 rounded-md border border-gray-600 focus:border-blue-500 focus:outline-none"
          />
          <button
            onClick={onSaveRequest}
            className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 transition-colors"
          >
            <Save size={16} />
            Save
          </button>
        </div>
        
        <div className="flex gap-3">
          <select
            value={request.method}
            onChange={(e) => updateRequest({ method: e.target.value as HttpMethod })}
            className={`px-4 py-2 rounded-md text-white font-bold text-sm transition-colors border-2 ${getMethodColor(request.method)}`}
          >
            {HTTP_METHODS.map(method => (
              <option key={method} value={method} className="bg-gray-800 text-white">{method}</option>
            ))}
          </select>
          
          <input
            type="text"
            value={request.url}
            onChange={(e) => updateRequest({ url: e.target.value })}
            placeholder="Enter request URL"
            className="flex-1 bg-gray-700 text-white px-3 py-2 rounded-md border border-gray-600 focus:border-blue-500 focus:outline-none"
          />
          
          <button
            onClick={onSendRequest}
            disabled={isLoading || !request.url}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send size={16} />
            {isLoading ? 'Sending...' : 'Send'}
          </button>
        </div>

        {activeEnvironment && (
          <div className="mt-2 text-sm text-green-400">
            Environment: {activeEnvironment.name}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-700">
        <div className="flex">
          {['params', 'headers', 'body', 'auth'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === tab
                  ? 'text-blue-400 border-b-2 border-blue-400'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
              {tab === 'params' && Object.keys(request.params).filter(k => k).length > 0 && (
                <span className="ml-1 text-xs bg-blue-600 px-1 rounded">
                  {Object.keys(request.params).filter(k => k).length}
                </span>
              )}
              {tab === 'headers' && Object.keys(request.headers).filter(k => k).length > 0 && (
                <span className="ml-1 text-xs bg-blue-600 px-1 rounded">
                  {Object.keys(request.headers).filter(k => k).length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'params' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-white font-semibold">Query Parameters</h3>
              <button
                onClick={addParam}
                className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <Plus size={16} />
                Add
              </button>
            </div>
            
            <div className="space-y-2">
              {Object.entries(request.params).map(([key, value], index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={key}
                    onChange={(e) => updateParam(key, e.target.value, value)}
                    placeholder="Key"
                    className="flex-1 bg-gray-700 text-white px-3 py-2 rounded-md border border-gray-600 focus:border-blue-500 focus:outline-none"
                  />
                  <input
                    type="text"
                    value={value}
                    onChange={(e) => updateParam(key, key, e.target.value)}
                    placeholder="Value"
                    className="flex-1 bg-gray-700 text-white px-3 py-2 rounded-md border border-gray-600 focus:border-blue-500 focus:outline-none"
                  />
                  <button
                    onClick={() => removeParam(key)}
                    className="px-3 py-2 text-red-400 hover:text-red-300 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
              {Object.keys(request.params).length === 0 && (
                <div className="text-gray-500 text-center py-8">
                  No query parameters yet. Click "Add" to create one.
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'headers' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-white font-semibold">Request Headers</h3>
              <button
                onClick={addHeader}
                className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <Plus size={16} />
                Add
              </button>
            </div>
            
            <div className="space-y-2">
              {Object.entries(request.headers).map(([key, value], index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={key}
                    onChange={(e) => updateHeader(key, e.target.value, value)}
                    placeholder="Header name"
                    className="flex-1 bg-gray-700 text-white px-3 py-2 rounded-md border border-gray-600 focus:border-blue-500 focus:outline-none"
                  />
                  <input
                    type="text"
                    value={value}
                    onChange={(e) => updateHeader(key, key, e.target.value)}
                    placeholder="Header value"
                    className="flex-1 bg-gray-700 text-white px-3 py-2 rounded-md border border-gray-600 focus:border-blue-500 focus:outline-none"
                  />
                  <button
                    onClick={() => removeHeader(key)}
                    className="px-3 py-2 text-red-400 hover:text-red-300 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
              {Object.keys(request.headers).length === 0 && (
                <div className="text-gray-500 text-center py-8">
                  No headers yet. Click "Add" to create one.
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'body' && (
          <div>
            <div className="mb-4">
              <h3 className="text-white font-semibold mb-3">Request Body</h3>
              <div className="flex gap-2 mb-4">
                {['json', 'form-data', 'x-www-form-urlencoded', 'raw'].map((type) => (
                  <button
                    key={type}
                    onClick={() => updateRequest({ bodyType: type as any })}
                    className={`px-3 py-2 rounded-md text-sm transition-colors ${
                      request.bodyType === type
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {type.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
            
            <textarea
              value={request.body}
              onChange={(e) => updateRequest({ body: e.target.value })}
              placeholder={
                request.bodyType === 'json' 
                  ? '{\n  "key": "value"\n}'
                  : request.bodyType === 'x-www-form-urlencoded'
                  ? 'key1=value1&key2=value2'
                  : 'Enter request body...'
              }
              className="w-full h-80 bg-gray-700 text-white px-3 py-2 rounded-md border border-gray-600 focus:border-blue-500 focus:outline-none font-mono text-sm resize-none"
            />
          </div>
        )}

        {activeTab === 'auth' && (
          <div>
            <h3 className="text-white font-semibold mb-4">Authentication</h3>
            
            <div className="mb-4">
              <label className="block text-gray-300 mb-2">Auth Type</label>
              <select
                value={request.auth.type}
                onChange={(e) => updateAuth({ type: e.target.value as any })}
                className="w-full bg-gray-700 text-white px-3 py-2 rounded-md border border-gray-600 focus:border-blue-500 focus:outline-none"
              >
                <option value="none">No Auth</option>
                <option value="bearer">Bearer Token</option>
                <option value="basic">Basic Auth</option>
                <option value="api-key">API Key</option>
              </select>
            </div>

            {request.auth.type === 'bearer' && (
              <div>
                <label className="block text-gray-300 mb-2">Token</label>
                <div className="relative">
                  <input
                    type={showAuthDetails ? 'text' : 'password'}
                    value={request.auth.token || ''}
                    onChange={(e) => updateAuth({ token: e.target.value })}
                    placeholder="Enter bearer token"
                    className="w-full bg-gray-700 text-white px-3 py-2 pr-10 rounded-md border border-gray-600 focus:border-blue-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowAuthDetails(!showAuthDetails)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    {showAuthDetails ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            )}

            {request.auth.type === 'basic' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-300 mb-2">Username</label>
                  <input
                    type="text"
                    value={request.auth.username || ''}
                    onChange={(e) => updateAuth({ username: e.target.value })}
                    placeholder="Enter username"
                    className="w-full bg-gray-700 text-white px-3 py-2 rounded-md border border-gray-600 focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 mb-2">Password</label>
                  <div className="relative">
                    <input
                      type={showAuthDetails ? 'text' : 'password'}
                      value={request.auth.password || ''}
                      onChange={(e) => updateAuth({ password: e.target.value })}
                      placeholder="Enter password"
                      className="w-full bg-gray-700 text-white px-3 py-2 pr-10 rounded-md border border-gray-600 focus:border-blue-500 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowAuthDetails(!showAuthDetails)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                    >
                      {showAuthDetails ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {request.auth.type === 'api-key' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-300 mb-2">Key</label>
                  <input
                    type="text"
                    value={request.auth.key || ''}
                    onChange={(e) => updateAuth({ key: e.target.value })}
                    placeholder="Enter key name"
                    className="w-full bg-gray-700 text-white px-3 py-2 rounded-md border border-gray-600 focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 mb-2">Value</label>
                  <div className="relative">
                    <input
                      type={showAuthDetails ? 'text' : 'password'}
                      value={request.auth.value || ''}
                      onChange={(e) => updateAuth({ value: e.target.value })}
                      placeholder="Enter key value"
                      className="w-full bg-gray-700 text-white px-3 py-2 pr-10 rounded-md border border-gray-600 focus:border-blue-500 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowAuthDetails(!showAuthDetails)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                    >
                      {showAuthDetails ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-gray-300 mb-2">Add to</label>
                  <select
                    value={request.auth.addTo || 'header'}
                    onChange={(e) => updateAuth({ addTo: e.target.value as 'header' | 'query' })}
                    className="w-full bg-gray-700 text-white px-3 py-2 rounded-md border border-gray-600 focus:border-blue-500 focus:outline-none"
                  >
                    <option value="header">Header</option>
                    <option value="query">Query Params</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}