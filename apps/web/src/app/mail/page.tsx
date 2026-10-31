'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { List, Users, FileText, Mail } from 'lucide-react';

export default function MailDashboardPage() {
  const [stats, setStats] = useState({ lists: 0, subscribers: 0, templates: 0, campaigns: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/mail/lists').catch(() => ({ data: { result: [] } })),
      api.get('/mail/subscribers').catch(() => ({ data: { result: [] } })),
      api.get('/mail/templates').catch(() => ({ data: { result: [] } })),
      api.get('/mail/campaigns').catch(() => ({ data: { result: [] } })),
    ]).then(([lists, subscribers, templates, campaigns]) => {
      setStats({
        lists: lists.data?.result?.length || 0,
        subscribers: subscribers.data?.result?.length || 0,
        templates: templates.data?.result?.length || 0,
        campaigns: campaigns.data?.result?.length || 0,
      });
      setLoading(false);
    });
  }, []);

  const cards = [
    { label: 'Lists', value: stats.lists, href: '/mail/lists', icon: List },
    { label: 'Subscribers', value: stats.subscribers, href: '/mail/subscribers', icon: Users },
    { label: 'Templates', value: stats.templates, href: '/mail/templates', icon: FileText },
    { label: 'Campaigns', value: stats.campaigns, href: '/mail/campaigns', icon: Mail },
  ];

  if (loading) return <div className="p-8">Loading mail listing...</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-6 py-4">
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Mail Listing</h2>
        <p className="text-gray-600 mt-1">Lists, subscribers, templates, and campaigns for this account.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Link key={card.href} href={card.href} className="bg-white border rounded-2xl p-5 shadow-sm hover:border-amber-300">
              <Icon className="text-amber-600" size={20} />
              <p className="text-3xl font-bold mt-3">{card.value}</p>
              <p className="text-sm text-gray-500">{card.label}</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
