// src/pages/sub/ProductionSchedulePage.tsx
import React, { useState, useEffect } from 'react';
import { Calendar, Plus, Clock, MapPin, Users, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';
import { productionService } from '../../services/api';
import { Modal } from '../../components/shared/Modal';
import { useToast } from '../../components/shared/Toast';

interface ScheduleEvent {
  _id?: string;
  id?: string;
  title: string;
  description?: string;
  startDate: string;
  endDate?: string;
  startTime?: string;
  endTime?: string;
  type?: string;
  location?: string;
  assignedTo?: string[];
}

const ProductionSchedulePage: React.FC = () => {
  const [events, setEvents] = useState<ScheduleEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const { success, error: toastError } = useToast();

  const [form, setForm] = useState({
    title: '', date: '', time: '', machineLine: '', description: '',
  });

  const fetchEvents = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await productionService.getSchedule();
      const data = res.data?.data ?? res.data ?? [];
      setEvents(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load schedule');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchEvents(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.date) {
      toastError('Title and date are required');
      return;
    }
    setSubmitting(true);
    try {
      await productionService.createScheduleEvent({
        title: form.title,
        startDate: form.date,
        startTime: form.time,
        location: form.machineLine,
        description: form.description,
        type: 'production',
        status: 'planned',
      });
      success('Schedule event created successfully');
      setShowModal(false);
      setForm({ title: '', date: '', time: '', machineLine: '', description: '' });
      fetchEvents();
    } catch (err: any) {
      toastError(err.response?.data?.message || 'Failed to create event');
    } finally {
      setSubmitting(false);
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Production Schedule</h1>
          <p className="text-gray-500 mt-1">Plan and view production events</p>
        </div>
        <div className="flex gap-3">
          <button onClick={fetchEvents} disabled={loading} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700">
            <Plus className="w-4 h-4" /> Add Event
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        {/* Week navigation */}
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => { const d = new Date(currentWeek); d.setDate(d.getDate() - 7); setCurrentWeek(d); }} className="p-2 hover:bg-gray-100 rounded-lg">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h3 className="font-semibold text-gray-900">
            {days[0].toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </h3>
          <button onClick={() => { const d = new Date(currentWeek); d.setDate(d.getDate() + 7); setCurrentWeek(d); }} className="p-2 hover:bg-gray-100 rounded-lg">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Day buttons */}
        <div className="grid grid-cols-7 gap-2 mb-6">
          {days.map((day, i) => {
            const ds = day.toISOString().split('T')[0];
            const isToday = ds === today;
            const evts = getEventsForDate(ds);
            return (
              <button key={i} onClick={() => setSelectedDate(ds)}
                className={`p-2 rounded-xl transition-all text-center ${selectedDate === ds ? 'bg-blue-600 text-white' : isToday ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50'}`}>
                <div className="text-xs font-medium">{weekDays[i]}</div>
                <div className="text-lg font-bold">{day.getDate()}</div>
                {evts.length > 0 && <div className={`text-xs mt-0.5 ${selectedDate === ds ? 'text-blue-200' : 'text-gray-400'}`}>{evts.length}</div>}
              </button>
            );
          })}
        </div>

        {/* Events for selected date */}
        <div>
          <h4 className="font-semibold text-gray-700 mb-3">
            {new Date(selectedDate + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
          </h4>
          {loading && <div className="h-24 bg-gray-100 rounded-xl animate-pulse" />}
          {!loading && getEventsForDate(selectedDate).length === 0 && (
            <div className="text-center py-10 text-gray-400">
              <Calendar className="w-10 h-10 mx-auto mb-2 opacity-40" />
              <p>No events for this day</p>
            </div>
          )}
          <div className="space-y-3">
            {getEventsForDate(selectedDate).map(evt => (
              <div key={evt._id ?? evt.id} className="p-4 rounded-xl bg-blue-50 border-l-4 border-blue-400">
                <div className="flex items-start justify-between">
                  <h5 className="font-semibold text-gray-900">{evt.title}</h5>
                  <span className="text-xs text-blue-600 font-medium bg-blue-100 px-2 py-0.5 rounded-full">{evt.type ?? 'production'}</span>
                </div>
                {evt.description && <p className="text-sm text-gray-600 mt-1">{evt.description}</p>}
                <div className="flex gap-4 mt-2 text-xs text-gray-500">
                  {evt.startTime && <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {evt.startTime}{evt.endTime ? ` – ${evt.endTime}` : ''}</span>}
                  {evt.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {evt.location}</span>}
                  {evt.assignedTo && evt.assignedTo.length > 0 && <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {evt.assignedTo.length} assigned</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {error && <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700">{error}</div>}

      {/* Add Event Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Add Schedule Event">
        <form onSubmit={handleSubmit} className="space-y-4">
          {[
            { id: 'title', label: 'Title *', type: 'text', required: true, placeholder: 'Production Run A' },
            { id: 'date', label: 'Date *', type: 'date', required: true, placeholder: '' },
            { id: 'time', label: 'Start Time', type: 'time', required: false, placeholder: '' },
            { id: 'machineLine', label: 'Machine / Line', type: 'text', required: false, placeholder: 'Line 1, CNC Machine #3...' },
          ].map(f => (
            <div key={f.id}>
              <label htmlFor={f.id} className="block text-sm font-medium text-gray-700 mb-1">{f.label}</label>
              <input id={f.id} type={f.type} required={f.required} placeholder={f.placeholder}
                value={(form as any)[f.id]} onChange={e => setForm(prev => ({ ...prev, [f.id]: e.target.value }))}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none" />
            </div>
          ))}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea value={form.description} onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
              rows={3} placeholder="Additional details..."
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={submitting} className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-60 flex items-center justify-center gap-2">
              {submitting && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
              {submitting ? 'Creating...' : 'Add Event'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ProductionSchedulePage;
