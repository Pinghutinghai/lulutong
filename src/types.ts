// src/types.ts

// 👇 用这块代码替换掉你原来的 Post 类型
export type Post = {
  id: number;
  created_at: string;
  content: string;
  user_id: string;
  category: string;
  nickname: string | null;
  like_count: number;
  reply_count: number; // <-- 新增这一行
};
// 👇 这是我们新添加的部分
export type Reply = {
  id: number;
  created_at: string;
  content: string;
  user_id: string;
  post_id: number;
  is_public: boolean;
  nickname: string | null;
  // 👇 这是我们上次遗漏的属性
  is_anonymous: boolean;
};
export type Profile = {
  id: string; // 这是用户的 uuid
  nickname: string | null;
};