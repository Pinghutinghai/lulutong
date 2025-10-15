'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import type { User } from '@supabase/supabase-js';

type BookmarkButtonProps = {
  postId: number;
  user: User | null;
};

export default function BookmarkButton({ postId, user }: BookmarkButtonProps) {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [loading, setLoading] = useState(true);

  // 当组件加载时，检查当前用户是否已经收藏过这个帖子
  useEffect(() => {
    const checkBookmarkStatus = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      const { data, error } = await supabase
        .from('bookmarks')
        .select('*')
        .eq('post_id', postId)
        .eq('user_id', user.id)
        .single();

      if (data) {
        setIsBookmarked(true);
      }
      setLoading(false);
    };

    checkBookmarkStatus();
  }, [postId, user]);

  // 处理点击事件
  const handleBookmark = async () => {
    if (!user) {
      alert('请先登录再收藏！');
      return;
    }

    if (isBookmarked) {
      // 如果已收藏，则取消收藏（删除记录）
      setIsBookmarked(false);
      await supabase.from('bookmarks').delete().match({ post_id: postId, user_id: user.id });
    } else {
      // 如果未收藏，则添加收藏（插入记录）
      setIsBookmarked(true);
      await supabase.from('bookmarks').insert({ post_id: postId, user_id: user.id });
    }
  };

  return (
    <button
      onClick={handleBookmark}
      disabled={loading || !user}
      className={`flex items-center transition-colors ${
        isBookmarked ? 'text-yellow-400' : 'text-gray-400 hover:text-yellow-400'
      }`}
      title={isBookmarked ? '取消收藏' : '收藏'}
    >
      {/* 这是一个书签的SVG图标 */}
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
      </svg>
    </button>
  );
}