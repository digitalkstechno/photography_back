import { BaseService } from "../core/classbase.service.js";
import Assignment from "../schemas/assignment.model.js";

class AssignmentService extends BaseService {
  constructor() {
    super(Assignment);
  }

  // 🔥 CUSTOM METHODS ONLY

  async getByEventIds(eventIds) {
    return this.findAll({
      eventId: { $in: eventIds },
    });
  }

  async getWithTeam(eventId) {
    return this.findAll(
      { eventId },
      {
        populate: { path: "teamMemberId", select: "name role" },
      }
    );
  }

  async bulkCreate(data) {
    return this.model.insertMany(data);
  }

  async removeByEventAndMember(eventId, teamMemberId) {
    return this.model.findOneAndDelete({
      eventId,
      teamMemberId,
    });
  }
}

export default new AssignmentService();