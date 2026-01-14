'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Bot, Send, Sparkles } from 'lucide-react';

export function AIChatTab() {
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([
    {
      role: 'assistant',
      content: 'Hi! I can help you generate quiz questions. Ask me anything! (AI integration coming soon)',
    },
  ]);
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (!input.trim()) return;

    setMessages([...messages, { role: 'user', content: input }]);
    setInput('');

    // Mock response
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'AI integration is coming soon! For now, this is a placeholder. You can still create questions manually.',
        },
      ]);
    }, 500);
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Card variant="blue" className="mb-4 p-4 flex-shrink-0">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-[#1F2937]" />
          <h3 className="text-lg font-black text-[#1F2937]">AI Question Assistant</h3>
        </div>
        <p className="text-sm font-bold text-[#6B7280] mt-2">
          Get AI-powered question suggestions for your quiz. (Coming soon)
        </p>
      </Card>

      <div className="flex-1 overflow-y-auto space-y-4 mb-4 min-h-0">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {message.role === 'assistant' && (
              <div className="w-8 h-8 rounded-full bg-[#93C5FD] flex items-center justify-center flex-shrink-0">
                <Bot className="w-5 h-5 text-[#1F2937]" />
              </div>
            )}
            <Card
              variant={message.role === 'user' ? 'green' : 'blue'}
              className="max-w-[80%] p-4"
            >
              <p className="text-sm font-bold text-[#1F2937]">{message.content}</p>
            </Card>
            {message.role === 'user' && (
              <div className="w-8 h-8 rounded-full bg-[#86EFAC] flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-black text-[#1F2937]">U</span>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="flex gap-2 flex-shrink-0">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Ask for question suggestions..."
          className="flex-1 px-3 py-2 text-sm"
        />
        <Button onClick={handleSend} variant="primary" size="sm">
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
