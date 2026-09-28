// app/api/auth/login/route.js
import { NextResponse } from "next/server";
import { users } from "@/lib/mockData";

export async function POST(req) {
  const { email, password, rememberMe = false } = await req.json();
  const user = users.find(u => u.email === email);
  if (!user) {
    return NextResponse.json({ success: false, message: "Invalid credentials", errors: [] }, { status: 401 });
  }
    const token = "mock-jwt-token";

  const response= NextResponse.json({ success: true, message: "Success", data: { token, user } });
    response.cookies.set("session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    ...(rememberMe ? { maxAge: 60 * 60 * 24 * 30 } : {}),
  });
console.log("the response on POST is",response)
  return response;
}
