import pkg from "pg";

const { Pool } = pkg;

// ✅ CRM DB (source of truth)
const db = new Pool({
  connectionString: process.env.MOTO_DB_URL,
});

export const getPackages = async (req, res) => {
  try {
    const { vehicleType } = req.query;

    // 🔥 MAIN QUERY (CRM TABLES)
    const result = await db.query(
      `
      SELECT 
        p.id,
        p.name,
        p.description,
        p.price,
        p."isActive",
        u."companyName" as "garageName",

        json_agg(
          json_build_object(
            'serviceName', pi."serviceName"
          )
        ) as services

      FROM "MarketplacePackage" p

      LEFT JOIN "User" u 
        ON u.id = p."userId"

      LEFT JOIN "MarketplacePackageItem" pi 
        ON pi."packageId" = p.id

      WHERE p."isActive" = true
      ${
        vehicleType
          ? `AND EXISTS (
              SELECT 1 FROM "MarketplacePackageItem" mpi
              JOIN "MarketplaceService" ms 
                ON ms.id = mpi."serviceId"
              WHERE mpi."packageId" = p.id
              AND ms."crmType" = $1
            )`
          : ""
      }

      GROUP BY p.id, u."companyName"

      ORDER BY p."createdAt" DESC
      `,
      vehicleType ? [vehicleType.toUpperCase()] : [],
    );

    res.json({
      success: true,
      count: result.rows.length,
      data: result.rows,
    });
  } catch (err) {
    console.error("GET PACKAGES ERROR:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch packages",
    });
  }
};
