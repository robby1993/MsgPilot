'use client';

import React, { useEffect, useState } from 'react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { Trash2 } from 'lucide-react';

interface MailList { id: number; name: string; subscriberCount: number; }
interface Template { id: number; name: string; subject: string; body: string; }
interface Campaign {
  id: number;
  name: string;
  subject: string;
  status: string;
  sentCount: number;
  skippedCount: number;
  listIds: number[];
}

export default function MailCampaignsPage() {
  const [lists, setLists] = useState<MailList[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [name, setName] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [templateId, setTemplateId] = useState('');
  const [listIds, setListIds] = useState<number[]>([]);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const [listRes, templateRes, campaignRes] = await Promise.all([
      api.get('/mail/lists'),
      api.get('/mail/templates'),
      api.get('/mail/campaigns'),
    ]);
    if (Array.isArray(listRes.data?.result)) setLists(listRes.data.result);
    if (Array.isArray(templateRes.data?.result)) setTemplates(templateRes.data.result);
    if (Array.isArray(campaignRes.data?.result)) setCampaigns(campaignRes.data.result);
  };

  useEffect(() => { load().catch(() => toast.error('Failed to load campaigns')); }, []);

  const toggleList = (id: number) => {
    setListIds((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  };

  const applyTemplate = (id: string) => {
    setTemplateId(id);
    const template = templates.find((item) => String(item.id) === id);
    if (template) {
      setSubject(template.subject);
      setBody(template.body);
    }
  };

  const createAndSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const created = await api.post('/mail/campaigns', { name, subject, body, templateId: templateId ? Number(templateId) : null, listIds });
      const id = created.data?.result?.id;
      const sent = await api.post(`/mail/campaigns/${id}/send`);
      toast.success(`Sent to ${sent.data?.result?.sentCount || 0} subscribers`);
      setName('');
      setSubject('');
      setBody('');
      setListIds([]);
      load();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Could not send campaign');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 py-4">
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Campaigns</h2>
        <p className="text-gray-600 mt-1">Send one message to every confirmed, enabled subscriber on the lists you pick.</p>
      </div>

      <form onSubmit={createAndSend} className="bg-white border rounded-2xl p-5 space-y-3">
        <input value={name} onChange={(e) => setName(e.target.value)} required placeholder="Campaign name" className="w-full border rounded-xl px-3 py-2 text-sm" />
        <select value={templateId} onChange={(e) => applyTemplate(e.target.value)} className="w-full border rounded-xl px-3 py-2 text-sm">
          <option value="">No template</option>
          {templates.map((template) => <option key={template.id} value={template.id}>{template.name}</option>)}
        </select>
        <input value={subject} onChange={(e) => setSubject(e.target.value)} required placeholder="Subject" className="w-full border rounded-xl px-3 py-2 text-sm" />
        <textarea value={body} onChange={(e) => setBody(e.target.value)} required rows={5} placeholder="Body" className="w-full border rounded-xl px-3 py-2 text-sm" />
        <div className="space-y-1">
          {lists.map((list) => (
            <label key={list.id} className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={listIds.includes(list.id)} onChange={() => toggleList(list.id)} />
              {list.name} ({list.subscriberCount} confirmed)
            </label>
          ))}
          {lists.length === 0 && <p className="text-sm text-gray-500">Create a list first.</p>}
        </div>
        <button disabled={saving} className="px-4 py-2 bg-amber-600 text-white rounded-xl text-sm font-bold">{saving ? 'Sending...' : 'Create and send'}</button>
      </form>

      <div className="bg-white border rounded-2xl divide-y">
        {campaigns.map((campaign) => (
          <div key={campaign.id} className="p-4 flex justify-between gap-3">
            <div>
              <p className="font-bold">{campaign.name}</p>
              <p className="text-sm text-gray-600">{campaign.subject}</p>
              <p className="text-xs text-gray-500">{campaign.status} · sent {campaign.sentCount} · skipped {campaign.skippedCount}</p>
            </div>
            <button onClick={async () => { await api.delete(`/mail/campaigns/${campaign.id}`); load(); }} className="text-red-600"><Trash2 size={16} /></button>
          </div>
        ))}
      </div>
    </div>
  );
}
