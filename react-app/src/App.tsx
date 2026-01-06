import  { useState, useEffect, useCallback, useRef } from 'react';
import { Settings } from 'lucide-react';
import Sidebar from './components/Sidebar';
import RequestBuilder from './components/RequestBuilder';
import ResponseViewer from './components/ResponseViewer';
import EnvironmentManager from './components/EnvironmentManager';
import { StorageService } from './utils/storage';
import { API_BASE_URL } from './utils/config';
import type { HttpRequest, HttpResponse, HttpMethod, Collection, Environment, RequestHistory } from './types/api';
import axios from 'axios';

function App() {
  // State management
  const [currentRequest, setCurrentRequest] = useState<HttpRequest>({
    id: Date.now().toString(),
    name: 'Untitled Request',
    method: 'GET' as HttpMethod,
    url: '',
    headers: {},
    params: {},
    body: '',
    bodyType: 'json',
    auth: { type: 'null' },
    createdAt: new Date()
  });

  const [response, setResponse] = useState<HttpResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [environments, setEnvironments] = useState<Environment[]>([]);
  const [history, setHistory] = useState<RequestHistory[]>([]);
  const [activeTab, setActiveTab] = useState<'collections' | 'history'>('collections');
  const [showEnvironmentManager, setShowEnvironmentManager] = useState(false);
  
  // Pagination state
  const [historyPage, setHistoryPage] = useState(1);
  const [historyTotalPages, setHistoryTotalPages] = useState(1);
  const [historyTotalCount, setHistoryTotalCount] = useState(0);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyLimit] = useState(10); // Items per page
  const [useLazyLoading, setUseLazyLoading] = useState(false); // Toggle between pagination and lazy loading
  
  // Cache for history pages using refs to avoid dependency issues
  const historyCacheRef = useRef<Map<number, { data: RequestHistory[], totalPages: number, totalCount: number }>>(new Map());
  const cacheTimestampsRef = useRef<Map<number, number>>(new Map());
  const CACHE_TTL = 5 * 60 * 1000; // 5 minutes cache TTL

  // Load history with pagination and caching
  const loadHistory = useCallback(async (page: number, forceRefresh = false) => {
    // Check cache first (unless force refresh)
    if (!forceRefresh && historyCacheRef.current.has(page)) {
      const cached = historyCacheRef.current.get(page)!;
      const cacheTime = cacheTimestampsRef.current.get(page) || 0;
      const now = Date.now();
      
      // Use cache if it's still valid
      if (now - cacheTime < CACHE_TTL) {
        setHistory(cached.data);
        setHistoryTotalPages(cached.totalPages);
        setHistoryTotalCount(cached.totalCount);
        setHistoryPage(page);
        return;
      }
    }
    
    setHistoryLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/history`, {
        params: {
          page,
          limit: historyLimit
        }
      });
      const result = res.data;
      const historyData = result.data || [];
      
      // Update cache
      historyCacheRef.current.set(page, {
        data: historyData,
        totalPages: result.totalPages || 1,
        totalCount: result.totalCount || 0
      });
      cacheTimestampsRef.current.set(page, Date.now());
      
      setHistory(historyData);
      setHistoryTotalPages(result.totalPages || 1);
      setHistoryTotalCount(result.totalCount || 0);
      setHistoryPage(page);
    } catch (error) {
      console.error('Failed to load history:', error);
      // Fallback to localStorage
      setHistory(StorageService.loadHistory());
    } finally {
      setHistoryLoading(false);
    }
  }, [historyLimit]);

  // Load more history for lazy loading
  const loadMoreHistory = useCallback(async () => {
    if (historyPage >= historyTotalPages || historyLoading) return;
    
    setHistoryLoading(true);
    try {
      const nextPage = historyPage + 1;
      const res = await axios.get(`${API_BASE_URL}/history`, {
        params: {
          page: nextPage,
          limit: historyLimit
        }
      });
      const result = res.data;
      setHistory(prev => [...prev, ...(result.data || [])]);
      setHistoryTotalPages(result.totalPages || 1);
      setHistoryTotalCount(result.totalCount || 0);
      setHistoryPage(nextPage);
    } catch (error) {
      console.error('Failed to load more history:', error);
    } finally {
      setHistoryLoading(false);
    }
  }, [historyPage, historyTotalPages, historyLoading, historyLimit]);

  // Load data from localStorage on mount
  useEffect(() => {
    setCollections(StorageService.loadCollections());
    setEnvironments(StorageService.loadEnvironments());
    loadHistory(1);
  }, [loadHistory]);

  // Save collections when they change
  useEffect(() => {
    StorageService.saveCollections(collections);
  }, [collections]);

  // Save environments when they change
  useEffect(() => {
    StorageService.saveEnvironments(environments);
  }, [environments]);

  // Refresh history when tab changes to history (only on tab change, not on page change)
  useEffect(() => {
    if (activeTab === 'history') {
      loadHistory(1); // Always load page 1 when switching to history tab
    }
  }, [activeTab, loadHistory]);

  const sendRequest = async () => {
    if (!currentRequest.url.trim()) {
      setError('Please enter a URL');
      return;
    }

    setIsLoading(true);
    setError(null);
    setResponse(null);

    try {
      const activeEnv = environments.find(env => env.active);
      // const result = await HttpClient.sendRequest(
      //   currentRequest,
      //   activeEnv?.variables
      // );

      const result = await axios.post(`${API_BASE_URL}/proxy`, {request: currentRequest, environment:activeEnv?.variables})
      console.log(response?.data)
      setResponse(result.data);
      
      // Reload first page of history to show the new request (force refresh to clear cache)
      await loadHistory(1, true);
      
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const saveRequest = () => {
    const collectionName = prompt('Enter collection name:');
    if (!collectionName) return;

    let targetCollection = collections.find(c => c.name === collectionName);
    
    if (!targetCollection) {
      targetCollection = {
        id: Date.now().toString(),
        name: collectionName,
        requests: [],
        createdAt: new Date()
      };
      setCollections(prev => [...prev, targetCollection!]);
    }

    const updatedRequest = {
      ...currentRequest,
      id: Date.now().toString(),
      name: currentRequest.name || 'Untitled Request'
    };

    setCollections(prev =>
      prev.map(c =>
        c.id === targetCollection!.id
          ? { ...c, requests: [...c.requests, updatedRequest] }
          : c
      )
    );
  };

  const createCollection = () => {
    const name = prompt('Enter collection name:');
    if (!name) return;

    const newCollection: Collection = {
      id: Date.now().toString(),
      name,
      requests: [],
      createdAt: new Date()
    };

    setCollections(prev => [...prev, newCollection]);
  };

  const deleteCollection = (id: string) => {
    if (confirm('Are you sure you want to delete this collection?')) {
      setCollections(prev => prev.filter(c => c.id !== id));
    }
  };

  const deleteRequest = (collectionId: string, requestId: string) => {
    if (confirm('Are you sure you want to delete this request?')) {
      setCollections(prev =>
        prev.map(c =>
          c.id === collectionId
            ? { ...c, requests: c.requests.filter(r => r.id !== requestId) }
            : c
        )
      );
    }
  };

  const selectRequest = (request: HttpRequest) => {
    setCurrentRequest({ ...request });
    setResponse(null);
    setError(null);
  };

  const exportData = () => {
    const data = StorageService.exportData();
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'api-client-export.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const importData = (data: any) => {
    try {
      StorageService.importData(data);
      setCollections(StorageService.loadCollections());
      setEnvironments(StorageService.loadEnvironments());
      setHistory(StorageService.loadHistory());
      alert('Data imported successfully!');
    } catch (error) {
      alert('Failed to import data. Please check the file format.');
    }
  };

  return (
    <div className="h-screen bg-gray-900 flex overflow-hidden">
      {/* Sidebar */}
      <Sidebar
        collections={collections}
        history={history}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onCreateCollection={createCollection}
        onSelectRequest={selectRequest}
        onDeleteCollection={deleteCollection}
        onDeleteRequest={deleteRequest}
        onExportData={exportData}
        onImportData={importData}
        historyPage={historyPage}
        historyTotalPages={historyTotalPages}
        historyTotalCount={historyTotalCount}
        historyLoading={historyLoading}
        onHistoryPageChange={loadHistory}
        onLoadMoreHistory={loadMoreHistory}
        useLazyLoading={useLazyLoading}
        onToggleLazyLoading={setUseLazyLoading}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <div className="bg-gray-800 border-b border-gray-700 p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-semibold text-white">API Testing Client</h1>
            {environments.find(env => env.active) && (
              <div className="px-3 py-1 bg-green-600 text-white text-sm rounded-full">
                {environments.find(env => env.active)?.name}
              </div>
            )}
          </div>
          <button
            onClick={() => setShowEnvironmentManager(true)}
            className="flex items-center gap-2 px-3 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 transition-colors"
          >
            <Settings size={16} />
            Environments
          </button>
        </div>

        {/* Request/Response Area */}
        <div className="flex-1 flex">
          <RequestBuilder
            request={currentRequest}
            onRequestChange={setCurrentRequest}
            onSendRequest={sendRequest}
            onSaveRequest={saveRequest}
            isLoading={isLoading}
            environments={environments}
          />
          <ResponseViewer
            response={response}
            isLoading={isLoading}
            error={error}
          />
        </div>
      </div>

      {/* Environment Manager Modal */}
      <EnvironmentManager
        environments={environments}
        onEnvironmentsChange={setEnvironments}
        isOpen={showEnvironmentManager}
        onClose={() => setShowEnvironmentManager(false)}
      />
    </div>
  );
}

export default App;