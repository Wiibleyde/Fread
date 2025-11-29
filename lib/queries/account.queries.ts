import { prisma } from "@/lib/prisma";
import type { AccountCreationInterface } from "../interfaces/account.interface";

export const updateAccountCreationDB = (
  id: string,
  data: AccountCreationInterface,
) => {
  return prisma.account.update({
    where: { id },
    data,
  });
};

export const deleteAccountDB = (id: string) => {
  return prisma.account.delete({
    where: { id },
  });
};

export const getAccountByIdDB = (id: string) => {
  return prisma.account.findUnique({
    where: { id },
    select: {
      id: true,
      username: true,
      displayName: true,
      description: true,
      private: true,
      createdAt: true,
      updatedAt: true,
      profilePicture: { select: { fileName: true } }
    },
  });
};

export const getAccountByUsernameDB = (username: string) => {
  return prisma.account.findUnique({
    where: { username },
  });
};
