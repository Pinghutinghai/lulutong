'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import type { User } from '@supabase/supabase-js';
import toast from 'react-hot-toast';

// 假设 CATEGORIES 定义在这里或从外部导入，我们这里直接定义
const CATEGORIES = ['生活求助', '学业探讨', '失物招领'];

type CreatePostFormProps = {
  user: User;
  onPostCreated: () => void;
};

export default function CreatePostForm({ user, onPostCreated }: CreatePostFormProps) {
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!content.trim() || !category) {
      toast.error('请填写内容并选择一个分类！'); // 改进了空内容提示
      return;
    }

    // 在插入数据时，明确包含 user_id
    const { error } = await supabase.from('posts').insert([
      { 
        content: content, 
        category: category, 
        user_id: user.id // 确保 user_id 被包含
      }
    ]);

    if (error) {
      toast.error('发布失败：' + error.message);
    } else {
      toast.success('发布成功！');
      setContent('');
      setCategory(''); // 重置分类为空字符串，以便占位符显示
      onPostCreated();
    }
  };

  return (
    // 这是包含完整 JSX 的表单
    <form onSubmit={handleSubmit} className="flex w-full flex-col gap-4 rounded-lg bg-gray-800 p-4 mb-6"> {/* 增加 mb-6 外边距 */}
      <textarea
        name="content"
        placeholder="有什么新鲜事想分享？"
        rows={3} // 稍微增加默认行数
        required
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="block w-full resize-none rounded-md border-gray-600 bg-gray-700 px-3 py-2 text-sm text-white placeholder-gray-400 focus:border-indigo-500 focus:ring-indigo-500"
      />
      <div className="flex items-center justify-between gap-4">
        <select
          name="category"
          required
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          // 添加样式以匹配输入框，并处理未选择时的占位符颜色
          className={`block w-full rounded-md border-gray-600 bg-gray-700 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:ring-indigo-500 ${!category ? 'text-gray-400' : ''}`} 
        >
          <option value="" disabled className="text-gray-500">选择一个分类...</option>
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat} className="text-white">
              {cat}
            </option>
          ))}
        </select>
        <button
          type="submit"
          // 增加 flex-shrink-0 防止按钮被压缩
          className="flex-shrink-0 rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-800"
        >
          发布
        </button>
      </div>
    </form>
  );
}