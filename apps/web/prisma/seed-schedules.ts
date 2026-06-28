import { PrismaClient } from '@prisma/client';
import { addDays, setHours, setMinutes, startOfDay } from 'date-fns';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding EventSchedules for the current month...');
  
  const attractions = await prisma.attraction.findMany({
    where: { isPublished: true }
  });

  if (attractions.length === 0) {
    console.log('No attractions found. Exiting.');
    return;
  }

  // Clear existing schedules
  await prisma.eventSchedule.deleteMany({});

  const today = startOfDay(new Date());
  let schedulesCreated = 0;

  for (const attraction of attractions) {
    // Generate 5 days of events starting from today
    for (let dayOffset = 0; dayOffset < 5; dayOffset++) {
      const currentDay = addDays(today, dayOffset);
      
      // Generate 2 time slots per day
      const slots = [
        { hour: 14, min: 0, capacity: 100, count: Math.floor(Math.random() * 100) }, // 2 PM
        { hour: 18, min: 30, capacity: 200, count: Math.floor(Math.random() * 200) }, // 6:30 PM
        { hour: 20, min: 0, capacity: 50, count: 50 } // 8 PM - SOLD OUT test case
      ];

      for (const slot of slots) {
        const startTime = setMinutes(setHours(currentDay, slot.hour), slot.min);
        const endTime = setMinutes(setHours(currentDay, slot.hour + 2), slot.min);

        await prisma.eventSchedule.create({
          data: {
            attractionId: attraction.id,
            startTime,
            endTime,
            eventType: 'REGULAR',
            capacityGate: slot.capacity,
            currentCount: slot.count,
          }
        });
        schedulesCreated++;
      }
    }
    console.log(`Seeded schedules for ${attraction.nameEn}`);
  }

  console.log(`Successfully created ${schedulesCreated} event schedules!`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
