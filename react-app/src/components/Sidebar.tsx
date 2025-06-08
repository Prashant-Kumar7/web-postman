import React, { useState } from 'react';
import { 
  Folder, 
  Plus, 
  History, 
   
  Download, 
  Upload,
  Trash2,
  
  Play
} from 'lucide-react';
import type { Collection, RequestHistory, HttpRequest } from '../types/api';

interface SidebarProps {
  collections: Collection[];
  history: RequestHistory[];
  activeTab: 'collections' | 'history';
  onTabChange: (tab: 'collections' | 'history') => void;
  onCreateCollection: () => void;
  onSelectRequest: (request: HttpRequest) => void;
  onDeleteCollection: (id: string) => void;
  onDeleteRequest: (collectionId: string, requestId: string) => void;
  onExportData: () => void;
  onImportData: (data: any) => void;
}

export default function Sidebar({
  collections,
  history,
  activeTab,
  onTabChange,
  onCreateCollection,
  onSelectRequest,
  onDeleteCollection,
  onDeleteRequest,
  onExportData,
  onImportData
}: SidebarProps) {
  const [expandedCollections, setExpandedCollections] = useState<Set<string>>(new Set());

  const toggleCollection = (id: string) => {
    const newExpanded = new Set(expandedCollections);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedCollections(newExpanded);
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target?.result as string);
          onImportData(data);
        } catch (error) {
          alert('Invalid file format');
        }
      };
      reader.readAsText(file);
    }
  };

  const getMethodColor = (method: string) => {
    const colors = {
      GET: 'text-emerald-400 bg-emerald-900/30 border-emerald-500/50',
      POST: 'text-blue-400 bg-blue-900/30 border-blue-500/50',
      PUT: 'text-amber-400 bg-amber-900/30 border-amber-500/50',
      DELETE: 'text-red-400 bg-red-900/30 border-red-500/50',
      PATCH: 'text-purple-400 bg-purple-900/30 border-purple-500/50',
      HEAD: 'text-gray-400 bg-gray-900/30 border-gray-500/50',
      OPTIONS: 'text-orange-400 bg-orange-900/30 border-orange-500/50',
    };
    return colors[method as keyof typeof colors] || 'text-gray-400 bg-gray-900/30 border-gray-500/50';
  };

  const getMethodBadge = (method: string) => {
    const colorClass = getMethodColor(method);
    return (
      <span className={`text-xs font-bold px-2 py-1 rounded border ${colorClass}`}>
        {method}
      </span>
    );
  };

  return (
    <div className="w-80 bg-gray-900 border-r border-gray-700 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <h1 className="text-xl font-bold text-white">API Client</h1>
        <div className="flex gap-2 mt-3">
          <button
            onClick={() => onTabChange('collections')}
            className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${
              activeTab === 'collections'
                ? 'bg-blue-600 text-white'
                : 'text-gray-300 hover:bg-gray-800'
            }`}
          >
            <Folder size={16} />
            Collections
          </button>
          <button
            onClick={() => onTabChange('history')}
            className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${
              activeTab === 'history'
                ? 'bg-blue-600 text-white'
                : 'text-gray-300 hover:bg-gray-800'
            }`}
          >
            <History size={16} />
            History
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'collections' ? (
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">Collections</h2>
              <button
                onClick={onCreateCollection}
                className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <Plus size={16} />
                New
              </button>
            </div>
            
            <div className="space-y-2">
              {collections.map((collection) => (
                <div key={collection.id} className="border border-gray-700 rounded-lg">
                  <div
                    className="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-800 transition-colors"
                    onClick={() => toggleCollection(collection.id)}
                  >
                    <div className="flex items-center gap-2">
                      <Folder size={16} className="text-yellow-400" />
                      <span className="text-white font-medium">{collection.name}</span>
                      <span className="text-gray-400 text-sm">({collection.requests.length})</span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteCollection(collection.id);
                      }}
                      className="text-gray-500 hover:text-red-400 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  
                  {expandedCollections.has(collection.id) && (
                    <div className="border-t border-gray-700">
                      {collection.requests.map((request) => (
                        <div
                          key={request.id}
                          className="flex items-center justify-between p-3 pl-8 hover:bg-gray-800 cursor-pointer transition-colors"
                          onClick={() => onSelectRequest(request)}
                        >
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            {getMethodBadge(request.method)}
                            <span className="text-white text-sm truncate">{request.name}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onSelectRequest(request);
                              }}
                              className="text-gray-500 hover:text-green-400 transition-colors"
                            >
                              <Play size={14} />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onDeleteRequest(collection.id, request.id);
                              }}
                              className="text-gray-500 hover:text-red-400 transition-colors"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      ))}
                      {collection.requests.length === 0 && (
                        <div className="p-3 pl-8 text-gray-500 text-sm">No requests yet</div>
                      )}
                    </div>
                  )}
                </div>
              ))}
              {collections.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Folder size={48} className="mx-auto mb-2 opacity-50" />
                  <p>No collections yet</p>
                  <p className="text-sm">Click "New" to create your first collection</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="p-4">
            <h2 className="text-lg font-semibold text-white mb-4">Request History</h2>
            <div className="space-y-2">
              {history.slice().reverse().map((item) => (
                <div
                  key={item.id}
                  className="p-3 border border-gray-700 rounded-lg hover:bg-gray-800 cursor-pointer transition-colors"
                  onClick={() => onSelectRequest(item.request)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      {getMethodBadge(item.request.method)}
                      <span className="text-white text-sm">{item.request.name || 'Untitled'}</span>
                    </div>
                    {item.response && (
                      <span className={`text-xs px-2 py-1 rounded font-medium ${
                        item.response.status < 300 ? 'bg-emerald-600 text-emerald-100' : 
                        item.response.status < 400 ? 'bg-amber-600 text-amber-100' : 'bg-red-600 text-red-100'
                      }`}>
                        {item.response.status}
                      </span>
                    )}
                  </div>
                  <div className="text-gray-400 text-xs truncate">{item.request.url}</div>
                  <div className="text-gray-500 text-xs mt-1">
                    {new Date(item.timestamp).toLocaleString()}
                  </div>
                </div>
              ))}
              {history.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <History size={48} className="mx-auto mb-2 opacity-50" />
                  <p>No requests in history</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-700">
        <div className="flex gap-2">
          <button
            onClick={onExportData}
            className="flex items-center gap-2 px-3 py-2 text-gray-300 hover:bg-gray-800 rounded-md transition-colors flex-1"
          >
            <Download size={16} />
            Export
          </button>
          <label className="flex items-center gap-2 px-3 py-2 text-gray-300 hover:bg-gray-800 rounded-md transition-colors flex-1 cursor-pointer">
            <Upload size={16} />
            Import
            <input
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
            />
          </label>
        </div>
      </div>
    </div>
  );
}