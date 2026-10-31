'use client';

import React, { useEffect, useState } from 'react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { Plus, Trash2 } from 'lucide-react';

interface MailList {
  id: number;
  name: string;
  type: string;
  optin: string;
  description?: string;
  tags?: string[];
  subscriberCount: number;
}

export default function MailListsPage() {
  const [lists, setLists] = useState<MailList[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState('');
  const [type, setType] = useState('private');
  const [optin, setOptin] = useState('single');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      const res = await api.get('/mail/lists');
      if (Array.isArray(res.data?.result)) setLists(res.data.result);
    } catch {
      toast.error('Failed to load lists');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const createList = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.post('/mail/lists', { name, type, optin, description, tags });
      if (res.data?.status) {
        toast.success('List created');
        setName('');
        setDescription('');
        setTags('');
        setShowAdd(false);
        load();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Could not create list');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    if (!confirm('Delete this list? Subscribers stay in your account, but they are removed from this list.')) return;
    await api.delete(`/mail/lists/${id}`);
    toast.success('List deleted');
    load();
  };

  if (loading) return <div className="p-8">Loading lists...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Lists</h2>
          <p className="text-gray-600 mt-1">Public or private lists, with single or double opt-in.</p>
        </div>
        <button onClick={() => setShowAdd((open) => !open)} className="px-4 py-2 bg-amber-600 text-white rounded-xl text-sm font-bold flex items-center gap-2">
          <Plus size={16} /> New list
        </button>
      </div>

      {showAdd && (
        <form onSubmit={createList} className="bg-white border rounded-2xl p-5 space-y-3">
          <input value={name} onChange={(e) => setName(e.target.value)} required placeholder="List name" className="w-full border rounded-xl px-3 py-2 text-sm" />
          <div className="grid grid-cols-2 gap-3">
            <select value={type} onChange={(e) => setType(e.target.value)} className="border rounded-xl px-3 py-2 text-sm">
              <option value="private">Private</option>
              <option value="public">Public</option>
            </select>
            <select value={optin} onChange={(e) => setOptin(e.target.value)} className="border rounded-xl px-3 py-2 text-sm">
              <option value="single">Single opt-in</option>
              <option value="double">Double opt-in</option>
            </select>
          </div>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description" className="w-full border rounded-xl px-3 py-2 text-sm" />
          <input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="Tags, comma separated" className="w-full border rounded-xl px-3 py-2 text-sm" />
          <button disabled={saving} className="px-4 py-2 bg-amber-600 text-white rounded-xl text-sm font-bold">{saving ? 'Saving...' : 'Create list'}</button>
        </form>
      )}

      <div className="bg-white border rounded-2xl divide-y">
        {lists.length === 0 && <p className="p-6 text-sm text-gray-500">No lists yet.</p>}
        {lists.map((list) => (
          <div key={list.id} className="p-4 flex items-center justify-between gap-3">
            <div>
              <p className="font-bold text-gray-900">{list.name}</p>
              <p className="text-xs text-gray-500">{list.type} · {list.optin} opt-in · {list.subscriberCount} confirmed</p>
              {list.description && <p className="text-sm text-gray-600 mt-1">{list.description}</p>}
            </div>
            <button onClick={() => remove(list.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={16} /></button>
          </div>
        ))}
      </div>
    </div>
  );
}
