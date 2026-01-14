'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Settings, User, Mail, Save } from 'lucide-react';
import { useToast } from '@/lib/hooks/useToast';
import { updateUser } from '@/app/(app)/actions/user';
import { getErrorMessage } from '@/lib/types/errors';

interface UserData {
  id: string;
  email: string;
  name: string;
  usertag: string;
  bio?: string;
  details?: string;
  avatarUrl?: string;
}

interface SettingsClientProps {
  user: UserData;
}

export function SettingsClient({ user: initialUser }: SettingsClientProps) {
  const [user, setUser] = useState(initialUser);
  const [isSaving, setIsSaving] = useState(false);
  const [usertagError, setUsertagError] = useState<string | null>(null);
  const { showToast } = useToast();

  const handleSave = async () => {
    setIsSaving(true);
    setUsertagError(null);

    try {
      const updated = await updateUser({
        name: user.name,
        bio: user.bio,
        details: user.details,
        usertag: user.usertag,
      });

      showToast('Settings saved successfully!', 'success');
      setUser({ ...user, ...updated }); // Update with server response
    } catch (error) {
      console.error('Error saving settings:', error);
      const errorMessage = getErrorMessage(error) || 'Error saving settings';
      if (errorMessage.includes('usertag')) {
        setUsertagError(errorMessage);
      } else {
        showToast(errorMessage, 'error');
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card variant="purple">
        <div className="flex items-center gap-4 mb-6">
          <User className="w-8 h-8" />
          <h2 className="text-3xl font-black">Profile Information</h2>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-lg font-bold mb-2">Email</label>
            <Input
              type="email"
              value={user.email}
              disabled
              className="bg-gray-100"
            />
            <p className="text-sm font-bold opacity-70 mt-1">Email cannot be changed</p>
          </div>

          <div>
            <label className="block text-lg font-bold mb-2">Usertag</label>
            <Input
              type="text"
              value={user.usertag}
              onChange={(e) => {
                const value = e.target.value.toLowerCase().trim();
                setUser({ ...user, usertag: value });
                setUsertagError(null);
              }}
              placeholder="Enter your usertag"
              error={usertagError || undefined}
              maxLength={20}
            />
            <p className="text-sm font-bold opacity-70 mt-1">
              Lowercase letters, numbers, and underscores only. Must be unique.
            </p>
          </div>

          <div>
            <label className="block text-lg font-bold mb-2">Display Name</label>
            <Input
              type="text"
              value={user.name}
              onChange={(e) => setUser({ ...user, name: e.target.value })}
              placeholder="Your display name"
            />
          </div>

          <div>
            <label className="block text-lg font-bold mb-2">Bio</label>
            <textarea
              value={user.bio || ''}
              onChange={(e) => setUser({ ...user, bio: e.target.value })}
              placeholder="Tell us about yourself..."
              className="w-full p-3 border-4 border-[#1F2937] rounded-lg font-bold text-[#1F2937] focus:outline-none focus:ring-2 focus:ring-[#1F2937]"
              rows={4}
            />
          </div>

          <div>
            <label className="block text-lg font-bold mb-2">Additional Details</label>
            <textarea
              value={user.details || ''}
              onChange={(e) => setUser({ ...user, details: e.target.value })}
              placeholder="Any additional information..."
              className="w-full p-3 border-4 border-[#1F2937] rounded-lg font-bold text-[#1F2937] focus:outline-none focus:ring-2 focus:ring-[#1F2937]"
              rows={3}
            />
          </div>
        </div>

        <div className="mt-6">
          <Button
            onClick={handleSave}
            disabled={isSaving}
            variant="primary"
            size="lg"
            className="w-full"
          >
            <Save className="w-5 h-5 mr-2" />
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </Card>

      <Card variant="blue">
        <div className="flex items-center gap-4 mb-6">
          <Settings className="w-8 h-8" />
          <h2 className="text-3xl font-black">Account Settings</h2>
        </div>
        
        <div className="space-y-4">
          <div className="p-4 border-4 border-[#1F2937] rounded-lg">
            <h3 className="text-xl font-black mb-2">Account Information</h3>
            <p className="text-base font-bold opacity-90">
              Your account is managed through WorkOS AuthKit. To change your password or update your email, please contact support.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
