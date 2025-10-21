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
  // loading 现在同时表示“正在检查认证”和“正在加载帖子”
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('全部');

  // 统一的数据获取函数
  const fetchPosts = useCallback(async () => {
    // setLoading(true); // setLoading 会在 useEffect 中处理
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
    setLoading(false); // 数据获取完成，结束加载状态
  }, [searchTerm, selectedCategory]);

  // 1. 身份验证与数据加载合并处理
  useEffect(() => {
    setLoading(true); // 开始时总是加载状态

    // 尝试获取当前用户 Session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        const { data: profileData } = await supabase.from('profiles').select('*').eq('id', currentUser.id).single();
        setProfile(profileData as Profile);
      }
      // 不论是否有用户，身份检查完成，开始获取帖子
      fetchPosts();
    });

    // 监听后续的登录/登出状态变化
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setLoading(true); // 状态变化，重新开始加载
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        const { data: profileData } = await supabase.from('profiles').select('*').eq('id', currentUser.id).single();
        setProfile(profileData as Profile);
      } else {
        setProfile(null);
      }
      // 身份状态变化后，重新获取帖子
      fetchPosts();
    });

    return () => subscription.unsubscribe();
  }, [fetchPosts]); // 依赖 fetchPosts，当筛选条件变化时也会触发

  // handleDeletePost 函数保持不变
  const handleDeletePost = async (postId: number) => {
    if (!window.confirm('确定要删除这篇帖子吗？')) {
      return;
    }
    const { error } = await supabase.from('posts').delete().match({ id: postId });
    if (error) {
      toast.error('删除帖子失败：' + error.message);
    } else {
      // 保持乐观更新
      setPosts(posts.filter((post) => post.id !== postId));
      toast.success('帖子已删除！');
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center bg-gray-900 text-white">
      <div className="w-full max-w-md p-4 pt-16">
        <h1 className="mb-8 text-center text-3xl font-bold">欢迎来到鹿鹿通</h1>
        
        {/* 现在直接根据 user 状态判断显示 */}
        {user ? (
          <>
            <UserNav profile={profile} />
            {console.log('Rendering CreatePostForm because user exists:', user)}
            <CreatePostForm user={user} onPostCreated={fetchPosts} />
          </>
        ) : (
          // 如果没有用户，但在加载中，就不显示登录框，避免闪烁
          !loading && <LoginForm />
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
          {/* 现在只用 loading 状态判断 */}
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