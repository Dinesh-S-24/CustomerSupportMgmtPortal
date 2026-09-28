// app/api/logout/route.js

import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({
    success: true,
    message: "Logged out successfully",
  });
console.log("kaisa kue");
  response.cookies.delete("session");
console.log(response.message);
  return response;
}