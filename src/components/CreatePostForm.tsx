'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import type { User } from '@supabase/supabase-js';
import toast from 'react-hot-toast';

// 1. 定义组件会接收一个名为 onPostCreated 的函数“道具”
type CreatePostFormProps = {
  user: User;
  onPostCreated: () => void; // 这是一个没有参数、没有返回值的函数
};

export default function CreatePostForm({ user, onPostCreated }: CreatePostFormProps) {
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!content || !category) { /* ... */ return; }

    const { error } = await supabase.from('posts').insert([/* ... */]);

    if (error) {
      toast.error('发布失败：' + error.message);
    } else {
      toast.success('发布成功！');
      setContent('');
      setCategory('');
      // 2. 发布成功后，拨打“热线电话”！
      onPostCreated();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex w-full flex-col gap-4 rounded-lg bg-gray-800 p-4">
      {/* ... (表单的JSX内容不变) ... */}
    </form>
  );
}