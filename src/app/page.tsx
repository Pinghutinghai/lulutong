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
  // loading 现在统一表示“正在检查认证”或“正在加载帖子”
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('全部');
  // 增加一个状态来确保初始认证检查完成
  const [initialAuthChecked, setInitialAuthChecked] = useState(false);

  // 统一的数据获取函数
  const fetchPosts = useCallback(async () => {
    setLoading(true); // 开始加载帖子时，设置 loading 为 true
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

  // 1. 身份验证 useEffect - 只使用 onAuthStateChange
  useEffect(() => {
    // 设置初始加载状态
    setLoading(true);
    setInitialAuthChecked(false);

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        // 仅在用户存在时获取 profile
        // 使用 .maybeSingle() 防止用户 profile 不存在时报错
        const { data: profileData } = await supabase.from('profiles').select('*').eq('id', currentUser.id).maybeSingle();
        setProfile(profileData as Profile);
      } else {
        setProfile(null);
      }
      // 标记初始认证检查已完成
      setInitialAuthChecked(true);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []); // 这个 useEffect 只在组件挂载时运行一次

  // 2. 数据获取 useEffect - 依赖于认证状态和筛选条件
  useEffect(() => {
    // 只有在初始认证检查完成后，才开始获取帖子
    if (initialAuthChecked) {
      fetchPosts();
    }
  }, [initialAuthChecked, fetchPosts]);

  // 3. Realtime Subscription useEffect - 集成了状态更新逻辑
  useEffect(() => {
    // 确保 Supabase 客户端已准备好
    if (!supabase) return;

    // console.log('Setting up realtime subscription...');

    const channel = supabase
      .channel('public:posts')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'posts'
        },
        (payload) => {
          // console.log('New post received!', payload);

          // --- 核心逻辑：将新帖子添加到列表顶部 ---
          const newPost = payload.new as Post;

          // 处理可能的字段缺失 (为 nickname, like_count, reply_count 设置默认值)
          const postForList: Post = {
              ...newPost,
              nickname: newPost.nickname || null, // 假设 payload 可能不包含 nickname
              like_count: newPost.like_count || 0,   // 假设 payload 不包含 like_count
              reply_count: newPost.reply_count || 0  // 假设 payload 不包含 reply_count
          };

          // 使用函数式更新添加到 posts state 数组的最前面
          setPosts((currentPosts) => [postForList, ...currentPosts]);
          // --- 核心逻辑结束 ---
        }
      )
      .subscribe((status, err) => {
        if (status === 'SUBSCRIBED') {
          // console.log('Realtime channel subscribed successfully!');
        }
        if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          console.error('Realtime subscription error:', err);
          toast.error('实时更新连接失败，请刷新页面重试。');
        }
      });

    // 清理函数
    return () => {
      // console.log('Unsubscribing from realtime channel...');
      supabase.removeChannel(channel);
    };

  }, [supabase]); // 依赖 supabase 客户端实例

  // handleDeletePost 函数保持不变
  const handleDeletePost = async (postId: number) => {
    if (!window.confirm('确定要删除这篇帖子吗？')) {
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

        {/* 条件渲染逻辑： */}
        {initialAuthChecked ? ( // 1. 必须先完成认证检查
          user ? (             // 2. 如果检查完有用户
            <>
              <UserNav profile={profile} />
              <CreatePostForm user={user} onPostCreated={fetchPosts} />
            </>
          ) : (               // 3. 如果检查完没用户
            <LoginForm />
          )
        ) : (                // 4. 如果认证还没检查完 (初始状态)
          <p>正在检查登录状态...</p> // 显示加载提示
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
          {/* 帖子列表的加载状态：只有认证完成后才可能显示帖子或加载中 */}
          {initialAuthChecked ? (
            loading ? ( <p>加载帖子中...</p> ) : (
              posts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  user={user}
                  onDelete={handleDeletePost}
                />
              ))
            )
          ) : null } {/* 认证未完成时，不显示帖子区域 */}
        </div>
      </div>
    </main>
  );
}