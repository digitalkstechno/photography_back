export const createBaseService = (model) => {

  const create = async (data) => {
    return model.create({ data })
  }

  const findAll = async (where = {}) => {
    return model.findMany({ where })
  }

  const findById = async (id) => {
    return model.findUnique({
      where: { id }
    })
  }

  const update = async (id, data) => {
    return model.update({
      where: { id },
      data
    })
  }

  const remove = async (id) => {
    return model.delete({
      where: { id }
    })
  }

  return {
    create,
    findAll,
    findById,
    update,
    remove
  }
}