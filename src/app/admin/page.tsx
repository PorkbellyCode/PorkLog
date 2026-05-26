import Link from 'next/link';

export default function AdminPage() {
  return (
    <main className="min-h-svh p-8 flex justify-center">
      <div className="w-full max-w-2xl space-y-4">
        <h1 className="text-xl font-semibold">관리자 페이지</h1>
        <Link
          href="/admin/new"
          className="inline-block rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
        >
          새 글 작성
        </Link>
      </div>
    </main>
  );
}