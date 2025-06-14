import  { useState, useEffect } from 'react';
import { Settings } from 'lucide-react';
import Sidebar from './components/Sidebar';
import RequestBuilder from './components/RequestBuilder';
import ResponseViewer from './components/ResponseViewer';
import EnvironmentManager from './components/EnvironmentManager';
import { StorageService } from './utils/storage';
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

  // Load data from localStorage on mount
  useEffect(() => {
    setCollections(StorageService.loadCollections());
    setEnvironments(StorageService.loadEnvironments());
    setHistory(StorageService.loadHistory());

    axios.get("https://web-postman.onrender.com/history").then((res)=>{
      const result = res.data.data
      
      setHistory(result)
    })

  }, []);

  // Save collections when they change
  useEffect(() => {
    StorageService.saveCollections(collections);
  }, [collections]);

  // Save environments when they change
  useEffect(() => {
    StorageService.saveEnvironments(environments);
  }, [environments]);

  // Save history when it changes
  useEffect(() => {
    StorageService.saveHistory(history);
  }, [history]);

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

      const result = await axios.post("https://web-postman.onrender.com/proxy", {request: currentRequest, environment:activeEnv?.variables})
      console.log(response?.data)
      setResponse(result.data);
      
      // Add to history
      const historyItem: RequestHistory = {
        id: Date.now().toString(),
        request: { ...currentRequest },
        response: result.data,
        timestamp: new Date()
      };
      setHistory(prev => [...prev, historyItem]);
      
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