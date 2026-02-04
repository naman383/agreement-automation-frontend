'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import axios from 'axios';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(true);
  const [isValid, setIsValid] = useState(false);
  const router = useRouter();
  const params = useParams();
  const token = params.token as string;

  // Validate invitation token on load
  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setError('Invalid invitation link. No token provided.');
        setValidating(false);
        return;
      }

      try {
        const response = await axios.get(
          `http://localhost:8000/api/v1/auth/invitations/validate/${token}/`
        );

        setEmail(response.data.email);
        setIsValid(true);
        setValidating(false);
      } catch (err: any) {
        if (err.response?.data?.error) {
          setError(err.response.data.error);
        } else {
          setError('Invalid or expired invitation link.');
        }
        setValidating(false);
      }
    };

    validateToken();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);

    if (password !== passwordConfirm) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(
        'http://localhost:8000/api/v1/auth/invitations/accept/',
        {
          token,
          password,
          password_confirm: passwordConfirm
        }
      );

      setSuccess(true);
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (err: any) {
      if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else if (err.response?.data) {
        // Handle validation errors
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
        setError('Account creation failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (validating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-600">Validating invitation...</div>
      </div>
    );
  }

  if (!isValid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
          <div>
            <h2 className="text-3xl font-bold text-center text-gray-900">Invalid Invitation</h2>
          </div>

          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
            {error}
          </div>

          <div className="text-center">
            <button
              type="button"
              onClick={() => router.push('/login')}
              className="text-sm text-blue-600 hover:text-blue-500"
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
        <div>
          <h2 className="text-3xl font-bold text-center">Create Your Account</h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            You've been invited to join Agreement Automation System
          </p>
        </div>

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded">
            Account created successfully! Redirecting to login...
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {!success && (
          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                readOnly
                value={email}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-500 cursor-not-allowed"
              />
              <p className="mt-1 text-sm text-gray-500">
                Email from invitation (cannot be changed)
              </p>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Minimum 8 characters"
                minLength={8}
              />
            </div>

            <div>
              <label htmlFor="password_confirm" className="block text-sm font-medium text-gray-700">
                Confirm Password
              </label>
              <input
                id="password_confirm"
                name="password_confirm"
                type="password"
                required
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Re-enter password"
                minLength={8}
              />
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
            </div>

            <div className="text-center">
              <button
                type="button"
                onClick={() => router.push('/login')}
                className="text-sm text-blue-600 hover:text-blue-500"
              >
                Already have an account? Login
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
