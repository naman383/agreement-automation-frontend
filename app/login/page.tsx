'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import apiClient, { setCSRFToken } from '@/lib/api';

interface FormErrors {
  email?: string[];
  password?: string[];
  error?: string;
}

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormErrors] || errors.error) {
      setErrors({});
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});
    setIsSubmitting(true);

    try {
      const response = await apiClient.post('/auth/login/', formData);

      if (response.status === 200) {
        console.log('[Login] Login successful!');

        if (response.data.csrfToken) {
          setCSRFToken(response.data.csrfToken);
          console.log('[Login] ✅ CSRF token received and stored');
        } else {
          console.warn('[Login] ⚠ No CSRF token in login response');
        }

        router.push('/dashboard');
      }
    } catch (error: any) {
      if (error.response?.data) {
        setErrors(error.response.data);
      } else {
        setErrors({ error: 'Login failed. Please try again.' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const getFieldError = (field: keyof FormErrors): string | null => {
    const fieldErrors = errors[field];
    if (Array.isArray(fieldErrors) && fieldErrors.length > 0) {
      return fieldErrors[0];
    }
    if (typeof fieldErrors === 'string') {
      return fieldErrors;
    }
    return null;
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-red-600 to-red-700 p-12 flex-col justify-between">
        <div>
          <Image
            src="/logo-color.png"
            alt="STAGE"
            width={150}
            height={39}
            className="h-10 w-auto brightness-0 invert"
          />
        </div>

        <div className="text-white">
          <h1 className="text-5xl font-bold mb-6">
            Agreement Automation Made Simple
          </h1>
          <p className="text-xl text-red-100 mb-8">
            Create, manage, and generate professional agreements in minutes, not hours.
          </p>
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <div className="font-semibold text-lg">Upload Templates</div>
                <div className="text-red-100 text-sm">Just upload your DOCX files</div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
              </div>
              <div>
                <div className="font-semibold text-lg">Configure Fields</div>
                <div className="text-red-100 text-sm">No technical knowledge needed</div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <div className="font-semibold text-lg">Generate Instantly</div>
                <div className="text-red-100 text-sm">Professional agreements in seconds</div>
              </div>
            </div>
          </div>
        </div>

        <div className="text-red-100 text-sm">
          © 2026 STAGE. All rights reserved.
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center bg-gray-50 p-8">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden mb-8 text-center">
            <Image
              src="/logo-color.png"
              alt="STAGE"
              width={120}
              height={31}
              className="h-8 w-auto mx-auto"
            />
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome back</h2>
              <p className="text-gray-600">
                Sign in to your account to continue
              </p>
            </div>

            {errors.error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-sm text-red-800">{errors.error}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className={`block w-full px-4 py-3 border ${
                    getFieldError('email') ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-red-500 focus:border-red-500'
                  } rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 text-sm transition-colors`}
                  placeholder="you@example.com"
                />
                {getFieldError('email') && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {getFieldError('email')}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className={`block w-full px-4 py-3 border ${
                    getFieldError('password') ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-red-500 focus:border-red-500'
                  } rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 text-sm transition-colors`}
                  placeholder="Enter your password"
                />
                {getFieldError('password') && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {getFieldError('password')}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                    Remember me
                  </label>
                </div>

                <div className="text-sm">
                  <a href="/forgot-password" className="font-medium text-red-600 hover:text-red-700">
                    Forgot password?
                  </a>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white transition-all ${
                  isSubmitting
                    ? 'bg-red-400 cursor-not-allowed'
                    : 'bg-red-600 hover:bg-red-700 hover:shadow-md'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign in
                    <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </>
                )}
              </button>
            </form>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <a href="/register" className="font-semibold text-red-600 hover:text-red-700">
                Create account
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
