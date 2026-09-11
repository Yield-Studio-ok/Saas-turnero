export interface TimeSlot {
  startTime: string; // "HH:mm"
  endTime: string;   // "HH:mm"
}

export function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(":");
  return parseInt(hours, 10) * 60 + parseInt(minutes, 10);
}

export function minutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}`;
}

export interface AvailabilityEngineOptions {
  workingHours: TimeSlot[];
  appointments: TimeSlot[];
  serviceDuration: number;
  slotInterval?: number;
}

export function calculateAvailableSlots({
  workingHours,
  appointments,
  serviceDuration,
  slotInterval,
}: AvailabilityEngineOptions): TimeSlot[] {
  const interval = slotInterval ?? serviceDuration;
  
  let freeBlocks = workingHours.map((wh) => ({
    start: timeToMinutes(wh.startTime),
    end: timeToMinutes(wh.endTime),
  }));

  const bookedBlocks = appointments.map((app) => ({
    start: timeToMinutes(app.startTime),
    end: timeToMinutes(app.endTime),
  }));

  for (const booked of bookedBlocks) {
    const newFreeBlocks: { start: number; end: number }[] = [];

    for (const free of freeBlocks) {
      if (booked.end <= free.start || booked.start >= free.end) {
        newFreeBlocks.push(free);
      } else {
        if (booked.start > free.start) {
          newFreeBlocks.push({ start: free.start, end: booked.start });
        }
        if (booked.end < free.end) {
          newFreeBlocks.push({ start: booked.end, end: free.end });
        }
      }
    }
    freeBlocks = newFreeBlocks;
  }

  const availableSlots: TimeSlot[] = [];

  for (const block of freeBlocks) {
    let currentStart = block.start;
    while (currentStart + serviceDuration <= block.end) {
      availableSlots.push({
        startTime: minutesToTime(currentStart),
        endTime: minutesToTime(currentStart + serviceDuration),
      });
      currentStart += interval;
    }
  }

  return availableSlots;
}
