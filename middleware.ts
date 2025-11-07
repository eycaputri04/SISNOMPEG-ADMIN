import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const pathname = req.nextUrl.pathname;

  // Daftar halaman publik (tidak perlu login)
  const publicPaths = ["/", "/lupa-password", "/reset-password"];
  const isPublic = publicPaths.includes(pathname);

  // Jika belum login dan buka halaman non-publik → redirect ke login
  if (!session && !isPublic) {
    const redirectUrl = req.nextUrl.clone();
    redirectUrl.pathname = "/";
    return NextResponse.redirect(redirectUrl);
  }

  // Jika sudah login dan buka halaman login → redirect ke beranda
  if (session && pathname === "/") {
    const redirectUrl = req.nextUrl.clone();
    redirectUrl.pathname = "/beranda";
    return NextResponse.redirect(redirectUrl);
  }

  return res;
}

// Jalankan middleware di semua route kecuali folder _next dan aset statis
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
