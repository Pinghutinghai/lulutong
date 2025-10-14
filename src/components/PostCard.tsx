// src/components/PostCard.tsx
import type { Post } from '@/types';
import type { User } from '@supabase/supabase-js';
import ReplyList from './ReplyList';

export default function PostCard({ post, user, onDelete }: { post: Post; user: User | null; onDelete: (id: number) => void; }) {
  // 从post数据中提取昵称，如果不存在，就显示“匿名用户”
  const authorNickname = post.nickname || '匿名用户';

  return (
    <article className="w-full rounded-lg bg-gray-800 p-4 shadow-md group relative">
      {user && user.id === post.user_id && (
        <button
          onClick={() => onDelete(post.id)}
          className="absolute top-2 right-2 text-xs text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-full bg-gray-700 hover:bg-red-500 hover:text-white"
          title="删除此帖子"
        >
          ✕
        </button>
      )}

      <div className="border-b border-gray-700 pb-3">
        {/* 这是我们新添加的昵称显示区域 */}
        <div className="mb-2 text-sm font-semibold text-white">{authorNickname}</div>
        
        <p className="text-gray-200">{post.content}</p>
        <div className="flex justify-between text-sm text-gray-500 mt-3">
          <span>分类：{post.category}</span>
          <span>{new Date(post.created_at).toLocaleDateString()}</span>
        </div>
      </div>
      
      <ReplyList postId={post.id} user={user} />
    </article>
  );
}