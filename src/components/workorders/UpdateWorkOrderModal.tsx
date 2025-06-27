import React, { useState, useEffect } from 'react';
import { X, Car as CarIcon, User, Calendar, MapPin } from 'lucide-react';
import { UpdateWorkOrderDto, WorkOrder, Car, ApiError } from '../../types';
import { apiService } from '../../services/api';
import { authUtils } from '../../utils/auth';
import { Toast } from '../common/Toast';

interface UpdateWorkOrderModalProps {
  workOrder: WorkOrder;
  onClose: () => void;
  onSuccess: (workOrder: WorkOrder) => void;
}

export const UpdateWorkOrderModal: React.FC<UpdateWorkOrderModalProps> = ({ workOrder, onClose, onSuccess }) => {
  const [formData, setFormData] = useState<UpdateWorkOrderDto>({
    car: workOrder.car._id,
    ownerName: workOrder.ownerName,
    headMechanic: workOrder.headMechanic,
    orderCreatorName: workOrder.orderCreatorName,
    ownerEmail: workOrder.ownerEmail,
    phoneNumber: workOrder.phoneNumber,
    startDate: workOrder.startDate.split('T')[0],
    finishDate: workOrder.finishDate.split('T')[0],
    address: workOrder.address,
    status: workOrder.status,
  });
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    const fetchCars = async () => {
      const user = authUtils.getUser();
      if (!user) {
        setToast({ message: 'User not authenticated', type: 'error' });
        return;
      }
      try {
        const response = await apiService.getCarsByUser(user._id);
        setCars(response.data || []);
      } catch (error: any) {
        setToast({ message: error.message || 'Failed to fetch cars', type: 'error' });
      }
    };
    fetchCars();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const updatedWorkOrder = await apiService.updateWorkOrder(workOrder._id, formData);
      setToast({ message: 'Work order updated successfully', type: 'success' });
      onSuccess(updatedWorkOrder);
    } catch (error: any) {
      setToast({ message: error.message || 'Failed to update work order', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Update Work Order</h2>
          <button onClick={onClose} className="text-gray-600 hover:text-gray-800">
            <X className="h-6 w-6" />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Car</label>
            <div className="flex items-center">
              <CarIcon className="h-5 w-5 mr-2 text-gray-500" />
              <select
                name="car"
                value={formData.car}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                disabled
              >
                <option value="">Select a car</option>
                {cars.map((car) => (
                  <option key={car._id} value={car._id}>
                    {car.plate} ({car.model} {car.variant}, {car.year})
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Owner Name</label>
            <div className="flex items-center">
              <User className="h-5 w-5 mr-2 text-gray-500" />
              <input
                type="text"
                name="ownerName"
                value={formData.ownerName}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Head Mechanic</label>
            <div className="flex items-center">
              <User className="h-5 w-5 mr-2 text-gray-500" />
              <input
                type="text"
                name="headMechanic"
                value={formData.headMechanic}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Order Creator Name</label>
            <div className="flex items-center">
              <User className="h-5 w-5 mr-2 text-gray-500" />
              <input
                type="text"
                name="orderCreatorName"
                value={formData.orderCreatorName}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Owner Email</label>
            <div className="flex items-center">
              <User className="h-5 w-5 mr-2 text-gray-500" />
              <input
                type="email"
                name="ownerEmail"
                value={formData.ownerEmail}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Phone Number</label>
            <div className="flex items-center">
              <User className="h-5 w-5 mr-2 text-gray-500" />
              <input
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Start Date</label>
            <div className="flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-gray-500" />
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Finish Date</label>
            <div className="flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-gray-500" />
              <input
                type="date"
                name="finishDate"
                value={formData.finishDate}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Address</label>
            <div className="flex items-center">
              <MapPin className="h-5 w-5 mr-2 text-gray-500" />
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Status</label>
            <div className="flex items-center">
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-blue-300"
            >
              {loading ? 'Updating...' : 'Update Work Order'}
            </button>
          </div>
        </form>
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </div>
    </div>
  );
};