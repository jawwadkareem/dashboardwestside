import React, { useState, useEffect, useMemo } from 'react';
import { X, Car as CarIcon, User, Calendar, MapPin } from 'lucide-react';
import { WorkOrder, Repair, ApiError } from '../../types';
import { apiService } from '../../services/api';
import { authUtils } from '../../utils/auth';
import { Toast } from '../common/Toast';
import { RepairManagement } from './RepairManagement';

interface WorkOrderDetailsModalProps {
  workOrderId: string;
  onClose: () => void;
}

export const WorkOrderDetailsModal: React.FC<WorkOrderDetailsModalProps> = ({ workOrderId, onClose }) => {
  const [workOrder, setWorkOrder] = useState<WorkOrder | null>(null);
  const [repairs, setRepairs] = useState<Repair[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const user = useMemo(() => authUtils.getUser(), []);

  useEffect(() => {
    let isMounted = true;

    const fetchWorkOrderAndRepairs = async () => {
      console.log('WorkOrderDetailsModal: User from authUtils:', user);
      if (!user || !user._id) {
        if (isMounted) {
          setToast({ message: 'User not authenticated. Please log in again.', type: 'error' });
          setLoading(false);
        }
        return;
      }

      try {
        const response = await apiService.getWorkOrderRepairs(workOrderId, user._id);
        console.log('WorkOrderDetailsModal: API Response:', JSON.stringify(response, null, 2));

        if (isMounted) {
          setWorkOrder(response.workOrder);
          setRepairs(response.repairs || []);
          setTotal(response.total || 0);

         
        }
      } catch (error: any) {
        console.error('WorkOrderDetailsModal: API Error:', error);
        if (isMounted) {
          setToast({
            message: error.message || 'Failed to fetch work order and repairs. Please try again.',
            type: 'error',
          });
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchWorkOrderAndRepairs();

    return () => {
      isMounted = false;
    };
  }, [workOrderId, user]);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-4 w-full max-w-[90%] sm:max-w-md text-center">
          Loading...
        </div>
      </div>
    );
  }

  if (!workOrder) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-4 w-full max-w-[90%] sm:max-w-md text-center">
          <p className="text-red-600">Work order not found</p>
          <button
            onClick={onClose}
            className="mt-4 px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-[90%] sm:max-w-lg md:max-w-xl lg:max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg sm:text-xl font-bold">Work Order Details</h2>
          <button onClick={onClose} className="text-gray-600 hover:text-gray-800">
            <X className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>
        </div>
        <div className="space-y-3 sm:space-y-4">
          <div className="flex items-center flex-wrap">
            <CarIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-gray-500 flex-shrink-0" />
            <p className="text-sm sm:text-base">
              <strong>Car:</strong> {workOrder.car?.plate || 'N/A'} (
              {workOrder.car?.model || ''} {workOrder.car?.variant || ''}, {workOrder.car?.year || ''})
            </p>
          </div>
          <div className="flex items-center flex-wrap">
            <User className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-gray-500 flex-shrink-0" />
            <p className="text-sm sm:text-base">
              <strong>Owner:</strong> {workOrder.ownerName || 'N/A'} ({workOrder.ownerEmail || 'N/A'}, {workOrder.phoneNumber || 'N/A'})
            </p>
          </div>
          <div className="flex items-center flex-wrap">
            <User className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-gray-500 flex-shrink-0" />
            <p className="text-sm sm:text-base"><strong>Head Mechanic:</strong> {workOrder.headMechanic || 'N/A'}</p>
          </div>
          <div className="flex items-center flex-wrap">
            <User className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-gray-500 flex-shrink-0" />
            <p className="text-sm sm:text-base"><strong>Order Creator:</strong> {workOrder.orderCreatorName || 'N/A'}</p>
          </div>
          <div className="flex items-center flex-wrap">
            <Calendar className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-gray-500 flex-shrink-0" />
            <p className="text-sm sm:text-base"><strong>Start Date:</strong> {workOrder.startDate ? new Date(workOrder.startDate).toLocaleDateString() : 'N/A'}</p>
          </div>
          <div className="flex items-center flex-wrap">
            <Calendar className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-gray-500 flex-shrink-0" />
            <p className="text-sm sm:text-base"><strong>Finish Date:</strong> {workOrder.finishDate ? new Date(workOrder.finishDate).toLocaleDateString() : 'N/A'}</p>
          </div>
          <div className="flex items-center flex-wrap">
            <MapPin className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-gray-500 flex-shrink-0" />
            <p className="text-sm sm:text-base"><strong>Address:</strong> {workOrder.address || 'N/A'}</p>
          </div>
          <div className="flex items-center flex-wrap">
            <p className="text-sm sm:text-base"><strong>Status:</strong> {workOrder.status ? workOrder.status.replace('_', ' ') : 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm sm:text-base"><strong>Mechanics:</strong></p>
            {workOrder.mechanics && workOrder.mechanics.length > 0 ? (
              <ul className="list-disc pl-4 sm:pl-5 text-sm sm:text-base">
                {workOrder.mechanics.map((m, index) => {
                  console.log(`Mechanic ${index}:`, JSON.stringify(m, null, 2));
                  return (
                    <li key={m._id || m.email || Math.random().toString()}>
                      {m.name || 'Unknown Name'} ({m.email || 'No Email'})
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="text-sm sm:text-base">No mechanics assigned</p>
            )}
          </div>
          <div>
            <p className="text-sm sm:text-base"><strong>Shop Managers:</strong></p>
            {workOrder.shopManager && workOrder.shopManager.length > 0 ? (
              <ul className="list-disc pl-4 sm:pl-5 text-sm sm:text-base">
                {workOrder.shopManager.map((m, index) => {
                  console.log(`Shop Manager ${index}:`, JSON.stringify(m, null, 2));
                  return (
                    <li key={m._id || m.email || Math.random().toString()}>
                      {m.name || 'Unknown Name'} ({m.email || 'No Email'})
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="text-sm sm:text-base">No managers assigned</p>
            )}
          </div>
          <div>
            <p className="text-sm sm:text-base"><strong>Mechanic History:</strong></p>
            {workOrder.mechanicHistory && workOrder.mechanicHistory.length > 0 ? (
              <ul className="list-disc pl-4 sm:pl-5 text-sm sm:text-base">
                {workOrder.mechanicHistory.map((h, index) => {
                  console.log(`Mechanic History ${index}:`, JSON.stringify(h, null, 2));
                  return (
                    <li key={`${h.email || 'unknown'}-${h.deletedAt || Math.random().toString()}`}>
                      {h.name || 'Unknown Name'} ({h.email || 'No Email'}) (Removed: {h.deletedAt ? new Date(h.deletedAt).toLocaleDateString() : 'N/A'})
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="text-sm sm:text-base">No mechanic history</p>
            )}
          </div>
          <div>
            <p className="text-sm sm:text-base"><strong>Manager History:</strong></p>
            {workOrder.managerHistory && workOrder.managerHistory.length > 0 ? (
              <ul className="list-disc pl-4 sm:pl-5 text-sm sm:text-base">
                {workOrder.managerHistory.map((h, index) => {
                  console.log(`Manager History ${index}:`, JSON.stringify(h, null, 2));
                  return (
                    <li key={`${h.email || 'unknown'}-${h.deletedAt || Math.random().toString()}`}>
                      {h.name || 'Unknown Name'} ({h.email || 'No Email'}) (Removed: {h.deletedAt ? new Date(h.deletedAt).toLocaleDateString() : 'N/A'})
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="text-sm sm:text-base">No manager history</p>
            )}
          </div>
          <div>
            <p className="text-sm sm:text-base"><strong>Repairs:</strong></p>
            <RepairManagement workOrderId={workOrderId} user={user} repairs={repairs} total={total} setRepairs={setRepairs} />
          </div>
        </div>
        <div className="flex justify-end mt-3 sm:mt-4">
          <button
            onClick={onClose}
            className="px-3 py-1 sm:px-4 sm:py-2 text-sm sm:text-base text-white bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            Close
          </button>
        </div>
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