import React, { useState, useEffect } from 'react';
import { Plus, MessageSquare, Clock, CheckCircle, AlertCircle, Search, Filter, ChevronRight, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Ticket, TicketCategory } from '../types';
import { format } from 'date-fns';
import { supportApi } from '../lib/api';

export default function Support() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [categories, setCategories] = useState<TicketCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewTicket, setShowNewTicket] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  
  const navigate = useNavigate();
  const userId = localStorage.getItem('userId') || '1'; // Mock user ID for now

  useEffect(() => {
    fetchTickets();
    fetchCategories();
  }, []);

  const fetchTickets = async () => {
    const params = new URLSearchParams(window.location.search);
    const userIdParam = params.get('userId');
    
    try {
      const response = userIdParam 
        ? await supportApi.list(userIdParam)
        : await supportApi.listAll();
        
      setTickets(response);
    } catch (error) {
      console.error('Error fetching tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await supportApi.getCategories();
      if (response.status === 'success') {
        setCategories(response.data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-blue-100 text-blue-700';
      case 'in_progress': return 'bg-yellow-100 text-yellow-700';
      case 'resolved': return 'bg-green-100 text-green-700';
      case 'closed': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-600';
      case 'high': return 'text-orange-600';
      case 'medium': return 'text-blue-600';
      case 'low': return 'text-gray-600';
      default: return 'text-gray-600';
    }
  };

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          ticket.ticket_number.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || ticket.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Support Tickets</h1>
          <p className="text-gray-500">
            {new URLSearchParams(window.location.search).get('userId') 
              ? `Showing tickets for User #${new URLSearchParams(window.location.search).get('userId')}`
              : 'Manage and track support requests from all users'}
          </p>
        </div>
        <div className="flex gap-3">
          {new URLSearchParams(window.location.search).get('userId') && (
            <button
              onClick={() => {
                navigate('/support');
                window.location.reload();
              }}
              className="flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Show All
            </button>
          )}
          <button
            onClick={() => setShowNewTicket(true)}
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
          >
            <Plus size={20} />
            New Ticket
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex flex-col md:flex-row gap-4 justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search by subject or ticket ID..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <select
              className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-gray-500">Loading tickets...</div>
        ) : filteredTickets.length === 0 ? (
          <div className="p-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-50 rounded-full mb-4">
              <MessageSquare className="text-gray-400" size={32} />
            </div>
            <h3 className="text-lg font-medium text-gray-900">No tickets found</h3>
            <p className="text-gray-500 mt-1">Try adjusting your search or create a new ticket</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredTickets.map((ticket) => (
              <div
                key={ticket.id}
                onClick={() => navigate(`/support/${ticket.id}`)}
                className="p-4 hover:bg-gray-50 transition-colors cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-start gap-4">
                    <div className={`mt-1 p-2 rounded-lg ${getStatusColor(ticket.status)}`}>
                      {ticket.status === 'resolved' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">{ticket.ticket_number}</span>
                        <span className={`text-xs font-bold uppercase ${getPriorityColor(ticket.priority)}`}>
                          • {ticket.priority} Priority
                        </span>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
                        {ticket.subject}
                      </h3>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <User size={14} />
                          {ticket.user_name || 'Anonymous User'}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock size={14} />
                          {format(new Date(ticket.created_at), 'MMM d, yyyy h:mm a')}
                        </span>
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="text-gray-300 group-hover:text-indigo-400 transition-colors" size={20} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showNewTicket && (
        <NewTicketModal 
          onClose={() => setShowNewTicket(false)} 
          categories={categories}
          userId={userId}
          onSuccess={() => {
            setShowNewTicket(false);
            fetchTickets();
          }}
        />
      )}
    </div>
  );
}

function NewTicketModal({ onClose, categories, userId, onSuccess }: { 
  onClose: () => void, 
  categories: TicketCategory[], 
  userId: string,
  onSuccess: () => void 
}) {
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState('');
  const [priority, setPriority] = useState('medium');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const response = await supportApi.create({
        user_id: userId,
        subject,
        category,
        priority,
        description
      });
      if (response.status === 'success') {
        onSuccess();
      }
    } catch (error) {
      console.error('Error creating ticket:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl animate-in fade-in zoom-in duration-200">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">Create New Support Ticket</h2>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
            <input
              required
              type="text"
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              placeholder="Briefly describe the issue"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                required
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="">Select Category</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
              <select
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Detailed Description</label>
            <textarea
              required
              rows={4}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              placeholder="Please provide as much detail as possible..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
            >
              {submitting ? 'Creating...' : 'Create Ticket'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
