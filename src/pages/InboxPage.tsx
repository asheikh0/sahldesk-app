import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Ticket, Category } from '../types/api';
import { useLanguage } from '../context/LanguageContext';
import CreateTicketModal from '../components/tickets/CreateTicketModal';
import { Plus, Search } from 'lucide-react';

export default function InboxPage() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters & Search
  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchTickets = async () => {
    try {
      const [ticketsRes, catsRes] = await Promise.all([
        api.get('/Tickets'),
        api.get('/Categories')
      ]);
      setTickets(ticketsRes.data);
      setCategories(catsRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const getCategoryColor = (catName?: string) => {
    const cat = categories.find(c => c.name === catName);
    return cat?.color || '#cbd5e1';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Open': return 'bg-green-100 text-green-800';
      case 'In Progress': return 'bg-blue-100 text-blue-800';
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Closed': case 'Resolved': return 'bg-slate-100 text-slate-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  const filteredTickets = useMemo(() => {
    let result = tickets;
    if (activeTab !== 'All') {
      result = result.filter(ticket => ticket.status === activeTab);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(ticket => 
        ticket.id.toString().includes(q) ||
        (ticket.subject || (ticket as any).title || (ticket as any).Title || '').toLowerCase().includes(q) ||
        (ticket.customer?.email || '').toLowerCase().includes(q) ||
        (ticket.customer?.firstName || ticket.customer?.lastName || '').toLowerCase().includes(q)
      );
    }
    return result;
  }, [tickets, activeTab, searchQuery]);

  return (
    <div className="p-6 h-full flex flex-col">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold text-slate-900">{t('Inbox')}</h1>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium transition-colors rtl:space-x-reverse"
        >
          <Plus size={18} />
          <span>{t('New Ticket')}</span>
        </button>
      </div>

      <div className="bg-white rounded-t-lg shadow-sm border border-slate-200 border-b-0 p-4 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex space-x-1 rtl:space-x-reverse bg-slate-100 p-1 rounded-md">
          {['All', 'Open', 'In Progress', 'Pending', 'Closed'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
                activeTab === tab ? 'bg-white shadow-sm text-blue-600' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {t(tab)}
            </button>
          ))}
        </div>
        
        <div className="relative w-full sm:w-64">
          <div className="absolute inset-y-0 left-0 pl-3 rtl:pl-0 rtl:pr-3 flex items-center pointer-events-none">
            <Search size={16} className="text-slate-400" />
          </div>
          <input
            type="text"
            placeholder={t('Search tickets...')}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-9 rtl:pl-3 rtl:pr-9 w-full border border-slate-300 rounded-md py-1.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
      </div>

      <div className="bg-white rounded-b-lg shadow-sm border border-slate-200 flex-1 overflow-auto">
        <table className="w-full min-w-[550px] divide-y divide-slate-200">
          <thead className="bg-slate-50 sticky top-0 z-10">
            <tr>
              <th className="px-6 py-3 text-start text-xs font-medium text-slate-500 uppercase tracking-wider w-20">ID</th>
              <th className="px-6 py-3 text-start text-xs font-medium text-slate-500 uppercase tracking-wider">Subject & Details</th>
              <th className="px-6 py-3 text-start text-xs font-medium text-slate-500 uppercase tracking-wider">Customer / Agent</th>
              <th className="px-6 py-3 text-start text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-start text-xs font-medium text-slate-500 uppercase tracking-wider">Date</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-sm text-slate-500 animate-pulse">Loading...</td>
              </tr>
            ) : filteredTickets.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-sm text-slate-500">No tickets found matching your criteria.</td>
              </tr>
            ) : (
              filteredTickets.map(ticket => (
                <tr 
                  key={ticket.id} 
                  onClick={() => navigate('/tickets/' + ticket.id)}
                  className="hover:bg-slate-50 cursor-pointer transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-900">
                    #{ticket.id}
                  </td>
                  <td className="px-6 py-4">
                    <div className="max-w-[280px] sm:max-w-[400px] lg:max-w-[550px] mb-1">
                      <span 
                        className="block font-semibold text-slate-800 truncate hover:text-blue-600 transition-colors"
                        title={ticket.subject || (ticket as any).title || (ticket as any).Title || 'No Subject'}
                      >
                        {ticket.subject || (ticket as any).title || (ticket as any).Title || 'No Subject'}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2 text-xs">
                      {ticket.category && (
                        <span className="flex items-center text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                          <span className="w-2 h-2 rounded-full mr-1.5 rtl:mr-0 rtl:ml-1.5" style={{ backgroundColor: getCategoryColor(ticket.category) }}></span>
                          {ticket.category}
                        </span>
                      )}
                      <span className="text-slate-500 bg-slate-100 px-2 py-0.5 rounded">{t(ticket.priority)}</span>
                      {ticket.referenceId && (
                        <span className="text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">Order #{ticket.referenceId}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-slate-900">
                      {ticket.customer?.firstName || ticket.customer?.lastName || ticket.customer?.email || 'Unknown'}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      Agent: {ticket.agent ? (ticket.agent.firstName || ticket.agent.lastName || ticket.agent.email) : 'Unassigned'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(ticket.status)}`}>
                      {t(ticket.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                    {new Date(ticket.createdDate).toLocaleDateString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <CreateTicketModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onTicketCreated={fetchTickets} 
      />
    </div>
  );
}
