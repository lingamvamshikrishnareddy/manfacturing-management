// components/quality/QualityChecks.tsx
import React, { useState } from 'react';
import { CheckCircle, XCircle, Clock, Plus, Search, Filter, ClipboardCheck } from 'lucide-react';
import { CardSkeleton } from '../ui/Skeleton';

interface QualityCheck {
  id: string;
  batchNumber: string;
  productName: string;
  checkDate: string;
  status: 'passed' | 'failed' | 'pending';
  defects: number;
  inspector: string;
  notes: string;
}

const QualityChecks: React.FC = () => {
  const [qualityChecks, setQualityChecks] = useState<QualityCheck[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  React.useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      const mockData: QualityCheck[] = [
        {
          id: '1',
          batchNumber: 'BATCH-2024-001',
          productName: 'Industrial Gear Assembly',
          checkDate: '2024-01-25',
          status: 'passed',
          defects: 0,
          inspector: 'Jane Smith',
          notes: 'All checks passed'
        },
        {
          id: '2',
          batchNumber: 'BATCH-2024-002',
          productName: 'Steel Brackets',
          checkDate: '2024-01-24',
          status: 'failed',
          defects: 3,
          inspector: 'John Doe',
          notes: 'Dimensional issues detected'
        },
        {
          id: '3',
          batchNumber: 'BATCH-2024-003',
          productName: 'Hydraulic Pumps',
          checkDate: '2024-01-23',
          status: 'pending',
          defects: 0,
          inspector: 'Sarah Wilson',
          notes: 'Awaiting inspection'
        },
      ];
      setQualityChecks(mockData);
      setLoading(false);
    }, 800);
  }, []);

  const getStatusBadge = (status: string) => {
    const styles: Record<string, { bg: string; text: string; icon: React.ElementType }> = {
      passed: { bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle },
      failed: { bg: 'bg-red-100', text: 'text-red-700', icon: XCircle },
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: Clock },
    };
    
    const style = styles[status] || styles.pending;
    const Icon = style.icon;
    
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${style.bg} ${style.text}`}>
        <Icon className="w-3 h-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const filteredChecks = qualityChecks
    .filter(check => 
      check.batchNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      check.productName.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter(check => statusFilter === 'all' || check.status === statusFilter);

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
            <div className="p-2.5 bg-green-100 rounded-xl">
              <ClipboardCheck className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Quality Checks</h2>
              <p className="text-sm text-gray-500">{filteredChecks.length} checks</p>
            </div>
          </div>
          <button className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Plus className="w-4 h-4" />
            New Check
          </button>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-3 mt-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search checks..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              <option value="passed">Passed</option>
              <option value="failed">Failed</option>
              <option value="pending">Pending</option>
            </select>
          </div>
        </div>
      </div>

      {/* Checks List */}
      <div className="divide-y divide-gray-100 max-h-[400px] overflow-y-auto">
        {filteredChecks.map((check, index) => (
          <div 
            key={check.id}
            className="p-4 hover:bg-gray-50 transition-colors duration-200 animate-fade-in-up"
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-gray-900">{check.batchNumber}</h3>
                  {getStatusBadge(check.status)}
                </div>
                <p className="text-sm text-gray-600 mb-2">{check.productName}</p>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span>Inspector: {check.inspector}</span>
                  <span>{new Date(check.checkDate).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="text-right">
                <p className={`text-lg font-bold ${
                  check.status === 'passed' ? 'text-green-600' :
                  check.status === 'failed' ? 'text-red-600' :
                  'text-yellow-600'
                }`}>
                  {check.defects}
                </p>
                <p className="text-xs text-gray-500">defects</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default QualityChecks;
