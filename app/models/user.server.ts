import type { User } from "@prisma/client";
import bcrypt from "bcryptjs";
import { prisma } from "~/db.server";
import type { UserInterface } from "~/types/types";

export async function getUserByEmail(email: User["email"]) {
  return prisma.user.findUnique({ where: { email } });
}

export async function createUser({
  email,
  isAdmin = false,
  name,
  password,
}: UserInterface) {
  const hashedPassword = await bcrypt.hash(password, 10);

  return prisma.user.create({
    data: {
      name,
      isAdmin,
      email,
      Password: {
        create: {
          hash: hashedPassword,
        },
      },
    },
  });
}
