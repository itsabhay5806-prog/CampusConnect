import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { api } from '../../services/api';
import { EmptyState } from '../../components/common/EmptyState';
import {
  MessageSquare,
  Send,
  Search,
  CheckCircle2,
  Clock,
  ShieldAlert,
  User,
  Sparkles,
} from 'lucide-react';

interface ConversationItem {
  _id: string;
  participants: Array<{
    _id: string;
    name: string;
    avatarUrl?: string;
    department?: string;
  }>;
  lastMessage?: {
    content: string;
    sender: string;
    createdAt: string;
  };
  updatedAt: string;
}

interface MessageItem {
  _id: string;
  conversation: string;
  sender: {
    _id: string;
    name: string;
    avatarUrl?: string;
  };
  content: string;
  createdAt: string;
}

export const MessagesPage: React.FC = () => {
  const { user } = useAuth();
  const { socket, isConnected, joinConversation, leaveConversation } = useSocket();

  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [selectedConvo, setSelectedConvo] = useState<ConversationItem | null>(null);
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoadingConvos, setIsLoadingConvos] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [search, setSearch] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchConversations = async () => {
    setIsLoadingConvos(true);
    try {
      const res = await api.get('/messages/conversations');
      if (res.success && res.data) {
        setConversations(res.data);
        if (res.data.length > 0 && !selectedConvo) {
          setSelectedConvo(res.data[0]);
        }
      }
    } catch (err) {
      console.error('Failed to load conversations:', err);
    } finally {
      setIsLoadingConvos(false);
    }
  };

  const fetchMessages = async (convoId: string) => {
    setIsLoadingMessages(true);
    try {
      const res = await api.get(`/messages/conversations/${convoId}/messages`);
      if (res.success && res.data) {
        setMessages(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch messages:', err);
    } finally {
      setIsLoadingMessages(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (!selectedConvo) return;
    fetchMessages(selectedConvo._id);
    joinConversation(selectedConvo._id);

    return () => {
      leaveConversation(selectedConvo._id);
    };
  }, [selectedConvo?._id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Socket listener for new messages
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (newMsg: MessageItem) => {
      if (selectedConvo && newMsg.conversation === selectedConvo._id) {
        setMessages((prev) => [...prev, newMsg]);
      }
      // Update snippet in conversations list
      setConversations((prev) =>
        prev.map((c) =>
          c._id === newMsg.conversation
            ? {
                ...c,
                lastMessage: {
                  content: newMsg.content,
                  sender: newMsg.sender._id,
                  createdAt: newMsg.createdAt,
                },
                updatedAt: newMsg.createdAt,
              }
            : c
        )
      );
    };

    socket.on('new_message', handleNewMessage);
    return () => {
      socket.off('new_message', handleNewMessage);
    };
  }, [socket, selectedConvo]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !selectedConvo) return;

    const text = inputText.trim();
    setInputText('');

    try {
      const res = await api.post(`/messages/conversations/${selectedConvo._id}/messages`, {
        content: text,
      });
      if (res.success && res.data) {
        setMessages((prev) => [...prev, res.data]);
        // Update snippet
        setConversations((prev) =>
          prev.map((c) =>
            c._id === selectedConvo._id
              ? {
                  ...c,
                  lastMessage: {
                    content: res.data.content,
                    sender: user!._id,
                    createdAt: res.data.createdAt,
                  },
                }
              : c
          )
        );
      }
    } catch (err: any) {
      alert(err.message || 'Failed to send message');
    }
  };

  const getOtherParticipant = (convo: ConversationItem) => {
    return convo.participants?.find((p) => p._id !== user?._id) || convo.participants?.[0];
  };

  const filteredConvos = conversations.filter((c) => {
    const other = getOtherParticipant(c);
    return other?.name?.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden flex flex-col md:flex-row h-[calc(100vh-8.5rem)]">
      {/* Left Sidebar: Conversations List */}
      <div className="w-full md:w-80 border-r border-slate-200/80 flex flex-col flex-shrink-0 bg-slate-50/50">
        <div className="p-4 border-b border-slate-200/80">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-brand-600" />
              Direct Messages
            </h2>
            <div className="flex items-center gap-1.5 text-[10px] text-emerald-600 font-semibold px-2 py-0.5 bg-emerald-50 rounded-full border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live
            </div>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search classmates..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
          {isLoadingConvos ? (
            <div className="p-6 text-center text-xs text-slate-400">Loading chats...</div>
          ) : filteredConvos.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-400">
              No conversations yet. Message a classmate from their profile or post!
            </div>
          ) : (
            filteredConvos.map((c) => {
              const other = getOtherParticipant(c);
              const isSelected = selectedConvo?._id === c._id;
              return (
                <button
                  key={c._id}
                  onClick={() => setSelectedConvo(c)}
                  className={`w-full p-3 flex items-start gap-3 text-left transition-colors ${
                    isSelected ? 'bg-brand-50/80' : 'hover:bg-slate-100/60'
                  }`}
                >
                  <img
                    src={
                      other?.avatarUrl ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(
                        other?.name || 'User'
                      )}&background=1e3a8a&color=fff`
                    }
                    alt={other?.name}
                    className="w-10 h-10 rounded-full object-cover ring-2 ring-brand-100 flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-slate-900 truncate">{other?.name}</p>
                      {c.lastMessage && (
                        <span className="text-[10px] text-slate-400">
                          {new Date(c.lastMessage.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 truncate mt-0.5">
                      {c.lastMessage?.content || 'Started a conversation'}
                    </p>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Right Area: Chat Window */}
      <div className="flex-1 flex flex-col bg-white">
        {selectedConvo ? (
          <>
            {/* Header */}
            {(() => {
              const other = getOtherParticipant(selectedConvo);
              return (
                <div className="p-4 border-b border-slate-200/80 flex items-center justify-between bg-white">
                  <div className="flex items-center gap-3">
                    <img
                      src={
                        other?.avatarUrl ||
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(
                          other?.name || 'User'
                        )}&background=1e3a8a&color=fff`
                      }
                      alt={other?.name}
                      className="w-9 h-9 rounded-full object-cover ring-2 ring-brand-100"
                    />
                    <div>
                      <h3 className="text-xs font-bold text-slate-900">{other?.name}</h3>
                      <p className="text-[10px] text-slate-500">
                        {other?.department || 'Verified Student'}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Messages Body */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/40">
              {isLoadingMessages ? (
                <div className="text-center py-10 text-xs text-slate-400">Loading messages...</div>
              ) : messages.length === 0 ? (
                <div className="text-center py-16 text-slate-400 space-y-1">
                  <Sparkles className="w-6 h-6 mx-auto text-brand-300" />
                  <p className="text-xs font-semibold">Say hello to your fellow student!</p>
                  <p className="text-[11px]">All communications are subject to campus honor code.</p>
                </div>
              ) : (
                messages.map((m) => {
                  const isMine = m.sender._id === user?._id;
                  return (
                    <div
                      key={m._id}
                      className={`flex items-end gap-2 ${isMine ? 'justify-end' : 'justify-start'}`}
                    >
                      {!isMine && (
                        <img
                          src={
                            m.sender.avatarUrl ||
                            `https://ui-avatars.com/api/?name=${encodeURIComponent(
                              m.sender.name || 'User'
                            )}&background=1e3a8a&color=fff`
                          }
                          alt={m.sender.name}
                          className="w-6 h-6 rounded-full object-cover mb-1"
                        />
                      )}
                      <div
                        className={`max-w-[70%] px-3.5 py-2 rounded-2xl text-xs leading-relaxed ${
                          isMine
                            ? 'bg-brand-600 text-white rounded-br-xs shadow-xs'
                            : 'bg-white text-slate-800 rounded-bl-xs border border-slate-200/80 shadow-xs'
                        }`}
                      >
                        <p>{m.content}</p>
                        <span
                          className={`block text-[9px] mt-1 text-right ${
                            isMine ? 'text-brand-200' : 'text-slate-400'
                          }`}
                        >
                          {new Date(m.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <form
              onSubmit={handleSendMessage}
              className="p-3 bg-white border-t border-slate-200/80 flex items-center gap-2"
            >
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 text-xs px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 text-slate-800"
              />
              <button
                type="submit"
                disabled={!inputText.trim()}
                className="p-2 bg-brand-600 hover:bg-brand-700 disabled:opacity-40 text-white rounded-xl shadow-xs transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center p-8 text-center text-slate-400">
            <div>
              <MessageSquare className="w-10 h-10 mx-auto text-slate-300 mb-2" />
              <p className="text-xs font-semibold">Select a conversation to start chatting</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
