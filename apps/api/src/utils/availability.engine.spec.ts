import { calculateAvailableSlots, timeToMinutes, minutesToTime, TimeSlot } from "./availability.engine";

describe("Availability Engine", () => {
  describe("timeToMinutes", () => {
    it("should convert correctly", () => {
      expect(timeToMinutes("00:00")).toBe(0);
      expect(timeToMinutes("09:30")).toBe(570);
      expect(timeToMinutes("23:59")).toBe(1439);
    });
  });

  describe("minutesToTime", () => {
    it("should convert correctly", () => {
      expect(minutesToTime(0)).toBe("00:00");
      expect(minutesToTime(570)).toBe("09:30");
      expect(minutesToTime(1439)).toBe("23:59");
    });
  });

  describe("calculateAvailableSlots", () => {
    it("should return free slots when no appointments exist", () => {
      const workingHours = [{ startTime: "09:00", endTime: "11:00" }];
      const appointments: TimeSlot[] = [];
      const serviceDuration = 60;

      const slots = calculateAvailableSlots({ workingHours, appointments, serviceDuration });

      expect(slots).toEqual([
        { startTime: "09:00", endTime: "10:00" },
        { startTime: "10:00", endTime: "11:00" },
      ]);
    });

    it("should handle custom slot intervals", () => {
      const workingHours = [{ startTime: "09:00", endTime: "10:00" }];
      const appointments: TimeSlot[] = [];
      const serviceDuration = 30;
      const slotInterval = 15;

      const slots = calculateAvailableSlots({ workingHours, appointments, serviceDuration, slotInterval });

      expect(slots).toEqual([
        { startTime: "09:00", endTime: "09:30" },
        { startTime: "09:15", endTime: "09:45" },
        { startTime: "09:30", endTime: "10:00" },
      ]);
    });

    it("should exclude appointments correctly", () => {
      const workingHours = [{ startTime: "09:00", endTime: "13:00" }];
      const appointments = [{ startTime: "10:00", endTime: "11:00" }];
      const serviceDuration = 60;

      const slots = calculateAvailableSlots({ workingHours, appointments, serviceDuration });

      expect(slots).toEqual([
        { startTime: "09:00", endTime: "10:00" },
        { startTime: "11:00", endTime: "12:00" },
        { startTime: "12:00", endTime: "13:00" },
      ]);
    });

    it("should handle overlapping boundaries of appointments", () => {
      const workingHours = [{ startTime: "09:00", endTime: "11:00" }];
      const appointments = [
        { startTime: "08:00", endTime: "09:30" }, // partially before
        { startTime: "10:30", endTime: "12:00" }, // partially after
      ];
      const serviceDuration = 30;

      const slots = calculateAvailableSlots({ workingHours, appointments, serviceDuration });

      expect(slots).toEqual([
        { startTime: "09:30", endTime: "10:00" },
        { startTime: "10:00", endTime: "10:30" },
      ]);
    });
  });
});
