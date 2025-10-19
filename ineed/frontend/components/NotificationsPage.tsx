import React from 'react';
import { useAppContext } from '../context/AppContext';
import type { Notification } from '../types';

const NotificationItem: React.FC<{ notification: Notification }> = ({ notification }) => {
    const getIcon = (text: string) => {
        if (text.toLowerCase().includes('oferta')) return 'fas fa-hand-holding-usd text-green-500';
        if (text.toLowerCase().includes('avaliação')) return 'fas fa-star text-yellow-500';
        if (text.toLowerCase().includes('mensagem')) return 'fas fa-comment text-blue-500';
        return 'fas fa-info-circle text-gray-500';
    };

    return (
        <div className={`p-4 flex items-start gap-4 border-b ${!notification.read ? 'bg-blue-50' : 'bg-white'}`}>
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                <i className={getIcon(notification.text)}></i>
            </div>
            <div className="flex-grow">
                <p className="text-gray-800">{notification.text}</p>
                <span className="text-xs text-gray-500">{new Date(notification.date).toLocaleString('pt-BR')}</span>
            </div>
            {!notification.read && (
                <div className="w-2.5 h-2.5 rounded-full bg-blue-500 self-center flex-shrink-0"></div>
            )}
        </div>
    );
}

const NotificationsPage: React.FC = () => {
    const { state } = useAppContext();
    const { currentUser } = state;

    const notifications = currentUser?.notifications || [];

    return (
        <div className="container mx-auto px-4 py-8 animate-fade-in">
            <div className="max-w-3xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-800 mb-6">Notificações</h1>
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    {notifications.length > 0 ? (
                        notifications
                            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                            .map(notif => <NotificationItem key={notif.id} notification={notif} />)
                    ) : (
                        <div className="text-center p-12">
                            <i className="fas fa-bell-slash text-5xl text-gray-300 mb-4"></i>
                            <h3 className="text-xl font-semibold text-gray-700">Nenhuma notificação por aqui</h3>
                            <p className="text-gray-500 mt-2">
                                Suas atualizações e alertas importantes aparecerão aqui.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default NotificationsPage;