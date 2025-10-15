'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import type { User } from '@supabase/supabase-js';
import toast from 'react-hot-toast';

export default function CreateReplyForm({ user, postId }: { user: User; postId: number }) {
  const [content, setContent] = useState('');
  // 1. 新增一个state来管理匿名状态
  const [isAnonymous, setIsAnonymous] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!content.trim()) return;

    const { error } = await supabase.from('replies').insert([
      { 
        content: content, 
        post_id: postId, 
        user_id: user.id,
        is_anonymous: isAnonymous, // 2. 把匿名状态也一起提交
      }
    ]);

    if (error) {
      toast.error('回复失败：' + error.message);
    } else {
      toast.success('回复成功！');
      setContent('');
      setIsAnonymous(false); // 提交后重置
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex w-full flex-col gap-2">
      <textarea
        name="content"
        placeholder="发表你的看法..."
        rows={1}
        required
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="block w-full resize-none rounded-md border-gray-600 bg-gray-700 px-3 py-2 text-sm text-white placeholder-gray-400 focus:border-indigo-500 focus:ring-indigo-500"
      />
      <div className="flex items-center justify-between">
        {/* 3. 这是我们新增的匿名复选框 */}
        <div className="flex items-center gap-2">
          <input
            id="anonymous-reply"
            type="checkbox"
            checked={isAnonymous}
            onChange={(e) => setIsAnonymous(e.target.checked)}
            className="h-4 w-4 rounded border-gray-600 bg-gray-800 text-indigo-600 focus:ring-indigo-600"
          />
          <label htmlFor="anonymous-reply" className="text-sm text-gray-400">
            匿名回复
          </label>
        </div>
        <button
          type="submit"
          className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
        >
          回复
        </button>
      </div>
    </form>
  );
}