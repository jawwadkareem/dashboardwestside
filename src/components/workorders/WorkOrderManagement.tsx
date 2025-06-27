import React, { useState, useEffect } from 'react';
import { Wrench, Plus, Trash2, RefreshCw, UserPlus, FileText, Edit, Eye } from 'lucide-react';
import { WorkOrder, User, UserRole } from '../../types';
import { apiService } from '../../services/api';
import { authUtils } from '../../utils/auth';
import { AddToWorkOrderModal } from './AddToWorkOrderModal';
import { CreateWorkOrderModal } from './CreateWorkOrderModal';
import { UpdateWorkOrderModal } from './UpdateWorkOrderModal';
import { WorkOrderDetailsModal } from './WorkOrderDetailsModal';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { Toast } from '../common/Toast';
import { useAuth } from '../../hooks/useAuth';

export const WorkOrderManagement: React.FC = () => {
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState<WorkOrder | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState<string | null>(null);
  const [selectedWorkOrder, setSelectedWorkOrder] = useState<WorkOrder | null>(null);
  const [addType, setAddType] = useState<'mechanic' | 'manager'>('mechanic');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [workOrdersResponse, usersResponse] = await Promise.all([
        apiService.getAllWorkOrders().catch(() => []),
        apiService.getAllUsers().catch(() => []),
      ]);
      setWorkOrders(Array.isArray(workOrdersResponse) ? workOrdersResponse : []);
      setUsers(Array.isArray(usersResponse) ? usersResponse : []);
    } catch (error: any) {
      setToast({ message: error.message || 'Failed to fetch data', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleAddToWorkOrder = (workOrder: WorkOrder, type: 'mechanic' | 'manager') => {
    setSelectedWorkOrder(workOrder);
    setAddType(type);
    setShowAddModal(true);
  };

  const handleDeleteMechanic = async (mechanicId: string) => {
    if (!confirm('Are you sure you want to delete this mechanic? This will remove them from all work orders and archive them.')) {
      return;
    }
    try {
      const response = await apiService.deleteMechanic(mechanicId);
      if (response.success) {
        await fetchData();
        setToast({ message: 'Mechanic deleted and archived successfully', type: 'success' });
      } else {
        setToast({ message: 'Unexpected response when deleting mechanic', type: 'error' });
      }
    } catch (error: any) {
      setToast({ message: error.message || 'Failed to delete mechanic', type: 'error' });
    }
  };

  const handleDeleteManager = async (managerId: string) => {
    if (!confirm('Are you sure you want to delete this manager? This will remove them from all work orders and archive them.')) {
      return;
    }
    try {
      const response = await apiService.deleteManager(managerId);
      if (response.success) {
        await fetchData();
        setToast({ message: 'Manager deleted and archived successfully', type: 'success' });
      } else {
        setToast({ message: 'Unexpected response when deleting manager', type: 'error' });
      }
    } catch (error: any) {
      setToast({ message: error.message || 'Failed to delete manager', type: 'error' });
    }
  };

  const handleAssignmentSuccess = () => {
    setShowAddModal(false);
    setSelectedWorkOrder(null);
    fetchData();
    setToast({ message: `${addType === 'mechanic' ? 'Mechanic' : 'Manager'} assigned successfully`, type: 'success' });
  };

  const handleCreateSuccess = (workOrder: WorkOrder) => {
    setShowCreateModal(false);
    setWorkOrders((prev) => [...prev, workOrder]);
    setToast({ message: 'Work order created successfully', type: 'success' });
  };

  const handleUpdateSuccess = (updatedWorkOrder: WorkOrder) => {
    setShowUpdateModal(null);
    setWorkOrders((prev) =>
      prev.map((wo) => (wo._id === updatedWorkOrder._id ? updatedWorkOrder : wo))
    );
    setToast({ message: 'Work order updated successfully', type: 'success' });
  };

  const handleDownloadReport = async (workOrderId: string) => {
    try {
      const blob = await apiService.downloadWorkOrderReport(workOrderId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `repair_report_${workOrderId}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
      setToast({ message: 'Report downloaded successfully', type: 'success' });
    } catch (error: any) {
      setToast({ message: error.message || 'Failed to download report', type: 'error' });
    }
  };

  const canCreateOrUpdate = user && (user.role === UserRole.SystemAdministrator || user.role === UserRole.ShopManager);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Wrench className="h-8 w-8 text-blue-600 mr-3" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Work Order Management</h1>
              <p className="text-gray-600">Manage work orders, mechanics, and shop managers</p>
            </div>
          </div>
          <div className="flex space-x-2">
            {canCreateOrUpdate && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Work Order
              </button>
            )}
            <button
              onClick={fetchData}
              className="flex items-center px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {workOrders.length === 0 ? (
          <div className="p-12 text-center">
            <Wrench className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No work orders found</h3>
            <p className="text-gray-600">Work orders will appear here when they are created.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Work Order ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Car Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Owner
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mechanics
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Shop Managers
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {workOrders.map((workOrder) => (
                  <tr key={workOrder._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{workOrder._id}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">
                        {workOrder.car.plate} ({workOrder.car.model} {workOrder.car.variant}, {workOrder.car.year})
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{workOrder.ownerName}</div>
                      <div className="text-sm text-gray-500">{workOrder.ownerEmail}</div>
                      <div className="text-sm text-gray-500">{workOrder.phoneNumber}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        workOrder.status === 'completed' ? 'bg-green-100 text-green-800' :
                        workOrder.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {workOrder.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        {workOrder.mechanics && workOrder.mechanics.length > 0 ? (
                          workOrder.mechanics.map((mechanic) => (
                            <div key={mechanic._id} className="flex items-center justify-between bg-green-50 rounded-lg p-2">
                              <span className="text-green-800 text-sm">{mechanic.name} ({mechanic.email})</span>
                              <button
                                onClick={() => handleDeleteMechanic(mechanic._id)}
                                className="text-red-600 hover:text-red-800 transition-colors"
                                title="Delete mechanic"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          ))
                        ) : (
                          <span className="text-gray-400 text-sm">No mechanics assigned</span>
                        )}
                        {workOrder.mechanicHistory && workOrder.mechanicHistory.length > 0 && (
                          <div className="mt-2">
                            <span className="text-gray-500 text-xs font-medium">History:</span>
                            {workOrder.mechanicHistory.map((history, index) => (
                              <div key={index} className="text-gray-500 text-xs">
                                {history.name} (Removed: {new Date(history.deletedAt).toLocaleDateString()})
                              </div>
                            ))}
                          </div>
                        )}
                        <button
                          onClick={() => handleAddToWorkOrder(workOrder, 'mechanic')}
                          className="flex items-center text-green-600 hover:text-green-800 text-sm transition-colors"
                        >
                          <UserPlus className="h-4 w-4 mr-1" />
                          Add Mechanic
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        {workOrder.shopManager && workOrder.shopManager.length > 0 ? (
                          workOrder.shopManager.map((manager) => (
                            <div key={manager._id} className="flex items-center justify-between bg-blue-50 rounded-lg p-2">
                              <span className="text-blue-800 text-sm">{manager.name} ({manager.email})</span>
                              <button
                                onClick={() => handleDeleteManager(manager._id)}
                                className="text-red-600 hover:text-red-800 transition-colors"
                                title="Delete manager"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          ))
                        ) : (
                          <span className="text-gray-400 text-sm">No managers assigned</span>
                        )}
                        {workOrder.managerHistory && workOrder.managerHistory.length > 0 && (
                          <div className="mt-2">
                            <span className="text-gray-500 text-xs font-medium">History:</span>
                            {workOrder.managerHistory.map((history, index) => (
                              <div key={index} className="text-gray-500 text-xs">
                                {history.name} (Removed: {new Date(history.deletedAt).toLocaleDateString()})
                              </div>
                            ))}
                          </div>
                        )}
                        <button
                          onClick={() => handleAddToWorkOrder(workOrder, 'manager')}
                          className="flex items-center text-blue-600 hover:text-blue-800 text-sm transition-colors"
                        >
                          <UserPlus className="h-4 w-4 mr-1" />
                          Add Manager
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setShowDetailsModal(workOrder._id)}
                          className="text-blue-600 hover:text-blue-800"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        {canCreateOrUpdate && (
                          <button
                            onClick={() => setShowUpdateModal(workOrder)}
                            className="text-blue-600 hover:text-blue-800"
                            title="Edit Work Order"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDownloadReport(workOrder._id)}
                          className="text-blue-600 hover:text-blue-800"
                          title="Download Report"
                        >
                          <FileText className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showAddModal && selectedWorkOrder && (
        <AddToWorkOrderModal
          workOrder={selectedWorkOrder}
          users={users}
          type={addType}
          onClose={() => {
            setShowAddModal(false);
            setSelectedWorkOrder(null);
          }}
          onSuccess={handleAssignmentSuccess}
        />
      )}

      {showCreateModal && (
        <CreateWorkOrderModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={handleCreateSuccess}
        />
      )}

      {showUpdateModal && (
        <UpdateWorkOrderModal
          workOrder={showUpdateModal}
          onClose={() => setShowUpdateModal(null)}
          onSuccess={handleUpdateSuccess}
        />
      )}

      {showDetailsModal && (
        <WorkOrderDetailsModal
          workOrderId={showDetailsModal}
          onClose={() => setShowDetailsModal(null)}
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