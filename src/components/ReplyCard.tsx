// src/components/ReplyCard.tsx
import type { Reply } from '@/types';
import type { User } from '@supabase/supabase-js';

// 它现在接收 user 和 onDelete 这两个新“道具”
export default function ReplyCard({ reply, user, onDelete }: { reply: Reply, user: User | null, onDelete: (id: number) => void }) {
  return (
    <div className="w-full rounded-md bg-gray-700 p-3 group relative">
      <p className="text-gray-300">{reply.content}</p>
      <div className="mt-2 flex justify-end items-center text-xs text-gray-500">
        <span>{new Date(reply.created_at).toLocaleDateString()}</span>
        
        {/* 这是关键的条件渲染：只有当“当前登录用户存在”且“ID与回复作者ID匹配”时，才显示删除按钮 */}
        {user && user.id === reply.user_id && (
          <button
            onClick={() => onDelete(reply.id)} // 点击时，调用从父组件传来的onDelete函数
            className="ml-4 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
            title="删除此回复"
          >
            删除
          </button>
        )}
      </div>
    </div>
  );
}