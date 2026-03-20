import { BaseService } from "../core/classbase.service.js";
import TeamMember from "../schemas/teamMember.model.js";

class TeamMemberService extends BaseService {
  constructor() {
    super(TeamMember);
  }

  // 🔥 ONLY CUSTOM METHODS

  async getActiveMembers() {
    return this.findAll({ status: "ACTIVE" });
  }

  async getByIds(ids) {
    return this.model.find({
      _id: { $in: ids },
      status: "ACTIVE",
    }).lean();
  }
}

export const teamService = new TeamMemberService();