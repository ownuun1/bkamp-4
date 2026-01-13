import { SignupForm } from '@/components/auth/signup-form';

export const dynamic = 'force-dynamic';

export default function SignupPage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background to-muted">
      <SignupForm />
    </main>
  );
}
