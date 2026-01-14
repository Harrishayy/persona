'use client';

import { useState, useEffect, useRef } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { QuestionEditor } from './QuestionEditor';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Plus, ChevronDown, ChevronUp, GripVertical, Trash2 } from 'lucide-react';
import type { Question } from '@/lib/types/app';
import { cn } from '@/lib/utils/cn';

interface QuestionListProps {
  questions: Question[];
  rounds?: Array<{ id?: number; order: number; title?: string }>;
  onQuestionsChange: (questions: Question[]) => void;
  onAddQuestion: () => void;
  onUpdateQuestion: (index: number, question: Question) => void;
  onDeleteQuestion: (index: number) => void;
  onActiveQuestionChange?: (index: number | null) => void;
}

interface SortableQuestionItemProps {
  question: Question;
  index: number;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onUpdate: (question: Question) => void;
  onDelete: () => void;
  rounds?: Array<{ id?: number; order: number; title?: string }>;
}

function SortableQuestionItem({
  question,
  index,
  isExpanded,
  onToggleExpand,
  onUpdate,
  onDelete,
  rounds,
}: SortableQuestionItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: `question-${index}-${question.order}` });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const isCompleted = question.text.trim().length > 0;

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={cn('mb-3 transition-all duration-200', isDragging && 'opacity-50')}
    >
      {/* Header with drag handle and expand/collapse */}
      <div className="flex items-center justify-between mb-4">
        {/* Drag handle and question info */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {/* Only the grip icon should have drag attributes */}
          <div {...attributes} {...listeners}>
            <GripVertical className="w-5 h-5 text-[#6B7280] cursor-grab active:cursor-grabbing flex-shrink-0" />
          </div>
          <div className="w-8 h-8 flex items-center justify-center border-4 border-[#1F2937] rounded-lg bg-white font-black text-[#1F2937] flex-shrink-0">
            {index + 1}
          </div>
          {!isExpanded ? (
            <div className="flex-1 min-w-0 cursor-pointer" onClick={onToggleExpand}>
              <h3 className="text-lg font-black text-[#1F2937] truncate">
                {question.text || `Question ${index + 1}`}
              </h3>
              {isCompleted && (
                <p className="text-sm font-bold text-[#6B7280]">
                  {question.type} • {question.options?.length || 0} options
                </p>
              )}
            </div>
          ) : (
            <div className="flex-1 min-w-0 cursor-pointer" onClick={onToggleExpand}>
              <h3 className="text-lg font-black text-[#1F2937]">
                Question {index + 1}
              </h3>
            </div>
          )}
        </div>
        
        {/* Expand/Collapse and Delete buttons */}
        <div className="flex items-center gap-2 flex-shrink-0 ml-2">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleExpand();
            }}
            className="p-2 hover:bg-[#1F2937] hover:text-white rounded-lg transition-colors"
          >
            {isExpanded ? (
              <ChevronUp className="w-5 h-5" />
            ) : (
              <ChevronDown className="w-5 h-5" />
            )}
          </button>
          {isExpanded && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="p-2 hover:bg-red-500 hover:text-white rounded-lg transition-colors"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Expanded Content - Question Editor without its own card wrapper */}
      {isExpanded && (
        <QuestionEditor
          question={question}
          index={index}
          onChange={onUpdate}
          onDelete={onDelete}
          rounds={rounds}
          hideHeader={true}
        />
      )}
    </Card>
  );
}

export function QuestionList({
  questions,
  rounds,
  onQuestionsChange,
  onAddQuestion,
  onUpdateQuestion,
  onDeleteQuestion,
  onActiveQuestionChange,
}: QuestionListProps) {
  const [expandedQuestions, setExpandedQuestions] = useState<Set<number>>(new Set([0]));

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Track previous questions length to detect new additions
  const prevQuestionsLengthRef = useRef(questions.length);

  // Auto-minimize completed questions and auto-expand new/empty ones
  useEffect(() => {
    const wasNewQuestionAdded = questions.length > prevQuestionsLengthRef.current;
    
    // Only update expanded state when a new question is added, not on every text change
    if (wasNewQuestionAdded) {
      const newExpanded = new Set<number>();
      
      // When a new question is added:
      // 1. Minimize ALL previous questions (whether they have details or not)
      // 2. Only expand the newly added question (last one)
      const newQuestionIndex = questions.length - 1;
      newExpanded.add(newQuestionIndex);
      
      setExpandedQuestions(newExpanded);
      prevQuestionsLengthRef.current = questions.length;
    } else {
      // Just update the ref when length hasn't changed (text updates)
      prevQuestionsLengthRef.current = questions.length;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [questions.length]); // Only watch for length changes, not text changes

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      // Extract array index from id format: "question-{index}-{order}"
      const activeMatch = active.id.toString().match(/^question-(\d+)-/);
      const overMatch = over.id.toString().match(/^question-(\d+)-/);
      
      if (!activeMatch || !overMatch) return;
      
      const oldIndex = parseInt(activeMatch[1]);
      const newIndex = parseInt(overMatch[1]);
      
      if (oldIndex === newIndex) return;

      const newQuestions = arrayMove(questions, oldIndex, newIndex).map((q, i) => ({
        ...q,
        order: i,
      }));

      onQuestionsChange(newQuestions);

      // Update expanded state based on array indices
      const newExpanded = new Set<number>();
      expandedQuestions.forEach((idx) => {
        if (idx === oldIndex) {
          newExpanded.add(newIndex);
        } else if (idx === newIndex) {
          newExpanded.add(oldIndex);
        } else {
          // Adjust indices for items between old and new positions
          if (oldIndex < newIndex) {
            // Moving down
            if (idx > oldIndex && idx <= newIndex) {
              newExpanded.add(idx - 1);
            } else {
              newExpanded.add(idx);
            }
          } else {
            // Moving up
            if (idx >= newIndex && idx < oldIndex) {
              newExpanded.add(idx + 1);
            } else {
              newExpanded.add(idx);
            }
          }
        }
      });
      setExpandedQuestions(newExpanded);
    }
  };

  const toggleQuestionExpand = (index: number) => {
    const newExpanded = new Set(expandedQuestions);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
      onActiveQuestionChange?.(null);
    } else {
      newExpanded.add(index);
      onActiveQuestionChange?.(index);
    }
    setExpandedQuestions(newExpanded);
  };

  // Notify parent when expanded questions change
  useEffect(() => {
    const activeIndex = expandedQuestions.size > 0 
      ? Math.max(...Array.from(expandedQuestions)) 
      : null;
    onActiveQuestionChange?.(activeIndex ?? null);
  }, [expandedQuestions, onActiveQuestionChange]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-[#1F2937]">
          Questions ({questions.length})
        </h2>
        <Button variant="secondary" onClick={onAddQuestion} size="lg">
          <Plus className="w-5 h-5 mr-2" />
          Add Question
        </Button>
      </div>

      <div className="bg-white rounded-lg p-4">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={questions.map((q, i) => `question-${i}-${q.order}`)}
            strategy={verticalListSortingStrategy}
          >
            {questions.map((question, index) => (
              <SortableQuestionItem
                key={`question-${index}-${question.order}`}
                question={question}
                index={index}
                isExpanded={expandedQuestions.has(index)}
                onToggleExpand={() => toggleQuestionExpand(index)}
                onUpdate={(q) => onUpdateQuestion(index, q)}
                onDelete={() => onDeleteQuestion(index)}
                rounds={rounds}
              />
            ))}
          </SortableContext>
        </DndContext>
      </div>
    </div>
  );
}
