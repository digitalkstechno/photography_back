// core/classbase.service.js – Mongoose edition

export class BaseService {
  constructor(model) {
    this.model = model
  }

  async beforeCreate(data) { return data }
  async afterCreate(result) { }

  async beforeUpdate(data) { return data }
  async afterUpdate(result) { }

  async beforeDelete(id) { }
  async afterDelete(result) { }


  async create(data) {
    data = await this.beforeCreate(data)
    const result = await this.model.create(data)
    await this.afterCreate(result)
    return result
  }

  async findAll(filter = {}, options = {}) {
    let queryFilter = { ...filter }
    let queryOptions = { ...options }

    // 1. Pagination
    if (queryFilter.page || queryFilter.limit) {
      const page = Math.max(1, parseInt(queryFilter.page) || 1)
      const limit = Math.max(1, parseInt(queryFilter.limit) || 10)
      queryOptions.skip = (page - 1) * limit
      queryOptions.limit = limit
      delete queryFilter.page
      delete queryFilter.limit
    }

    // 2. Global Search (Uses this.searchFields defined in child service)
    if (queryFilter.search !== undefined) {
      if (queryFilter.search.trim() !== "" && this.searchFields && this.searchFields.length > 0) {
        const regex = new RegExp(queryFilter.search, 'i')
        const orConditions = this.searchFields.map(f => ({ [f]: regex }))
        queryFilter.$or = queryFilter.$or ? [...queryFilter.$or, ...orConditions] : orConditions
      }
      delete queryFilter.search
    }

    // 3. Sorting overrides
    if (queryFilter.sort) {
      queryOptions.sort = queryFilter.sort
      delete queryFilter.sort
    }

    let query = this.model.find(queryFilter)
    if (queryOptions.populate) query = query.populate(queryOptions.populate)
    if (queryOptions.sort) query = query.sort(queryOptions.sort)
    if (queryOptions.limit) query = query.limit(queryOptions.limit)
    if (queryOptions.skip) query = query.skip(queryOptions.skip)

    // Execute with parallel count for pagination metadata
    const [data, total] = await Promise.all([
      query.lean(),
      this.model.countDocuments(queryFilter)
    ])

    // If paginated request, return struct. Otherwise raw array for backward compat.
    if (queryOptions.limit) {
      return {
        data,
        total,
        page: queryOptions.skip / queryOptions.limit + 1,
        limit: queryOptions.limit
      }
    }

    return data
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