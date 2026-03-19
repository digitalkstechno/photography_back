export const createBaseService = (model) => {

  const create = async (data) => {
    return model.create(data)
  }

  const findAll = async (filter = {}) => {
    return model.find(filter).lean()
  }

  const findById = async (id) => {
    return model.findById(id).lean()
  }

  const update = async (id, data) => {
    return model.findByIdAndUpdate(id, data, { new: true, runValidators: true }).lean()
  }

  const remove = async (id) => {
    return model.findByIdAndDelete(id).lean()
  }

  return {
    create,
    findAll,
    findById,
    update,
    remove
  }
}