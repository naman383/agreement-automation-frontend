'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import apiClient from '@/lib/api';

interface Template {
  id: number;
  name: string;
  description: string;
  status: 'draft' | 'approved' | 'deprecated' | 'active' | 'archived';
  version_number?: number;
  uploaded_at?: string;
  approved_at?: string | null;
  deprecated_at?: string | null;
  uploaded_by?: {
    id: number;
    email: string;
    full_name: string;
  };
  approved_by?: {
    id: number;
    email: string;
    full_name: string;
  } | null;
  // Visual template fields
  type?: 'manual' | 'visual';
  placeholder_count?: number;
  created_at?: string;
  page_count?: number;
  category?: string;
}

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'approved' | 'draft' | 'deprecated'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      // Load only visual templates
      const response = await apiClient.get('/templates/visual/');

      const visualTemplates = (response.data.templates || response.data || []).map((t: any) => ({
        ...t,
        type: 'visual' as const,
        // Map visual template status to match filtering
        status: t.status === 'active' ? 'approved' : t.status === 'draft' ? 'draft' : 'deprecated'
      }));

      setTemplates(visualTemplates);
    } catch (error) {
      console.error('Failed to load templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTemplates = templates.filter((t) => {
    const matchesFilter = filter === 'all' || t.status === filter;
    const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         t.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getStatusBadge = (status: string) => {
    const config = {
      draft: {
        bg: 'bg-yellow-50',
        text: 'text-yellow-700',
        border: 'border-yellow-200',
        icon: '⚠️',
        label: 'Draft'
      },
      approved: {
        bg: 'bg-green-50',
        text: 'text-green-700',
        border: 'border-green-200',
        icon: '✓',
        label: 'Ready to Use'
      },
      deprecated: {
        bg: 'bg-gray-50',
        text: 'text-gray-700',
        border: 'border-gray-200',
        icon: '⊘',
        label: 'Archived'
      },
    };

    const style = config[status as keyof typeof config] || config.draft;

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${style.bg} ${style.text} ${style.border}`}>
        <span className="mr-1">{style.icon}</span>
        {style.label}
      </span>
    );
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'Not yet';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getTemplateLink = (template: Template) => {
    return `/templates/visual/builder/${template.id}`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Premium Header with Logo */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <Link href="/dashboard">
                <Image
                  src="/logo-color.png"
                  alt="STAGE"
                  width={120}
                  height={31}
                  className="h-8 w-auto cursor-pointer"
                />
              </Link>
            </div>
            <nav className="hidden md:flex items-center space-x-8">
              <Link href="/dashboard" className="text-sm font-medium text-gray-600 hover:text-gray-900 pb-4">
                Home
              </Link>
              <Link href="/templates" className="text-sm font-medium text-red-600 border-b-2 border-red-600 pb-4">
                Templates
              </Link>
              <Link href="/agreements" className="text-sm font-medium text-gray-600 hover:text-gray-900 pb-4">
                Agreements
              </Link>
            </nav>
            <div className="flex items-center space-x-4">
              <button className="text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </button>
              <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                <span className="text-sm font-semibold text-red-600">U</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div className="mb-4 md:mb-0">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Agreement Templates</h1>
            <p className="text-lg text-gray-600">
              Manage and configure your document templates
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Link
              href="/templates/visual/upload"
              className="inline-flex items-center justify-center px-6 py-3 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 transition-colors shadow-sm"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Upload New Template
            </Link>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search templates..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm"
                />
              </div>
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap gap-2">
              {[
                { key: 'all', label: 'All', count: templates.length },
                { key: 'approved', label: 'Ready', count: templates.filter((t) => t.status === 'approved').length },
                { key: 'draft', label: 'Draft', count: templates.filter((t) => t.status === 'draft').length },
                { key: 'deprecated', label: 'Archived', count: templates.filter((t) => t.status === 'deprecated').length },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setFilter(tab.key as any)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    filter === tab.key
                      ? 'bg-red-600 text-white shadow-sm'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {tab.label}
                  <span className={`ml-1.5 ${filter === tab.key ? 'text-red-200' : 'text-gray-500'}`}>
                    ({tab.count})
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Templates Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
          </div>
        ) : filteredTemplates.length === 0 ? (
          <div className="bg-white rounded-xl border-2 border-dashed border-gray-300 p-12 text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="mt-4 text-lg font-semibold text-gray-900">No templates found</h3>
            <p className="mt-2 text-sm text-gray-600">
              {searchQuery ? 'Try adjusting your search' : 'Get started by uploading your first template'}
            </p>
            {!searchQuery && (
              <Link
                href="/templates/upload"
                className="mt-6 inline-flex items-center px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors"
              >
                Upload Template
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTemplates.map((template) => (
              <div
                key={template.id}
                className="bg-white rounded-xl border border-gray-200 hover:shadow-lg transition-all overflow-hidden group"
              >
                {/* Card Header */}
                <div className="p-6 pb-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center group-hover:bg-red-100 transition-colors">
                      <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    {getStatusBadge(template.status)}
                  </div>

                  <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-red-600 transition-colors">
                    {template.name}
                  </h3>

                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {template.description || 'No description provided'}
                  </p>

                  {/* Metadata */}
                  <div className="space-y-2 text-xs text-gray-500">
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                      {template.placeholder_count || 0} fields configured
                    </div>
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {formatDate(template.created_at)}
                    </div>
                    {template.category && (
                      <div className="flex items-center">
                        <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                        {template.category}
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Actions */}
                <div className="border-t border-gray-100 bg-gray-50 px-6 py-3 flex items-center justify-between">
                  <span className="text-xs text-gray-500">
                    {template.page_count || 1} pages
                  </span>
                  <Link
                    href={getTemplateLink(template)}
                    className="text-sm font-medium text-red-600 hover:text-red-700 flex items-center group"
                  >
                    Edit
                    <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Stats Summary */}
        {!loading && filteredTemplates.length > 0 && (
          <div className="mt-8 bg-gradient-to-r from-gray-900 to-gray-800 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-400 mb-1">Total Templates</div>
                <div className="text-3xl font-bold">{filteredTemplates.length}</div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-400">
                  {templates.filter(t => t.status === 'approved').length} ready to use • {' '}
                  {templates.filter(t => t.status === 'draft').length} in draft
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
