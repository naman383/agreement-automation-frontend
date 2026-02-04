'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import apiClient from '@/lib/api';

interface Template {
  id: number;
  name: string;
  description: string;
  status: 'draft' | 'approved' | 'deprecated';
  version_number: number;
  uploaded_at: string;
  approved_at: string | null;
  deprecated_at: string | null;
  deprecation_reason: string | null;
  uploaded_by: {
    id: number;
    email: string;
    full_name: string;
  };
  approved_by: {
    id: number;
    email: string;
    full_name: string;
  } | null;
  placeholders: any[];
  parent_template: number | null;
}

interface User {
  role: string;
}

export default function TemplateDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const templateId = params.id;

  const [template, setTemplate] = useState<Template | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deprecationReason, setDeprecationReason] = useState('');
  const [showDeprecateModal, setShowDeprecateModal] = useState(false);

  useEffect(() => {
    loadData();
  }, [templateId]);

  const loadData = async () => {
    try {
      const [templateRes, userRes] = await Promise.all([
        apiClient.get(`/templates/${templateId}/`),
        apiClient.get('/auth/me/'),
      ]);
      setTemplate(templateRes.data);
      setUser(userRes.data);
    } catch (error) {
      console.error('Failed to load data:', error);
      setError('Failed to load template');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!confirm('Are you sure you want to approve this template? This will make it available for use and deprecate other versions.')) {
      return;
    }

    setActionLoading(true);
    setError(null);

    try {
      await apiClient.post(`/templates/${templateId}/approve/`);
      await loadData();
    } catch (err: any) {
      console.error('Approve failed:', err);
      setError(err.response?.data?.error || 'Failed to approve template');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeprecate = async () => {
    if (!deprecationReason.trim()) {
      setError('Please provide a deprecation reason');
      return;
    }

    setActionLoading(true);
    setError(null);

    try {
      await apiClient.post(`/templates/${templateId}/deprecate/`, {
        reason: deprecationReason,
      });
      setShowDeprecateModal(false);
      await loadData();
    } catch (err: any) {
      console.error('Deprecate failed:', err);
      setError(err.response?.data?.error || 'Failed to deprecate template');
    } finally {
      setActionLoading(false);
    }
  };

  const handlePreview = async () => {
    router.push(`/templates/${templateId}/preview`);
  };

  const handleNewVersion = async () => {
    if (!confirm('Create a new version of this template?')) {
      return;
    }

    setActionLoading(true);
    setError(null);

    try {
      const response = await apiClient.post(`/templates/${templateId}/new-version/`);
      router.push(`/templates/${response.data.id}`);
    } catch (err: any) {
      console.error('New version failed:', err);
      setError(err.response?.data?.error || 'Failed to create new version');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      draft: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      deprecated: 'bg-red-100 text-red-800',
    };
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${styles[status as keyof typeof styles]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const canApprove = user && ['admin', 'legal_reviewer'].includes(user.role);
  const canManage = user && ['admin', 'legal_reviewer', 'content_manager'].includes(user.role);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <Image src="/logo-color.png" alt="STAGE" width={120} height={31} className="h-8 w-auto" />
            </div>
          </div>
        </header>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading template...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!template) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <Image src="/logo-color.png" alt="STAGE" width={120} height={31} className="h-8 w-auto" />
            </div>
          </div>
        </header>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Template not found</h3>
            <Link href="/templates" className="text-red-600 hover:text-red-700 font-medium">
              Back to Templates
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Premium Header with Logo */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <Image
                src="/logo-color.png"
                alt="STAGE"
                width={120}
                height={31}
                className="h-8 w-auto"
              />
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
        <div className="mb-6">
          <Link href="/templates" className="text-sm text-red-600 hover:text-red-700 font-medium">
            ← Back to Templates
          </Link>
        </div>

        {error && (
          <div className="rounded-xl bg-red-50 border border-red-200 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <div className="mt-2 text-sm text-red-700">{error}</div>
              </div>
            </div>
          </div>
        )}

        {/* Header Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-6">
          <div className="px-6 py-6">
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-3">
                  <h1 className="text-3xl font-bold text-gray-900">{template.name}</h1>
                  {getStatusBadge(template.status)}
                  <span className="text-sm text-gray-500">Version {template.version_number}</span>
                </div>
                {template.description && (
                  <p className="text-gray-600">{template.description}</p>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3">
              {template.status === 'draft' && canApprove && (
                <button
                  onClick={handleApprove}
                  disabled={actionLoading}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-semibold rounded-xl shadow-sm text-white bg-green-600 hover:bg-green-700 disabled:bg-gray-400 transition-colors"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Approve Template
                </button>
              )}

              {template.status === 'approved' && canApprove && (
                <button
                  onClick={() => setShowDeprecateModal(true)}
                  disabled={actionLoading}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-semibold rounded-xl shadow-sm text-white bg-red-600 hover:bg-red-700 disabled:bg-gray-400 transition-colors"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Deprecate Template
                </button>
              )}

              {canManage && (
                <>
                  <button
                    onClick={handlePreview}
                    className="inline-flex items-center px-4 py-2 border-2 border-gray-300 text-sm font-semibold rounded-xl shadow-sm text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-400 transition-colors"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    Preview
                  </button>

                  <Link
                    href={`/templates/${templateId}/placeholders`}
                    className="inline-flex items-center px-4 py-2 border-2 border-gray-300 text-sm font-semibold rounded-xl shadow-sm text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-400 transition-colors"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit Placeholders
                  </Link>

                  <button
                    onClick={handleNewVersion}
                    disabled={actionLoading}
                    className="inline-flex items-center px-4 py-2 border-2 border-gray-300 text-sm font-semibold rounded-xl shadow-sm text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-400 disabled:bg-gray-100 transition-colors"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    New Version
                  </button>

                  <Link
                    href={`/templates/${templateId}/versions`}
                    className="inline-flex items-center px-4 py-2 border-2 border-gray-300 text-sm font-semibold rounded-xl shadow-sm text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-400 transition-colors"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    Version History
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Details Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-6">
          <div className="px-6 py-6">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Template Information</h3>
            <dl className="grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-2">
              <div>
                <dt className="text-sm font-medium text-gray-500 mb-1">Uploaded By</dt>
                <dd className="text-sm text-gray-900 font-medium">
                  {template.uploaded_by.full_name || template.uploaded_by.email}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500 mb-1">Uploaded At</dt>
                <dd className="text-sm text-gray-900 font-medium">{formatDate(template.uploaded_at)}</dd>
              </div>
              {template.approved_at && (
                <>
                  <div>
                    <dt className="text-sm font-medium text-gray-500 mb-1">Approved By</dt>
                    <dd className="text-sm text-gray-900 font-medium">
                      {template.approved_by?.full_name || template.approved_by?.email || '-'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500 mb-1">Approved At</dt>
                    <dd className="text-sm text-gray-900 font-medium">{formatDate(template.approved_at)}</dd>
                  </div>
                </>
              )}
              {template.deprecated_at && (
                <>
                  <div>
                    <dt className="text-sm font-medium text-gray-500 mb-1">Deprecated At</dt>
                    <dd className="text-sm text-gray-900 font-medium">{formatDate(template.deprecated_at)}</dd>
                  </div>
                  {template.deprecation_reason && (
                    <div className="sm:col-span-2">
                      <dt className="text-sm font-medium text-gray-500 mb-1">Deprecation Reason</dt>
                      <dd className="text-sm text-gray-900">{template.deprecation_reason}</dd>
                    </div>
                  )}
                </>
              )}
            </dl>
          </div>
        </div>

        {/* Placeholders Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="px-6 py-6">
            <h3 className="text-lg font-bold text-gray-900 mb-6">
              Placeholders ({template.placeholders.length})
            </h3>
            {template.placeholders.length === 0 ? (
              <p className="text-sm text-gray-500">No placeholders configured yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Label
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Required
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {template.placeholders.map((placeholder: any) => (
                      <tr key={placeholder.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {placeholder.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {placeholder.label}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {placeholder.field_type}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {placeholder.is_required ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                              Yes
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                              No
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Deprecate Modal */}
        {showDeprecateModal && (
          <div className="fixed z-10 inset-0 overflow-y-auto">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowDeprecateModal(false)}></div>

              <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                <div className="bg-white px-6 pt-6 pb-4">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Deprecate Template</h3>
                  <div>
                    <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-2">
                      Deprecation Reason <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      id="reason"
                      rows={3}
                      value={deprecationReason}
                      onChange={(e) => setDeprecationReason(e.target.value)}
                      className="block w-full border border-gray-300 rounded-xl shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm"
                      placeholder="Explain why this template is being deprecated..."
                    />
                  </div>
                </div>
                <div className="bg-gray-50 px-6 py-4 flex flex-row-reverse gap-3">
                  <button
                    onClick={handleDeprecate}
                    disabled={actionLoading || !deprecationReason.trim()}
                    className="inline-flex justify-center rounded-xl border border-transparent shadow-sm px-4 py-2 bg-red-600 text-sm font-semibold text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:bg-gray-400 transition-colors"
                  >
                    {actionLoading ? 'Deprecating...' : 'Deprecate'}
                  </button>
                  <button
                    onClick={() => setShowDeprecateModal(false)}
                    className="inline-flex justify-center rounded-xl border-2 border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-semibold text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
