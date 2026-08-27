import Spinner from "@/components/spinner";

// 이 세그먼트를 Suspense 로 감싸 클릭 즉시 전환되게 한다.
// (동적 라우트는 loading 파일이 없으면 <Link> prefetch 자체가 스킵된다.)
export default function Loading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center text-fg-muted">
      <Spinner className="h-10 w-10" />
    </div>
  );
}
