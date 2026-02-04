'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import DashboardLayout from '@/components/DashboardLayout';
import apiClient from '@/lib/api';

export default function AgreementPreviewPage() {
  const router = useRouter();
  const params = useParams();
  const agreementId = params.id;

  const [agreement, setAgreement] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [previewing, setPreviewing] = useState(false);
  const [generating, setGenerating] = useState(false);

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

  const handlePreview = async () => {
    setPreviewing(true);

    try {
      const response = await apiClient.post(
        `/agreements/${agreementId}/preview/`,
        {},
        { responseType: 'blob' }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${agreement.template.name}_preview.docx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error: any) {
      console.error('Preview failed:', error);

      // Handle blob error response
      let errorMessage = 'Failed to generate preview';
      if (error.response?.data instanceof Blob) {
        try {
          const text = await error.response.data.text();
          const errorData = JSON.parse(text);
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch {
          errorMessage = 'Failed to generate preview';
        }
      } else {
        const errorData = error.response?.data;
        errorMessage = errorData?.message || errorData?.error || errorMessage;
      }

      alert(`Preview Generation Failed\n\n${errorMessage}`);
    } finally {
      setPreviewing(false);
    }
  };

  const handleGenerate = async () => {
    if (!confirm('Generate final agreement? This will create the official document.')) {
      return;
    }

    setGenerating(true);

    try {
      await apiClient.post(`/agreements/${agreementId}/generate/`);
      router.push(`/agreements/${agreementId}`);
    } catch (error: any) {
      console.error('Generate failed:', error);

      // Show detailed error message with invalid placeholders
      const errorData = error.response?.data;
      const errorMessage = errorData?.message || errorData?.error || 'Failed to generate agreement';

      alert(
        `Agreement Generation Failed\n\n${errorMessage}\n\n` +
        (errorData?.template_name ? `Template: ${errorData.template_name}` : '')
      );
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!agreement) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <span className="text-6xl">⚠️</span>
          <h3 className="mt-2 text-lg font-medium text-gray-900">Agreement not found</h3>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Preview Agreement</h2>
          <p className="mt-1 text-sm text-gray-500">
            Review your data before generating the final agreement
          </p>
        </div>

        {/* Data Summary */}
        <div className="bg-white shadow sm:rounded-lg mb-6">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Agreement Data</h3>
            <dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
              {Object.entries(agreement.placeholder_data).map(([key, value]: [string, any]) => (
                <div key={key}>
                  <dt className="text-sm font-medium text-gray-500 capitalize">
                    {key.replace(/_/g, ' ')}
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {typeof value === 'object' && value.value !== undefined
                      ? value.value?.toString() || '-'
                      : value?.toString() || '-'}
                  </dd>
                </div>
              ))}
            </dl>
            <div className="mt-6 flex justify-end">
              <Link
                href={`/agreements/${agreementId}/form`}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50"
              >
                ✏️ Edit Data
              </Link>
            </div>
          </div>
        </div>

        {/* Preview Actions */}
        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Next Steps</h3>

            <div className="space-y-4">
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <span className="text-3xl">👁️</span>
                  </div>
                  <div className="ml-4 flex-1">
                    <h4 className="text-base font-medium text-gray-900">Download Preview</h4>
                    <p className="mt-1 text-sm text-gray-500">
                      Download a preview DOCX to review the document with your data before final generation
                    </p>
                    <button
                      onClick={handlePreview}
                      disabled={previewing}
                      className={`mt-3 inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm ${
                        previewing
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'text-gray-700 bg-white hover:bg-gray-50'
                      }`}
                    >
                      {previewing ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            />
                          </svg>
                          Generating Preview...
                        </>
                      ) : (
                        'Download Preview'
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <div className="border border-indigo-200 bg-indigo-50 rounded-lg p-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <span className="text-3xl">✅</span>
                  </div>
                  <div className="ml-4 flex-1">
                    <h4 className="text-base font-medium text-gray-900">Generate Final Agreement</h4>
                    <p className="mt-1 text-sm text-gray-600">
                      Once you're satisfied with the preview, generate the final agreement. This will:
                    </p>
                    <ul className="mt-2 text-sm text-gray-600 list-disc list-inside space-y-1">
                      <li>Create the official DOCX document</li>
                      <li>Calculate integrity checksums</li>
                      <li>Store metadata and audit trail</li>
                      <li>Make it available for download</li>
                    </ul>
                    <button
                      onClick={handleGenerate}
                      disabled={generating}
                      className={`mt-3 inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
                        generating
                          ? 'bg-gray-400 cursor-not-allowed'
                          : 'bg-indigo-600 hover:bg-indigo-700'
                      }`}
                    >
                      {generating ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            />
                          </svg>
                          Generating Final Agreement...
                        </>
                      ) : (
                        'Generate Final Agreement'
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-start">
              <Link
                href="/agreements"
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                ← Cancel and return to agreements
              </Link>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
