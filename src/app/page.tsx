'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import type { User } from '@supabase/supabase-js';
import type { Post, Profile } from '@/types';
import toast from 'react-hot-toast';

import LoginForm from '@/components/LoginForm';
import CreatePostForm from '@/components/CreatePostForm';
import PostCard from '@/components/PostCard';
import UserNav from '@/components/UserNav';

const CATEGORIES = ['生活求助', '学业探讨', '失物招领'];

export default function HomePage() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('全部');

  // useEffect for user authentication
  useEffect(() => {
    const fetchUserAndProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user) {
        const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        setProfile(data as Profile);
      }
    };
    fetchUserAndProfile();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        const { data } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
        setProfile(data as Profile);
      } else {
        setProfile(null);
      }
    });
    return () => subscription?.unsubscribe();
  }, []);

  // The main function to fetch posts, now wrapped in useCallback
  const fetchPosts = useCallback(async () => {
    setLoading(true);
    let query = supabase.from('posts_with_profiles').select('*');
    if (searchTerm) {
      query = query.ilike('content', `%${searchTerm}%`);
    }
    if (selectedCategory !== '全部') {
      query = query.eq('category', selectedCategory);
    }
    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      toast.error('加载帖子失败，请稍后重试。');
      setPosts([]);
    } else {
      setPosts((data as Post[]) || []);
    }
    setLoading(false);
  }, [searchTerm, selectedCategory]); // Dependencies are now explicit

  // useEffect for fetching posts now correctly depends on fetchPosts
  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handleDeletePost = async (postId: number) => {
    if (!window.confirm('确定要删除这篇帖子吗？它下面的所有回复也将被一并删除。')) {
      return;
    }
    const { error } = await supabase.from('posts').delete().match({ id: postId });
    if (error) {
      toast.error('删除帖子失败：' + error.message);
    } else {
      setPosts(posts.filter((post) => post.id !== postId));
      toast.success('帖子已删除！');
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center bg-gray-900 text-white">
      <div className="w-full max-w-md p-4 pt-16">
        <h1 className="mb-8 text-center text-3xl font-bold">欢迎来到鹿鹿通</h1>
        
        {user ? (
          <>
            <UserNav profile={profile} />
            <CreatePostForm user={user} onPostCreated={fetchPosts} />
          </>
        ) : (
          <LoginForm />
        )}

        <div className="my-6">
          <div className="mb-4 flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory('全部')}
              className={`px-3 py-1 text-sm rounded-full ${selectedCategory === '全部' ? 'bg-indigo-600 text-white' : 'bg-gray-700 text-gray-300'}`}
            >
              全部
            </button>
            {CATEGORIES.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-3 py-1 text-sm rounded-full ${selectedCategory === category ? 'bg-indigo-600 text-white' : 'bg-gray-700 text-gray-300'}`}
              >
                {category}
              </button>
            ))}
          </div>
          <input
            type="search"
            placeholder="在当前分类下搜索..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full rounded-md border-gray-600 bg-gray-800 px-4 py-2 text-white placeholder-gray-400 focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        <div className="flex w-full flex-col gap-4">
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