import  { useState } from 'react';
import { Plus, Edit3, Trash2, Check, X, Settings } from 'lucide-react';
import type { Environment } from '../types/api';

interface EnvironmentManagerProps {
  environments: Environment[];
  onEnvironmentsChange: (environments: Environment[]) => void;
  isOpen: boolean;
  onClose: () => void;
}

export default function EnvironmentManager({
  environments,
  onEnvironmentsChange,
  isOpen,
  onClose
}: EnvironmentManagerProps) {
  const [editingEnv, setEditingEnv] = useState<string | null>(null);
  const [newEnvName, setNewEnvName] = useState('');
  // const [editingVar, setEditingVar] = useState<{ envId: string; key: string } | null>(null);

  if (!isOpen) return null;

  const createEnvironment = () => {
    if (!newEnvName.trim()) return;
    
    const newEnv: Environment = {
      id: Date.now().toString(),
      name: newEnvName,
      variables: {},
      active: environments.length === 0
    };
    
    onEnvironmentsChange([...environments, newEnv]);
    setNewEnvName('');
  };

  const deleteEnvironment = (id: string) => {
    const updatedEnvs = environments.filter(env => env.id !== id);
    if (updatedEnvs.length > 0 && environments.find(env => env.id === id)?.active) {
      updatedEnvs[0].active = true;
    }
    onEnvironmentsChange(updatedEnvs);
  };

  const setActiveEnvironment = (id: string) => {
    onEnvironmentsChange(
      environments.map(env => ({
        ...env,
        active: env.id === id
      }))
    );
  };

  const updateEnvironmentName = (id: string, name: string) => {
    onEnvironmentsChange(
      environments.map(env =>
        env.id === id ? { ...env, name } : env
      )
    );
  };

  const addVariable = (envId: string) => {
    onEnvironmentsChange(
      environments.map(env =>
        env.id === envId
          ? { ...env, variables: { ...env.variables, '': '' } }
          : env
      )
    );
  };

  const updateVariable = (envId: string, oldKey: string, newKey: string, value: string) => {
    onEnvironmentsChange(
      environments.map(env => {
        if (env.id === envId) {
          const newVariables = { ...env.variables };
          if (oldKey !== newKey) {
            delete newVariables[oldKey];
          }
          newVariables[newKey] = value;
          return { ...env, variables: newVariables };
        }
        return env;
      })
    );
  };

  const deleteVariable = (envId: string, key: string) => {
    onEnvironmentsChange(
      environments.map(env => {
        if (env.id === envId) {
          const newVariables = { ...env.variables };
          delete newVariables[key];
          return { ...env, variables: newVariables };
        }
        return env;
      })
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-4xl max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            <Settings size={20} />
            Environment Manager
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Create New Environment */}
        <div className="mb-6 p-4 bg-gray-700 rounded-lg">
          <h3 className="text-white font-semibold mb-3">Create New Environment</h3>
          <div className="flex gap-2">
            <input
              type="text"
              value={newEnvName}
              onChange={(e) => setNewEnvName(e.target.value)}
              placeholder="Environment name"
              className="flex-1 bg-gray-600 text-white px-3 py-2 rounded-md border border-gray-500 focus:border-blue-500 focus:outline-none"
              onKeyPress={(e) => e.key === 'Enter' && createEnvironment()}
            />
            <button
              onClick={createEnvironment}
              className="flex items-center gap-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <Plus size={16} />
              Create
            </button>
          </div>
        </div>

        {/* Environments List */}
        <div className="space-y-4">
          {environments.map((env) => (
            <div key={env.id} className="border border-gray-600 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  {editingEnv === env.id ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={env.name}
                        onChange={(e) => updateEnvironmentName(env.id, e.target.value)}
                        className="bg-gray-600 text-white px-3 py-1 rounded-md border border-gray-500 focus:border-blue-500 focus:outline-none"
                        onKeyPress={(e) => e.key === 'Enter' && setEditingEnv(null)}
                        autoFocus
                      />
                      <button
                        onClick={() => setEditingEnv(null)}
                        className="text-green-400 hover:text-green-300"
                      >
                        <Check size={16} />
                      </button>
                    </div>
                  ) : (
                    <>
                      <h3 className="text-white font-semibold">{env.name}</h3>
                      <button
                        onClick={() => setEditingEnv(env.id)}
                        className="text-gray-400 hover:text-white"
                      >
                        <Edit3 size={16} />
                      </button>
                    </>
                  )}
                  {env.active && (
                    <span className="px-2 py-1 bg-green-600 text-white text-xs rounded">
                      Active
                    </span>
                  )}
                </div>
                
                <div className="flex items-center gap-2">
                  {!env.active && (
                    <button
                      onClick={() => setActiveEnvironment(env.id)}
                      className="px-3 py-1 bg-gray-600 text-white rounded-md hover:bg-gray-500 transition-colors"
                    >
                      Set Active
                    </button>
                  )}
                  <button
                    onClick={() => deleteEnvironment(env.id)}
                    className="text-red-400 hover:text-red-300"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              {/* Variables */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-gray-300 font-medium">Variables</h4>
                  <button
                    onClick={() => addVariable(env.id)}
                    className="flex items-center gap-1 px-2 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
                  >
                    <Plus size={14} />
                    Add
                  </button>
                </div>
                
                <div className="space-y-2">
                  {Object.entries(env.variables).map(([key, value], index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={key}
                        onChange={(e) => updateVariable(env.id, key, e.target.value, value)}
                        placeholder="Variable name"
                        className="flex-1 bg-gray-600 text-white px-3 py-2 rounded-md border border-gray-500 focus:border-blue-500 focus:outline-none"
                      />
                      <input
                        type="text"
                        value={value}
                        onChange={(e) => updateVariable(env.id, key, key, e.target.value)}
                        placeholder="Variable value"
                        className="flex-1 bg-gray-600 text-white px-3 py-2 rounded-md border border-gray-500 focus:border-blue-500 focus:outline-none"
                      />
                      <button
                        onClick={() => deleteVariable(env.id, key)}
                        className="px-3 py-2 text-red-400 hover:text-red-300 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                  {Object.keys(env.variables).length === 0 && (
                    <div className="text-gray-500 text-center py-4">
                      No variables yet. Click "Add" to create one.
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
          
          {environments.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Settings size={48} className="mx-auto mb-2 opacity-50" />
              <p>No environments created yet</p>
              <p className="text-sm">Create your first environment above</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}