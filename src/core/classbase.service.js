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

  async findAll(filter, options) {
    let queryFilter = { ...filter };
    let queryOptions = { ...options };

    // -------------------------
    // 1. Pagination
    // -------------------------
    if (queryFilter.page || queryFilter.limit) {
      const page = Math.max(1, parseInt(queryFilter.page) || 1);
      const limit = Math.max(1, parseInt(queryFilter.limit) || 10);

      queryOptions.skip = (page - 1) * limit;
      queryOptions.limit = limit;
    }

    // -------------------------
    // 2. Search (safe)
    // -------------------------
    if (queryFilter.search !== undefined) {
      const search = queryFilter.search?.trim();

      if (search && this.searchFields?.length) {
        const escapeRegex = (text) =>
          text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

        const regex = new RegExp(escapeRegex(search), 'i');

        queryFilter.$or = this.searchFields.map((field) => ({
          [field]: regex
        }));
      }
    }

    // -------------------------
    // 3. Sorting
    // -------------------------
    if (queryFilter.sort) {
      queryOptions.sort = queryFilter.sort;
    }

    if (queryFilter.sortBy) {
      const order = queryFilter.sortOrder === 'desc' ? -1 : 1;
      queryOptions.sort = { [queryFilter.sortBy]: order };
    }

    // -------------------------
    // 4. REMOVE CONTROL FIELDS ❗ (CRITICAL FIX)
    // -------------------------
    const CONTROL_FIELDS = [
      'page',
      'limit',
      'search',
      'sort',
      'sortBy',
      'sortOrder'
    ];

    CONTROL_FIELDS.forEach(field => delete queryFilter[field]);

    // FINAL FILTER
    const finalFilter = { ...queryFilter };

    // -------------------------
    // 🔥 DEBUG (remove later)
    // -------------------------
    console.log('FINAL FILTER:', JSON.stringify(finalFilter, null, 2));
    console.log('OPTIONS:', queryOptions);

    // -------------------------
    // 5. Build Query
    // -------------------------
    let query = this.model.find(finalFilter);

    if (queryOptions.populate) query = query.populate(queryOptions.populate);
    if (queryOptions.sort) query = query.sort(queryOptions.sort);
    if (queryOptions.skip !== undefined) query = query.skip(queryOptions.skip);
    if (queryOptions.limit !== undefined) query = query.limit(queryOptions.limit);

    // -------------------------
    // 🔥 DEBUG CHECK
    // -------------------------
    const debugData = await this.model.find(finalFilter).lean();
    console.log('DEBUG DATA COUNT:', debugData.length);

    // -------------------------
    // 6. Execute
    // -------------------------
    const [data, total] = await Promise.all([
      query.lean(),
      this.model.countDocuments(finalFilter)
    ]);

    console.log('FINAL DATA COUNT:', data.length);
    console.log('TOTAL COUNT:', total);

    // -------------------------
    // 7. Response
    // -------------------------
    if (queryOptions.limit !== undefined) {
      const page =
        Math.floor((queryOptions.skip || 0) / queryOptions.limit) + 1;

      return {
        data,
        total,
        page,
        limit: queryOptions.limit
      };
    }

    return data;
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