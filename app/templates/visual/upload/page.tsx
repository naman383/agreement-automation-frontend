'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import apiClient from '@/lib/api';

export default function VisualTemplateUploadPage() {
  const router = useRouter();
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: ''
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];

      // Validate file type
      if (!selectedFile.name.endsWith('.docx')) {
        alert('❌ Only .docx files are supported');
        return;
      }

      setFile(selectedFile);

      // Auto-fill name from filename
      if (!formData.name) {
        const fileName = selectedFile.name.replace('.docx', '');
        setFormData(prev => ({ ...prev, name: fileName }));
      }
    }
  };

  const handleUpload = async () => {
    if (!file) {
      alert('❌ Please select a file');
      return;
    }

    if (!formData.name.trim()) {
      alert('❌ Please enter a template name');
      return;
    }

    setUploading(true);

    try {
      const uploadData = new FormData();
      uploadData.append('file', file);
      uploadData.append('name', formData.name);
      uploadData.append('description', formData.description);
      uploadData.append('category', formData.category);

      const response = await apiClient.post('/templates/visual/upload/', uploadData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Redirect to builder
      router.push(`/templates/visual/builder/${response.data.template_id}`);

    } catch (error: any) {
      console.error('Upload failed:', error);
      alert(`❌ Upload failed: ${error.response?.data?.error || error.message}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard">
                <Image
                  src="/logo-color.png"
                  alt="STAGE"
                  width={120}
                  height={31}
                  className="h-8 w-auto cursor-pointer"
                />
              </Link>
              <div className="text-sm text-gray-700 font-medium">
                Visual Template Builder
              </div>
            </div>
            <Link
              href="/templates"
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              ← Back to Templates
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Upload Agreement Template
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Upload your agreement document (DOCX). You'll then visually select regions to create form fields.
          </p>
        </div>

        {/* Upload Card */}
        <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-200 p-8">
          {/* File Upload */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Agreement Document *
            </label>

            {!file ? (
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center hover:border-red-400 transition-colors cursor-pointer">
                <input
                  type="file"
                  accept=".docx"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <p className="mt-4 text-lg text-gray-600">
                    Click to upload or drag and drop
                  </p>
                  <p className="mt-2 text-sm text-gray-500">
                    DOCX files only
                  </p>
                </label>
              </div>
            ) : (
              <div className="border-2 border-green-500 bg-green-50 rounded-xl p-6 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{file.name}</p>
                    <p className="text-sm text-gray-600">
                      {(file.size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setFile(null)}
                  className="text-red-600 hover:text-red-800"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}
          </div>

          {/* Template Name */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Template Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-red-500 focus:outline-none text-lg text-gray-900"
              placeholder="e.g., Service Agreement"
            />
          </div>

          {/* Description */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description (Optional)
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-red-500 focus:outline-none text-gray-900"
              placeholder="Brief description of this template..."
            />
          </div>

          {/* Category */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category (Optional)
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-red-500 focus:outline-none text-gray-900"
            >
              <option value="">Select category...</option>
              <option value="Service Agreement">Service Agreement</option>
              <option value="Sales Agreement">Sales Agreement</option>
              <option value="Partnership Agreement">Partnership Agreement</option>
              <option value="Employment Contract">Employment Contract</option>
              <option value="NDA">Non-Disclosure Agreement</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-6 border-t border-gray-200">
            <Link
              href="/templates"
              className="px-6 py-3 text-gray-600 hover:text-gray-900 font-medium"
            >
              Cancel
            </Link>
            <button
              onClick={handleUpload}
              disabled={!file || !formData.name.trim() || uploading}
              className="px-8 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center space-x-2 transition-all"
            >
              {uploading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <span>Continue to Builder</span>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="text-3xl mb-3">📄</div>
            <h3 className="font-bold text-gray-900 mb-2">Step 1: Upload</h3>
            <p className="text-sm text-gray-600">
              Upload your original agreement document (DOCX format)
            </p>
          </div>
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="text-3xl mb-3">🎯</div>
            <h3 className="font-bold text-gray-900 mb-2">Step 2: Mark Fields</h3>
            <p className="text-sm text-gray-600">
              Select regions in document to create form fields
            </p>
          </div>
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="text-3xl mb-3">✅</div>
            <h3 className="font-bold text-gray-900 mb-2">Step 3: Activate</h3>
            <p className="text-sm text-gray-600">
              Save and activate template for users
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
