'use client';

import { useEffect, useState, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import apiClient from '@/lib/api';

interface User {
  id: number;
  email: string;
  full_name: string;
  role: 'admin' | 'legal_reviewer' | 'content_manager' | 'viewer';
  is_active: boolean;
}

interface DashboardLayoutProps {
  children: ReactNode;
}

interface NavItem {
  name: string;
  href: string;
  icon: string;
  roles?: string[]; // If specified, only show for these roles
}

const navigation: NavItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: '🏠' },
  { name: 'Templates', href: '/templates', icon: '📄', roles: ['admin', 'legal_reviewer', 'content_manager'] },
  { name: 'New Agreement', href: '/agreements/start', icon: '➕', roles: ['admin', 'content_manager'] },
  { name: 'Agreements', href: '/agreements', icon: '📋' },
  { name: 'Team', href: '/team', icon: '👥', roles: ['admin'] },
  { name: 'Audit Logs', href: '/audit', icon: '🔍', roles: ['admin', 'legal_reviewer'] },
];

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await apiClient.get<User>('/auth/me/');
        setUser(response.data);
      } catch (error) {
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await apiClient.post('/auth/logout/');
      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
      router.push('/login');
    } finally {
      setIsLoggingOut(false);
    }
  };

  const filteredNavigation = navigation.filter(
    (item) => !item.roles || (user && item.roles.includes(user.role))
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-gray-500 hover:text-gray-700 focus:outline-none"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h1 className="text-xl font-bold text-gray-900">
              Agreement Automation
            </h1>
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">{user.full_name || user.email}</p>
              <p className="text-xs text-gray-500 capitalize">{user.role ? user.role.replace(/_/g, ' ') : 'User'}</p>
            </div>
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className={`px-4 py-2 text-sm font-medium text-white rounded-md ${
                isLoggingOut
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
              }`}
            >
              {isLoggingOut ? 'Logging out...' : 'Logout'}
            </button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`${
            sidebarOpen ? 'w-64' : 'w-0'
          } bg-white border-r border-gray-200 transition-all duration-300 overflow-hidden`}
        >
          <nav className="px-3 py-4 space-y-1">
            {filteredNavigation.map((item) => {
              const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-700'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* User info at bottom */}
          <div className="absolute bottom-0 w-64 px-3 py-4 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 rounded-full bg-indigo-600 flex items-center justify-center text-white font-medium text-sm">
                  {(user.full_name || user.email)[0].toUpperCase()}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-500">Session expires in</p>
                <p className="text-xs font-medium text-gray-900">30 min of inactivity</p>
              </div>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-auto">
          <div className="px-4 py-6 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
