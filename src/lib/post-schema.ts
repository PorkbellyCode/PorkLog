import { z } from "zod";
import { CATEGORY_KEYS } from "@/lib/categories";

export const postInputSchema = z.object({
  title: z.string().trim().min(1, "제목을 입력하세요."),
  slug: z
    .string()
    .trim()
    .min(1, "slug 를 입력하세요.")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "slug 는 영문 소문자, 숫자, 하이픈(-)만 사용할 수 있습니다.",
    ),
  content: z.string().trim().min(1, "본문을 입력하세요."),
  category: z.enum(CATEGORY_KEYS, {
    message: "유효한 카테고리를 선택하세요.",
  }),
  // 썸네일은 선택. 값이 있으면 URL 형식이어야 한다.
  // 빈 문자열은 "썸네일 없음"으로 취급하여 null 처리한다.
  thumbnail: z
    .string()
    .trim()
    .url("올바른 이미지 URL 이 아닙니다.")
    .nullable()
    .or(z.literal("").transform(() => null)),
});

export type PostInput = z.infer<typeof postInputSchema>;