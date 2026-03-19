// core/classbase.service.js – Mongoose edition

export class BaseService {
  constructor(model) {
    this.model = model
  }

  // 🔥 HOOKS (override in child)
  async beforeCreate(data) { return data }
  async afterCreate(result) {}

  async beforeUpdate(data) { return data }
  async afterUpdate(result) {}

  async beforeDelete(id) {}
  async afterDelete(result) {}

  // =========================

  async create(data) {
    data = await this.beforeCreate(data)
    const result = await this.model.create(data)
    await this.afterCreate(result)
    return result
  }

  async findAll(filter = {}, options = {}) {
    let query = this.model.find(filter)
    if (options.populate) query = query.populate(options.populate)
    if (options.sort) query = query.sort(options.sort)
    if (options.limit) query = query.limit(options.limit)
    if (options.skip) query = query.skip(options.skip)
    return query.lean()
  }

  async findById(id, options = {}) {
    let query = this.model.findById(id)
    if (options.populate) query = query.populate(options.populate)
    return query.lean()
  }

  async update(id, data) {
    data = await this.beforeUpdate(data)
    const result = await this.model.findByIdAndUpdate(id, data, { new: true, runValidators: true }).lean()
    if (!result) throw Object.assign(new Error("Document not found"), { status: 404 })
    await this.afterUpdate(result)
    return result
  }

  async remove(id) {
    await this.beforeDelete(id)
    const result = await this.model.findByIdAndDelete(id).lean()
    if (!result) throw Object.assign(new Error("Document not found"), { status: 404 })
    await this.afterDelete(result)
    return result
  }

  async count(filter = {}) {
    return this.model.countDocuments(filter)
  }
}