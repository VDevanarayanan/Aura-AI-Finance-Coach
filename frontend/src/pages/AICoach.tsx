import React, { useState, useEffect, useRef } from 'react';
import { apiRequest } from '../utils/api';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Sparkles, Send, Trash2 } from 'lucide-react';
import type { ChatMessage } from '../../../shared/types';

export const AICoach: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const sampleQuestions = [
    'Where am I spending the most?',
    'How can I save more money?',
    'Can I afford a laptop costing ₹60,000?',
    'Summarize my spending this month.',
    'What is my biggest expense category?',
    'How much should I save every month to reach my goal?',
  ];

  const fetchHistory = async () => {
    try {
      const history = await apiRequest<ChatMessage[]>('/ai/chat/history');
      setMessages(history);
    } catch (error) {
      console.error('Failed to load chat history:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim() || isLoading) return;

    const userText = textToSend;
    setInput('');
    setIsLoading(true);

    // Optimistically add user message to chat UI
    const tempUserMsg: ChatMessage = {
      id: 'temp-user-id',
      role: 'user',
      message: userText,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempUserMsg]);

    try {
      const response = await apiRequest<{
        userMessage: ChatMessage;
        coachMessage: ChatMessage;
      }>('/ai/chat', {
        method: 'POST',
        body: JSON.stringify({ message: userText }),
      });

      // Update messages replacing the temp message with actual database records
      setMessages((prev) =>
        prev.filter((m) => m.id !== 'temp-user-id').concat([
          response.userMessage,
          response.coachMessage,
        ])
      );
    } catch (error: any) {
      console.error('Error sending message:', error);
      // Remove temp message and alert error
      setMessages((prev) => prev.filter((m) => m.id !== 'temp-user-id'));
      alert(error.message || 'Coach failed to respond. Please check API credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = async () => {
    if (!window.confirm('Are you sure you want to clear your chat history?')) return;

    setIsClearing(true);
    try {
      await apiRequest('/ai/chat/history', { method: 'DELETE' });
      setMessages([]);
    } catch (error) {
      console.error('Failed to clear history:', error);
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <div className="h-[80vh] flex flex-col space-y-4 animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-zinc-50">
            Aura AI Coach
          </h1>
          <p className="text-sm text-zinc-400 mt-1.5 flex items-center gap-1">
            <Sparkles className="h-4 w-4 text-purple-400 fill-purple-950" />
            Discuss your cash flow, budgets, and goals with your personal financial mentor.
          </p>
        </div>
        {messages.length > 0 && (
          <Button
            variant="ghost"
            onClick={handleClearHistory}
            disabled={isClearing}
            className="text-red-400 hover:bg-red-950/20 hover:text-red-300 h-9 font-bold"
          >
            <Trash2 className="h-4.5 w-4.5 mr-1.5" />
            Clear Chat
          </Button>
        )}
      </div>

      {/* Main Dialogue Panel */}
      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Side: suggestions panel */}
        <div className="hidden lg:flex flex-col space-y-3.5 col-span-1">
          <Card className="h-full">
            <Card.Header>
              <Card.Title className="text-base flex items-center gap-1.5">
                <Sparkles className="h-4.5 w-4.5 text-purple-400" />
                <span>Coach Queries</span>
              </Card.Title>
              <Card.Description className="text-zinc-400">
                Ask these specific questions about your financial data.
              </Card.Description>
            </Card.Header>
            <Card.Content className="space-y-2.5">
              {sampleQuestions.map((q) => (
                <button
                  key={q}
                  onClick={() => handleSend(q)}
                  disabled={isLoading}
                  className="w-full text-left text-xs bg-zinc-950/40 hover:bg-zinc-900 border border-zinc-850 p-3 rounded-xl font-semibold text-zinc-300 hover:border-purple-500 hover:text-purple-300 transition-all duration-200 cursor-pointer active-scale"
                >
                  {q}
                </button>
              ))}
            </Card.Content>
          </Card>
        </div>

        {/* Right Side: Chat Dialog Messages */}
        <div className="flex-1 lg:col-span-3 flex flex-col min-h-0 bg-zinc-900/40 backdrop-blur-md rounded-2xl border border-zinc-800 overflow-hidden shadow-sm">
          {/* Scrollable messages container */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                <div className="p-4 bg-purple-950/40 text-purple-400 rounded-2xl shadow-sm border border-purple-900/30">
                  <Sparkles className="h-10 w-10 animate-pulse" />
                </div>
                <div>
                  <h3 className="font-extrabold text-lg text-zinc-100">
                    Meet your Aura Wealth Coach
                  </h3>
                  <p className="text-sm text-zinc-400 max-w-sm mt-1">
                    Ask questions like "Where am I spending the most?" or "Can I afford a laptop costing ₹60,000?" to receive advice based on your current budgets, goals, and transaction records.
                  </p>
                </div>

                {/* Mobile Suggestion Pill Grid */}
                <div className="flex flex-wrap gap-2 max-w-lg justify-center lg:hidden mt-4">
                  {sampleQuestions.slice(0, 3).map((q) => (
                    <button
                      key={q}
                      onClick={() => handleSend(q)}
                      className="text-xs bg-zinc-900 border border-zinc-800 text-zinc-300 px-3 py-2 rounded-xl"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((m) => {
                const isUser = m.role === 'user';
                return (
                  <div
                    key={m.id}
                    className={`flex ${isUser ? 'justify-end' : 'justify-start'} animate-in fade-in duration-200`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-4.5 py-3.5 text-sm leading-relaxed shadow-sm ${
                        isUser
                          ? 'bg-purple-600 text-white rounded-tr-none'
                          : 'bg-zinc-800 text-zinc-100 rounded-tl-none border border-zinc-700/40'
                      }`}
                    >
                      {!isUser && (
                        <div className="flex items-center space-x-1 mb-1 text-[10px] uppercase font-bold tracking-wider text-purple-300">
                          <Sparkles className="h-3 w-3 fill-purple-950" />
                          <span>Aura Coach</span>
                        </div>
                      )}
                      <p className="whitespace-pre-line">{m.message}</p>
                    </div>
                  </div>
                );
              })
            )}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-zinc-800 text-zinc-350 rounded-2xl rounded-tl-none px-5 py-3.5 text-sm shadow-sm flex items-center space-x-2.5">
                  <span className="flex space-x-1">
                    <span className="h-1.5 w-1.5 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="h-1.5 w-1.5 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="h-1.5 w-1.5 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </span>
                  <span className="text-xs font-semibold">Coach is evaluating your financial records...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Form Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend(input);
            }}
            className="p-4 bg-zinc-950/30 border-t border-zinc-800 flex items-center space-x-3"
          >
            <input
              type="text"
              placeholder="Ask the coach anything..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isLoading}
              className="flex-1 h-11 bg-zinc-900 border border-zinc-800 rounded-xl px-4 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-700"
            />
            <Button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="h-11 w-11 rounded-xl p-0 shrink-0 bg-zinc-50 text-zinc-900 hover:bg-zinc-200"
            >
              <Send className="h-4.5 w-4.5 text-current" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};
