'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import apiClient from '@/lib/api';

interface Placeholder {
  id?: number;
  field_name: string;
  field_label: string;
  field_type: string;
  is_required: boolean;
  dropdown_options: string[];
  help_text: string;
  regions?: Region[];
}

interface Region {
  id?: number;
  x_percent: number;
  y_percent: number;
  width_percent: number;
  height_percent: number;
  selected_text: string;
}

export default function VisualBuilderPage() {
  const params = useParams();
  const router = useRouter();
  const templateId = params.id;
  const documentRef = useRef<HTMLDivElement>(null);

  const [template, setTemplate] = useState<any>(null);
  const [placeholders, setPlaceholders] = useState<Placeholder[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Selection state
  const [selectedText, setSelectedText] = useState<string>('');
  const [selectionPosition, setSelectionPosition] = useState<{x: number, y: number} | null>(null);
  const [showMarkButton, setShowMarkButton] = useState(false);
  const [storedSelectionData, setStoredSelectionData] = useState<any>(null);

  // Modal state
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [currentSelection, setCurrentSelection] = useState<any>(null);
  const [fieldConfig, setFieldConfig] = useState<Placeholder>({
    field_name: '',
    field_label: '',
    field_type: 'text',
    is_required: true,
    dropdown_options: [],
    help_text: ''
  });

  useEffect(() => {
    loadTemplate();
    loadPlaceholders();
  }, [templateId]);

  const loadTemplate = async () => {
    try {
      const response = await apiClient.get(`/templates/visual/${templateId}/`);
      setTemplate(response.data);
    } catch (error) {
      console.error('Failed to load template:', error);
      alert('❌ Failed to load template');
    } finally {
      setLoading(false);
    }
  };

  const loadPlaceholders = async () => {
    try {
      const response = await apiClient.get(`/templates/visual/${templateId}/placeholders/`);
      setPlaceholders(response.data.placeholders || []);
    } catch (error) {
      console.error('Failed to load placeholders:', error);
    }
  };

  const handleTextSelection = () => {
    const selection = window.getSelection();
    const text = selection?.toString().trim();

    if (text && text.length > 0) {
      // Get selection position for floating button
      const range = selection?.getRangeAt(0);
      const rect = range?.getBoundingClientRect();

      if (rect && documentRef.current) {
        const containerRect = documentRef.current.getBoundingClientRect();

        // Store selection data in format backend expects
        const selectionData = {
          selected_text: text,
          html_xpath: '',  // Optional, for better matching
          visual_coords: {
            x: ((rect.left - containerRect.left) / containerRect.width) * 100,
            y: ((rect.top - containerRect.top) / containerRect.height) * 100,
            width: (rect.width / containerRect.width) * 100,
            height: (rect.height / containerRect.height) * 100,
            page: 1  // Single page for now
          }
        };

        setSelectedText(text);
        setStoredSelectionData(selectionData);
        setSelectionPosition({
          x: rect.left - containerRect.left + (rect.width / 2),
          y: rect.top - containerRect.top - 50 // 50px above selection
        });
        setShowMarkButton(true);

        console.log('Text selected:', text, selectionData);
      }
    } else {
      setShowMarkButton(false);
    }
  };

  const generateFieldName = (text: string): string => {
    // Convert text to field name format (lowercase, underscores)
    let base = text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '_')
      .substring(0, 30);

    // Check if this name already exists
    let fieldName = base;
    let counter = 1;
    while (placeholders.some(p => p.field_name === fieldName)) {
      fieldName = `${base}_${counter}`;
      counter++;
    }

    return fieldName;
  };

  const handleMarkAsPlaceholder = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    console.log('Mark button clicked!', storedSelectionData);

    if (!storedSelectionData) {
      alert('❌ No text selected');
      return;
    }

    // Auto-generate field name from selected text
    const autoFieldName = generateFieldName(selectedText);
    const autoFieldLabel = selectedText.length > 50
      ? selectedText.substring(0, 50) + '...'
      : selectedText;

    setFieldConfig({
      field_name: autoFieldName,
      field_label: autoFieldLabel,
      field_type: 'text',
      is_required: true,
      dropdown_options: [],
      help_text: ''
    });

    setCurrentSelection(storedSelectionData);
    setShowConfigModal(true);
    setShowMarkButton(false);

    // Clear selection
    window.getSelection()?.removeAllRanges();
  };

  const handleSavePlaceholder = async () => {
    if (!fieldConfig.field_name || !fieldConfig.field_label) {
      alert('❌ Please fill required fields');
      return;
    }

    setSaving(true);

    try {
      await apiClient.post(`/templates/visual/${templateId}/placeholders/`, {
        field_config: {
          field_name: fieldConfig.field_name,
          field_label: fieldConfig.field_label,
          field_type: fieldConfig.field_type,
          is_required: fieldConfig.is_required,
          dropdown_options: fieldConfig.dropdown_options,
          help_text: fieldConfig.help_text,
          position_index: placeholders.length
        },
        selection_data: {
          ...currentSelection,
          page: 1
        }
      });

      // Reload placeholders
      await loadPlaceholders();

      // Reset
      setShowConfigModal(false);
      setCurrentSelection(null);
      setFieldConfig({
        field_name: '',
        field_label: '',
        field_type: 'text',
        is_required: true,
        dropdown_options: [],
        help_text: ''
      });

      alert('✅ Placeholder created successfully!');

    } catch (error: any) {
      console.error('Failed to create placeholder:', error);
      const errorMsg = error.response?.data?.error || error.message;
      alert(`❌ ${errorMsg}`);

      // Don't close modal on error - let user fix the field name
      setSaving(false);
      return;
    }

    setSaving(false);
  };

  const handleActivateTemplate = async () => {
    if (placeholders.length === 0) {
      alert('❌ Please add at least one placeholder');
      return;
    }

    if (!confirm('Activate this template? It will become available for creating agreements.')) {
      return;
    }

    try {
      await apiClient.put(`/templates/visual/${templateId}/`, {
        status: 'active'
      });

      alert('✅ Template activated successfully!');
      router.push('/templates');

    } catch (error) {
      console.error('Failed to activate:', error);
      alert('❌ Failed to activate template');
    }
  };

  const deletePlaceholder = async (placeholderId: number) => {
    if (!confirm('Delete this placeholder?')) return;

    try {
      await apiClient.delete(`/templates/visual/${templateId}/placeholders/${placeholderId}/`);
      await loadPlaceholders();
      alert('✅ Placeholder deleted');
    } catch (error) {
      console.error('Delete failed:', error);
      alert('❌ Delete failed');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading template...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="max-w-full px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard">
                <Image src="/logo-color.png" alt="STAGE" width={120} height={31} className="h-8 w-auto cursor-pointer" />
              </Link>
              <div className="text-sm text-gray-700 font-medium">
                {template?.name}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/templates"
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
              >
                Cancel
              </Link>
              <button
                onClick={handleActivateTemplate}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
              >
                Activate Template ({placeholders.length} fields)
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex h-[calc(100vh-4rem)]">
        {/* Left: Document Viewer */}
        <div className="flex-1 bg-white border-r border-gray-200 overflow-auto">
          <div className="p-8">
            <div className="max-w-4xl mx-auto">
              {/* Instructions */}
              <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 mb-6">
                <h3 className="font-bold text-blue-900 mb-2">📍 How to Mark Placeholders</h3>
                <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                  <li><strong>Select text</strong> in the document below (like copy-paste)</li>
                  <li>Click <strong>"Mark as Placeholder"</strong> button that appears</li>
                  <li>Configure the field type and settings</li>
                  <li>Repeat for all fields you need</li>
                  <li>Click "Activate Template" when done</li>
                </ol>
              </div>

              {/* Document with Text Selection */}
              <div
                ref={documentRef}
                className="relative border-2 border-gray-300 rounded-xl shadow-lg bg-white p-12 min-h-[800px]"
                onMouseUp={handleTextSelection}
                style={{ userSelect: 'text', cursor: 'text' }}
              >
                {/* Rendered HTML */}
                <div
                  className="prose prose-sm max-w-none"
                  style={{ color: '#111827' }}
                  dangerouslySetInnerHTML={{ __html: template?.html_preview || '' }}
                />

                {/* Existing Placeholder Regions */}
                {placeholders.map((placeholder, idx) =>
                  placeholder.regions?.map((region, ridx) => (
                    <div
                      key={`${idx}-${ridx}`}
                      className="absolute border-2 border-green-500 bg-green-100 bg-opacity-30 pointer-events-none"
                      style={{
                        left: `${region.x_percent}%`,
                        top: `${region.y_percent}%`,
                        width: `${region.width_percent}%`,
                        height: `${region.height_percent}%`,
                      }}
                    >
                      <div className="absolute -top-6 left-0 bg-green-600 text-white text-xs px-2 py-1 rounded">
                        {placeholder.field_label}
                      </div>
                    </div>
                  ))
                )}

                {/* Floating "Mark as Placeholder" Button */}
                {showMarkButton && selectionPosition && (
                  <div
                    className="absolute z-50"
                    style={{
                      left: selectionPosition.x,
                      top: selectionPosition.y,
                      transform: 'translateX(-50%)',
                    }}
                    onMouseDown={(e) => e.stopPropagation()}
                  >
                    <button
                      onMouseDown={handleMarkAsPlaceholder}
                      className="bg-red-600 text-white px-4 py-2 rounded-lg shadow-xl hover:bg-red-700 transition-all flex items-center space-x-2 font-medium text-sm whitespace-nowrap border-2 border-white"
                    >
                      <span>📍</span>
                      <span>Mark as Placeholder</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Placeholders List */}
        <div className="w-96 bg-gray-50 border-l border-gray-200 p-6 overflow-auto">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Placeholders ({placeholders.length})
          </h2>

          {placeholders.length === 0 ? (
            <div className="bg-white rounded-lg border-2 border-gray-200 p-6 text-center">
              <div className="text-4xl mb-3">👈</div>
              <p className="text-sm text-gray-700 font-medium mb-2">
                Select text in the document
              </p>
              <p className="text-xs text-gray-600">
                Highlight any text (like copy-paste) to mark it as a placeholder field
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {placeholders.map((placeholder, idx) => (
                <div key={idx} className="bg-white rounded-lg border-2 border-gray-200 p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900">{placeholder.field_label}</h3>
                      <p className="text-xs text-gray-600 font-mono">{placeholder.field_name}</p>
                    </div>
                    <button
                      onClick={() => deletePlaceholder(placeholder.id!)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                  <div className="flex items-center space-x-2 text-xs">
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded font-medium uppercase">
                      {placeholder.field_type}
                    </span>
                    {placeholder.is_required && (
                      <span className="bg-red-100 text-red-800 px-2 py-1 rounded font-medium">
                        Required
                      </span>
                    )}
                  </div>
                  {placeholder.help_text && (
                    <p className="text-xs text-gray-600 mt-2">{placeholder.help_text}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Configuration Modal */}
      {showConfigModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-red-600 to-orange-600 text-white p-6 rounded-t-2xl">
              <h2 className="text-2xl font-bold">Configure Field</h2>
              <p className="text-red-100 mt-1">Define how this field should work</p>
              {currentSelection?.selected_text && (
                <div className="mt-3 bg-white bg-opacity-20 rounded-lg p-3">
                  <p className="text-xs text-red-100 mb-1">Selected Text:</p>
                  <p className="text-sm font-medium text-white">"{currentSelection.selected_text}"</p>
                </div>
              )}
            </div>

            <div className="p-6 space-y-6">
              {/* Field Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Field Name (Internal) *
                </label>
                <input
                  type="text"
                  value={fieldConfig.field_name}
                  onChange={(e) => setFieldConfig({ ...fieldConfig, field_name: e.target.value.toLowerCase().replace(/\s+/g, '_') })}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-red-500 focus:outline-none font-mono text-gray-900"
                  placeholder="party_a_name"
                />
                <p className="text-xs text-gray-500 mt-1">Lowercase, use underscores</p>
              </div>

              {/* Field Label */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Field Label (Display) *
                </label>
                <input
                  type="text"
                  value={fieldConfig.field_label}
                  onChange={(e) => setFieldConfig({ ...fieldConfig, field_label: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-red-500 focus:outline-none text-gray-900"
                  placeholder="Party A Name"
                />
              </div>

              {/* Field Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Field Type *
                </label>
                <select
                  value={fieldConfig.field_type}
                  onChange={(e) => setFieldConfig({ ...fieldConfig, field_type: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-red-500 focus:outline-none text-gray-900"
                >
                  <option value="text">Text</option>
                  <option value="textarea">Long Text</option>
                  <option value="number">Number</option>
                  <option value="date">Date</option>
                  <option value="email">Email</option>
                  <option value="phone">Phone</option>
                  <option value="currency">Currency</option>
                  <option value="pan_number">PAN Number</option>
                  <option value="gst_number">GST Number</option>
                  <option value="dropdown">Dropdown</option>
                </select>
              </div>

              {/* Dropdown Options */}
              {fieldConfig.field_type === 'dropdown' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dropdown Options (comma-separated)
                  </label>
                  <textarea
                    value={fieldConfig.dropdown_options.join(', ')}
                    onChange={(e) => setFieldConfig({
                      ...fieldConfig,
                      dropdown_options: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                    })}
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-red-500 focus:outline-none text-gray-900"
                    rows={3}
                    placeholder="Option 1, Option 2, Option 3"
                  />
                </div>
              )}

              {/* Help Text */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Help Text (Optional)
                </label>
                <input
                  type="text"
                  value={fieldConfig.help_text}
                  onChange={(e) => setFieldConfig({ ...fieldConfig, help_text: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-red-500 focus:outline-none text-gray-900"
                  placeholder="Additional guidance for users"
                />
              </div>

              {/* Required Toggle */}
              <div className="flex items-center justify-between bg-gray-50 rounded-lg p-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Required Field
                  </label>
                  <p className="text-xs text-gray-500">User must fill this field</p>
                </div>
                <button
                  onClick={() => setFieldConfig({ ...fieldConfig, is_required: !fieldConfig.is_required })}
                  className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                    fieldConfig.is_required ? 'bg-red-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                      fieldConfig.is_required ? 'translate-x-7' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>

            <div className="bg-gray-50 px-6 py-4 rounded-b-2xl flex items-center justify-between">
              <button
                onClick={() => {
                  setShowConfigModal(false);
                  setFieldConfig({
                    field_name: '',
                    field_label: '',
                    field_type: 'text',
                    is_required: true,
                    dropdown_options: [],
                    help_text: ''
                  });
                }}
                className="px-6 py-2 text-gray-700 hover:bg-gray-200 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleSavePlaceholder}
                disabled={saving || !fieldConfig.field_name || !fieldConfig.field_label}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Placeholder'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
