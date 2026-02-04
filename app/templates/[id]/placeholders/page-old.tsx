'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import DashboardLayout from '@/components/DashboardLayout';
import apiClient from '@/lib/api';

interface Placeholder {
  id: number;
  name: string;
  label: string;
  field_type: string;
  validation_regex: string;
  is_required: boolean;
  dropdown_options: string[];
  order: number;
}

export default function TemplatePlaceholdersPage() {
  const router = useRouter();
  const params = useParams();
  const templateId = params.id;

  const [placeholders, setPlaceholders] = useState<Placeholder[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [templateName, setTemplateName] = useState('');

  useEffect(() => {
    loadTemplate();
  }, [templateId]);

  const loadTemplate = async () => {
    try {
      const response = await apiClient.get(`/templates/${templateId}/`);
      setTemplateName(response.data.name);

      // Load existing placeholders if any
      if (response.data.placeholders && response.data.placeholders.length > 0) {
        setPlaceholders(response.data.placeholders);
      }
    } catch (error) {
      console.error('Failed to load template:', error);
      setError('Failed to load template');
    } finally {
      setLoading(false);
    }
  };

  const updatePlaceholder = (index: number, field: string, value: any) => {
    const updated = [...placeholders];
    updated[index] = { ...updated[index], [field]: value };
    setPlaceholders(updated);
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);

    try {
      await apiClient.post(`/templates/${templateId}/placeholders/`, {
        placeholders: placeholders,
      });

      // Redirect to template details page
      router.push(`/templates/${templateId}`);
    } catch (err: any) {
      console.error('Save failed:', err);
      setError(err.response?.data?.error || 'Failed to save placeholders');
    } finally {
      setSaving(false);
    }
  };

  const fieldTypes = [
    { value: 'text', label: 'Text' },
    { value: 'number', label: 'Number' },
    { value: 'date', label: 'Date' },
    { value: 'currency', label: 'Currency' },
    { value: 'pan', label: 'PAN Number' },
    { value: 'gst', label: 'GST Number' },
    { value: 'dropdown', label: 'Dropdown' },
    { value: 'checkbox', label: 'Checkbox' },
  ];

  if (loading) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading placeholders...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <div className="flex items-center text-sm text-gray-500 mb-2">
            <Link href="/templates" className="hover:text-gray-700">Templates</Link>
            <span className="mx-2">/</span>
            <Link href={`/templates/${templateId}`} className="hover:text-gray-700">{templateName}</Link>
            <span className="mx-2">/</span>
            <span className="text-gray-900">Configure Placeholders</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Configure Placeholders</h2>
          <p className="mt-1 text-sm text-gray-500">
            Configure labels, types, and validation for each placeholder detected in your template
          </p>
        </div>

        {error && (
          <div className="rounded-md bg-red-50 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <span className="text-red-400">⚠️</span>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <div className="mt-2 text-sm text-red-700">{error}</div>
              </div>
            </div>
          </div>
        )}

        {placeholders.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <span className="text-6xl">📝</span>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No placeholders detected</h3>
            <p className="mt-1 text-sm text-gray-500">
              Make sure your DOCX template contains placeholders in the format {'{{placeholder_name}}'}
            </p>
            <div className="mt-6">
              <Link
                href={`/templates/${templateId}`}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Back to Template
              </Link>
            </div>
          </div>
        ) : (
          <div className="bg-white shadow sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="space-y-6">
                {placeholders.map((placeholder, index) => (
                  <div key={placeholder.id || index} className="border border-gray-200 rounded-lg p-4">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Placeholder Name
                        </label>
                        <input
                          type="text"
                          disabled
                          value={placeholder.name}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 bg-gray-50 text-gray-500 sm:text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Display Label <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={placeholder.label}
                          onChange={(e) => updatePlaceholder(index, 'label', e.target.value)}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                          placeholder="e.g., Creator Name"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Field Type
                        </label>
                        <select
                          value={placeholder.field_type}
                          onChange={(e) => updatePlaceholder(index, 'field_type', e.target.value)}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        >
                          {fieldTypes.map((type) => (
                            <option key={type.value} value={type.value}>
                              {type.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="flex items-center mt-6">
                          <input
                            type="checkbox"
                            checked={placeholder.is_required}
                            onChange={(e) => updatePlaceholder(index, 'is_required', e.target.checked)}
                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                          />
                          <span className="ml-2 text-sm text-gray-700">Required field</span>
                        </label>
                      </div>

                      {placeholder.field_type === 'dropdown' && (
                        <div className="sm:col-span-2">
                          <label className="block text-sm font-medium text-gray-700">
                            Dropdown Options (comma-separated)
                          </label>
                          <input
                            type="text"
                            value={placeholder.dropdown_options?.join(', ') || ''}
                            onChange={(e) =>
                              updatePlaceholder(
                                index,
                                'dropdown_options',
                                e.target.value.split(',').map((s) => s.trim()).filter((s) => s)
                              )
                            }
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            placeholder="Option 1, Option 2, Option 3"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <Link
                  href={`/templates/${templateId}`}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Cancel
                </Link>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className={`inline-flex justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                    saving
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
                  }`}
                >
                  {saving ? 'Saving...' : 'Save Placeholders'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
