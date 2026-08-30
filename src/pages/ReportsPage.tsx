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
} from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

export default function ReportsPage() {
  const { isPro } = useAuth();
  const { t } = useLanguage();
  const [stats, setStats] = useState<DashboardStatsDto | null>(null);

  useEffect(() => {
    if (isPro) {
      api.get('/Reports/dashboard')
        .then(res => setStats(res.data))
        .catch(err => console.error("Failed to fetch dashboard stats", err));
    }
  }, [isPro]);

  if (!isPro) {
    return <ProFeatureGate featureName="Reports & Analytics" />;
  }

  const lineData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
    datasets: [
      {
        label: t('Tickets Opened'),
        data: [12, 19, 3, 5, 2, 3, 15],
        borderColor: 'rgb(53, 162, 235)',
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
      },
      {
        label: t('Tickets Resolved'),
        data: [10, 15, 5, 8, 3, 7, 10],
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
      }
    ],
  };

  const doughnutData = {
    labels: [t('Open'), t('In Progress'), t('Pending'), t('Resolved')],
    datasets: [
      {
        label: '# of Tickets',
        data: [
          stats?.openTickets || 5,
          Math.floor((stats?.totalTickets || 20) * 0.2),
          Math.floor((stats?.totalTickets || 20) * 0.1),
          stats?.resolvedTickets || 10
        ],
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(75, 192, 192, 0.6)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="p-6 max-w-7xl mx-auto w-full overflow-y-auto">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">{t('Reports & Analytics')}</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {[
          { label: 'Total Tickets', value: stats?.totalTickets || 0, color: 'text-blue-600' },
          { label: 'Open Tickets', value: stats?.openTickets || 0, color: 'text-red-500' },
          { label: 'Resolved Tickets', value: stats?.resolvedTickets || 0, color: 'text-green-500' },
          { label: 'Avg Resolution Time (hrs)', value: stats?.averageResolutionTimeHours?.toFixed(1) || '0.0', color: 'text-purple-600' },
        ].map((stat, idx) => (
          <div key={idx} className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
            <h3 className="text-sm font-medium text-slate-500 mb-1">{t(stat.label)}</h3>
            <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-sm border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-700 mb-4">{t('Ticket Volume Trend')}</h3>
          <div className="h-64">
            <Line data={lineData} options={{ maintainAspectRatio: false, responsive: true }} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-700 mb-4">{t('Tickets by Status')}</h3>
          <div className="h-64 flex justify-center">
            <Doughnut data={doughnutData} options={{ maintainAspectRatio: false }} />
          </div>
        </div>
      </div>
    </div>
  );
}
