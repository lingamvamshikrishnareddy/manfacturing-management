// components/dashboard/ProductionOverview.tsx
import React, { useState, useEffect } from 'react';
import { Play, Pause, AlertCircle, BarChart3, Clock, Zap } from 'lucide-react';
import { productionAPI } from '../../services/api/productionAPI';
import { CardSkeleton } from '../ui/Skeleton';

interface ProductionLine {
  id: string;
  name: string;
  status: 'running' | 'stopped' | 'maintenance';
  efficiency: number;
  currentBatch: string;
  unitsProduced: number;
  targetUnits: number;
  startTime: string;
}

const ProductionOverview: React.FC = () => {
  const [productionLines, setProductionLines] = useState<ProductionLine[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProductionData = async () => {
      try {
        setLoading(true);
        const response = await productionAPI.getBatchInfo();
        const transformedData: ProductionLine[] = response.data.map((batch: any, index: number) => ({
          id: batch._id || batch.id || `line-${index}`,
          name: `Production Line ${index + 1}`,
          status: batch.status === 'completed' ? 'running' : batch.status === 'in-progress' ? 'running' : 'stopped',
          efficiency: batch.efficiency || 85 + Math.random() * 15,
          currentBatch: batch.workOrderId || batch.batchNumber || `B-2024-${String(index + 1).padStart(3, '0')}`,
          unitsProduced: batch.quantity || Math.floor(Math.random() * 200),
          targetUnits: batch.quantity ? batch.quantity + 50 : 200,
          startTime: batch.startDate ? new Date(batch.startDate).toLocaleTimeString() : '08:00 AM'
        }));
        setProductionLines(transformedData);
        setError(null);
      } catch (err: any) {
        setError('Failed to load production data');
        console.error('Error fetching production data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProductionData();
  }, []);

  const handleLineAction = (lineId: string, action: 'start' | 'stop') => {
    setProductionLines(prev => 
      prev.map(line => 
        line.id === lineId 
          ? { ...line, status: action === 'start' ? 'running' : 'stopped' }
          : line
      )
    );
  };

  const handleStartAllLines = () => {
    setProductionLines(prev => 
      prev.map(line => ({ ...line, status: 'running' as const }))
    );
  };

  const statusColors = {
    running: { bg: 'bg-green-100', text: 'text-green-700', dot: 'bg-green-500', icon: Zap },
    stopped: { bg: 'bg-red-100', text: 'text-red-700', dot: 'bg-red-500', icon: Pause },
    maintenance: { bg: 'bg-yellow-100', text: 'text-yellow-700', dot: 'bg-yellow-500', icon: AlertCircle },
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-card">
        <CardSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
        <div className="flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-red-500" />
          <p className="text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  // Calculate summary stats
  const runningCount = productionLines.filter(l => l.status === 'running').length;
  const avgEfficiency = productionLines.length > 0 
    ? Math.round(productionLines.reduce((acc, l) => acc + l.efficiency, 0) / productionLines.length)
    : 0;

  return (
    <div className="bg-white rounded-2xl shadow-card overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-100 rounded-xl">
              <BarChart3 className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Production Lines</h2>
              <p className="text-sm text-gray-500">{productionLines.length} lines total</p>
            </div>
          </div>
          <button
            onClick={handleStartAllLines}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg 
                       hover:bg-blue-700 active:scale-95 transition-all duration-200"
          >
            <Play className="w-4 h-4" />
            Start All Lines
          </button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4 mt-4">
          <div className="bg-green-50 rounded-xl p-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-sm text-green-700 font-medium">{runningCount} Running</span>
            </div>
          </div>
          <div className="bg-blue-50 rounded-xl p-3">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-blue-500" />
              <span className="text-sm text-blue-700 font-medium">{avgEfficiency}% Efficiency</span>
            </div>
          </div>
          <div className="bg-purple-50 rounded-xl p-3">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-purple-500" />
              <span className="text-sm text-purple-700 font-medium">{productionLines.length - runningCount} Stopped</span>
            </div>
          </div>
        </div>
      </div>

      {/* Production Lines List */}
      <div className="divide-y divide-gray-100">
        {productionLines.map((line, index) => {
          const colors = statusColors[line.status];
          const StatusIcon = colors.icon;
          const progress = line.targetUnits > 0 ? (line.unitsProduced / line.targetUnits) * 100 : 0;
          
          return (
            <div 
              key={line.id}
              className="p-4 hover:bg-gray-50 transition-colors duration-200 animate-fade-in-up"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-xl ${colors.bg}`}>
                    <StatusIcon className={`h-5 w-5 ${colors.text}`} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{line.name}</h3>
                    <p className="text-sm text-gray-500">Batch: {line.currentBatch}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  {/* Progress */}
                  <div className="hidden md:block w-32">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-500">{line.unitsProduced} units</span>
                      <span className="text-gray-700 font-medium">{progress.toFixed(0)}%</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-600 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(progress, 100)}%` }}
                      />
                    </div>
                  </div>
                  
                  {/* Efficiency Badge */}
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                    line.efficiency >= 90 ? 'bg-green-100 text-green-700' :
                    line.efficiency >= 70 ? 'bg-blue-100 text-blue-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                    {line.efficiency.toFixed(0)}%
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleLineAction(line.id, line.status === 'running' ? 'stop' : 'start')}
                      className={`p-2 rounded-lg transition-all duration-200 ${
                        line.status === 'running'
                          ? 'bg-red-100 text-red-600 hover:bg-red-200'
                          : 'bg-green-100 text-green-600 hover:bg-green-200'
                      }`}
                    >
                      {line.status === 'running' ? (
                        <Pause className="w-4 h-4" />
                      ) : (
                        <Play className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProductionOverview;
