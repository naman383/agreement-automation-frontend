'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import DashboardLayout from '@/components/DashboardLayout';
import apiClient from '@/lib/api';

interface TemplateVersion {
  id: number;
  version_number: number;
  status: string;
  uploaded_at: string;
  approved_at: string | null;
  deprecated_at: string | null;
  uploaded_by: {
    email: string;
    full_name: string;
  };
}

export default function TemplateVersionsPage() {
  const params = useParams();
  const templateId = params.id;

  const [versions, setVersions] = useState<TemplateVersion[]>([]);
  const [loading, setLoading] = useState(true);
  const [templateName, setTemplateName] = useState('');

  useEffect(() => {
    loadVersions();
  }, [templateId]);

  const loadVersions = async () => {
    try {
      const [templateRes, versionsRes] = await Promise.all([
        apiClient.get(`/templates/${templateId}/`),
        apiClient.get(`/templates/${templateId}/versions/`),
      ]);
      setTemplateName(templateRes.data.name);
      setVersions(versionsRes.data);
    } catch (error) {
      console.error('Failed to load versions:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      draft: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      deprecated: 'bg-red-100 text-red-800',
    };
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status as keyof typeof styles]}`}>
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

  return (
    <DashboardLayout>
      <div>
        <div className="mb-6">
          <Link href={`/templates/${templateId}`} className="text-sm text-indigo-600 hover:text-indigo-500">
            ← Back to Template
          </Link>
        </div>

        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Version History</h2>
          <p className="mt-1 text-sm text-gray-500">
            {templateName} - All versions
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading versions...</p>
          </div>
        ) : versions.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <span className="text-6xl">📚</span>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No versions found</h3>
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {versions.map((version) => (
                <li key={version.id}>
                  <Link href={`/templates/${version.id}`} className="block hover:bg-gray-50 transition">
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <p className="text-lg font-medium text-indigo-600">
                            Version {version.version_number}
                          </p>
                          {getStatusBadge(version.status)}
                          {parseInt(templateId as string) === version.id && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              Current
                            </span>
                          )}
                        </div>
                        <div className="ml-2 flex-shrink-0 flex">
                          <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                      <div className="mt-2 sm:flex sm:justify-between">
                        <div className="sm:flex sm:space-x-4">
                          <p className="flex items-center text-sm text-gray-500">
                            <span className="mr-1">👤</span>
                            {version.uploaded_by.full_name || version.uploaded_by.email}
                          </p>
                          <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                            <span className="mr-1">📅</span>
                            Uploaded {formatDate(version.uploaded_at)}
                          </p>
                          {version.approved_at && (
                            <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                              <span className="mr-1">✅</span>
                              Approved {formatDate(version.approved_at)}
                            </p>
                          )}
                          {version.deprecated_at && (
                            <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                              <span className="mr-1">⚠️</span>
                              Deprecated {formatDate(version.deprecated_at)}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
