'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import axios from 'axios';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);

    try {
      const response = await axios.post(
        'http://localhost:8000/api/v1/auth/password-reset/request/',
        { email }
      );

      setSuccess(true);
      setEmail('');
    } catch (err: any) {
      if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else if (err.response?.data) {
        const errors = err.response.data;
        const errorMessages = Object.entries(errors)
          .map(([field, msgs]: [string, any]) => {
            if (Array.isArray(msgs)) {
              return msgs.join(', ');
            }
            return msgs;
          })
          .join(', ');
        setError(errorMessages);
      } else {
        setError('Password reset request failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
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
            We've Got You Covered
          </h1>
          <p className="text-xl text-red-100 mb-8">
            Reset your password securely and get back to automating your agreements.
          </p>
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <div className="font-semibold text-lg">Secure Process</div>
                <div className="text-red-100 text-sm">Your security is our priority</div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <div className="font-semibold text-lg">Email Link</div>
                <div className="text-red-100 text-sm">Check your inbox for reset link</div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <div className="font-semibold text-lg">Quick Recovery</div>
                <div className="text-red-100 text-sm">Back to work in minutes</div>
              </div>
            </div>
          </div>
        </div>

        <div className="text-red-100 text-sm">
          © 2026 STAGE. All rights reserved.
        </div>
      </div>

      {/* Right Side - Reset Form */}
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
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Reset Password</h2>
              <p className="text-gray-600">
                Enter your email and we'll send you a reset link
              </p>
            </div>

            {success && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl">
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-green-600 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="text-sm font-medium text-green-800">Check your email</p>
                    <p className="text-sm text-green-700 mt-1">
                      If that email exists, we've sent a password reset link. Please check your inbox.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-sm text-red-800">{error}</p>
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
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm transition-colors"
                  placeholder="you@example.com"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white transition-all ${
                  loading
                    ? 'bg-red-400 cursor-not-allowed'
                    : 'bg-red-600 hover:bg-red-700 hover:shadow-md'
                }`}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Sending Reset Link...
                  </>
                ) : (
                  <>
                    Send Reset Link
                    <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </>
                )}
              </button>
            </form>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Remember your password?{' '}
              <button
                type="button"
                onClick={() => router.push('/login')}
                className="font-semibold text-red-600 hover:text-red-700"
              >
                Back to Sign in
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
