import { z } from "zod";

const INT4_MAX = 2147483647;

// Coerces "true"/"false"/"Yes"/"No"/boolean -> boolean, defaults to `def`
const boolish = (def = false) =>
  z
    .preprocess((val) => {
      if (typeof val === "boolean") return val;
      if (val === "Yes" || val === "true" || val === "1") return true;
      if (val === "No" || val === "false" || val === "0") return false;
      return val === undefined || val === "" ? def : val;
    }, z.boolean())
    .default(def);

// Safe integer: rejects/clamps anything outside Postgres INT4 range, coerces from string
const safeInt = ({ min, max, required = false } = {}) => {
  let schema = z.preprocess(
    (val) => {
      if (val === undefined || val === null || val === "")
        return required ? val : undefined;
      const num = Number(val);
      if (!Number.isFinite(num)) return NaN;
      return Math.trunc(num);
    },
    z
      .number({ invalid_type_error: "Must be a valid whole number" })
      .int("Must be a whole number")
      .refine((n) => n > -INT4_MAX && n < INT4_MAX, {
        message: `Value out of allowed range (max ${INT4_MAX.toLocaleString()})`,
      }),
  );

  if (min !== undefined)
    schema = schema.refine((n) => n >= min, {
      message: `Must be at least ${min}`,
    });
  if (max !== undefined)
    schema = schema.refine((n) => n <= max, {
      message: `Must be at most ${max}`,
    });

  return required ? schema : schema.optional().nullable();
};

// Safe float (mileage is Float in schema, but still worth bounding sensibly)
const safeFloat = ({ min, max, required = false } = {}) => {
  let schema = z.preprocess(
    (val) => {
      if (val === undefined || val === null || val === "")
        return required ? val : undefined;
      const num = Number(val);
      return Number.isFinite(num) ? num : NaN;
    },
    z.number({ invalid_type_error: "Must be a valid number" }),
  );

  if (min !== undefined)
    schema = schema.refine((n) => n >= min, {
      message: `Must be at least ${min}`,
    });
  if (max !== undefined)
    schema = schema.refine((n) => n <= max, {
      message: `Must be at most ${max}`,
    });

  return required ? schema : schema.optional().nullable();
};

const currentYear = new Date().getFullYear();

export const vehicleListingSchema = z.object({
  // ---- Basic Information ----
  title: z
    .string()
    .trim()
    .min(3, "Title must be at least 3 characters")
    .max(150),
  category: z.enum(
    [
      "Car",
      "Bike",
      "Scooter",
      "Truck",
      "Bus",
      "Auto",
      "Tractor",
      "Commercial Vehicle",
    ],
    { errorMap: () => ({ message: "Invalid vehicle category" }) },
  ),
  brand: z.string().trim().min(1, "Brand is required").max(80),
  model: z.string().trim().min(1, "Model is required").max(80),
  variant: z.string().trim().max(80).optional().nullable(),
  registrationNumber: z.string().trim().max(20).optional().nullable(),
  vin: z
    .string()
    .trim()
    .max(17, "VIN must be at most 17 characters")
    .optional()
    .nullable(),

  // ---- Pricing ----
  price: safeFloat({ min: 1, max: 1_000_000_000, required: true }),
  negotiable: boolish(false),
  emiAvailable: boolish(false),

  // ---- Vehicle Details ----
  manufacturingYear: safeInt({
    min: 1950,
    max: currentYear + 1,
    required: true,
  }),
  registrationYear: safeInt({ min: 1950, max: currentYear + 1 }),
  fuelType: z.enum(["Petrol", "Diesel", "CNG", "Electric", "Hybrid"], {
    errorMap: () => ({ message: "Invalid fuel type" }),
  }),
  transmission: z.enum(["Manual", "Automatic"], {
    errorMap: () => ({ message: "Invalid transmission type" }),
  }),
  kmDriven: safeInt({ min: 0, max: 2_000_000, required: true }),
  ownership: z.string().trim().max(30).optional().nullable(),
  color: z.string().trim().max(40).optional().nullable(),
  seatingCapacity: safeInt({ min: 1, max: 100 }),
  engineCapacity: safeInt({ min: 0, max: 20000 }), // CC — Int in schema
  mileage: safeFloat({ min: 0, max: 500 }), // km/l or km per charge — Float in schema

  // ---- Documents ----
  rcAvailable: boolish(true),
  insuranceAvailable: boolish(true),
  insuranceExpiry: z.preprocess(
    (val) => (val ? new Date(val) : undefined),
    z
      .date({ invalid_type_error: "Invalid insurance expiry date" })
      .optional()
      .nullable(),
  ),
  pollutionCertificate: boolish(true),
  serviceBook: boolish(true),
  numberOfKeys: safeInt({ min: 0, max: 10 }).default(2),
  loanPending: boolish(false),
  nocAvailable: boolish(true),

  // ---- Condition ----
  vehicleCondition: z
    .enum(["Excellent", "Good", "Fair", "Needs Repair"])
    .optional()
    .nullable(),
  accidentHistory: boolish(false),
  floodDamage: boolish(false),
  engineCondition: z
    .enum(["Excellent", "Good", "Fair", "Needs Repair"])
    .default("Good"),
  tyreCondition: z
    .enum(["Excellent", "Good", "Fair", "Needs Repair"])
    .default("Good"),
  batteryCondition: z
    .enum(["Excellent", "Good", "Fair", "Needs Repair"])
    .default("Good"),

  // ---- Features ----
  features: z.preprocess(
    (val) => (val === undefined ? [] : Array.isArray(val) ? val : [val]),
    z.array(z.string().trim().max(60)).max(40),
  ),

  // ---- Seller Info ----
  sellerName: z.string().trim().max(100).optional().nullable(),
  mobileNumber: z
    .string()
    .trim()
    .regex(/^[\d+\-\s]{7,15}$/, "Invalid mobile number")
    .optional()
    .nullable()
    .or(z.literal("")),
  email: z
    .string()
    .trim()
    .email("Invalid email address")
    .optional()
    .nullable()
    .or(z.literal("")),
  sellerType: z.enum(["Individual", "Dealer"]).default("Individual"),
  dealerName: z.string().trim().max(100).optional().nullable(),

  // ---- Location ----
  country: z.string().trim().max(60).default("India"),
  state: z.string().trim().max(60).optional().nullable(),
  city: z.string().trim().max(60).optional().nullable(),
  area: z.string().trim().max(100).optional().nullable(),
  pincode: z
    .string()
    .trim()
    .regex(/^\d{4,10}$/, "Invalid pincode")
    .optional()
    .nullable()
    .or(z.literal("")),

  description: z.string().trim().max(3000).optional().nullable(),
});

// Partial version for PATCH/PUT updates — every field optional, same coercion rules
export const vehicleListingUpdateSchema = vehicleListingSchema.partial();

// Normalizes empty-string optional fields to null so Prisma doesn't choke on ""
export const cleanForPrisma = (parsed) => {
  const out = { ...parsed };
  Object.keys(out).forEach((key) => {
    if (out[key] === "") out[key] = null;
    if (out[key] === undefined) delete out[key];
  });
  return out;
};
