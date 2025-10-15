'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import type { User } from '@supabase/supabase-js';

type LikeButtonProps = {
  postId: number;
  user: User | null;
  initialLikeCount: number;
};

export default function LikeButton({ postId, user, initialLikeCount }: LikeButtonProps) {
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [isLiked, setIsLiked] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // When the component loads, check if the current user has already liked this post
    const checkLikeStatus = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      const { data, error } = await supabase
        .from('likes')
        .select('*')
        .eq('post_id', postId)
        .eq('user_id', user.id)
        .single(); // We only expect one or zero rows

      if (data) {
        setIsLiked(true);
      }
      setLoading(false);
    };
    checkLikeStatus();
  }, [postId, user]);

  const handleLike = async () => {
    if (!user) {
      alert('请先登录再点赞！');
      return;
    }

    if (isLiked) {
      // Optimistic unlike
      setIsLiked(false);
      setLikeCount(likeCount - 1);
      // Send request to backend
      await supabase.from('likes').delete().match({ post_id: postId, user_id: user.id });
    } else {
      // Optimistic like
      setIsLiked(true);
      setLikeCount(likeCount + 1);
      // Send request to backend
      await supabase.from('likes').insert({ post_id: postId, user_id: user.id });
    }
  };

  return (
    <button
      onClick={handleLike}
      disabled={loading || !user}
      className={`flex items-center gap-1 text-sm transition-colors ${
        isLiked ? 'text-red-500' : 'text-gray-400 hover:text-red-500'
      }`}
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
      </svg>
      <span>{likeCount}</span>
    </button>
  );
}