'use client';

import { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { GameModeSelector } from './GameModeSelector';
import { Image, Smile, X, Upload } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import type { GameMode } from '@/lib/types/database';
import { useToast } from '@/lib/hooks/useToast';

interface QuizHeaderProps {
  title: string;
  description: string;
  imageUrl?: string;
  emoji?: string;
  isPublic: boolean;
  gameMode: GameMode;
  hasRounds: boolean;
  isEditing?: boolean;
  onTitleChange: (title: string) => void;
  onDescriptionChange: (description: string) => void;
  onImageUrlChange: (url: string) => void;
  onImageFileChange?: (file: File | null) => void;
  onEmojiChange: (emoji: string) => void;
  onPublicChange: (isPublic: boolean) => void;
  onGameModeChange: (mode: GameMode) => void;
}

export function QuizHeader({
  title,
  description,
  imageUrl,
  emoji,
  isPublic,
  gameMode,
  hasRounds,
  isEditing = false,
  onTitleChange,
  onDescriptionChange,
  onImageUrlChange,
  onImageFileChange,
  onEmojiChange,
  onPublicChange,
  onGameModeChange,
}: QuizHeaderProps) {
  // Sync useEmoji state with actual props - prefer emoji if both exist
  const [useEmoji, setUseEmoji] = useState(!!emoji && !imageUrl);
  const [emojiInput, setEmojiInput] = useState(emoji || '');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { showToast } = useToast();
  const previousBlobUrlRef = useRef<string | null>(null);

  // Update useEmoji state when props change
  useEffect(() => {
    if (emoji && !imageUrl) {
      setUseEmoji(true);
    } else if (imageUrl && !emoji) {
      setUseEmoji(false);
    }
  }, [emoji, imageUrl]);

  // Cleanup blob URLs when image changes (but not the current one)
  useEffect(() => {
    const previousUrl = previousBlobUrlRef.current;
    
    // Update ref to current URL
    previousBlobUrlRef.current = imageUrl || null;
    
    // Cleanup previous blob URL if it's different from current and is a blob URL
    if (previousUrl && previousUrl !== imageUrl && previousUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previousUrl);
    }
    
    // Cleanup on unmount
    return () => {
      if (imageUrl && imageUrl.startsWith('blob:')) {
        URL.revokeObjectURL(imageUrl);
      }
    };
  }, [imageUrl]);

  const handleEmojiSubmit = () => {
    if (emojiInput.trim()) {
      onEmojiChange(emojiInput.trim());
      onImageUrlChange('');
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    // Ensure only one file is selected
    if (files.length > 1) {
      showToast('Only one image is allowed. Please select a single image file.', 'warning');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    const file = files[0];

    // Validate file type - only allow PNG, JPEG, JPG, WebP
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    const allowedExtensions = ['.png', '.jpg', '.jpeg', '.webp'];
    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
    
    // Check for HEIC files explicitly
    if (file.type === 'image/heic' || file.type === 'image/heif' || fileExtension === '.heic' || fileExtension === '.heif') {
      showToast('HEIC files are not supported. Please use PNG, JPEG, or JPG format.', 'error');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }
    
    // Check if file type is allowed
    if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(fileExtension)) {
      showToast('Please select a PNG, JPEG, JPG, or WebP image file', 'error');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      showToast('Image size must be less than 5MB', 'error');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    // Cleanup previous blob URL if it exists and is different
    if (imageUrl && imageUrl.startsWith('blob:') && imageUrl !== previousBlobUrlRef.current) {
      URL.revokeObjectURL(imageUrl);
    }
    if (previousBlobUrlRef.current && previousBlobUrlRef.current.startsWith('blob:') && previousBlobUrlRef.current !== imageUrl) {
      URL.revokeObjectURL(previousBlobUrlRef.current);
    }
    
    // Store file as blob URL for preview - will upload to R2 when quiz is saved
    const localPreviewUrl = URL.createObjectURL(file);
    previousBlobUrlRef.current = localPreviewUrl;
    onEmojiChange('');
    onImageUrlChange(localPreviewUrl);
    // Also store the File object for direct upload (avoids blob URL fetch issues)
    onImageFileChange?.(file);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <Card variant="blue" className="mb-8">
      <h1 className="text-4xl font-black mb-6">Create Your Quiz</h1>

      <div className="space-y-6">
        <Input
          label="Quiz Title"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder="Enter quiz title..."
        />

        <Input
          label="Description (Optional)"
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          placeholder="Describe your quiz..."
        />

        {/* Photo/Emoji Selector */}
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <label className="text-base font-bold text-[#1F2937]">
              Quiz Image/Emoji
            </label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={!useEmoji ? 'primary' : 'outline'}
                size="sm"
                onClick={() => {
                  setUseEmoji(false);
                  // Clear emoji when switching to image mode
                  if (emoji) {
                    onEmojiChange('');
                    setEmojiInput('');
                  }
                }}
              >
                <Image className="w-4 h-4 mr-1" />
                Photo
              </Button>
              <Button
                type="button"
                variant={useEmoji ? 'primary' : 'outline'}
                size="sm"
                onClick={() => {
                  setUseEmoji(true);
                  // Clear image when switching to emoji mode
                  if (imageUrl) {
                    onImageUrlChange('');
                  }
                }}
              >
                <Smile className="w-4 h-4 mr-1" />
                Emoji
              </Button>
            </div>
          </div>

          {useEmoji ? (
            <div className="flex gap-2">
              <Input
                value={emojiInput}
                onChange={(e) => setEmojiInput(e.target.value)}
                placeholder="Enter emoji (e.g., 🎮)"
                maxLength={10}
                className="flex-1"
              />
              <Button
                type="button"
                onClick={handleEmojiSubmit}
                variant="secondary"
              >
                Set Emoji
              </Button>
              {emoji && (
                <div className="flex items-center gap-2 px-4 border-4 border-[#1F2937] rounded-lg bg-white">
                  <span className="text-2xl">{emoji}</span>
                  <button
                    type="button"
                    onClick={() => {
                      onEmojiChange('');
                      setEmojiInput('');
                    }}
                    className="text-[#1F2937] hover:text-[#FCA5A5] transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/webp"
                onChange={handleFileSelect}
                className="hidden"
                multiple={false}
              />
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleImageClick}
                  className="flex items-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  Choose Image
                </Button>
                {imageUrl && (
                  <div className="relative flex-shrink-0">
                    <img
                      key={imageUrl} // Force re-render when imageUrl changes
                      src={imageUrl}
                      alt="Quiz preview"
                      className="w-16 h-16 object-cover border-4 border-[#1F2937] rounded-lg"
                      onError={(e) => {
                        const img = e.target as HTMLImageElement;
                        img.style.display = 'none';
                        // If it's a blob URL that failed, clean it up
                        if (imageUrl && imageUrl.startsWith('blob:')) {
                          URL.revokeObjectURL(imageUrl);
                          previousBlobUrlRef.current = null;
                          onImageUrlChange('');
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        // Cleanup blob URL when removing image
                        const urlToRevoke = imageUrl;
                        if (urlToRevoke && urlToRevoke.startsWith('blob:')) {
                          // Clear the ref first to prevent cleanup effect from trying to revoke it again
                          previousBlobUrlRef.current = null;
                          // Small delay to ensure React has updated before revoking
                          setTimeout(() => {
                            try {
                              URL.revokeObjectURL(urlToRevoke);
                            } catch (e) {
                              // Ignore errors if URL was already revoked
                            }
                          }, 0);
                        }
                        onImageUrlChange('');
                        // Reset file input
                        if (fileInputRef.current) {
                          fileInputRef.current.value = '';
                        }
                      }}
                      className="absolute -top-2 -right-2 bg-[#FCA5A5] text-[#1F2937] rounded-full p-1 hover:scale-110 transition-transform z-10"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
              {imageUrl && (
                <p className="text-sm font-bold text-[#6B7280]">
                  One image selected. Click the X to remove or choose a new image to replace it.
                </p>
              )}
            </div>
          )}
        </div>

        {/* Public/Private Toggle */}
        <div className="flex items-center justify-between p-4 border-4 border-[#1F2937] rounded-lg bg-white">
          <div>
            <label className="text-base font-bold text-[#1F2937]">
              Visibility
            </label>
            <p className="text-sm font-bold text-[#6B7280] mt-1">
              {isPublic ? 'Anyone can find and join this quiz' : 'Only you can see this quiz'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => onPublicChange(!isPublic)}
            className={cn(
              'relative w-14 h-8 rounded-full transition-colors duration-200',
              isPublic ? 'bg-[#86EFAC]' : 'bg-[#6B7280]'
            )}
          >
            <span
              className={cn(
                'absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform duration-200',
                isPublic && 'translate-x-6'
              )}
            />
          </button>
        </div>

        {/* Game Mode Selector (only shown if no rounds) */}
        {!hasRounds && (
          <GameModeSelector
            value={gameMode}
            onChange={onGameModeChange}
            showHelp={true}
          />
        )}
      </div>
    </Card>
  );
}
