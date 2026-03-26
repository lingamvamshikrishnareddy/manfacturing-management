// components/dashboard/KPIDisplay.tsx
import React from 'react';
import { TrendingUp, TrendingDown, Activity, Target, Zap, Shield, AlertTriangle } from 'lucide-react';
import { dashboardAPI } from '../../services/api/dashboardAPI';
import { KPICardSkeleton } from '../ui/Skeleton';

interface KPI {
  id: string;
  label: string;
  value: number;
  unit: string;
  trend: number;
  target: number;
  category: 'production' | 'quality' | 'efficiency' | 'safety';
}

const categoryIcons: Record<string, React.ElementType> = {
  production: Zap,
  quality: Shield,
  efficiency: Target,
  safety: AlertTriangle,
};

const categoryColors: Record<string, string> = {
  production: 'from-blue-500 to-blue-600',
  quality: 'from-green-500 to-green-600',
  efficiency: 'from-purple-500 to-purple-600',
  safety: 'from-orange-500 to-orange-600',
};

const KPIDisplay: React.FC = () => {
  const [kpis, setKpis] = React.useState<KPI[]>([]);
  const [selectedCategory, setSelectedCategory] = React.useState<string>('all');
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchKPIs = async () => {
      try {
        setLoading(true);
        const response = await dashboardAPI.getKPIs();
        setKpis(response.data);
        setError(null);
      } catch (err: any) {
        setError('Failed to load KPIs');
        console.error('Error fetching KPIs:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchKPIs();
  }, []);

  const filteredKPIs = selectedCategory === 'all' 
    ? kpis 
    : kpis.filter(kpi => kpi.category === selectedCategory);

  const categories = [
    { key: 'all', label: 'All', color: 'bg-gray-100 text-gray-700 hover:bg-gray-200' },
    { key: 'production', label: 'Production', color: 'bg-blue-100 text-blue-700 hover:bg-blue-200' },
    { key: 'quality', label: 'Quality', color: 'bg-green-100 text-green-700 hover:bg-green-200' },
    { key: 'efficiency', label: 'Efficiency', color: 'bg-purple-100 text-purple-700 hover:bg-purple-200' },
    { key: 'safety', label: 'Safety', color: 'bg-orange-100 text-orange-700 hover:bg-orange-200' },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Key Performance Indicators</h2>
            <p className="text-sm text-gray-500">Loading...</p>
          </div>
          <div className="p-3 bg-blue-100 rounded-xl">
            <Activity className="h-6 w-6 text-blue-600" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <KPICardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6">
        <div className="flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-red-500" />
          <p className="text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl shadow-lg">
            <Activity className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Key Performance Indicators</h2>
            <p className="text-sm text-gray-500">Real-time performance metrics</p>
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <button
            key={category.key}
            onClick={() => setSelectedCategory(category.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              selectedCategory === category.key
                ? 'bg-primary-600 text-white shadow-md'
                : `${category.color} active:scale-95`
            }`}
          >
            {category.label}
          </button>
        ))}
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {filteredKPIs.map((kpi, index) => {
          const Icon = categoryIcons[kpi.category] || Activity;
          const progress = Math.min((kpi.value / kpi.target) * 100, 100);
          const gradient = categoryColors[kpi.category] || 'from-gray-500 to-gray-600';
          
          return (
            <div
              key={kpi.id}
              className="group bg-white rounded-2xl shadow-card hover:shadow-card-hover transition-all duration-300 overflow-hidden"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              {/* Color Bar */}
              <div className={`h-1 bg-gradient-to-r ${gradient}`} />
              
              <div className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-2.5 rounded-xl bg-gradient-to-br ${gradient} shadow-md group-hover:scale-110 transition-transform`}>
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${
                    kpi.trend >= 0 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {kpi.trend >= 0 ? (
                      <TrendingUp className="h-3 w-3" />
                    ) : (
                      <TrendingDown className="h-3 w-3" />
                    )}
                    {Math.abs(kpi.trend)}%
                  </div>
                </div>
                
                <h3 className="text-sm font-medium text-gray-500 mb-1">{kpi.label}</h3>
                <div className="flex items-baseline gap-1 mb-3">
                  <span className="text-3xl font-bold text-gray-900">
                    {kpi.value.toLocaleString()}
                  </span>
                  <span className="text-sm text-gray-500">{kpi.unit}</span>
                </div>
                
                {/* Progress Bar */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">Target: {kpi.target.toLocaleString()}</span>
                    <span className="font-medium text-gray-700">{progress.toFixed(1)}%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r ${gradient} rounded-full transition-all duration-1000 ease-out`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default KPIDisplay;
