'use client';

import React, { useEffect, useState } from 'react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { Trash2 } from 'lucide-react';

interface Template { id: number; name: string; subject: string; body: string; }

export default function MailTemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [name, setName] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');

  const load = async () => {
    const res = await api.get('/mail/templates');
    if (Array.isArray(res.data?.result)) setTemplates(res.data.result);
  };

  useEffect(() => { load().catch(() => toast.error('Failed to load templates')); }, []);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/mail/templates', { name, subject, body });
      toast.success('Template saved');
      setName('');
      setSubject('');
      setBody('');
      load();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Could not save template');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 py-4">
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Templates</h2>
        <p className="text-gray-600 mt-1">Use {'{{ .Subscriber.Name }}'} and {'{{ .Subscriber.Email }}'} in the subject or body.</p>
      </div>
      <form onSubmit={create} className="bg-white border rounded-2xl p-5 space-y-3">
        <input value={name} onChange={(e) => setName(e.target.value)} required placeholder="Template name" className="w-full border rounded-xl px-3 py-2 text-sm" />
        <input value={subject} onChange={(e) => setSubject(e.target.value)} required placeholder="Subject" className="w-full border rounded-xl px-3 py-2 text-sm" />
        <textarea value={body} onChange={(e) => setBody(e.target.value)} required rows={6} placeholder="Message body" className="w-full border rounded-xl px-3 py-2 text-sm" />
        <button className="px-4 py-2 bg-amber-600 text-white rounded-xl text-sm font-bold">Save template</button>
      </form>
      <div className="bg-white border rounded-2xl divide-y">
        {templates.map((template) => (
          <div key={template.id} className="p-4 flex justify-between gap-3">
            <div>
              <p className="font-bold">{template.name}</p>
              <p className="text-sm text-gray-600">{template.subject}</p>
            </div>
            <button onClick={async () => { await api.delete(`/mail/templates/${template.id}`); load(); }} className="text-red-600"><Trash2 size={16} /></button>
          </div>
        ))}
      </div>
    </div>
  );
}
