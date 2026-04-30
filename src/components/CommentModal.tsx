import React, { useState, useEffect } from 'react';
import { X, Send, Trash2, Reply, Loader2, MessageSquare } from 'lucide-react';
import { adminApi } from '@/src/lib/api';

interface CommentModalProps {
  postId: number;
  postText: string;
  onClose: () => void;
}

export default function CommentModal({ postId, postText, onClose }: CommentModalProps) {
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchComments();
  }, [postId]);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getComments(postId);
      setComments(res.data || []);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch comments');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      setSubmitting(true);
      if (replyingTo) {
        await adminApi.addReply({
          parent_comment_id: replyingTo.id,
          comment: newComment,
        });
      } else {
        await adminApi.addComment({
          post_id: postId,
          comment: newComment,
        });
      }
      setNewComment('');
      setReplyingTo(null);
      fetchComments();
    } catch (err: any) {
      alert(err.message || 'Failed to post comment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (commentId: number) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return;
    try {
      await adminApi.deleteComment(commentId);
      setComments(comments.filter(c => c.id !== commentId));
    } catch (err: any) {
      alert(err.message || 'Failed to delete comment');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl h-[80vh] rounded-[32px] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-600 rounded-2xl text-white shadow-lg shadow-indigo-100">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900">Post Comments</h3>
              <p className="text-xs text-slate-500 mt-0.5 line-clamp-1 max-w-[300px]">"{postText}"</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-200 rounded-xl transition-all text-slate-400 hover:text-slate-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Comments List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/30">
          {loading ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
              <p className="text-sm font-medium">Loading comments...</p>
            </div>
          ) : error ? (
            <div className="p-4 bg-rose-50 text-rose-600 rounded-2xl text-sm font-medium text-center">
              {error}
            </div>
          ) : comments.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-2">
              <MessageSquare className="w-12 h-12 opacity-20" />
              <p className="text-sm font-medium">No comments yet. Be the first to reply!</p>
            </div>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="space-y-4">
                <div className="flex gap-4 group">
                  <div className="w-10 h-10 rounded-full bg-slate-200 flex-shrink-0 overflow-hidden ring-2 ring-white shadow-sm">
                    {comment.profile_url ? (
                      <img src={comment.profile_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400 bg-slate-100 font-bold">
                        {comment.name?.charAt(0) || 'U'}
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="bg-white p-4 rounded-[20px] rounded-tl-none shadow-sm border border-slate-100 group-hover:border-indigo-100 transition-colors">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-bold text-slate-900">{comment.name}</span>
                        <span className="text-[10px] text-slate-400 font-medium">{new Date(comment.created_at).toLocaleString()}</span>
                      </div>
                      <p className="text-sm text-slate-700 leading-relaxed">{comment.comment}</p>
                    </div>
                    <div className="flex items-center gap-4 mt-2 ml-1">
                      <button 
                        onClick={() => setReplyingTo(comment)}
                        className="text-[10px] font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 uppercase tracking-wider"
                      >
                        <Reply className="w-3 h-3" />
                        Reply
                      </button>
                      <button 
                        onClick={() => handleDelete(comment.id)}
                        className="text-[10px] font-bold text-rose-500 hover:text-rose-600 flex items-center gap-1 uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="w-3 h-3" />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>

                {/* Replies */}
                {comment.replies?.map((reply: any) => (
                  <div key={reply.id} className="flex gap-4 ml-12 group">
                    <div className="w-8 h-8 rounded-full bg-slate-200 flex-shrink-0 overflow-hidden ring-2 ring-white shadow-sm">
                      {reply.profile_url ? (
                        <img src={reply.profile_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400 bg-slate-100 font-bold text-xs">
                          {reply.name?.charAt(0) || 'A'}
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="bg-indigo-50/50 p-3 rounded-[16px] rounded-tl-none border border-indigo-100/50 shadow-sm group-hover:bg-indigo-50 transition-colors">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold text-indigo-900">{reply.name} {reply.is_admin ? '(Admin)' : ''}</span>
                          <span className="text-[10px] text-indigo-400 font-medium">{new Date(reply.created_at).toLocaleString()}</span>
                        </div>
                        <p className="text-xs text-slate-700 leading-relaxed">{reply.comment}</p>
                      </div>
                      <div className="flex items-center gap-4 mt-1.5 ml-1">
                        <button 
                          onClick={() => handleDelete(reply.id)}
                          className="text-[10px] font-bold text-rose-500 hover:text-rose-600 flex items-center gap-1 uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="w-2.5 h-2.5" />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ))
          )}
        </div>

        {/* Footer / Input */}
        <div className="p-6 border-t border-slate-100 bg-white">
          {replyingTo && (
            <div className="mb-4 p-3 bg-indigo-50 rounded-2xl flex items-center justify-between border border-indigo-100 animate-in slide-in-from-bottom-2">
              <div className="flex items-center gap-3">
                <Reply className="w-4 h-4 text-indigo-600" />
                <p className="text-xs text-indigo-700">
                  Replying to <span className="font-bold">{replyingTo.name}</span>
                </p>
              </div>
              <button 
                onClick={() => setReplyingTo(null)}
                className="p-1 hover:bg-indigo-100 rounded-lg text-indigo-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
          <form onSubmit={handleSubmit} className="relative">
            <textarea 
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder={replyingTo ? "Write a reply..." : "Write a comment..."}
              className="w-full pl-6 pr-16 py-4 bg-slate-100 border-none rounded-[24px] focus:ring-4 focus:ring-indigo-500/10 transition-all resize-none text-sm text-slate-800 placeholder:text-slate-400"
              rows={2}
            />
            <button 
              type="submit"
              disabled={submitting || !newComment.trim()}
              className="absolute right-3 bottom-3 p-3 bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:shadow-none"
            >
              {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
