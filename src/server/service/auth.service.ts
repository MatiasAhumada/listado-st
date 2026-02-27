import { UserRepository } from "../repositories/user.repository";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { ApiError } from "@/utils/handlers/apiError.handler";
import httpStatus from "http-status";

const JWT_SECRET = process.env.JWT_SECRET || "super-secret";

export class AuthService {
  static async login(username: string, password: string) {
    const user = await UserRepository.findByUsername(username);

    if (!user) {
      throw new ApiError({ status: httpStatus.UNAUTHORIZED, message: "Usuario no encontrado" });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      throw new ApiError({ status: httpStatus.UNAUTHORIZED, message: "Contraseña incorrecta" });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: "1d" }
    );

    return {
      user: { id: user.id, username: user.username, role: user.role },
      token,
    };
  }
}
