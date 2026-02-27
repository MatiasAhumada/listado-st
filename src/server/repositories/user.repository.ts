import { prisma } from "@/lib/prisma";

export class UserRepository {
  static async findByUsername(username: string) {
    return prisma.user.findUnique({
      where: { username },
    });
  }
}
