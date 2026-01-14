'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { GameModeSelector } from './GameModeSelector';
import { Image, Smile, X } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import type { GameMode } from '@/lib/types/database';

interface QuizHeaderProps {
  title: string;
  description: string;
  imageUrl?: string;
  emoji?: string;
  isPublic: boolean;
  gameMode: GameMode;
  hasRounds: boolean;
  onTitleChange: (title: string) => void;
  onDescriptionChange: (description: string) => void;
  onImageUrlChange: (url: string) => void;
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
  onTitleChange,
  onDescriptionChange,
  onImageUrlChange,
  onEmojiChange,
  onPublicChange,
  onGameModeChange,
}: QuizHeaderProps) {
  const [useEmoji, setUseEmoji] = useState(!!emoji);
  const [emojiInput, setEmojiInput] = useState(emoji || '');

  const handleEmojiSubmit = () => {
    if (emojiInput.trim()) {
      onEmojiChange(emojiInput.trim());
      onImageUrlChange('');
    }
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
                onClick={() => setUseEmoji(false)}
              >
                <Image className="w-4 h-4 mr-1" />
                Photo
              </Button>
              <Button
                type="button"
                variant={useEmoji ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setUseEmoji(true)}
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
            <div className="flex gap-2">
              <Input
                value={imageUrl || ''}
                onChange={(e) => {
                  onImageUrlChange(e.target.value);
                  onEmojiChange('');
                }}
                placeholder="Enter image URL..."
                type="url"
                className="flex-1"
              />
              {imageUrl && (
                <div className="relative">
                  <img
                    src={imageUrl}
                    alt="Quiz preview"
                    className="w-16 h-16 object-cover border-4 border-[#1F2937] rounded-lg"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => onImageUrlChange('')}
                    className="absolute -top-2 -right-2 bg-[#FCA5A5] text-[#1F2937] rounded-full p-1 hover:scale-110 transition-transform"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
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
