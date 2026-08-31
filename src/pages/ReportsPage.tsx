import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import ProFeatureGate from '../components/common/ProFeatureGate';
import api from '../services/api';
import { DashboardStatsDto } from '../types/api';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  BarElement,
} from 'chart.js';
import { Line, Doughnut, Bar, Pie } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

export default function ReportsPage() {
  const { isPro } = useAuth();
  const { t } = useLanguage();
  const [stats, setStats] = useState<DashboardStatsDto | null>(null);
  const [days, setDays] = useState(30);

  useEffect(() => {
    if (isPro) {
      api.get(`/Reports/dashboard?days=${days}`)
        .then(res => setStats(res.data))
        .catch(err => console.error("Failed to fetch dashboard stats", err));
    }
  }, [isPro, days]);

  if (!isPro) {
    return <ProFeatureGate featureName="Reports & Analytics" />;
  }

  // Generate colors based on status/priority strings
  const getColor = (str: string) => {
    if (str.toLowerCase().includes('open') || str.toLowerCase() === 'high') return 'rgba(239, 68, 68, 0.7)'; // red
    if (str.toLowerCase().includes('progress') || str.toLowerCase() === 'medium') return 'rgba(59, 130, 246, 0.7)'; // blue
    if (str.toLowerCase().includes('pending')) return 'rgba(245, 158, 11, 0.7)'; // amber
    if (str.toLowerCase().includes('closed') || str.toLowerCase() === 'low') return 'rgba(34, 197, 94, 0.7)'; // green
    return 'rgba(156, 163, 175, 0.7)'; // gray default
  };

  const getBorderColor = (str: string) => getColor(str).replace('0.7', '1');

  const lineData = {
    labels: stats?.volumeTrend?.map(v => v.date) || [],
    datasets: [
      {
        label: t('Tickets Opened'),
        data: stats?.volumeTrend?.map(v => v.count) || [],
        borderColor: 'rgb(53, 162, 235)',
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
        tension: 0.3,
        fill: true,
      }
    ],
  };

  const statusDoughnutData = {
    labels: stats?.statusSummary?.map(s => t(s.status)) || [],
    datasets: [
      {
        data: stats?.statusSummary?.map(s => s.count) || [],
        backgroundColor: stats?.statusSummary?.map(s => getColor(s.status)) || [],
        borderColor: stats?.statusSummary?.map(s => getBorderColor(s.status)) || [],
        borderWidth: 1,
      },
    ],
  };

  const categoryPieData = {
    labels: stats?.categoryDistribution?.map(c => t(c.category)) || [],
    datasets: [
      {
        data: stats?.categoryDistribution?.map(c => c.count) || [],
        backgroundColor: [
          'rgba(99, 102, 241, 0.7)',
          'rgba(168, 85, 247, 0.7)',
          'rgba(236, 72, 153, 0.7)',
          'rgba(14, 165, 233, 0.7)',
          'rgba(16, 185, 129, 0.7)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const priorityBarData = {
    labels: stats?.priorityDistribution?.map(p => t(p.priority)) || [],
    datasets: [
      {
        label: t('Tickets by Priority'),
        data: stats?.priorityDistribution?.map(p => p.count) || [],
        backgroundColor: stats?.priorityDistribution?.map(p => getColor(p.priority)) || [],
      }
    ],
  };

  const chartOptions = {
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom' as const },
    }
  };

  return (
    <div className="p-6 max-w-[1600px] mx-auto w-full overflow-y-auto pb-20">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold text-slate-800">{t('Reports & Analytics')}</h1>
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-slate-600">{t('Timeframe')}:</label>
          <select 
            className="border-slate-300 rounded-md text-sm shadow-sm focus:ring-blue-500 focus:border-blue-500 font-medium text-slate-700"
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
          >
            <option value={7}>{t('Last 7 Days')}</option>
            <option value={30}>{t('Last 30 Days')}</option>
            <option value={90}>{t('Last 90 Days')}</option>
            <option value={365}>{t('Last Year')}</option>
            <option value={0}>{t('All Time')}</option>
          </select>
        </div>
      </div>
      
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          { label: 'Total Tickets', value: stats?.totalTickets || 0, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Open Tickets', value: stats?.openTickets || 0, color: 'text-red-500', bg: 'bg-red-50' },
          { label: 'Resolved Tickets', value: stats?.closedTickets || 0, color: 'text-green-500', bg: 'bg-green-50' },
          { label: 'Avg Resolution Time (hrs)', value: stats?.averageResolutionTimeHrs?.toFixed(1) || '0.0', color: 'text-purple-600', bg: 'bg-purple-50' },
        ].map((stat, idx) => (
          <div key={idx} className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-slate-500 mb-1">{t(stat.label)}</h3>
              <p className={`text-4xl font-extrabold ${stat.color}`}>{stat.value}</p>
            </div>
            <div className={`w-12 h-12 rounded-full ${stat.bg} flex items-center justify-center ${stat.color} opacity-80`}>
               {/* Decorative icon could go here */}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Main Volume Trend */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-700 mb-6">{t('Ticket Volume Trend')}</h3>
          <div className="h-80">
            <Line data={lineData} options={{ maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }} />
          </div>
        </div>

        {/* Status Doughnut */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-700 mb-6">{t('Tickets by Status')}</h3>
          <div className="h-80 flex justify-center">
            <Doughnut data={statusDoughnutData} options={chartOptions} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Category Distribution */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-700 mb-6">{t('Category Distribution')}</h3>
          <div className="h-72 flex justify-center">
            <Pie data={categoryPieData} options={chartOptions} />
          </div>
        </div>

        {/* Priority Distribution */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-700 mb-6">{t('Tickets by Priority')}</h3>
          <div className="h-72">
            <Bar data={priorityBarData} options={{ maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }} />
          </div>
        </div>
      </div>
      
      {/* Agent Performance Table */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-700 mb-6">{t('Agent Performance')}</h3>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[550px] text-start rtl:text-end rtl:text-left ltr:text-right ltr:text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-slate-700 text-xs uppercase font-semibold">
                <tr>
                  <th className="px-6 py-4 rounded-tl-lg">{t('Agent Name')}</th>
                  <th className="px-6 py-4">{t('Assigned Count')}</th>
                  <th className="px-6 py-4 rounded-tr-lg">{t('Resolved Count')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {stats?.agentPerformance?.map((agent, i) => (
                  <tr key={i} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-semibold text-slate-900 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                        {agent.agentName.charAt(0).toUpperCase()}
                      </div>
                      {agent.agentName}
                    </td>
                    <td className="px-6 py-4 font-medium">{agent.assignedCount}</td>
                    <td className="px-6 py-4 font-medium text-green-600">{agent.resolvedCount}</td>
                  </tr>
                ))}
                {(!stats?.agentPerformance || stats.agentPerformance.length === 0) && (
                  <tr>
                    <td colSpan={3} className="px-6 py-8 text-center text-slate-500">
                      {t('No agent performance data available yet.')}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
      </div>
    </div>
  );
}
