// auth.controller.js
import prisma from "../config/db.js";

// ─────────────────────────────────────────────
// GET /me  — full profile with address + vehicles
// ─────────────────────────────────────────────
export const getProfile = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        vehicles: true,
        address: true,
      },
    });

    if (!user) return res.status(404).json({ message: "User not found" });

    // Shape the response to match what the frontend expects
    const { address, ...rest } = user;
    res.json({
      success: true,
      data: {
        ...rest,
        address: address ?? {},
      },
    });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────
// PUT /me  — update all editable profile fields
// Body: { name, email, dob, company, taxNumber, registrationNumber, address: { street, city, state, postalCode, country } }
// ─────────────────────────────────────────────
export const updateProfile = async (req, res, next) => {
  try {
    const {
      name,
      email,
      dob,
      company,
      taxNumber,
      registrationNumber,
      address,
    } = req.body;

    // Build user update payload (only include defined fields)
    const userUpdateData = {};
    if (name !== undefined) userUpdateData.name = name;
    if (email !== undefined) userUpdateData.email = email;
    if (dob !== undefined) userUpdateData.dob = dob;
    if (company !== undefined) userUpdateData.company = company;
    if (taxNumber !== undefined) userUpdateData.taxNumber = taxNumber;
    if (registrationNumber !== undefined)
      userUpdateData.registrationNumber = registrationNumber;

    // Upsert address if provided
    if (address) {
      const { street, city, state, postalCode, country } = address;

      await prisma.userAddress.upsert({
        where: { userId: req.user.id },
        update: { street, city, state, postalCode, country },
        create: {
          userId: req.user.id,
          street,
          city,
          state,
          postalCode,
          country,
        },
      });
    }

    const updated = await prisma.user.update({
      where: { id: req.user.id },
      data: userUpdateData,
      include: {
        vehicles: true,
        address: true,
      },
    });

    const { address: addr, ...rest } = updated;
    res.json({
      success: true,
      data: {
        ...rest,
        address: addr ?? {},
      },
    });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────
// POST /vehicles  — add a vehicle
// ─────────────────────────────────────────────
export const addVehicle = async (req, res, next) => {
  try {
    const { registration, company, model } = req.body;

    const vehicle = await prisma.vehicle.create({
      data: {
        registration,
        company,
        model,
        userId: req.user.id,
      },
    });

    res.status(201).json({ success: true, data: vehicle });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────
// GET /vehicles  — list user's vehicles
// ─────────────────────────────────────────────
export const getVehicles = async (req, res, next) => {
  try {
    const vehicles = await prisma.vehicle.findMany({
      where: { userId: req.user.id },
    });

    res.json({ success: true, data: vehicles });
  } catch (err) {
    next(err);
  }
};
