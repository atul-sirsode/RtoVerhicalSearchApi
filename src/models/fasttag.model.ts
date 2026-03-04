import mongoose, { Schema, Document } from "mongoose";
import type {
  FastTagDocument as IFastTagDocument,
  FastTagTransaction,
} from "../types/fasttag.types.js";

// Transaction sub-schema
const TransactionSchema = new Schema<FastTagTransaction>(
  {
    id: {
      type: String,
      required: false,
    },
    processingTime: {
      type: String,
      required: false,
    },
    transactionTime: {
      type: String,
      required: true,
    },
    nature: {
      type: String,
      required: true,
      enum: ["Debit", "Credit"],
    },
    amount: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    closingBalance: {
      type: Number,
      required: false,
    },
  },
  { _id: false },
);

// Main FastTag schema
const FastTagSchema = new Schema<IFastTagDocument & Document>(
  {
    formType: {
      type: String,
      required: true,
    },
    vehicleNumber: {
      type: String,
      required: true,
      unique: true,
    },
    openingBalance: {
      type: Number,
      required: true,
      default: 0,
    },
    ownerName: {
      type: String,
      required: true,
    },
    mobile: {
      type: String,
      required: false,
      default: "",
    },
    carModel: {
      type: String,
      required: true,
    },
    bank: {
      type: String,
      required: false,
    },
    transactions: {
      type: [TransactionSchema],
      required: true,
      default: [],
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
    versionKey: "__v",
    collection: "users",
  },
);

// Indexes for better performance
FastTagSchema.index({ formType: 1 });
FastTagSchema.index({ ownerName: 1 });
FastTagSchema.index({ createdAt: -1 });

// Virtual for getting the latest closing balance
FastTagSchema.virtual("currentBalance").get(function () {
  if (this.transactions.length === 0) {
    return this.openingBalance;
  }
  const latestTransaction = this.transactions[this.transactions.length - 1];
  return latestTransaction?.closingBalance !== undefined
    ? latestTransaction.closingBalance
    : this.openingBalance;
});

// Pre-save middleware to ensure transaction IDs are unique within a document
// FastTagSchema.pre("save", function (next: any) {
//   if (this.transactions && this.transactions.length > 0) {
//     const transactionIds = this.transactions.map((tx: any) => tx.id);
//     const uniqueIds = new Set(transactionIds);

//     if (transactionIds.length !== uniqueIds.size) {
//       const error = new Error(
//         "Duplicate transaction IDs found within the same document",
//       );
//       return next(error);
//     }
//   }
//   next();
// });

// Static method to find by vehicle number
FastTagSchema.statics.findByVehicleNumber = function (vehicleNumber: string) {
  return this.findOne({ vehicleNumber: vehicleNumber.toUpperCase() });
};

// Static method to search fasttags
FastTagSchema.statics.searchFastTags = function (
  query: string,
  page: number = 1,
  limit: number = 10,
) {
  const searchRegex = new RegExp(query, "i");

  return this.find({
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
};

export const FastTagModel = mongoose.model<IFastTagDocument & Document>(
  "FastTag",
  FastTagSchema,
);

export default FastTagModel;
