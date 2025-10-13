'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import type { User } from '@supabase/supabase-js';

// 告诉组件，它会收到一个叫做`user`的“道具”，这个道具的类型是User
export default function CreatePostForm({ user }: { user: User }) {
  // 和登录框一样，创建“记忆黑板”来记住用户的输入
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // 一个简单的检查，确保内容和分类都填写了
    if (!content || !category) {
      alert('请填写内容并选择一个分类！');
      return;
    }

    // 调用Supabase的“插入数据”功能
    const { error } = await supabase.from('posts').insert([
      { 
        content: content, 
        category: category, 
        user_id: user.id // 从我们收到的“道具”user中，获取发帖人的ID
      }
    ]);

    if (error) {
      alert('发布失败：' + error.message);
    } else {
      alert('发布成功！');
      // 发布成功后，清空输入框
      setContent('');
      setCategory('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex w-full flex-col gap-4 rounded-lg bg-gray-800 p-4">
      <textarea
        name="content"
        placeholder={`你好, ${user.email}！有什么新鲜事想分享？`} // 我们可以用用户信息来个性化提示
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