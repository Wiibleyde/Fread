import { prisma } from "@/lib/prisma";
import type { AccountCreationInterface } from "../interface/account.interface";

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
  });
};

export const getAccountByUsernameDB = (username: string) => {
  return prisma.account.findUnique({
    where: { username },
  });
};
