import React, { useState } from 'react';
import { X, User } from 'lucide-react';
import { WorkOrder, User as UserType, UserRole } from '../../types';
import { apiService } from '../../services/api';
import { LoadingSpinner } from '../common/LoadingSpinner';

interface AddToWorkOrderModalProps {
  workOrder: WorkOrder;
  users: UserType[];
  type: 'mechanic' | 'manager';
  onClose: () => void;
  onSuccess: () => void;
}

export const AddToWorkOrderModal: React.FC<AddToWorkOrderModalProps> = ({
  workOrder,
  users,
  type,
  onClose,
  onSuccess
}) => {
  const [selectedUserId, setSelectedUserId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const filteredUsers = users.filter(user => {
    if (type === 'mechanic') {
      return user.role === UserRole.Technician && 
             !workOrder.mechanics?.some(m => m._id === user._id);
    } else {
      return user.role === UserRole.ShopManager && 
             !workOrder.shopManager?.some(m => m._id === user._id);
    }
  });

  const handleSubmit = async () => {
    if (!selectedUserId) {
      setError(`Please select a ${type}`);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = type === 'mechanic'
        ? await apiService.addMechanicToWorkOrder(workOrder._id, selectedUserId)
        : await apiService.addManagerToWorkOrder(workOrder._id, selectedUserId);
      
      if (response.success) {
        onSuccess();
      } else {
        setError(`Unexpected response when adding ${type}`);
      }
    } catch (error: any) {
      setError(error.message || `Failed to add ${type}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">
            Add {type === 'mechanic' ? 'Mechanic' : 'Manager'} to Work Order
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <p className="text-sm text-gray-600 mb-4">
              Work Order: <span className="font-medium">{workOrder._id}</span>
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select {type === 'mechanic' ? 'Technician' : 'Shop Manager'}
            </label>
            {filteredUsers.length === 0 ? (
              <div className="text-center py-8">
                <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">
                  No available {type === 'mechanic' ? 'technicians' : 'shop managers'} to assign
                </p>
              </div>
            ) : (
              <select
                value={selectedUserId}
                onChange={(e) => {
                  setSelectedUserId(e.target.value);
                  if (error) setError('');
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={loading}
              >
                <option value="">Select a {type === 'mechanic' ? 'technician' : 'manager'}</option>
                {filteredUsers.map((user) => (
                  <option key={user._id} value={user._id}>
                    {user.name} ({user.email})
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || filteredUsers.length === 0}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center"
          >
            {loading && <LoadingSpinner size="sm" className="mr-2" />}
            Add {type === 'mechanic' ? 'Mechanic' : 'Manager'}
          </button>
        </div>
      </div>
    </div>
  );
};