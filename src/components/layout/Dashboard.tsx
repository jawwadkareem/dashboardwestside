import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { UserManagement } from '../users/UserManagement';
import { WorkOrderManagement } from '../workorders/WorkOrderManagement';

export const Dashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('users');

  const renderContent = () => {
    switch (activeTab) {
      case 'users':
        return <UserManagement />;
      case 'workorders':
        return <WorkOrderManagement />;
      default:
        return <UserManagement />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      <div className="flex-1 overflow-auto">
        {renderContent()}
      </div>
    </div>
  );
};