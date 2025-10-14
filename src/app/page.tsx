'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import type { User } from '@supabase/supabase-js';
import type { Post } from '@/types';

import LoginForm from '@/components/LoginForm';
import CreatePostForm from '@/components/CreatePostForm';
import PostCard from '@/components/PostCard';

export default function HomePage() {
  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  // useEffect for user auth (This block is correct and remains unchanged)
  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    checkUser();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => setUser(session?.user ?? null));
    return () => subscription?.unsubscribe();
  }, []);

  // useEffect for fetching posts (This is the corrected block)
  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('posts_with_profiles') // 修正点1: 移除了 <Post>
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('获取帖子失败:', error);
      } else {
        // 修正点2: 使用 as Post[] 进行类型断言
        setPosts((data as Post[]) || []); 
      }
      setLoading(false);
    };

    fetchPosts();
  }, []);

  // The post deletion function (remains the same)
  const handleDeletePost = async (postId: number) => {
    if (!window.confirm('确定要删除这篇帖子吗？它下面的所有回复也将被一并删除。')) {
      return;
    }
    const { error } = await supabase.from('posts').delete().match({ id: postId });
    if (error) {
      alert('删除帖子失败：' + error.message);
    } else {
      setPosts(posts.filter((post) => post.id !== postId));
      alert('帖子已删除！');
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center bg-gray-900 text-white">
      <div className="w-full max-w-md p-4 pt-16">
        <h1 className="mb-8 text-center text-3xl font-bold">欢迎来到鹿鹿通</h1>
        
        {user ? <CreatePostForm user={user} /> : <LoginForm />}

        <div className="mt-8 flex w-full flex-col gap-4">
          {loading ? ( <p>加载帖子中...</p> ) : (
            posts.map((post) => (
              <PostCard 
                key={post.id} 
                post={post} 
                user={user} 
                onDelete={handleDeletePost} 
              />
            ))
          )}
        </div>
      </div>
    </main>
  );
}