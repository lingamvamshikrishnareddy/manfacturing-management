// components/production/ProductionLine.tsx — Real API integration
import React, { useState, useEffect } from 'react';
import { Pause, Settings, Zap, Clock, User, Package, AlertTriangle, RefreshCw } from 'lucide-react';
import { productionService } from '../../services/api';
import { CardSkeleton } from '../ui/Skeleton';

interface ProductionStation {
  id: string;
  name: string;
  status: 'running' | 'idle' | 'down' | 'maintenance';
  currentBatch?: string;
  efficiency: number;
  throughput: number;
  operator?: string;
}

const ProductionLine: React.FC = () => {
  const [stations, setStations] = useState<ProductionStation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true); setError(null);
    try {
      const res = await productionService.getLineStatus();
      const data = res.data?.data ?? res.data ?? [];
      setStations(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load line status');
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return { bg: 'bg-green-500', border: 'border-green-200', text: 'text-green-700', badge: 'bg-green-100' };
      case 'idle': return { bg: 'bg-yellow-500', border: 'border-yellow-200', text: 'text-yellow-700', badge: 'bg-yellow-100' };
      case 'down': return { bg: 'bg-red-500', border: 'border-red-200', text: 'text-red-700', badge: 'bg-red-100' };
      case 'maintenance': return { bg: 'bg-blue-500', border: 'border-blue-200', text: 'text-blue-700', badge: 'bg-blue-100' };
      default: return { bg: 'bg-gray-500', border: 'border-gray-200', text: 'text-gray-700', badge: 'bg-gray-100' };
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running': return Zap;
      case 'idle': return Pause;
      case 'down': return AlertTriangle;
      case 'maintenance': return Settings;
      default: return Settings;
    }
  };

  if (loading) return <div className="bg-white rounded-2xl shadow-card p-6"><CardSkeleton /></div>;

  if (error) {
    return (
      <div className="bg-white rounded-2xl shadow-card p-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-bold text-gray-900">Production Line Status</h2>
          <button onClick={fetchData} className="text-blue-600 hover:text-blue-700 text-sm flex items-center gap-1">
            <RefreshCw className="w-4 h-4" /> Retry
          </button>
        </div>
        <p className="text-red-600 text-sm">{error}</p>
      </div>
    );
  }

  const runningCount = stations.filter(s => s.status === 'running').length;

  return (
    <div className="bg-white rounded-2xl shadow-card overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-100 rounded-xl"><Zap className="h-5 w-5 text-blue-600" /></div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Production Line Status</h2>
              <p className="text-sm text-gray-500">{runningCount} of {stations.length} stations running</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={fetchData} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <RefreshCw className="w-4 h-4 text-gray-500" />
            </button>
            <button className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <Package className="w-4 h-4" /> Start New Batch
            </button>
          </div>
        </div>
      </div>

      {/* Stations Grid or Empty State */}
      <div className="p-6">
        {stations.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <Zap className="w-10 h-10 mx-auto mb-2 opacity-40" />
            <p>No production stations found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {stations.map((station, index) => {
              const colors = getStatusColor(station.status);
              const StatusIcon = getStatusIcon(station.status);
              return (
                <div key={station.id ?? index}
                  className={`group relative p-5 rounded-2xl border-2 transition-all duration-300 hover:shadow-lg animate-fade-in-up ${colors.border}`}
                  style={{ animationDelay: `${index * 0.05}s` }}>
                  {/* Status Indicator */}
                  <div className={`absolute top-3 right-3 w-3 h-3 rounded-full ${colors.bg} ${station.status === 'running' ? 'animate-pulse' : ''}`} />
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-2.5 rounded-xl ${colors.badge}`}>
                        <StatusIcon className={`h-5 w-5 ${colors.text}`} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{station.name}</h3>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${colors.badge} ${colors.text}`}>
                          {station.status.charAt(0).toUpperCase() + station.status.slice(1)}
                        </span>
                      </div>
                    </div>
                  </div>
                  {/* Batch Info */}
                  <div className="mb-4 p-3 bg-gray-50 rounded-xl">
                    {station.currentBatch
                      ? <><p className="text-xs text-gray-500 mb-1">Current Batch</p><p className="font-medium text-gray-900">{station.currentBatch}</p></>
                      : <p className="text-sm text-gray-500">No active batch</p>}
                  </div>
                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center gap-2"><Zap className="w-4 h-4 text-gray-400" /><div><p className="text-xs text-gray-500">Efficiency</p><p className="font-semibold">{station.efficiency}%</p></div></div>
                    <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-gray-400" /><div><p className="text-xs text-gray-500">Throughput</p><p className="font-semibold">{station.throughput}/hr</p></div></div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">{station.operator || 'Unassigned'}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductionLine;
