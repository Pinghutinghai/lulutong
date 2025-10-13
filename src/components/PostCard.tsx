// src/components/PostCard.tsx

// 这个组件接收一个名为`post`的“道具”，里面包含了帖子的所有信息
export default function PostCard({ post }: { post: any }) {
  return (
    <div className="w-full rounded-lg bg-gray-800 p-4 shadow-md">
      {/* 显示帖子内容 */}
      <p className="mb-3 text-gray-200">{post.content}</p>
      
      {/* 显示帖子的元数据，比如分类和创建时间 */}
      <div className="flex justify-between text-sm text-gray-500">
        <span>分类：{post.category}</span>
        <span>{new Date(post.created_at).toLocaleDateString()}</span>
      </div>
    </div>
  );
}