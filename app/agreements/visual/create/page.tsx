'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import apiClient from '@/lib/api';

// Force dynamic rendering - don't try to statically generate this page
export const dynamic = 'force-dynamic';

interface Field {
  field_name: string;
  field_label: string;
  field_type: string;
  is_required: boolean;
  dropdown_options: string[];
  help_text: string;
}

function VisualAgreementCreatePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const templateId = searchParams.get('template');

  const [templates, setTemplates] = useState<any[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [agreementId, setAgreementId] = useState<number | null>(null);
  const [fields, setFields] = useState<Field[]>([]);
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});
  const [previewHtml, setPreviewHtml] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    loadTemplates();
  }, []);

  useEffect(() => {
    if (templateId) {
      createAgreement(templateId);
    }
  }, [templateId]);

  useEffect(() => {
    if (selectedTemplate) {
      updatePreview();
    }
  }, [fieldValues, selectedTemplate]);

  const loadTemplates = async () => {
    try {
      const response = await apiClient.get('/templates/visual/');
      const allTemplates = response.data.templates || [];

      // Show both active and draft templates (but mark draft ones clearly)
      setTemplates(allTemplates);

      console.log('Loaded visual templates:', allTemplates);
    } catch (error) {
      console.error('Failed to load templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const createAgreement = async (templateId: string) => {
    setLoading(true);
    try {
      const response = await apiClient.post('/templates/visual/agreements/create/', {
        template_id: parseInt(templateId)
      });

      setAgreementId(response.data.agreement_id);
      setFields(response.data.placeholders);
      setSelectedTemplate({
        id: parseInt(templateId),
        name: response.data.template_name
      });

      // Load template HTML for preview
      const templateResponse = await apiClient.get(`/templates/visual/${templateId}/`);
      setPreviewHtml(templateResponse.data.html_preview);

    } catch (error: any) {
      console.error('Failed to create agreement:', error);
      alert(`❌ ${error.response?.data?.error || 'Failed to create agreement'}`);
    } finally {
      setLoading(false);
    }
  };

  const updatePreview = () => {
    if (!previewHtml) return;

    let updated = previewHtml;

    // Replace placeholders with values
    fields.forEach(field => {
      const value = fieldValues[field.field_name] || `[${field.field_label}]`;
      const formatted = formatValue(value, field.field_type);

      // Simple replacement (in real implementation, use region coordinates)
      const placeholder = `{{${field.field_name}}}`;
      updated = updated.replace(new RegExp(placeholder, 'g'),
        `<span style="background-color: #fef3c7; font-weight: bold; padding: 2px 4px; border-radius: 3px;">${formatted}</span>`
      );
    });

    setPreviewHtml(updated);
  };

  const formatValue = (value: string, fieldType: string): string => {
    if (!value) return '';

    switch (fieldType) {
      case 'currency':
        const num = parseFloat(value.replace(/,/g, ''));
        return isNaN(num) ? value : `₹${num.toLocaleString('en-IN')}`;

      case 'date':
        try {
          const date = new Date(value);
          return date.toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
          });
        } catch {
          return value;
        }

      case 'phone':
        const clean = value.replace(/\D/g, '');
        if (clean.length === 10) {
          return `+91 ${clean.slice(0, 5)} ${clean.slice(5)}`;
        }
        return value;

      case 'pan_number':
      case 'gst_number':
        return value.toUpperCase();

      default:
        return value;
    }
  };

  const handleFieldChange = async (fieldName: string, value: string) => {
    const newValues = { ...fieldValues, [fieldName]: value };
    setFieldValues(newValues);

    // Auto-save to backend
    if (agreementId) {
      try {
        await apiClient.put(`/templates/visual/agreements/${agreementId}/`, {
          field_values: newValues
        });
      } catch (error) {
        console.error('Auto-save failed:', error);
      }
    }
  };

  const handleGenerate = async () => {
    // Validate required fields
    const missingFields = fields
      .filter(f => f.is_required && !fieldValues[f.field_name])
      .map(f => f.field_label);

    if (missingFields.length > 0) {
      alert(`❌ Please fill required fields:\n${missingFields.join('\n')}`);
      return;
    }

    setGenerating(true);

    try {
      const response = await apiClient.post(`/templates/visual/agreements/${agreementId}/generate/`);

      console.log('Generate response:', response.data);

      // Get download URL and make it absolute
      let downloadUrl = response.data.download_url;

      // If URL is relative, make it absolute
      if (downloadUrl && !downloadUrl.startsWith('http')) {
        downloadUrl = `http://localhost:8000${downloadUrl}`;
      }

      console.log('Download URL:', downloadUrl);

      // Download file by creating a temporary link
      if (downloadUrl) {
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = `agreement_${agreementId}.docx`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }

      alert('✅ Agreement generated successfully! Download should start automatically.');

      // Wait a bit before redirecting so download can start
      setTimeout(() => {
        router.push('/agreements');
      }, 1000);

    } catch (error: any) {
      console.error('Generate failed:', error);
      alert(`❌ ${error.response?.data?.error || 'Generation failed'}`);
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Template selection screen
  if (!selectedTemplate) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-4">
                <Link href="/dashboard">
                  <Image src="/logo-color.png" alt="STAGE" width={120} height={31} className="h-8 w-auto cursor-pointer" />
                </Link>
                <div className="text-sm text-gray-500">Select Template</div>
              </div>
              <Link href="/agreements" className="text-sm text-gray-600 hover:text-gray-900">
                ← Back
              </Link>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 py-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            Choose Agreement Template
          </h1>

          {templates.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600">No active templates available</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {templates.map(template => (
                <div
                  key={template.id}
                  onClick={() => {
                    if (template.status === 'draft') {
                      if (confirm('⚠️ This template is still in draft mode. You need to activate it first.\n\nGo to Templates page to activate it?')) {
                        router.push(`/templates/visual/builder/${template.id}`);
                      }
                      return;
                    }
                    router.push(`/agreements/visual/create?template=${template.id}`);
                  }}
                  className={`bg-white rounded-xl border-2 p-6 cursor-pointer transition-all hover:shadow-lg ${
                    template.status === 'active'
                      ? 'border-gray-200 hover:border-red-500'
                      : 'border-yellow-300 bg-yellow-50'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-bold text-lg text-gray-900">{template.name}</h3>
                    {template.status === 'draft' && (
                      <span className="px-2 py-1 bg-yellow-500 text-white text-xs rounded font-medium">
                        Draft
                      </span>
                    )}
                    {template.status === 'active' && (
                      <span className="px-2 py-1 bg-green-500 text-white text-xs rounded font-medium">
                        ✓ Ready
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-4">{template.category}</p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{template.placeholder_count || 0} fields</span>
                    <span>{template.page_count || 1} pages</span>
                  </div>
                  {template.status === 'draft' && (
                    <div className="mt-3 pt-3 border-t border-yellow-300">
                      <p className="text-xs text-yellow-800">
                        ⚠️ Needs activation before use
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Agreement form screen
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-full px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard">
                <Image src="/logo-color.png" alt="STAGE" width={120} height={31} className="h-8 w-auto cursor-pointer" />
              </Link>
              <div className="text-sm text-gray-700 font-medium">{selectedTemplate.name}</div>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/agreements" className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900">
                Cancel
              </Link>
              <button
                onClick={handleGenerate}
                disabled={generating}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 font-medium"
              >
                {generating ? 'Generating...' : 'Generate Agreement'}
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-4rem)]">
        {/* Left: Live Preview */}
        <div className="flex-1 bg-white border-r border-gray-200 overflow-auto">
          <div className="p-8">
            <div className="max-w-4xl mx-auto">
              <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 mb-6">
                <p className="text-sm text-blue-800">
                  👁️ <strong>Live Preview:</strong> Fill the form on the right and watch the agreement update in real-time
                </p>
              </div>

              <div
                className="prose prose-sm max-w-none bg-white shadow-xl border border-gray-300 rounded-lg p-12 min-h-[800px]"
                style={{ fontFamily: 'Georgia, serif', lineHeight: '1.8', color: '#111827' }}
                dangerouslySetInnerHTML={{ __html: previewHtml }}
              />
            </div>
          </div>
        </div>

        {/* Right: Form Fields */}
        <div className="w-[480px] bg-gray-50 border-l border-gray-200 p-6 overflow-auto">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            Fill Agreement Details
          </h2>

          <div className="space-y-6">
            {fields.map((field, idx) => (
              <div key={idx} className="bg-white rounded-lg border-2 border-gray-200 p-4">
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  {field.field_label}
                  {field.is_required && <span className="text-red-600 ml-1">*</span>}
                </label>

                {field.field_type === 'textarea' ? (
                  <textarea
                    value={fieldValues[field.field_name] || ''}
                    onChange={(e) => handleFieldChange(field.field_name, e.target.value)}
                    rows={4}
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-red-500 focus:outline-none text-gray-900"
                    placeholder={field.help_text || `Enter ${field.field_label.toLowerCase()}`}
                  />
                ) : field.field_type === 'dropdown' ? (
                  <select
                    value={fieldValues[field.field_name] || ''}
                    onChange={(e) => handleFieldChange(field.field_name, e.target.value)}
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-red-500 focus:outline-none text-gray-900"
                  >
                    <option value="">Select...</option>
                    {field.dropdown_options.map((option, oidx) => (
                      <option key={oidx} value={option}>{option}</option>
                    ))}
                  </select>
                ) : field.field_type === 'date' ? (
                  <input
                    type="date"
                    value={fieldValues[field.field_name] || ''}
                    onChange={(e) => handleFieldChange(field.field_name, e.target.value)}
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-red-500 focus:outline-none text-gray-900"
                  />
                ) : (
                  <input
                    type={field.field_type === 'email' ? 'email' : field.field_type === 'number' ? 'number' : 'text'}
                    value={fieldValues[field.field_name] || ''}
                    onChange={(e) => handleFieldChange(field.field_name, e.target.value)}
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-red-500 focus:outline-none text-gray-900"
                    placeholder={field.help_text || `Enter ${field.field_label.toLowerCase()}`}
                  />
                )}

                {field.help_text && (
                  <p className="text-xs text-gray-500 mt-1">{field.help_text}</p>
                )}
              </div>
            ))}
          </div>

          {/* Progress Indicator */}
          <div className="mt-8 bg-white rounded-lg border-2 border-gray-200 p-4">
            <h3 className="font-bold text-gray-900 mb-3">Progress</h3>
            <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
              <div
                className="bg-red-600 h-3 rounded-full transition-all duration-300"
                style={{
                  width: `${(Object.keys(fieldValues).length / fields.length) * 100}%`
                }}
              />
            </div>
            <p className="text-xs text-gray-600">
              {Object.keys(fieldValues).length} of {fields.length} fields filled
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function VisualAgreementCreatePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <VisualAgreementCreatePageContent />
    </Suspense>
  );
}
