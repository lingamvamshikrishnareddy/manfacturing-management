// components/production/BatchTracking.tsx
import React, { useState } from 'react';
import { Activity, Search, Filter, FileText, Package, CheckCircle, XCircle, Clock } from 'lucide-react';
import { CardSkeleton } from '../ui/Skeleton';

interface BatchRecord {
  id: string;
  batchNumber: string;
  productName: string;
  startTime: string;
  endTime: string;
  quantity: number;
  status: 'in-production' | 'completed' | 'quarantined' | 'released';
  workOrderId: string;
  qualityStatus: 'passed' | 'failed' | 'pending';
  yield: number;
  operators: string[];
}

const BatchTracking: React.FC = () => {
  const [batches, setBatches] = useState<BatchRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      const mockBatches: BatchRecord[] = [
        {
          id: '1',
          batchNumber: 'BAT-2024-001',
          productName: 'Industrial Gear Assembly',
          startTime: '2024-01-25T08:00:00',
          endTime: '2024-01-25T16:00:00',
          quantity: 500,
          status: 'completed',
          workOrderId: 'WO-2024-001',
          qualityStatus: 'passed',
          yield: 98.5,
          operators: ['John Doe', 'Jane Smith']
        },
        {
          id: '2',
          batchNumber: 'BAT-2024-002',
          productName: 'Steel Brackets',
          startTime: '2024-01-26T08:00:00',
          endTime: '',
          quantity: 1200,
          status: 'in-production',
          workOrderId: 'WO-2024-002',
          qualityStatus: 'pending',
          yield: 0,
          operators: ['Mike Johnson']
        },
        {
          id: '3',
          batchNumber: 'BAT-2024-003',
          productName: 'Hydraulic Pumps',
          startTime: '2024-01-24T08:00:00',
          endTime: '2024-01-24T18:00:00',
          quantity: 250,
          status: 'quarantined',
          workOrderId: 'WO-2024-003',
          qualityStatus: 'failed',
          yield: 85.2,
          operators: ['Sarah Wilson']
        },
      ];
      setBatches(mockBatches);
      setLoading(false);
    }, 800);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in-production':
        return { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200' };
      case 'completed':
        return { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-200' };
      case 'quarantined':
        return { bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-200' };
      case 'released':
        return { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-200' };
      default:
        return { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-200' };
    }
  };

  const getQualityIcon = (status: string) => {
    switch (status) {
      case 'passed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      default:
        return <Activity className="w-5 h-5 text-gray-500" />;
    }
  };

  const filteredBatches = batches
    .filter(batch => 
      batch.batchNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      batch.productName.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter(batch => statusFilter === 'all' || batch.status === statusFilter);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-card p-6">
        <CardSkeleton />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-card overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-100 rounded-xl">
              <Package className="h-5 w-5 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Batch Tracking</h2>
              <p className="text-sm text-gray-500">{filteredBatches.length} batches</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button className="px-4 py-2 text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors">
              Export Data
            </button>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              New Batch
            </button>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-3 mt-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search batches..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              className="px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="in-production">In Production</option>
              <option value="completed">Completed</option>
              <option value="quarantined">Quarantined</option>
              <option value="released">Released</option>
            </select>
          </div>
        </div>
      </div>

      {/* Batches List */}
      <div className="divide-y divide-gray-100 max-h-[500px] overflow-y-auto">
        {filteredBatches.map((batch, index) => {
          const colors = getStatusColor(batch.status);
          
          return (
            <div 
              key={batch.id}
              className="p-4 hover:bg-gray-50 transition-colors duration-200 animate-fade-in-up"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className={`mt-1 p-2 rounded-xl ${colors.bg}`}>
                    <Package className={`h-5 w-5 ${colors.text}`} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900">{batch.batchNumber}</h3>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${colors.bg} ${colors.text}`}>
                        {batch.status.replace('-', ' ')}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{batch.productName}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>WO: {batch.workOrderId}</span>
                      <span>{batch.operators.length} operators</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="flex items-center gap-1">
                      {getQualityIcon(batch.qualityStatus)}
                      <span className={`text-sm font-medium ${
                        batch.qualityStatus === 'passed' ? 'text-green-600' :
                        batch.qualityStatus === 'failed' ? 'text-red-600' :
                        'text-yellow-600'
                      }`}>
                        {batch.qualityStatus}
                      </span>
                    </div>
                  </div>
                  <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                    <FileText className="h-5 w-5 text-gray-400" />
                  </button>
                </div>
              </div>

              {/* Batch Details */}
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-xs text-gray-500">Quantity</p>
                    <p className="font-semibold text-gray-900">{batch.quantity.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Started</p>
                    <p className="font-medium text-gray-900">
                      {batch.startTime ? new Date(batch.startTime).toLocaleDateString() : '-'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Ended</p>
                    <p className="font-medium text-gray-900">
                      {batch.endTime ? new Date(batch.endTime).toLocaleDateString() : 'In Progress'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Yield</p>
                    <p className={`font-semibold ${
                      batch.yield >= 95 ? 'text-green-600' :
                      batch.yield >= 80 ? 'text-yellow-600' :
                      batch.yield > 0 ? 'text-red-600' : 'text-gray-400'
                    }`}>
                      {batch.yield > 0 ? `${batch.yield}%` : '-'}
                    </p>
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

export default BatchTracking;
