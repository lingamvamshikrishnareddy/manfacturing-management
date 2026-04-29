// src/pages/sub/EquipmentPage.tsx
import React, { useState, useEffect } from 'react';
import { Settings, Plus, Search, RefreshCw, Activity } from 'lucide-react';
import { maintenanceService } from '../../services/api';
import { Modal } from '../../components/shared/Modal';
import { useToast } from '../../components/shared/Toast';

const EquipmentPage: React.FC = () => {
  const [equipment, setEquipment] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { success, error: toastError } = useToast();

  const [form, setForm] = useState({
    name: '', equipmentId: '', type: '', location: '', manufacturer: '', purchaseDate: '', status: 'operational',
  });

  const fetchData = async () => {
    setLoading(true); setError(null);
    try {
      const res = await maintenanceService.getEquipment();
      const data = res.data?.data ?? res.data ?? [];
      setEquipment(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load equipment list');
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toastError('Equipment name is required');
      return;
    }
    setSubmitting(true);
    try {
      await maintenanceService.createEquipment({
        name: form.name,
        equipmentId: form.equipmentId || `EQ-${Date.now()}`,
        type: form.type,
        location: form.location,
        manufacturer: form.manufacturer,
        purchaseDate: form.purchaseDate,
        status: form.status,
      });
      success('Equipment added successfully');
      setShowModal(false);
      setForm({ name: '', equipmentId: '', type: '', location: '', manufacturer: '', purchaseDate: '', status: 'operational' });
      fetchData();
    } catch (err: any) {
      toastError(err.response?.data?.message || 'Failed to add equipment');
    } finally { setSubmitting(false); }
  };

  const statusColors: Record<string, string> = {
    operational: 'bg-green-100 text-green-700',
    maintenance: 'bg-yellow-100 text-yellow-700',
    offline: 'bg-red-100 text-red-700',
    decommissioned: 'bg-gray-100 text-gray-700',
  };

  const filtered = equipment.filter(e =>
    (e.name ?? '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (e.equipmentId ?? '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Equipment</h1>
          <p className="text-gray-500 mt-1">Manage all facility equipment</p>
        </div>
        <div className="flex gap-3">
          <button onClick={fetchData} disabled={loading} className="p-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700">
            <Plus className="w-4 h-4" /> Add Equipment
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" placeholder="Search equipment..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
      </div>

      {loading && <div className="bg-white rounded-2xl p-8 shadow-sm flex justify-center"><div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>}
      {error && <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700">{error}</div>}
      {!loading && !error && filtered.length === 0 && (
        <div className="bg-white rounded-2xl p-12 shadow-sm border border-gray-100 text-center">
          <Settings className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No equipment registered</p>
          <button onClick={() => setShowModal(true)} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700">Add First Equipment</button>
        </div>
      )}
      {!loading && !error && filtered.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((eq, i) => (
            <div key={eq._id ?? eq.id ?? i} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="p-2.5 bg-blue-100 rounded-xl">
                  <Activity className="w-5 h-5 text-blue-600" />
                </div>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[eq.status] ?? 'bg-gray-100 text-gray-700'}`}>{eq.status ?? 'Unknown'}</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">{eq.name}</h3>
              {eq.equipmentId && <p className="text-xs text-gray-400 mb-2">{eq.equipmentId}</p>}
              <div className="space-y-1 text-sm text-gray-600">
                {eq.type && <p>Type: {eq.type}</p>}
                {eq.location && <p>Location: {eq.location}</p>}
                {eq.manufacturer && <p>Manufacturer: {eq.manufacturer}</p>}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Add Equipment">
        <form onSubmit={handleSubmit} className="space-y-4">
          {[
            { id: 'name', label: 'Equipment Name *', type: 'text', required: true, placeholder: 'CNC Machine #1' },
            { id: 'equipmentId', label: 'Equipment ID', type: 'text', required: false, placeholder: 'Auto-generated if blank' },
            { id: 'type', label: 'Type / Category', type: 'text', required: false, placeholder: 'CNC, Conveyor, Press...' },
            { id: 'location', label: 'Location', type: 'text', required: false, placeholder: 'Floor 1, Bay A...' },
            { id: 'manufacturer', label: 'Manufacturer', type: 'text', required: false, placeholder: 'Siemens, Haas...' },
            { id: 'purchaseDate', label: 'Purchase Date', type: 'date', required: false, placeholder: '' },
          ].map(f => (
            <div key={f.id}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{f.label}</label>
              <input type={f.type} required={f.required} placeholder={f.placeholder}
                value={(form as any)[f.id]} onChange={e => setForm(p => ({ ...p, [f.id]: e.target.value }))}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none" />
            </div>
          ))}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none">
              {['operational', 'maintenance', 'offline', 'decommissioned'].map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={submitting} className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-60 flex items-center justify-center gap-2">
              {submitting && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
              {submitting ? 'Adding...' : 'Add Equipment'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default EquipmentPage;
