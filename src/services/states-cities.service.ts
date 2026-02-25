import mysql from "mysql2/promise";
import { env } from "../config/env.js";

export interface State {
  state_name: string;
  iso_code: string;
}

export interface City {
  city_name: string;
}

const dbConfig = {
  host: env.DB_HOST || "72.62.228.184",
  user: env.DB_USER || "u914664103_rto",
  password: env.DB_PASSWORD || "6@t9W*GCRA",
  database: env.DB_NAME || "u914664103_rto",
  charset: "utf8mb4",
};

const STATES_CITIES_TABLE = "states_cities";

async function getConnection() {
  try {
    return await mysql.createConnection(dbConfig);
  } catch (error) {
    console.warn("Database connection failed for states-cities:", error);
    return null;
  }
}

export class StatesCitiesService {
  /**
   * Get all distinct states with their ISO codes
   */
  async getStates(): Promise<State[]> {
    const connection = await getConnection();

    try {
      if (!connection) {
        console.warn("No database connection available for states");
        return [];
      }

      const [rows] = (await connection.execute(
        `SELECT DISTINCT state_name, iso_code FROM ${STATES_CITIES_TABLE} ORDER BY state_name`,
      )) as [State[], mysql.FieldPacket[]];

      return rows;
    } catch (error) {
      console.error("Error fetching states:", error);
      return [];
    } finally {
      if (connection) {
        await connection.end();
      }
    }
  }

  /**
   * Get all cities for a given state ISO code
   */
  async getCitiesByState(isoCode: string): Promise<City[]> {
    const connection = await getConnection();

    try {
      if (!connection) {
        console.warn("No database connection available for cities");
        return [];
      }

      if (!isoCode) {
        return [];
      }

      const [rows] = (await connection.execute(
        `SELECT city_name FROM ${STATES_CITIES_TABLE} WHERE iso_code = ? ORDER BY city_name`,
        [isoCode],
      )) as [City[], mysql.FieldPacket[]];

      return rows;
    } catch (error) {
      console.error("Error fetching cities for state:", isoCode, error);
      return [];
    } finally {
      if (connection) {
        await connection.end();
      }
    }
  }

  /**
   * Check if a state exists by ISO code
   */
  async stateExists(isoCode: string): Promise<boolean> {
    const connection = await getConnection();

    try {
      if (!connection) {
        return false;
      }

      const [rows] = (await connection.execute(
        `SELECT 1 FROM ${STATES_CITIES_TABLE} WHERE iso_code = ? LIMIT 1`,
        [isoCode],
      )) as [unknown[], mysql.FieldPacket[]];

      return rows.length > 0;
    } finally {
      if (connection) {
        await connection.end();
      }
    }
  }

  /**
   * Get statistics about states and cities
   */
  async getStats(): Promise<{
    totalStates: number;
    totalCities: number;
  }> {
    const connection = await getConnection();

    try {
      if (!connection) {
        return { totalStates: 0, totalCities: 0 };
      }

      const [stateRows] = (await connection.execute(
        `SELECT COUNT(DISTINCT iso_code) as count FROM ${STATES_CITIES_TABLE}`,
      )) as [{ count: number }[], mysql.FieldPacket[]];

      const [cityRows] = (await connection.execute(
        `SELECT COUNT(*) as count FROM ${STATES_CITIES_TABLE}`,
      )) as [{ count: number }[], mysql.FieldPacket[]];

      return {
        totalStates: stateRows[0]?.count || 0,
        totalCities: cityRows[0]?.count || 0,
      };
    } finally {
      if (connection) {
        await connection.end();
      }
    }
  }
}
