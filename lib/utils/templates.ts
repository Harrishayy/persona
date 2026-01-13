import type { QuizTemplate } from '@/lib/types';

export const quizTemplates: QuizTemplate[] = [
  {
    id: 'general-knowledge',
    name: 'General Knowledge',
    description: 'Test your knowledge on various topics',
    category: 'General',
    questions: [
      {
        type: 'multiple_choice',
        text: 'What is the capital of France?',
        order: 0,
        options: [
          { text: 'London', isCorrect: false, order: 0 },
          { text: 'Berlin', isCorrect: false, order: 1 },
          { text: 'Paris', isCorrect: true, order: 2 },
          { text: 'Madrid', isCorrect: false, order: 3 },
        ],
      },
      {
        type: 'true_false',
        text: 'The Earth is round.',
        order: 1,
        options: [
          { text: 'True', isCorrect: true, order: 0 },
          { text: 'False', isCorrect: false, order: 1 },
        ],
      },
      {
        type: 'multiple_choice',
        text: 'What is 2 + 2?',
        order: 2,
        options: [
          { text: '3', isCorrect: false, order: 0 },
          { text: '4', isCorrect: true, order: 1 },
          { text: '5', isCorrect: false, order: 2 },
        ],
      },
    ],
  },
  {
    id: 'sports',
    name: 'Sports',
    description: 'Questions about sports and athletes',
    category: 'Sports',
    questions: [
      {
        type: 'multiple_choice',
        text: 'How many players are on a basketball team on the court?',
        order: 0,
        options: [
          { text: '4', isCorrect: false, order: 0 },
          { text: '5', isCorrect: true, order: 1 },
          { text: '6', isCorrect: false, order: 2 },
          { text: '7', isCorrect: false, order: 3 },
        ],
      },
      {
        type: 'true_false',
        text: 'Soccer is played with hands.',
        order: 1,
        options: [
          { text: 'True', isCorrect: false, order: 0 },
          { text: 'False', isCorrect: true, order: 1 },
        ],
      },
    ],
  },
  {
    id: 'movies',
    name: 'Movies & TV',
    description: 'Test your knowledge of films and television',
    category: 'Entertainment',
    questions: [
      {
        type: 'multiple_choice',
        text: 'Which movie won the Academy Award for Best Picture in 2020?',
        order: 0,
        options: [
          { text: 'Parasite', isCorrect: true, order: 0 },
          { text: '1917', isCorrect: false, order: 1 },
          { text: 'Joker', isCorrect: false, order: 2 },
          { text: 'Once Upon a Time in Hollywood', isCorrect: false, order: 3 },
        ],
      },
      {
        type: 'text_input',
        text: 'What is the name of the main character in The Matrix?',
        order: 1,
      },
    ],
  },
];
