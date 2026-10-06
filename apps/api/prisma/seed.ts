import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcryptjs";
const prisma = new PrismaClient();

async function main() {
  console.log("Seeding B2B2C demo data...");

  // 1. Crear Superadmin
  await prisma.user.upsert({
    where: { email: "superadmin@turnero.com" },
    update: { role: "superadmin" },
    create: {
      email: "superadmin@turnero.com",
      name: "Super Admin",
      role: "superadmin",
      password: await bcrypt.hash("123456", 10),
    },
  });

  // 2. Crear Dueños de Locales
  const ownerBasic = await prisma.user.upsert({
    where: { email: "owner_basic@ejemplo.com" },
    update: { role: "owner" },
    create: {
      email: "owner_basic@ejemplo.com",
      name: "Owner Basic",
      role: "owner",
      password: await bcrypt.hash("123456", 10),
    },
  });

  const ownerPro = await prisma.user.upsert({
    where: { email: "owner_pro@ejemplo.com" },
    update: { role: "owner" },
    create: {
      email: "owner_pro@ejemplo.com",
      name: "Owner Pro",
      role: "owner",
      password: await bcrypt.hash("123456", 10),
    },
  });

  const ownerPremium = await prisma.user.upsert({
    where: { email: "owner_premium@ejemplo.com" },
    update: { role: "owner" },
    create: {
      email: "owner_premium@ejemplo.com",
      name: "Owner Premium",
      role: "owner",
      password: await bcrypt.hash("123456", 10),
    },
  });

  // 3. Crear Empleados / Barberos
  await prisma.user.upsert({
    where: { email: "juan@barberiapremium.com" },
    update: { role: "employee" },
    create: {
      email: "juan@barberiapremium.com",
      name: "Juan Barbero",
      role: "employee",
      password: await bcrypt.hash("123456", 10),
    },
  });

  await prisma.user.upsert({
    where: { email: "empleado@ejemplo.com" },
    update: { role: "employee" },
    create: {
      email: "empleado@ejemplo.com",
      name: "Empleado Demo",
      role: "employee",
      password: await bcrypt.hash("123456", 10),
    },
  });

  // 4. Crear Cliente Final
  const customer = await prisma.user.upsert({
    where: { email: "cliente@b2c.com" },
    update: { role: "user" },
    create: {
      email: "cliente@b2c.com",
      name: "Cliente Final",
      role: "user",
      password: await bcrypt.hash("123456", 10),
    },
  });

  // 4. Crear Locales en distintos planes
  // 4. Crear Locales en distintos planes con imágenes estables de alta resolución (Unsplash)
  const businessBasic = await prisma.business.upsert({
    where: { id: "local-basic" },
    update: {
      name: "Barbería Tradicional Basic",
      description: "Cortes clásicos, perfilado de barba y toallas calientes al estilo vintage.",
      plan: "BASIC",
      ownerId: ownerBasic.id,
      imageUrls: [
        "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&w=1200&q=80",
      ],
    },
    create: {
      id: "local-basic",
      name: "Barbería Tradicional Basic",
      description: "Cortes clásicos, perfilado de barba y toallas calientes al estilo vintage.",
      ownerId: ownerBasic.id,
      plan: "BASIC",
      imageUrls: [
        "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&w=1200&q=80",
      ],
    },
  });

  const businessPro = await prisma.business.upsert({
    where: { id: "local-pro" },
    update: {
      name: "Estética & Salón Glamour Pro",
      description: "Coloración avanzada, peinados de fiesta y cuidado capilar profesional.",
      plan: "PRO",
      ownerId: ownerPro.id,
      imageUrls: [
        "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=1200&q=80",
      ],
    },
    create: {
      id: "local-pro",
      name: "Estética & Salón Glamour Pro",
      description: "Coloración avanzada, peinados de fiesta y cuidado capilar profesional.",
      ownerId: ownerPro.id,
      plan: "PRO",
      imageUrls: [
        "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=1200&q=80",
      ],
    },
  });

  const businessPremium = await prisma.business.upsert({
    where: { id: "local-premium" },
    update: {
      name: "Spa & Wellness Deluxe",
      description:
        "Experiencias de relajación integral, masajes terapéuticos y tratamientos faciales.",
      plan: "PREMIUM",
      ownerId: ownerPremium.id,
      imageUrls: [
        "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?auto=format&fit=crop&w=1200&q=80",
      ],
    },
    create: {
      id: "local-premium",
      name: "Spa & Wellness Deluxe",
      description:
        "Experiencias de relajación integral, masajes terapéuticos y tratamientos faciales.",
      ownerId: ownerPremium.id,
      plan: "PREMIUM",
      imageUrls: [
        "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?auto=format&fit=crop&w=1200&q=80",
      ],
    },
  });

  // 5. Crear Servicios
  const servicesConfig = [
    {
      businessId: businessBasic.id,
      services: [
        {
          id: `srv-1-${businessBasic.id}`,
          name: "Corte Clásico & Peinado",
          price: 1500,
          duration: 30,
          description: "Corte a tijera o máquina con lavado y peinado con fijación mate.",
        },
        {
          id: `srv-2-${businessBasic.id}`,
          name: "Perfilado de Barba & Toalla Caliente",
          price: 1200,
          duration: 25,
          description: "Ritual completo con navaja, aceites esenciales y toalla tibia.",
        },
        {
          id: `srv-3-${businessBasic.id}`,
          name: "Combo Corte + Barba Completo",
          price: 2500,
          duration: 50,
          description: "Servicio completo de corte de cabello y diseño de barba integral.",
        },
      ],
    },
    {
      businessId: businessPro.id,
      services: [
        {
          id: `srv-1-${businessPro.id}`,
          name: "Corte y Estilismo Femenino",
          price: 2800,
          duration: 45,
          description: "Diagnóstico capilar personalizado, lavado relajante y corte de estilo.",
        },
        {
          id: `srv-2-${businessPro.id}`,
          name: "Coloración Global & Balayage",
          price: 6500,
          duration: 90,
          description: "Color profesional con protección plex y matizado luminoso.",
        },
        {
          id: `srv-3-${businessPro.id}`,
          name: "Tratamiento de Keratina y Nutrición",
          price: 4200,
          duration: 60,
          description: "Sellado de cutícula, hidratación intensa y brillo de larga duración.",
        },
      ],
    },
    {
      businessId: businessPremium.id,
      services: [
        {
          id: `srv-1-${businessPremium.id}`,
          name: "Masaje Descontracturante Profundo",
          price: 4800,
          duration: 60,
          description: "Alivio de tensiones musculares con aromaterapia y piedras tibias.",
        },
        {
          id: `srv-2-${businessPremium.id}`,
          name: "Limpieza Facial Profunda & Hidratación",
          price: 5500,
          duration: 50,
          description: "Exfoliación con punta de diamante y mascarilla descongestiva de oro.",
        },
        {
          id: `srv-3-${businessPremium.id}`,
          name: "Circuito Spa & Hidroterapia Deluxe",
          price: 7500,
          duration: 90,
          description: "Sesión completa de sauna finlandés, jacuzzi y masaje relajante.",
        },
      ],
    },
  ];

  for (const group of servicesConfig) {
    for (const s of group.services) {
      await prisma.service.upsert({
        where: { id: s.id },
        update: {
          name: s.name,
          price: s.price,
          duration: s.duration,
          description: s.description,
        },
        create: {
          id: s.id,
          name: s.name,
          price: s.price,
          duration: s.duration,
          description: s.description,
          businessId: group.businessId,
        },
      });
    }
  }

  // 6. Crear Empleados
  const employees = [];
  for (const b of businesses) {
    const emp = await prisma.employee.upsert({
      where: { id: `emp-${b.id}` },
      update: {},
      create: {
        id: `emp-${b.id}`,
        name: `Empleado ${b.name}`,
        businessId: b.id,
      },
    });
    employees.push(emp);
  }

  // 7. Crear Horarios para Empleados
  for (const emp of employees) {
    for (let day = 1; day <= 5; day++) {
      await prisma.schedule
        .create({
          data: {
            employeeId: emp.id,
            businessId: emp.businessId,
            dayOfWeek: day,
            startTime: "09:00",
            endTime: "18:00",
          },
        })
        .catch(() => {});
    }
  }

  // 8. Limpiar y Crear Turnos de Demo
  const today = new Date().toISOString().split("T")[0];
  await prisma.appointment.deleteMany();

  for (const b of businesses) {
    await prisma.appointment.create({
      data: {
        date: today,
        startTime: "10:00",
        endTime: "10:30",
        status: "confirmed",
        customerName: customer.name || "Cliente Demo",
        customerEmail: customer.email,
        businessId: b.id,
        employeeId: `emp-${b.id}`,
        serviceId: `srv-1-${b.id}`,
      },
    });
  }

  console.log("B2B2C demo data seeded successfully!");
}

main().then(() => prisma.$disconnect());
