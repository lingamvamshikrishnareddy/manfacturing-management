// components/maintenance/MaintenanceRequests.tsx
import React, { useState } from 'react';
import { Wrench, Plus, Search, Filter, AlertTriangle, Clock, User } from 'lucide-react';
import { CardSkeleton } from '../ui/Skeleton';

interface MaintenanceRequest {
  id: string;
  equipmentId: string;
  equipmentName: string;
  requestType: string;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'in-progress' | 'completed';
  description: string;
  requestedBy: string;
  requestDate: string;
  assignedTo: string;
}

const MaintenanceRequests: React.FC = () => {
  const [requests, setRequests] = useState<MaintenanceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  React.useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      const mockRequests: MaintenanceRequest[] = [
        {
          id: '1',
          equipmentId: 'EQ001',
          equipmentName: 'CNC Machine #1',
          requestType: 'Breakdown',
          priority: 'high',
          status: 'in-progress',
          description: 'Machine stopped working unexpectedly',
          requestedBy: 'John Doe',
          requestDate: '2024-01-25',
          assignedTo: 'Tech Team'
        },
        {
          id: '2',
          equipmentId: 'EQ002',
          equipmentName: 'Assembly Line B',
          requestType: 'Repair',
          priority: 'medium',
          status: 'pending',
          description: 'Conveyor belt making unusual noise',
          requestedBy: 'Jane Smith',
          requestDate: '2024-01-24',
          assignedTo: ''
        },
        {
          id: '3',
          equipmentId: 'EQ003',
          equipmentName: 'Hydraulic Press',
          requestType: 'Maintenance',
          priority: 'low',
          status: 'completed',
          description: 'Scheduled oil change',
          requestedBy: 'Mike Johnson',
          requestDate: '2024-01-23',
          assignedTo: 'Maintenance Team'
        },
      ];
      setRequests(mockRequests);
      setLoading(false);
    }, 800);
  }, []);

  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'pending':
        return { bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-200' };
      case 'in-progress':
        return { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200' };
      case 'completed':
        return { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-200' };
      default:
        return { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-200' };
    }
  };

  const getPriorityStyles = (priority: string) => {
    switch (priority) {
      case 'high':
        return { bg: 'bg-red-100', text: 'text-red-700' };
      case 'medium':
        return { bg: 'bg-yellow-100', text: 'text-yellow-700' };
      case 'low':
        return { bg: 'bg-green-100', text: 'text-green-700' };
      default:
        return { bg: 'bg-gray-100', text: 'text-gray-700' };
    }
  };

  const filteredRequests = requests
    .filter(req => 
      req.equipmentName.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter(req => statusFilter === 'all' || req.status === statusFilter);

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
            <div className="p-2.5 bg-orange-100 rounded-xl">
              <Wrench className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Maintenance Requests</h2>
              <p className="text-sm text-gray-500">{filteredRequests.length} requests</p>
            </div>
          </div>
          <button className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Plus className="w-4 h-4" />
            New Request
          </button>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-3 mt-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search requests..."
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
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Requests List */}
      <div className="divide-y divide-gray-100 max-h-[400px] overflow-y-auto">
        {filteredRequests.map((request, index) => {
          const statusStyles = getStatusStyles(request.status);
          const priorityStyles = getPriorityStyles(request.priority);
          
          return (
            <div 
              key={request.id}
              className="p-4 hover:bg-gray-50 transition-colors duration-200 animate-fade-in-up"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className={`mt-1 p-2 rounded-xl ${
                    request.status === 'pending' ? 'bg-yellow-100' :
                    request.status === 'in-progress' ? 'bg-blue-100' :
                    'bg-green-100'
                  }`}>
                    {request.priority === 'high' ? (
                      <AlertTriangle className="h-5 w-5 text-red-500" />
                    ) : (
                      <Wrench className="h-5 w-5 text-gray-500" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900">{request.equipmentName}</h3>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyles.bg} ${statusStyles.text}`}>
                        {request.status.replace('-', ' ')}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{request.description}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span className={`px-2 py-0.5 rounded ${priorityStyles.bg} ${priorityStyles.text}`}>
                        {request.priority}
                      </span>
                      <span>{request.requestType}</span>
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="flex items-center gap-1 text-sm text-gray-500 mb-1">
                    <User className="w-4 h-4" />
                    <span>{request.requestedBy}</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-400">
                    <Clock className="w-3 h-3" />
                    <span>{new Date(request.requestDate).toLocaleDateString()}</span>
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

export default MaintenanceRequests;
