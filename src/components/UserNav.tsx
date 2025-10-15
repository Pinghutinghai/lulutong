'use client';
import Link from 'next/link';
import type { Profile } from '@/types';

export default function UserNav({ profile }: { profile: Profile | null }) {
  const nickname = profile?.nickname || '我的账户';

  return (
    <div className="w-full max-w-md p-4 bg-gray-800 rounded-lg mb-6 flex justify-between items-center">
      <span className="font-semibold text-white">欢迎，{nickname}！</span>
      <Link href="/account" className="text-sm text-indigo-400 hover:underline font-semibold">
        → 个人主页
      </Link>
    </div>
  );
}