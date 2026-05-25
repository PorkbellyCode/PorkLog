import { createAuthClient } from "better-auth/react";

// 같은 도메인에서 동작하므로 baseURL 생략 가능.
export const authClient = createAuthClient();