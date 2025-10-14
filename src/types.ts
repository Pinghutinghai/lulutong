// src/types.ts

// 👇 用这块代码替换掉你原来的 Post 类型
export type Post = {
  id: number;
  created_at: string;
  content: string;
  user_id: string;
  category: string;
  // nickname 是顶层属性，不再有 profiles 对象
  nickname: string | null; 
};

// 👇 这是我们新添加的部分
export type Reply = {
  id: number;
  created_at: string;
  content: string;
  user_id: string;
  post_id: number;
};
