'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import apiClient from '@/lib/api';

interface PlaceholderIssue {
  original: string;
  inner_text: string;
  is_valid: boolean;
  issues: string[];
  suggested_fix: string | null;
  line_preview: string;
}

interface ScanResult {
  template_id: number;
  template_name: string;
  total_placeholders: number;
  valid_count: number;
  invalid_count: number;
  placeholders: PlaceholderIssue[];
  can_fix_automatically: boolean;
}

export default function FixPlaceholdersPage() {
  const params = useParams();
  const router = useRouter();
  const templateId = params.id;

  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [fixing, setFixing] = useState(false);

  useEffect(() => {
    scanPlaceholders();
  }, [templateId]);

  const scanPlaceholders = async () => {
    try {
      const response = await apiClient.get(`/templates/${templateId}/scan-placeholders/`);
      setScanResult(response.data);
    } catch (error) {
      console.error('Failed to scan placeholders:', error);
      alert('Failed to scan template placeholders');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <Link href="/dashboard">
                <Image src="/logo-color.png" alt="STAGE" width={120} height={31} className="h-8 w-auto cursor-pointer" />
              </Link>
            </div>
          </div>
        </header>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Scanning template placeholders...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!scanResult) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Failed to load scan results</p>
          <button
            onClick={() => router.push('/templates')}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Back to Templates
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/dashboard">
              <Image src="/logo-color.png" alt="STAGE" width={120} height={31} className="h-8 w-auto cursor-pointer" />
            </Link>
            <nav className="hidden md:flex items-center space-x-8">
              <Link href="/dashboard" className="text-sm font-medium text-gray-600 hover:text-gray-900">Home</Link>
              <Link href="/templates" className="text-sm font-medium text-red-600 border-b-2 border-red-600">Templates</Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Page Header */}
        <div className="mb-8">
          <Link href="/templates" className="text-sm text-red-600 hover:text-red-700 mb-2 inline-block">
            ← Back to Templates
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Placeholder Helper</h1>
          <p className="text-lg text-gray-600">Template: {scanResult.template_name}</p>
        </div>

        {/* Summary Card */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">{scanResult.total_placeholders}</div>
              <div className="text-sm text-gray-600 mt-1">Total Placeholders</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">{scanResult.valid_count}</div>
              <div className="text-sm text-gray-600 mt-1">Valid</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600">{scanResult.invalid_count}</div>
              <div className="text-sm text-gray-600 mt-1">Need Fixing</div>
            </div>
          </div>
        </div>

        {/* Results */}
        {scanResult.invalid_count === 0 ? (
          <div className="bg-green-50 border-2 border-green-200 rounded-xl p-8 text-center">
            <div className="text-6xl mb-4">✅</div>
            <h2 className="text-2xl font-bold text-green-900 mb-2">All Placeholders Valid!</h2>
            <p className="text-green-700 mb-6">Your template has correct placeholder syntax.</p>
            <Link
              href={`/templates/${templateId}/placeholders`}
              className="inline-flex items-center px-6 py-3 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700"
            >
              Continue to Configuration →
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900">Placeholders Found ({scanResult.placeholders.length})</h2>
            </div>

            {scanResult.placeholders.map((placeholder, index) => (
              <div
                key={index}
                className={`bg-white rounded-xl border-2 p-6 ${
                  placeholder.is_valid ? 'border-green-200' : 'border-red-200'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <span className={`text-2xl ${placeholder.is_valid ? 'text-green-600' : 'text-red-600'}`}>
                        {placeholder.is_valid ? '✅' : '❌'}
                      </span>
                      <div>
                        <div className="font-mono text-lg font-bold text-gray-900">
                          {placeholder.original}
                        </div>
                        {!placeholder.is_valid && (
                          <div className="text-sm text-red-600 mt-1">
                            Issues: {placeholder.issues.join(', ')}
                          </div>
                        )}
                      </div>
                    </div>

                    {!placeholder.is_valid && placeholder.suggested_fix && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-3">
                        <div className="text-sm font-medium text-green-900 mb-2">✨ Suggested Fix:</div>
                        <div className="font-mono text-lg font-bold text-green-700">
                          {placeholder.suggested_fix}
                        </div>
                        <div className="text-xs text-green-600 mt-2">
                          Copy this corrected placeholder into your DOCX template
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* Instructions */}
            <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 mt-6">
              <h3 className="text-lg font-bold text-blue-900 mb-3">📝 How to Fix Your Template:</h3>
              <ol className="list-decimal list-inside space-y-2 text-blue-800">
                <li>Open your DOCX template file in Microsoft Word</li>
                <li>Find each invalid placeholder shown above (use Ctrl+F/Cmd+F)</li>
                <li>Replace it with the suggested fix</li>
                <li>Save the template</li>
                <li>Upload the corrected template again</li>
              </ol>
              <div className="mt-4">
                <Link
                  href="/templates/upload"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700"
                >
                  Upload Corrected Template
                </Link>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
