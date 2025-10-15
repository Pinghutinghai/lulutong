// src/components/ReplyCard.tsx
import type { Reply } from '@/types';
import type { User } from '@supabase/supabase-js';
import Link from 'next/link';

export default function ReplyCard({ reply, user, onDelete }: { reply: Reply, user: User | null, onDelete: (id: number) => void }) {
  // 1. 根据is_anonymous和nickname是否存在，决定最终显示的作者名
  const authorDisplayName = reply.is_anonymous ? '匿名用户' : (reply.nickname || '匿名用户');
  // 2. 决定是否要添加链接
  const canLinkToProfile = !reply.is_anonymous && reply.nickname;

  return (
    <div className="w-full rounded-md bg-gray-700 p-3 group relative">
      <div className="flex items-center justify-between text-xs mb-2 text-gray-400">
        {/* 3. 这是我们新的、智能的作者显示区域 */}
        {canLinkToProfile ? (
          <Link href={`/profile/${encodeURIComponent(reply.nickname!)}`} className="font-semibold text-white hover:underline">
            {authorDisplayName}
          </Link>
        ) : (
          <span className="font-semibold text-white">{authorDisplayName}</span>
        )}
      </div>
      
      <p className="text-gray-300">{reply.content}</p>

      <div className="mt-2 flex justify-end items-center text-xs text-gray-500">
        <span>{new Date(reply.created_at).toLocaleDateString()}</span>
        {user && user.id === reply.user_id && (
          <button onClick={() => onDelete(reply.id)} className="ml-4 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity" title="删除此回复">
            删除
          </button>
        )}
      </div>
    </div>
  );
}