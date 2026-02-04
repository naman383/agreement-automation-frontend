'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import apiClient from '@/lib/api';

export default function AgreementDetailsPage() {
  const params = useParams();
  const agreementId = params.id;

  const [agreement, setAgreement] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    loadAgreement();
  }, [agreementId]);

  const loadAgreement = async () => {
    try {
      const response = await apiClient.get(`/agreements/${agreementId}/`);
      setAgreement(response.data);
    } catch (error) {
      console.error('Failed to load agreement:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    setDownloading(true);

    try {
      const response = await apiClient.get(
        `/agreements/${agreementId}/download/`,
        { responseType: 'blob' }
      );

      const filename = agreement.agreement_id
        ? `Agreement_${agreement.agreement_id}.docx`
        : `Agreement_${agreementId}.docx`;

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error: any) {
      console.error('Download failed:', error);
      alert(error.response?.data?.error || 'Failed to download agreement');
    } finally {
      setDownloading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      draft: 'bg-yellow-100 text-yellow-800',
      generated: 'bg-green-100 text-green-800',
      error: 'bg-red-100 text-red-800',
    };
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800'}`}>
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
            <p className="mt-4 text-gray-600">Loading agreement...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!agreement) {
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
            <h3 className="text-lg font-medium text-gray-900 mb-4">Agreement not found</h3>
            <Link href="/agreements" className="text-red-600 hover:text-red-700 font-medium">
              Back to Agreements
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
        <div className="mb-6">
          <Link href="/agreements" className="text-sm text-red-600 hover:text-red-700 font-medium">
            ← Back to Agreements
          </Link>
        </div>

        {/* Header Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-6">
          <div className="px-6 py-6">
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-3">
                  <h1 className="text-3xl font-bold text-gray-900">{agreement.template.name}</h1>
                  {getStatusBadge(agreement.status)}
                </div>
                {agreement.agreement_id && (
                  <p className="text-gray-600">Agreement ID: {agreement.agreement_id}</p>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3">
              {agreement.status === 'generated' && (
                <button
                  onClick={handleDownload}
                  disabled={downloading}
                  className={`inline-flex items-center px-6 py-2 border border-transparent text-sm font-semibold rounded-xl shadow-sm text-white transition-all ${
                    downloading
                      ? 'bg-red-400 cursor-not-allowed'
                      : 'bg-red-600 hover:bg-red-700 hover:shadow-md'
                  }`}
                >
                  {downloading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Downloading...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Download Agreement
                    </>
                  )}
                </button>
              )}

              {agreement.status === 'draft' && (
                <Link
                  href={`/agreements/${agreementId}/form`}
                  className="inline-flex items-center px-6 py-2 border border-transparent text-sm font-semibold rounded-xl shadow-sm text-white bg-red-600 hover:bg-red-700 transition-colors"
                >
                  Continue Editing
                  <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Details Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-6">
          <div className="px-6 py-6">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Agreement Information</h3>
            <dl className="grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-2">
              <div>
                <dt className="text-sm font-medium text-gray-500 mb-1">Template</dt>
                <dd className="text-sm text-gray-900">
                  <Link href={`/templates/${agreement.template.id}`} className="text-red-600 hover:text-red-700 font-medium">
                    {agreement.template.name} (v{agreement.template.version_number})
                  </Link>
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500 mb-1">Created By</dt>
                <dd className="text-sm text-gray-900 font-medium">
                  {agreement.generated_by?.full_name || agreement.generated_by?.email || '-'}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500 mb-1">Created At</dt>
                <dd className="text-sm text-gray-900 font-medium">{formatDate(agreement.created_at)}</dd>
              </div>
              {agreement.generated_at && (
                <div>
                  <dt className="text-sm font-medium text-gray-500 mb-1">Generated At</dt>
                  <dd className="text-sm text-gray-900 font-medium">{formatDate(agreement.generated_at)}</dd>
                </div>
              )}
              {agreement.downloaded_at && (
                <div>
                  <dt className="text-sm font-medium text-gray-500 mb-1">Downloaded At</dt>
                  <dd className="text-sm text-gray-900 font-medium">{formatDate(agreement.downloaded_at)}</dd>
                </div>
              )}
              {agreement.integrity_verified && (
                <div>
                  <dt className="text-sm font-medium text-gray-500 mb-1">Integrity Verified</dt>
                  <dd className="text-sm font-medium">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Verified
                    </span>
                  </dd>
                </div>
              )}
            </dl>
          </div>
        </div>

        {/* Placeholder Data Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="px-6 py-6">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Agreement Data</h3>
            <dl className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
              {Object.entries(agreement.placeholder_data).map(([key, value]: [string, any]) => (
                <div key={key} className="bg-gray-50 rounded-xl p-4">
                  <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                    {key.replace(/_/g, ' ')}
                  </dt>
                  <dd className="text-sm text-gray-900 font-medium">
                    {typeof value === 'object' && value.value !== undefined
                      ? value.value?.toString() || '-'
                      : value?.toString() || '-'}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </main>
    </div>
  );
}
