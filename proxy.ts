import createMiddleware from "next-intl/middleware";
import { updateSession } from "@/lib/supabase/middleware";
import { type NextRequest } from "next/server";

const intlMiddleware = createMiddleware({
  locales: ["en", "zh"],
  defaultLocale: "en",
});

export async function proxy(request: NextRequest) {

  // 先执行 next-intl
  const intlResponse = intlMiddleware(request);

  // 如果 next-intl 已经返回 redirect / rewrite
  if (intlResponse) {
    return intlResponse;
  }

  // 再执行 supabase session
  return await updateSession(request);
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)",
  ],
};