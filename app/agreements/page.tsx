'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import apiClient from '@/lib/api';

interface Agreement {
  id: number;
  agreement_id: string | null;
  template: {
    id: number;
    name: string;
    version_number: number;
  };
  status: string;
  generated_at: string | null;
  generated_by: {
    email: string;
    full_name: string;
  };
}

export default function AgreementsPage() {
  const [agreements, setAgreements] = useState<Agreement[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [searchQuery, setSearchQuery] = useState('');
  const [templateFilter, setTemplateFilter] = useState('');
  const [templates, setTemplates] = useState<any[]>([]);

  useEffect(() => {
    loadTemplates();
  }, []);

  useEffect(() => {
    loadAgreements();
  }, [page, searchQuery, templateFilter]);

  const loadTemplates = async () => {
    try {
      const response = await apiClient.get('/templates/');
      const templatesList = response.data.templates || response.data || [];
      setTemplates(Array.isArray(templatesList) ? templatesList.filter((t: any) => t.status === 'approved') : []);
    } catch (error) {
      console.error('Failed to load templates:', error);
    }
  };

  const loadAgreements = async () => {
    setLoading(true);
    try {
      const params: any = {
        page,
        page_size: pageSize,
      };

      if (searchQuery) params.search = searchQuery;
      if (templateFilter) params.template_id = templateFilter;

      const response = await apiClient.get('/agreements/list/', { params });
      setAgreements(response.data.agreements || response.data.results || []);
      setTotalCount(response.data.pagination?.total_count || response.data.total_count || 0);
    } catch (error) {
      console.error('Failed to load agreements:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setTemplateFilter('');
    setPage(1);
  };

  const getStatusBadge = (status: string) => {
    const config = {
      draft: {
        bg: 'bg-yellow-50',
        text: 'text-yellow-700',
        border: 'border-yellow-200',
        icon: '⏳',
        label: 'Draft'
      },
      generated: {
        bg: 'bg-green-50',
        text: 'text-green-700',
        border: 'border-green-200',
        icon: '✓',
        label: 'Generated'
      },
      error: {
        bg: 'bg-red-50',
        text: 'text-red-700',
        border: 'border-red-200',
        icon: '⚠',
        label: 'Error'
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

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not generated';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Premium Header */}
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
              <Link href="/templates" className="text-sm font-medium text-gray-600 hover:text-gray-900 pb-4">
                Templates
              </Link>
              <Link href="/agreements" className="text-sm font-medium text-red-600 border-b-2 border-red-600 pb-4">
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
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Agreements</h1>
            <p className="text-lg text-gray-600">
              {totalCount} agreement{totalCount !== 1 ? 's' : ''} generated
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Link
              href="/agreements/visual/create"
              className="inline-flex items-center justify-center px-6 py-3 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 transition-colors shadow-sm"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create New Agreement
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
                  placeholder="Search agreements..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && loadAgreements()}
                  className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm"
                />
              </div>
            </div>

            {/* Template Filter */}
            <div className="w-full md:w-64">
              <select
                value={templateFilter}
                onChange={(e) => setTemplateFilter(e.target.value)}
                className="block w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm"
              >
                <option value="">All Templates</option>
                {templates.map((template) => (
                  <option key={template.id} value={template.id}>
                    {template.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Clear Button */}
            {(searchQuery || templateFilter) && (
              <button
                onClick={handleClearFilters}
                className="px-4 py-2.5 border-2 border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors whitespace-nowrap"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>

        {/* Agreements Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
          </div>
        ) : agreements.length === 0 ? (
          <div className="bg-white rounded-xl border-2 border-dashed border-gray-300 p-12 text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="mt-4 text-lg font-semibold text-gray-900">No agreements found</h3>
            <p className="mt-2 text-sm text-gray-600">
              {searchQuery || templateFilter ? 'Try adjusting your filters' : 'Get started by creating your first agreement'}
            </p>
            {!searchQuery && !templateFilter && (
              <Link
                href="/agreements/start"
                className="mt-6 inline-flex items-center px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors"
              >
                New Agreement
              </Link>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {agreements.map((agreement) => (
                <Link
                  key={agreement.id}
                  href={`/agreements/${agreement.id}`}
                  className="bg-white rounded-xl border border-gray-200 hover:shadow-lg transition-all overflow-hidden group"
                >
                  {/* Card Content */}
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      {getStatusBadge(agreement.status)}
                    </div>

                    <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-red-600 transition-colors">
                      {agreement.template.name}
                    </h3>

                    {agreement.agreement_id && (
                      <p className="text-sm text-gray-600 mb-4">
                        ID: <span className="font-mono">{agreement.agreement_id}</span>
                      </p>
                    )}

                    {/* Metadata */}
                    <div className="space-y-2 text-xs text-gray-500">
                      <div className="flex items-center">
                        <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        {agreement.generated_by.full_name || agreement.generated_by.email}
                      </div>
                      <div className="flex items-center">
                        <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {formatDate(agreement.generated_at)}
                      </div>
                      <div className="flex items-center text-gray-400">
                        <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                        Template v{agreement.template.version_number}
                      </div>
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div className="border-t border-gray-100 bg-gray-50 px-6 py-3 flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      View Details
                    </span>
                    <svg className="w-4 h-4 text-gray-400 group-hover:text-red-600 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex items-center justify-between">
                <p className="text-sm text-gray-700">
                  Page <span className="font-semibold">{page}</span> of{' '}
                  <span className="font-semibold">{totalPages}</span>
                </p>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-400 transition-colors"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPage(Math.min(totalPages, page + 1))}
                    disabled={page === totalPages}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-400 transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {/* Stats Summary */}
        {!loading && agreements.length > 0 && (
          <div className="mt-8 bg-gradient-to-r from-gray-900 to-gray-800 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-400 mb-1">Total Agreements</div>
                <div className="text-3xl font-bold">{totalCount}</div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-400">
                  {agreements.filter(a => a.status === 'generated').length} generated • {' '}
                  {agreements.filter(a => a.status === 'draft').length} in draft
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
