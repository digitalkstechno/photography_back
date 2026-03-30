import Event from "../schemas/event.schema.js"

class CalendarService {

  async getEventsByRange(startDate, endDate, search = "") {
    const query = {
      status: { $ne: "CANCELLED" },
      $or: [
        { startDate: { $gte: new Date(startDate), $lte: new Date(endDate) } },
        { endDate: { $gte: new Date(startDate), $lte: new Date(endDate) } },
        { startDate: { $lte: new Date(startDate) }, endDate: { $gte: new Date(endDate) } }
      ]
    };

    if (search) {
      query.title = { $regex: search, $options: "i" };
    }

    return Event.find(query)
      .populate("customer", "name phone")
      .populate("package", "name")
      .sort({ startDate: 1 })
      .lean()
  }

  async getBookedDates(startDate, endDate) {
    const events = await Event.find({
      status: { $ne: "CANCELLED" },
      startDate: { $lte: new Date(endDate) },
      endDate: { $gte: new Date(startDate) }
    }).lean()

    const bookedDates = new Set()

    events.forEach(event => {
      const current = new Date(Math.max(event.startDate, new Date(startDate)))
      const end = new Date(Math.min(event.endDate, new Date(endDate)))

      while (current <= end) {
        bookedDates.add(current.toISOString().split("T")[0])
        current.setDate(current.getDate() + 1)
      }
    })

    // Build full date range and mark availability
    const allDates = []
    const cursor = new Date(startDate)
    const rangeEnd = new Date(endDate)

    while (cursor <= rangeEnd) {
      const dateStr = cursor.toISOString().split("T")[0]
      allDates.push({
        date: dateStr,
        booked: bookedDates.has(dateStr)
      })
      cursor.setDate(cursor.getDate() + 1)
    }

    return allDates
  }

  async checkAvailability(startDate, endDate) {
    const conflicts = await Event.find({
      status: { $ne: "CANCELLED" },
      startDate: { $lte: new Date(endDate) },
      endDate: { $gte: new Date(startDate) }
    }).populate("customer", "name").lean()

    return {
      available: conflicts.length === 0,
      conflicts
    }
  }
}

export const calendarService = new CalendarService()
