// components/production/SchedulePlanner.tsx
import React, { useState } from 'react';
import { Calendar, Clock, MapPin, Users, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { CardSkeleton } from '../ui/Skeleton';

interface ScheduleEvent {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  type: 'production' | 'maintenance' | 'break';
  priority: 'high' | 'medium' | 'low';
  status: 'planned' | 'in-progress' | 'completed';
  assignedTo: string[];
  location: string;
}

const SchedulePlanner: React.FC = () => {
  const [events, setEvents] = useState<ScheduleEvent[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);
  const [currentWeek, setCurrentWeek] = useState(new Date());

  React.useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      const today = new Date().toISOString().split('T')[0];
      const mockEvents: ScheduleEvent[] = [
        {
          id: '1',
          title: 'Production Run A',
          description: 'Manufacturing batch #001',
          startDate: today,
          endDate: today,
          startTime: '09:00',
          endTime: '17:00',
          type: 'production',
          priority: 'high',
          status: 'planned',
          assignedTo: ['John Doe', 'Jane Smith'],
          location: 'Floor 1',
        },
        {
          id: '2',
          title: 'Machine Maintenance',
          description: 'Scheduled maintenance for CNC',
          startDate: today,
          endDate: today,
          startTime: '08:00',
          endTime: '10:00',
          type: 'maintenance',
          priority: 'medium',
          status: 'planned',
          assignedTo: ['Mike Johnson'],
          location: 'Floor 2',
        },
        {
          id: '3',
          title: 'Shift Break',
          description: 'Lunch break',
          startDate: today,
          endDate: today,
          startTime: '12:00',
          endTime: '13:00',
          type: 'break',
          priority: 'low',
          status: 'planned',
          assignedTo: [],
          location: 'Break Room',
        },
      ];
      setEvents(mockEvents);
      setLoading(false);
    }, 800);
  }, [selectedDate]);

  const getTypeStyles = (type: string) => {
    switch (type) {
      case 'production':
        return { bg: 'bg-blue-100', border: 'border-blue-300', text: 'text-blue-700' };
      case 'maintenance':
        return { bg: 'bg-orange-100', border: 'border-orange-300', text: 'text-orange-700' };
      case 'break':
        return { bg: 'bg-gray-100', border: 'border-gray-300', text: 'text-gray-700' };
      default:
        return { bg: 'bg-gray-100', border: 'border-gray-300', text: 'text-gray-700' };
    }
  };

  const getEventsForDate = (date: string) => {
    return events.filter((event) => event.startDate === date);
  };

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const getDaysOfWeek = (date: Date) => {
    const start = new Date(date);
    start.setDate(start.getDate() - start.getDay());
    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(start);
      day.setDate(start.getDate() + i);
      days.push(day);
    }
    return days;
  };

  const days = getDaysOfWeek(currentWeek);

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
            <div className="p-2.5 bg-green-100 rounded-xl">
              <Calendar className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Schedule Planner</h2>
              <p className="text-sm text-gray-500">Plan and manage production schedule</p>
            </div>
          </div>
          <button className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Plus className="w-4 h-4" />
            Add Event
          </button>
        </div>
      </div>

      {/* Calendar */}
      <div className="p-6">
        {/* Week Navigation */}
        <div className="flex items-center justify-between mb-4">
          <button 
            onClick={() => setCurrentWeek(new Date(currentWeek.setDate(currentWeek.getDate() - 7)))}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h3 className="font-semibold text-gray-900">
            {days[0].toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </h3>
          <button 
            onClick={() => setCurrentWeek(new Date(currentWeek.setDate(currentWeek.getDate() + 7)))}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 gap-2 mb-6">
          {days.map((day, index) => {
            const dateStr = day.toISOString().split('T')[0];
            const isToday = dateStr === new Date().toISOString().split('T')[0];
            const dayEvents = getEventsForDate(dateStr);
            
            return (
              <button
                key={index}
                onClick={() => setSelectedDate(dateStr)}
                className={`p-2 rounded-xl transition-all duration-200 ${
                  selectedDate === dateStr
                    ? 'bg-blue-600 text-white'
                    : isToday
                    ? 'bg-blue-50 text-blue-600'
                    : 'hover:bg-gray-50'
                }`}
              >
                <div className="text-xs font-medium mb-1">{weekDays[index]}</div>
                <div className={`text-lg font-bold ${isToday && selectedDate !== dateStr ? 'text-blue-600' : ''}`}>
                  {day.getDate()}
                </div>
                {dayEvents.length > 0 && (
                  <div className={`mt-1 text-xs ${selectedDate === dateStr ? 'text-blue-200' : 'text-gray-500'}`}>
                    {dayEvents.length} events
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Events for Selected Date */}
        <div>
          <h4 className="font-semibold text-gray-900 mb-3">
            Events for {new Date(selectedDate).toLocaleDateString('en-US', { 
              weekday: 'long', 
              month: 'short', 
              day: 'numeric' 
            })}
          </h4>
          <div className="space-y-3">
            {getEventsForDate(selectedDate).map((event, index) => {
              const typeStyles = getTypeStyles(event.type);
              
              return (
                <div
                  key={event.id}
                  className={`p-4 rounded-xl border-l-4 ${typeStyles.bg} animate-fade-in-up`}
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h5 className="font-semibold text-gray-900">{event.title}</h5>
                      <p className="text-sm text-gray-600 mt-1">{event.description}</p>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${typeStyles.bg} ${typeStyles.text}`}>
                      {event.type}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {event.startTime} - {event.endTime}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {event.location}
                    </span>
                    {event.assignedTo.length > 0 && (
                      <span className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {event.assignedTo.length} assigned
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
            {getEventsForDate(selectedDate).length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No events scheduled for this day
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SchedulePlanner;
