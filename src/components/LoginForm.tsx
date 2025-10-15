'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import toast from 'react-hot-toast'; // 确保 toast 已导入

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false); 

  // 这是升级了通知的 handleSubmit 函数
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (isSignUp) {
      // 注册逻辑
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) {
        toast.error('注册失败：' + error.message);
      } else {
        toast.success('注册成功！请检查邮箱完成验证。');
      }
    } else {
      // 登录逻辑
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        toast.error('登录失败：' + error.message);
      } else {
        toast.success('登录成功！欢迎回来！');
        // 登录成功后，主页面的 onAuthStateChange 监听器会自动刷新UI
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex w-full flex-col gap-4">
      <div>
        <label htmlFor="email" className="mb-2 block text-sm font-medium text-gray-300">
          人大邮箱 (ruc.edu.cn)
        </label>
        <input id="email" type="email" name="email" placeholder="your.name@ruc.edu.cn" required value={email} onChange={(e) => setEmail(e.target.value)} className="block w-full rounded-md border-gray-600 bg-gray-700 px-3 py-2 text-white placeholder-gray-400 focus:border-indigo-500 focus:ring-indigo-500" />
      </div>
      <div>
        <label htmlFor="password" className="mb-2 block text-sm font-medium text-gray-300">
          密码
        </label>
        <input id="password" type="password" name="password" placeholder="••••••••" required value={password} onChange={(e) => setPassword(e.target.value)} className="block w-full rounded-md border-gray-600 bg-gray-700 px-3 py-2 text-white placeholder-gray-400 focus:border-indigo-500 focus:ring-indigo-500" />
      </div>
      
      <button
        type="submit"
        className="mt-4 w-full rounded-md bg-indigo-600 px-4 py-2 font-semibold text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-900"
      >
        {isSignUp ? '注册' : '登录'}
      </button>
      
      <p className="mt-2 text-center text-sm text-gray-400">
        {isSignUp ? '已经有账户了？ ' : '还没有账户？ '}
        <button
          type="button"
          onClick={() => setIsSignUp(!isSignUp)}
          className="font-medium text-indigo-400 hover:text-indigo-500"
        >
          {isSignUp ? '去登录' : '去注册'}
        </button>
      </p>
    </form>
  );
}