import { NextRequest, NextResponse } from "next/server";
import { apiErrorHandler } from "@/utils/handlers/apiError.handler";
import { branchRepository } from "@/server/repositories/branch.repository";
import { BRANCH_MESSAGES } from "@/constants/branch.constant";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

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
    const { name, address, phone } = body;

    const branch = await branchRepository.update(params.id, {
      name,
      address,
      phone,
    });

    return NextResponse.json(branch);
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

    await branchRepository.delete(params.id);
    return NextResponse.json({ message: BRANCH_MESSAGES.DELETED });
  } catch (error) {
    return apiErrorHandler(error);
  }
}
