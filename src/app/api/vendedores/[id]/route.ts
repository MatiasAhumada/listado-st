import { NextRequest, NextResponse } from "next/server";
import { apiErrorHandler } from "@/utils/handlers/apiError.handler";
import { vendedorRepository } from "@/server/repositories/vendedor.repository";
import { VENDEDOR_MESSAGES } from "@/constants/vendedor.constant";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import bcrypt from "bcryptjs";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const { username, password, branchId } = body;

    const updateData: { username?: string; password?: string; branchId?: string } = {};

    if (username) {
      const existingUser = await vendedorRepository.findByUsername(username);
      if (existingUser && existingUser.id !== params.id) {
        return NextResponse.json(
          { error: VENDEDOR_MESSAGES.USERNAME_EXISTS },
          { status: 400 }
        );
      }
      updateData.username = username;
    }

    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    if (branchId) {
      updateData.branchId = branchId;
    }

    const vendedor = await vendedorRepository.update(params.id, updateData);
    return NextResponse.json(vendedor);
  } catch (error) {
    return apiErrorHandler(error);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    await vendedorRepository.delete(params.id);
    return NextResponse.json({ message: VENDEDOR_MESSAGES.DELETED });
  } catch (error) {
    return apiErrorHandler(error);
  }
}
