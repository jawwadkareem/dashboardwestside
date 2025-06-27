import { LoginCredentials, CreateUserRequest, UpdateUserRequest, CreateWorkOrderDto, UpdateWorkOrderDto, WorkOrder, ApiError, Car, Repair, CreateRepairDto, UpdateRepairDto } from '../types';
import { authUtils } from '../utils/auth';

const API_BASE_URL = 'http://localhost:5000';

class ApiService {
  private request = async (endpoint: string, options: RequestInit = {}) => {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...authUtils.getAuthHeaders(),
      ...options.headers,
    };

    try {
      const response = await fetch(url, { ...options, headers });

      // Handle 204 No Content responses
      if (response.status === 204) {
        return { success: true };
      }

      // Handle binary responses (e.g., PDF)
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/pdf')) {
        if (!response.ok) {
          throw {
            message: 'Failed to download PDF',
            statusCode: response.status,
          };
        }
        return response.blob();
      }

      // Handle JSON responses
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();

        if (!response.ok) {
          const errorMessages: { [key: number]: string } = {
            401: 'Unauthorized: Invalid credentials or token.',
            403: 'Forbidden: You do not have permission to access this resource.',
            404: 'Not Found: The requested resource could not be found.',
            409: 'Conflict: The email address is already in use.',
            500: 'Server Error: Something went wrong on the server.'
          };
          throw {
            message: data.message || errorMessages[response.status] || 'An error occurred',
            statusCode: response.status,
            error: data.error
          };
        }

        return data;
      }

      // Handle non-JSON responses
      return { success: true };
    } catch (error: any) {
      if (error.statusCode) {
        throw error;
      }
      throw {
        message: 'Network error. Please check your connection.',
        statusCode: 0
      };
    }
  };

  login = async (credentials: LoginCredentials) => {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  };

  getAllUsers = async () => {
    return this.request('/user/all');
  };

  getCarsByUser = async (userId: string, page: number = 1, limit: number = 20, search?: string) => {
    const query = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
    if (search) query.append('search', search);
    return this.request(`/vehicle/cars-by-user/${userId}?${query.toString()}`);
  };

  createTechnician = async (userData: CreateUserRequest) => {
    return this.request('/user/create-technician', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  };

  createManager = async (userData: CreateUserRequest) => {
    return this.request('/user/create-manager', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  };

  createAdmin = async (userData: CreateUserRequest) => {
    return this.request('/user/create-admin', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  };

  updateUser = async (initiatorId: string, userId: string, userData: UpdateUserRequest) => {
    return this.request(`/user/${initiatorId}/update/${userId}`, {
      method: 'PATCH',
      body: JSON.stringify(userData),
    });
  };

  getAllWorkOrders = async () => {
    return this.request('/workorder');
  };

  createWorkOrder = async (dto: CreateWorkOrderDto): Promise<WorkOrder> => {
    return this.request('/workorder/create-work-order', {
      method: 'POST',
      body: JSON.stringify(dto),
    });
  };

  updateWorkOrder = async (id: string, dto: UpdateWorkOrderDto): Promise<WorkOrder> => {
    return this.request(`/workorder/${id}`, {
      method: 'PUT',
      body: JSON.stringify(dto),
    });
  };

  getWorkOrderById = async (id: string, userId: string): Promise<WorkOrder> => {
    return this.request(`/workorder/get-single-workorder/${id}?userId=${userId}`);
  };

  downloadWorkOrderReport = async (workOrderId: string): Promise<Blob> => {
    return this.request(`/report/get-report-workorder/${workOrderId}`);
  };

  addMechanicToWorkOrder = async (workOrderId: string, mechanicId: string) => {
    return this.request(`/workorder/add-mechanic/${workOrderId}/${mechanicId}`, {
      method: 'PUT',
    });
  };

  addManagerToWorkOrder = async (workOrderId: string, managerId: string) => {
    return this.request(`/workorder/add-manager/${workOrderId}/${managerId}`, {
      method: 'PUT',
    });
  };

  deleteMechanic = async (mechanicId: string) => {
    return this.request(`/workorder/delete-mechanic/${mechanicId}`, {
      method: 'DELETE',
    });
  };

  deleteManager = async (managerId: string) => {
    return this.request(`/workorder/delete-manager/${managerId}`, {
      method: 'DELETE',
    });
  };

  createRepair = async (dto: CreateRepairDto, beforeImage?: File, afterImage?: File): Promise<Repair> => {
    const formData = new FormData();
    formData.append('workOrder', dto.workOrder);
    formData.append('mechanicName', dto.mechanicName);
    formData.append('partName', dto.partName);
    formData.append('price', dto.price.toString());
    formData.append('finishDate', dto.finishDate);
    formData.append('notes', dto.notes);
    if (beforeImage) formData.append('images', beforeImage);
    if (afterImage) formData.append('images', afterImage);

    return this.request('/repairs', {
      method: 'POST',
      body: formData,
      headers: {
        // Do not set Content-Type for FormData; fetch sets it automatically
        ...authUtils.getAuthHeaders(),
      },
    });
  };

  updateRepair = async (repairId: string, userId: string, dto: UpdateRepairDto): Promise<Repair> => {
    return this.request(`/repairs/${repairId}?userId=${userId}`, {
      method: 'PUT',
      body: JSON.stringify(dto),
    });
  };

  getRepairsByWorkOrder = async (
    workOrderId: string,
    page: number = 1,
    limit: number = 20,
    filters?: {
      mechanicName?: string;
      partName?: string;
      submitted?: boolean;
      startDate?: string;
      endDate?: string;
    }
  ): Promise<{ data: Repair[]; total: number }> => {
    const query = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(filters?.mechanicName && { mechanicName: filters.mechanicName }),
      ...(filters?.partName && { partName: filters.partName }),
      ...(filters?.submitted !== undefined && { submitted: filters.submitted.toString() }),
      ...(filters?.startDate && { startDate: filters.startDate }),
      ...(filters?.endDate && { endDate: filters.endDate }),
    });
    return this.request(`/repairs/workorder/${workOrderId}?${query.toString()}`);
  };

  uploadRepairImage = async (repairId: string, userId: string, file: File, type: 'before' | 'after'): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    return this.request(`/repairs/upload-image/${repairId}/${type}/${userId}`, {
      method: 'PUT',
      body: formData,
      headers: {
        ...authUtils.getAuthHeaders(),
      },
    });
  };

  deleteRepairImage = async (repairId: string, userId: string, type: 'before' | 'after'): Promise<string> => {
    return this.request(`/repairs/delete-image/${repairId}/${type}/${userId}`, {
      method: 'DELETE',
    });
  };

  async getWorkOrderRepairs(
    workOrderId: string,
    userId: string,
    page: number = 1,
    limit: number = 20,
    search?: string
  ): Promise<{ workOrder: WorkOrder; repairs: Repair[]; total: number }> {
    const query = new URLSearchParams({
      userId,
      page: page.toString(),
      limit: limit.toString(),
      ...(search && { search }),
    });
    const response = await this.request(`/repairs/${workOrderId}/allowed?${query.toString()}`);
    
    console.log('ApiService: Raw API Response for getWorkOrderRepairs:', JSON.stringify(response, null, 2));
    
    // Handle case where response is an array of work orders
    if (Array.isArray(response)) {
      const workOrder = response.find((wo: WorkOrder) => wo._id === workOrderId);
      if (!workOrder) {
        throw {
          message: `Work order with ID ${workOrderId} not found`,
          statusCode: 404,
        };
      }
      // Fetch repairs separately since the response doesn't include them
      const repairsResponse = await this.getRepairsByWorkOrder(workOrderId, page, limit);
      console.log('ApiService: Selected WorkOrder:', JSON.stringify(workOrder, null, 2));
      console.log('ApiService: Repairs Response:', JSON.stringify(repairsResponse, null, 2));
      return {
        workOrder,
        repairs: repairsResponse.data || [],
        total: repairsResponse.total || 0,
      };
    }
    
    // Handle case where response is already in the expected format
    console.log('ApiService: Response in expected format:', JSON.stringify(response, null, 2));
    return {
      workOrder: response.workOrder,
      repairs: response.repairs || [],
      total: response.total || 0,
    };
  };

  getSingleRepairById = async (repairId: string): Promise<Repair> => {
    return this.request(`/repairs/get-single-repair-by-id/${repairId}`);
  };

  constructor() {
    console.log('ApiService instantiated, request method defined:', typeof this.request);
  }
}

console.log('Instantiating ApiService');
export const apiService = new ApiService();