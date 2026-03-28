// components/quality/InspectionForms.tsx
import React, { useState } from 'react';
import { ClipboardCheck, Plus, FileText, CheckCircle, Clock, ArrowRight } from 'lucide-react';
import { CardSkeleton } from '../ui/Skeleton';

interface InspectionForm {
  id: string;
  name: string;
  type: string;
  status: 'draft' | 'active' | 'archived';
  questions: number;
  lastUsed: string;
  createdBy: string;
}

const InspectionForms: React.FC = () => {
  const [forms, setForms] = useState<InspectionForm[]>([]);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      const mockForms: InspectionForm[] = [
        {
          id: '1',
          name: 'Final Product Inspection',
          type: 'Quality Check',
          status: 'active',
          questions: 15,
          lastUsed: '2024-01-25',
          createdBy: 'Jane Smith'
        },
        {
          id: '2',
          name: 'Raw Material Verification',
          type: 'Incoming Inspection',
          status: 'active',
          questions: 10,
          lastUsed: '2024-01-24',
          createdBy: 'John Doe'
        },
        {
          id: '3',
          name: 'Equipment Calibration Check',
          type: 'Maintenance',
          status: 'draft',
          questions: 8,
          lastUsed: '',
          createdBy: 'Mike Johnson'
        },
      ];
      setForms(mockForms);
      setLoading(false);
    }, 800);
  }, []);

  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'active':
        return { bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle };
      case 'draft':
        return { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: Clock };
      case 'archived':
        return { bg: 'bg-gray-100', text: 'text-gray-700', icon: FileText };
      default:
        return { bg: 'bg-gray-100', text: 'text-gray-700', icon: FileText };
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
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-100 rounded-xl">
              <ClipboardCheck className="h-5 w-5 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Inspection Forms</h2>
              <p className="text-sm text-gray-500">{forms.length} forms</p>
            </div>
          </div>
          <button className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Plus className="w-4 h-4" />
            Create Form
          </button>
        </div>
      </div>

      {/* Forms List */}
      <div className="divide-y divide-gray-100">
        {forms.map((form, index) => {
          const statusStyles = getStatusStyles(form.status);
          const StatusIcon = statusStyles.icon;
          
          return (
            <div 
              key={form.id}
              className="p-4 hover:bg-gray-50 transition-colors duration-200 animate-fade-in-up"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`p-2.5 rounded-xl ${statusStyles.bg}`}>
                    <StatusIcon className={`h-5 w-5 ${statusStyles.text}`} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{form.name}</h3>
                    <div className="flex items-center gap-3 text-sm text-gray-500">
                      <span>{form.type}</span>
                      <span>•</span>
                      <span>{form.questions} questions</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="text-right hidden md:block">
                    <p className="text-sm text-gray-500">Last Used</p>
                    <p className="text-sm font-medium text-gray-700">
                      {form.lastUsed ? new Date(form.lastUsed).toLocaleDateString() : 'Never'}
                    </p>
                  </div>
                  <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                    <ArrowRight className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default InspectionForms;
