// components/quality/DefectTracking.tsx
import React, { useState } from 'react';
import { AlertTriangle, AlertCircle, CheckCircle, Clock, User, ArrowRight } from 'lucide-react';
import { CardSkeleton } from '../ui/Skeleton';

interface Defect {
  id: string;
  batchNumber: string;
  defectType: string;
  severity: 'low' | 'medium' | 'high';
  status: 'open' | 'investigating' | 'resolved' | 'closed';
  discoveredDate: string;
  description: string;
  discoveredBy: string;
  assignedTo: string;
}

const DefectTracking: React.FC = () => {
  const [defects, setDefects] = useState<Defect[]>([]);
  const [selectedDefect, setSelectedDefect] = useState<Defect | null>(null);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      const mockDefects: Defect[] = [
        {
          id: '1',
          batchNumber: 'BATCH-2024-001',
          defectType: 'Surface Scratch',
          severity: 'low',
          status: 'investigating',
          discoveredDate: '2024-01-25',
          description: 'Minor surface scratch on product surface detected during final inspection.',
          discoveredBy: 'John Smith',
          assignedTo: 'Quality Team'
        },
        {
          id: '2',
          batchNumber: 'BATCH-2024-002',
          defectType: 'Dimensional Variance',
          severity: 'high',
          status: 'open',
          discoveredDate: '2024-01-24',
          description: 'Product dimensions exceed tolerance limits by 0.5mm.',
          discoveredBy: 'Jane Doe',
          assignedTo: 'Engineering Team'
        },
        {
          id: '3',
          batchNumber: 'BATCH-2024-003',
          defectType: 'Color Mismatch',
          severity: 'medium',
          status: 'resolved',
          discoveredDate: '2024-01-23',
          description: 'Product color slightly different from standard. Issue resolved by adjusting dye.',
          discoveredBy: 'Mike Johnson',
          assignedTo: 'Production Team'
        },
      ];
      setDefects(mockDefects);
      setLoading(false);
    }, 800);
  }, []);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low':
        return { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-200' };
      case 'medium':
        return { bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-200' };
      case 'high':
        return { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200' };
      default:
        return { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-200' };
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return { bg: 'bg-red-100', text: 'text-red-700', icon: AlertCircle };
      case 'investigating':
        return { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: Clock };
      case 'resolved':
        return { bg: 'bg-blue-100', text: 'text-blue-700', icon: CheckCircle };
      case 'closed':
        return { bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle };
      default:
        return { bg: 'bg-gray-100', text: 'text-gray-700', icon: AlertTriangle };
    }
  };

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
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-red-100 rounded-xl">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Defect Tracking</h2>
              <p className="text-sm text-gray-500">{defects.length} defects</p>
            </div>
          </div>
          <button className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
            <AlertTriangle className="w-4 h-4" />
            Report Defect
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row">
        {/* Defects List */}
        <div className="flex-1 divide-y divide-gray-100 max-h-[400px] overflow-y-auto">
          {defects.map((defect, index) => {
            const severityStyles = getSeverityColor(defect.severity);
            const statusStyles = getStatusColor(defect.status);
            const isSelected = selectedDefect?.id === defect.id;
            
            return (
              <button
                key={defect.id}
                onClick={() => setSelectedDefect(defect)}
                className={`w-full p-4 text-left hover:bg-gray-50 transition-colors duration-200 animate-fade-in-up ${
                  isSelected ? 'bg-blue-50' : ''
                }`}
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className={`mt-1 p-1.5 rounded-lg ${severityStyles.bg}`}>
                      <AlertTriangle className={`h-4 w-4 ${severityStyles.text}`} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900">{defect.defectType}</h3>
                      </div>
                      <p className="text-sm text-gray-600 mb-1">{defect.batchNumber}</p>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${severityStyles.bg} ${severityStyles.text}`}>
                          {defect.severity}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${statusStyles.bg} ${statusStyles.text}`}>
                          {defect.status}
                        </span>
                      </div>
                    </div>
                  </div>
                  <ArrowRight className={`w-4 h-4 text-gray-400 ${isSelected ? 'text-blue-500' : ''}`} />
                </div>
              </button>
            );
          })}
        </div>

        {/* Defect Details */}
        {selectedDefect && (
          <div className="w-full lg:w-80 border-t lg:border-t-0 lg:border-l border-gray-100 p-6 bg-gray-50">
            <h3 className="font-semibold text-gray-900 mb-4">{selectedDefect.defectType}</h3>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-gray-500 mb-1">Batch Number</p>
                <p className="font-medium text-gray-900">{selectedDefect.batchNumber}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Discovered Date</p>
                <p className="font-medium text-gray-900">{new Date(selectedDefect.discoveredDate).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Discovered By</p>
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-400" />
                  <p className="font-medium text-gray-900">{selectedDefect.discoveredBy}</p>
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Assigned To</p>
                <p className="font-medium text-gray-900">{selectedDefect.assignedTo}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Description</p>
                <p className="text-sm text-gray-700">{selectedDefect.description}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DefectTracking;
