import { PrismaClient } from "@prisma/client";
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
    },
  });

  const ownerPro = await prisma.user.upsert({
    where: { email: "owner_pro@ejemplo.com" },
    update: { role: "owner" },
    create: {
      email: "owner_pro@ejemplo.com",
      name: "Owner Pro",
      role: "owner",
    },
  });

  const ownerPremium = await prisma.user.upsert({
    where: { email: "owner_premium@ejemplo.com" },
    update: { role: "owner" },
    create: {
      email: "owner_premium@ejemplo.com",
      name: "Owner Premium",
      role: "owner",
    },
  });

  // 3. Crear Cliente Final
  const customer = await prisma.user.upsert({
    where: { email: "cliente@b2c.com" },
    update: { role: "user" },
    create: {
      email: "cliente@b2c.com",
      name: "Cliente Final",
      role: "user",
    },
  });

  // 4. Crear Locales en distintos planes
  const businessBasic = await prisma.business.upsert({
    where: { id: "local-basic" },
    update: { plan: "BASIC", ownerId: ownerBasic.id },
    create: {
      id: "local-basic",
      name: "Barberia Basic",
      ownerId: ownerBasic.id,
      plan: "BASIC",
    },
  });

  const businessPro = await prisma.business.upsert({
    where: { id: "local-pro" },
    update: { plan: "PRO", ownerId: ownerPro.id },
    create: {
      id: "local-pro",
      name: "Estetica Pro",
      ownerId: ownerPro.id,
      plan: "PRO",
    },
  });

  const businessPremium = await prisma.business.upsert({
    where: { id: "local-premium" },
    update: { plan: "PREMIUM", ownerId: ownerPremium.id },
    create: {
      id: "local-premium",
      name: "Spa Premium",
      ownerId: ownerPremium.id,
      plan: "PREMIUM",
    },
  });

  // 5. Crear Servicios
  const businesses = [businessBasic, businessPro, businessPremium];
  for (const b of businesses) {
    await prisma.service.upsert({
      where: { id: `srv-1-${b.id}` },
      update: {},
      create: {
        id: `srv-1-${b.id}`,
        name: "Servicio Estandar",
        price: 15,
        duration: 30,
        businessId: b.id,
      },
    });
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
