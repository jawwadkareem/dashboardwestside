export interface User {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  mobile: string | number;
  address?: string;
  token?: string;
}


export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  credentials: {
    _id: string;
    name: string;
    email: string;
    role: string;
    token: string;
  };
}

export interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
  address: string;
  mobile: string;
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
  password?: string;
  address?: string;
  mobile?: string;
  currentPassword?: string;
}

export interface Car {
  _id: string;
  plate: string;
  variant: string;
  model: string;
  year: number;
  chassisNumber: string;
  image: string;
}

export interface HistoryEntry {
  name: string;
  email: string;
  phone: string;
  deletedAt: string;
}


export interface WorkOrder {
  _id: string;
  car: Car;
  ownerName: string;
  ownerEmail: string;
  phoneNumber: string;
  headMechanic: string;
  orderCreatorName: string;
  startDate: string;
  finishDate: string;
  address: string;
  status: 'pending' | 'in_progress' | 'completed';
  createdBy: string[];
  mechanics: User[];
  shopManager: User[];
  mechanicHistory: HistoryEntry[];
  managerHistory: HistoryEntry[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateWorkOrderDto {
  car: string;
  ownerName: string;
  headMechanic: string;
  orderCreatorName: string;
  ownerEmail: string;
  phoneNumber: string;
  startDate: string;
  finishDate: string;
  address: string;
  createdBy: string;
}

export interface UpdateWorkOrderDto {
  car?: string;
  ownerName?: string;
  headMechanic?: string;
  orderCreatorName?: string;
  ownerEmail?: string;
  phoneNumber?: string;
  startDate?: string;
  finishDate?: string;
  address?: string;
  status?: 'pending' | 'in_progress' | 'completed';
}

export interface ApiError {
  message: string;
  statusCode: number;
  error?: string;
}

export enum UserRole {
  SystemAdministrator = 'systemAdministrator',
  ShopManager = 'shopManager',
  Technician = 'technician'
}


export interface Repair {
  _id: string;
  workOrder: string;
  mechanicName: string;
  partName: string;
  price: number;
  finishDate: string;
  notes: string;
  submitted: boolean;
  beforeImageUri?: string; // Existing field for compatibility
  afterImageUri?: string;  // Existing field for compatibility
  beforeImageUrl?: string; // New field for signed URL from API
  afterImageUrl?: string;  // New field for signed URL from API
}

export interface CreateRepairDto {
  workOrder: string;
  mechanicName: string;
  partName: string;
  price: number;
  finishDate: string;
  notes: string;
}

export interface UpdateRepairDto {
  mechanicName?: string;
  partName?: string;
  price?: number;
  finishDate?: string;
  notes?: string;
  submitted?: boolean;
  beforeImageUri?: string;
  afterImageUri?: string;
}