// src/pages/sub/SkillsPage.tsx
import React, { useState, useEffect } from 'react';
import { Award, Plus, Search, Star, RefreshCw } from 'lucide-react';
import { employeeService } from '../../services/api';
import { Modal } from '../../components/shared/Modal';
import { useToast } from '../../components/shared/Toast';

const SkillsPage: React.FC = () => {
  const [skills, setSkills] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { success, error: toastError } = useToast();

  const [form, setForm] = useState({
    skillName: '', category: '', description: '', certificationRequired: false,
  });

  const fetchData = async () => {
    setLoading(true); setError(null);
    try {
      const res = await employeeService.getSkills();
      const data = res.data?.data ?? res.data ?? [];
      setSkills(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load skills');
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.skillName.trim()) {
      toastError('Skill name is required');
      return;
    }
    setSubmitting(true);
    try {
      await employeeService.createSkill({
        name: form.skillName,
        category: form.category,
        description: form.description,
        certificationRequired: form.certificationRequired,
      });
      success('Skill added successfully');
      setShowModal(false);
      setForm({ skillName: '', category: '', description: '', certificationRequired: false });
      fetchData();
    } catch (err: any) {
      toastError(err.response?.data?.message || 'Failed to add skill');
    } finally { setSubmitting(false); }
  };

  const categoryColors: Record<string, string> = {
    technical: 'bg-blue-100 text-blue-700',
    safety: 'bg-red-100 text-red-700',
    quality: 'bg-green-100 text-green-700',
    leadership: 'bg-purple-100 text-purple-700',
    maintenance: 'bg-orange-100 text-orange-700',
    general: 'bg-gray-100 text-gray-700',
  };

  const filtered = skills.filter(s =>
    (s.name ?? s.skillName ?? '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.category ?? '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Skills & Competencies</h1>
          <p className="text-gray-500 mt-1">Manage employee skill matrix and certifications</p>
        </div>
        <div className="flex gap-3">
          <button onClick={fetchData} disabled={loading} className="p-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700">
            <Plus className="w-4 h-4" /> Add Skill
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" placeholder="Search skills..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
      </div>

      {loading && <div className="bg-white rounded-2xl p-8 shadow-sm flex justify-center"><div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>}
      {error && <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700">{error}</div>}
      {!loading && !error && filtered.length === 0 && (
        <div className="bg-white rounded-2xl p-12 shadow-sm border border-gray-100 text-center">
          <Award className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No skills defined yet</p>
          <button onClick={() => setShowModal(true)} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700">Add First Skill</button>
        </div>
      )}
      {!loading && !error && filtered.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((skill, i) => (
            <div key={skill._id ?? skill.id ?? i} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="p-2.5 bg-amber-100 rounded-xl">
                  <Award className="w-5 h-5 text-amber-600" />
                </div>
                <div className="flex gap-1">
                  {skill.certificationRequired && <span className="flex items-center gap-1 px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs rounded-full"><Star className="w-3 h-3" />Certified</span>}
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${categoryColors[skill.category?.toLowerCase()] ?? 'bg-gray-100 text-gray-700'}`}>
                    {skill.category ?? 'General'}
                  </span>
                </div>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">{skill.name ?? skill.skillName}</h3>
              {skill.description && <p className="text-sm text-gray-500">{skill.description}</p>}
              {skill.employeeCount != null && (
                <p className="text-xs text-gray-400 mt-2">{skill.employeeCount} employees have this skill</p>
              )}
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Add Skill">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Skill Name *</label>
            <input type="text" required placeholder="Machine Operation, Quality Inspection..."
              value={form.skillName} onChange={e => setForm(p => ({ ...p, skillName: e.target.value }))}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none">
              {['technical', 'safety', 'quality', 'leadership', 'maintenance', 'general'].map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
              rows={3} placeholder="Skill description and requirements..."
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none" />
          </div>
          <div className="flex items-center gap-3">
            <input type="checkbox" id="certRequired" checked={form.certificationRequired}
              onChange={e => setForm(p => ({ ...p, certificationRequired: e.target.checked }))}
              className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
            <label htmlFor="certRequired" className="text-sm font-medium text-gray-700">Certification Required</label>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={submitting} className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-60 flex items-center justify-center gap-2">
              {submitting && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
              {submitting ? 'Adding...' : 'Add Skill'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default SkillsPage;
