import { bookingService } from "../services/booking.service.js"

export const getBookings = async (req, res, next) => {
    try {
        const data = await bookingService.findAll()
        res.json(data)
    } catch (err) {
        next(err)
    }
}

export const getBookingById = async (req, res, next) => {
    try {
        const data = await bookingService.findById(Number(req.params.id))
        if (!data) return res.status(404).json({ message: "Booking not found" })
        res.json(data)
    } catch (err) {
        next(err)
    }
}

export const createBooking = async (req, res, next) => {
    try {
        const { customerId, quotationId, packageId, status, notes, events } = req.body;
        
        // This accepts complex events tree
        const data = await bookingService.createBookingWithEvents({
             customerId: Number(customerId),
             quotationId: quotationId ? Number(quotationId) : null,
             packageId: packageId ? Number(packageId) : null,
             status,
             notes,
             events: events || []
        });

        res.status(201).json(data)
    } catch (err) {
        // Handle double booking custom error
        if (err.message.includes("Conflict on")) {
            return res.status(409).json({ message: err.message, conflict: true });
        }
        next(err)
    }
}

export const convertQuotationToBooking = async (req, res, next) => {
    try {
        const quotationId = Number(req.params.quotationId)
        const eventsPayload = req.body.events || [];
        const data = await bookingService.convertQuotationToBooking(quotationId, eventsPayload)
        res.status(201).json(data)
    } catch (err) {
        if (err.message.includes("Conflict on")) {
             return res.status(409).json({ message: err.message, conflict: true });
        }
        next(err)
    }
}

export const updateBookingStatus = async (req, res, next) => {
    try {
        const data = await bookingService.update(
            Number(req.params.id),
            { status: req.body.status }
        )
        res.json(data)
    } catch (err) {
        next(err)
    }
}

export const updateBooking = async (req, res, next) => {
    try {
        const id = Number(req.params.id);
        const { customerId, status, notes, packageId, events } = req.body;
        const data = await bookingService.updateBookingWithEvents(id, {
            customerId: Number(customerId),
            status,
            notes,
            packageId: packageId ? Number(packageId) : null,
            events: events || []
        });
        res.json(data);
    } catch (err) {
        if (err.message.includes("Conflict on")) {
            return res.status(409).json({ message: err.message, conflict: true });
        }
        next(err);
    }
}

export const getCalendarEvents = async (req, res, next) => {
    try {
        const { start, end } = req.query;
        if (!start || !end) {
             return res.status(400).json({ message: "start and end query parameters are required." })
        }
        const data = await bookingService.getCalendarEvents(start, end)
        res.json(data)
    } catch (err) {
        next(err)
    }
}

export const deleteBooking = async (req, res, next) => {
    try {
        await bookingService.remove(Number(req.params.id))
        res.json({ success: true })
    } catch (err) {
        next(err)
    }
}
