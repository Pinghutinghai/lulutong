'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import type { User } from '@supabase/supabase-js';
import Link from 'next/link';

export default function AccountPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  
  // 1. 创建新的“记忆黑板”来存放昵称和加载状态
  const [nickname, setNickname] = useState<string>('');
  const [profileLoading, setProfileLoading] = useState(true);

  useEffect(() => {
    const fetchUserProfile = async () => {
      // 获取当前登录的用户
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        // 2. 如果用户已登录，就去 profiles 表里查找对应的记录
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('nickname')
          .eq('id', user.id) // 条件是：profiles表的id 等于 当前用户的id
          .single(); // .single() 表示我们确信只会返回一条记录

        if (error) {
          console.error('获取个人资料失败:', error);
        }
        if (profile) {
          setNickname(profile.nickname || ''); // 如果有昵称，就写入“黑板”
        }
      }
      setLoading(false);
      setProfileLoading(false);
    };
    fetchUserProfile();
  }, []);

  // 3. 这是新的更新昵称的处理函数
  const handleUpdateProfile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;

    const { error } = await supabase
      .from('profiles')
      .update({ nickname: nickname }) // 要更新的数据
      .eq('id', user.id); // 更新哪一条记录的条件

    if (error) {
      alert('更新失败：' + error.message);
    } else {
      alert('更新成功！');
    }
  };

  // ... (PageWrapper and loading states remain the same)
  const PageWrapper = ({ children }: { children: React.ReactNode }) => ( <div className="bg-gray-900 text-white min-h-screen p-4">{children}</div> );
  if (loading) { return <PageWrapper><p>加载中...</p></PageWrapper>; }
  if (!user) { return <PageWrapper><p>请先 <Link href="/" className="text-indigo-400 hover:underline">登录</Link> 再访问此页面。</p></PageWrapper>; }

  return (
    <PageWrapper>
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold mb-4">账户设置</h1>
        <p className="mb-6">欢迎, {user.email}!</p>
        
        {/* 4. 这是我们的昵称修改表单 */}
        {profileLoading ? (
          <p>正在加载个人资料...</p>
        ) : (
          <form onSubmit={handleUpdateProfile}>
            <div className="flex flex-col gap-2">
              <label htmlFor="nickname" className="text-sm font-medium text-gray-300">
                我的昵称
              </label>
              <input
                id="nickname"
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="设置一个响亮的昵称吧"
                className="block w-full rounded-md border-gray-600 bg-gray-700 px-3 py-2 text-white placeholder-gray-400 focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
            <button
              type="submit"
              className="mt-4 w-full rounded-md bg-indigo-600 px-4 py-2 font-semibold text-white hover:bg-indigo-700"
            >
              更新
            </button>
          </form>
        )}
        
        <div className="mt-8">
          <Link href="/" className="text-gray-400 hover:text-white">
            ← 返回主页
          </Link>
        </div>
      </div>
    </PageWrapper>
  );
}