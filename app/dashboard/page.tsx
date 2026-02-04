'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import apiClient from '@/lib/api';

interface Stats {
  total_templates: number;
  approved_templates: number;
  draft_templates: number;
  total_agreements: number;
  agreements_this_month: number;
  my_agreements: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats>({
    total_templates: 0,
    approved_templates: 0,
    draft_templates: 0,
    total_agreements: 0,
    agreements_this_month: 0,
    my_agreements: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const [visualTemplatesRes, agreementsRes] = await Promise.all([
          apiClient.get('/templates/visual/'),
          apiClient.get('/agreements/list/')
        ]);

        const visualTemplates = Array.isArray(visualTemplatesRes.data?.templates) ? visualTemplatesRes.data.templates :
                          Array.isArray(visualTemplatesRes.data) ? visualTemplatesRes.data : [];

        const agreements = Array.isArray(agreementsRes.data?.agreements) ? agreementsRes.data.agreements :
                          Array.isArray(agreementsRes.data?.results) ? agreementsRes.data.results : [];

        const now = new Date();
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const agreementsThisMonth = agreements.filter((a: any) =>
          a.generated_at && new Date(a.generated_at) >= firstDayOfMonth
        );

        // Count approved: visual 'active'
        const approvedCount = visualTemplates.filter((t: any) => t.status === 'active').length;

        // Count draft
        const draftCount = visualTemplates.filter((t: any) => t.status === 'draft').length;

        setStats({
          total_templates: visualTemplates.length,
          approved_templates: approvedCount,
          draft_templates: draftCount,
          total_agreements: agreementsRes.data?.total_count || agreements.length,
          agreements_this_month: agreementsThisMonth.length,
          my_agreements: agreements.length,
        });
      } catch (error) {
        console.error('Failed to load stats:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

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
              <Link href="/dashboard" className="text-sm font-medium text-red-600 border-b-2 border-red-600 pb-4">
                Home
              </Link>
              <Link href="/templates" className="text-sm font-medium text-gray-600 hover:text-gray-900 pb-4">
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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Welcome Section */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Welcome back
          </h1>
          <p className="text-lg text-gray-600">
            Here's what's happening with your agreements today
          </p>
        </div>

        {/* Stats Cards - Premium Design */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* Templates Card */}
          <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-all border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <Link href="/templates" className="text-sm font-medium text-red-600 hover:text-red-700">
                View all →
              </Link>
            </div>
            <div className="mb-2">
              <div className="text-4xl font-bold text-gray-900 mb-1">
                {loading ? '...' : stats.total_templates}
              </div>
              <div className="text-sm font-medium text-gray-600">
                Agreement Templates
              </div>
            </div>
            <div className="flex items-center space-x-4 text-xs text-gray-500">
              <span className="flex items-center">
                <span className="w-2 h-2 rounded-full bg-green-500 mr-1.5"></span>
                {stats.approved_templates} Ready
              </span>
              <span className="flex items-center">
                <span className="w-2 h-2 rounded-full bg-gray-300 mr-1.5"></span>
                {stats.draft_templates} Draft
              </span>
            </div>
          </div>

          {/* Agreements Card */}
          <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-all border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <Link href="/agreements" className="text-sm font-medium text-red-600 hover:text-red-700">
                View all →
              </Link>
            </div>
            <div className="mb-2">
              <div className="text-4xl font-bold text-gray-900 mb-1">
                {loading ? '...' : stats.total_agreements}
              </div>
              <div className="text-sm font-medium text-gray-600">
                Total Agreements
              </div>
            </div>
            <div className="text-xs text-gray-500">
              <span className="text-green-600 font-medium">+{stats.agreements_this_month}</span> created this month
            </div>
          </div>

          {/* Quick Action Card */}
          <div className="bg-gradient-to-br from-red-600 to-red-700 rounded-2xl p-8 shadow-sm hover:shadow-md transition-all text-white">
            <div className="flex items-center justify-between mb-6">
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
            </div>
            <div className="mb-6">
              <div className="text-2xl font-bold mb-1">
                Create New
              </div>
              <div className="text-sm text-red-100">
                Generate agreement from template
              </div>
            </div>
            <Link
              href="/agreements/visual/create"
              className="inline-flex items-center justify-center w-full px-6 py-3 bg-white text-red-600 font-semibold rounded-xl hover:bg-red-50 transition-colors"
            >
              Get Started
              <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>

        {/* Quick Actions Grid */}
        <div className="mb-12">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              href="/agreements/visual/create"
              className="group bg-white rounded-xl p-6 border-2 border-gray-200 hover:border-red-600 transition-all hover:shadow-md"
            >
              <div className="w-10 h-10 rounded-lg bg-red-50 group-hover:bg-red-100 flex items-center justify-center mb-4 transition-colors">
                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <div className="font-semibold text-gray-900 mb-1">New Agreement</div>
              <div className="text-sm text-gray-600">Start from a template</div>
            </Link>

            <Link
              href="/templates"
              className="group bg-white rounded-xl p-6 border-2 border-gray-200 hover:border-red-600 transition-all hover:shadow-md"
            >
              <div className="w-10 h-10 rounded-lg bg-blue-50 group-hover:bg-blue-100 flex items-center justify-center mb-4 transition-colors">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
              </div>
              <div className="font-semibold text-gray-900 mb-1">Browse Templates</div>
              <div className="text-sm text-gray-600">View all available templates</div>
            </Link>

            <Link
              href="/templates/visual/upload"
              className="group bg-white rounded-xl p-6 border-2 border-gray-200 hover:border-red-600 transition-all hover:shadow-md"
            >
              <div className="w-10 h-10 rounded-lg bg-green-50 group-hover:bg-green-100 flex items-center justify-center mb-4 transition-colors">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <div className="font-semibold text-gray-900 mb-1">Upload Template</div>
              <div className="text-sm text-gray-600">Add a new DOCX template</div>
            </Link>

            <Link
              href="/agreements"
              className="group bg-white rounded-xl p-6 border-2 border-gray-200 hover:border-red-600 transition-all hover:shadow-md"
            >
              <div className="w-10 h-10 rounded-lg bg-purple-50 group-hover:bg-purple-100 flex items-center justify-center mb-4 transition-colors">
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <div className="font-semibold text-gray-900 mb-1">Search Agreements</div>
              <div className="text-sm text-gray-600">Find past agreements</div>
            </Link>
          </div>
        </div>

        {/* Help Section */}
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-8 text-white">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
            <div className="mb-6 md:mb-0">
              <h3 className="text-2xl font-bold mb-2">Need help getting started?</h3>
              <p className="text-gray-300">
                Learn how to upload templates, configure fields, and generate agreements
              </p>
            </div>
            <button className="px-8 py-3 bg-white text-gray-900 font-semibold rounded-xl hover:bg-gray-100 transition-colors whitespace-nowrap">
              View Guide
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
