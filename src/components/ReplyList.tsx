'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import ReplyCard from './ReplyCard';
import type { Reply } from '@/types';
import type { User } from '@supabase/supabase-js'; // 依然需要User类型给ReplyCard
import toast from 'react-hot-toast';

// 它现在只需要postId和user（透传给ReplyCard）
export default function ReplyList({ postId, user }: { postId: number; user: User | null }) {
  const [replies, setReplies] = useState<Reply[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReplies = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('replies_with_profiles')
        .select('*')
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      if (error) { console.error('Failed to fetch replies:', error); } 
      else { setReplies(data as Reply[]); }
      setLoading(false);
    };
    fetchReplies();
  }, [postId]);

  const handleDeleteReply = async (replyId: number) => {
    if (!window.confirm('确定要删除这条回复吗？')) { return; }
    const { error } = await supabase.from('replies').delete().match({ id: replyId });
    if (error) { toast.error('删除失败：' + error.message); } 
    else {
      setReplies(replies.filter((reply) => reply.id !== replyId));
      toast.success('删除成功！');
    }
  };

  if (loading) {
    return <p className="text-sm text-gray-400 py-2">正在加载回复...</p>;
  }

  return (
    <div className="flex w-full flex-col gap-3 pt-3">
      {replies.length > 0 ? (
        replies.map((reply) => (
          <ReplyCard 
            key={reply.id} 
            reply={reply} 
            user={user} 
            onDelete={handleDeleteReply}
          />
        ))
      ) : (
        <p className="text-sm text-gray-500">还没有人回复，快来抢沙发！</p>
      )}
    </div>
  );
}