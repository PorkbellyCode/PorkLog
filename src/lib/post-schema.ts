import { z } from "zod";
import { CATEGORY_KEYS } from "@/lib/categories";

export const MAX_TAGS = 10;
export const MAX_TAG_LENGTH = 30;

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
  // 회차(seriesOrder)는 사용자 입력이 아니라 저장 시 서버에서 자동 계산한다 (post-actions.ts).
  series: z
    .string()
    .trim()
    .max(60, "시리즈명은 60자 이내로 입력하세요.")
    .nullable()
    .transform((v) => (v ? v : null)),
  // 세부 분류 태그. post-form 에서 이미 정규화하지만 서버에서도 동일하게 한 번 더 정규화한다.
  tags: z
    .array(
      z
        .string()
        .trim()
        .min(1)
        .max(MAX_TAG_LENGTH, `태그는 ${MAX_TAG_LENGTH}자 이내로 입력하세요.`)
        .transform((v) => v.toLowerCase()),
    )
    .max(MAX_TAGS, `태그는 최대 ${MAX_TAGS}개까지 입력할 수 있습니다.`)
    .transform((tags) => Array.from(new Set(tags))),
  // 완전비공개. 생략 시 공개(false).
  isPrivate: z.boolean().default(false),
  // 발행일시. 생략 시 즉시 발행(현재 시각). 미래 값이면 예약발행.
  publishedAt: z.coerce.date().default(() => new Date()),
});

export type PostInput = z.infer<typeof postInputSchema>;