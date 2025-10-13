'use client';
import type { Post } from '@/types';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import type { User } from '@supabase/supabase-js';

import LoginForm from '@/components/LoginForm';
import CreatePostForm from '@/components/CreatePostForm';
import PostCard from '@/components/PostCard'; // 1. 导入我们新的“菜单单品”组件

export default function HomePage() {
  const [user, setUser] = useState<User | null>(null);
  // 2. 创建两块新的“记忆黑板”：一块存帖子列表，一块记录加载状态
  const [posts, setPosts] = useState<Post[]>([]);;
  const [loading, setLoading] = useState(true);

  // 3. 这个useEffect负责获取和监听用户状态（和之前一样）
  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    checkUser();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription?.unsubscribe();
  }, []);

  // 4. 这是我们新的useEffect，专门负责获取帖子数据
  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      // 从'posts'表里，选择(*)所有列，按创建时间(created_at)降序(descending)排列
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('获取帖子失败:', error);
      } else {
        setPosts(data); // 把获取到的数据写入“帖子黑板”
      }
      setLoading(false); // 加载完成
    };

    fetchPosts();
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center bg-gray-900 text-white">
      <div className="w-full max-w-md p-4 pt-16">
        <h1 className="mb-8 text-center text-3xl font-bold">欢迎来到鹿鹿通</h1>
        
        {user ? <CreatePostForm user={user} /> : <LoginForm />}

        {/* 5. 这是我们的帖子列表展示区 */}
        <div className="mt-8 flex w-full flex-col gap-4">
          {loading ? (
            <p>加载帖子中...</p>
          ) : (
            posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))
          )}
        </div>
      </div>
    </main>
  );
}