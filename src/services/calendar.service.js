import prisma from "../config/prisma.js";

export const calendarService = {
  getEvents: async (startDate, endDate) => {
    // 1. Fetch Booking Events
    const bookingEvents = await prisma.bookingEvent.findMany({
      where: {
        eventDate: {
          gte: new Date(startDate),
          lte: new Date(endDate)
        }
      },
      include: {
        booking: {
          include: { customer: true }
        },
        photographer: { select: { id: true, name: true } }
      },
      orderBy: { eventDate: 'asc' }
    });

    // 2. Fetch Availabilities (Blocked/Holidays)
    const availabilities = await prisma.availability.findMany({
      where: {
        date: {
          gte: new Date(startDate),
          lte: new Date(endDate)
        },
        isBlocked: true
      },
      include: {
        user: { select: { id: true, name: true } }
      }
    });

    // 3. Combine and return
    return {
      bookingEvents,
      availabilities
    };
  }
};
