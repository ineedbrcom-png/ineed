

import React from 'react';
import SettingsTab from './SettingsTab';
import { useAppContext } from '../context/AppContext';
import { requestNotificationPermissionAndNotify } from '../utils/notifications';


const SettingsPage: React.FC = () => {
  const { state, dispatch } = useAppContext();
  const { currentUser: user } = state;

  if (!user) return null;

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Configurações</h1>
      {/* Reusing SettingsTab from profile for consistency */}
      <SettingsTab 
        user={user} 
        onManageSubscription={() => dispatch({ type: 'OPEN_PREMIUM_MODAL' })} 
        onActivateNotifications={requestNotificationPermissionAndNotify} 
      />
    </div>
  );
};

export default SettingsPage;