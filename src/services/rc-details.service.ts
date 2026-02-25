import mysql from "mysql2/promise";
import { env } from "../config/env.js";
import type { RCData, RCApiResponse } from "../types/types/auth.types.js";

export interface RCDetailsEntry {
  rc_number: string;
  fit_up_to: Date | null;
  registration_date: Date | null;
  owner_name: string | null;
  father_name: string | null;
  present_address: string | null;
  permanent_address: string | null;
  mobile_number: string | null;
  vehicle_category: string | null;
  vehicle_chasi_number: string | null;
  vehicle_engine_number: string | null;
  maker_description: string | null;
  maker_model: string | null;
  body_type: string | null;
  fuel_type: string | null;
  color: string | null;
  norms_type: string | null;
  financer: string | null;
  financed: number | null;
  insurance_company: string | null;
  insurance_policy_number: string | null;
  insurance_upto: Date | null;
  manufacturing_date: string | null;
  manufacturing_date_formatted: Date | null;
  registered_at: string | null;
  latest_by: Date | null;
  less_info: number | null;
  tax_upto: Date | null;
  tax_paid_upto: Date | null;
  cubic_capacity: number | null;
  vehicle_gross_weight: number | null;
  no_cylinders: number | null;
  seat_capacity: number | null;
  sleeper_capacity: number | null;
  standing_capacity: number | null;
  wheelbase: number | null;
  unladen_weight: number | null;
  vehicle_category_description: string | null;
  pucc_number: string | null;
  pucc_upto: Date | null;
  permit_number: string | null;
  permit_issue_date: Date | null;
  permit_valid_from: Date | null;
  permit_valid_upto: Date | null;
  permit_type: string | null;
  national_permit_number: string | null;
  national_permit_issue_date: Date | null;
  national_permit_upto: Date | null;
  national_permit_issued_by: string | null;
  non_use_status: string | null;
  non_use_from: Date | null;
  non_use_to: Date | null;
  blacklist_status: string | null;
  noc_details: string | null;
  owner_number: number | null;
  rc_status: string | null;
  masked_name: boolean | null;
  challan_details: unknown | null;
  variant: string | null;
  created_at: Date;
  updated_at: Date;
}

const dbConfig = {
  host: env.DB_HOST || "72.62.228.184",
  user: env.DB_USER || "u914664103_rto",
  password: env.DB_PASSWORD || "6@t9W*GCRA",
  database: env.DB_NAME || "u914664103_rto",
  charset: "utf8mb4",
};

const TABLE_NAME = env.RC_DB_TABLE || "rc_details";

// Fallback in-memory storage for testing
const fallbackStorage: Map<string, RCDetailsEntry> = new Map();

async function getConnection() {
  try {
    return await mysql.createConnection(dbConfig);
  } catch (error) {
    console.warn("Database connection failed, using fallback storage:", error);
    return null; // Return null to indicate fallback mode
  }
}

export class RCDetailsService {
  /**
   * Convert string date to Date object or null
   */
  private parseDate(dateString: string | null): Date | null {
    if (
      !dateString ||
      dateString === "" ||
      dateString === "N/A" ||
      dateString === "null"
    ) {
      return null;
    }
    try {
      const date = new Date(dateString);
      // Check if the date is valid (not Invalid Date)
      if (!isNaN(date.getTime())) {
        return date;
      }
      return null;
    } catch {
      return null;
    }
  }

  /**
   * Parse manufacturing date from "MM/YYYY" format to first day of month
   */
  private parseManufacturingDate(dateString: string | null): {
    raw: string | null;
    formatted: Date | null;
  } {
    if (
      !dateString ||
      dateString === "" ||
      dateString === "N/A" ||
      dateString === "null"
    ) {
      return { raw: null, formatted: null };
    }

    try {
      // Handle "MM/YYYY" format
      if (dateString.includes("/")) {
        const [month, year] = dateString.split("/");
        if (month && year) {
          const formattedDate = new Date(
            parseInt(year),
            parseInt(month) - 1,
            1,
          );
          // Check if the date is valid
          if (!isNaN(formattedDate.getTime())) {
            return { raw: dateString, formatted: formattedDate };
          }
        }
      }
      return { raw: dateString, formatted: null };
    } catch {
      return { raw: dateString, formatted: null };
    }
  }

  /**
   * Convert API response to database format
   */
  private convertApiDataToDbFormat(
    apiData: RCData,
  ): Omit<RCDetailsEntry, "created_at" | "updated_at"> {
    const manufacturingDates = this.parseManufacturingDate(
      apiData.manufacturing_date,
    );

    return {
      rc_number: apiData.rc_number,
      fit_up_to: this.parseDate(apiData.fit_up_to),
      registration_date: this.parseDate(apiData.registration_date),
      owner_name: apiData.owner_name || null,
      father_name: apiData.father_name || null,
      present_address: apiData.present_address || null,
      permanent_address: apiData.permanent_address || null,
      mobile_number: apiData.mobile_number || null,
      vehicle_category: apiData.vehicle_category || null,
      vehicle_chasi_number: apiData.vehicle_chasi_number || null,
      vehicle_engine_number: apiData.vehicle_engine_number || null,
      maker_description: apiData.maker_description || null,
      maker_model: apiData.maker_model || null,
      body_type: apiData.body_type || null,
      fuel_type: apiData.fuel_type || null,
      color: apiData.color || null,
      norms_type: apiData.norms_type || null,
      financer: apiData.financer || null,
      financed:
        apiData.financed === "1" || apiData.financed === "true"
          ? 1
          : apiData.financed === "0" || apiData.financed === "false"
            ? 0
            : null,
      insurance_company: apiData.insurance_company || null,
      insurance_policy_number: apiData.insurance_policy_number || null,
      insurance_upto: this.parseDate(apiData.insurance_upto),
      manufacturing_date: manufacturingDates.raw,
      manufacturing_date_formatted: manufacturingDates.formatted,
      registered_at: apiData.registered_at || null,
      latest_by: this.parseDate(apiData.latest_by),
      less_info:
        apiData.less_info === true ? 1 : apiData.less_info === false ? 0 : null,
      tax_upto: this.parseDate(apiData.tax_upto),
      tax_paid_upto: this.parseDate(apiData.tax_paid_upto),
      cubic_capacity: apiData.cubic_capacity
        ? parseFloat(apiData.cubic_capacity)
        : null,
      vehicle_gross_weight: apiData.vehicle_gross_weight
        ? parseInt(apiData.vehicle_gross_weight)
        : null,
      no_cylinders: apiData.no_cylinders
        ? parseInt(apiData.no_cylinders)
        : null,
      seat_capacity: apiData.seat_capacity
        ? parseInt(apiData.seat_capacity)
        : null,
      sleeper_capacity: apiData.sleeper_capacity
        ? parseInt(apiData.sleeper_capacity)
        : null,
      standing_capacity: apiData.standing_capacity
        ? parseInt(apiData.standing_capacity)
        : null,
      wheelbase: apiData.wheelbase ? parseInt(apiData.wheelbase) : null,
      unladen_weight: apiData.unladen_weight
        ? parseInt(apiData.unladen_weight)
        : null,
      vehicle_category_description:
        apiData.vehicle_category_description || null,
      pucc_number: apiData.pucc_number || null,
      pucc_upto: this.parseDate(apiData.pucc_upto),
      permit_number: apiData.permit_number || null,
      permit_issue_date: this.parseDate(apiData.permit_issue_date),
      permit_valid_from: this.parseDate(apiData.permit_valid_from),
      permit_valid_upto: this.parseDate(apiData.permit_valid_upto),
      permit_type: apiData.permit_type || null,
      national_permit_number: apiData.national_permit_number || null,
      national_permit_issue_date: this.parseDate(
        apiData.national_permit_issue_date,
      ),
      national_permit_upto: this.parseDate(apiData.national_permit_upto),
      national_permit_issued_by: apiData.national_permit_issued_by || null,
      non_use_status: apiData.non_use_status || null,
      non_use_from: this.parseDate(apiData.non_use_from),
      non_use_to: this.parseDate(apiData.non_use_to),
      blacklist_status: apiData.blacklist_status || null,
      noc_details: apiData.noc_details || null,
      owner_number: apiData.owner_number
        ? parseInt(apiData.owner_number)
        : null,
      rc_status: apiData.rc_status || null,
      masked_name: apiData.masked_name || null,
      challan_details: apiData.challan_details || null,
      variant: apiData.variant || null,
    };
  }

  /**
   * Convert database format back to API response format
   */
  private convertDbFormatToApiData(dbData: RCDetailsEntry): RCData {
    return {
      rc_number: dbData.rc_number,
      fit_up_to: dbData.fit_up_to?.toISOString().split("T")[0] ?? "",
      registration_date:
        dbData.registration_date?.toISOString().split("T")[0] ?? "",
      owner_name: dbData.owner_name || "",
      father_name: dbData.father_name || "",
      present_address: dbData.present_address || "",
      permanent_address: dbData.permanent_address || "",
      mobile_number: dbData.mobile_number || "",
      vehicle_category: dbData.vehicle_category || "",
      vehicle_chasi_number: dbData.vehicle_chasi_number || "",
      vehicle_engine_number: dbData.vehicle_engine_number || "",
      maker_description: dbData.maker_description || "",
      maker_model: dbData.maker_model || "",
      body_type: dbData.body_type || "",
      fuel_type: dbData.fuel_type || "",
      color: dbData.color || "",
      norms_type: dbData.norms_type || "",
      financer: dbData.financer || "",
      financed:
        dbData.financed === 1 ? "true" : dbData.financed === 0 ? "false" : "",
      insurance_company: dbData.insurance_company || "",
      insurance_policy_number: dbData.insurance_policy_number || "",
      insurance_upto: dbData.insurance_upto?.toISOString().split("T")[0] ?? "",
      manufacturing_date: dbData.manufacturing_date || "",
      manufacturing_date_formatted:
        dbData.manufacturing_date_formatted?.toISOString().split("T")[0] ?? "",
      registered_at: dbData.registered_at || "",
      latest_by: dbData.latest_by?.toISOString().split("T")[0] ?? "",
      less_info:
        dbData.less_info === 1 ? true : dbData.less_info === 0 ? false : false,
      tax_upto: dbData.tax_upto?.toISOString().split("T")[0] ?? "",
      tax_paid_upto: dbData.tax_paid_upto?.toISOString().split("T")[0] ?? "",
      cubic_capacity: dbData.cubic_capacity?.toString() || "",
      vehicle_gross_weight: dbData.vehicle_gross_weight?.toString() || "",
      no_cylinders: dbData.no_cylinders?.toString() || "",
      seat_capacity: dbData.seat_capacity?.toString() || "",
      sleeper_capacity: dbData.sleeper_capacity?.toString() || "",
      standing_capacity: dbData.standing_capacity?.toString() || "",
      wheelbase: dbData.wheelbase?.toString() || "",
      unladen_weight: dbData.unladen_weight?.toString() || "",
      vehicle_category_description: dbData.vehicle_category_description || "",
      pucc_number: dbData.pucc_number || "",
      pucc_upto: dbData.pucc_upto?.toISOString().split("T")[0] ?? "",
      permit_number: dbData.permit_number || "",
      permit_issue_date:
        dbData.permit_issue_date?.toISOString().split("T")[0] ?? "",
      permit_valid_from:
        dbData.permit_valid_from?.toISOString().split("T")[0] ?? "",
      permit_valid_upto:
        dbData.permit_valid_upto?.toISOString().split("T")[0] ?? "",
      permit_type: dbData.permit_type || "",
      national_permit_number: dbData.national_permit_number || "",
      national_permit_issue_date:
        dbData.national_permit_issue_date?.toISOString().split("T")[0] ?? "",
      national_permit_upto:
        dbData.national_permit_upto?.toISOString().split("T")[0] ?? "",
      national_permit_issued_by: dbData.national_permit_issued_by || "",
      non_use_status: dbData.non_use_status || "",
      non_use_from: dbData.non_use_from?.toISOString().split("T")[0] ?? "",
      non_use_to: dbData.non_use_to?.toISOString().split("T")[0] ?? "",
      blacklist_status: dbData.blacklist_status || "",
      noc_details: dbData.noc_details || "",
      owner_number: dbData.owner_number?.toString() || "",
      rc_status: dbData.rc_status || "",
      masked_name: dbData.masked_name || false,
      challan_details: dbData.challan_details,
      variant: dbData.variant || "",
    };
  }

  /**
   * Get RC details from cache (database or fallback)
   */
  async getRCDetails(rcNumber: string): Promise<RCApiResponse | null> {
    const connection = await getConnection();

    try {
      if (!connection) {
        // Fallback mode - check in-memory storage
        console.log("Fallback: Getting RC details from memory");
        const cachedData = fallbackStorage.get(rcNumber);
        if (cachedData) {
          return {
            reference_id: 0,
            statuscode: 200,
            message: "RC details retrieved from cache",
            status: true,
            data: this.convertDbFormatToApiData(cachedData),
          };
        }
        return null;
      }

      // Database mode
      const [rows] = (await connection.execute(
        `SELECT * FROM ${TABLE_NAME} WHERE rc_number = ?`,
        [rcNumber],
      )) as [RCDetailsEntry[], mysql.FieldPacket[]];

      if (rows.length > 0 && rows[0]) {
        console.log("RC details retrieved from database cache");
        return {
          reference_id: 0,
          statuscode: 200,
          message: "RC details retrieved from cache",
          status: true,
          data: this.convertDbFormatToApiData(rows[0]),
        };
      }

      return null;
    } finally {
      if (connection) {
        await connection.end();
      }
    }
  }

  /**
   * Save RC details to cache (database or fallback)
   */
  async saveRCDetails(apiResponse: RCApiResponse): Promise<void> {
    const connection = await getConnection();

    try {
      const dbData = this.convertApiDataToDbFormat(apiResponse.data);

      if (!connection) {
        // Fallback mode - save to in-memory storage
        console.log("Fallback: Saving RC details to memory");
        const entry: RCDetailsEntry = {
          ...dbData,
          created_at: new Date(),
          updated_at: new Date(),
        };
        fallbackStorage.set(apiResponse.data.rc_number, entry);
        return;
      }

      // Database mode - use INSERT ... ON DUPLICATE KEY UPDATE
      const columns = Object.keys(dbData).filter(
        (key) => key !== "created_at" && key !== "updated_at",
      );
      const values = columns.map((col) => dbData[col as keyof typeof dbData]);
      const placeholders = columns.map(() => "?").join(", ");
      const updateClauses = columns
        .map((col) => `${col} = VALUES(${col})`)
        .join(", ");

      await connection.execute(
        `INSERT INTO ${TABLE_NAME} (${columns.join(", ")}, created_at, updated_at) 
         VALUES (${placeholders}, NOW(), NOW()) 
         ON DUPLICATE KEY UPDATE ${updateClauses}, updated_at = NOW()`,
        values as any[],
      );

      console.log("RC details saved to database cache");
    } finally {
      if (connection) {
        await connection.end();
      }
    }
  }

  /**
   * Check if RC details exist in cache
   */
  async existsInCache(rcNumber: string): Promise<boolean> {
    const connection = await getConnection();

    try {
      if (!connection) {
        return fallbackStorage.has(rcNumber);
      }

      const [rows] = (await connection.execute(
        `SELECT 1 FROM ${TABLE_NAME} WHERE rc_number = ? LIMIT 1`,
        [rcNumber],
      )) as [unknown[], mysql.FieldPacket[]];

      return rows.length > 0;
    } finally {
      if (connection) {
        await connection.end();
      }
    }
  }

  /**
   * Delete RC details from cache
   */
  async deleteRCDetails(rcNumber: string): Promise<void> {
    const connection = await getConnection();

    try {
      if (!connection) {
        fallbackStorage.delete(rcNumber);
        return;
      }

      await connection.execute(
        `DELETE FROM ${TABLE_NAME} WHERE rc_number = ?`,
        [rcNumber],
      );

      console.log("RC details deleted from cache");
    } finally {
      if (connection) {
        await connection.end();
      }
    }
  }

  /**
   * Get cache statistics
   */
  async getCacheStats(): Promise<{
    totalRecords: number;
    lastUpdated: Date | null;
  }> {
    const connection = await getConnection();

    try {
      if (!connection) {
        const entries = Array.from(fallbackStorage.values());
        return {
          totalRecords: entries.length,
          lastUpdated:
            entries.length > 0
              ? new Date(
                  Math.max(...entries.map((e) => e.updated_at.getTime())),
                )
              : null,
        };
      }

      const [rows] = (await connection.execute(
        `SELECT COUNT(*) as count, MAX(updated_at) as last_updated FROM ${TABLE_NAME}`,
      )) as [
        { count: number; last_updated: Date | null }[],
        mysql.FieldPacket[],
      ];

      return {
        totalRecords: rows[0]?.count || 0,
        lastUpdated: rows[0]?.last_updated || null,
      };
    } finally {
      if (connection) {
        await connection.end();
      }
    }
  }
}
