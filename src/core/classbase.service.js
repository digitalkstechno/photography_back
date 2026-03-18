// core/base.service.js

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

  async create(data, options = {}) {
    data = await this.beforeCreate(data)

    const result = await this.model.create({
      data,
      ...options
    })

    await this.afterCreate(result)

    return result
  }

  async findAll(where = {}, options = {}) {
    return this.model.findMany({
      where,
      ...options
    })
  }

  async findById(id, options = {}) {
    return this.model.findUnique({
      where: { id },
      ...options
    })
  }

  async update(id, data, options = {}) {
    data = await this.beforeUpdate(data)

    const result = await this.model.update({
      where: { id },
      data,
      ...options
    })

    await this.afterUpdate(result)

    return result
  }

  async remove(id) {
    await this.beforeDelete(id)

    const result = await this.model.delete({
      where: { id }
    })

    await this.afterDelete(result)

    return result
  }
}