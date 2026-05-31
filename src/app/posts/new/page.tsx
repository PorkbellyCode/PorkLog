import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import PostForm from "@/components/post-form";

export default async function NewPostPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  return (
    <main className="min-h-svh p-8 flex justify-center">
      <PostForm />
    </main>
  );
}
