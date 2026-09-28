// import { NextResponse } from 'next/server';
// import type { NextRequest } from 'next/server';

// export function middleware(request: NextRequest) {
//   const token = request.cookies.get('dummy_token');
// // alert("am inside middleware");
//   // If trying to access dashboard without a token, redirect to /login
//   if (request.nextUrl.pathname.startsWith('/dashboard') && !token) {
//     return NextResponse.redirect(new URL('/login', request.url));
//   }

//   return NextResponse.next();
// }

// // Only run middleware on the dashboard route
// export const config = {
//   matcher: ['/dashboard/:path*','/:path*'],
// };
import { NextResponse } from "next/server";

export function middleware(request) {

  const token = request.cookies.get("session")?.value;

  console.log("Token:", token);

  if (!token) {

    return NextResponse.redirect(
      new URL("/login", request.url)
    );

  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/tickets/:path*"
  ]
};