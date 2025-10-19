import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { getMyClientOrders, getMyProviderOrders } from '../ineed-backend/src/routes/apiService'; // Adjust path
import { User, UserOrder } from '../../ineed-backend/src/types'; // Adjust path

const ProfilePage: React.FC = () => {
  const { state, handleUpdateUser } = useAppContext();
  const { currentUser } = state;

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<User>>({
    name: currentUser?.name || '',
    bio: currentUser?.bio || '',
    locationText: currentUser?.locationText || '',
  });

  const [activeTab, setActiveTab] = useState('client');
  const [clientOrders, setClientOrders] = useState<UserOrder[]>([]);
  const [providerOrders, setProviderOrders] = useState<UserOrder[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);

  useEffect(() => {
    const fetchClientOrders = async () => {
      setIsLoadingOrders(true);
      try {
        const orders = await getMyClientOrders();
        setClientOrders(orders);
      } catch (error) {
        console.error("Failed to fetch client orders:", error);
      } finally {
        setIsLoadingOrders(false);
      }
    };

    const fetchProviderOrders = async () => {
      setIsLoadingOrders(true);
      try {
        const orders = await getMyProviderOrders();
        setProviderOrders(orders);
      } catch (error) {
        console.error("Failed to fetch provider orders:", error);
      } finally {
        setIsLoadingOrders(false);
      }
    };

    if (activeTab === 'client') {
      fetchClientOrders();
    } else if (activeTab === 'provider') {
      fetchProviderOrders();
    }
  }, [activeTab]);

  if (!currentUser) {
    return <div className="container mx-auto p-8 text-center">Carregando perfil...</div>;
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await handleUpdateUser(formData);
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update profile:", error);
      alert("Erro ao atualizar o perfil.");
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Profile Header */}
        <div className="p-6 md:p-8 border-b">
          <div className="flex flex-col md:flex-row items-center">
            <img
              src={currentUser.avatarUrl || 'https://i.pravatar.cc/150'}
              alt={currentUser.name}
              className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md mb-4 md:mb-0 md:mr-6"
            />
            <div className="flex-grow text-center md:text-left">
              {isEditing ? (
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="text-2xl font-bold text-gray-800 border-b-2 w-full"
                />
              ) : (
                <h1 className="text-2xl font-bold text-gray-800">{currentUser.name}</h1>
              )}
              <p className="text-sm text-gray-500">@{currentUser.username}</p>
              <div className="flex items-center justify-center md:justify-start mt-2">
                <div className="flex items-center text-yellow-500">
                  <i className="fas fa-star"></i>
                  <span className="ml-1 font-bold">{currentUser.avgRating?.toFixed(1) || 'N/A'}</span>
                </div>
                <span className="text-gray-500 text-sm ml-2">({currentUser.ratingCount} avaliações)</span>
              </div>
            </div>
            <div className="mt-4 md:mt-0">
              {isEditing ? (
                <div className="flex gap-2">
                  <button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm">Salvar</button>
                  <button onClick={() => setIsEditing(false)} className="px-4 py-2 bg-gray-200 rounded-lg text-sm">Cancelar</button>
                </div>
              ) : (
                <button onClick={() => setIsEditing(true)} className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-100">
                  <i className="fas fa-pencil-alt mr-2"></i>Editar Perfil
                </button>
              )}
            </div>
          </div>
          <div className="mt-6">
            {isEditing ? (
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                className="text-gray-600 border-b-2 w-full"
                rows={3}
              />
            ) : (
              <p className="text-gray-600">{currentUser.bio || 'Nenhuma biografia adicionada.'}</p>
            )}
          </div>
        </div>

        {/* Tabs for Activity */}
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button onClick={() => setActiveTab('client')} className={`py-4 px-6 font-medium text-sm ${activeTab === 'client' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}>
              Meus Pedidos
            </button>
            <button onClick={() => setActiveTab('provider')} className={`py-4 px-6 font-medium text-sm ${activeTab === 'provider' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}>
              Trabalhos
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'client' && (
            <div>
              <h3 className="font-bold mb-4">Pedidos que você criou</h3>
              {isLoadingOrders ? <p>Carregando...</p> : (
                <div className="space-y-4">
                  {clientOrders.length > 0 ? clientOrders.map(order => (
                    <div key={order.id} className="p-4 border rounded-lg flex justify-between items-center">
                      <div>
                        <p className="font-semibold">{order.request.title}</p>
                        <p className="text-sm text-gray-500">Status: {order.status}</p>
                      </div>
                      <span className="text-sm bg-gray-100 px-2 py-1 rounded">{order._count.offers} ofertas</span>
                    </div>
                  )) : <p>Você ainda não criou nenhum pedido.</p>}
                </div>
              )}
            </div>
          )}
          {activeTab === 'provider' && (
            <div>
              <h3 className="font-bold mb-4">Trabalhos que você está atendendo</h3>
              {isLoadingOrders ? <p>Carregando...</p> : (
                <div className="space-y-4">
                  {providerOrders.length > 0 ? providerOrders.map(order => (
                    <div key={order.id} className="p-4 border rounded-lg flex justify-between items-center">
                      <div>
                        <p className="font-semibold">{order.request.title}</p>
                        <p className="text-sm text-gray-500">Status: {order.status}</p>
                      </div>
                      {/* You can add more details here, like the client's name or final value */}
                    </div>
                  )) : <p>Você ainda não está atendendo nenhum pedido.</p>}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;