'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardBody, CardFooter } from '@/components/ui/Card';
import { FormField } from '@/components/forms/FormField';
import { TextInput } from '@/components/forms/TextInput';
import { RadioGroup, RadioOption } from '@/components/forms/RadioGroup';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { InfoIcon } from '@/components/ui/Tooltip';
import {
  fieldTypeLabels,
  fieldTypeDescriptions,
  validationHints,
} from '@/lib/constants/designTokens';
import apiClient from '@/lib/api';

interface Placeholder {
  id?: number;
  name: string;
  label: string;
  field_type: string;
  is_required: boolean;
  position_index?: number;
  validation_rules?: any;
}

export default function PlaceholderConfigurationRedesigned() {
  const router = useRouter();
  const params = useParams();
  const templateId = params.id;

  const [placeholders, setPlaceholders] = useState<Placeholder[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [autoSaving, setAutoSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [templateName, setTemplateName] = useState('');
  const [showPreview, setShowPreview] = useState(false);

  // Field type options in plain language
  const fieldTypeOptions: RadioOption[] = [
    {
      value: 'text',
      label: "Person's Name / Text",
      description: "Use this for names, titles, or any text information",
    },
    {
      value: 'number',
      label: 'Number or Amount',
      description: "Use this for whole numbers like counts, quantities, or ages",
    },
    {
      value: 'currency',
      label: 'Money Amount (₹)',
      description: "Use this for money amounts, fees, or payments in Rupees",
    },
    {
      value: 'date',
      label: 'Date',
      description: "Use this for any calendar dates (DD/MM/YYYY format)",
    },
    {
      value: 'email',
      label: 'Email Address',
      description: "Use this for email addresses",
    },
    {
      value: 'phone',
      label: 'Phone Number',
      description: "Use this for Indian mobile or landline numbers",
    },
    {
      value: 'pan_number',
      label: 'Indian PAN (Tax ID)',
      description: "We'll automatically verify the format: AAAAA1234A",
    },
    {
      value: 'gst_number',
      label: 'Indian GST Number',
      description: "We'll check this is 15 characters in valid GST format",
    },
  ];

  useEffect(() => {
    loadTemplate();
  }, [templateId]);

  // Auto-save every 30 seconds
  useEffect(() => {
    if (placeholders.length === 0) return;

    const autoSaveInterval = setInterval(() => {
      handleAutoSave();
    }, 30000); // 30 seconds

    return () => clearInterval(autoSaveInterval);
  }, [placeholders]);

  const loadTemplate = async () => {
    try {
      const response = await apiClient.get(`/templates/${templateId}/`);
      setTemplateName(response.data.name);

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

  const handleAutoSave = async () => {
    if (placeholders.length === 0) return;

    setAutoSaving(true);
    try {
      await apiClient.post(`/templates/${templateId}/placeholders/`, {
        placeholders: placeholders,
      });
    } catch (err) {
      console.error('Auto-save failed:', err);
    } finally {
      setTimeout(() => setAutoSaving(false), 1000);
    }
  };

  const updateCurrentPlaceholder = (field: keyof Placeholder, value: any) => {
    const updated = [...placeholders];
    updated[currentStep] = { ...updated[currentStep], [field]: value };
    setPlaceholders(updated);
  };

  const handleNext = () => {
    if (currentStep < placeholders.length - 1) {
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSaveAndFinish = async () => {
    setSaving(true);
    setError(null);

    try {
      await apiClient.post(`/templates/${templateId}/placeholders/`, {
        placeholders: placeholders,
      });

      router.push(`/templates/${templateId}`);
    } catch (err: any) {
      console.error('Save failed:', err);
      setError(err.response?.data?.error || 'Failed to save configuration');
    } finally {
      setSaving(false);
    }
  };

  const currentPlaceholder = placeholders[currentStep];
  const isLastStep = currentStep === placeholders.length - 1;
  const isFirstStep = currentStep === 0;

  if (loading) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your template...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (placeholders.length === 0) {
    return (
      <DashboardLayout>
        <div className="max-w-3xl mx-auto">
          <Card padding="lg">
            <div className="text-center">
              <span className="text-6xl">📝</span>
              <h3 className="mt-4 text-xl font-semibold text-gray-900">
                No Fields Detected
              </h3>
              <p className="mt-2 text-gray-600">
                We couldn't find any placeholders in your template. Make sure your DOCX
                file contains placeholders in this format: {'{{placeholder_name}}'}
              </p>
              <div className="mt-6">
                <Link href={`/templates/${templateId}`}>
                  <Button variant="primary">Back to Template</Button>
                </Link>
              </div>
            </div>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  // Preview Modal
  if (showPreview) {
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Form Preview</CardTitle>
                  <p className="text-sm text-gray-600 mt-1">
                    This is how users will see the form when generating agreements
                  </p>
                </div>
                <Button variant="secondary" onClick={() => setShowPreview(false)}>
                  Close Preview
                </Button>
              </div>
            </CardHeader>
            <CardBody>
              <div className="bg-gray-50 p-6 rounded-lg border-2 border-dashed border-gray-300">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  {templateName} - Agreement Form
                </h3>
                <div className="space-y-4">
                  {placeholders.map((placeholder, index) => (
                    <FormField
                      key={index}
                      label={placeholder.label || placeholder.name}
                      required={placeholder.is_required}
                      hint={validationHints[placeholder.field_type]}
                    >
                      <TextInput
                        placeholder={`Enter ${placeholder.label || placeholder.name}`}
                        disabled
                      />
                    </FormField>
                  ))}
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center text-sm text-gray-500 mb-3">
            <Link href="/templates" className="hover:text-blue-600 transition-colors">
              Templates
            </Link>
            <span className="mx-2">/</span>
            <Link
              href={`/templates/${templateId}`}
              className="hover:text-blue-600 transition-colors"
            >
              {templateName}
            </Link>
            <span className="mx-2">/</span>
            <span className="text-gray-900 font-medium">Set Up Form Fields</span>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Configure Agreement Fields
              </h1>
              <p className="mt-2 text-gray-600">
                Help creators fill this agreement correctly by telling us about each field
                below
              </p>
            </div>
            {autoSaving && (
              <div className="flex items-center text-sm text-green-600">
                <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                Saving draft...
              </div>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <ProgressBar current={currentStep + 1} total={placeholders.length} />
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg">
            <div className="flex">
              <span className="text-red-500 mr-3">❌</span>
              <div>
                <h3 className="text-sm font-medium text-red-800">
                  Please Check These Fields
                </h3>
                <p className="mt-1 text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Configuration Card */}
        <Card padding="lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>
                Field {currentStep + 1} of {placeholders.length}:{' '}
                <code className="text-blue-600 font-mono bg-blue-50 px-2 py-1 rounded">
                  {`{{${currentPlaceholder?.name}}}`}
                </code>
              </CardTitle>
              <Button variant="secondary" size="sm" onClick={() => setShowPreview(true)}>
                👁️ Preview Form
              </Button>
            </div>
          </CardHeader>

          <CardBody className="space-y-6">
            {/* Question 1: Field Label */}
            <FormField
              label="What should we call this field?"
              required
              hint="This is what users will see on the form. Use clear, simple language like 'Creator Name' or 'Project Title'."
              htmlFor="field-label"
            >
              <TextInput
                id="field-label"
                value={currentPlaceholder?.label || ''}
                onChange={(e) => updateCurrentPlaceholder('label', e.target.value)}
                placeholder="e.g., Creator Name, Project Title, Payment Amount"
                success={!!currentPlaceholder?.label}
              />
            </FormField>

            {/* Question 2: Field Type */}
            <FormField
              label="What type of information is this?"
              required
              hint="Choose the type that best describes this information. We'll automatically validate the format."
            >
              <RadioGroup
                name={`field-type-${currentStep}`}
                value={currentPlaceholder?.field_type || 'text'}
                onChange={(value) => updateCurrentPlaceholder('field_type', value)}
                options={fieldTypeOptions}
              />
            </FormField>

            {/* Validation Hint Display */}
            {validationHints[currentPlaceholder?.field_type] && (
              <div className="p-4 bg-blue-50 border-l-4 border-blue-500 rounded-r-lg">
                <div className="flex">
                  <span className="text-blue-500 mr-3">ℹ️</span>
                  <div>
                    <h4 className="text-sm font-medium text-blue-900">
                      We'll automatically check:
                    </h4>
                    <p className="mt-1 text-sm text-blue-700">
                      {validationHints[currentPlaceholder?.field_type]}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Question 3: Required */}
            <FormField
              label="Must this field be filled?"
              hint="Choose 'Yes, required' if this information is essential for the agreement to be valid."
            >
              <div className="flex gap-4">
                <label className="flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer flex-1 transition-all">
                  <input
                    type="radio"
                    name={`required-${currentStep}`}
                    checked={currentPlaceholder?.is_required === true}
                    onChange={() => updateCurrentPlaceholder('is_required', true)}
                    className="h-5 w-5 text-blue-600 focus:ring-2 focus:ring-blue-500"
                  />
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      Yes, required
                    </div>
                    <div className="text-xs text-gray-500">Must be filled</div>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer flex-1 transition-all">
                  <input
                    type="radio"
                    name={`required-${currentStep}`}
                    checked={currentPlaceholder?.is_required === false}
                    onChange={() => updateCurrentPlaceholder('is_required', false)}
                    className="h-5 w-5 text-blue-600 focus:ring-2 focus:ring-blue-500"
                  />
                  <div>
                    <div className="text-sm font-medium text-gray-900">No, optional</div>
                    <div className="text-xs text-gray-500">Can be left empty</div>
                  </div>
                </label>
              </div>
            </FormField>

            {/* Helpful Tip */}
            <div className="p-4 bg-amber-50 border-l-4 border-amber-500 rounded-r-lg">
              <div className="flex">
                <span className="text-amber-500 mr-3">💡</span>
                <div>
                  <h4 className="text-sm font-medium text-amber-900">Tip</h4>
                  <p className="mt-1 text-sm text-amber-700">
                    {currentPlaceholder?.field_type === 'pan_number'
                      ? 'PAN numbers are needed for tax compliance in Indian creator agreements'
                      : currentPlaceholder?.field_type === 'gst_number'
                      ? 'GST number is only needed if the creator is GST registered'
                      : currentPlaceholder?.field_type === 'currency'
                      ? 'Money amounts will be formatted as Indian Rupees (₹)'
                      : currentPlaceholder?.field_type === 'date'
                      ? 'Dates will be shown in DD/MM/YYYY format'
                      : 'Make sure the field label is clear so users understand what to enter'}
                  </p>
                </div>
              </div>
            </div>
          </CardBody>

          <CardFooter>
            <div className="flex items-center justify-between">
              <div>
                {!isFirstStep && (
                  <Button variant="secondary" onClick={handlePrevious}>
                    ← Previous
                  </Button>
                )}
              </div>

              <div className="flex gap-3">
                <Button variant="text" onClick={() => router.push(`/templates/${templateId}`)}>
                  Save as Draft
                </Button>
                {isLastStep ? (
                  <Button
                    variant="primary"
                    onClick={handleSaveAndFinish}
                    loading={saving}
                  >
                    {saving ? 'Saving...' : '✓ Save & Finish'}
                  </Button>
                ) : (
                  <Button variant="primary" onClick={handleNext}>
                    Save & Next →
                  </Button>
                )}
              </div>
            </div>
          </CardFooter>
        </Card>

        {/* Completion Status */}
        <div className="mt-6 flex items-center justify-center gap-2">
          {placeholders.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentStep(index)}
              className={`w-3 h-3 rounded-full transition-all ${
                index === currentStep
                  ? 'bg-blue-600 scale-125'
                  : index < currentStep
                  ? 'bg-green-500'
                  : 'bg-gray-300'
              }`}
              aria-label={`Go to field ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
