import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent } from '../ui/card';
import { MaintenanceSchedule } from '../../types';
import { Wrench, Calendar, User, Clock, ArrowRight } from 'lucide-react';
import Skeleton from '../ui/Skeleton';

const PreventiveMaintenance: React.FC = () => {
  const [schedules, setSchedules] = useState<MaintenanceSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSchedule, setSelectedSchedule] = useState<MaintenanceSchedule | null>(null);

  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      const mockSchedules: MaintenanceSchedule[] = [
        {
          id: '1',
          equipmentId: 'EQ001',
          equipmentName: 'CNC Machine #1',
          maintenanceType: 'Oil Change',
          frequency: 'Monthly',
          nextDue: '2026-02-28',
          procedures: ['Check oil levels', 'Replace oil filter', 'Clean components'],
          lastPerformed: '2026-01-28',
          assignedTechnician: 'John Smith',
          estimatedDuration: 2,
          priority: 'medium',
        },
        {
          id: '2',
          equipmentId: 'EQ002',
          equipmentName: 'Press Machine #2',
          maintenanceType: 'Full Service',
          frequency: 'Quarterly',
          nextDue: '2026-03-15',
          procedures: ['Complete inspection', 'Replace worn parts', 'Lubricate moving parts', 'Calibrate sensors'],
          lastPerformed: '2025-12-15',
          assignedTechnician: 'Mike Johnson',
          estimatedDuration: 4,
          priority: 'high',
        },
        {
          id: '3',
          equipmentId: 'EQ003',
          equipmentName: 'Conveyor Belt #1',
          maintenanceType: 'Belt Tension',
          frequency: 'Weekly',
          nextDue: '2026-02-25',
          procedures: ['Check tension', 'Inspect for wear', 'Adjust if needed'],
          lastPerformed: '2026-02-18',
          assignedTechnician: 'Sarah Davis',
          estimatedDuration: 1,
          priority: 'low',
        },
        {
          id: '4',
          equipmentId: 'EQ004',
          equipmentName: 'Robotic Arm #1',
          maintenanceType: 'Calibration',
          frequency: 'Monthly',
          nextDue: '2026-03-01',
          procedures: ['Check axis alignment', 'Recalibrate sensors', 'Update firmware'],
          lastPerformed: '2026-02-01',
          assignedTechnician: 'Tom Wilson',
          estimatedDuration: 3,
          priority: 'medium',
        },
      ];
      setSchedules(mockSchedules);
      setLoading(false);
    }, 800);
  }, []);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200', dot: 'bg-red-500' };
      case 'medium':
        return { bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-200', dot: 'bg-yellow-500' };
      case 'low':
        return { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-200', dot: 'bg-green-500' };
      default:
        return { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-200', dot: 'bg-gray-500' };
    }
  };

  const getDaysUntilDue = (dateString: string) => {
    const dueDate = new Date(dateString);
    const today = new Date();
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (loading) {
    return (
      <Card className="w-full overflow-hidden">
        <CardHeader className="border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-100 rounded-xl">
              <Wrench className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Preventive Maintenance</h2>
              <p className="text-sm text-gray-500">Schedule and track maintenance tasks</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center gap-4 p-4">
                <Skeleton className="h-12 w-12 rounded-xl" />
                <div className="flex-1">
                  <Skeleton className="h-5 w-48 mb-2" />
                  <Skeleton className="h-4 w-32" />
                </div>
                <Skeleton className="h-8 w-24 rounded-full" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full overflow-hidden">
      <CardHeader className="border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-100 rounded-xl">
              <Wrench className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Preventive Maintenance</h2>
              <p className="text-sm text-gray-500">{schedules.length} scheduled tasks</p>
            </div>
          </div>
          <button className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Calendar className="w-4 h-4" />
            Schedule Maintenance
          </button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-0">
          {/* Maintenance List */}
          <div className="col-span-2 divide-y divide-gray-100 max-h-[450px] overflow-y-auto">
            {schedules.map((schedule, index) => {
              const priorityStyles = getPriorityColor(schedule.priority);
              const daysUntil = getDaysUntilDue(schedule.nextDue);
              const isSelected = selectedSchedule?.id === schedule.id;
              const isOverdue = daysUntil < 0;

              return (
                <button
                  key={schedule.id}
                  onClick={() => setSelectedSchedule(schedule)}
                  className={`w-full p-4 text-left hover:bg-gray-50 transition-all duration-200 animate-fade-in-up ${isSelected ? 'bg-blue-50' : ''
                    }`}
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className={`mt-1 p-2 rounded-xl ${priorityStyles.bg}`}>
                        <Wrench className={`h-4 w-4 ${priorityStyles.text}`} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-gray-900">{schedule.equipmentName}</h3>
                          {isOverdue && (
                            <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded text-xs font-medium">
                              Overdue
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{schedule.maintenanceType}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            {schedule.nextDue}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {schedule.estimatedDuration}h
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${priorityStyles.bg} ${priorityStyles.text}`}>
                        {schedule.priority}
                      </span>
                      <span className={`text-xs font-medium ${isOverdue ? 'text-red-600' : daysUntil <= 3 ? 'text-yellow-600' : 'text-green-600'}`}>
                        {isOverdue ? `${Math.abs(daysUntil)} days overdue` : daysUntil === 0 ? 'Due today' : `${daysUntil} days`}
                      </span>
                      <ArrowRight className={`w-4 h-4 text-gray-400 ${isSelected ? 'text-blue-500' : ''}`} />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Schedule Details */}
          <div className="border-t lg:border-t-0 lg:border-l border-gray-100 p-6 bg-gradient-to-br from-gray-50 to-white">
            {selectedSchedule ? (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{selectedSchedule.equipmentName}</h3>
                  <p className="text-sm text-gray-500">{selectedSchedule.maintenanceType}</p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-100">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4" />
                      Next Due
                    </div>
                    <span className="font-medium text-gray-900">{selectedSchedule.nextDue}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-100">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="w-4 h-4" />
                      Estimated Duration
                    </div>
                    <span className="font-medium text-gray-900">{selectedSchedule.estimatedDuration} hours</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-100">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <User className="w-4 h-4" />
                      Assigned To
                    </div>
                    <span className="font-medium text-gray-900">{selectedSchedule.assignedTechnician}</span>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">Maintenance Procedures</h4>
                  <div className="space-y-2">
                    {selectedSchedule.procedures.map((proc, index) => (
                      <div key={index} className="flex items-start gap-2 p-3 bg-white rounded-lg border border-gray-100">
                        <div className="mt-0.5 w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center text-xs text-gray-500">
                          {index + 1}
                        </div>
                        <span className="text-sm text-gray-700">{proc}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <button className="w-full py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
                  Mark as Completed
                </button>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center py-8">
                <div className="p-4 bg-gray-100 rounded-full mb-4">
                  <Wrench className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-500">Select a maintenance schedule to view details</p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PreventiveMaintenance;
