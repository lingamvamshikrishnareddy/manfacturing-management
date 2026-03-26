import React, { useState } from 'react';
import { History, Calendar, Clock, Wrench, Download, Filter, ChevronRight } from 'lucide-react';
import { CardSkeleton } from '../ui/Skeleton';

interface MaintenanceRecord {
  id: string;
  equipmentId: string;
  equipmentName: string;
  maintenanceType: string;
  date: string;
  technician: string;
  description: string;
  status: string;
}

const EquipmentHistory: React.FC = () => {
  const [records] = useState<MaintenanceRecord[]>([
    {
      id: '1',
      equipmentId: 'EQ001',
      equipmentName: 'CNC Machine 1',
      maintenanceType: 'Preventive',
      date: '2024-03-15',
      technician: 'John Doe',
      description: 'Regular maintenance check and lubrication',
      status: 'Completed'
    },
    {
      id: '2',
      equipmentId: 'EQ002',
      equipmentName: 'Press Machine A',
      maintenanceType: 'Corrective',
      date: '2024-03-10',
      technician: 'Mike Johnson',
      description: 'Replaced worn hydraulic seals',
      status: 'Completed'
    },
    {
      id: '3',
      equipmentId: 'EQ003',
      equipmentName: 'Conveyor Belt System',
      maintenanceType: 'Preventive',
      date: '2024-03-08',
      technician: 'Sarah Williams',
      description: 'Belt tension adjustment and inspection',
      status: 'Completed'
    },
    {
      id: '4',
      equipmentId: 'EQ001',
      equipmentName: 'CNC Machine 1',
      maintenanceType: 'Predictive',
      date: '2024-03-01',
      technician: 'John Doe',
      description: 'Vibration analysis and bearing inspection',
      status: 'Completed'
    },
  ]);
  const [loading] = useState(false);

  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'Completed':
        return { bg: 'bg-green-100', text: 'text-green-700', icon: '✓' };
      case 'In Progress':
        return { bg: 'bg-blue-100', text: 'text-blue-700', icon: '⟳' };
      case 'Pending':
        return { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: '⏱' };
      default:
        return { bg: 'bg-gray-100', text: 'text-gray-700', icon: '•' };
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Preventive':
        return 'bg-blue-100 text-blue-700';
      case 'Corrective':
        return 'bg-orange-100 text-orange-700';
      case 'Predictive':
        return 'bg-purple-100 text-purple-700';
      default:
        return 'bg-gray-100 text-gray-700';
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
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-100 rounded-xl">
              <History className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Maintenance History</h2>
              <p className="text-sm text-gray-500">{records.length} records</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
              <Filter className="w-4 h-4" />
              Filter
            </button>
            <button className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Timeline View */}
      <div className="p-6">
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200" />

          <div className="space-y-6">
            {records.map((record, index) => {
              const statusStyles = getStatusStyles(record.status);
              
              return (
                <div 
                  key={record.id}
                  className="relative flex items-start gap-4 pl-12 animate-fade-in-up"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  {/* Timeline dot */}
                  <div className={`absolute left-4 w-5 h-5 rounded-full border-4 border-white ${statusStyles.bg.replace('bg-', 'bg-')}`} 
                       style={{ backgroundColor: statusStyles.text.includes('green') ? '#22c55e' : statusStyles.text.includes('blue') ? '#3b82f6' : '#eab308' }}>
                    <div className={`absolute inset-0.5 rounded-full ${statusStyles.bg}`} />
                  </div>

                  {/* Card */}
                  <div className="flex-1 p-4 rounded-2xl border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all duration-300">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-gray-100 rounded-xl">
                          <Wrench className="h-5 w-5 text-gray-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{record.equipmentName}</h3>
                          <p className="text-sm text-gray-600 mt-0.5">{record.description}</p>
                          
                          <div className="flex flex-wrap items-center gap-2 mt-2">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getTypeColor(record.maintenanceType)}`}>
                              {record.maintenanceType}
                            </span>
                            <span className="flex items-center gap-1 text-xs text-gray-500">
                              <Calendar className="w-3 h-3" />
                              {new Date(record.date).toLocaleDateString()}
                            </span>
                            <span className="flex items-center gap-1 text-xs text-gray-500">
                              <Clock className="w-3 h-3" />
                              {record.technician}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusStyles.bg} ${statusStyles.text}`}>
                          {statusStyles.icon} {record.status}
                        </span>
                        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                          <ChevronRight className="w-4 h-4 text-gray-400" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EquipmentHistory;
