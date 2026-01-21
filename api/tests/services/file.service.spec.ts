jest.mock("../../prisma", () => ({
  prisma: {
    file: {
      create: jest.fn(),
      delete: jest.fn(),
      findUnique: jest.fn(),
    },
  },
}));

import { prisma } from "../../prisma";
import {
  createFileDB,
  deleteFileDB,
  getFileByIdDB,
  getProfilePictureByProfileForIdDB,
} from "../../services/file.service";

const accountId = "acc_01FZACCOUNT123456789";
const fileId = "file_01FZFILE123456789";

const baseDate = new Date("2025-01-01T12:00:00.000Z");

const baseFile = {
  id: fileId,
  accountId,
  creationDate: baseDate,
  fileName: "avatar.png",
  profileForId: accountId,
};

const prismaMock = prisma as unknown as {
  file: {
    create: jest.Mock;
    delete: jest.Mock;
    findUnique: jest.Mock;
  };
};

describe("file.service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("createFileDB", () => {
    it("crée un fichier lié à un compte et le marque comme photo de profil", async () => {
      prismaMock.file.create.mockResolvedValue(baseFile);

      const result = await createFileDB(accountId, baseFile.fileName);

      expect(prismaMock.file.create).toHaveBeenCalledWith({
        data: { fileName: baseFile.fileName, accountId, profileForId: accountId },
      });
      expect(result).toBe(baseFile);
    });
  });

  describe("deleteFileDB", () => {
    it("supprime un fichier par id", async () => {
      prismaMock.file.delete.mockResolvedValue(baseFile);

      const result = await deleteFileDB(fileId);

      expect(prismaMock.file.delete).toHaveBeenCalledWith({
        where: { id: fileId },
      });
      expect(result).toBe(baseFile);
    });
  });

  describe("getFileByIdDB", () => {
    it("récupère un fichier par id", async () => {
      prismaMock.file.findUnique.mockResolvedValue(baseFile);

      const result = await getFileByIdDB(fileId);

      expect(prismaMock.file.findUnique).toHaveBeenCalledWith({
        where: { id: fileId },
      });
      expect(result).toBe(baseFile);
    });
  });

  describe("getProfilePictureByProfileForIdDB", () => {
    it("récupère le nom de fichier de la photo de profil pour un compte donné", async () => {
      prismaMock.file.findUnique.mockResolvedValue({ fileName: baseFile.fileName });

      const result = await getProfilePictureByProfileForIdDB(accountId);

      expect(prismaMock.file.findUnique).toHaveBeenCalledWith({
        where: { profileForId: accountId },
        select: {
          fileName: true,
        },
      });
      expect(result).toEqual({ fileName: baseFile.fileName });
    });
  });
});
