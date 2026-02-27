import { NextRequest, NextResponse } from "next/server";
import { AuthService } from "@/server/service/auth.service";
import apiErrorHandler, { ApiError } from "@/utils/handlers/apiError.handler";

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();

    const { user, token } = await AuthService.login(username, password);

    const response = NextResponse.json({ user });

    response.cookies.set({
      name: "auth-token",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24, // 1 day
      path: "/",
    });

    return response;
  } catch (error: any) {
    return apiErrorHandler({
      error: error instanceof ApiError ? error : new ApiError({ message: "Error interno" }),
      request: req,
    });
  }
}
