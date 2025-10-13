// src/components/PostCard.tsx
import type { Post } from '@/types'; // 1. 从我们刚创建的文件中导入Post类型

// 2. 在这里，我们把之前模糊的 { post: any } 换成了精确的 { post: Post }
export default function PostCard({ post }: { post: Post }) {
  return (
    <div className="w-full rounded-lg bg-gray-800 p-4 shadow-md">
      <p className="mb-3 text-gray-200">{post.content}</p>
      
      <div className="flex justify-between text-sm text-gray-500">
        <span>分类：{post.category}</span>
        <span>{new Date(post.created_at).toLocaleDateString()}</span>
      </div>
    </div>
  );
}