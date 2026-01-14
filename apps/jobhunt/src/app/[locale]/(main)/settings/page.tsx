'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { createClient } from '@bkamp/supabase/client';
import { BellIcon, EnvelopeIcon, TrashIcon } from '@heroicons/react/24/outline';

export default function SettingsPage() {
  const tc = useTranslations('common');
  const t = useTranslations('settings');
  const router = useRouter();

  const [settings, setSettings] = useState({
    emailAlerts: true,
    alertFrequency: 'realtime',
    minFitScore: 70,
  });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Save to Supabase
    console.log('Settings:', settings);
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      const supabase = createClient();
      const { data: { user: authUser } } = await supabase.auth.getUser();

      if (authUser) {
        await supabase.from('jobhunt_applications').delete().eq('user_id', authUser.id);
        await supabase.from('jobhunt_matches').delete().eq('user_id', authUser.id);
        await supabase.from('jobhunt_preferences').delete().eq('user_id', authUser.id);
        await supabase.from('jobhunt_profiles').delete().eq('user_id', authUser.id);
        await supabase.from('jobhunt_resumes').delete().eq('user_id', authUser.id);
        await supabase.auth.signOut();
      }

      router.push('/login');
    } catch (error) {
      console.error('Failed to delete account:', error);
      alert(t('deleteAccountFailed'));
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const frequencyOptions = [
    { value: 'realtime', label: t('realtime'), description: t('realtimeDesc') },
    { value: 'daily', label: t('daily'), description: t('dailyDesc') },
    { value: 'weekly', label: t('weekly'), description: t('weeklyDesc') },
  ];

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">{tc('settings')}</h1>
        <p className="text-gray-600 mt-1">{t('subtitle')}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Email Alerts */}
        <div className="card p-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <EnvelopeIcon className="w-5 h-5 text-primary-600" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">{t('emailAlerts')}</h3>
                  <p className="text-sm text-gray-500 mt-1">{t('emailAlertsDesc')}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setSettings({ ...settings, emailAlerts: !settings.emailAlerts })}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-600 focus:ring-offset-2 ${
                    settings.emailAlerts ? 'bg-primary-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      settings.emailAlerts ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Alert Frequency */}
        <div className="card p-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <BellIcon className="w-5 h-5 text-primary-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-gray-900 mb-3">{t('alertFrequency')}</h3>
              <div className="space-y-2">
                {frequencyOptions.map((option) => (
                  <label
                    key={option.value}
                    className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer border transition-colors ${
                      settings.alertFrequency === option.value
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="frequency"
                      value={option.value}
                      checked={settings.alertFrequency === option.value}
                      onChange={(e) => setSettings({ ...settings, alertFrequency: e.target.value })}
                      className="w-4 h-4 text-primary-600 focus:ring-primary-500"
                    />
                    <div>
                      <p className="font-medium text-gray-900">{option.label}</p>
                      <p className="text-sm text-gray-500">{option.description}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Min Fit Score for Alerts */}
        <div className="card p-6">
          <h3 className="font-medium text-gray-900 mb-3">
            {t('minFitScore')}: <span className="text-primary-600">{settings.minFitScore}%</span>
          </h3>
          <p className="text-sm text-gray-500 mb-4">{t('minFitScoreDesc')}</p>
          <input
            type="range"
            min="0"
            max="100"
            step="5"
            value={settings.minFitScore}
            onChange={(e) => setSettings({ ...settings, minFitScore: parseInt(e.target.value) })}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>0%</span>
            <span>50%</span>
            <span>100%</span>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button type="submit" className="btn-primary">
            {tc('save')}
          </button>
        </div>
      </form>

      {/* Danger Zone */}
      <div className="mt-12 pt-8 border-t border-gray-200">
        <h2 className="text-lg font-semibold text-red-600 mb-4">{t('dangerZone')}</h2>
        <div className="card p-6 border-red-200">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <TrashIcon className="w-5 h-5 text-red-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-gray-900">{t('deleteAccount')}</h3>
              <p className="text-sm text-gray-500 mt-1 mb-4">{t('deleteAccountDesc')}</p>
              <button
                type="button"
                onClick={() => setShowDeleteModal(true)}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
              >
                {t('deleteAccount')}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('deleteAccount')}</h3>
            <p className="text-gray-600 mb-6">{t('deleteAccountConfirm')}</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="btn-secondary"
                disabled={deleting}
              >
                {tc('cancel')}
              </button>
              <button
                onClick={handleDeleteAccount}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50"
                disabled={deleting}
              >
                {deleting ? t('deleting') : t('deleteAccount')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
