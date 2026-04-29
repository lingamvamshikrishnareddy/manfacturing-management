// src/pages/sub/ShiftsPage.tsx
import React, { useState, useEffect } from 'react';
import { Clock, Plus, Calendar, Users, RefreshCw } from 'lucide-react';
import { employeeService } from '../../services/api';
import { Modal } from '../../components/shared/Modal';
import { useToast } from '../../components/shared/Toast';

const ShiftsPage: React.FC = () => {
  const [shifts, setShifts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { success, error: toastError } = useToast();

  const [form, setForm] = useState({
    shiftName: '', startTime: '', endTime: '', department: '', maxEmployees: '',
  });

  const fetchData = async () => {
    setLoading(true); setError(null);
    try {
      const res = await employeeService.getShifts();
      const data = res.data?.data ?? res.data ?? [];
      setShifts(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load shifts');
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.shiftName.trim() || !form.startTime || !form.endTime) {
      toastError('Shift name, start time, and end time are required');
      return;
    }
    setSubmitting(true);
    try {
      await employeeService.createShift({
        name: form.shiftName,
        startTime: form.startTime,
        endTime: form.endTime,
        department: form.department,
        maxEmployees: Number(form.maxEmployees) || null,
      });
      success('Shift created successfully');
      setShowModal(false);
      setForm({ shiftName: '', startTime: '', endTime: '', department: '', maxEmployees: '' });
      fetchData();
    } catch (err: any) {
      toastError(err.response?.data?.message || 'Failed to create shift');
    } finally { setSubmitting(false); }
  };

  const shiftColors = ['bg-blue-100 text-blue-700', 'bg-green-100 text-green-700', 'bg-purple-100 text-purple-700', 'bg-orange-100 text-orange-700'];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Shift Management</h1>
          <p className="text-gray-500 mt-1">Configure and manage work shifts</p>
        </div>
        <div className="flex gap-3">
          <button onClick={fetchData} disabled={loading} className="p-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700">
            <Plus className="w-4 h-4" /> Create Shift
          </button>
        </div>
      </div>

      {loading && <div className="bg-white rounded-2xl p-8 shadow-sm flex justify-center"><div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>}
      {error && <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700">{error}</div>}
      {!loading && !error && shifts.length === 0 && (
        <div className="bg-white rounded-2xl p-12 shadow-sm border border-gray-100 text-center">
          <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No shifts configured</p>
          <button onClick={() => setShowModal(true)} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700">Create First Shift</button>
        </div>
      )}
      {!loading && !error && shifts.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {shifts.map((shift, i) => (
            <div key={shift._id ?? shift.id ?? i} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2.5 bg-blue-100 rounded-xl">
                  <Clock className="w-5 h-5 text-blue-600" />
                </div>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${shiftColors[i % shiftColors.length]}`}>Active</span>
              </div>
              <h3 className="font-bold text-gray-900 text-lg mb-1">{shift.name ?? shift.shiftName ?? `Shift ${i + 1}`}</h3>
              <div className="flex items-center gap-2 text-gray-500 text-sm mb-3">
                <Clock className="w-4 h-4" />
                <span>{shift.startTime ?? '—'} – {shift.endTime ?? '—'}</span>
              </div>
              <div className="space-y-1 text-sm text-gray-600">
                {shift.department && <p className="flex items-center gap-2"><Users className="w-4 h-4 text-gray-400" />Department: {shift.department}</p>}
                {shift.maxEmployees && <p>Max employees: {shift.maxEmployees}</p>}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Create Shift">
        <form onSubmit={handleSubmit} className="space-y-4">
          {[
            { id: 'shiftName', label: 'Shift Name *', type: 'text', required: true, placeholder: 'Morning Shift, Night Shift...' },
            { id: 'startTime', label: 'Start Time *', type: 'time', required: true, placeholder: '' },
            { id: 'endTime', label: 'End Time *', type: 'time', required: true, placeholder: '' },
            { id: 'department', label: 'Department', type: 'text', required: false, placeholder: 'Production, QA...' },
            { id: 'maxEmployees', label: 'Max Employees', type: 'number', required: false, placeholder: '20' },
          ].map(f => (
            <div key={f.id}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{f.label}</label>
              <input type={f.type} required={f.required} placeholder={f.placeholder}
                value={(form as any)[f.id]} onChange={e => setForm(p => ({ ...p, [f.id]: e.target.value }))}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none" />
            </div>
          ))}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={submitting} className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-60 flex items-center justify-center gap-2">
              {submitting && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
              {submitting ? 'Creating...' : 'Create Shift'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ShiftsPage;
