"use client";

import { useState, useEffect } from 'react';
import { Download, Trash2, Edit2, Loader2, Plus, FileText, FileJson, Table as TableIcon, FileCode, File } from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

interface WeatherRecord {
  id: string;
  location: string;
  startDate: string;
  endDate: string;
  avgTemp: number | null;
  maxTemp: number | null;
  minTemp: number | null;
  createdAt: string;
}

export default function HistoryView() {
  const [records, setRecords] = useState<WeatherRecord[]>([]);
  const [loading, setLoading] = useState(true);
  

  const [location, setLocation] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    try {
      const res = await fetch('/api/history');
      const data = await res.json();
      if (Array.isArray(data)) setRecords(data);
    } catch (err) {
      console.error('Failed to fetch records');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const url = editingId ? `/api/history/${editingId}` : '/api/history';
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ location, startDate, endDate })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save record');

      await fetchRecords();
      handleCancel();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (record: WeatherRecord) => {
    setEditingId(record.id);
    setLocation(record.location);
    setStartDate(record.startDate.split('T')[0]);
    setEndDate(record.endDate.split('T')[0]);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this record?')) return;
    try {
      await fetch(`/api/history/${id}`, { method: 'DELETE' });
      setRecords(records.filter(r => r.id !== id));
    } catch (err) {
      alert('Failed to delete record');
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setLocation('');
    setStartDate('');
    setEndDate('');
    setError('');
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text("Weather History Report", 14, 15);
    const tableData = records.map(r => [
      r.location,
      new Date(r.startDate).toLocaleDateString(),
      new Date(r.endDate).toLocaleDateString(),
      r.avgTemp?.toFixed(1) || 'N/A',
      r.maxTemp?.toFixed(1) || 'N/A',
      r.minTemp?.toFixed(1) || 'N/A'
    ]);
    autoTable(doc, {
      head: [['Location', 'Start Date', 'End Date', 'Avg Temp', 'Max Temp', 'Min Temp']],
      body: tableData,
      startY: 20
    });
    doc.save("weather-history.pdf");
  };

  const handleExport = (format: string) => {
    if (format === 'pdf') {
      exportPDF();
    } else {
      window.location.href = `/api/export?format=${format}`;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">

      <div className="bg-white/60 dark:bg-[#111]/60 backdrop-blur-xl rounded-3xl shadow-sm p-8 border border-gray-200/50 dark:border-white/5">
        <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
          {editingId ? <Edit2 size={18} /> : <Plus size={18} />}
          {editingId ? 'Edit Weather Record' : 'Log Historical Weather'}
        </h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-5 items-end">
          <div className="space-y-1.5 md:col-span-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">Location</label>
            <input
              type="text"
              required
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="City, zip code, etc."
              className="w-full px-4 py-3 rounded-xl border border-gray-200/60 dark:border-white/5 bg-white/50 dark:bg-[#1a1a1a]/50 backdrop-blur-md focus:ring-1 focus:ring-blue-500/50 outline-none transition-all font-medium text-sm"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">Start Date</label>
            <input
              type="date"
              required
              max={new Date().toISOString().split('T')[0]}
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200/60 dark:border-white/5 bg-white/50 dark:bg-[#1a1a1a]/50 backdrop-blur-md focus:ring-1 focus:ring-blue-500/50 outline-none transition-all font-medium text-sm"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">End Date</label>
            <input
              type="date"
              required
              max={new Date().toISOString().split('T')[0]}
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200/60 dark:border-white/5 bg-white/50 dark:bg-[#1a1a1a]/50 backdrop-blur-md focus:ring-1 focus:ring-blue-500/50 outline-none transition-all font-medium text-sm"
            />
          </div>
          
          <div className="md:col-span-4 flex gap-3 mt-4">
            <button
              type="submit"
              disabled={submitting}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-medium transition-all shadow-sm flex items-center justify-center gap-2 flex-1 md:flex-none disabled:opacity-70 active:scale-95 text-sm"
            >
              {submitting && <Loader2 className="animate-spin" size={16} />}
              {editingId ? 'Update Record' : 'Fetch & Save'}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={handleCancel}
                className="bg-white/50 hover:bg-white dark:bg-[#1a1a1a]/50 dark:hover:bg-[#1a1a1a] backdrop-blur-md border border-gray-200/60 dark:border-white/5 text-gray-800 dark:text-gray-200 px-6 py-3 rounded-xl font-medium transition-all shadow-sm active:scale-95 text-sm"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
        {error && <p className="text-red-500 text-sm font-medium mt-4 bg-red-50/50 dark:bg-red-900/10 p-3 rounded-lg border border-red-200 dark:border-red-900/30">{error}</p>}
      </div>


      <div className="bg-white/60 dark:bg-[#111]/60 backdrop-blur-xl rounded-3xl shadow-sm p-8 border border-gray-200/50 dark:border-white/5">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-6">
          <h2 className="text-lg font-semibold tracking-tight">Saved Records</h2>
          <div className="flex flex-wrap gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400 flex items-center mr-2">Export</span>
            <button onClick={() => handleExport('json')} className="px-3 py-1.5 bg-white/40 dark:bg-white/5 hover:bg-white/80 dark:hover:bg-white/10 border border-gray-200/50 dark:border-white/5 rounded-lg text-xs font-medium transition-colors flex gap-1.5 items-center"><FileJson size={14} className="text-gray-500"/> JSON</button>
            <button onClick={() => handleExport('csv')} className="px-3 py-1.5 bg-white/40 dark:bg-white/5 hover:bg-white/80 dark:hover:bg-white/10 border border-gray-200/50 dark:border-white/5 rounded-lg text-xs font-medium transition-colors flex gap-1.5 items-center"><TableIcon size={14} className="text-gray-500"/> CSV</button>
            <button onClick={() => handleExport('xml')} className="px-3 py-1.5 bg-white/40 dark:bg-white/5 hover:bg-white/80 dark:hover:bg-white/10 border border-gray-200/50 dark:border-white/5 rounded-lg text-xs font-medium transition-colors flex gap-1.5 items-center"><FileCode size={14} className="text-gray-500"/> XML</button>
            <button onClick={() => handleExport('md')} className="px-3 py-1.5 bg-white/40 dark:bg-white/5 hover:bg-white/80 dark:hover:bg-white/10 border border-gray-200/50 dark:border-white/5 rounded-lg text-xs font-medium transition-colors flex gap-1.5 items-center"><FileText size={14} className="text-gray-500"/> MD</button>
            <button onClick={() => handleExport('pdf')} className="px-3 py-1.5 bg-white/40 dark:bg-white/5 hover:bg-white/80 dark:hover:bg-white/10 border border-gray-200/50 dark:border-white/5 rounded-lg text-xs font-medium transition-colors flex gap-1.5 items-center text-red-500/80"><File size={14}/> PDF</button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center p-12"><Loader2 className="animate-spin text-gray-400" size={24} /></div>
        ) : records.length === 0 ? (
          <div className="text-center p-12 text-sm text-gray-500 border border-dashed rounded-2xl border-gray-300/50 dark:border-gray-700/50">
            No records found. Save a historical weather record to view it here.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-gray-100/50 dark:border-white/5">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-gray-50/50 dark:bg-[#1a1a1a]/50 text-xs font-semibold uppercase tracking-wider text-gray-500">
                <tr>
                  <th className="px-6 py-4 rounded-tl-2xl">Location</th>
                  <th className="px-6 py-4">Date Range</th>
                  <th className="px-6 py-4">Avg</th>
                  <th className="px-6 py-4">Max</th>
                  <th className="px-6 py-4">Min</th>
                  <th className="px-6 py-4 text-right rounded-tr-2xl">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100/50 dark:divide-white/5 text-gray-700 dark:text-gray-300">
                {records.map(record => (
                  <tr key={record.id} className="hover:bg-white/30 dark:hover:bg-[#1a1a1a]/30 transition-colors">
                    <td className="px-6 py-4 font-medium">{record.location}</td>
                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400 text-xs">
                      {new Date(record.startDate).toLocaleDateString()} - {new Date(record.endDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">{record.avgTemp?.toFixed(1) || '-'}°</td>
                    <td className="px-6 py-4 text-gray-500">{record.maxTemp?.toFixed(1) || '-'}°</td>
                    <td className="px-6 py-4 text-gray-500">{record.minTemp?.toFixed(1) || '-'}°</td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => handleEdit(record)} className="p-2 text-gray-400 hover:text-blue-500 transition-colors" title="Edit">
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => handleDelete(record.id)} className="p-2 text-gray-400 hover:text-red-500 transition-colors" title="Delete">
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
