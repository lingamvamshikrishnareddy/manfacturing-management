// components/production/SchedulePlanner.tsx — Real API integration
import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, Users, Plus, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';
import { productionService } from '../../services/api';
import { Modal } from '../shared/Modal';
import { useToast } from '../shared/Toast';
import { CardSkeleton } from '../ui/Skeleton';

const SchedulePlanner: React.FC = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { success, error: toastError } = useToast();

  const [form, setForm] = useState({
    title: '', date: '', time: '', location: '', description: '',
  });

  const fetchData = async () => {
    setLoading(true); setError(null);
    try {
      const res = await productionService.getSchedule();
      const data = res.data?.data ?? res.data ?? [];
      setEvents(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load schedule');
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.date) { toastError('Title and date are required'); return; }
    setSubmitting(true);
    try {
      await productionService.createScheduleEvent({
        title: form.title,
        startDate: form.date,
        startTime: form.time,
        location: form.location,
        description: form.description,
        type: 'production',
        status: 'planned',
      });
      success('Event added to schedule');
      setShowModal(false);
      setForm({ title: '', date: '', time: '', location: '', description: '' });
      fetchData();
    } catch (err: any) {
      toastError(err.response?.data?.message || 'Failed to create event');
    } finally { setSubmitting(false); }
  };

  const getTypeStyles = (type: string) => {
    switch (type) {
      case 'production': return { bg: 'bg-blue-100', border: 'border-blue-300', text: 'text-blue-700' };
      case 'maintenance': return { bg: 'bg-orange-100', border: 'border-orange-300', text: 'text-orange-700' };
      case 'break': return { bg: 'bg-gray-100', border: 'border-gray-300', text: 'text-gray-700' };
      default: return { bg: 'bg-gray-100', border: 'border-gray-300', text: 'text-gray-700' };
    }
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
  const today = new Date().toISOString().split('T')[0];
  const getEventsForDate = (dateStr: string) =>
    events.filter(e => (e.startDate ?? '').startsWith(dateStr));

  if (loading) return <div className="bg-white rounded-2xl shadow-card p-6"><CardSkeleton /></div>;

  return (
    <div className="bg-white rounded-2xl shadow-card overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-green-100 rounded-xl"><Calendar className="h-5 w-5 text-green-600" /></div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Schedule Planner</h2>
              <p className="text-sm text-gray-500">Plan and manage production schedule</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={fetchData} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <RefreshCw className="w-4 h-4 text-gray-500" />
            </button>
            <button onClick={() => setShowModal(true)} className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <Plus className="w-4 h-4" /> Add Event
            </button>
          </div>
        </div>
      </div>

      {/* Calendar */}
      <div className="p-6">
        {error && <div className="mb-4 text-sm text-red-600 bg-red-50 p-3 rounded-xl">{error}</div>}

        {/* Week Navigation */}
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => { const d = new Date(currentWeek); d.setDate(d.getDate() - 7); setCurrentWeek(d); }}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h3 className="font-semibold text-gray-900">
            {days[0].toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </h3>
          <button onClick={() => { const d = new Date(currentWeek); d.setDate(d.getDate() + 7); setCurrentWeek(d); }}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 gap-2 mb-6">
          {days.map((day, index) => {
            const dateStr = day.toISOString().split('T')[0];
            const isToday = dateStr === today;
            const dayEvents = getEventsForDate(dateStr);
            return (
              <button key={index} onClick={() => setSelectedDate(dateStr)}
                className={`p-2 rounded-xl transition-all duration-200 ${selectedDate === dateStr ? 'bg-blue-600 text-white' : isToday ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50'}`}>
                <div className="text-xs font-medium mb-1">{weekDays[index]}</div>
                <div className={`text-lg font-bold ${isToday && selectedDate !== dateStr ? 'text-blue-600' : ''}`}>{day.getDate()}</div>
                {dayEvents.length > 0 && (
                  <div className={`mt-1 text-xs ${selectedDate === dateStr ? 'text-blue-200' : 'text-gray-500'}`}>{dayEvents.length}</div>
                )}
              </button>
            );
          })}
        </div>

        {/* Events for Selected Date */}
        <div>
          <h4 className="font-semibold text-gray-900 mb-3">
            Events for {new Date(selectedDate + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
          </h4>
          <div className="space-y-3">
            {getEventsForDate(selectedDate).map((event, index) => {
              const typeStyles = getTypeStyles(event.type);
              return (
                <div key={event._id ?? event.id ?? index}
                  className={`p-4 rounded-xl border-l-4 ${typeStyles.bg} animate-fade-in-up`}
                  style={{ animationDelay: `${index * 0.05}s` }}>
                  <div className="flex items-start justify-between">
                    <div>
                      <h5 className="font-semibold text-gray-900">{event.title}</h5>
                      {event.description && <p className="text-sm text-gray-600 mt-1">{event.description}</p>}
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${typeStyles.bg} ${typeStyles.text}`}>{event.type ?? 'production'}</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-gray-500">
                    {event.startTime && (
                      <span className="flex items-center gap-1"><Clock className="w-4 h-4" />{event.startTime}{event.endTime ? ` - ${event.endTime}` : ''}</span>
                    )}
                    {event.location && (
                      <span className="flex items-center gap-1"><MapPin className="w-4 h-4" />{event.location}</span>
                    )}
                    {event.assignedTo?.length > 0 && (
                      <span className="flex items-center gap-1"><Users className="w-4 h-4" />{event.assignedTo.length} assigned</span>
                    )}
                  </div>
                </div>
              );
            })}
            {getEventsForDate(selectedDate).length === 0 && (
              <div className="text-center py-8 text-gray-400">
                <Calendar className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p>No events scheduled for this day</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Event Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Add Schedule Event">
        <form onSubmit={handleSubmit} className="space-y-4">
          {[
            { id: 'title', label: 'Title *', type: 'text', required: true, placeholder: 'Production Run A' },
            { id: 'date', label: 'Date *', type: 'date', required: true, placeholder: '' },
            { id: 'time', label: 'Start Time', type: 'time', required: false, placeholder: '' },
            { id: 'location', label: 'Location', type: 'text', required: false, placeholder: 'Floor 1, Line A...' },
          ].map(f => (
            <div key={f.id}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{f.label}</label>
              <input type={f.type} required={f.required} placeholder={f.placeholder}
                value={(form as any)[f.id]} onChange={e => setForm(p => ({ ...p, [f.id]: e.target.value }))}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none" />
            </div>
          ))}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
              rows={3} placeholder="Additional details..."
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={submitting} className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-60 flex items-center justify-center gap-2">
              {submitting && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
              {submitting ? 'Adding...' : 'Add Event'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default SchedulePlanner;
