'use client';

import React, { useEffect, useState } from 'react';
import api from '@/lib/api';
import toast from 'react-hot-toast';

interface MailList { id: number; name: string; optin: string; }
interface Subscriber {
  id: number;
  name: string;
  email: string;
  status: string;
  lists: { listId: number; status: string }[];
}

export default function MailSubscribersPage() {
  const [lists, setLists] = useState<MailList[]>([]);
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [listId, setListId] = useState('');
  const [importText, setImportText] = useState('');
  const [importListId, setImportListId] = useState('');

  const load = async () => {
    try {
      const [listRes, subRes] = await Promise.all([api.get('/mail/lists'), api.get('/mail/subscribers')]);
      if (Array.isArray(listRes.data?.result)) setLists(listRes.data.result);
      if (Array.isArray(subRes.data?.result)) setSubscribers(subRes.data.result);
    } catch {
      toast.error('Failed to load subscribers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const addOne = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/mail/subscribers', { name, email, listId: listId ? Number(listId) : undefined });
      toast.success('Subscriber saved');
      setName('');
      setEmail('');
      load();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Could not save subscriber');
    }
  };

  const importRows = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post('/mail/subscribers/import', { text: importText, listId: importListId ? Number(importListId) : undefined });
      toast.success(`Imported ${res.data?.result?.created || 0} subscribers`);
      setImportText('');
      load();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Import failed');
    }
  };

  const toggleBlock = async (subscriber: Subscriber) => {
    await api.put(`/mail/subscribers/${subscriber.id}`, { status: subscriber.status === 'blocklisted' ? 'enabled' : 'blocklisted' });
    load();
  };

  const confirm = async (listIdValue: number, subscriberId: number) => {
    await api.post(`/mail/lists/${listIdValue}/subscribers/${subscriberId}/confirm`);
    toast.success('Subscription confirmed');
    load();
  };

  const remove = async (id: number) => {
    if (!confirm('Delete this subscriber?')) return;
    await api.delete(`/mail/subscribers/${id}`);
    load();
  };

  if (loading) return <div className="p-8">Loading subscribers...</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-6 py-4">
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Subscribers</h2>
        <p className="text-gray-600 mt-1">Add people by email, import a list, or blocklist an address.</p>
      </div>

      <form onSubmit={addOne} className="bg-white border rounded-2xl p-5 grid md:grid-cols-4 gap-3">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" className="border rounded-xl px-3 py-2 text-sm" />
        <input value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="Email" className="border rounded-xl px-3 py-2 text-sm" />
        <select value={listId} onChange={(e) => setListId(e.target.value)} className="border rounded-xl px-3 py-2 text-sm">
          <option value="">No list</option>
          {lists.map((list) => <option key={list.id} value={list.id}>{list.name}</option>)}
        </select>
        <button className="bg-amber-600 text-white rounded-xl text-sm font-bold">Add subscriber</button>
      </form>

      <form onSubmit={importRows} className="bg-white border rounded-2xl p-5 space-y-3">
        <p className="text-sm font-semibold">Import</p>
        <p className="text-xs text-gray-500">One person per line: email, or Name, email</p>
        <textarea value={importText} onChange={(e) => setImportText(e.target.value)} rows={4} className="w-full border rounded-xl px-3 py-2 text-sm" />
        <div className="flex gap-3">
          <select value={importListId} onChange={(e) => setImportListId(e.target.value)} className="border rounded-xl px-3 py-2 text-sm">
            <option value="">Do not add to a list</option>
            {lists.map((list) => <option key={list.id} value={list.id}>{list.name}</option>)}
          </select>
          <button className="px-4 py-2 border rounded-xl text-sm font-bold">Import</button>
        </div>
      </form>

      <div className="bg-white border rounded-2xl divide-y">
        {subscribers.length === 0 && <p className="p-6 text-sm text-gray-500">No subscribers yet.</p>}
        {subscribers.map((subscriber) => (
          <div key={subscriber.id} className="p-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-bold">{subscriber.name} <span className="font-normal text-gray-500">{subscriber.email}</span></p>
              <p className="text-xs text-gray-500">
                {subscriber.status}
                {subscriber.lists.map((item) => {
                  const list = lists.find((entry) => entry.id === item.listId);
                  return ` · ${list?.name || 'List'} (${item.status})`;
                })}
              </p>
            </div>
            <div className="flex gap-2">
              {subscriber.lists.filter((item) => item.status === 'unconfirmed').map((item) => (
                <button key={item.listId} onClick={() => confirm(item.listId, subscriber.id)} className="text-xs px-3 py-1.5 bg-amber-50 text-amber-800 rounded-lg">Confirm</button>
              ))}
              <button onClick={() => toggleBlock(subscriber)} className="text-xs px-3 py-1.5 border rounded-lg">{subscriber.status === 'blocklisted' ? 'Enable' : 'Blocklist'}</button>
              <button onClick={() => remove(subscriber.id)} className="text-xs px-3 py-1.5 text-red-600 border border-red-200 rounded-lg">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
