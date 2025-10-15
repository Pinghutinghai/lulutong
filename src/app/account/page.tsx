'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import type { User } from '@supabase/supabase-js';
import Link from 'next/link';
import toast from 'react-hot-toast';
import type { Profile, Reply, Post } from '@/types';
import PostCard from '@/components/PostCard';

export default function AccountPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [nickname, setNickname] = useState<string>('');
  const [replies, setReplies] = useState<Reply[]>([]);
  const [bookmarks, setBookmarks] = useState<Post[]>([]);

  const handleDeletePost = (postId: number) => {
    setBookmarks(bookmarks.filter(p => p.id !== postId));
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        const { data: profile } = await supabase.from('profiles').select('nickname').eq('id', user.id).single();
        if (profile) setNickname(profile.nickname || '');

        const { data: repliesData } = await supabase.from('replies').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
        if (repliesData) setReplies(repliesData as Reply[]);

        const { data: bookmarkLinks } = await supabase.from('bookmarks').select('post_id').eq('user_id', user.id);
        if (bookmarkLinks && bookmarkLinks.length > 0) {
          const postIds = bookmarkLinks.map(b => b.post_id);
          const { data: postData } = await supabase.from('posts_with_profiles').select('*').in('id', postIds).order('created_at', { ascending: false });
          if (postData) setBookmarks(postData as Post[]);
        }
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;
    const { error } = await supabase.from('profiles').update({ nickname: nickname }).eq('id', user.id);
    if (error) { toast.error('更新失败：' + error.message); } 
    else { toast.success('昵称更新成功！'); }
  };
  
  const handleToggleVisibility = async (replyId: number, currentVisibility: boolean) => {
    const { error } = await supabase.from('replies').update({ is_public: !currentVisibility }).eq('id', replyId);
    if (error) { toast.error('更新状态失败: ' + error.message); } 
    else { setReplies(replies.map(r => r.id === replyId ? { ...r, is_public: !currentVisibility } : r)); }
  };

  const PageWrapper = ({ children }: { children: React.ReactNode }) => ( <div className="bg-gray-900 text-white min-h-screen p-4">{children}</div> );
  if (loading) { return <PageWrapper><div className="max-w-md mx-auto"><p>加载中...</p></div></PageWrapper>; }
  if (!user) { return <PageWrapper><p>请先 <Link href="/" className="text-indigo-400 hover:underline">登录</Link>。</p></PageWrapper>; }

  return (
    <PageWrapper>
      <div className="max-w-md mx-auto">
        <h1 className="text-3xl font-bold mb-6">个人主页</h1>
        
        <div className="mb-8 p-4 bg-gray-800 rounded-lg">
          <h2 className="text-lg font-semibold mb-3">账户设置</h2>
          <form onSubmit={handleUpdateProfile}>
            <div className="flex flex-col gap-2">
              <label htmlFor="nickname" className="text-sm font-medium text-gray-300">我的昵称</label>
              <input id="nickname" type="text" value={nickname} onChange={(e) => setNickname(e.target.value)} placeholder="设置一个响亮的昵称吧" className="block w-full rounded-md border-gray-600 bg-gray-700 px-3 py-2 text-white placeholder-gray-400 focus:border-indigo-500 focus:ring-indigo-500" />
            </div>
            <button type="submit" className="mt-4 w-full rounded-md bg-indigo-600 px-4 py-2 font-semibold text-white hover:bg-indigo-700">更新</button>
          </form>
        </div>

        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-3">我的全部回复</h2>
          <div className="flex flex-col gap-3">
            {replies.length > 0 ? (replies.map(reply => (<div key={reply.id} className="rounded-md bg-gray-800 p-3"><p className="text-gray-300">{reply.content}</p><div className="text-xs text-gray-500 mt-2 flex justify-between items-center"><span>{new Date(reply.created_at).toLocaleDateString()}</span><button onClick={() => handleToggleVisibility(reply.id, reply.is_public)} className={`px-2 py-1 text-xs rounded ${ reply.is_public ? 'bg-green-800 text-green-300' : 'bg-gray-600 text-gray-300' }`} >{reply.is_public ? '✓ 公开' : '🔒 私密'}</button></div></div>))) : (<p className="text-gray-500 text-sm">你还没有发表过任何回复。</p>)}
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-3">我的收藏</h2>
          <div className="flex flex-col gap-4">
            {bookmarks.length > 0 ? (bookmarks.map(post => (<PostCard key={post.id} post={post} user={user} onDelete={handleDeletePost} />))) : (<p className="text-gray-500 text-sm">你还没有收藏任何帖子。</p>)}
          </div>
        </div>

        <div className="mt-8">
          <Link href="/" className="text-gray-400 hover:text-white">← 返回主页</Link>
        </div>
      </div>
    </PageWrapper>
  );
}