'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@bkamp/supabase/client';
import {
  HomeIcon,
  UserCircleIcon,
  BriefcaseIcon,
  PaperAirplaneIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  LanguageIcon,
} from '@heroicons/react/24/outline';

const LOCALES = [
  { code: 'en', label: 'EN' },
  { code: 'ko', label: 'KO' },
];

const navigation = [
  { name: 'dashboard', href: '/dashboard', icon: HomeIcon },
  { name: 'profile', href: '/profile', icon: UserCircleIcon },
  { name: 'jobs', href: '/jobs', icon: BriefcaseIcon },
  { name: 'applications', href: '/applications', icon: PaperAirplaneIcon },
  { name: 'settings', href: '/settings', icon: Cog6ToothIcon },
];

interface User {
  email: string;
  name: string;
}

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const t = useTranslations('common');
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const loadUser = async () => {
      const supabase = createClient();
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (authUser) {
        setUser({
          email: authUser.email || '',
          name: authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'User',
        });
      }
    };
    loadUser();
  }, []);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center gap-2 h-16 px-6 border-b border-gray-200">
            <img src="/logo.png" alt="JobHunt" className="w-8 h-8" />
            <span className="text-xl font-bold text-gray-900">{t('appName')}</span>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = pathname.includes(item.href);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <item.icon className={`w-5 h-5 ${isActive ? 'text-primary-600' : 'text-gray-400'}`} />
                  {t(item.name)}
                </Link>
              );
            })}
          </nav>

          {/* Language Switcher */}
          <div className="px-3 py-2 border-t border-gray-200">
            <div className="flex items-center gap-2 px-3 py-2">
              <LanguageIcon className="w-5 h-5 text-gray-400" />
              <div className="flex gap-1">
                {LOCALES.map((locale) => {
                  const segments = pathname.split('/');
                  const currentLocale = segments[1] || 'en';
                  const isActive = currentLocale === locale.code;
                  return (
                    <button
                      key={locale.code}
                      onClick={() => {
                        if (isActive) return;
                        const pathSegments = pathname.split('/');
                        pathSegments[1] = locale.code;
                        // Ensure there's a page path after locale, default to dashboard
                        const pagePath = pathSegments.slice(2).join('/');
                        const newPath = pagePath ? `/${locale.code}/${pagePath}` : `/${locale.code}/dashboard`;
                        router.push(newPath);
                      }}
                      className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                        isActive
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {locale.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* User & Actions */}
          <div className="p-3 border-t border-gray-200">
            <div className="flex items-center gap-3 px-3 py-2">
              <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                <UserCircleIcon className="w-5 h-5 text-gray-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{user?.name || 'Loading...'}</p>
                <p className="text-xs text-gray-500 truncate">{user?.email || ''}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-3 py-2 mt-1 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <ArrowRightOnRectangleIcon className="w-5 h-5 text-gray-400" />
              {t('logout')}
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64">
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
