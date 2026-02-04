'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import apiClient from '@/lib/api';

interface AuditLog {
  id: number;
  event_type: string;
  description: string;
  user: {
    email: string;
    full_name: string;
  };
  created_at: string;
}

export default function AuditPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    try {
      // This endpoint would need to be implemented in backend
      // For now, showing placeholder
      setLogs([]);
    } catch (error) {
      console.error('Failed to load audit logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  return (
    <DashboardLayout>
      <div>
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Audit Logs</h2>
          <p className="mt-1 text-sm text-gray-500">
            Comprehensive audit trail of all system activities
          </p>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <div className="text-center py-12">
            <span className="text-6xl">🔍</span>
            <h3 className="mt-2 text-lg font-medium text-gray-900">Audit Log Viewer</h3>
            <p className="mt-1 text-sm text-gray-500">
              All audit events are logged in the backend database
            </p>
            <div className="mt-6 bg-blue-50 border-l-4 border-blue-400 p-4 text-left max-w-2xl mx-auto">
              <div className="text-sm text-blue-700">
                <p className="font-medium mb-2">Audit System Features:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>All template operations (upload, approve, deprecate)</li>
                  <li>All agreement generations and downloads</li>
                  <li>User authentication events</li>
                  <li>User management actions</li>
                  <li>RBAC permission checks</li>
                  <li>Immutable audit trail with 7-year retention</li>
                </ul>
                <p className="mt-4">
                  <strong>Note:</strong> Audit log viewer UI can be implemented with pagination,
                  filtering by event type, user, date range, and export functionality.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
