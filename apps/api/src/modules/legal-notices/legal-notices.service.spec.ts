import { Test, TestingModule } from "@nestjs/testing";
import { NotFoundException, UnauthorizedException } from "@nestjs/common";
import { LegalNoticesService } from "./legal-notices.service";
import { LegalNoticesController } from "./legal-notices.controller";
import { PrismaService } from "../../prisma/prisma.service";
import type { AuthUser } from "../auth/auth.types";

describe("LegalNoticesService & LegalNoticesController", () => {
  let service: LegalNoticesService;
  let controller: LegalNoticesController;

  const mockNotice = {
    id: "notice-1",
    title: "Términos del Servicio",
    content: "Contenido del aviso legal...",
    version: "1.0",
    targetUserRole: null,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockUser = {
    id: "user-uuid-1",
    email: "user@example.com",
    firebaseUid: "fb-uid-1",
    role: "owner",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  let mockPrisma: {
    legalNotice: {
      create: jest.Mock;
      findMany: jest.Mock;
      findUnique: jest.Mock;
      update: jest.Mock;
    };
    legalNoticeAcceptance: {
      upsert: jest.Mock;
      findUnique: jest.Mock;
    };
    user: {
      findFirst: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
    };
  };

  beforeEach(async () => {
    mockPrisma = {
      legalNotice: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      legalNoticeAcceptance: {
        upsert: jest.fn(),
        findUnique: jest.fn(),
      },
      user: {
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [LegalNoticesController],
      providers: [
        LegalNoticesService,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
      ],
    }).compile();

    service = module.get<LegalNoticesService>(LegalNoticesService);
    controller = module.get<LegalNoticesController>(LegalNoticesController);
  });

  describe("Service: create", () => {
    it("should create a legal notice with defaults", async () => {
      mockPrisma.legalNotice.create.mockResolvedValue(mockNotice);

      const result = await service.create({
        title: "Términos del Servicio",
        content: "Contenido del aviso legal...",
      });

      expect(mockPrisma.legalNotice.create).toHaveBeenCalledWith({
        data: {
          title: "Términos del Servicio",
          content: "Contenido del aviso legal...",
          version: "1.0",
          targetUserRole: null,
          isActive: true,
        },
      });
      expect(result).toEqual(mockNotice);
    });

    it("should create a notice with custom version, role and status", async () => {
      mockPrisma.legalNotice.create.mockResolvedValue({
        ...mockNotice,
        version: "2.0",
        targetUserRole: "owner",
        isActive: false,
      });

      const result = await service.create({
        title: "Términos para Dueños",
        content: "Aviso importante",
        version: "2.0",
        targetUserRole: "owner",
        isActive: false,
      });

      expect(mockPrisma.legalNotice.create).toHaveBeenCalledWith({
        data: {
          title: "Términos para Dueños",
          content: "Aviso importante",
          version: "2.0",
          targetUserRole: "owner",
          isActive: false,
        },
      });
      expect(result.version).toBe("2.0");
    });
  });

  describe("Service: findAll", () => {
    it("should return all notices without filter", async () => {
      mockPrisma.legalNotice.findMany.mockResolvedValue([mockNotice]);

      const result = await service.findAll();
      expect(mockPrisma.legalNotice.findMany).toHaveBeenCalledWith({
        where: {},
        orderBy: { createdAt: "desc" },
      });
      expect(result).toEqual([mockNotice]);
    });

    it("should filter by role and active status", async () => {
      mockPrisma.legalNotice.findMany.mockResolvedValue([mockNotice]);

      await service.findAll({ role: "owner", isActive: true });
      expect(mockPrisma.legalNotice.findMany).toHaveBeenCalledWith({
        where: {
          isActive: true,
          OR: [{ targetUserRole: null }, { targetUserRole: "all" }, { targetUserRole: "owner" }],
        },
        orderBy: { createdAt: "desc" },
      });
    });
  });

  describe("Service: findById", () => {
    it("should return notice if found", async () => {
      mockPrisma.legalNotice.findUnique.mockResolvedValue(mockNotice);

      const result = await service.findById("notice-1");
      expect(result).toEqual(mockNotice);
    });

    it("should throw NotFoundException if not found", async () => {
      mockPrisma.legalNotice.findUnique.mockResolvedValue(null);

      await expect(service.findById("not-found")).rejects.toThrow(NotFoundException);
    });
  });

  describe("Service: getUnreadForUser", () => {
    const authUser: AuthUser = {
      uid: "fb-uid-1",
      email: "user@example.com",
      role: "owner",
    };

    it("should find existing user and fetch unread notices for role", async () => {
      mockPrisma.user.findFirst.mockResolvedValue(mockUser);
      mockPrisma.legalNotice.findMany.mockResolvedValue([mockNotice]);

      const result = await service.getUnreadForUser(authUser);

      expect(mockPrisma.legalNotice.findMany).toHaveBeenCalledWith({
        where: {
          isActive: true,
          OR: [{ targetUserRole: null }, { targetUserRole: "all" }, { targetUserRole: "owner" }],
          acceptances: {
            none: {
              userId: mockUser.id,
            },
          },
        },
        orderBy: { createdAt: "asc" },
      });
      expect(result).toEqual([mockNotice]);
    });

    it("should create user record if not found, then query unread notices", async () => {
      mockPrisma.user.findFirst.mockResolvedValue(null);
      mockPrisma.user.create.mockResolvedValue(mockUser);
      mockPrisma.legalNotice.findMany.mockResolvedValue([]);

      const result = await service.getUnreadForUser(authUser);

      expect(mockPrisma.user.create).toHaveBeenCalled();
      expect(result).toEqual([]);
    });
  });

  describe("Service: acceptNotice & markAsRead", () => {
    const authUser: AuthUser = {
      uid: "fb-uid-1",
      email: "user@example.com",
      role: "owner",
    };

    it("should record acceptance in database", async () => {
      mockPrisma.legalNotice.findUnique.mockResolvedValue(mockNotice);
      mockPrisma.user.findFirst.mockResolvedValue(mockUser);
      mockPrisma.legalNoticeAcceptance.upsert.mockResolvedValue({
        id: "acc-1",
        userId: mockUser.id,
        legalNoticeId: mockNotice.id,
        acceptedAt: new Date("2026-09-12T12:00:00Z"),
      });

      const result = await service.acceptNotice("notice-1", authUser);

      expect(mockPrisma.legalNoticeAcceptance.upsert).toHaveBeenCalledWith({
        where: {
          userId_legalNoticeId: {
            userId: mockUser.id,
            legalNoticeId: mockNotice.id,
          },
        },
        update: {
          acceptedAt: expect.any(Date),
        },
        create: {
          userId: mockUser.id,
          legalNoticeId: mockNotice.id,
        },
      });
      expect(result.success).toBe(true);
      expect(result.noticeId).toBe("notice-1");
    });

    it("should throw NotFoundException if notice does not exist", async () => {
      mockPrisma.legalNotice.findUnique.mockResolvedValue(null);

      await expect(service.acceptNotice("nonexistent", authUser)).rejects.toThrow(
        NotFoundException,
      );
    });

    it("markAsRead should delegate to acceptNotice", async () => {
      mockPrisma.legalNotice.findUnique.mockResolvedValue(mockNotice);
      mockPrisma.user.findFirst.mockResolvedValue(mockUser);
      mockPrisma.legalNoticeAcceptance.upsert.mockResolvedValue({
        id: "acc-1",
        userId: mockUser.id,
        legalNoticeId: mockNotice.id,
        acceptedAt: new Date(),
      });

      const result = await service.markAsRead("notice-1", authUser);
      expect(result.success).toBe(true);
    });
  });

  describe("Controller", () => {
    const authUser: AuthUser = {
      uid: "fb-uid-1",
      email: "user@example.com",
      role: "owner",
    };

    const mockReq = {
      user: authUser,
    } as any;

    it("controller.create should forward to service.create", async () => {
      mockPrisma.legalNotice.create.mockResolvedValue(mockNotice);

      const dto = { title: "Test", content: "Content" };
      const res = await controller.create(dto);
      expect(res).toEqual(mockNotice);
    });

    it("controller.findAll should parse active flag", async () => {
      mockPrisma.legalNotice.findMany.mockResolvedValue([mockNotice]);

      await controller.findAll("owner", "true");
      expect(mockPrisma.legalNotice.findMany).toHaveBeenCalledWith({
        where: {
          isActive: true,
          OR: [{ targetUserRole: null }, { targetUserRole: "all" }, { targetUserRole: "owner" }],
        },
        orderBy: { createdAt: "desc" },
      });
    });

    it("controller.getUnread should call service.getUnreadForUser", async () => {
      mockPrisma.user.findFirst.mockResolvedValue(mockUser);
      mockPrisma.legalNotice.findMany.mockResolvedValue([mockNotice]);

      const res = await controller.getUnread(mockReq);
      expect(res).toEqual([mockNotice]);
    });

    it("controller.getUnread should throw UnauthorizedException if req.user is missing", async () => {
      expect(() => controller.getUnread({} as any)).toThrow(UnauthorizedException);
    });

    it("controller.accept should call service.acceptNotice", async () => {
      mockPrisma.legalNotice.findUnique.mockResolvedValue(mockNotice);
      mockPrisma.user.findFirst.mockResolvedValue(mockUser);
      mockPrisma.legalNoticeAcceptance.upsert.mockResolvedValue({
        id: "acc-1",
        userId: mockUser.id,
        legalNoticeId: mockNotice.id,
        acceptedAt: new Date(),
      });

      const res = await controller.accept("notice-1", mockReq);
      expect(res.success).toBe(true);
    });

    it("controller.markAsRead should call service.markAsRead", async () => {
      mockPrisma.legalNotice.findUnique.mockResolvedValue(mockNotice);
      mockPrisma.user.findFirst.mockResolvedValue(mockUser);
      mockPrisma.legalNoticeAcceptance.upsert.mockResolvedValue({
        id: "acc-1",
        userId: mockUser.id,
        legalNoticeId: mockNotice.id,
        acceptedAt: new Date(),
      });

      const res = await controller.markAsRead("notice-1", mockReq);
      expect(res.success).toBe(true);
    });
  });
});
