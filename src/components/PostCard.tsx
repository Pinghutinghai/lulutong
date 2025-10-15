'use client';

import { useState } from 'react';
import type { Post } from '@/types';
import type { User } from '@supabase/supabase-js';
import ReplyList from './ReplyList';
import LikeButton from './LikeButton';
import BookmarkButton from './BookmarkButton';
import Link from 'next/link';
import CreateReplyForm from './CreateReplyForm'; // 1. 导入回复框

export default function PostCard({ post, user, onDelete }: { post: Post; user: User | null; onDelete: (id: number) => void; }) {
  const authorNickname = post.nickname || '匿名用户';
  const [repliesOpen, setRepliesOpen] = useState(false);

  return (
    <article className="w-full rounded-lg bg-gray-800 p-4 shadow-md group relative">
      {/* ... 删除按钮 (不变) ... */}

      {/* 帖子内容区 */}
      <div className="pb-3">
        <div className="mb-2 text-sm font-semibold text-white">
          {post.nickname ? ( <Link href={`/profile/${encodeURIComponent(post.nickname)}`} className="hover:underline">{authorNickname}</Link> ) : ( <span>{authorNickname}</span> )}
        </div>
        <p className="text-gray-200">{post.content}</p>
      </div>

      {/* 帖子元数据和操作按钮区 */}
      <div className="flex justify-between items-center text-sm text-gray-500">
        <div className="flex gap-4">
          <span>分类：{post.category}</span>
          <span>{new Date(post.created_at).toLocaleDateString()}</span>
        </div>
        <div className="flex items-center gap-4">
          <LikeButton postId={post.id} user={user} initialLikeCount={post.like_count} />
          <BookmarkButton postId={post.id} user={user} />
        </div>
      </div>

      {/* 2. 这是全新的回复区 */}
      <div className="border-t border-gray-700 mt-4 pt-4">
        {/* 回复框现在放在这里，只受登录状态影响 */}
        {user && <CreateReplyForm user={user} postId={post.id} />}

        {/* 折叠/展开按钮 */}
        <div className="mt-4">
          {post.reply_count > 0 ? (
            <button onClick={() => setRepliesOpen(!repliesOpen)} className="text-sm text-indigo-400 hover:underline">
              {repliesOpen ? '折叠回复 ▲' : `${post.reply_count} 条回复 ▼`}
            </button>
          ) : (
            // 当没有回复时，如果用户没登录，可以给个提示
            !user && <p className="text-sm text-gray-500">登录后可参与回复</p>
          )}

          {/* 折叠的回复列表 */}
          {repliesOpen && <ReplyList postId={post.id} user={user} />}
        </div>
      </div>
    </article>
  );
}