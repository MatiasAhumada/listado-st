import { NextRequest, NextResponse } from "next/server";
import { apiErrorHandler } from "@/utils/handlers/apiError.handler";
import { vendedorRepository } from "@/server/repositories/vendedor.repository";
import { VENDEDOR_MESSAGES } from "@/constants/vendedor.constant";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import bcrypt from "bcryptjs";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const vendedores = await vendedorRepository.findByCompanyId(session.user.id);
    return NextResponse.json(vendedores || []);
  } catch (error) {
    return apiErrorHandler(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const { username, password, branchId } = body;

    if (!username || !password || !branchId) {
      return NextResponse.json(
        { error: VENDEDOR_MESSAGES.REQUIRED_FIELDS },
        { status: 400 }
      );
    }

    const existingUser = await vendedorRepository.findByUsername(username);
    if (existingUser) {
      return NextResponse.json(
        { error: VENDEDOR_MESSAGES.USERNAME_EXISTS },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const vendedor = await vendedorRepository.create({
      username,
      password: hashedPassword,
      companyId: session.user.id,
      branchId,
    });

    return NextResponse.json(vendedor, { status: 201 });
  } catch (error) {
    return apiErrorHandler(error);
  }
}
