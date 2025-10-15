'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import type { User } from '@supabase/supabase-js';
import toast from 'react-hot-toast';

export default function CreatePostForm({ user }: { user: User }) {
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!content || !category) {
      toast.error('请填写内容并选择一个分类！');
      return;
    }

    const { error } = await supabase.from('posts').insert([
      { 
        content: content, 
        category: category, 
        user_id: user.id
      }
    ]);

    if (error) {
      toast.error('发布失败：' + error.message);
    } else {
      toast.success('发布成功！');
      setContent('');
      setCategory('');
    }
  };

  return (
    // 注意，因为只剩下一个form，外层的 <> </> 也可以删掉了
    <form onSubmit={handleSubmit} className="flex w-full flex-col gap-4 rounded-lg bg-gray-800 p-4">
      <textarea
        name="content"
        placeholder={`你好, ${user.email}！有什么新鲜事想分享？`}
        rows={3}
        required
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="block w-full resize-none rounded-md border-gray-600 bg-gray-700 px-3 py-2 text-white placeholder-gray-400 focus:border-indigo-500 focus:ring-indigo-500"
      />
      <div className="flex items-center justify-between">
        <select
          name="category"
          required
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="rounded-md border-gray-600 bg-gray-700 px-3 py-2 text-white focus:border-indigo-500 focus:ring-indigo-500"
        >
          <option value="">选择一个分类</option>
          <option value="生活求助">生活求助</option>
          <option value="学业探讨">学业探讨</option>
          <option value="失物招领">失物招领</option>
        </select>
        <button
          type="submit"
          className="rounded-md bg-indigo-600 px-4 py-2 font-semibold text-white hover:bg-indigo-700"
        >
          发布
        </button>
      </div>
    </form>
  );
}