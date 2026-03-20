import express from "express";
import teamController from "../controllers/teammanagmen.controller.js";

const router = express.Router();


// -------------------------------
// TEAM MEMBER ROUTES
// -------------------------------

// Create team member
router.post("/team", teamController.createTeamMember);

// Get all team members (optional ?status=ACTIVE)
router.get("/team", teamController.getTeamMembers);

// Update team member
router.put("/team/:id", teamController.updateTeamMember);

// Delete team member
router.delete("/team/:id", teamController.deleteTeamMember);


// -------------------------------
// AVAILABILITY
// -------------------------------

// Get available team by date
// Example: /team/available?date=2026-03-25
router.get("/team/available", teamController.getAvailableTeam);


// -------------------------------
// TEAM ASSIGNMENT
// -------------------------------

// Assign team to event
router.post("/team/assign", teamController.assignTeam);

// Get assigned team for event
router.get("/team/assigned/:eventId", teamController.getAssignedTeam);

// Remove team member from event
router.post("/team/remove", teamController.removeAssignment);


export default router;