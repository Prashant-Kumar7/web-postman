import  { useState, type JSX } from 'react';
import { Copy, Download, Clock,  HardDrive } from 'lucide-react';
import type { HttpResponse } from '../types/api';

interface ResponseViewerProps {
  response: HttpResponse | null;
  isLoading: boolean;
  error: string | null;
}

export default function ResponseViewer({ response, isLoading, error }: ResponseViewerProps) {
  const [activeTab, setActiveTab] = useState<'body' | 'headers'>('body');
  const [jsonExpanded, setJsonExpanded] = useState<Set<string>>(new Set());

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const downloadResponse = () => {
    if (!response) return;
    
    const blob = new Blob([JSON.stringify(response.data, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'response.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const formatJson = (obj: any, depth = 0): JSX.Element => {
    if (obj === null) return <span className="text-gray-400">null</span>;
    if (typeof obj === 'string') return <span className="text-green-400">"{obj}"</span>;
    if (typeof obj === 'number') return <span className="text-blue-400">{obj}</span>;
    if (typeof obj === 'boolean') return <span className="text-yellow-400">{obj.toString()}</span>;
    
    if (Array.isArray(obj)) {
      if (obj.length === 0) return <span>[]</span>;
      
      const key = `array-${depth}`;
      const isExpanded = jsonExpanded.has(key);
      
      return (
        <div>
          <span
            className="cursor-pointer hover:bg-gray-700 px-1 rounded"
            onClick={() => {
              const newExpanded = new Set(jsonExpanded);
              if (isExpanded) {
                newExpanded.delete(key);
              } else {
                newExpanded.add(key);
              }
              setJsonExpanded(newExpanded);
            }}
          >
            [{isExpanded ? '-' : '+'}] {obj.length} items
          </span>
          {isExpanded && (
            <div className="ml-6 border-l border-gray-600 pl-4">
              {obj.map((item, index) => (
                <div key={index} className="py-1">
                  <span className="text-gray-400">{index}: </span>
                  {formatJson(item, depth + 1)}
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }
    
    if (typeof obj === 'object') {
      const keys = Object.keys(obj);
      if (keys.length === 0) return <span>{'{}'}</span>;
      
      const key = `object-${depth}`;
      const isExpanded = jsonExpanded.has(key);
      
      return (
        <div>
          <span
            className="cursor-pointer hover:bg-gray-700 px-1 rounded"
            onClick={() => {
              const newExpanded = new Set(jsonExpanded);
              if (isExpanded) {
                newExpanded.delete(key);
              } else {
                newExpanded.add(key);
              }
              setJsonExpanded(newExpanded);
            }}
          >
            {'{'}'{isExpanded ? '-' : '+'}{'}'}  {keys.length} keys
          </span>
          {isExpanded && (
            <div className="ml-6 border-l border-gray-600 pl-4">
              {keys.map((k) => (
                <div key={k} className="py-1">
                  <span className="text-purple-400">"{k}"</span>
                  <span className="text-gray-400">: </span>
                  {formatJson(obj[k], depth + 1)}
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }
    
    return <span>{String(obj)}</span>;
  };

  const getStatusColor = (status: number) => {
    if (status < 200) return 'text-blue-400';
    if (status < 300) return 'text-green-400';
    if (status < 400) return 'text-yellow-400';
    return 'text-red-400';
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (isLoading) {
    return (
      <div className="flex-1 bg-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Sending request...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 bg-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 text-6xl mb-4">⚠</div>
          <p className="text-red-400 text-lg mb-2">Request Failed</p>
          <p className="text-gray-400">{error}</p>
        </div>
      </div>
    );
  }

  if (!response) {
    return (
      <div className="flex-1 bg-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-500 text-6xl mb-4">📡</div>
          <p className="text-gray-400 text-lg mb-2">Ready to send request</p>
          <p className="text-gray-500">Configure your request and click Send</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-gray-800 flex flex-col">
      {/* Response Status */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-gray-400">Status:</span>
              <span className={`font-semibold ${getStatusColor(response.status)}`}>
                {response.status} {response.statusText}
              </span>
            </div>
            <div className="flex items-center gap-2 text-gray-400">
              <Clock size={16} />
              <span>{response.duration}ms</span>
            </div>
            <div className="flex items-center gap-2 text-gray-400">
              <HardDrive size={16} />
              <span>{formatBytes(response.size)}</span>
            </div>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => copyToClipboard(JSON.stringify(response.data, null, 2))}
              className="flex items-center gap-1 px-3 py-1 bg-gray-700 text-white rounded-md hover:bg-gray-600 transition-colors"
            >
              <Copy size={16} />
              Copy
            </button>
            <button
              onClick={downloadResponse}
              className="flex items-center gap-1 px-3 py-1 bg-gray-700 text-white rounded-md hover:bg-gray-600 transition-colors"
            >
              <Download size={16} />
              Download
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-700">
        <div className="flex">
          <button
            onClick={() => setActiveTab('body')}
            className={`px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'body'
                ? 'text-blue-400 border-b-2 border-blue-400'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Response Body
          </button>
          <button
            onClick={() => setActiveTab('headers')}
            className={`px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'headers'
                ? 'text-blue-400 border-b-2 border-blue-400'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Headers ({Object.keys(response.headers).length})
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'body' && (
          <div>
            {typeof response.data === 'object' ? (
              <div className="bg-gray-900 rounded-lg p-4 font-mono text-sm">
                {formatJson(response.data)}
              </div>
            ) : (
              <div className="bg-gray-900 rounded-lg p-4 font-mono text-sm text-white whitespace-pre-wrap">
                {String(response.data)}
              </div>
            )}
          </div>
        )}

        {activeTab === 'headers' && (
          <div className="space-y-2">
            {Object.entries(response.headers).map(([key, value]) => (
              <div key={key} className="flex gap-4 p-3 bg-gray-700 rounded-lg">
                <div className="font-semibold text-purple-400 min-w-0 w-1/3">
                  {key}
                </div>
                <div className="text-white min-w-0 flex-1 break-all">
                  {value}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}