'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { QuizPreview } from './QuizPreview';
import { AIChatTab } from './AIChatTab';
import { Eye, Bot } from 'lucide-react';
import type { Quiz, Round, Question } from '@/lib/types/app';
import { cn } from '@/lib/utils/cn';

interface PreviewPanelProps {
  quiz: {
    title: string;
    description?: string;
    imageUrl?: string;
    emoji?: string;
    gameMode?: string;
    rounds?: Round[];
    questions?: Question[];
  };
  activeQuestionIndex?: number | null;
}

type Tab = 'preview' | 'ai';

export function PreviewPanel({ quiz, activeQuestionIndex }: PreviewPanelProps) {
  const [activeTab, setActiveTab] = useState<Tab>('preview');

  return (
    <div className="h-full flex flex-col overflow-hidden bg-[#F3F4F6] rounded-lg p-4">
      {/* Tab Navigation */}
      <div className="flex gap-2 mb-4 border-b-4 border-[#1F2937] pb-2 flex-shrink-0 -mx-4 -mt-4 px-4 pt-4 bg-[#F3F4F6] rounded-t-lg overflow-hidden">
        <Button
          type="button"
          variant={activeTab === 'preview' ? 'primary' : 'outline'}
          onClick={() => setActiveTab('preview')}
          size="sm"
          className="flex-1 !hover:scale-100 !hover:shadow-none"
          enableRotation={false}
        >
          <Eye className="w-4 h-4 mr-2" />
          Preview
        </Button>
        <Button
          type="button"
          variant={activeTab === 'ai' ? 'primary' : 'outline'}
          onClick={() => setActiveTab('ai')}
          size="sm"
          className="flex-1 !hover:scale-100 !hover:shadow-none"
          enableRotation={false}
        >
          <Bot className="w-4 h-4 mr-2" />
          AI Chat
        </Button>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto min-h-0 bg-white rounded-lg p-4 -mx-4 -mb-4 px-4 pb-4">
        {activeTab === 'preview' ? (
          <QuizPreview quiz={quiz} activeQuestionIndex={activeQuestionIndex} />
        ) : (
          <AIChatTab />
        )}
      </div>
    </div>
  );
}
