'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  EnvelopeIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';

interface Application {
  id: string;
  job_id: string;
  status: string;
  applied_at: string;
  cover_letter: string | null;
  job: {
    id: string;
    title: string;
    company_name: string | null;
    external_url: string | null;
  } | null;
}

type Status = 'submitted' | 'viewed' | 'interviewing' | 'offered' | 'rejected' | 'accepted';

const statusIcons: Record<Status, typeof ClockIcon> = {
  submitted: ClockIcon,
  viewed: EnvelopeIcon,
  interviewing: CheckCircleIcon,
  offered: CheckCircleIcon,
  rejected: XCircleIcon,
  accepted: CheckCircleIcon,
};

const statusColors: Record<Status, string> = {
  submitted: 'bg-gray-100 text-gray-800',
  viewed: 'bg-blue-100 text-blue-800',
  interviewing: 'bg-green-100 text-green-800',
  offered: 'bg-purple-100 text-purple-800',
  rejected: 'bg-red-100 text-red-800',
  accepted: 'bg-green-100 text-green-800',
};

function StatusBadge({ status, label }: { status: string; label: string }) {
  const validStatus = (statusIcons[status as Status] ? status : 'submitted') as Status;
  const Icon = statusIcons[validStatus];
  const color = statusColors[validStatus];

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-sm font-medium ${color}`}>
      <Icon className="w-4 h-4 mr-1" />
      {label}
    </span>
  );
}

export default function ApplicationsPage() {
  const t = useTranslations('applications');
  const tj = useTranslations('jobs');
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const res = await fetch('/api/applications');
        if (res.ok) {
          const data = await res.json();
          setApplications(data.applications || []);
        }
      } catch (error) {
        console.error('Failed to fetch applications:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, []);

  const getStatusLabel = (status: string) => {
    const validStatus = (statusIcons[status as Status] ? status : 'submitted') as Status;
    return t(`status.${validStatus}`);
  };

  const stats = {
    total: applications.length,
    inProgress: applications.filter((a) => ['submitted', 'viewed'].includes(a.status)).length,
    interview: applications.filter((a) => a.status === 'interviewing').length,
    rejected: applications.filter((a) => a.status === 'rejected').length,
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">{t('title')}</h1>
        <p className="text-gray-600 mt-1">{t('subtitle')}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: t('status.submitted'), value: stats.total, color: 'text-gray-900' },
          { label: t('status.viewed'), value: stats.inProgress, color: 'text-blue-600' },
          { label: t('status.interviewing'), value: stats.interview, color: 'text-green-600' },
          { label: t('status.rejected'), value: stats.rejected, color: 'text-red-600' },
        ].map((stat, idx) => (
          <div key={idx} className="card p-4">
            <p className="text-sm text-gray-500">{stat.label}</p>
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Loading */}
      {loading && (
        <div className="text-center py-12">
          <ArrowPathIcon className="w-8 h-8 animate-spin text-gray-400 mx-auto" />
          <p className="text-gray-500 mt-2">{t('loading')}</p>
        </div>
      )}

      {/* No Applications */}
      {!loading && applications.length === 0 && (
        <div className="text-center py-12 card">
          <p className="text-gray-500">{t('noApplications')}</p>
          <p className="text-gray-400 text-sm mt-1">{t('noApplicationsHint')}</p>
        </div>
      )}

      {/* Applications Table */}
      {!loading && applications.length > 0 && (
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {tj('title')}
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {tj('postedAt')}
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {applications.map((app) => (
                <tr key={app.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-gray-900">{app.job?.title || 'Unknown Job'}</p>
                      <p className="text-sm text-gray-500">{app.job?.company_name || 'Unknown Company'}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(app.applied_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={app.status} label={getStatusLabel(app.status)} />
                  </td>
                  <td className="px-6 py-4 text-right">
                    {app.job?.external_url && (
                      <button
                        onClick={() => window.open(app.job?.external_url || '', '_blank')}
                        className="btn-ghost text-sm"
                      >
                        {tj('viewDetails')}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
