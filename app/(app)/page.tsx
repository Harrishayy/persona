import Link from 'next/link';
import { withAuth, getSignUpUrl } from '@workos-inc/authkit-nextjs';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ColorblockTitle } from '@/components/ui/ColorblockTitle';
import { Gamepad2, Plus, LogIn } from 'lucide-react';
import { getUniqueColors } from '@/lib/utils/colors';

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
    const uiColors = getUniqueColors(5);
    
    // Map colors to variants (simplified - you might want a more sophisticated mapping)
    const colorToVariant: Record<string, 'purple' | 'pink' | 'blue' | 'yellow' | 'green' | 'orange' | 'red' | 'cyan'> = {
      '#A78BFA': 'purple',
      '#F0A4D0': 'pink',
      '#93C5FD': 'blue',
      '#FDE68A': 'yellow',
      '#86EFAC': 'green',
      '#FDBA74': 'orange',
      '#FCA5A5': 'red',
      '#67E8F9': 'cyan',
    };

    const cardColor1 = colorToVariant[uiColors[0]] || 'pink';
    const cardColor2 = colorToVariant[uiColors[1]] || 'blue';
    const btnColor1 = colorToVariant[uiColors[2]] || 'yellow';
    const btnColor2 = colorToVariant[uiColors[3]] || 'green';

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

        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <Card variant={cardColor1} className="text-center">
            <Gamepad2 className="w-14 h-14 mx-auto mb-5" />
            <h2 className="text-3xl font-black mb-4">
              Join a Quiz
            </h2>
            <p className="text-lg font-bold opacity-90 mb-8">
              Enter the code to join a live quiz session
            </p>
            <Link href="/join">
              <Button color={btnColor1} className="w-full" size="lg">
                Join Quiz
              </Button>
            </Link>
          </Card>

          <Card variant={cardColor2} className="text-center">
            <Plus className="w-14 h-14 mx-auto mb-5" />
            <h2 className="text-3xl font-black mb-4">
              Create a Quiz
            </h2>
            <p className="text-lg font-bold opacity-90 mb-8">
              Build your own quiz with templates and share it with friends
            </p>
            <Link href="/create">
              <Button color={btnColor2} className="w-full" size="lg">
                Create Quiz
              </Button>
            </Link>
          </Card>
        </div>
      </div>
    </div>
  );
}
