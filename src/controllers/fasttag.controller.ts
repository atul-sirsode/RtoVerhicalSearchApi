import type { Request, Response } from "express";
import FastTagService from "../services/fasttag.service.js";
import type {
  CreateFastTagRequest,
  UpdateFastTagRequest,
  AddTransactionRequest,
  UpdateTransactionRequest,
  FastTagQueryParams,
} from "../types/fasttag.types.js";

export class FastTagController {
  private fastTagService: FastTagService;

  constructor() {
    this.fastTagService = new FastTagService();
  }

  /**
   * GET /api/fasttag
   * Get all FastTag documents with optional filtering and pagination
   */
  async getFastTags(req: Request, res: Response): Promise<void> {
    try {
      const query: FastTagQueryParams = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 10,
        search: req.query.search as string,
        vehicleNumber: req.query.vehicleNumber as string,
        formType: req.query.formType as string,
      };

      const result = await this.fastTagService.getFastTags(query);

      if (result.status) {
        res.status(200).json(result);
      } else {
        res.status(result.statuscode || 500).json(result);
      }
    } catch (error) {
      console.error("Controller error in getFastTags:", error);
      res.status(500).json({
        status: false,
        message: "Internal server error",
        statuscode: 500,
      });
    }
  }

  /**
   * POST /api/fasttag
   * Create a new FastTag document
   */
  async createFastTag(req: Request, res: Response): Promise<void> {
    try {
      const data: CreateFastTagRequest = req.body;

      // Basic validation
      if (
        !data.formType ||
        !data.vehicleNumber ||
        !data.ownerName ||
        !data.carModel
      ) {
        res.status(400).json({
          status: false,
          message:
            "Missing required fields: formType, vehicleNumber, ownerName, carModel",
          statuscode: 400,
        });
        return;
      }

      const result = await this.fastTagService.createFastTag(data);

      if (result.status) {
        res.status(201).json(result);
      } else {
        res.status(result.statuscode || 500).json(result);
      }
    } catch (error) {
      console.error("Controller error in createFastTag:", error);
      res.status(500).json({
        status: false,
        message: "Internal server error",
        statuscode: 500,
      });
    }
  }

  /**
   * GET /api/fasttag/:id
   * Get a single FastTag document by vehicle number
   */
  async getFastTagById(req: Request, res: Response): Promise<void> {
    try {
      const { vehicleNumber } = req.params;
      const result = await this.fastTagService.getFastTagByVehicleNumber(
        vehicleNumber as string,
      );

      if (result.status) {
        res.status(200).json(result);
      } else {
        res.status(result.statuscode || 500).json(result);
      }
    } catch (error) {
      console.error("Controller error in getFastTagById:", error);
      res.status(500).json({
        status: false,
        message: "Internal server error",
        statuscode: 500,
      });
    }
  }

  /**
   * PUT /api/fasttag/:id
   * Update a FastTag document by document ID
   */
  async updateFastTag(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const data: UpdateFastTagRequest = req.body;

      const result = await this.fastTagService.updateFastTag(
        id as string,
        data,
      );

      if (result.status) {
        res.status(200).json(result);
      } else {
        res.status(result.statuscode || 500).json(result);
      }
    } catch (error) {
      console.error("Controller error in updateFastTag:", error);
      res.status(500).json({
        status: false,
        message: "Internal server error",
        statuscode: 500,
      });
    }
  }

  /**
   * DELETE /api/fasttag/:id
   * Delete a FastTag document by vehicle number
   */
  async deleteFastTag(req: Request, res: Response): Promise<void> {
    try {
      const { vehicleNumber } = req.params;
      const result = await this.fastTagService.deleteFastTag(
        vehicleNumber as string,
      );

      if (result.status) {
        res.status(200).json(result);
      } else {
        res.status(result.statuscode || 500).json(result);
      }
    } catch (error) {
      console.error("Controller error in deleteFastTag:", error);
      res.status(500).json({
        status: false,
        message: "Internal server error",
        statuscode: 500,
      });
    }
  }

  /**
   * POST /api/fasttag/:id/transactions
   * Add a transaction to a FastTag document
   */
  async addTransaction(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const transactionData: AddTransactionRequest = req.body;

      // Basic validation
      if (
        !transactionData.transactionTime ||
        !transactionData.nature ||
        !transactionData.amount ||
        !transactionData.description
      ) {
        res.status(400).json({
          status: false,
          message:
            "Missing required fields: transactionTime, nature, amount, description",
          statuscode: 400,
        });
        return;
      }

      // Generate transaction ID if not provided
      if (!transactionData.id) {
        transactionData.id = Date.now().toString();
      }

      const result = await this.fastTagService.addTransaction(
        id as string,
        transactionData,
      );

      if (result.status) {
        res.status(201).json(result);
      } else {
        res.status(result.statuscode || 500).json(result);
      }
    } catch (error) {
      console.error("Controller error in addTransaction:", error);
      res.status(500).json({
        status: false,
        message: "Internal server error",
        statuscode: 500,
      });
    }
  }

  /**
   * PUT /api/fasttag/:id
   * Update a FastTag document
   */
  async updateTransaction(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const updateData: UpdateFastTagRequest = req.body;

      const result = await this.fastTagService.updateTransaction(
        id as string,
        updateData,
      );

      if (result.status) {
        res.status(200).json(result);
      } else {
        res.status(result.statuscode || 500).json(result);
      }
    } catch (error) {
      console.error("Controller error in updateTransaction:", error);
      res.status(500).json({
        status: false,
        message: "Internal server error",
        statuscode: 500,
      });
    }
  }

  /**
   * DELETE /api/fasttag/:id/transactions/:txnId
   * Delete a transaction from a FastTag document
   */
  async deleteTransaction(req: Request, res: Response): Promise<void> {
    try {
      const { id, txnId } = req.params;
      const result = await this.fastTagService.deleteTransaction(
        id as string,
        txnId as string,
      );

      if (result.status) {
        res.status(200).json(result);
      } else {
        res.status(result.statuscode || 500).json(result);
      }
    } catch (error) {
      console.error("Controller error in deleteTransaction:", error);
      res.status(500).json({
        status: false,
        message: "Internal server error",
        statuscode: 500,
      });
    }
  }

  /**
   * GET /api/fasttag/formType/:formType
   * Get FastTags by form type
   */
  async getFastTagsByFormType(req: Request, res: Response): Promise<void> {
    try {
      const { formType } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const result = await this.fastTagService.getFastTagsByFormType(
        formType as string,
        page,
        limit,
      );

      if (result.status) {
        res.status(200).json(result);
      } else {
        res.status(result.statuscode || 500).json(result);
      }
    } catch (error) {
      console.error("Controller error in getFastTagsByFormType:", error);
      res.status(500).json({
        status: false,
        message: "Internal server error",
        statuscode: 500,
      });
    }
  }

  /**
   * GET /api/fasttag/formType/:formType/daterange
   * Get FastTags by form type and date range
   */
  async getFastTagsByFormTypeAndDateRange(
    req: Request,
    res: Response,
  ): Promise<void> {
    try {
      const { formType } = req.params;
      const { startDate, endDate } = req.query;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const result =
        await this.fastTagService.getFastTagsByFormTypeAndDateRange(
          formType as string,
          startDate as string,
          endDate as string,
          page,
          limit,
        );

      if (result.status) {
        res.status(200).json(result);
      } else {
        res.status(result.statuscode || 500).json(result);
      }
    } catch (error) {
      console.error(
        "Controller error in getFastTagsByFormTypeAndDateRange:",
        error,
      );
      res.status(500).json({
        status: false,
        message: "Internal server error",
        statuscode: 500,
      });
    }
  }

  /**
   * GET /api/fasttag/stats
   * Get FastTag statistics
   */
  async getFastTagStats(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.fastTagService.getFastTagStats();

      if (result.status) {
        res.status(200).json(result);
      } else {
        res.status(result.statuscode || 500).json(result);
      }
    } catch (error) {
      console.error("Controller error in getFastTagStats:", error);
      res.status(500).json({
        status: false,
        message: "Internal server error",
        statuscode: 500,
      });
    }
  }
}

export default FastTagController;
