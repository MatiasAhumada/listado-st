import { PlatformAdminRepository } from "@/server/repositories/platformAdmin.repository";
import { TechnicianAuthRepository } from "@/server/repositories/technicianAuth.repository";

export class AccessIdentityRepository {
  static async findByUsername(username: string) {
    const [admin, technician] = await Promise.all([
      PlatformAdminRepository.findByUsername(username),
      TechnicianAuthRepository.findByUsername(username),
    ]);
    return { admin, technician };
  }

  static async isUsernameTaken(username: string): Promise<boolean> {
    const { admin, technician } = await this.findByUsername(username);
    return Boolean(admin || technician);
  }
}
