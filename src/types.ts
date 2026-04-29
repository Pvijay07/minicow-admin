export interface Community {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  createdAt: string;
  status: 'active' | 'archived';
}

export interface Channel {
  id: string;
  communityId: string;
  name: string;
  type: 'public' | 'private';
  postCount: number;
  createdAt: string;
}

export interface Post {
  id: string;
  channelId: string;
  authorName: string;
  title: string;
  content: string;
  status: 'published' | 'draft' | 'reported';
  createdAt: string;
  likes: number;
  comments: number;
}

export interface Report {
  id: string;
  postId: string;
  reason: string;
  reporter: string;
  status: 'pending' | 'resolved' | 'dismissed';
  createdAt: string;
}

export interface DashboardStats {
  totalUsers: number;
  totalPosts: number;
  totalCommunities: number;
  activeReports: number;
  growthData: { name: string; value: number }[];
}

export interface Ticket {
  id: string;
  ticket_number: string;
  user_id: string;
  user_type: string;
  category: string;
  subject: string;
  description: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  created_at: string;
  updated_at: string;
  user_name?: string;
}

export interface TicketMessage {
  id: string;
  ticket_id: string;
  sender_id: string;
  sender_type: 'user' | 'provider' | 'admin' | 'support';
  message: string | null;
  file_url: string | null;
  created_at: string;
  sender_name?: string;
  timestamp?: string;
}

export interface TicketCategory {
  id: string;
  name: string;
  description: string;
}
