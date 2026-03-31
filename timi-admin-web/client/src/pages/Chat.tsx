/**
 * Chat Page - Timi Admin Dashboard
 * Design: Dark Professional Dashboard
 * 客服会话管理：会话列表 + 实时消息界面
 */
import { useEffect, useRef, useState } from 'react';
import { chatApi, type ChatSession, type ChatMessage, type PageResult } from '@/lib/api';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  MessageSquare, Send, X, RefreshCw, User, Shield, UserCheck,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const senderTypeIcon = {
  USER: User,
  ADMIN: Shield,
  AGENT: UserCheck,
};

const senderTypeLabel = {
  USER: '用户',
  ADMIN: '管理员',
  AGENT: '代理',
};

export default function ChatPage() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [totalSessions, setTotalSessions] = useState(0);
  const [sessionsPage, setSessionsPage] = useState(0);
  const [loadingSessions, setLoadingSessions] = useState(false);

  const [activeSession, setActiveSession] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchSessions = async (p = 0) => {
    setLoadingSessions(true);
    try {
      const res = await chatApi.getSessions(p, 20);
      const data = res.data as PageResult<ChatSession>;
      setSessions(p === 0 ? data.content : prev => [...prev, ...data.content]);
      setTotalSessions(data.totalElements);
    } catch {
      toast.error('获取会话列表失败');
    } finally {
      setLoadingSessions(false);
    }
  };

  const fetchMessages = async (sessionId: number) => {
    setLoadingMessages(true);
    try {
      const res = await chatApi.getMessages(sessionId);
      setMessages(res.data);
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    } catch {
      toast.error('获取消息失败');
    } finally {
      setLoadingMessages(false);
    }
  };

  useEffect(() => {
    fetchSessions(0);
  }, []);

  useEffect(() => {
    if (activeSession) {
      fetchMessages(activeSession.id);
      // Poll for new messages every 5s
      pollRef.current = setInterval(() => fetchMessages(activeSession.id), 5000);
    }
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [activeSession?.id]);

  const selectSession = (session: ChatSession) => {
    setActiveSession(session);
    setMessages([]);
  };

  const handleSend = async () => {
    if (!inputText.trim() || !activeSession) return;
    setSending(true);
    const text = inputText.trim();
    setInputText('');
    try {
      await chatApi.sendMessage(activeSession.id, text);
      await fetchMessages(activeSession.id);
      // Update session last message in list
      setSessions(prev => prev.map(s =>
        s.id === activeSession.id ? { ...s, lastMessage: text, unreadCount: 0 } : s
      ));
    } catch {
      toast.error('发送失败');
      setInputText(text);
    } finally {
      setSending(false);
    }
  };

  const handleCloseSession = async (sessionId: number) => {
    try {
      await chatApi.closeSession(sessionId);
      toast.success('会话已关闭');
      setSessions(prev => prev.map(s => s.id === sessionId ? { ...s, status: 'CLOSED' } : s));
      if (activeSession?.id === sessionId) {
        setActiveSession(prev => prev ? { ...prev, status: 'CLOSED' } : null);
      }
    } catch {
      toast.error('操作失败');
    }
  };

  const formatTime = (ts?: string) => {
    if (!ts) return '';
    const d = new Date(ts);
    const now = new Date();
    const isToday = d.toDateString() === now.toDateString();
    return isToday
      ? d.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
      : d.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="flex h-full" style={{ height: 'calc(100vh - 56px)' }}>
      {/* Session List */}
      <div className="w-72 shrink-0 border-r border-border flex flex-col bg-card/50">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-foreground">客服会话</h2>
            <p className="text-xs text-muted-foreground">{totalSessions} 个会话</p>
          </div>
          <Button variant="ghost" size="icon" className="w-7 h-7 text-muted-foreground hover:text-foreground" onClick={() => fetchSessions(0)}>
            <RefreshCw className="w-3.5 h-3.5" />
          </Button>
        </div>

        <ScrollArea className="flex-1">
          {loadingSessions && sessions.length === 0 ? (
            <div className="space-y-2 p-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-16 bg-secondary rounded-lg animate-pulse" />
              ))}
            </div>
          ) : sessions.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
              <MessageSquare className="w-8 h-8 mb-2 opacity-30" />
              <p className="text-sm">暂无会话</p>
            </div>
          ) : (
            <div className="p-2 space-y-1">
              {sessions.map(session => (
                <button
                  key={session.id}
                  onClick={() => selectSession(session)}
                  className={cn(
                    'w-full text-left p-3 rounded-lg transition-colors',
                    activeSession?.id === session.id
                      ? 'bg-primary/10 border border-primary/20'
                      : 'hover:bg-secondary/50'
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center shrink-0">
                        <User className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-foreground truncate">
                          {session.appUserNickname || `用户${session.appUserAccountId}`}
                        </div>
                        <div className="text-xs text-muted-foreground truncate">
                          {session.lastMessage || '暂无消息'}
                        </div>
                      </div>
                    </div>
                    <div className="shrink-0 text-right">
                      <div className="text-xs text-muted-foreground/60">{formatTime(session.lastMessageAt)}</div>
                      {(session.unreadCount || 0) > 0 && (
                        <div className="mt-1 w-5 h-5 rounded-full bg-primary flex items-center justify-center text-xs text-primary-foreground font-bold ml-auto">
                          {session.unreadCount}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className={cn('text-xs px-1.5 py-0.5 rounded', session.status === 'OPEN' ? 'badge-active' : 'badge-disabled')}>
                      {session.status === 'OPEN' ? '进行中' : '已关闭'}
                    </span>
                    {session.agentName && (
                      <span className="text-xs text-muted-foreground/60 truncate">代理: {session.agentName}</span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Chat Area */}
      {activeSession ? (
        <div className="flex-1 flex flex-col min-w-0">
          {/* Chat Header */}
          <div className="h-14 border-b border-border px-4 flex items-center justify-between shrink-0 bg-card/30">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                <User className="w-4 h-4 text-muted-foreground" />
              </div>
              <div>
                <div className="text-sm font-medium text-foreground">
                  {activeSession.appUserNickname || `用户${activeSession.appUserAccountId}`}
                </div>
                <div className="text-xs text-muted-foreground">
                  ID: {activeSession.appUserAccountId}
                  {activeSession.agentName && ` · 代理: ${activeSession.agentName}`}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={cn('text-xs px-2 py-0.5 rounded-full', activeSession.status === 'OPEN' ? 'badge-active' : 'badge-disabled')}>
                {activeSession.status === 'OPEN' ? '进行中' : '已关闭'}
              </span>
              {activeSession.status === 'OPEN' && (
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground h-7 text-xs" onClick={() => handleCloseSession(activeSession.id)}>
                  <X className="w-3.5 h-3.5 mr-1" />
                  关闭会话
                </Button>
              )}
            </div>
          </div>

          {/* Messages */}
          <ScrollArea className="flex-1 p-4">
            {loadingMessages ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className={cn('flex', i % 2 === 0 ? 'justify-start' : 'justify-end')}>
                    <div className="h-10 w-48 bg-secondary rounded-xl animate-pulse" />
                  </div>
                ))}
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
                <MessageSquare className="w-8 h-8 mb-2 opacity-30" />
                <p className="text-sm">暂无消息记录</p>
              </div>
            ) : (
              <div className="space-y-3">
                {messages.map(msg => {
                  const isAdmin = msg.senderType === 'ADMIN' || msg.senderType === 'AGENT';
                  const Icon = senderTypeIcon[msg.senderType] || User;
                  return (
                    <div key={msg.id} className={cn('flex gap-2', isAdmin ? 'flex-row-reverse' : 'flex-row')}>
                      <div className={cn('w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5', isAdmin ? 'bg-primary/20' : 'bg-secondary')}>
                        <Icon className={cn('w-3.5 h-3.5', isAdmin ? 'text-primary' : 'text-muted-foreground')} />
                      </div>
                      <div className={cn('max-w-xs lg:max-w-md', isAdmin ? 'items-end' : 'items-start')}>
                        <div className={cn('text-xs text-muted-foreground mb-1', isAdmin ? 'text-right' : 'text-left')}>
                          {msg.senderName || senderTypeLabel[msg.senderType]}
                          <span className="ml-2 opacity-60">{formatTime(msg.createdAt)}</span>
                        </div>
                        <div className={cn('px-3 py-2 rounded-xl text-sm', isAdmin ? 'chat-bubble-admin text-foreground' : 'chat-bubble-user text-foreground')}>
                          {msg.content}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
            )}
          </ScrollArea>

          {/* Input */}
          {activeSession.status === 'OPEN' && (
            <div className="border-t border-border p-3 bg-card/30 shrink-0">
              <div className="flex items-center gap-2">
                <Input
                  value={inputText}
                  onChange={e => setInputText(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                  placeholder="输入消息，Enter 发送..."
                  className="flex-1 bg-secondary/50 border-border"
                  disabled={sending}
                />
                <Button
                  onClick={handleSend}
                  disabled={!inputText.trim() || sending}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground h-9 px-4"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
          <MessageSquare className="w-16 h-16 mb-4 opacity-20" />
          <p className="text-lg font-medium">选择一个会话开始沟通</p>
          <p className="text-sm mt-1 opacity-60">从左侧列表选择用户会话</p>
        </div>
      )}
    </div>
  );
}
