'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

export default function TeamPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [checking, setChecking] = useState(true);
  const router = useRouter();

  // Check if user is admin
  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const response = await axios.get(
          'http://localhost:8000/api/v1/auth/me/',
          { withCredentials: true }
        );

        // For MVP, admin = is_staff
        // We'll need to check the user data to see if they have admin permissions
        // For now, we'll allow access and let the backend enforce permissions
        setIsAdmin(true);
        setChecking(false);
      } catch (err) {
        // Not authenticated, redirect to login
        router.push('/login');
      }
    };

    checkAdmin();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await axios.post(
        'http://localhost:8000/api/v1/auth/invitations/send/',
        { email },
        { withCredentials: true }
      );

      setSuccess(response.data.message);
      setEmail('');
    } catch (err: any) {
      if (err.response?.status === 403) {
        setError('You do not have permission to send invitations. Admin access required.');
      } else if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else if (err.response?.data?.email) {
        // Validation error
        const emailErrors = err.response.data.email;
        setError(Array.isArray(emailErrors) ? emailErrors[0] : emailErrors);
      } else {
        setError('Failed to send invitation. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow p-8">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Team Management</h2>
            <p className="mt-2 text-sm text-gray-600">
              Invite team members to collaborate on agreement generation
            </p>
          </div>

          {success && (
            <div className="mb-6 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded">
              {success}
            </div>
          )}

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Team Member Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="teammate@example.com"
              />
              <p className="mt-2 text-sm text-gray-500">
                An invitation email will be sent with a signup link valid for 7 days
              </p>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {loading ? 'Sending Invitation...' : 'Send Invitation'}
              </button>
            </div>

            <div className="text-center">
              <button
                type="button"
                onClick={() => router.push('/dashboard')}
                className="text-sm text-blue-600 hover:text-blue-500"
              >
                Back to Dashboard
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
