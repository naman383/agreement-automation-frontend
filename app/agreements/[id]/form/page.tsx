'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import apiClient from '@/lib/api';

interface Placeholder {
  name: string;
  label: string;
  field_type: string;
  is_required: boolean;
  dropdown_options: string[];
  validation_regex: string;
  category: string;
}

interface GroupedPlaceholders {
  [category: string]: Placeholder[];
}

export default function AgreementFormPage() {
  const router = useRouter();
  const params = useParams();
  const agreementId = params.id;

  const [agreement, setAgreement] = useState<any>(null);
  const [placeholders, setPlaceholders] = useState<GroupedPlaceholders>({});
  const [formData, setFormData] = useState<{ [key: string]: any }>({});
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadAgreement();
  }, [agreementId]);

  const loadAgreement = async () => {
    console.log('[Agreement Form] Loading agreement with ID:', agreementId);
    console.log('[Agreement Form] Type of agreementId:', typeof agreementId);
    console.log('[Agreement Form] params object:', params);

    if (!agreementId || agreementId === 'undefined') {
      console.error('[Agreement Form] Invalid agreement ID!');
      setLoading(false);
      alert('Invalid agreement ID. Please start a new agreement from the agreements page.');
      return;
    }

    try {
      const response = await apiClient.get(`/agreements/${agreementId}/`);
      setAgreement(response.data);

      const grouped: GroupedPlaceholders = {};
      response.data.grouped_placeholders.forEach((placeholder: Placeholder) => {
        if (!grouped[placeholder.category]) {
          grouped[placeholder.category] = [];
        }
        grouped[placeholder.category].push(placeholder);
      });
      setPlaceholders(grouped);

      const initial: { [key: string]: any } = {};
      response.data.grouped_placeholders.forEach((placeholder: Placeholder) => {
        initial[placeholder.name] = '';
      });
      setFormData(initial);
    } catch (error) {
      console.error('Failed to load agreement:', error);
    } finally {
      setLoading(false);
    }
  };

  const validateField = async (name: string, value: any) => {
    if (!value && placeholders) {
      const placeholder = Object.values(placeholders)
        .flat()
        .find((p) => p.name === name);
      if (placeholder?.is_required) {
        setErrors({ ...errors, [name]: 'This field is required' });
        return;
      }
    }

    try {
      const response = await apiClient.post(`/agreements/${agreementId}/validate-field/`, {
        placeholder_name: name,
        value: value,
      });

      if (!response.data.is_valid) {
        setErrors({ ...errors, [name]: response.data.error });
      } else {
        const newErrors = { ...errors };
        delete newErrors[name];
        setErrors(newErrors);

        if (response.data.normalized_value !== undefined) {
          setFormData({ ...formData, [name]: response.data.normalized_value });
        }
      }
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  const handleFieldChange = (name: string, value: any) => {
    setFormData({ ...formData, [name]: value });
    if (errors[name]) {
      const newErrors = { ...errors };
      delete newErrors[name];
      setErrors(newErrors);
    }
  };

  const handleFieldBlur = (name: string) => {
    validateField(name, formData[name]);
  };

  const handleSaveAndContinue = async () => {
    setSaving(true);

    try {
      await apiClient.patch(`/agreements/${agreementId}/update-data/`, {
        placeholder_data: formData,
      });

      router.push(`/agreements/${agreementId}/preview`);
    } catch (error: any) {
      console.error('Save failed:', error);
      alert(error.response?.data?.error || 'Failed to save data');
    } finally {
      setSaving(false);
    }
  };

  const renderField = (placeholder: Placeholder) => {
    const hasError = errors[placeholder.name];
    const value = formData[placeholder.name] || '';

    const baseInputClasses = `block w-full rounded-xl shadow-sm text-sm transition-colors ${
      hasError
        ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
        : 'border-gray-300 focus:border-red-500 focus:ring-red-500'
    }`;

    switch (placeholder.field_type) {
      case 'checkbox':
        return (
          <div className="flex items-center mt-1">
            <input
              type="checkbox"
              checked={value === true || value === 'true'}
              onChange={(e) => handleFieldChange(placeholder.name, e.target.checked)}
              className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
            />
            <label className="ml-2 text-sm text-gray-700">{placeholder.label}</label>
          </div>
        );

      case 'dropdown':
        return (
          <select
            value={value}
            onChange={(e) => handleFieldChange(placeholder.name, e.target.value)}
            onBlur={() => handleFieldBlur(placeholder.name)}
            className={baseInputClasses + ' py-2 px-3'}
          >
            <option value="">Select...</option>
            {placeholder.dropdown_options?.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        );

      case 'date':
        return (
          <input
            type="date"
            value={value}
            onChange={(e) => handleFieldChange(placeholder.name, e.target.value)}
            onBlur={() => handleFieldBlur(placeholder.name)}
            className={baseInputClasses + ' py-2 px-3'}
          />
        );

      case 'number':
      case 'currency':
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => handleFieldChange(placeholder.name, e.target.value)}
            onBlur={() => handleFieldBlur(placeholder.name)}
            placeholder={placeholder.field_type === 'currency' ? '₹ 0.00' : '0'}
            className={baseInputClasses + ' py-2 px-3'}
          />
        );

      default:
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => handleFieldChange(placeholder.name, e.target.value)}
            onBlur={() => handleFieldBlur(placeholder.name)}
            placeholder={
              placeholder.field_type === 'pan'
                ? 'ABCDE1234F'
                : placeholder.field_type === 'gst'
                ? '22ABCDE1234F1Z5'
                : ''
            }
            className={baseInputClasses + ' py-2 px-3'}
          />
        );
    }
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
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading form...</p>
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
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900">Agreement not found</h3>
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

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <Link href="/agreements" className="text-sm text-red-600 hover:text-red-700 font-medium mb-4 inline-block">
            ← Back to Agreements
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{agreement.template.name}</h1>
          <p className="text-gray-600">
            Fill in the required information for your agreement
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="px-6 py-8">
            <form className="space-y-8">
              {Object.entries(placeholders).map(([category, fields]) => (
                <div key={category}>
                  <div className="flex items-center mb-6">
                    <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center mr-3">
                      <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 capitalize">
                      {category.replace('_', ' ')}
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    {fields.map((placeholder) => (
                      <div key={placeholder.name} className={placeholder.field_type === 'checkbox' ? 'sm:col-span-2' : ''}>
                        {placeholder.field_type !== 'checkbox' && (
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            {placeholder.label}
                            {placeholder.is_required && (
                              <span className="text-red-500 ml-1">*</span>
                            )}
                          </label>
                        )}
                        {renderField(placeholder)}
                        {errors[placeholder.name] && (
                          <p className="mt-2 text-sm text-red-600 flex items-center">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {errors[placeholder.name]}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              <div className="border-t border-gray-200 pt-6 flex justify-between">
                <Link
                  href="/agreements"
                  className="inline-flex items-center px-6 py-2 border-2 border-gray-300 rounded-xl shadow-sm text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-400 transition-colors"
                >
                  Cancel
                </Link>
                <button
                  type="button"
                  onClick={handleSaveAndContinue}
                  disabled={saving || Object.keys(errors).length > 0}
                  className={`inline-flex items-center justify-center px-8 py-2 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white transition-all ${
                    saving || Object.keys(errors).length > 0
                      ? 'bg-red-400 cursor-not-allowed'
                      : 'bg-red-600 hover:bg-red-700 hover:shadow-md'
                  }`}
                >
                  {saving ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Saving...
                    </>
                  ) : (
                    <>
                      Save & Preview
                      <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
