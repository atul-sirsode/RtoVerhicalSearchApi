// FastTag Transaction Interface
export interface FastTagTransaction {
  id: string;
  processingTime?: string;
  transactionTime: string;
  nature: "Debit" | "Credit";
  amount: string;
  description: string;
  closingBalance?: number;
}

// FastTag Document Interface
export interface FastTagDocument {
  _id: string;
  formType: string;
  vehicleNumber: string;
  openingBalance: number;
  ownerName: string;
  mobile: string;
  carModel: string;
  bank?: string;
  transactions: FastTagTransaction[];
  createdAt: Date;
  updatedAt: Date;
  __v: number;
}

// Create FastTag Request Interface
export interface CreateFastTagRequest {
  formType: string;
  vehicleNumber: string;
  openingBalance: number;
  ownerName: string;
  mobile: string;
  carModel: string;
  bank?: string;
  transactions?: FastTagTransaction[];
}

// Update FastTag Request Interface
export interface UpdateFastTagRequest {
  formType?: string;
  vehicleNumber?: string;
  openingBalance?: number;
  ownerName?: string;
  mobile?: string;
  carModel?: string;
  bank?: string;
}

// Add Transaction Request Interface
export interface AddTransactionRequest {
  id?: string;
  processingTime?: string;
  transactionTime: string;
  nature: "Debit" | "Credit";
  amount: string;
  description: string;
}

// Update Transaction Request Interface
export interface UpdateTransactionRequest {
  processingTime?: string;
  transactionTime?: string;
  nature?: "Debit" | "Credit";
  amount?: string;
  description?: string;
}

// API Response Interfaces
export interface FastTagApiResponse<T = any> {
  status: boolean;
  message: string;
  data?: T;
  statuscode?: number;
}

// List FastTags Response
export interface FastTagListResponse {
  fasttags: FastTagDocument[];
  total: number;
  page?: number;
  limit?: number;
}

// Transaction Response
export interface TransactionResponse {
  fasttag: FastTagDocument;
  transaction: FastTagTransaction;
}

// Query Parameters Interface
export interface FastTagQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  vehicleNumber?: string;
  formType?: string;
  bank?: string; // UX parameter name that maps to formType
  startDate?: string;
  endDate?: string;
}
