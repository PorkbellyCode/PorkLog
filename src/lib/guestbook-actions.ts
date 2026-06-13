"use server";

import { db } from "@/db";
import { guestbook } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import bcrypt from "bcryptjs";
import { z } from "zod";

const CreateSchema = z.object({
  authorId: z.string().min(1, "작성자 ID를 입력해주세요.").max(20, "20자 이내로 입력해주세요."),
  password: z.string().min(4, "비밀번호는 4자 이상이어야 합니다.").max(20, "20자 이내로 입력해주세요."),
  content: z.string().min(1, "내용을 입력해주세요.").max(500, "500자 이내로 입력해주세요."),
});

const EditSchema = z.object({
  content: z.string().min(1, "내용을 입력해주세요.").max(500, "500자 이내로 입력해주세요."),
  password: z.string().min(1, "비밀번호를 입력해주세요."),
});

export async function createEntry(formData: {
  authorId: string;
  password: string;
  content: string;
}) {
  const parsed = CreateSchema.safeParse(formData);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0].message };
  }
  const { authorId, password, content } = parsed.data;
  const passwordHash = await bcrypt.hash(password, 10);

  await db.insert(guestbook).values({
    authorId,
    passwordHash,
    content,
  });

  revalidatePath("/guestbook");
  return { ok: true };
}

export async function editEntry(
  id: number,
  formData: {
    password: string;
    content: string;
  }
) {
  const parsed = EditSchema.safeParse(formData);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0].message };
  }

  const [entry] = await db.select().from(guestbook).where(eq(guestbook.id, id));
  if (!entry) return { ok: false, error: "항목을 찾을 수 없습니다." };

  const match = await bcrypt.compare(parsed.data.password, entry.passwordHash);
  if (!match) return { ok: false, error: "비밀번호가 올바르지 않습니다." };

  await db
    .update(guestbook)
    .set({
      content: parsed.data.content,
      updatedAt: new Date(),
    })
    .where(eq(guestbook.id, id));

  revalidatePath("/guestbook");
  return { ok: true };
}

export async function deleteEntry(id: number, password?: string) {
  const headerStore = await headers();
  const session = await auth.api.getSession({ headers: headerStore });
  const isAdmin = !!session;

  const [entry] = await db.select().from(guestbook).where(eq(guestbook.id, id));
  if (!entry) return { ok: false, error: "항목을 찾을 수 없습니다." };

  if (!isAdmin) {
    if (!password) return { ok: false, error: "비밀번호를 입력해주세요." };
    const match = await bcrypt.compare(password, entry.passwordHash);
    if (!match) return { ok: false, error: "비밀번호가 올바르지 않습니다." };
  }

  await db.delete(guestbook).where(eq(guestbook.id, id));
  revalidatePath("/guestbook");
  return { ok: true };
}