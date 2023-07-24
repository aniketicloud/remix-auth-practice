import type { User } from "@prisma/client";

export interface UserInterface {
  name: User["name"];
  email: User["email"];
  password: string;
  isAdmin: User["isAdmin"];
}
