import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Ticket } from '../types/api';

export default function InboxPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/Tickets').then(res => {
      setTickets(res.data);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Inbox</h1>
      {loading ? (
        <p>Loading tickets...</p>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Subject</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {tickets.map(t => (
                <tr key={t.id} className="hover:bg-slate-50 cursor-pointer">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">#{t.id}</td>
                  <td className="px-6 py-4 text-sm text-slate-900">{t.subject}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{t.status}</td>
                </tr>
              ))}
              {tickets.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-6 py-8 text-center text-sm text-slate-500">No tickets found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
