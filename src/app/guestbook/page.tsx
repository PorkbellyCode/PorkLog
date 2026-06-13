import { db } from "@/db";
import { guestbook } from "@/db/schema";
import { desc, count } from "drizzle-orm";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import Guestbook from "@/components/guestbook";

const PAGE_SIZE = 10;

export default async function GuestbookPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const sp = await searchParams;
  const rawPage = Number(sp.page);
  const currentPage = Number.isInteger(rawPage) && rawPage > 0 ? rawPage : 1;
  const offset = (currentPage - 1) * PAGE_SIZE;

  const session = await auth.api.getSession({ headers: await headers() });
  const isAdmin = !!session;

  const allEntries = await db
    .select({
      id: guestbook.id,
      authorId: guestbook.authorId,
      content: guestbook.content,
      images: guestbook.images,
      isSecret: guestbook.isSecret,
      updatedAt: guestbook.updatedAt,
      createdAt: guestbook.createdAt,
    })
    .from(guestbook)
    .orderBy(desc(guestbook.createdAt))
    .limit(PAGE_SIZE)
    .offset(offset);

  const [{ value: totalCount }] = await db
    .select({ value: count(guestbook.id) })
    .from(guestbook);

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  return (
    <main className="px-4 py-8 sm:py-12">
      <div className="mx-auto w-full max-w-3xl space-y-8">
        <h1 className="text-2xl font-bold text-fg-default">방명록</h1>
        <Guestbook
          entries={allEntries}
          isAdmin={isAdmin}
          currentPage={currentPage}
          totalPages={totalPages}
        />
      </div>
    </main>
  );
}