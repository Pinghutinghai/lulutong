'use client';
// src/components/CreateReplyForm.tsx
import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import type { User } from '@supabase/supabase-js';

// It needs to know who is replying (user) and to which post (postId)
export default function CreateReplyForm({ user, postId }: { user: User; postId: number }) {
  const [content, setContent] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!content.trim()) return; // Do not submit empty replies

    const { error } = await supabase.from('replies').insert([
      { 
        content: content, 
        post_id: postId, 
        user_id: user.id 
      }
    ]);

    if (error) {
      alert('回复失败：' + error.message);
    } else {
      alert('回复成功！');
      setContent(''); // Clear the input box after submission
      // In the future, we will make this update the list in real-time
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex w-full items-center gap-2">
      <textarea
        name="content"
        placeholder="发表你的看法..."
        rows={1}
        required
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="block w-full resize-none rounded-md border-gray-600 bg-gray-700 px-3 py-2 text-sm text-white placeholder-gray-400 focus:border-indigo-500 focus:ring-indigo-500"
      />
      <button
        type="submit"
        className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
      >
        回复
      </button>
    </form>
  );
}