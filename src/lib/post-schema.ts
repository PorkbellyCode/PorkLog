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
  // 연재 시리즈. 빈 문자열은 "시리즈 없음"으로 취급한다.
  series: z
    .string()
    .trim()
    .max(60, "시리즈명은 60자 이내로 입력하세요.")
    .nullable()
    .transform((v) => (v ? v : null)),
  seriesOrder: z
    .number()
    .int("회차는 정수로 입력하세요.")
    .min(1, "회차는 1 이상이어야 합니다.")
    .nullable(),
})
  // 시리즈명이 없으면 회차도 의미가 없으므로 함께 비운다.
  .transform((v) => (v.series ? v : { ...v, series: null, seriesOrder: null }));

export type PostInput = z.infer<typeof postInputSchema>;