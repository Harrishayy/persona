import Link from 'next/link';
import { withAuth, getSignUpUrl } from '@workos-inc/authkit-nextjs';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Gamepad2, Plus, LogIn } from 'lucide-react';

export default async function HomePage() {
  const { user } = await withAuth();
  const signUpUrl = await getSignUpUrl();

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white p-4">
        <Card variant="purple" className="max-w-md w-full text-center text-white">
          <div className="mb-6">
            <Gamepad2 className="w-16 h-16 mx-auto mb-4" />
            <h1 className="text-5xl font-black mb-2">
              Quiz Fun
            </h1>
            <p className="text-lg font-bold opacity-90">
              Create and play interactive quizzes with friends!
            </p>
          </div>
          <div className="space-y-3">
            <Link href="/join">
              <Button variant="success" className="w-full" size="lg">
                <Gamepad2 className="w-5 h-5 mr-2" />
                Join Quiz
              </Button>
            </Link>
            <Link href="/auth/login">
              <Button variant="secondary" className="w-full" size="lg">
                <LogIn className="w-5 h-5 mr-2" />
                Sign In
              </Button>
            </Link>
            <Link href={signUpUrl}>
              <Button variant="warning" className="w-full" size="lg">
                Sign Up
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-6xl font-black text-black mb-2">
            Welcome back{user.firstName && `, ${user.firstName}`}!
          </h1>
          <p className="text-2xl font-bold text-black opacity-80">
            Ready to quiz?
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card variant="pink" className="text-center text-white">
            <Gamepad2 className="w-12 h-12 mx-auto mb-4" />
            <h2 className="text-3xl font-black mb-4">
              Join a Quiz
            </h2>
            <p className="text-lg font-bold opacity-90 mb-6">
              Enter the code to join a live quiz session
            </p>
            <Link href="/join">
              <Button variant="success" className="w-full" size="lg">
                Join Quiz
              </Button>
            </Link>
          </Card>

          <Card variant="blue" className="text-center text-white">
            <Plus className="w-12 h-12 mx-auto mb-4" />
            <h2 className="text-3xl font-black mb-4">
              Create a Quiz
            </h2>
            <p className="text-lg font-bold opacity-90 mb-6">
              Build your own quiz with templates and share it with friends
            </p>
            <Link href="/create">
              <Button variant="warning" className="w-full" size="lg">
                Create Quiz
              </Button>
            </Link>
          </Card>
        </div>
      </div>
    </div>
  );
}
