import { BaseService } from "../core/classbase.service.js";
import Equipment from "../schemas/equipment.schema.js";
import { assignmentService } from "./assignment.service.js";
import { eventService } from "./event.service.js";

class EquipmentService extends BaseService {
  constructor() {
    super(Equipment);
  }

  // -----------------------------------
  // FIND ALL (SORTED)
  // -----------------------------------
  async findAll(filter = {}) {
    return super.findAll(filter, {
      sort: { name: 1 },
    });
  }

  // -----------------------------------
  // GET ACTIVE EQUIPMENT
  // -----------------------------------
  async getActive() {
    return this.findAll({ status: "ACTIVE" });
  }

  // -----------------------------------
  // VALIDATE BEFORE CREATE
  // -----------------------------------
  async beforeCreate(data) {
    data.status = data.status || "ACTIVE";
    return data;
  }

  // -----------------------------------
  // CHECK AVAILABILITY (IMPORTANT)
  // -----------------------------------
  async getAvailableEquipment(date) {
    // 1. Get events on date
    const events = await eventService.getByDate(date);
    const eventIds = events.map((e) => e._id);

    // 2. Get assignments (reuse assignment logic if you unify later)
    const assignments = await assignmentService.getByEventIds(eventIds);

    // ⚠️ Assuming assignment stores equipment (future-safe)
    const busyIds = assignments
      .flatMap((a) => a.equipmentIds || [])
      .map((id) => id.toString());

    // 3. Get all equipment
    const all = await this.getActive();

    // 4. Filter available
    return all.filter(
      (e) => !busyIds.includes(e._id.toString())
    );
  }

  // -----------------------------------
  // SAFE DELETE (PREVENT USAGE DELETE)
  // -----------------------------------
  async remove(id) {
    // Optional future safety: block delete if in use
    // const isUsed = await assignmentService.isEquipmentUsed(id)
    // if (isUsed) throw new Error("Equipment is in use")

    return super.remove(id);
  }
}

export const equipmentService = new EquipmentService();