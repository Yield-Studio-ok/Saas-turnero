import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  console.log("Seeding demo data...");

  const user = await prisma.user.upsert({
    where: { email: "admin@ejemplo.com" },
    update: {},
    create: {
      email: "admin@ejemplo.com",
      name: "Admin Demo",
      role: "owner",
    },
  });

  const business = await prisma.business.upsert({
    where: { id: "demo-local" },
    update: { ownerId: user.id },
    create: {
      id: "demo-local",
      name: "Peluquería de Demo",
      ownerId: user.id,
    },
  });

  const services = await Promise.all([
    prisma.service.upsert({
      where: { id: "service-1" },
      update: {},
      create: {
        id: "service-1",
        name: "Corte Clásico",
        price: 15,
        duration: 30,
        businessId: business.id,
      },
    }),
    prisma.service.upsert({
      where: { id: "service-2" },
      update: {},
      create: {
        id: "service-2",
        name: "Barba y Perfilado",
        price: 10,
        duration: 20,
        businessId: business.id,
      },
    }),
    prisma.service.upsert({
      where: { id: "service-3" },
      update: {},
      create: {
        id: "service-3",
        name: "Coloración",
        price: 40,
        duration: 60,
        businessId: business.id,
      },
    }),
  ]);

  const employees = await Promise.all([
    prisma.employee.upsert({
      where: { id: "emp-1" },
      update: {},
      create: { id: "emp-1", name: "Juan Perez", businessId: business.id },
    }),
    prisma.employee.upsert({
      where: { id: "emp-2" },
      update: {},
      create: { id: "emp-2", name: "Maria Gomez", businessId: business.id },
    }),
    prisma.employee.upsert({
      where: { id: "emp-3" },
      update: {},
      create: { id: "emp-3", name: "Carlos Ruiz", businessId: business.id },
    }),
  ]);

  for (const emp of employees) {
    for (let day = 1; day <= 5; day++) {
      await prisma.schedule
        .create({
          data: {
            employeeId: emp.id,
            businessId: business.id,
            dayOfWeek: day,
            startTime: "09:00",
            endTime: "18:00",
          },
        })
        .catch(() => {});
    }
  }

  const today = new Date().toISOString().split("T")[0];
  await prisma.appointment.deleteMany({ where: { businessId: business.id } });

  const appointmentsData = [
    {
      empId: "emp-1",
      srvId: "service-1",
      start: "09:00",
      end: "09:30",
      cust: "Lucas",
      status: "completed",
    },
    {
      empId: "emp-1",
      srvId: "service-2",
      start: "10:00",
      end: "10:20",
      cust: "Martin",
      status: "confirmed",
    },
    {
      empId: "emp-1",
      srvId: "service-1",
      start: "11:00",
      end: "11:30",
      cust: "Pedro",
      status: "confirmed",
    },
    {
      empId: "emp-2",
      srvId: "service-3",
      start: "09:00",
      end: "10:00",
      cust: "Ana",
      status: "cancelled",
    },
    {
      empId: "emp-2",
      srvId: "service-1",
      start: "13:00",
      end: "13:30",
      cust: "Laura",
      status: "confirmed",
    },
    {
      empId: "emp-3",
      srvId: "service-2",
      start: "15:00",
      end: "15:20",
      cust: "Diego",
      status: "confirmed",
    },
  ];

  for (const appt of appointmentsData) {
    await prisma.appointment.create({
      data: {
        date: today,
        startTime: appt.start,
        endTime: appt.end,
        status: appt.status,
        customerName: appt.cust,
        customerEmail: appt.cust.toLowerCase() + "@test.com",
        businessId: business.id,
        employeeId: appt.empId,
        serviceId: appt.srvId,
      },
    });
  }

  console.log("Demo data seeded successfully!");
}

main().then(() => prisma.$disconnect());
