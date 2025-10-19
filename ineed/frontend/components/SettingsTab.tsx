import React, { useState } from 'react';
import type { User } from '../types';

interface SettingsTabProps {
  user: User;
  onManageSubscription: () => void;
  onActivateNotifications: () => void;
}

const SettingsItem: React.FC<{ icon: string; title: string; description: string; children: React.ReactNode }> = ({ icon, title, description, children }) => (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border-b">
        <div className="flex items-start mb-4 sm:mb-0">
            <div className="bg-gray-100 rounded-lg p-3 mr-4">
                <i className={`${icon} text-blue-600 text-xl`}></i>
            </div>
            <div>
                <h4 className="font-bold text-gray-800">{title}</h4>
                <p className="text-sm text-gray-600">{description}</p>
            </div>
        </div>
        <div className="flex-shrink-0 w-full sm:w-auto flex justify-end">
            {children}
        </div>
    </div>
);

const SettingsTab: React.FC<SettingsTabProps> = ({ user, onManageSubscription, onActivateNotifications }) => {
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(Notification.permission === 'granted');
  const [smsNotifications, setSmsNotifications] = useState(false);

  const handlePushNotificationsToggle = () => {
      if (Notification.permission !== 'granted') {
        onActivateNotifications();
        // This is optimistic. We assume the user will grant permission.
        // A more robust solution would listen for the permission change.
        setPushNotifications(true);
      } else {
        // Can't programmatically "un-grant" permission. This toggle is for UI only.
        alert("Para desativar as notificações, você precisa fazer isso nas configurações do seu navegador.");
      }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Gerenciamento da Conta</h3>
      </div>
      <div className="divide-y">
        <SettingsItem icon="fas fa-key" title="Senha" description="Altere sua senha regularmente para manter sua conta segura.">
            <button className="px-4 py-2 border rounded-lg text-sm font-semibold hover:bg-gray-100">Alterar Senha</button>
        </SettingsItem>
        <SettingsItem icon="fas fa-user-shield" title="Privacidade" description="Controle quem pode ver seu perfil e informações de contato.">
            <button className="px-4 py-2 border rounded-lg text-sm font-semibold hover:bg-gray-100">Gerenciar</button>
        </SettingsItem>
      </div>
      <div className="p-6 mt-4">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Notificações</h3>
      </div>
      <div className="divide-y">
         <SettingsItem icon="fas fa-at" title="Notificações por E-mail" description="Receba atualizações importantes e ofertas por e-mail.">
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" checked={emailNotifications} onChange={(e) => setEmailNotifications(e.target.checked)} className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
        </SettingsItem>
         <SettingsItem icon="fas fa-bell" title="Notificações Push" description="Receba alertas instantâneos no seu dispositivo.">
             <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" checked={pushNotifications} onChange={handlePushNotificationsToggle} className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
        </SettingsItem>
         <SettingsItem icon="fas fa-comment-alt" title="Notificações por SMS" description="Receba alertas urgentes via mensagem de texto.">
             <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" checked={smsNotifications} onChange={(e) => setSmsNotifications(e.target.checked)} className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
        </SettingsItem>
      </div>
       <div className="p-6 mt-4">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Assinatura</h3>
      </div>
      <div className="divide-y">
        <SettingsItem icon="fas fa-crown" title="Plano Premium" description={user.isPremium ? 'Você é um membro Premium. Obrigado!' : 'Acesse recursos exclusivos com o plano Premium.'}>
            <button onClick={onManageSubscription} className={`px-4 py-2 border rounded-lg text-sm font-semibold ${user.isPremium ? 'bg-yellow-400 text-white' : 'gradient-bg text-white'}`}>
                {user.isPremium ? 'Gerenciar Assinatura' : 'Fazer Upgrade'}
            </button>
        </SettingsItem>
      </div>
    </div>
  );
};

export default SettingsTab;