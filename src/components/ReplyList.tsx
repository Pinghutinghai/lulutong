'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import ReplyCard from './ReplyCard';
import CreateReplyForm from './CreateReplyForm';
import type { Reply } from '@/types';
import type { User } from '@supabase/supabase-js';

export default function ReplyList({ postId, user }: { postId: number; user: User | null }) {
  const [replies, setReplies] =useState<Reply[]>([]);
  const [loading, setLoading] = useState(true);

  // 把获取回复的逻辑封装成一个可重用的函数
  const fetchReplies = async () => {
    const { data, error } = await supabase.from('replies').select('*').eq('post_id', postId).order('created_at', { ascending: true });
    if (error) {
      console.error('Failed to fetch replies:', error);
      setReplies([]);
    } else {
      setReplies(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchReplies();
  }, [postId]);

  // 这是新的删除处理函数
  const handleDeleteReply = async (replyId: number) => {
    // 弹窗确认，防止误触
    if (!window.confirm('确定要删除这条回复吗？')) {
      return;
    }

    const { error } = await supabase.from('replies').delete().match({ id: replyId });

    if (error) {
      alert('删除失败：' + error.message);
    } else {
      // 删除成功后，从前端的“记忆黑板”里也移除这一条，实现即时刷新
      setReplies(replies.filter((reply) => reply.id !== replyId));
      alert('删除成功！');
    }
  };

  if (loading) {
    return <p className="text-sm text-gray-400">正在加载回复...</p>;
  }

  return (
    <div className="mt-4 flex w-full flex-col gap-3 pl-4 border-l-2 border-gray-700">
      {user && <CreateReplyForm user={user} postId={postId} />}

      {replies.length > 0 ? (
        replies.map((reply) => (
          <ReplyCard 
            key={reply.id} 
            reply={reply} 
            user={user} 
            onDelete={handleDeleteReply} // 把删除函数作为“道具”传下去
          />
        ))
      ) : (
        <p className="text-sm text-gray-500">还没有人回复，快来抢沙发！</p>
      )}
    </div>
  );
}