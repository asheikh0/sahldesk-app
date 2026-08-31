import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { Ticket, User, Category, TicketSubStatus } from '../types/api';
import ReplyBox from '../components/tickets/ReplyBox';
import api from '../services/api';
import { ArrowLeft, User as UserIcon, Tag, Clock, Lock, ExternalLink, CheckCircle2 } from 'lucide-react';

export default function TicketDetailsPage() {
  const { id } = useParams();
  const { t } = useLanguage();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [agents, setAgents] = useState<User[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subStatuses, setSubStatuses] = useState<TicketSubStatus[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [savingField, setSavingField] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const [ticketRes, agentsRes, catRes, subRes] = await Promise.all([
        api.get(`/Tickets/${id}`),
        api.get('/Users/agents'),
        api.get('/Categories'),
        api.get('/ticketsubstatuses').catch(() => ({ data: [] }))
      ]);
      setTicket(ticketRes.data);
      setAgents(agentsRes.data);
      setCategories(catRes.data);
      setSubStatuses(subRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateField = async (field: 'status' | 'agentId' | 'subStatusId', value: any) => {
    setSavingField(field);
    try {
      await api.put(`/Tickets/${id}`, { [field]: value });
      setTicket(prev => {
        if (!prev) return null;
        if (field === 'status') return { ...prev, status: value };
        if (field === 'agentId') return { ...prev, agent: agents.find(a => a.id === value) || undefined };
        if (field === 'subStatusId') return { ...prev, subStatus: subStatuses.find(s => s.id === value) || undefined };
        return prev;
      });
      // Show success briefly
      setTimeout(() => setSavingField(null), 1000);
    } catch (err) {
      console.error(err);
      setSavingField(null);
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

  const resolveAttachmentUrl = (url?: string) => {
    if (!url) return null;
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    const apiBase = (import.meta.env.VITE_API_BASE_URL || 'https://staging-api.sahldesk.com/api/v1').replace(/\/api(\/v1)?\/?$/, '');
    return `${apiBase}${url.startsWith('/') ? '' : '/'}${url}`;
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 relative">
      
      {/* Header Info */}
      <div className="bg-white border-b border-slate-200 px-4 md:px-6 py-4 flex items-start justify-between">
        <div className="flex items-start space-x-3 rtl:space-x-reverse w-full">
          <Link to="/inbox" className="text-slate-400 hover:text-slate-600 transition-colors mt-1 shrink-0">
            <ArrowLeft size={20} className="rtl:rotate-180" />
          </Link>
          <div className="min-w-0 flex-1">
            <h1 className="text-xl md:text-2xl font-bold text-slate-900 leading-tight break-words">#{ticket.id} - {ticket.subject || (ticket as any).title || (ticket as any).Title || 'No Subject'}</h1>
            <div className="flex flex-wrap items-center gap-2 mt-2 text-xs md:text-sm">
              {ticket.category && (
                <div className="flex items-center text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 font-medium whitespace-nowrap">
                  <div className="w-2 h-2 rounded-full mr-1.5 rtl:mr-0 rtl:ml-1.5" style={{ backgroundColor: categoryObj?.color || '#cbd5e1' }}></div>
                  {ticket.category}
                </div>
              )}
              <span className="text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 font-medium whitespace-nowrap">{t('Priority')}: {t(ticket.priority)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Control Action Bar (Sticky) */}
      <div className="bg-slate-100/80 backdrop-blur-md border-b border-slate-200 px-4 md:px-6 py-3 sticky top-0 z-20 shadow-sm">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          
          <div className="w-full flex items-center bg-white border border-slate-300 rounded-md shadow-sm overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 transition-all">
            <span className="px-3 py-1.5 bg-slate-50 border-r border-slate-300 rtl:border-r-0 rtl:border-l text-sm font-medium text-slate-600 whitespace-nowrap">{t('Status')}</span>
            <select 
              value={ticket.status} 
              onChange={e => updateField('status', e.target.value)}
              className="flex-1 px-3 py-1.5 text-sm bg-transparent font-semibold text-slate-900 outline-none cursor-pointer"
            >
              <option value="Open">{t('Open')}</option>
              <option value="In Progress">{t('In Progress')}</option>
              <option value="Pending">{t('Pending')}</option>
              <option value="Resolved">{t('Resolved')}</option>
              <option value="Closed">{t('Closed')}</option>
            </select>
            <div className="w-8 flex justify-center items-center">
              {savingField === 'status' ? <CheckCircle2 size={16} className="text-green-500 animate-in fade-in" /> : null}
            </div>
          </div>

          <div className="w-full flex items-center bg-white border border-slate-300 rounded-md shadow-sm overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 transition-all">
            <span className="px-3 py-1.5 bg-slate-50 border-r border-slate-300 rtl:border-r-0 rtl:border-l text-sm font-medium text-slate-600 whitespace-nowrap"><UserIcon size={14} className="inline mr-1 rtl:ml-1"/> {t('Agent')}</span>
            <select 
              value={ticket.agent?.id || ''} 
              onChange={e => updateField('agentId', e.target.value ? Number(e.target.value) : null)}
              className="flex-1 px-3 py-1.5 text-sm bg-transparent font-medium text-slate-900 outline-none cursor-pointer"
            >
              <option value="">-- {t('Unassigned')} --</option>
              {agents.map(a => (
                <option key={a.id} value={a.id}>{a.firstName || a.lastName || a.email}</option>
              ))}
            </select>
            <div className="w-8 flex justify-center items-center">
              {savingField === 'agentId' ? <CheckCircle2 size={16} className="text-green-500 animate-in fade-in" /> : null}
            </div>
          </div>

          {subStatuses.length > 0 && (
            <div className="w-full flex items-center bg-white border border-slate-300 rounded-md shadow-sm overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 transition-all">
              <span className="px-3 py-1.5 bg-slate-50 border-r border-slate-300 rtl:border-r-0 rtl:border-l text-sm font-medium text-slate-600 whitespace-nowrap">{t('Sub-Status')}</span>
              <select 
                value={ticket.subStatus?.id || ''} 
                onChange={e => updateField('subStatusId', e.target.value ? Number(e.target.value) : null)}
                className="flex-1 px-3 py-1.5 text-sm bg-transparent font-medium text-slate-900 outline-none cursor-pointer"
              >
                <option value="">-- None --</option>
                {subStatuses.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
              <div className="w-8 flex justify-center items-center">
                {savingField === 'subStatusId' ? <CheckCircle2 size={16} className="text-green-500 animate-in fade-in" /> : null}
              </div>
            </div>
          )}

        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-6">
          
          {/* Main Conversation Stream */}
          <div className="flex-1 space-y-6 pb-4">
            
            {/* Original Ticket Description */}
            <div className="bg-white p-4 md:p-5 rounded-lg shadow-sm border border-slate-200">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-3 gap-2">
                <div className="font-semibold text-slate-900 text-base md:text-lg min-w-0 break-words">{ticket.customer.firstName || ticket.customer.lastName || ticket.customer.email}</div>
                <div className="text-xs text-slate-500 flex items-center bg-slate-100 px-2 py-1 rounded w-fit shrink-0">
                  <Clock size={12} className="mr-1.5 rtl:ml-1.5" />
                  {new Date(ticket.createdDate).toLocaleString()}
                </div>
              </div>
              <div className="text-slate-700 whitespace-pre-wrap leading-relaxed">{ticket.description}</div>
              
              {((ticket as any).attachmentUrl || (ticket as any).AttachmentUrl) && (() => {
                const url = resolveAttachmentUrl((ticket as any).attachmentUrl || (ticket as any).AttachmentUrl);
                const isImage = url?.match(/\.(jpeg|jpg|gif|png|webp)$/i);
                return (
                  <div className="mt-4 pt-3 border-t border-slate-200/60">
                    {isImage ? (
                      <a href={url || undefined} target="_blank" rel="noreferrer" className="block max-w-sm">
                        <img src={url || undefined} alt="Attachment" className="rounded-lg border border-slate-200 shadow-sm max-h-48 object-cover" />
                      </a>
                    ) : (
                      <a href={url || '#'} target="_blank" rel="noreferrer" className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline bg-white px-3 py-1.5 rounded border border-blue-100 shadow-sm transition-all">
                        <ExternalLink size={14} className="mr-2 rtl:ml-2" /> {t('Attachment')}
                      </a>
                    )}
                  </div>
                );
              })()}
            </div>

            {/* Comments */}
            {ticket.comments?.map(comment => (
              <div key={comment.id} className={`p-5 rounded-lg shadow-sm border ${
                comment.isInternal ? 'bg-amber-50/60 border-amber-200 ml-4 md:ml-12 rtl:ml-0 rtl:md:ml-0 rtl:mr-4 rtl:md:mr-12' :
                comment.isStaffReply ? 'bg-blue-50/60 border-blue-200 ml-4 md:ml-12 rtl:ml-0 rtl:md:ml-0 rtl:mr-4 rtl:md:mr-12' : 
                'bg-white border-slate-200 mr-4 md:mr-12 rtl:mr-0 rtl:md:mr-0 rtl:ml-4 rtl:md:ml-12'
              }`}>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-3 gap-2">
                  <div className="flex flex-wrap items-center gap-2 min-w-0">
                    <span className="font-semibold text-slate-900 text-sm md:text-base truncate max-w-full">
                      {comment.user?.firstName || comment.user?.lastName || comment.user?.email || 'Unknown'}
                    </span>
                    {comment.isInternal && (
                      <span className="flex items-center text-[10px] md:text-xs font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded border border-amber-200 whitespace-nowrap">
                        <Lock size={10} className="mr-1 rtl:ml-1" /> INTERNAL
                      </span>
                    )}
                    {comment.isStaffReply && !comment.isInternal && (
                      <span className="text-[10px] md:text-xs font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded border border-blue-200 whitespace-nowrap">STAFF</span>
                    )}
                  </div>
                  <div className="text-xs text-slate-500 shrink-0">{new Date(comment.createdDate).toLocaleString()}</div>
                </div>
                
                <div className="text-slate-700 whitespace-pre-wrap leading-relaxed">{comment.content}</div>
                
                {((comment as any).attachmentUrl || (comment as any).AttachmentUrl) && (() => {
                  const url = resolveAttachmentUrl((comment as any).attachmentUrl || (comment as any).AttachmentUrl);
                  const isImage = url?.match(/\.(jpeg|jpg|gif|png|webp)$/i);
                  return (
                    <div className="mt-4 pt-3 border-t border-slate-200/60">
                      {isImage ? (
                        <a href={url || undefined} target="_blank" rel="noreferrer" className="block max-w-sm">
                          <img src={url || undefined} alt="Attachment" className="rounded-lg border border-slate-200 shadow-sm max-h-48 object-cover" />
                        </a>
                      ) : (
                        <a href={url || '#'} target="_blank" rel="noreferrer" className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline bg-white px-3 py-1.5 rounded border border-blue-100 shadow-sm transition-all">
                          <ExternalLink size={14} className="mr-2 rtl:ml-2" /> {t('Attachment')}
                        </a>
                      )}
                    </div>
                  );
                })()}
              </div>
            ))}
          </div>

          {/* Sidebar */}
          <div className="w-full md:w-72 space-y-4">
            <div className="bg-white p-4 md:p-5 rounded-lg shadow-sm border border-slate-200">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center">
                <UserIcon size={14} className="mr-2 rtl:ml-2" /> Customer Profile
              </h3>
              <div className="space-y-4 text-sm">
                <div>
                  <div className="text-slate-400 mb-1 text-xs uppercase">Name</div>
                  <div className="font-semibold text-slate-900">{ticket.customer.firstName || ticket.customer.lastName || '-'}</div>
                </div>
                <div>
                  <div className="text-slate-400 mb-1 text-xs uppercase">Email</div>
                  <div className="font-semibold text-slate-900 break-all">{ticket.customer.email}</div>
                </div>
              </div>
            </div>

            {ticket.referenceId && (
              <div className="bg-white p-4 md:p-5 rounded-lg shadow-sm border border-slate-200">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center">
                  <Tag size={14} className="mr-2 rtl:ml-2" /> Reference
                </h3>
                <div className="bg-blue-50 border border-blue-100 rounded p-3 text-center">
                  <div className="text-xs text-blue-600 mb-1 font-medium">WooCommerce Order</div>
                  <div className="font-bold text-blue-800 text-lg">#{ticket.referenceId}</div>
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
