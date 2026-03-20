import { teamService } from "../services/team.service.js";

class TeamController {
  // -------------------------------
  // CREATE TEAM MEMBER
  // -------------------------------
  async createTeamMember(req, res) {
    try {
      const member = await teamService.createTeamMember(req.body);

      return res.status(201).json({
        success: true,
        data: member,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  // -------------------------------
  // GET TEAM MEMBERS
  // -------------------------------
  async getTeamMembers(req, res) {
    try {
      const { status } = req.query;

      const members = await teamService.getTeamMembers({ status });

      return res.json({
        success: true,
        data: members,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  // -------------------------------
  // UPDATE TEAM MEMBER
  // -------------------------------
  async updateTeamMember(req, res) {
    try {
      const { id } = req.params;

      const updated = await teamService.updateTeamMember(id, req.body);

      return res.json({
        success: true,
        data: updated,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  // -------------------------------
  // DELETE TEAM MEMBER
  // -------------------------------
  async deleteTeamMember(req, res) {
    try {
      const { id } = req.params;

      await teamService.deleteTeamMember(id);

      return res.json({
        success: true,
        message: "Team member deleted",
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  // -------------------------------
  // GET AVAILABLE TEAM MEMBERS
  // -------------------------------
  async getAvailableTeam(req, res) {
    try {
      const { date } = req.query;

      if (!date) {
        return res.status(400).json({
          success: false,
          message: "Date is required",
        });
      }

      const members = await teamService.getAvailableTeamMembers(date);

      return res.json({
        success: true,
        data: members,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  // -------------------------------
  // ASSIGN TEAM TO EVENT
  // -------------------------------
  async assignTeam(req, res) {
    try {
      const { eventId, teamMemberIds } = req.body;

      if (!eventId || !teamMemberIds?.length) {
        return res.status(400).json({
          success: false,
          message: "eventId and teamMemberIds are required",
        });
      }

      const result = await teamService.assignTeam(
        eventId,
        teamMemberIds
      );

      return res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  // -------------------------------
  // GET ASSIGNED TEAM
  // -------------------------------
  async getAssignedTeam(req, res) {
    try {
      const { eventId } = req.params;

      const team = await teamService.getAssignedTeam(eventId);

      return res.json({
        success: true,
        data: team,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  // -------------------------------
  // REMOVE TEAM MEMBER FROM EVENT
  // -------------------------------
  async removeAssignment(req, res) {
    try {
      const { eventId, teamMemberId } = req.body;

      if (!eventId || !teamMemberId) {
        return res.status(400).json({
          success: false,
          message: "eventId and teamMemberId are required",
        });
      }

      await teamService.removeAssignment(eventId, teamMemberId);

      return res.json({
        success: true,
        message: "Assignment removed",
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }
}

export default new TeamController();