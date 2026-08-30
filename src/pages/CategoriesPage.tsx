import React, { useEffect, useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Category } from '../types/api';
import api from '../services/api';

export default function CategoriesPage() {
  const { t } = useLanguage();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form State
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState<number | null>(null);
  const [name, setName] = useState('');
  const [color, setColor] = useState('#3b82f6');

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await api.get('/Categories');
      setCategories(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEditing && currentId) {
        await api.put(`/Categories/${currentId}`, { name, color });
      } else {
        await api.post('/Categories', { name, color });
      }
      resetForm();
      fetchCategories();
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = (category: Category) => {
    setIsEditing(true);
    setCurrentId(category.id);
    setName(category.name);
    setColor(category.color || '#3b82f6');
  };

  const handleDelete = async (id: number) => {
    if (window.confirm(t('Are you sure you want to delete this category?'))) {
      try {
        await api.delete(`/Categories/${id}`);
        fetchCategories();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const resetForm = () => {
    setIsEditing(false);
    setCurrentId(null);
    setName('');
    setColor('#3b82f6');
  };

  if (loading) return <div className="p-8 text-center text-slate-500">Loading...</div>;

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">
      <h1 className="text-2xl font-bold text-slate-900">{t('Categories')}</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Form */}
        <div className="md:col-span-1 bg-white p-6 rounded-lg shadow-sm border border-slate-200">
          <h2 className="text-lg font-medium text-slate-800 mb-4">
            {isEditing ? t('Edit Category') : t('Add Category')}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">{t('Category Name')}</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} required className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">{t('Color')}</label>
              <input type="color" value={color} onChange={e => setColor(e.target.value)} className="mt-1 block w-16 h-10 rounded-md border border-slate-300 p-1" />
            </div>
            <div className="flex space-x-2 rtl:space-x-reverse pt-2">
              <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700">{t('Save')}</button>
              {isEditing && (
                <button type="button" onClick={resetForm} className="bg-slate-100 text-slate-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-slate-200">{t('Cancel')}</button>
              )}
            </div>
          </form>
        </div>

        {/* List */}
        <div className="md:col-span-2 bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-start text-xs font-medium text-slate-500 uppercase tracking-wider">{t('Category Name')}</th>
                <th className="px-6 py-3 text-start text-xs font-medium text-slate-500 uppercase tracking-wider">{t('Tickets')}</th>
                <th className="px-6 py-3 text-end text-xs font-medium text-slate-500 uppercase tracking-wider">{t('Actions')}</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {categories.map(cat => (
                <tr key={cat.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full mr-3 rtl:mr-0 rtl:ml-3" style={{ backgroundColor: cat.color || '#3b82f6' }}></div>
                      <span className="text-sm font-medium text-slate-900">{cat.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                    {cat.ticketCount || 0}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-end text-sm font-medium space-x-3 rtl:space-x-reverse">
                    <button onClick={() => handleEdit(cat)} className="text-indigo-600 hover:text-indigo-900">{t('Edit Category')}</button>
                    <button onClick={() => handleDelete(cat.id)} className="text-red-600 hover:text-red-900">{t('Delete')}</button>
                  </td>
                </tr>
              ))}
              {categories.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-6 py-8 text-center text-slate-500 text-sm">No categories found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
