import { NextRequest, NextResponse } from "next/server";
import { apiErrorHandler } from "@/utils/handlers/apiError.handler";
import { branchRepository } from "@/server/repositories/branch.repository";
import { BRANCH_MESSAGES } from "@/constants/branch.constant";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const branches = await branchRepository.findByCompanyId(session.user.id);
    return NextResponse.json(branches);
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
    const { name, address, phone } = body;

    if (!name) {
      return NextResponse.json(
        { error: BRANCH_MESSAGES.REQUIRED_FIELDS },
        { status: 400 }
      );
    }

    const branch = await branchRepository.create({
      name,
      address,
      phone,
      companyId: session.user.id,
    });

    return NextResponse.json(branch, { status: 201 });
  } catch (error) {
    return apiErrorHandler(error);
  }
}
