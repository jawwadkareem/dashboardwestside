import React, { useState, Dispatch, SetStateAction } from 'react';
import { Plus, Trash2, Upload, Edit, X } from 'lucide-react';
import { Repair, CreateRepairDto, UpdateRepairDto, User } from '../../types';
import { apiService } from '../../services/api';
import { Toast } from '../common/Toast';

interface RepairManagementProps {
  workOrderId: string;
  user: User | null;
  repairs: Repair[];
  total: number;
  setRepairs: Dispatch<SetStateAction<Repair[]>>;
}

export const RepairManagement: React.FC<RepairManagementProps> = ({ workOrderId, user, repairs, total, setRepairs }) => {
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState<Repair | null>(null);

  const handleCreateRepair = async (dto: CreateRepairDto, beforeImage?: File, afterImage?: File) => {
    if (!user || !user._id) {
      setToast({ message: 'User not authenticated', type: 'error' });
      return;
    }
    try {
      const repair = await apiService.createRepair({ ...dto, workOrder: workOrderId }, beforeImage, afterImage);
      setRepairs((prev) => [...prev, repair]);
      setShowCreateModal(false);
      setToast({ message: 'Repair created successfully', type: 'success' });
    } catch (error: any) {
      setToast({ message: error.message || 'Failed to create repair', type: 'error' });
    }
  };

  const handleUpdateRepair = async (repairId: string, dto: UpdateRepairDto) => {
    if (!user || !user._id) {
      setToast({ message: 'User not authenticated', type: 'error' });
      return;
    }
    try {
      const updatedRepair = await apiService.updateRepair(repairId, user._id, dto);
      setRepairs((prev) =>
        prev.map((r) => (r._id === updatedRepair._id ? updatedRepair : r))
      );
      setShowUpdateModal(null);
      setToast({ message: 'Repair updated successfully', type: 'success' });
    } catch (error: any) {
      setToast({ message: error.message || 'Failed to update repair', type: 'error' });
    }
  };

  const handleUploadImage = async (repairId: string, type: 'before' | 'after', file: File) => {
    if (!user || !user._id) {
      setToast({ message: 'User not authenticated', type: 'error' });
      return;
    }
    try {
      const url = await apiService.uploadRepairImage(repairId, user._id, file, type);
      setRepairs((prev) =>
        prev.map((r) =>
          r._id === repairId
            ? { ...r, [type === 'before' ? 'beforeImageUrl' : 'afterImageUrl']: url }
            : r
        )
      );
      setToast({ message: `${type.charAt(0).toUpperCase() + type.slice(1)} image uploaded successfully`, type: 'success' });
    } catch (error: any) {
      setToast({ message: error.message || `Failed to upload ${type} image`, type: 'error' });
    }
  };

  const handleDeleteImage = async (repairId: string, type: 'before' | 'after') => {
    if (!user || !user._id) {
      setToast({ message: 'User not authenticated', type: 'error' });
      return;
    }
    try {
      await apiService.deleteRepairImage(repairId, user._id, type);
      setRepairs((prev) =>
        prev.map((r) =>
          r._id === repairId
            ? { ...r, [type === 'before' ? 'beforeImageUrl' : 'afterImageUrl']: undefined }
            : r
        )
      );
      setToast({ message: `${type.charAt(0).toUpperCase() + type.slice(1)} image deleted successfully`, type: 'success' });
    } catch (error: any) {
      setToast({ message: error.message || `Failed to delete ${type} image`, type: 'error' });
    }
  };

  return (
    <div className="space-y-3 sm:space-y-4">
      {loading ? (
        <p className="text-sm sm:text-base">Loading repairs...</p>
      ) : repairs.length === 0 ? (
        <p className="text-sm sm:text-base">No repairs found</p>
      ) : (
        <ul className="list-disc pl-4 sm:pl-5 text-sm sm:text-base">
          {repairs.map((repair) => (
            <li key={repair._id} className="mb-2">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-gray-50 p-2 rounded">
                <div className="space-y-1">
                  <p><strong>Mechanic:</strong> {repair.mechanicName}</p>
                  <p><strong>Part:</strong> {repair.partName}</p>
                  <p><strong>Price:</strong> ${repair.price}</p>
                  <p><strong>Finish Date:</strong> {new Date(repair.finishDate).toLocaleDateString()}</p>
                  <p><strong>Notes:</strong> {repair.notes}</p>
                  <p><strong>Submitted:</strong> {repair.submitted ? 'Yes' : 'No'}</p>
                  {repair.beforeImageUrl && (
                    <p>
                      <strong>Before Image:</strong>{' '}
                      <a href={repair.beforeImageUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600">
                        View
                      </a>
                      {!repair.submitted && (
                        <button
                          onClick={() => handleDeleteImage(repair._id, 'before')}
                          className="ml-2 text-red-600 hover:text-red-800"
                          title="Delete Before Image"
                        >
                          <Trash2 className="h-4 w-4 inline" />
                        </button>
                      )}
                    </p>
                  )}
                  {repair.afterImageUrl && (
                    <p>
                      <strong>After Image:</strong>{' '}
                      <a href={repair.afterImageUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600">
                        View
                      </a>
                      {!repair.submitted && (
                        <button
                          onClick={() => handleDeleteImage(repair._id, 'after')}
                          className="ml-2 text-red-600 hover:text-red-800"
                          title="Delete After Image"
                        >
                          <Trash2 className="h-4 w-4 inline" />
                        </button>
                      )}
                    </p>
                  )}
                </div>
                {!repair.submitted && (
                  <div className="flex space-x-2 mt-2 sm:mt-0">
                    <button
                      onClick={() => setShowUpdateModal(repair)}
                      className="text-blue-600 hover:text-blue-800"
                      title="Edit Repair"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <label className="flex items-center text-blue-600 hover:text-blue-800 cursor-pointer">
                      <Upload className="h-4 w-4 mr-1" />
                      Before
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => e.target.files && handleUploadImage(repair._id, 'before', e.target.files[0])}
                      />
                    </label>
                    <label className="flex items-center text-blue-600 hover:text-blue-800 cursor-pointer">
                      <Upload className="h-4 w-4 mr-1" />
                      After
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => e.target.files && handleUploadImage(repair._id, 'after', e.target.files[0])}
                      />
                    </label>
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
      {user && (user.role === 'systemAdministrator' || user.role === 'shopManager') && (
        <button
          onClick={() => setShowCreateModal(true)}
          className="mt-2 flex items-center text-blue-600 hover:text-blue-800 text-sm sm:text-base"
        >
          <Plus className="h-4 w-4 mr-1" />
          Add Repair
        </button>
      )}
      {showCreateModal && (
        <CreateRepairModal
          workOrderId={workOrderId}
          onClose={() => setShowCreateModal(false)}
          onSuccess={handleCreateRepair}
        />
      )}
      {showUpdateModal && (
        <UpdateRepairModal
          repair={showUpdateModal}
          onClose={() => setShowUpdateModal(null)}
          onSuccess={handleUpdateRepair}
        />
      )}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

interface CreateRepairModalProps {
  workOrderId: string;
  onClose: () => void;
  onSuccess: (dto: CreateRepairDto, beforeImage?: File, afterImage?: File) => void;
}

const CreateRepairModal: React.FC<CreateRepairModalProps> = ({ workOrderId, onClose, onSuccess }) => {
  const [formData, setFormData] = useState<CreateRepairDto>({
    workOrder: workOrderId,
    mechanicName: '',
    partName: '',
    price: 0,
    finishDate: '',
    notes: '',
  });
  const [beforeImage, setBeforeImage] = useState<File | null>(null);
  const [afterImage, setAfterImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: name === 'price' ? parseFloat(value) || 0 : value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSuccess(formData, beforeImage || undefined, afterImage || undefined);
    } catch (error: any) {
      setToast({ message: error.message || 'Failed to create repair', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-[90%] sm:max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg sm:text-xl font-bold">Create Repair</h2>
          <button onClick={onClose} className="text-gray-600 hover:text-gray-800">
            <X className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="mb-3 sm:mb-4">
            <label className="block text-sm font-medium text-gray-700">Mechanic Name</label>
            <input
              type="text"
              name="mechanicName"
              value={formData.mechanicName}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm sm:text-base"
              required
            />
          </div>
          <div className="mb-3 sm:mb-4">
            <label className="block text-sm font-medium text-gray-700">Part Name</label>
            <input
              type="text"
              name="partName"
              value={formData.partName}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm sm:text-base"
              required
            />
          </div>
          <div className="mb-3 sm:mb-4">
            <label className="block text-sm font-medium text-gray-700">Price</label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm sm:text-base"
              required
            />
          </div>
          <div className="mb-3 sm:mb-4">
            <label className="block text-sm font-medium text-gray-700">Finish Date</label>
            <input
              type="date"
              name="finishDate"
              value={formData.finishDate}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm sm:text-base"
              required
            />
          </div>
          <div className="mb-3 sm:mb-4">
            <label className="block text-sm font-medium text-gray-700">Notes</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm sm:text-base"
            />
          </div>
          <div className="mb-3 sm:mb-4">
            <label className="block text-sm font-medium text-gray-700">Before Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setBeforeImage(e.target.files ? e.target.files[0] : null)}
              className="mt-1 block w-full text-sm sm:text-base"
            />
          </div>
          <div className="mb-3 sm:mb-4">
            <label className="block text-sm font-medium text-gray-700">After Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setAfterImage(e.target.files ? e.target.files[0] : null)}
              className="mt-1 block w-full text-sm sm:text-base"
            />
          </div>
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1 sm:px-4 sm:py-2 text-sm sm:text-base text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-3 py-1 sm:px-4 sm:py-2 text-sm sm:text-base text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-blue-300"
            >
              {loading ? 'Creating...' : 'Create Repair'}
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

interface UpdateRepairModalProps {
  repair: Repair;
  onClose: () => void;
  onSuccess: (repairId: string, dto: UpdateRepairDto) => void;
}

const UpdateRepairModal: React.FC<UpdateRepairModalProps> = ({ repair, onClose, onSuccess }) => {
  const [formData, setFormData] = useState<UpdateRepairDto>({
    mechanicName: repair.mechanicName,
    partName: repair.partName,
    price: repair.price,
    finishDate: repair.finishDate,
    notes: repair.notes,
    submitted: repair.submitted,
  });
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLInputElement>) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : name === 'price' ? parseFloat(value) || 0 : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSuccess(repair._id, formData);
    } catch (error: any) {
      setToast({ message: error.message || 'Failed to update repair', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-[90%] sm:max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg sm:text-xl font-bold">Update Repair</h2>
          <button onClick={onClose} className="text-gray-600 hover:text-gray-800">
            <X className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="mb-3 sm:mb-4">
            <label className="block text-sm font-medium text-gray-700">Mechanic Name</label>
            <input
              type="text"
              name="mechanicName"
              value={formData.mechanicName}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm sm:text-base"
            />
          </div>
          <div className="mb-3 sm:mb-4">
            <label className="block text-sm font-medium text-gray-700">Part Name</label>
            <input
              type="text"
              name="partName"
              value={formData.partName}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm sm:text-base"
            />
          </div>
          <div className="mb-3 sm:mb-4">
            <label className="block text-sm font-medium text-gray-700">Price</label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm sm:text-base"
            />
          </div>
          <div className="mb-3 sm:mb-4">
            <label className="block text-sm font-medium text-gray-700">Finish Date</label>
            <input
              type="date"
              name="finishDate"
              value={formData.finishDate}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm sm:text-base"
            />
          </div>
          <div className="mb-3 sm:mb-4">
            <label className="block text-sm font-medium text-gray-700">Notes</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm sm:text-base"
            />
          </div>
          <div className="mb-3 sm:mb-4">
            <label className="flex items-center text-sm font-medium text-gray-700">
              <input
                type="checkbox"
                name="submitted"
                checked={formData.submitted}
                onChange={handleInputChange}
                className="mr-2"
              />
              Submitted
            </label>
          </div>
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1 sm:px-4 sm:py-2 text-sm sm:text-base text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-3 py-1 sm:px-4 sm:py-2 text-sm sm:text-base text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-blue-300"
            >
              {loading ? 'Updating...' : 'Update Repair'}
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