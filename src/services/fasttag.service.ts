import FastTagModel from "../models/fasttag.model.js";
import { UserService } from "./user.service.js";
import type {
  FastTagDocument,
  CreateFastTagRequest,
  UpdateFastTagRequest,
  AddTransactionRequest,
  UpdateTransactionRequest,
  FastTagListResponse,
  TransactionResponse,
  FastTagQueryParams,
  FastTagApiResponse,
  FastTagTransaction,
} from "../types/fasttag.types.js";
import { Types } from "mongoose";

export class FastTagService {
  private userService = new UserService();

  /**
   * Get all FastTag documents with optional filtering and pagination
   */
  async getFastTags(
    query: FastTagQueryParams = {},
  ): Promise<FastTagApiResponse<FastTagListResponse>> {
    try {
      const {
        page = 1,
        limit = 10,
        search,
        vehicleNumber,
        formType,
        bank,
      } = query;

      // Build filter conditions
      const filter: any = {};

      // Handle bank → formType mapping (bank is the UX parameter name)
      const actualFormType = bank || formType;

      if (vehicleNumber) {
        // For exact matching (UX requirement), use exact match instead of regex
        filter.vehicleNumber = vehicleNumber.toUpperCase();
      }

      if (actualFormType) {
        // Check if actualFormType is "all" or "all banks"
        if (
          actualFormType.toLowerCase() === "all" ||
          actualFormType.toLowerCase() === "all banks"
        ) {
          // Get all banks and use their codes as formTypes
          const banksResponse = await this.userService.getAllBanks();
          if (banksResponse.status && banksResponse.data) {
            const bankCodes = banksResponse.data.map((bank) =>
              bank.code.toLowerCase(),
            );
            filter.formType = { $in: bankCodes };
          } else {
            // If we can't get banks, return empty result
            return {
              status: false,
              message: "Unable to retrieve bank codes for formType filtering",
              statuscode: 500,
            };
          }
        } else {
          // Use specific formType
          filter.formType = actualFormType.toLowerCase();
        }
      }

      let queryBuilder = FastTagModel.find(filter);

      // Apply search if provided
      if (search) {
        const searchRegex = new RegExp(search, "i");
        queryBuilder = FastTagModel.find({
          $or: [
            { vehicleNumber: searchRegex },
            { ownerName: searchRegex },
            { carModel: searchRegex },
            { formType: searchRegex },
          ],
        })
          .sort({ createdAt: -1 })
          .skip((page - 1) * limit)
          .limit(limit);
      } else {
        queryBuilder = queryBuilder
          .sort({ createdAt: -1 })
          .skip((page - 1) * limit)
          .limit(limit);
      }

      const fasttags = await queryBuilder.exec();
      const total = await FastTagModel.countDocuments(filter);

      return {
        status: true,
        message: "FastTags retrieved successfully",
        data: {
          fasttags: fasttags.map((doc) => doc.toObject()),
          total,
          page,
          limit,
        },
      };
    } catch (error) {
      console.error("Error in getFastTags:", error);
      return {
        status: false,
        message: "Failed to retrieve FastTags",
        statuscode: 500,
      };
    }
  }

  /**
   * Get FastTags by form type
   */
  async getFastTagsByFormType(
    formType: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<FastTagApiResponse<FastTagListResponse>> {
    try {
      if (!formType || formType.trim() === "") {
        return {
          status: false,
          message: "Form type is required",
          statuscode: 400,
        };
      }

      const skip = (page - 1) * limit;

      const fasttags = await FastTagModel.find({
        formType: formType.toLowerCase(),
      })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      const total = await FastTagModel.countDocuments({
        formType: formType.toLowerCase(),
      });

      return {
        status: true,
        message: "FastTags retrieved successfully by form type",
        data: {
          fasttags: fasttags.map((doc) => doc.toObject()),
          total,
          page,
          limit,
        },
      };
    } catch (error) {
      console.error("Error in getFastTagsByFormType:", error);
      return {
        status: false,
        message: "Failed to retrieve FastTags by form type",
        statuscode: 500,
      };
    }
  }

  /**
   * Get FastTags by form type and date range
   */
  async getFastTagsByFormTypeAndDateRange(
    formType: string,
    startDate: string,
    endDate: string,
    page: number = 1,
    limit: number = 10,
    vehicleNumber?: string,
  ): Promise<FastTagApiResponse<FastTagListResponse>> {
    try {
      if (!startDate || startDate.trim() === "") {
        return {
          status: false,
          message: "Start date is required",
          statuscode: 400,
        };
      }

      if (!endDate || endDate.trim() === "") {
        return {
          status: false,
          message: "End date is required",
          statuscode: 400,
        };
      }

      // Parse dates
      const start = new Date(startDate);
      const end = new Date(endDate);

      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return {
          status: false,
          message: "Invalid date format. Use YYYY-MM-DD format",
          statuscode: 400,
        };
      }

      if (start > end) {
        return {
          status: false,
          message: "Start date must be before end date",
          statuscode: 400,
        };
      }

      const skip = (page - 1) * limit;

      // Build query: formType matches (if provided) AND (updatedAt is null OR updatedAt is between dates) AND optional vehicleNumber filter
      const query: any = {
        $or: [
          { updatedAt: { $exists: false } },
          { updatedAt: null },
          { updatedAt: { $gte: start, $lte: end } },
        ],
      };

      // Add formType filter if provided, otherwise get all bank codes
      if (
        formType &&
        formType.trim() !== "" &&
        formType.toLowerCase() !== "all banks" &&
        formType.toLowerCase() !== "all"
      ) {
        query.formType = formType.toLowerCase();
      } else {
        // formType is null, empty, "all banks", or "ALL", get all banks and use their codes as formTypes
        const banksResponse = await this.userService.getAllBanks();
        if (banksResponse.status && banksResponse.data) {
          const bankCodes = banksResponse.data.map((bank) =>
            bank.code.toLowerCase(),
          );
          query.formType = { $in: bankCodes };
        } else {
          // If we can't get banks, return empty result
          return {
            status: false,
            message: "Unable to retrieve bank codes for formType filtering",
            statuscode: 500,
          };
        }
      }

      // Add vehicleNumber filter if provided
      if (vehicleNumber && vehicleNumber.trim() !== "") {
        query.vehicleNumber = {
          $regex: vehicleNumber.trim(),
          $options: "i", // case-insensitive
        };
      }

      const fasttags = await FastTagModel.find(query)
        .sort({ updatedAt: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit);

      const total = await FastTagModel.countDocuments(query);

      return {
        status: true,
        message: "FastTags retrieved successfully by form type and date range",
        data: {
          fasttags: fasttags.map((doc) => doc.toObject()),
          total,
          page,
          limit,
        },
      };
    } catch (error) {
      console.error("Error in getFastTagsByFormTypeAndDateRange:", error);
      return {
        status: false,
        message: "Failed to retrieve FastTags by form type and date range",
        statuscode: 500,
      };
    }
  }

  /**
   * Get a single FastTag document by vehicle number
   */
  async getFastTagByVehicleNumber(
    vehicleNumber: string,
  ): Promise<FastTagApiResponse<FastTagDocument>> {
    try {
      if (!vehicleNumber || vehicleNumber.trim() === "") {
        return {
          status: false,
          message: "Vehicle number is required",
          statuscode: 400,
        };
      }

      const fasttag = await FastTagModel.findOne({
        vehicleNumber: vehicleNumber.toUpperCase(),
      });
      console.log("fastTag", fasttag);
      console.log("vehicleNumber", vehicleNumber);
      if (!fasttag) {
        return {
          status: false,
          message: "FastTag not found",
          statuscode: 404,
        };
      }

      return {
        status: true,
        message: "FastTag retrieved successfully",
        data: fasttag.toObject(),
      };
    } catch (error) {
      console.error("Error in getFastTagByVehicleNumber:", error);
      return {
        status: false,
        message: "Failed to retrieve FastTag",
        statuscode: 500,
      };
    }
  }

  /**
   * Create a new FastTag document
   */
  async createFastTag(
    data: CreateFastTagRequest,
  ): Promise<FastTagApiResponse<FastTagDocument>> {
    try {
      // Check if vehicle number already exists
      const existingFastTag = await FastTagModel.findOne({
        vehicleNumber: data.vehicleNumber.toUpperCase(),
      });

      if (existingFastTag) {
        return {
          status: false,
          message: "Vehicle number already exists",
          statuscode: 409,
        };
      }

      const fasttag = new FastTagModel({
        ...data,
        vehicleNumber: data.vehicleNumber.toUpperCase(),
      });

      const savedFastTag = await fasttag.save();

      return {
        status: true,
        message: "FastTag created successfully",
        data: savedFastTag.toObject(),
      };
    } catch (error) {
      console.error("Error in createFastTag:", error);
      return {
        status: false,
        message: "Failed to create FastTag",
        statuscode: 500,
      };
    }
  }

  /**
   * Update a FastTag document by vehicle number
   */
  async updateFastTag(
    documentId: string,
    data: UpdateFastTagRequest,
  ): Promise<FastTagApiResponse<FastTagDocument>> {
    try {
      if (!documentId || documentId.trim() === "") {
        return {
          status: false,
          message: "Document ID is required",
          statuscode: 400,
        };
      }

      // Normalize vehicle number if provided
      if (data.vehicleNumber) {
        data.vehicleNumber = data.vehicleNumber.toUpperCase();
      }
      console.log("data", data);
      const updatedFastTag = await FastTagModel.findByIdAndUpdate(
        documentId,
        { ...data, updatedAt: new Date() },
        { returnDocument: "after", runValidators: true },
      );

      if (!updatedFastTag) {
        return {
          status: false,
          message: "FastTag not found",
          statuscode: 404,
        };
      }

      return {
        status: true,
        message: "FastTag updated successfully",
        data: updatedFastTag.toObject(),
      };
    } catch (error) {
      console.error("Error in updateFastTag:", error);
      return {
        status: false,
        message: "Failed to update FastTag",
        statuscode: 500,
      };
    }
  }

  /**
   * Delete a FastTag document by vehicle number
   */
  async deleteFastTag(
    vehicleNumber: string,
  ): Promise<FastTagApiResponse<null>> {
    try {
      if (!vehicleNumber || vehicleNumber.trim() === "") {
        return {
          status: false,
          message: "Vehicle number is required",
          statuscode: 400,
        };
      }

      const deletedFastTag = await FastTagModel.findOneAndDelete({
        vehicleNumber: vehicleNumber.toUpperCase(),
      });

      if (!deletedFastTag) {
        return {
          status: false,
          message: "FastTag not found",
          statuscode: 404,
        };
      }

      return {
        status: true,
        message: "FastTag deleted successfully",
        data: null,
      };
    } catch (error) {
      console.error("Error in deleteFastTag:", error);
      return {
        status: false,
        message: "Failed to delete FastTag",
        statuscode: 500,
      };
    }
  }

  /**
   * Add a transaction to a FastTag document
   */
  async addTransaction(
    vehicleNumber: string,
    transactionData: AddTransactionRequest,
  ): Promise<FastTagApiResponse<FastTagTransaction>> {
    try {
      if (!vehicleNumber || vehicleNumber.trim() === "") {
        return {
          status: false,
          message: "Vehicle number is required",
          statuscode: 400,
        };
      }

      const fasttag = await FastTagModel.findOne({
        vehicleNumber: vehicleNumber.toUpperCase(),
      });

      if (!fasttag) {
        return {
          status: false,
          message: "FastTag not found",
          statuscode: 404,
        };
      }

      // Generate ID if not provided
      const transactionId =
        transactionData.id || new Types.ObjectId().toString();

      // Ensure transactions array exists
      if (!fasttag.transactions) {
        fasttag.transactions = [];
      }

      // Check if transaction with this ID already exists
      const existingTransactionIndex = fasttag.transactions.findIndex(
        (t) => t.id === transactionId,
      );

      let updatedTransaction: FastTagTransaction;
      let message: string;

      if (existingTransactionIndex !== -1) {
        // Update existing transaction
        fasttag.transactions[existingTransactionIndex] = {
          ...fasttag.transactions[existingTransactionIndex],
          ...transactionData,
          id: transactionId,
        };
        updatedTransaction = fasttag.transactions[existingTransactionIndex];
        message = "Transaction updated successfully";
      } else {
        // Add new transaction
        const newTransaction = {
          ...transactionData,
          id: transactionId,
        };
        fasttag.transactions.push(newTransaction);
        updatedTransaction = newTransaction;
        message = "Transaction added successfully";
      }

      await fasttag.save();

      return {
        status: true,
        message,
        data: updatedTransaction!,
      };
    } catch (error) {
      console.error("Error in addTransaction:", error);
      return {
        status: false,
        message: "Failed to add transaction",
        statuscode: 500,
      };
    }
  }

  /**
   * Update a FastTag document
   */
  async updateTransaction(
    documentId: string,
    updateData: UpdateFastTagRequest,
  ): Promise<FastTagApiResponse<FastTagDocument>> {
    try {
      if (!documentId || documentId.trim() === "") {
        return {
          status: false,
          message: "Document ID is required",
          statuscode: 400,
        };
      }
      console.log("updateData", updateData, documentId);
      const fasttag = await FastTagModel.findById(documentId);

      if (!fasttag) {
        return {
          status: false,
          message: "FastTag not found",
          statuscode: 404,
        };
      }

      // Update FastTag document fields
      if (updateData.ownerName !== undefined) {
        fasttag.ownerName = updateData.ownerName;
      }
      if (updateData.mobile !== undefined) {
        fasttag.mobile = updateData.mobile;
      }
      if (updateData.carModel !== undefined) {
        fasttag.carModel = updateData.carModel;
      }
      if (updateData.openingBalance !== undefined) {
        fasttag.openingBalance = updateData.openingBalance;
      }
      if (updateData.formType !== undefined) {
        fasttag.formType = updateData.formType;
      }
      if (updateData.vehicleNumber !== undefined) {
        fasttag.vehicleNumber = updateData.vehicleNumber.toUpperCase();
      }

      const updatedFastTag = await fasttag.save();

      return {
        status: true,
        message: "FastTag updated successfully",
        data: updatedFastTag,
      };
    } catch (error) {
      console.error("Error in updateTransaction:", error);
      return {
        status: false,
        message: "Failed to update FastTag",
        statuscode: 500,
      };
    }
  }

  /**
   * Delete a transaction from a FastTag document
   */
  async deleteTransaction(
    documentId: string,
    transactionId: string,
  ): Promise<FastTagApiResponse<null>> {
    try {
      if (!documentId || documentId.trim() === "") {
        return {
          status: false,
          message: "Document ID is required",
          statuscode: 400,
        };
      }

      if (!transactionId || transactionId.trim() === "") {
        return {
          status: false,
          message: "Transaction ID is required",
          statuscode: 400,
        };
      }

      const fasttag = await FastTagModel.findById(documentId);

      if (!fasttag) {
        return {
          status: false,
          message: "FastTag not found",
          statuscode: 404,
        };
      }

      // Find and remove the transaction
      const transactionIndex = fasttag.transactions.findIndex(
        (tx) => tx.id === transactionId,
      );

      if (transactionIndex === -1) {
        return {
          status: false,
          message: "Transaction not found",
          statuscode: 404,
        };
      }

      fasttag.transactions.splice(transactionIndex, 1);

      await fasttag.save();

      return {
        status: true,
        message: "Transaction deleted successfully",
        data: null,
      };
    } catch (error) {
      console.error("Error in deleteTransaction:", error);
      return {
        status: false,
        message: "Failed to delete transaction",
        statuscode: 500,
      };
    }
  }

  /**
   * Get FastTag statistics
   */
  async getFastTagStats(): Promise<
    FastTagApiResponse<{
      totalFastTags: number;
      totalTransactions: number;
      formTypeStats: Array<{ formType: string; count: number }>;
    }>
  > {
    try {
      const totalFastTags = await FastTagModel.countDocuments();

      // Get all FastTags to count transactions
      const allFastTags = await FastTagModel.find();
      const totalTransactions = allFastTags.reduce(
        (sum, fasttag) => sum + fasttag.transactions.length,
        0,
      );

      // Get form type statistics
      const formTypeStats = await FastTagModel.aggregate([
        {
          $group: {
            _id: "$formType",
            count: { $sum: 1 },
          },
        },
        {
          $project: {
            formType: "$_id",
            count: 1,
            _id: 0,
          },
        },
        {
          $sort: { count: -1 },
        },
      ]);

      return {
        status: true,
        message: "FastTag statistics retrieved successfully",
        data: {
          totalFastTags,
          totalTransactions,
          formTypeStats,
        },
      };
    } catch (error) {
      console.error("Error in getFastTagStats:", error);
      return {
        status: false,
        message: "Failed to retrieve FastTag statistics",
        statuscode: 500,
      };
    }
  }

  /**
   * Get all unique bank codes/formTypes from FastTag collection
   */
  async getAllBankCodes(): Promise<FastTagApiResponse<string[]>> {
    try {
      const bankCodes = await FastTagModel.distinct("formType");

      // Filter out null/empty values and sort
      const filteredCodes = bankCodes
        .filter((code: string | null) => code && code.trim() !== "")
        .map((code: string) => code.trim())
        .sort();

      return {
        status: true,
        message: "Bank codes retrieved successfully",
        data: filteredCodes,
      };
    } catch (error) {
      console.error("Error getting bank codes:", error);
      return {
        status: false,
        message: "Failed to retrieve bank codes",
        statuscode: 500,
      };
    }
  }
}

export default FastTagService;
