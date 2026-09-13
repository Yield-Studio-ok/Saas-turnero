import { PrismaClient, SubscriptionPlan } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  console.log("Seeding demo data...");

  // 1. Superadmin
  await prisma.user.upsert({
    where: { email: "superadmin@saas.com" },
    update: {},
    create: {
      email: "superadmin@saas.com",
      name: "Super Admin",
      role: "superadmin",
    },
  });

  // 2. Business Owners
  const ownerBasic = await prisma.user.upsert({
    where: { email: "owner_basic@saas.com" },
    update: {},
    create: {
      email: "owner_basic@saas.com",
      name: "Owner Basic",
      role: "owner",
    },
  });

  const ownerPro = await prisma.user.upsert({
    where: { email: "owner_pro@saas.com" },
    update: {},
    create: {
      email: "owner_pro@saas.com",
      name: "Owner Pro",
      role: "owner",
    },
  });

  const ownerPremium = await prisma.user.upsert({
    where: { email: "owner_premium@saas.com" },
    update: {},
    create: {
      email: "owner_premium@saas.com",
      name: "Owner Premium",
      role: "owner",
    },
  });

  // 3. Businesses (Locales en distintos planes)
  const businessBasic = await prisma.business.upsert({
    where: { id: "business-basic" },
    update: { ownerId: ownerBasic.id, plan: SubscriptionPlan.BASIC },
    create: {
      id: "business-basic",
      name: "Local Basic",
      ownerId: ownerBasic.id,
      plan: SubscriptionPlan.BASIC,
    },
  });

  const businessPro = await prisma.business.upsert({
    where: { id: "business-pro" },
    update: { ownerId: ownerPro.id, plan: SubscriptionPlan.PRO },
    create: {
      id: "business-pro",
      name: "Local Pro",
      ownerId: ownerPro.id,
      plan: SubscriptionPlan.PRO,
    },
  });

  const businessPremium = await prisma.business.upsert({
    where: { id: "business-premium" },
    update: { ownerId: ownerPremium.id, plan: SubscriptionPlan.PREMIUM },
    create: {
      id: "business-premium",
      name: "Local Premium",
      ownerId: ownerPremium.id,
      plan: SubscriptionPlan.PREMIUM,
    },
  });

  // 4. End Customer
  const customer = await prisma.user.upsert({
    where: { email: "cliente@final.com" },
    update: {},
    create: {
      email: "cliente@final.com",
      name: "Cliente Final",
      role: "user",
    },
  });

  // 5. Services and Employees
  const businesses = [businessBasic, businessPro, businessPremium];

  let serviceCounter = 1;
  let employeeCounter = 1;

  for (const b of businesses) {
    // Services
    await prisma.service.upsert({
      where: { id: `service-${serviceCounter}` },
      update: {},
      create: {
        id: `service-${serviceCounter}`,
        name: `Servicio 1 de ${b.name}`,
        price: 15,
        duration: 30,
        businessId: b.id,
      },
    });
    serviceCounter++;

    await prisma.service.upsert({
      where: { id: `service-${serviceCounter}` },
      update: {},
      create: {
        id: `service-${serviceCounter}`,
        name: `Servicio 2 de ${b.name}`,
        price: 20,
        duration: 45,
        businessId: b.id,
      },
    });
    serviceCounter++;

    // Employees
    const emp1 = await prisma.employee.upsert({
      where: { id: `emp-${employeeCounter}` },
      update: {},
      create: { id: `emp-${employeeCounter}`, name: `Empleado A (${b.name})`, businessId: b.id },
    });
    employeeCounter++;

    const emp2 = await prisma.employee.upsert({
      where: { id: `emp-${employeeCounter}` },
      update: {},
      create: { id: `emp-${employeeCounter}`, name: `Empleado B (${b.name})`, businessId: b.id },
    });
    employeeCounter++;

    const emps = [emp1, emp2];

    for (const emp of emps) {
      for (let day = 1; day <= 5; day++) {
        await prisma.schedule
          .create({
            data: {
              employeeId: emp.id,
              businessId: b.id,
              dayOfWeek: day,
              startTime: "09:00",
              endTime: "18:00",
            },
          })
          .catch(() => {});
      }
    }
  }

  // Clear appointments for those businesses just in case
  await prisma.appointment.deleteMany({
    where: { businessId: { in: businesses.map((b) => b.id) } },
  });

  const today = new Date().toISOString().split("T")[0];

  // Some demo appointments
  await prisma.appointment.create({
    data: {
      date: today,
      startTime: "09:00",
      endTime: "09:30",
      status: "completed",
      customerName: customer.name || "Cliente",
      customerEmail: customer.email,
      businessId: businessBasic.id,
      employeeId: "emp-1",
      serviceId: "service-1",
    },
  });

  await prisma.appointment.create({
    data: {
      date: today,
      startTime: "10:00",
      endTime: "10:30",
      status: "confirmed",
      customerName: customer.name || "Cliente",
      customerEmail: customer.email,
      businessId: businessPro.id,
      employeeId: "emp-3",
      serviceId: "service-3",
    },
  });

  console.log("Demo data seeded successfully!");
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
