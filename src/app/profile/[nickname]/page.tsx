'use client';

import { useState, useEffect, use } from 'react';
import { supabase } from '@/lib/supabaseClient';
import type { User } from '@supabase/supabase-js';
import Link from 'next/link';
import type { Profile, Reply } from '@/types';
import { useParams } from 'next/navigation';
import toast from 'react-hot-toast'; // 1. 确保导入 toast

export default function ProfilePage() {
  const params = useParams();
  const nickname = decodeURIComponent(params.nickname as string); 
  
  const [profile, setProfile] = useState<Profile | null>(null);
  const [replies, setReplies] = useState<Reply[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);

      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('nickname', nickname)
        .single();

      if (profileError || !profileData) {
        console.error('获取Profile失败:', profileError);
        setLoading(false);
        return;
      }
      setProfile(profileData as Profile);
      
      const { data: repliesData, error: repliesError } = await supabase
        .from('replies')
        .select('*')
        .eq('user_id', profileData.id)
        .order('created_at', { ascending: false });

      if (repliesError) {
        console.error('获取回复失败:', repliesError);
      } else {
        setReplies(repliesData as Reply[]);
      }
      
      setLoading(false);
    };

    fetchData();
  }, [nickname]);
  
  const isOwner = currentUser && currentUser.id === profile?.id;

  // 2. 这是最终干净、且使用toast的函数版本
  const handleToggleVisibility = async (replyId: number, currentVisibility: boolean) => {
    const { error } = await supabase
      .from('replies')
      .update({ is_public: !currentVisibility })
      .eq('id', replyId);

    if (error) {
      toast.error('更新状态失败: ' + error.message);
    } else {
      // 成功时，UI即时反馈就是最好的通知，此处无需toast
      setReplies(replies.map(r => 
        r.id === replyId ? { ...r, is_public: !currentVisibility } : r
      ));
    }
  };

  const PageWrapper = ({ children }: { children: React.ReactNode }) => ( <div className="bg-gray-900 text-white min-h-screen p-4">{children}</div> );

  if (loading) { return <PageWrapper><div className="max-w-md mx-auto"><p>正在加载个人主页...</p></div></PageWrapper>; }
  if (!profile) { return <PageWrapper><div className="max-w-md mx-auto"><p>用户不存在。</p></div></PageWrapper>; }

  return (
    <PageWrapper>
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold mb-4">{profile.nickname} 的主页</h1>
        <div className="flex flex-col gap-4 mt-6">
          <h2 className="text-lg font-semibold border-b border-gray-700 pb-2">
            {isOwner ? '我的全部回复' : `公开的回复`}
          </h2>
          {replies.length > 0 ? (
            replies.map(reply => (
              <div key={reply.id} className="rounded-md bg-gray-800 p-3">
                <p className="text-gray-300">{reply.content}</p>
                <div className="text-xs text-gray-500 mt-2 flex justify-between items-center">
                  <span>{new Date(reply.created_at).toLocaleDateString()}</span>
                  {isOwner && (
                    <button onClick={() => handleToggleVisibility(reply.id, reply.is_public)} className={`px-2 py-1 text-xs rounded ${ reply.is_public ? 'bg-green-800 text-green-300' : 'bg-gray-600 text-gray-300' }`} >
                      {reply.is_public ? '✓ 公开' : '🔒 私密'}
                    </button>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-sm mt-4">
              {isOwner ? '你还没有发表过任何回复。' : '这位用户还没有公开的回复。'}
            </p>
          )}
        </div>
        <div className="mt-8">
          <Link href="/" className="text-gray-400 hover:text-white">← 返回主页</Link>
        </div>
      </div>
    </PageWrapper>
  );
}