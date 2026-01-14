'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  ClockIcon,
  CheckIcon,
  ArrowPathIcon,
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

function formatBudget(min: number | null, max: number | null, type: string | null): string {
  if (!min && !max) return 'Budget not specified';
  if (min && max && min !== max) {
    return `$${min}-$${max}${type === 'hourly' ? '/hr' : ''}`;
  }
  return `$${min || max}${type === 'hourly' ? '/hr' : ''}`;
}

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffHours < 1) return 'Just now';
  if (diffHours < 24) return `${diffHours} hours ago`;
  if (diffDays === 1) return '1 day ago';
  return `${diffDays} days ago`;
}

export default function JobsPage() {
  const t = useTranslations('jobs');
  const tc = useTranslations('common');
  const [search, setSearch] = useState('');
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [applyingJobId, setApplyingJobId] = useState<string | null>(null);
  const [appliedJobs, setAppliedJobs] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await fetch('/api/jobs?limit=20');
        if (res.ok) {
          const data = await res.json();
          setJobs(data.jobs || []);
          setTotal(data.pagination?.total || 0);
        }
      } catch (error) {
        console.error('Failed to fetch jobs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  const handleApply = async (jobId: string) => {
    setApplyingJobId(jobId);

    try {
      const res = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId, generateCover: true }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || '지원에 실패했습니다.');
      }

      setAppliedJobs((prev) => {
        const next = new Set(prev);
        next.add(jobId);
        return next;
      });

      if (data.externalUrl) {
        window.open(data.externalUrl, '_blank');
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setApplyingJobId(null);
    }
  };

  const filteredJobs = jobs.filter(
    (job) =>
      job.title.toLowerCase().includes(search.toLowerCase()) ||
      job.skills_required?.some((skill) => skill.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">{tc('jobs')}</h1>
        <p className="text-gray-600 mt-1">Browse all available job opportunities</p>
      </div>

      {/* Search & Filters */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex-1 relative">
          <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input pl-10"
            placeholder="Search jobs or skills..."
          />
        </div>
        <button className="btn-secondary">
          <FunnelIcon className="w-5 h-5 mr-2" />
          Filters
        </button>
      </div>

      {/* Results Count */}
      <p className="text-sm text-gray-500 mb-4">
        {filteredJobs.length} jobs found (Total: {total})
      </p>

      {/* Loading */}
      {loading && (
        <div className="text-center py-12">
          <ArrowPathIcon className="w-8 h-8 animate-spin text-gray-400 mx-auto" />
          <p className="text-gray-500 mt-2">Loading jobs...</p>
        </div>
      )}

      {/* No Jobs */}
      {!loading && filteredJobs.length === 0 && (
        <div className="text-center py-12 card">
          <p className="text-gray-500">No jobs found. Try a different search or check back later.</p>
        </div>
      )}

      {/* Job List */}
      <div className="space-y-4">
        {filteredJobs.map((job) => (
          <div key={job.id} className="card p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="badge-primary">{job.platform}</span>
                  <span className="flex items-center text-gray-400 text-sm">
                    <ClockIcon className="w-4 h-4 mr-1" />
                    {formatTimeAgo(job.created_at)}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 hover:text-primary-600 cursor-pointer">
                  {job.title}
                </h3>
                {job.description && (
                  <p className="text-gray-500 text-sm mt-2 line-clamp-2">{job.description}</p>
                )}
                <div className="flex flex-wrap gap-2 mt-3">
                  {job.skills_required?.slice(0, 6).map((skill) => (
                    <span key={skill} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-lg font-semibold text-gray-900">
                  {formatBudget(job.salary_min, job.salary_max, job.salary_type)}
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
              <button
                onClick={() => job.external_url && window.open(job.external_url, '_blank')}
                className="btn-ghost text-sm"
              >
                {t('viewDetails')}
              </button>
              <div className="flex items-center gap-2">
                {appliedJobs.has(job.id) ? (
                  <button className="btn-primary text-sm bg-green-600 hover:bg-green-700 flex items-center gap-1" disabled>
                    <CheckIcon className="w-4 h-4" />
                    지원완료
                  </button>
                ) : (
                  <button
                    onClick={() => handleApply(job.id)}
                    disabled={applyingJobId === job.id}
                    className="btn-primary text-sm"
                  >
                    {applyingJobId === job.id ? '지원 중...' : t('apply')}
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
