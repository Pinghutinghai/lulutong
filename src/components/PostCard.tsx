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
      {/* --- 删除按钮代码开始 --- */}
      {user && user.id === post.user_id && (
        <button
          onClick={() => onDelete(post.id)}
          className="absolute top-2 right-2 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-full bg-gray-700 hover:bg-gray-600 z-10" // 添加 z-index 确保按钮在顶层
          title="删除此帖"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </button>
      )}
      {/* --- 删除按钮代码结束 --- */}

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

      {/* 回复区 */}
      <div className="border-t border-gray-700 mt-4 pt-4">
        {user && <CreateReplyForm user={user} postId={post.id} />}
        <div className="mt-4">
          {post.reply_count > 0 ? (
            <button onClick={() => setRepliesOpen(!repliesOpen)} className="text-sm text-indigo-400 hover:underline">
              {repliesOpen ? '折叠回复 ▲' : `${post.reply_count} 条回复 ▼`}
            </button>
          ) : (
            !user && <p className="text-sm text-gray-500">登录后可参与回复</p>
          )}
          {repliesOpen && <ReplyList postId={post.id} user={user} />}
        </div>
      </div>
    </article>
  );
}