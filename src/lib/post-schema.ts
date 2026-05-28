import { z } from 'zod';
import { CATEGORIES } from "@/lib/categories";

export const postInputSchema = z.object({
  title: z.string().trim().min(1, '제목을 입력하세요.').max(100, '제목은 최대 100자까지 입력할 수 있습니다.'),
  slug: z.string().trim().min(1, 'slug를 입력하세요').regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'slug는 영문 소문자, 숫자, 하이픈(-)만 사용할 수 있습니다.'),
  content: z.string().trim().min(1, '내용을 입력하세요.'),
  category: z.enum(CATEGORIES, { message:"유효한 카테고리를 선택하세요."}),
});

export type PostInput = z.infer<typeof postInputSchema>;