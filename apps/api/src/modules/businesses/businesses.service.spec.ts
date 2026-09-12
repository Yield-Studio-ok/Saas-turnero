import { Test, TestingModule } from "@nestjs/testing";
import { BusinessesService } from "./businesses.service";
import { BusinessesController } from "./businesses.controller";
import { PrismaService } from "../../prisma/prisma.service";
import { FirebaseService } from "../auth/firebase.service";
import { NotFoundException, BadRequestException } from "@nestjs/common";

describe("BusinessesService & BusinessesController - Public Query", () => {
  let service: BusinessesService;
  let controller: BusinessesController;

  let mockPrisma: any;
  let mockFirebase: any;
  let mockFirestore: any;
  let mockTenantsCollection: any;
  let mockServicesSubcollection: any;

  beforeEach(async () => {
    mockServicesSubcollection = {
      get: jest.fn().mockResolvedValue({
        docs: [
          {
            id: "srv-1",
            data: () => ({
              name: "Corte Cl�sico",
              description: "Corte tradicional a tijera o m�quina",
              duration: 30,
              price: 1500,
              category: "Cortes",
            }),
          },
          {
            id: "srv-2",
            data: () => ({
              name: "Barba Completa",
              description: "Perfilado y toalla caliente",
              duration: 20,
              price: 1000,
              category: "Barba",
            }),
          },
        ],
      }),
    };

    const mockTenantDoc = {
      exists: true,
      id: "tenant-123",
      data: () => ({
        name: "Barber�a Vintage",
        slug: "barberia-vintage",
        description: "La mejor barber�a cl�sica de la ciudad",
        tagline: "Estilo y tradici�n",
        address: "Av. Corrientes 1234",
        phone: "+54 11 4444-5555",
        openHours: "10:00 - 20:00",
        rating: 4.9,
        reviewCount: 120,
        isOpen: true,
      }),
    };

    mockTenantsCollection = {
      doc: jest.fn().mockImplementation((id: string) => ({
        get: jest.fn().mockImplementation(async () => {
          if (id === "tenant-123") {
            return mockTenantDoc;
          }
          return { exists: false, id };
        }),
        collection: jest.fn().mockImplementation((col: string) => {
          if (col === "services") {
            return mockServicesSubcollection;
          }
          return { get: jest.fn().mockResolvedValue({ docs: [] }) };
        }),
        set: jest.fn().mockResolvedValue(undefined),
      })),
      where: jest.fn().mockImplementation((field: string, op: string, val: string) => ({
        limit: jest.fn().mockReturnValue({
          get: jest.fn().mockImplementation(async () => {
            if (field === "slug" && val === "barberia-vintage") {
              return {
                empty: false,
                docs: [mockTenantDoc],
              };
            }
            if (field === "name" && val === "Barber�a Vintage") {
              return {
                empty: false,
                docs: [mockTenantDoc],
              };
            }
            return { empty: true, docs: [] };
          }),
        }),
      })),
    };

    mockFirestore = {
      collection: jest.fn().mockImplementation((name: string) => {
        if (name === "tenants") {
          return mockTenantsCollection;
        }
        return {
          where: jest.fn().mockReturnValue({
            get: jest.fn().mockResolvedValue({ empty: true, docs: [] }),
          }),
        };
      }),
    };

    mockFirebase = {
      isEnabled: jest.fn().mockReturnValue(true),
      getFirestore: jest.fn().mockReturnValue(mockFirestore),
      setRole: jest.fn().mockResolvedValue(undefined),
    };

    mockPrisma = {
      business: {
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      service: {
        findMany: jest.fn().mockResolvedValue([]),
      },
      user: {
        update: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [BusinessesController],
      providers: [
        BusinessesService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: FirebaseService, useValue: mockFirebase },
      ],
    }).compile();

    service = module.get<BusinessesService>(BusinessesService);
    controller = module.get<BusinessesController>(BusinessesController);
  });

  describe("BusinessesService.getPublicProfile", () => {
    it("should fetch tenant details and services subcollection from Firestore by document ID", async () => {
      const result = await service.getPublicProfile("tenant-123");

      expect(mockFirebase.isEnabled).toHaveBeenCalled();
      expect(mockFirestore.collection).toHaveBeenCalledWith("tenants");
      expect(mockTenantsCollection.doc).toHaveBeenCalledWith("tenant-123");
      expect(mockServicesSubcollection.get).toHaveBeenCalled();

      expect(result.id).toBe("tenant-123");
      expect(result.name).toBe("Barber�a Vintage");
      expect(result.slug).toBe("barberia-vintage");
      expect(result.services).toHaveLength(2);
      expect(result.services[0].id).toBe("srv-1");
      expect(result.services[0].name).toBe("Corte Cl�sico");
      expect(result.services[1].id).toBe("srv-2");
      expect(result.services[1].name).toBe("Barba Completa");
      expect(result.business.name).toBe("Barber�a Vintage");
    });

    it("should fetch tenant details and services from Firestore by slug when ID lookup misses", async () => {
      const result = await service.getPublicProfile("barberia-vintage");

      expect(mockTenantsCollection.where).toHaveBeenCalledWith("slug", "==", "barberia-vintage");
      expect(result.id).toBe("tenant-123");
      expect(result.name).toBe("Barber�a Vintage");
      expect(result.services).toHaveLength(2);
    });

    it("should fallback to Prisma if Firestore is not enabled", async () => {
      mockFirebase.isEnabled.mockReturnValue(false);

      mockPrisma.business.findFirst.mockResolvedValue({
        id: "business-prisma-1",
        name: "Salon Prisma",
        description: "Salon de prueba en Prisma",
        ownerId: "owner-1",
        services: [
          {
            id: "prisma-srv-1",
            name: "Lavado",
            description: "Lavado y secado",
            duration: 15,
            price: 800,
            businessId: "business-prisma-1",
          },
        ],
      });

      const result = await service.getPublicProfile("business-prisma-1");

      expect(mockPrisma.business.findFirst).toHaveBeenCalledWith({
        where: {
          OR: [{ id: "business-prisma-1" }, { name: "business-prisma-1" }],
        },
        include: {
          services: true,
        },
      });
      expect(result.id).toBe("business-prisma-1");
      expect(result.name).toBe("Salon Prisma");
      expect(result.services).toHaveLength(1);
      expect(result.services[0].name).toBe("Lavado");
    });

    it("should fallback to Prisma if tenant is not found in Firestore", async () => {
      mockPrisma.business.findFirst.mockResolvedValue({
        id: "fallback-id",
        name: "Barber�a Fallback",
        description: "Desde base de datos relacional",
        ownerId: "owner-2",
        services: [],
      });

      const result = await service.getPublicProfile("non-existent-in-firestore");

      expect(mockPrisma.business.findFirst).toHaveBeenCalled();
      expect(result.id).toBe("fallback-id");
      expect(result.name).toBe("Barber�a Fallback");
    });

    it("should throw NotFoundException if not found in Firestore or Prisma", async () => {
      mockPrisma.business.findFirst.mockResolvedValue(null);

      await expect(service.getPublicProfile("unknown-tenant")).rejects.toThrow(
        NotFoundException,
      );
    });

    it("should throw BadRequestException if identifier is empty or invalid", async () => {
      await expect(service.getPublicProfile("   ")).rejects.toThrow(BadRequestException);
    });
  });

  describe("BusinessesService.getPublicServices", () => {
    it("should return only services array", async () => {
      const services = await service.getPublicServices("tenant-123");
      expect(Array.isArray(services)).toBe(true);
      expect(services).toHaveLength(2);
      expect(services[0].name).toBe("Corte Cl�sico");
    });
  });

  describe("BusinessesController public routes", () => {
    it("getPublicProfile should delegate to service with identifier", async () => {
      const result = await controller.getPublicProfile("barberia-vintage");
      expect(result.name).toBe("Barber�a Vintage");
    });

    it("getPublicProfileById should delegate to service with id", async () => {
      const result = await controller.getPublicProfileById("tenant-123");
      expect(result.id).toBe("tenant-123");
    });

    it("getPublicProfileQuery should delegate to service with query parameter", async () => {
      const result = await controller.getPublicProfileQuery("barberia-vintage");
      expect(result.name).toBe("Barber�a Vintage");
    });

    it("getPublicProfileQuery should throw BadRequestException if no query param provided", () => {
      expect(() => controller.getPublicProfileQuery()).toThrow(BadRequestException);
    });

    it("getPublicServices should return services array", async () => {
      const services = await controller.getPublicServices("tenant-123");
      expect(services).toHaveLength(2);
    });
  });
});
