'use client';

import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { QuizTemplate } from '@/lib/types';
import { Sparkles } from 'lucide-react';

interface TemplateSelectorProps {
  templates: QuizTemplate[];
  onSelect: (template: QuizTemplate) => void;
}

const colorVariants = ['purple', 'pink', 'blue', 'green', 'yellow', 'orange'] as const;

export function TemplateSelector({ templates, onSelect }: TemplateSelectorProps) {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
      {templates.map((template, index) => {
        const variant = colorVariants[index % colorVariants.length] || 'purple';
        return (
          <Card
            key={template.id}
            variant={variant}
            className="cursor-pointer hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all duration-200 text-white"
            onClick={() => onSelect(template)}
          >
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5" />
              <span className="text-sm font-bold">{template.category}</span>
            </div>
            <h3 className="text-xl font-black mb-2">
              {template.name}
            </h3>
            <p className="text-base font-bold opacity-90 mb-4">
              {template.description}
            </p>
            <div className="text-sm font-bold opacity-80">
              {template.questions.length} questions
            </div>
          </Card>
        );
      })}
    </div>
  );
}
