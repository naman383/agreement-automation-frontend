'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import apiClient from '@/lib/api';

export default function TemplateUploadPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (!selectedFile.name.endsWith('.docx')) {
        setError('Please select a valid DOCX file');
        setFile(null);
        return;
      }
      setFile(selectedFile);
      setError(null);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (!droppedFile.name.endsWith('.docx')) {
        setError('Please select a valid DOCX file');
        return;
      }
      setFile(droppedFile);
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file) {
      setError('Please select a file to upload');
      return;
    }

    if (!formData.name.trim()) {
      setError('Please enter a template name');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('category', formData.description);
      formDataToSend.append('file', file);

      const response = await apiClient.post('/templates/diagnostic/', formDataToSend, {
        headers: {
          'Content-Type': undefined,
        },
      });

      router.push(`/templates/${response.data.id}/placeholders`);
    } catch (err: any) {
      console.error('Upload failed:', err);
      setError(
        err.response?.data?.error ||
        err.response?.data?.docx_file?.[0] ||
        'Failed to upload template. Please try again.'
      );
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Premium Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <Link href="/dashboard">
                <Image
                  src="/logo-color.png"
                  alt="STAGE"
                  width={120}
                  height={31}
                  className="h-8 w-auto cursor-pointer"
                />
              </Link>
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

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <Link href="/templates" className="text-red-600 hover:text-red-700 mr-4">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Upload Template</h1>
              <p className="text-lg text-gray-600 mt-2">
                Add a new agreement template to your library
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Error Alert */}
          {error && (
            <div className="bg-red-50 border-l-4 border-red-600 p-4 rounded-lg">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-red-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <h3 className="text-sm font-semibold text-red-800">Upload Error</h3>
                  <p className="text-sm text-red-700 mt-1">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Template Details */}
          <div className="bg-white rounded-2xl border border-gray-200 p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Template Details</h2>

            <div className="space-y-5">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Template Name <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm"
                  placeholder="e.g., Podcast Creator Agreement"
                />
                <p className="mt-2 text-xs text-gray-500">Give your template a clear, descriptive name</p>
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  id="description"
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm"
                  placeholder="Describe when to use this template..."
                />
                <p className="mt-2 text-xs text-gray-500">Optional: Help others understand when to use this template</p>
              </div>
            </div>
          </div>

          {/* File Upload */}
          <div className="bg-white rounded-2xl border border-gray-200 p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Upload File</h2>

            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`relative border-2 border-dashed rounded-2xl p-12 text-center transition-all ${
                dragActive
                  ? 'border-red-500 bg-red-50'
                  : file
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-300 hover:border-red-400'
              }`}
            >
              {!file ? (
                <div>
                  <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <div className="mt-4">
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <span className="mt-2 block text-lg font-semibold text-gray-900">
                        Drop your DOCX file here
                      </span>
                      <span className="mt-1 block text-sm text-gray-600">
                        or{' '}
                        <span className="text-red-600 hover:text-red-700 font-medium">
                          browse to upload
                        </span>
                      </span>
                      <input
                        id="file-upload"
                        name="file-upload"
                        type="file"
                        accept=".docx"
                        className="sr-only"
                        onChange={handleFileChange}
                      />
                    </label>
                    <p className="mt-2 text-xs text-gray-500">Only DOCX files are supported</p>
                  </div>
                </div>
              ) : (
                <div>
                  <svg className="mx-auto h-16 w-16 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="mt-4 text-lg font-semibold text-gray-900">{file.name}</p>
                  <p className="mt-1 text-sm text-gray-600">{(file.size / 1024).toFixed(1)} KB</p>
                  <button
                    type="button"
                    onClick={() => setFile(null)}
                    className="mt-4 text-sm font-medium text-red-600 hover:text-red-700"
                  >
                    Remove file
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Guidelines */}
          <div className="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-6">
            <div className="flex items-start">
              <svg className="w-6 h-6 text-blue-600 mr-3 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h3 className="text-sm font-semibold text-blue-900 mb-2">
                  Placeholder Format
                </h3>
                <div className="text-sm text-blue-800 space-y-2">
                  <p>Use this format in your DOCX file: <code className="bg-blue-100 px-2 py-1 rounded font-mono">{'{{placeholder_name}}'}</code></p>
                  <p className="text-xs">Examples: <code className="bg-blue-100 px-1.5 py-0.5 rounded font-mono text-xs">{'{{creator_name}}'}</code>, <code className="bg-blue-100 px-1.5 py-0.5 rounded font-mono text-xs">{'{{project_title}}'}</code></p>
                  <p className="text-xs text-blue-700">After upload, you'll configure each field with user-friendly labels</p>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-4">
            <Link
              href="/templates"
              className="px-6 py-3 border-2 border-gray-300 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={uploading || !file || !formData.name.trim()}
              className={`px-6 py-3 rounded-xl text-sm font-semibold text-white transition-all flex items-center ${
                uploading || !file || !formData.name.trim()
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-red-600 hover:bg-red-700 shadow-sm hover:shadow-md'
              }`}
            >
              {uploading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Uploading...
                </>
              ) : (
                <>
                  Upload & Configure
                  <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </>
              )}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
