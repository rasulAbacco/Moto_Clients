import serviceService from "../services/service.service.js";

/**
 * GET /api/services
 */
export const getMainServices = async (req, res, next) => {
  try {
    const data = await serviceService.getMainServices();
    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/services/:id
 */
export const getMainServiceById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const data = await serviceService.getMainServiceById(id);

    if (!data) {
      return res.status(404).json({ message: "Service not found" });
    }

    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};

export const getSubServiceById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const data = await serviceService.getSubServiceById(id);

    if (!data) {
      return res.status(404).json({ message: "Service not found" });
    }

    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};