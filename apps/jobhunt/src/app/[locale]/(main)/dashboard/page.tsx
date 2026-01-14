'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import {
  DocumentPlusIcon,
  ClockIcon,
  ArrowPathIcon,
  CheckIcon,
} from '@heroicons/react/24/outline';

interface Job {
  id: string;
  title: string;
  platform: string;
  external_url: string | null;
  salary_min: number | null;
  salary_max: number | null;
  salary_type: string | null;
  skills_required: string[] | null;
  created_at: string;
  description: string | null;
}

interface Match {
  id: string;
  job_id: string;
  fit_score: number;
  status: string;
  job: Job;
}

// Auto sync jobs on page load (throttled to once per 30 minutes)
function useAutoSync() {
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<string | null>(null);

  useEffect(() => {
    const SYNC_INTERVAL = 30 * 60 * 1000; // 30 minutes
    const lastSyncTime = localStorage.getItem('jobhunt_last_sync');
    const now = Date.now();

    if (lastSyncTime) {
      setLastSync(lastSyncTime);
    }

    // Skip if synced recently
    if (lastSyncTime && now - parseInt(lastSyncTime) < SYNC_INTERVAL) {
      return;
    }

    const runSync = async () => {
      setIsSyncing(true);
      try {
        // Sync jobs from Upwork
        await fetch('/api/jobs/sync', { method: 'POST' });
        // Run matching for current user
        await fetch('/api/jobs/match-all', { method: 'POST' });

        const syncTime = Date.now().toString();
        localStorage.setItem('jobhunt_last_sync', syncTime);
        setLastSync(syncTime);
      } catch (error) {
        console.error('Auto sync failed:', error);
      } finally {
        setIsSyncing(false);
      }
    };

    runSync();
  }, []);

  return { isSyncing, lastSync };
}

function formatBudget(min: number | null, max: number | null, type: string | null, fallback: string): string {
  if (!min && !max) return fallback;
  if (min && max && min !== max) {
    return `$${min}-$${max}${type === 'hourly' ? '/hr' : ''}`;
  }
  return `$${min || max}${type === 'hourly' ? '/hr' : ''}`;
}

function formatTimeAgo(
  dateString: string,
  translations: { justNow: string; hoursAgo: string; dayAgo: string; daysAgo: string }
): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffHours < 1) return translations.justNow;
  if (diffHours < 24) return translations.hoursAgo.replace('{count}', String(diffHours));
  if (diffDays === 1) return translations.dayAgo;
  return translations.daysAgo.replace('{count}', String(diffDays));
}

function FitScoreBadge({ score }: { score: number }) {
  const getColor = () => {
    if (score >= 90) return 'bg-green-100 text-green-800';
    if (score >= 70) return 'bg-blue-100 text-blue-800';
    if (score >= 50) return 'bg-yellow-100 text-yellow-800';
    return 'bg-gray-100 text-gray-800';
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-sm font-semibold ${getColor()}`}>
      {score}%
    </span>
  );
}

export default function DashboardPage() {
  const t = useTranslations('dashboard');
  const tj = useTranslations('jobs');
  const { isSyncing } = useAutoSync();
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [applyingJobId, setApplyingJobId] = useState<string | null>(null);
  const [appliedJobs, setAppliedJobs] = useState<Set<string>>(new Set());
  const [applyError, setApplyError] = useState<string | null>(null);
  const [hasResume, setHasResume] = useState(false);

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const res = await fetch('/api/jobs/matched?limit=10');
        if (res.ok) {
          const data = await res.json();
          setMatches(data.matches || []);
        }
      } catch (error) {
        console.error('Failed to fetch matches:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
  }, [isSyncing]);

  const handleApply = async (jobId: string) => {
    setApplyingJobId(jobId);
    setApplyError(null);

    try {
      const res = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId, generateCover: true }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error);
      }

      setAppliedJobs((prev) => {
        const next = new Set(prev);
        next.add(jobId);
        return next;
      });

      // Open external URL if available
      if (data.externalUrl) {
        window.open(data.externalUrl, '_blank');
      }
    } catch (err: any) {
      setApplyError(err.message);
    } finally {
      setApplyingJobId(null);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('title')}</h1>
          <p className="text-gray-600 mt-1">{t('subtitle')}</p>
        </div>
        {isSyncing && (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <ArrowPathIcon className="w-4 h-4 animate-spin" />
            <span>{t('syncing')}</span>
          </div>
        )}
      </div>

      {/* No Resume Banner */}
      {!hasResume && (
        <div className="card p-6 mb-8 bg-primary-50 border-primary-200">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <DocumentPlusIcon className="w-6 h-6 text-primary-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900">{t('noMatches')}</h3>
              <p className="text-gray-600 mt-1 text-sm">
                {t('noMatchesDesc')}
              </p>
              <Link href="/profile/resume" className="btn-primary mt-4 inline-flex">
                {t('uploadResume')}
              </Link>
            </div>
          </div>
        </div>
      )}

      {applyError && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-600 mb-4">
          {applyError}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="text-center py-12">
          <ArrowPathIcon className="w-8 h-8 animate-spin text-gray-400 mx-auto" />
          <p className="text-gray-500 mt-2">{t('loading')}</p>
        </div>
      )}

      {/* No Jobs */}
      {!loading && matches.length === 0 && (
        <div className="text-center py-12 card">
          <p className="text-gray-500">{t('noJobsYet')}</p>
        </div>
      )}

      {/* Job Cards */}
      <div className="space-y-4">
        {matches.map((match) => (
          <div key={match.id} className="card p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="badge-primary">{match.job.platform}</span>
                  <span className="flex items-center text-gray-400 text-sm">
                    <ClockIcon className="w-4 h-4 mr-1" />
                    {formatTimeAgo(match.job.created_at, {
                      justNow: t('justNow'),
                      hoursAgo: t('hoursAgo'),
                      dayAgo: t('dayAgo'),
                      daysAgo: t('daysAgo'),
                    })}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 hover:text-primary-600 cursor-pointer">
                  {match.job.title}
                </h3>
                <div className="flex flex-wrap gap-2 mt-3">
                  {match.job.skills_required?.slice(0, 5).map((skill) => (
                    <span key={skill} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm text-gray-500">{tj('fitScore')}</span>
                  <FitScoreBadge score={match.fit_score} />
                </div>
                <p className="text-lg font-semibold text-gray-900">
                  {formatBudget(match.job.salary_min, match.job.salary_max, match.job.salary_type, t('budgetNotSpecified'))}
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
              <button
                onClick={() => match.job.external_url && window.open(match.job.external_url, '_blank')}
                className="btn-ghost text-sm"
              >
                {tj('viewDetails')}
              </button>
              <div className="flex items-center gap-2">
                {appliedJobs.has(match.job_id) || match.status === 'applied' ? (
                  <button className="btn-primary text-sm bg-green-600 hover:bg-green-700 flex items-center gap-1" disabled>
                    <CheckIcon className="w-4 h-4" />
                    {t('applied')}
                  </button>
                ) : (
                  <button
                    onClick={() => handleApply(match.job_id)}
                    disabled={applyingJobId === match.job_id}
                    className="btn-primary text-sm"
                  >
                    {applyingJobId === match.job_id ? t('applying') : tj('apply')}
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
