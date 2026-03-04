import mongoose from "mongoose";
import FastTagModel from "../models/fasttag.model.js";
import dotenv from "dotenv";

dotenv.config();

async function addMP07Record() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI!);
    console.log("✅ Connected to MongoDB");

    // Create the record
    const newFastTag = new FastTagModel({
      formType: "FASTAG",
      vehicleNumber: "MP07MG5865",
      openingBalance: 1500,
      ownerName: "Test User",
      mobile: "9876543216",
      carModel: "Test Car",
      bank: "TEST",
      transactions: []
    });

    // Save to database
    const saved = await newFastTag.save();
    console.log("✅ FastTag record created:", saved.vehicleNumber);

    // Close connection
    await mongoose.disconnect();
    console.log("✅ Disconnected from MongoDB");

  } catch (error) {
    console.error("❌ Error:", error);
  }
}

addMP07Record();
