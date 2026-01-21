import { prisma } from "../../prisma";
import {
  likePostDB,
  isPostLikedByAccountDB,
  unlikePostDB,
} from "../../services/like.service";

const accountId = "acc_01FZACCOUNT123456789";
const postId = "post_01FZPOST123456789";

const baseDate = new Date("2025-01-01T12:00:00.000Z");

const baseLike = {
  id: "like_01FZLIKE123456789",
  accountId,
  postId,
  createdAt: baseDate,
};

jest.mock("../../prisma", () => ({
  prisma: {
    like: {
      upsert: jest.fn(),
      findUnique: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

const prismaMock = prisma as unknown as {
  like: {
    upsert: jest.Mock;
    findUnique: jest.Mock;
    delete: jest.Mock;
  };
};

describe("like.service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("likePostDB", () => {
    it("crée ou ignore un like via upsert", async () => {
      prismaMock.like.upsert.mockResolvedValue(baseLike);

      await likePostDB(accountId, postId);

      expect(prismaMock.like.upsert).toHaveBeenCalledWith({
        where: {
          accountId_postId: {
            accountId,
            postId,
          },
        },
        update: {},
        create: {
          accountId,
          postId,
        },
      });
    });
  });

  describe("isPostLikedByAccountDB", () => {
    it("retourne true si un like existe", async () => {
      prismaMock.like.findUnique.mockResolvedValue(baseLike);

      const result = await isPostLikedByAccountDB(accountId, postId);

      expect(prismaMock.like.findUnique).toHaveBeenCalledWith({
        where: {
          accountId_postId: {
            accountId,
            postId,
          },
        },
      });
      expect(result).toBe(true);
    });

    it("retourne false si aucun like n'existe", async () => {
      prismaMock.like.findUnique.mockResolvedValue(null);

      const result = await isPostLikedByAccountDB(accountId, postId);

      expect(result).toBe(false);
    });
  });

  describe("unlikePostDB", () => {
    it("supprime un like pour un couple compte/post donné", async () => {
      prismaMock.like.delete.mockResolvedValue(baseLike);

      await unlikePostDB(accountId, postId);

      expect(prismaMock.like.delete).toHaveBeenCalledWith({
        where: {
          accountId_postId: {
            accountId,
            postId,
          },
        },
      });
    });
  });
});
