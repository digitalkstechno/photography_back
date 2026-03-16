import prisma from "../config/prisma.js"
import { createBaseService } from "../core/base.service.js"

const base = createBaseService(prisma.booking)

const fullInclude = {
    customer: true,
    quotation: true,
    events: {
        include: {
            photographer: {
                select: { id: true, name: true, email: true }
            }
        }
    }
}

export const bookingService = {

    ...base,

    findAll: () =>
        prisma.booking.findMany({
            include: fullInclude,
            orderBy: { createdAt: "desc" }
        }),

    findById: (id) =>
        prisma.booking.findUnique({
            where: { id },
            include: fullInclude
        }),

    createBookingWithEvents: async ({ customerId, quotationId, packageId, status, notes, events }) => {
        return prisma.$transaction(async (tx) => {
            // Validate double bookings for all provided events
            for (const event of events) {
                if (event.eventDate) {
                    const startOfDay = new Date(event.eventDate);
                    startOfDay.setUTCHours(0, 0, 0, 0);

                    const endOfDay = new Date(event.eventDate);
                    endOfDay.setUTCHours(23, 59, 59, 999);

                    const conflictingEvents = await tx.bookingEvent.findMany({
                        where: {
                            eventDate: {
                                gte: startOfDay,
                                lte: endOfDay
                            }
                        },
                        include: { booking: true }
                    });

                    if (conflictingEvents.length > 0 && !event.overrideConflicts) {
                        const conflictDetails = conflictingEvents.map(e => `Booking #${e.bookingId}`).join(", ");
                        throw new Error(`Conflict on ${startOfDay.toISOString().split('T')[0]} with ${conflictDetails}. Use override to force.`);
                    }
                }
            }

            const newBooking = await tx.booking.create({
                data: {
                    customerId,
                    quotationId,
                    packageId,
                    status: status || 'TENTATIVE',
                    notes
                }
            });

            if (events && events.length > 0) {
                await tx.bookingEvent.createMany({
                    data: events.map(e => ({
                        bookingId: newBooking.id,
                        eventType: e.eventType,
                        eventDate: new Date(e.eventDate),
                        eventEndDate: e.eventEndDate ? new Date(e.eventEndDate) : null,
                        location: e.location,
                        photographerId: e.photographerId,
                        notes: e.notes
                    }))
                });
            }

            return tx.booking.findUnique({
                where: { id: newBooking.id },
                include: fullInclude
            });
        });
    },

    convertQuotationToBooking: async (quotationId, eventsPayload) => {
        const quotation = await prisma.transaction.findUnique({
            where: { id: Number(quotationId) },
            include: { transactionType: true }
        });

        if (!quotation) throw new Error("Quotation not found");
        if (quotation.transactionType?.name !== "SALE_QUOTATION") {
            throw new Error("Only SALE_QUOTATION can be converted to a booking");
        }

        return bookingService.createBookingWithEvents({
            customerId: quotation.partyId,
            quotationId: quotation.id,
            status: "TENTATIVE",
            events: eventsPayload
        });
    },

    getCalendarEvents: async (startDate, endDate) => {
        return prisma.bookingEvent.findMany({
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
    },

    updateBookingWithEvents: async (id, { customerId, status, notes, packageId, events }) => {
        return prisma.$transaction(async (tx) => {
            // 1. Conflict check (skipping current booking events)
            for (const event of events) {
                if (event.eventDate) {
                    const startOfDay = new Date(event.eventDate);
                    startOfDay.setUTCHours(0, 0, 0, 0);
                    const endOfDay = new Date(event.eventDate);
                    endOfDay.setUTCHours(23, 59, 59, 999);

                    const conflictingEvents = await tx.bookingEvent.findMany({
                        where: {
                            eventDate: { gte: startOfDay, lte: endOfDay },
                            bookingId: { not: id } // CRITICAL: Exclude self
                        },
                        include: { booking: true }
                    });

                    if (conflictingEvents.length > 0 && !event.overrideConflicts) {
                         throw new Error(`Conflict on ${startOfDay.toISOString().split('T')[0]}. Use override to force.`);
                    }
                }
            }

            // 2. Update Booking
            await tx.booking.update({
                where: { id },
                data: { customerId, status, notes, packageId }
            });

            // 3. Sync events (Delete & Create is cleanest for FormArray sync)
            await tx.bookingEvent.deleteMany({ where: { bookingId: id } });
            
            if (events && events.length > 0) {
                await tx.bookingEvent.createMany({
                    data: events.map(e => ({
                        bookingId: id,
                        eventType: e.eventType,
                        eventDate: new Date(e.eventDate),
                        location: e.location,
                        photographerId: e.photographerId ? Number(e.photographerId) : null,
                        notes: e.notes
                    }))
                });
            }

            return tx.booking.findUnique({
                where: { id },
                include: fullInclude
            });
        });
    }
}
