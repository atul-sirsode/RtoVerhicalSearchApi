import mysql from "mysql2/promise";
import { env } from "../config/env.js";

export interface State {
  state_name: string;
  state_code: string;
  iso_code: string;
}

export interface City {
  city_name: string;
}

export interface InsertCityRequest {
  city_name: string;
  iso_code: string;
}

export interface DeleteCityRequest {
  city_name: string;
  iso_code: string;
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
        `SELECT DISTINCT state_name,state_code, iso_code FROM ${STATES_CITIES_TABLE} ORDER BY state_name`,
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

  /**
   * Check if a city already exists for a given state
   */
  async cityExists(cityName: string, isoCode: string): Promise<boolean> {
    const connection = await getConnection();

    try {
      if (!connection) {
        return false;
      }

      const [rows] = (await connection.execute(
        `SELECT 1 FROM ${STATES_CITIES_TABLE} WHERE city_name = ? AND iso_code = ? LIMIT 1`,
        [cityName, isoCode],
      )) as [unknown[], mysql.FieldPacket[]];

      return rows.length > 0;
    } finally {
      if (connection) {
        await connection.end();
      }
    }
  }

  /**
   * Insert a new city for a given state
   * Returns: { success: boolean, message: string, state_name?: string }
   */
  async insertCity(cityData: InsertCityRequest): Promise<{
    success: boolean;
    message: string;
    state_name?: string;
  }> {
    const connection = await getConnection();

    try {
      if (!connection) {
        return {
          success: false,
          message: "Database connection not available",
        };
      }

      // Validate input
      if (!cityData.city_name || !cityData.iso_code) {
        return {
          success: false,
          message: "City name and ISO code are required",
        };
      }

      // Check if state exists
      const stateExists = await this.stateExists(cityData.iso_code);
      if (!stateExists) {
        return {
          success: false,
          message: "State with provided ISO code does not exist",
        };
      }

      // Check if city already exists for this state
      const cityExists = await this.cityExists(
        cityData.city_name,
        cityData.iso_code,
      );
      if (cityExists) {
        return {
          success: false,
          message: "City already exists for this state",
        };
      }

      // Get state name for the response
      const [stateRows] = (await connection.execute(
        `SELECT DISTINCT state_name FROM ${STATES_CITIES_TABLE} WHERE iso_code = ? LIMIT 1`,
        [cityData.iso_code],
      )) as [{ state_name: string }[], mysql.FieldPacket[]];

      const stateName = stateRows[0]?.state_name || "Unknown";

      // Insert the new city
      await connection.execute(
        `INSERT INTO ${STATES_CITIES_TABLE} (city_name, iso_code, state_name) VALUES (?, ?, ?)`,
        [cityData.city_name.trim(), cityData.iso_code, stateName],
      );

      console.log(
        `City "${cityData.city_name}" inserted for state "${stateName}" (${cityData.iso_code})`,
      );

      return {
        success: true,
        message: "City inserted successfully",
        state_name: stateName,
      };
    } catch (error) {
      console.error("Error inserting city:", error);
      return {
        success: false,
        message: "Failed to insert city due to database error",
      };
    } finally {
      if (connection) {
        await connection.end();
      }
    }
  }

  /**
   * Delete a city for a given state
   * Returns: { success: boolean, message: string, state_name?: string }
   */
  async deleteCity(cityData: DeleteCityRequest): Promise<{
    success: boolean;
    message: string;
    state_name?: string;
  }> {
    const connection = await getConnection();

    try {
      if (!connection) {
        return {
          success: false,
          message: "Database connection not available",
        };
      }

      // Validate input
      if (!cityData.city_name || !cityData.iso_code) {
        return {
          success: false,
          message: "City name and ISO code are required",
        };
      }

      // Check if state exists
      const stateExists = await this.stateExists(cityData.iso_code);
      if (!stateExists) {
        return {
          success: false,
          message: "State with provided ISO code does not exist",
        };
      }

      // Check if city exists for this state
      const cityExists = await this.cityExists(
        cityData.city_name,
        cityData.iso_code,
      );
      if (!cityExists) {
        return {
          success: false,
          message: "City not found for this state",
        };
      }

      // Get state name for the response
      const [stateRows] = (await connection.execute(
        `SELECT DISTINCT state_name FROM ${STATES_CITIES_TABLE} WHERE iso_code = ? LIMIT 1`,
        [cityData.iso_code],
      )) as [{ state_name: string }[], mysql.FieldPacket[]];

      const stateName = stateRows[0]?.state_name || "Unknown";

      // Delete the city
      const [result] = (await connection.execute(
        `DELETE FROM ${STATES_CITIES_TABLE} WHERE city_name = ? AND iso_code = ?`,
        [cityData.city_name.trim(), cityData.iso_code],
      )) as [mysql.ResultSetHeader, mysql.FieldPacket[]];

      if (result.affectedRows === 0) {
        return {
          success: false,
          message: "Failed to delete city - no rows affected",
        };
      }

      console.log(
        `City "${cityData.city_name}" deleted from state "${stateName}" (${cityData.iso_code})`,
      );

      return {
        success: true,
        message: "City deleted successfully",
        state_name: stateName,
      };
    } catch (error) {
      console.error("Error deleting city:", error);
      return {
        success: false,
        message: "Failed to delete city due to database error",
      };
    } finally {
      if (connection) {
        await connection.end();
      }
    }
  }
}
