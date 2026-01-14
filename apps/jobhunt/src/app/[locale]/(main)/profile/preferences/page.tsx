'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { createClient } from '@bkamp/supabase/client';
import { GlobeAltIcon, TagIcon, LanguageIcon } from '@heroicons/react/24/outline';

const COUNTRIES = [
  { code: 'worldwide', label: 'Worldwide', labelKo: '전세계' },
  { code: 'us', label: 'United States', labelKo: '미국' },
  { code: 'eu', label: 'Europe', labelKo: '유럽' },
  { code: 'uk', label: 'United Kingdom', labelKo: '영국' },
  { code: 'asia', label: 'Asia', labelKo: '아시아' },
  { code: 'korea', label: 'Korea', labelKo: '한국' },
];

const CATEGORIES = [
  { code: 'dev', label: 'Development', labelKo: '개발' },
  { code: 'design', label: 'Design', labelKo: '디자인' },
  { code: 'marketing', label: 'Marketing', labelKo: '마케팅' },
  { code: 'sales', label: 'Sales', labelKo: '세일즈' },
  { code: 'support', label: 'Customer Support', labelKo: '고객지원' },
  { code: 'data', label: 'Data & Analytics', labelKo: '데이터/분석' },
  { code: 'writing', label: 'Writing & Content', labelKo: '콘텐츠/라이팅' },
  { code: 'other', label: 'Other', labelKo: '기타' },
];

const LOCALES = [
  { code: 'en', label: 'English' },
  { code: 'ko', label: '한국어' },
];

export default function PreferencesPage() {
  const t = useTranslations('preferences');
  const tc = useTranslations('common');
  const router = useRouter();

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preferences, setPreferences] = useState({
    countries: [] as string[],
    categories: [] as string[],
    preferredLocale: 'en',
    roles: '',
    salaryMin: '',
    salaryMax: '',
    workTypes: [] as string[],
    contractTypes: [] as string[],
    minFitScore: 70,
  });

  // Load existing preferences
  useEffect(() => {
    const loadPreferences = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Load from jobhunt_profiles
      const { data: profile } = await supabase
        .from('jobhunt_profiles')
        .select('countries, categories, preferred_locale')
        .eq('user_id', user.id)
        .single();

      // Load from jobhunt_preferences
      const { data: prefs } = await supabase
        .from('jobhunt_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (profile) {
        setPreferences(prev => ({
          ...prev,
          countries: profile.countries || [],
          categories: profile.categories || [],
          preferredLocale: profile.preferred_locale || 'en',
        }));
      }

      if (prefs) {
        setPreferences(prev => ({
          ...prev,
          roles: prefs.desired_roles?.join(', ') || '',
          salaryMin: prefs.desired_salary_min?.toString() || '',
          salaryMax: prefs.desired_salary_max?.toString() || '',
          workTypes: prefs.work_types || [],
          contractTypes: prefs.contract_types || [],
          minFitScore: prefs.min_fit_score || 70,
        }));
      }
    };

    loadPreferences();
  }, []);

  const handleToggle = (field: 'countries' | 'categories' | 'workTypes' | 'contractTypes', value: string) => {
    setPreferences((prev) => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter((v) => v !== value)
        : [...prev[field], value],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('Please login first');
      }

      // Update jobhunt_profiles
      const { error: profileError } = await supabase
        .from('jobhunt_profiles')
        .upsert({
          user_id: user.id,
          countries: preferences.countries,
          categories: preferences.categories,
          preferred_locale: preferences.preferredLocale,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id' });

      if (profileError) {
        throw profileError;
      }

      // Update jobhunt_preferences
      const { error: prefsError } = await supabase
        .from('jobhunt_preferences')
        .upsert({
          user_id: user.id,
          desired_roles: preferences.roles.split(',').map(r => r.trim()).filter(Boolean),
          desired_salary_min: preferences.salaryMin ? parseInt(preferences.salaryMin) : null,
          desired_salary_max: preferences.salaryMax ? parseInt(preferences.salaryMax) : null,
          work_types: preferences.workTypes,
          contract_types: preferences.contractTypes,
          min_fit_score: preferences.minFitScore,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id' });

      if (prefsError) {
        throw prefsError;
      }

      // Redirect to preferred locale dashboard
      const locale = preferences.preferredLocale;
      router.push(`/${locale}/dashboard`);
    } catch (err: any) {
      setError(err.message || 'Failed to save preferences');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">{t('title')}</h1>
        <p className="text-gray-600 mt-1">{t('subtitle')}</p>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-600 mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Countries */}
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-4">
            <GlobeAltIcon className="w-5 h-5 text-primary-600" />
            <label className="font-semibold text-gray-900">Working Regions</label>
          </div>
          <p className="text-sm text-gray-500 mb-4">Select regions where you want to work</p>
          <div className="flex flex-wrap gap-2">
            {COUNTRIES.map((country) => (
              <button
                key={country.code}
                type="button"
                onClick={() => handleToggle('countries', country.code)}
                className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                  preferences.countries.includes(country.code)
                    ? 'bg-primary-600 text-white border-primary-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                {country.label}
              </button>
            ))}
          </div>
        </div>

        {/* Categories */}
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-4">
            <TagIcon className="w-5 h-5 text-primary-600" />
            <label className="font-semibold text-gray-900">Job Categories</label>
          </div>
          <p className="text-sm text-gray-500 mb-4">Select job categories you're interested in</p>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((category) => (
              <button
                key={category.code}
                type="button"
                onClick={() => handleToggle('categories', category.code)}
                className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                  preferences.categories.includes(category.code)
                    ? 'bg-primary-600 text-white border-primary-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>

        {/* Language */}
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-4">
            <LanguageIcon className="w-5 h-5 text-primary-600" />
            <label className="font-semibold text-gray-900">Preferred Language</label>
          </div>
          <p className="text-sm text-gray-500 mb-4">Select your preferred language for the app</p>
          <div className="flex gap-2">
            {LOCALES.map((locale) => (
              <button
                key={locale.code}
                type="button"
                onClick={() => setPreferences({ ...preferences, preferredLocale: locale.code })}
                className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                  preferences.preferredLocale === locale.code
                    ? 'bg-primary-600 text-white border-primary-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                {locale.label}
              </button>
            ))}
          </div>
        </div>

        {/* Job Preferences */}
        <div className="card p-6 space-y-6">
          <h2 className="font-semibold text-gray-900">Job Matching Preferences</h2>

          {/* Desired Roles */}
          <div>
            <label htmlFor="roles" className="label">{t('roles')}</label>
            <input
              id="roles"
              type="text"
              value={preferences.roles}
              onChange={(e) => setPreferences({ ...preferences, roles: e.target.value })}
              className="input"
              placeholder={t('rolesPlaceholder')}
            />
            <p className="text-xs text-gray-500 mt-1">Separate multiple roles with commas</p>
          </div>

          {/* Hourly Rate Range */}
          <div>
            <label className="label">{t('salary')} (USD/hr)</label>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <input
                  type="number"
                  value={preferences.salaryMin}
                  onChange={(e) => setPreferences({ ...preferences, salaryMin: e.target.value })}
                  className="input"
                  placeholder={t('salaryMin')}
                  min="0"
                />
              </div>
              <span className="text-gray-400">-</span>
              <div className="flex-1">
                <input
                  type="number"
                  value={preferences.salaryMax}
                  onChange={(e) => setPreferences({ ...preferences, salaryMax: e.target.value })}
                  className="input"
                  placeholder={t('salaryMax')}
                  min="0"
                />
              </div>
            </div>
          </div>

          {/* Work Type */}
          <div>
            <label className="label">{t('workType')}</label>
            <div className="flex flex-wrap gap-2">
              {['remote', 'hybrid', 'onsite'].map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => handleToggle('workTypes', type)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                    preferences.workTypes.includes(type)
                      ? 'bg-primary-600 text-white border-primary-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {t(type)}
                </button>
              ))}
            </div>
          </div>

          {/* Contract Type */}
          <div>
            <label className="label">{t('contractType')}</label>
            <div className="flex flex-wrap gap-2">
              {['fulltime', 'contract', 'freelance'].map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => handleToggle('contractTypes', type)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                    preferences.contractTypes.includes(type)
                      ? 'bg-primary-600 text-white border-primary-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {t(type)}
                </button>
              ))}
            </div>
          </div>

          {/* Min Fit Score */}
          <div>
            <label className="label">
              {t('minFitScore')}: <span className="text-primary-600 font-bold">{preferences.minFitScore}%</span>
            </label>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={preferences.minFitScore}
              onChange={(e) => setPreferences({ ...preferences, minFitScore: parseInt(e.target.value) })}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>0%</span>
              <span>50%</span>
              <span>100%</span>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end gap-3">
          <button type="button" className="btn-secondary" onClick={() => router.back()}>
            {tc('cancel')}
          </button>
          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? 'Saving...' : t('save')}
          </button>
        </div>
      </form>
    </div>
  );
}
