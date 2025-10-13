'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // 这就是我们的新“开关”，默认是false，代表“登录模式”
  const [isSignUp, setIsSignUp] = useState(false); 

  // 我们把登录和注册的逻辑都放在这个函数里
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // 依然是阻止页面刷新

    if (isSignUp) {
      // 开关打开时，执行“注册”逻辑
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) {
        alert('注册失败：' + error.message);
      } else {
        alert('注册成功！请检查邮箱完成验证。');
      }
    } else {
      // 开关关闭时，执行“登录”逻辑
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        alert('登录失败：' + error.message);
      } else {
        alert('登录成功！欢迎回来！');
        // 未来我们会在这里跳转到用户主页
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex w-full flex-col gap-4">
      {/* 输入框部分依然不变 */}
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
      
      {/* 按钮文字会根据“开关”状态动态变化 */}
      <button
        type="submit"
        className="mt-4 w-full rounded-md bg-indigo-600 px-4 py-2 font-semibold text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-900"
      >
        {isSignUp ? '注册' : '登录'}
      </button>
      
      {/* 这是我们的模式切换器 */}
      <p className="mt-2 text-center text-sm text-gray-400">
        {isSignUp ? '已经有账户了？ ' : '还没有账户？ '}
        <button
          type="button"
          onClick={() => setIsSignUp(!isSignUp)} // 每次点击，都把“开关”拨到和现在相反的状态
          className="font-medium text-indigo-400 hover:text-indigo-500"
        >
          {isSignUp ? '去登录' : '去注册'}
        </button>
      </p>
    </form>
  );
}