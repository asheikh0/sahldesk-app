import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { Ticket, User, Category } from '../types/api';
import ReplyBox from '../components/tickets/ReplyBox';
import api from '../services/api';
import { ArrowLeft, User as UserIcon, Tag, Clock, Lock, ExternalLink } from 'lucide-react';

export default function TicketDetailsPage() {
  const { id } = useParams();
  const { t } = useLanguage();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [agents, setAgents] = useState<User[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const [ticketRes, agentsRes, catRes] = await Promise.all([
        api.get(`/Tickets/${id}`),
        api.get('/Users/agents'),
        api.get('/Categories')
      ]);
      setTicket(ticketRes.data);
      setAgents(agentsRes.data);
      setCategories(catRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (status: string) => {
    try {
      await api.put(`/Tickets/${id}`, { status });
      setTicket(prev => prev ? { ...prev, status } : null);
    } catch (err) {
      console.error(err);
    }
  };

  const updateAgent = async (agentId: number | null) => {
    try {
      await api.put(`/Tickets/${id}`, { agentId });
      const newAgent = agents.find(a => a.id === agentId);
      setTicket(prev => prev ? { ...prev, agent: newAgent } : null);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return (
    <div className="p-8 max-w-6xl mx-auto space-y-4 animate-pulse">
      <div className="h-8 bg-slate-200 rounded w-1/4"></div>
      <div className="h-64 bg-slate-200 rounded w-full"></div>
    </div>
  );

  if (!ticket) return <div className="p-8 text-center text-red-500">Ticket not found</div>;

  const categoryObj = categories.find(c => c.name === ticket.category);

  return (
    <div className="flex flex-col h-full bg-slate-50 relative">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center space-x-4 rtl:space-x-reverse">
          <Link to="/inbox" className="text-slate-400 hover:text-slate-600">
            <ArrowLeft size={20} className="rtl:rotate-180" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-slate-900">#{ticket.id} - {ticket.subject}</h1>
            <div className="flex items-center space-x-3 rtl:space-x-reverse text-sm mt-1">
              {ticket.category && (
                <div className="flex items-center text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                  <div className="w-2 h-2 rounded-full mr-1.5 rtl:mr-0 rtl:ml-1.5" style={{ backgroundColor: categoryObj?.color || '#cbd5e1' }}></div>
                  {ticket.category}
                </div>
              )}
              <span className="text-slate-500 bg-slate-100 px-2 py-0.5 rounded">{t('Priority')}: {t(ticket.priority)}</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-3 rtl:space-x-reverse">
          <select 
            value={ticket.status} 
            onChange={e => updateStatus(e.target.value)}
            className="border border-slate-300 rounded-md px-3 py-1.5 text-sm bg-white font-medium text-slate-700 shadow-sm focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="Open">{t('Open')}</option>
            <option value="In Progress">{t('In Progress')}</option>
            <option value="Pending">{t('Pending')}</option>
            <option value="Resolved">{t('Resolved')}</option>
            <option value="Closed">{t('Closed')}</option>
          </select>

          <select 
            value={ticket.agent?.id || ''} 
            onChange={e => updateAgent(e.target.value ? Number(e.target.value) : null)}
            className="border border-slate-300 rounded-md px-3 py-1.5 text-sm bg-white font-medium text-slate-700 shadow-sm focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="">Unassigned</option>
            {agents.map(a => (
              <option key={a.id} value={a.id}>{a.firstName || a.lastName || a.email}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-6">
          
          {/* Main Conversation Stream */}
          <div className="flex-1 space-y-6 pb-4">
            
            {/* Original Ticket Description */}
            <div className="bg-white p-5 rounded-lg shadow-sm border border-slate-200">
              <div className="flex justify-between items-start mb-3">
                <div className="font-semibold text-slate-900">{ticket.customer.firstName || ticket.customer.lastName || ticket.customer.email}</div>
                <div className="text-xs text-slate-400 flex items-center">
                  <Clock size={12} className="mr-1 rtl:ml-1" />
                  {new Date(ticket.createdAt).toLocaleString()}
                </div>
              </div>
              <div className="text-slate-700 whitespace-pre-wrap">{ticket.description}</div>
            </div>

            {/* Comments */}
            {ticket.comments?.map(comment => (
              <div key={comment.id} className={`p-5 rounded-lg shadow-sm border ${
                comment.isInternal ? 'bg-amber-50/50 border-amber-200 ml-8 rtl:ml-0 rtl:mr-8' :
                comment.isStaffReply ? 'bg-blue-50 border-blue-200 ml-8 rtl:ml-0 rtl:mr-8' : 
                'bg-white border-slate-200 mr-8 rtl:mr-0 rtl:ml-8'
              }`}>
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center space-x-2 rtl:space-x-reverse">
                    <span className="font-semibold text-slate-900">
                      {comment.user?.firstName || comment.user?.lastName || comment.user?.email || 'Unknown'}
                    </span>
                    {comment.isInternal && (
                      <span className="flex items-center text-xs font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded">
                        <Lock size={10} className="mr-1 rtl:ml-1" /> INTERNAL
                      </span>
                    )}
                    {comment.isStaffReply && !comment.isInternal && (
                      <span className="text-xs font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded">STAFF</span>
                    )}
                  </div>
                  <div className="text-xs text-slate-400">{new Date(comment.createdAt).toLocaleString()}</div>
                </div>
                
                <div className="text-slate-700 whitespace-pre-wrap">{comment.content}</div>
                
                {comment.attachmentUrl && (
                  <div className="mt-3 pt-3 border-t border-slate-200/60">
                    <a href={comment.attachmentUrl} target="_blank" rel="noreferrer" className="flex items-center text-sm text-blue-600 hover:underline">
                      <ExternalLink size={14} className="mr-1 rtl:ml-1" /> View Attachment
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Sidebar */}
          <div className="w-full md:w-72 space-y-4">
            <div className="bg-white p-5 rounded-lg shadow-sm border border-slate-200">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center">
                <UserIcon size={16} className="mr-2 rtl:ml-2 text-slate-400" /> Customer Profile
              </h3>
              <div className="space-y-3 text-sm">
                <div>
                  <div className="text-slate-500 mb-0.5">Name</div>
                  <div className="font-medium text-slate-900">{ticket.customer.firstName || ticket.customer.lastName || '-'}</div>
                </div>
                <div>
                  <div className="text-slate-500 mb-0.5">Email</div>
                  <div className="font-medium text-slate-900">{ticket.customer.email}</div>
                </div>
              </div>
            </div>

            {ticket.referenceId && (
              <div className="bg-white p-5 rounded-lg shadow-sm border border-slate-200">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center">
                  <Tag size={16} className="mr-2 rtl:ml-2 text-slate-400" /> Reference
                </h3>
                <div className="bg-slate-50 border border-slate-200 rounded p-3">
                  <div className="text-xs text-slate-500 mb-1">WooCommerce Order</div>
                  <div className="font-medium text-blue-600">#{ticket.referenceId}</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <ReplyBox ticketId={ticket.id} onReplyAdded={fetchData} />
    </div>
  );
}
