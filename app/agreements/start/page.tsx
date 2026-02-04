'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import apiClient from '@/lib/api';

interface Template {
  id: number;
  name: string;
  description: string;
  version_number: number;
  usage_count: number;
  recently_used: boolean;
}

export default function AgreementStartPage() {
  const router = useRouter();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<number | null>(null);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      const response = await apiClient.get('/agreements/templates/');
      setTemplates(Array.isArray(response.data) ? response.data : response.data.templates || []);
    } catch (error) {
      console.error('Failed to load templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartAgreement = async (templateId: number) => {
    setStarting(true);
    setSelectedTemplateId(templateId);

    try {
      const response = await apiClient.post('/agreements/start/', {
        template_id: templateId,
      });

      console.log('[Start Agreement] Response:', response.data);
      console.log('[Start Agreement] agreement_id:', response.data.agreement_id);

      if (!response.data.agreement_id) {
        console.error('[Start Agreement] No agreement_id in response!', response.data);
        alert('Failed to get agreement ID from server. Please try again.');
        return;
      }

      router.push(`/agreements/${response.data.agreement_id}/form`);
    } catch (error) {
      console.error('Failed to start agreement:', error);
      alert('Failed to start agreement generation. Please try again.');
    } finally {
      setStarting(false);
      setSelectedTemplateId(null);
    }
  };

  const recentlyUsed = templates.filter((t) => t.recently_used);
  const otherTemplates = templates.filter((t) => !t.recently_used);

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
        {/* Page Header */}
        <div className="mb-12">
          <Link href="/agreements" className="text-sm text-red-600 hover:text-red-700 mb-4 inline-block">
            ← Back to Agreements
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Start New Agreement
          </h1>
          <p className="text-lg text-gray-600">
            Select a template to begin generating your agreement
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading templates...</p>
          </div>
        ) : templates.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl shadow-sm border border-gray-100">
            <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">No templates available</h3>
            <p className="text-sm text-gray-500 mb-6">
              There are no approved templates to generate agreements from.
            </p>
            <Link
              href="/templates"
              className="inline-flex items-center px-4 py-2 bg-red-600 text-white font-medium rounded-xl hover:bg-red-700 transition-colors"
            >
              Browse Templates
            </Link>
          </div>
        ) : (
          <div className="space-y-12">
            {/* Recently Used Templates */}
            {recentlyUsed.length > 0 && (
              <div>
                <div className="flex items-center mb-6">
                  <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center mr-3">
                    <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Recently Used</h2>
                </div>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {recentlyUsed.map((template) => (
                    <div
                      key={template.id}
                      className="group bg-gradient-to-br from-red-50 to-red-100/50 border-2 border-red-200 rounded-2xl p-6 shadow-sm hover:shadow-lg hover:border-red-300 transition-all cursor-pointer"
                      onClick={() => !starting && handleStartAgreement(template.id)}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 rounded-xl bg-red-600 flex items-center justify-center">
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-600 text-white">
                            Popular
                          </span>
                        </div>
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 mb-2">
                        {template.name}
                      </h3>
                      <p className="text-xs text-gray-600 mb-1">Version {template.version_number}</p>
                      {template.description && (
                        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                          {template.description}
                        </p>
                      )}
                      <div className="flex items-center justify-between pt-4 border-t border-red-200">
                        <span className="text-xs text-gray-600">
                          {template.usage_count} uses
                        </span>
                        <button
                          disabled={starting && selectedTemplateId === template.id}
                          className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-semibold rounded-xl transition-all ${
                            starting && selectedTemplateId === template.id
                              ? 'bg-gray-400 text-white cursor-not-allowed'
                              : 'bg-red-600 text-white hover:bg-red-700 group-hover:shadow-md'
                          }`}
                        >
                          {starting && selectedTemplateId === template.id ? (
                            <>
                              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path
                                  className="opacity-75"
                                  fill="currentColor"
                                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                />
                              </svg>
                              Starting...
                            </>
                          ) : (
                            <>
                              Start Agreement
                              <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* All Templates */}
            <div>
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center mr-3">
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900">All Templates</h2>
              </div>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {otherTemplates.map((template) => (
                  <div
                    key={template.id}
                    className="group bg-white border-2 border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-lg hover:border-red-600 transition-all cursor-pointer"
                    onClick={() => !starting && handleStartAgreement(template.id)}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 rounded-xl bg-gray-100 group-hover:bg-red-50 flex items-center justify-center transition-colors">
                        <svg className="w-6 h-6 text-gray-600 group-hover:text-red-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <span className="text-xs text-gray-500">
                        {template.usage_count} uses
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                      {template.name}
                    </h3>
                    <p className="text-xs text-gray-500 mb-1">Version {template.version_number}</p>
                    {template.description && (
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                        {template.description}
                      </p>
                    )}
                    <button
                      disabled={starting && selectedTemplateId === template.id}
                      className={`w-full inline-flex justify-center items-center px-4 py-2 border-2 text-sm font-semibold rounded-xl transition-all ${
                        starting && selectedTemplateId === template.id
                          ? 'border-gray-300 bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'border-gray-300 text-gray-700 hover:border-red-600 hover:text-red-600 hover:bg-red-50'
                      }`}
                    >
                      {starting && selectedTemplateId === template.id ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            />
                          </svg>
                          Starting...
                        </>
                      ) : (
                        <>
                          Start Agreement
                          <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </>
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
