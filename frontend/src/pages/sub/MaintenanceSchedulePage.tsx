// src/pages/sub/MaintenanceSchedulePage.tsx
import React, { useState, useEffect } from 'react';
import { Calendar, Plus, Clock, User, RefreshCw } from 'lucide-react';
import { maintenanceService } from '../../services/api';
import { Modal } from '../../components/shared/Modal';
import { useToast } from '../../components/shared/Toast';

const MaintenanceSchedulePage: React.FC = () => {
  const [schedules, setSchedules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { success, error: toastError } = useToast();

  const [form, setForm] = useState({
    equipment: '', maintenanceType: 'preventive', scheduledDate: '', technician: '', duration: '', notes: '',
  });

  const fetchData = async () => {
    setLoading(true); setError(null);
    try {
      const res = await maintenanceService.getSchedule();
      const data = res.data?.data ?? res.data ?? [];
      setSchedules(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load maintenance schedule');
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.equipment.trim() || !form.scheduledDate) {
      toastError('Equipment and scheduled date are required');
      return;
    }
    setSubmitting(true);
    try {
      await maintenanceService.createSchedule({
        equipmentId: form.equipment,
        maintenanceType: form.maintenanceType,
        scheduledDate: form.scheduledDate,
        assignedTechnicians: form.technician ? [form.technician] : [],
        estimatedDuration: Number(form.duration) || 1,
        tasks: form.notes ? [{ description: form.notes, status: 'pending' }] : [],
        status: 'scheduled',
      });
      success('Maintenance scheduled successfully');
      setShowModal(false);
      setForm({ equipment: '', maintenanceType: 'preventive', scheduledDate: '', technician: '', duration: '', notes: '' });
      fetchData();
    } catch (err: any) {
      toastError(err.response?.data?.message || 'Failed to schedule maintenance');
    } finally { setSubmitting(false); }
  };

  const typeColors: Record<string, string> = {
    preventive: 'bg-blue-100 text-blue-700',
    corrective: 'bg-red-100 text-red-700',
    predictive: 'bg-purple-100 text-purple-700',
  };

  const statusColors: Record<string, string> = {
    scheduled: 'bg-yellow-100 text-yellow-700',
    'in-progress': 'bg-blue-100 text-blue-700',
    completed: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Maintenance Schedule</h1>
          <p className="text-gray-500 mt-1">Plan and track maintenance activities</p>
        </div>
        <div className="flex gap-3">
          <button onClick={fetchData} disabled={loading} className="p-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700">
            <Plus className="w-4 h-4" /> Schedule Maintenance
          </button>
        </div>
      </div>

      {loading && <div className="bg-white rounded-2xl p-8 shadow-sm flex justify-center"><div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>}
      {error && <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700">{error}</div>}
      {!loading && !error && schedules.length === 0 && (
        <div className="bg-white rounded-2xl p-12 shadow-sm border border-gray-100 text-center">
          <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No maintenance scheduled</p>
          <button onClick={() => setShowModal(true)} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700">Schedule First</button>
        </div>
      )}
      {!loading && !error && schedules.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 divide-y divide-gray-100">
          {schedules.map((s, i) => (
            <div key={s._id ?? s.id ?? i} className="p-5 hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-gray-900">{s.equipmentId ?? `Equipment ${i + 1}`}</h3>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${typeColors[s.maintenanceType] ?? 'bg-gray-100 text-gray-700'}`}>{s.maintenanceType}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[s.status] ?? 'bg-gray-100 text-gray-700'}`}>{s.status}</span>
                  </div>
                  <div className="flex gap-4 text-xs text-gray-500 mt-1">
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{s.scheduledDate ? new Date(s.scheduledDate).toLocaleDateString() : '—'}</span>
                    {s.estimatedDuration && <span>{s.estimatedDuration}h duration</span>}
                    {s.assignedTechnicians?.length > 0 && <span className="flex items-center gap-1"><User className="w-3 h-3" />{s.assignedTechnicians.length} technician(s)</span>}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Schedule Maintenance">
        <form onSubmit={handleSubmit} className="space-y-4">
          {[
            { id: 'equipment', label: 'Equipment *', type: 'text', required: true, placeholder: 'CNC Machine #1, Equipment ID...' },
            { id: 'scheduledDate', label: 'Scheduled Date *', type: 'date', required: true, placeholder: '' },
            { id: 'technician', label: 'Technician', type: 'text', required: false, placeholder: 'Technician name' },
            { id: 'duration', label: 'Duration (hours)', type: 'number', required: false, placeholder: '2' },
          ].map(f => (
            <div key={f.id}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{f.label}</label>
              <input type={f.type} required={f.required} placeholder={f.placeholder}
                value={(form as any)[f.id]} onChange={e => setForm(p => ({ ...p, [f.id]: e.target.value }))}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none" />
            </div>
          ))}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Maintenance Type</label>
            <select value={form.maintenanceType} onChange={e => setForm(p => ({ ...p, maintenanceType: e.target.value }))}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none">
              {['preventive', 'corrective', 'predictive'].map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
              rows={3} placeholder="Maintenance tasks and notes..."
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={submitting} className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-60 flex items-center justify-center gap-2">
              {submitting && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
              {submitting ? 'Scheduling...' : 'Schedule'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default MaintenanceSchedulePage;
