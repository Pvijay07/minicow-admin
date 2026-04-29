import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Send, Paperclip, ChevronLeft, MoreVertical, Clock, Check, CheckCheck, User, ShieldCheck } from 'lucide-react';
import Pusher from 'pusher-js';
import { Ticket, TicketMessage } from '../types';
import { format } from 'date-fns';
import { supportApi, SITE_URL } from '../lib/api';

const PUSHER_KEY = '3c3318df787d87828310';
const PUSHER_CLUSTER = 'ap2';

export default function TicketChat() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [messages, setMessages] = useState<TicketMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const userId = localStorage.getItem('userId') || '1';
  const userName = localStorage.getItem('userName') || 'User';

  useEffect(() => {
    fetchTicketDetails();
    setupPusher();
  }, [id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchTicketDetails = async () => {
    try {
      const data = await supportApi.view(id!);
      setTicket(data.ticket);
      setMessages(data.messages);
    } catch (error) {
      console.error('Error fetching ticket:', error);
    }
  };

  const setupPusher = () => {
    const pusher = new Pusher(PUSHER_KEY, {
      cluster: PUSHER_CLUSTER,
    });

    const channel = pusher.subscribe(`ticket-${id}`);
    
    channel.bind('new-message', (data: TicketMessage) => {
      setMessages(prev => {
        if (prev.find(m => m.id === data.id)) return prev;
        return [...prev, data];
      });
    });

    channel.bind('typing', (data: any) => {
      if (data.sender_id != userId) {
        if (data.isTyping === '1') {
          setTypingUser(data.name);
        } else {
          setTypingUser(null);
        }
      }
    });

    channel.bind('status-updated', (data: any) => {
      setTicket(prev => prev ? { ...prev, status: data.status } : null);
    });

    return () => {
      pusher.unsubscribe(`ticket-${id}`);
    };
  };

  const scrollToBottom = () => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newMessage.trim()) return;

    const messageContent = newMessage;
    setNewMessage('');

    try {
      await supportApi.sendMessage({
        ticket_id: id,
        sender_id: userId,
        sender_type: 'support',
        message: messageContent
      });
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const uploadData = await supportApi.uploadFile(formData);

      if (uploadData.status === 'success') {
        await supportApi.sendMessage({
          ticket_id: id,
          sender_id: userId,
          sender_type: 'support',
          file_url: uploadData.file_url
        });
      }
    } catch (error) {
      console.error('Error uploading file:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);
    if (!isTyping) {
      setIsTyping(true);
      sendTypingStatus(true);
      setTimeout(() => {
        setIsTyping(false);
        sendTypingStatus(false);
      }, 3000);
    }
  };

  const sendTypingStatus = (status: boolean) => {
    supportApi.typing({
      ticket_id: id,
      name: userName,
      sender_id: userId,
      sender_type: 'support',
      isTyping: status ? '1' : '0'
    }).catch(() => {});
  };

  if (!ticket) return <div className="p-12 text-center text-gray-500">Loading chat...</div>;

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/support')}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ChevronLeft size={24} className="text-gray-600" />
          </button>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-gray-900">{ticket.subject}</h2>
              <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                ticket.status === 'open' ? 'bg-blue-100 text-blue-700' : 
                ticket.status === 'resolved' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
              }`}>
                {ticket.status}
              </span>
            </div>
            <p className="text-xs text-gray-500">Ticket #{ticket.ticket_number}</p>
          </div>
        </div>
        <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <MoreVertical size={20} className="text-gray-400" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((msg, index) => {
          const isMe = msg.sender_type === 'support' || msg.sender_type === 'admin';
          const showAvatar = index === 0 || messages[index - 1].sender_type !== msg.sender_type;

          return (
            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex gap-3 max-w-[80%] ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                {!isMe && showAvatar && (
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
                    <User size={18} className="text-slate-600" />
                  </div>
                )}
                <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                  {showAvatar && (
                    <span className="text-xs font-medium text-gray-400 mb-1 px-1">
                      {isMe ? 'You (Support)' : msg.sender_name || 'User'}
                    </span>
                  )}
                  <div className={`rounded-2xl px-4 py-2.5 shadow-sm ${
                    isMe 
                    ? 'bg-indigo-600 text-white rounded-tr-none' 
                    : 'bg-white text-gray-800 rounded-tl-none border border-gray-100'
                  }`}>
                    {msg.message && <p className="text-sm leading-relaxed">{msg.message}</p>}
                    {msg.file_url && (
                      <div className="mt-1">
                        <a 
                          href={`${SITE_URL}/${msg.file_url}`} 
                          target="_blank" 
                          rel="noreferrer"
                          className={`flex items-center gap-2 p-2 rounded-lg text-sm ${
                            isMe ? 'bg-white/10 hover:bg-white/20' : 'bg-gray-50 hover:bg-gray-100'
                          }`}
                        >
                          <Paperclip size={16} />
                          Attachment
                        </a>
                      </div>
                    )}
                    <div className={`flex items-center gap-1 mt-1.5 ${isMe ? 'text-indigo-100' : 'text-gray-400'}`}>
                      <span className="text-[10px] uppercase font-medium">
                        {format(new Date(msg.created_at), 'h:mm a')}
                      </span>
                      {isMe && <CheckCheck size={12} />}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        {typingUser && (
          <div className="flex justify-start">
            <div className="bg-white rounded-full px-4 py-2 border border-gray-100 shadow-sm">
              <span className="text-xs text-gray-500 italic">{typingUser} is typing...</span>
            </div>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      {/* Input */}
      <div className="bg-white border-t border-gray-200 p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        {ticket.status === 'closed' || ticket.status === 'resolved' ? (
          <div className="p-2 text-center text-gray-500 text-sm bg-gray-50 rounded-lg">
            This ticket is {ticket.status}. Re-open it by sending a new message.
          </div>
        ) : (
          <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto flex items-end gap-3">
            <div className="flex-1 relative bg-gray-50 rounded-2xl border border-gray-200 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/10 transition-all">
              <input
                type="text"
                placeholder="Type your message..."
                className="w-full bg-transparent pl-4 pr-12 py-3 focus:outline-none"
                value={newMessage}
                onChange={handleTyping}
              />
              <div className="absolute right-2 bottom-2 flex gap-1">
                <label className="p-2 hover:bg-gray-200 rounded-full transition-colors cursor-pointer text-gray-400 hover:text-gray-600">
                  <input type="file" className="hidden" onChange={handleFileUpload} disabled={uploading} />
                  <Paperclip size={20} />
                </label>
              </div>
            </div>
            <button
              type="submit"
              disabled={!newMessage.trim() || uploading}
              className="p-3 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-all shadow-indigo-200 shadow-lg disabled:opacity-50 disabled:shadow-none"
            >
              <Send size={24} />
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
