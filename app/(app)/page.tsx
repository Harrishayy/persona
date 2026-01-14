import Link from 'next/link';
import { withAuth, getSignUpUrl } from '@workos-inc/authkit-nextjs';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ColorblockTitle } from '@/components/ui/ColorblockTitle';
import { Gamepad2, Plus, LogIn, List, User, ChartColumn, Settings } from 'lucide-react';
import { getUniqueColors, hexColorsToVariants } from '@/lib/utils/colors';

export default async function HomePage() {
  const { user } = await withAuth();
  const signUpUrl = await getSignUpUrl();

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center colorblock-bg-pattern p-4 py-8"
      >
        <Card variant="purple" className="max-w-md w-full text-center">
          <div className="mb-8">
            <Gamepad2 className="w-20 h-20 mx-auto mb-6" />
            <div className="mb-4 flex justify-center">
              <ColorblockTitle />
            </div>
            <p className="text-xl font-bold opacity-90">
              Create and play interactive quizzes with friends!
            </p>
          </div>
          <div className="flex flex-col gap-4">
            <Link href="/join">
              <Button variant="success" className="w-full" size="lg">
                <Gamepad2 className="w-5 h-5 mr-2" />
                Join Quiz
              </Button>
            </Link>
            <Link href="/auth/login" prefetch={false}>
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
    // Get unique colors for the cards
    const uiColors = getUniqueColors(12);
    const variants = hexColorsToVariants(uiColors);

    const cardColor1 = variants[0] || 'pink';
    const cardColor2 = variants[1] || 'blue';
    const cardColor3 = variants[2] || 'yellow';
    const cardColor4 = variants[3] || 'green';
    const cardColor5 = variants[4] || 'orange';
    const cardColor6 = variants[5] || 'red';
    const btnColor1 = variants[6] || 'green';
    const btnColor2 = variants[7] || 'orange';
    const btnColor3 = variants[8] || 'purple';
    const btnColor4 = variants[9] || 'red';
    const btnColor5 = variants[10] || 'purple';
    const btnColor6 = variants[11] || 'red';
  return (
    <div className="min-h-screen colorblock-bg-pattern p-4 py-12"
    >
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-6xl font-black text-[#1F2937] mb-4">
            Welcome back{user.firstName && `, ${user.firstName}`}!
          </h1>
          <p className="text-2xl font-bold text-[#1F2937] opacity-80">
            Ready to quiz? 
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-8 items-stretch">
          <Card variant={cardColor1} className="text-center flex flex-col">
            <Gamepad2 className="w-14 h-14 mx-auto mb-5 flex-shrink-0" />
            <h2 className="text-3xl font-black mb-4">
              Join a Quiz
            </h2>
            <p className="text-lg font-bold opacity-90 flex-grow mb-4">
              Enter the code to join a live quiz session
            </p>
            <Link href="/join">
              <Button color={btnColor1} className="w-full" size="lg">
                Join Quiz
              </Button>
            </Link>
          </Card>

          <Card variant={cardColor2} className="text-center flex flex-col">
            <Plus className="w-14 h-14 mx-auto mb-5 flex-shrink-0" />
            <h2 className="text-3xl font-black mb-4">
              Create a Quiz
            </h2>
            <p className="text-lg font-bold opacity-90 flex-grow mb-4">
              Build your own quiz with templates and share it with friends
            </p>
            <div className="mt-auto pt-4">
              <Link href="/create">
                <Button color={btnColor2} className="w-full" size="lg">
                  Create Quiz
                </Button>
              </Link>
            </div>
          </Card>

          <Card variant={cardColor3} className="text-center flex flex-col">
            <List className="w-14 h-14 mx-auto mb-5 flex-shrink-0" />
            <h2 className="text-3xl font-black mb-4">
              Find a Quiz
            </h2>
            <p className="text-lg font-bold opacity-90 flex-grow mb-4">
              Find a quiz to join or create
            </p>
            <div className="mt-auto pt-4">
              <Link href="/findquiz">
                <Button color={btnColor3} className="w-full" size="lg">
                  Find Quiz
                </Button>
              </Link>
            </div>
          </Card>

          <Card variant={cardColor4} className="text-center flex flex-col">
            <User className="w-14 h-14 mx-auto mb-5 flex-shrink-0" />
            <h2 className="text-3xl font-black mb-4">
              My Quizzes
            </h2>
            <p className="text-lg font-bold opacity-90 flex-grow mb-4">
              View all my quizzes and manage them
            </p>
            <div className="mt-auto pt-4">
              <Link href="/myquiz">
                <Button color={btnColor4} className="w-full" size="lg">
                  My Quizzes
                </Button>
              </Link>
            </div>
          </Card>

          <Card variant={cardColor5} className="text-center flex flex-col">
            <ChartColumn className="w-14 h-14 mx-auto mb-5 flex-shrink-0" />
            <h2 className="text-3xl font-black mb-4">
              My Stats
            </h2>
            <p className="text-lg font-bold opacity-90 flex-grow mb-4">
              View all statistics of my quizzes and my performance
            </p>
            <div className="mt-auto pt-4">
              <Link href="/stats">
                <Button color={btnColor5} className="w-full" size="lg">
                  My Stats
                </Button>
              </Link>
            </div>
          </Card>
          <Card variant={cardColor6} className="text-center flex flex-col">
            <Settings className="w-14 h-14 mx-auto mb-5 flex-shrink-0" />
            <h2 className="text-3xl font-black mb-4">
              Settings
            </h2>
            <p className="text-lg font-bold opacity-90 flex-grow mb-4">
              View and edit your settings
            </p>
            <div className="mt-auto pt-4">
              <Link href="/settings">
                <Button color={btnColor6} className="w-full" size="lg">
                  Settings
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
