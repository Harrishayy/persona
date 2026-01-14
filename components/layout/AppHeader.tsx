'use client';

import { LogOut, ArrowLeft } from 'lucide-react';
import { handleSignOutAction } from '@/app/(app)/actions/signOut';
import { useRouter, usePathname } from 'next/navigation';
import { useState } from 'react';
import { getColorHex, getColorHover } from '@/lib/utils/colors';
import { useColorblockRotation } from '@/lib/hooks/useColorblockRotation';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';

export function AppHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isLogoutHovered, setIsLogoutHovered] = useState(false);
  const [isBackHovered, setIsBackHovered] = useState(false);
  const logoutRotation = useColorblockRotation({ initialRotation: -3, hoverRotation: 3, enabled: true });
  const backRotation = useColorblockRotation({ initialRotation: -3, hoverRotation: 3, enabled: true });

  const isHomePage = pathname === '/';

  const handleLogoutClick = () => {
    setShowLogoutConfirm(true);
  };

  const handleLogoutConfirm = async () => {
    setShowLogoutConfirm(false);
    setIsLoading(true);
    try {
      await handleSignOutAction();
      // WorkOS signOut() handles redirect, but we'll refresh to be safe
      router.refresh();
    } catch (error) {
      console.error('Logout error:', error);
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    router.back();
  };

  const redColor = getColorHex('red');
  const redHover = getColorHover('red');

  return (
    <>
      {/* Back Button - Left Side */}
      {!isHomePage && (
        <button
          onClick={handleBack}
          className="fixed top-4 left-4 z-50 w-14 h-14 sm:w-16 sm:h-16 border-4 border-[#1F2937] text-[#1F2937] rounded-lg flex items-center justify-center colorblock-shadow transition-all duration-200 font-black"
          style={{
            backgroundColor: isBackHovered ? redHover : redColor,
            transform: backRotation.transform,
            boxShadow: backRotation.isActive ? 'none' : undefined,
          }}
          onMouseEnter={() => {
            setIsBackHovered(true);
            backRotation.handleMouseEnter();
          }}
          onMouseLeave={() => {
            setIsBackHovered(false);
            backRotation.handleMouseLeave();
          }}
          onMouseDown={backRotation.handleMouseDown}
          onMouseUp={backRotation.handleMouseUp}
          aria-label="Go back"
          title="Go back"
        >
          <ArrowLeft className="w-6 h-6 sm:w-7 sm:h-7" />
        </button>
      )}

      {/* Logout Button - Right Side */}
      <button
        onClick={handleLogoutClick}
        disabled={isLoading}
        className="fixed top-4 right-4 z-50 w-14 h-14 sm:w-16 sm:h-16 border-4 border-[#1F2937] text-[#1F2937] rounded-lg flex items-center justify-center colorblock-shadow transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-black"
        style={{
          backgroundColor: isLogoutHovered ? redHover : redColor,
          transform: logoutRotation.transform,
          boxShadow: logoutRotation.isActive ? 'none' : undefined,
        }}
        onMouseEnter={() => {
          setIsLogoutHovered(true);
          logoutRotation.handleMouseEnter();
        }}
        onMouseLeave={() => {
          setIsLogoutHovered(false);
          logoutRotation.handleMouseLeave();
        }}
        onMouseDown={logoutRotation.handleMouseDown}
        onMouseUp={logoutRotation.handleMouseUp}
        aria-label="Sign out"
        title="Sign out"
      >
        <LogOut className="w-6 h-6 sm:w-7 sm:h-7" />
      </button>

      {/* Logout Confirmation Modal */}
      <Modal
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        title="Confirm Logout"
        size="sm"
        color="red"
      >
        <div className="space-y-6">
          <p className="text-lg font-bold text-center">
            Are you sure you want to log out?
          </p>
          <div className="flex gap-4 justify-end">
            <Button
              variant="secondary"
              onClick={() => setShowLogoutConfirm(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleLogoutConfirm}
              isLoading={isLoading}
            >
              Log Out
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
