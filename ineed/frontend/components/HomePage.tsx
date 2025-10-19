import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getRequests } from '../ineed-backend/src/routes/apiService'; // Adjust path as needed
import { Request as INeedRequest } from '../../ineed-backend/src/types'; // Adjust path as needed

const HomePage: React.FC = () => {
  const [requests, setRequests] = useState<INeedRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // We need to store the user's location to reuse it for searches
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number; radius: number } | null>(null);

  const fetchRequests = async (location: { lat: number; lng: number; radius: number }, query: string = '') => {
    try {
      setIsLoading(true);
      setError(null);
      const fetchedRequests = await getRequests({ ...location, q: query });
      setRequests(fetchedRequests);
    } catch (err) {
      console.error('Failed to fetch requests:', err);
      setError('Não foi possível carregar os pedidos. Tente novamente mais tarde.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // This effect runs only once to get the initial location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            radius: 50000, // 50km
          };
          setUserLocation(location);
          fetchRequests(location); // Fetch initial requests
        },
        (error) => {
          console.warn("Error getting user location, using default.", error.message);
          const defaultLocation = { lat: -23.55052, lng: -46.633308, radius: 50000 };
          setUserLocation(defaultLocation);
          fetchRequests(defaultLocation); // Fetch initial requests with default location
        }
      );
    } else {
      console.warn("Geolocation is not supported by this browser, using default.");
      const defaultLocation = { lat: -23.55052, lng: -46.633308, radius: 50000 };
      setUserLocation(defaultLocation);
      fetchRequests(defaultLocation); // Fetch initial requests with default location
    };
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (userLocation) {
      fetchRequests(userLocation, searchQuery);
    } else {
      setError("Não foi possível determinar sua localização para realizar a busca.");
    }
  };

  const renderContent = () => {
    if (isLoading) {
      return <p className="col-span-full text-center text-gray-500">Carregando pedidos...</p>;
    }

    if (error) {
      return <p className="col-span-full text-center text-red-500">{error}</p>;
    }

    if (requests.length === 0) {
      return <p className="col-span-full text-center text-gray-500">Nenhum pedido encontrado na sua área.</p>;
    }

    return requests.map(pedido => (
      <div key={pedido.id} className="bg-white rounded-lg shadow-md overflow-hidden transition duration-300 hover:shadow-xl">
        <div className="p-4">
          <div className="flex justify-between items-start mb-2">
            <span className="bg-blue-100 text-blue-600 text-xs font-medium px-2.5 py-0.5 rounded">{pedido.categoryId || 'Geral'}</span>
            <span className="text-gray-500 text-sm">{new Date(pedido.createdAt).toLocaleDateString('pt-BR')}</span>
          </div>
          <h4 className="text-lg font-bold mb-2 text-gray-800 truncate">{pedido.title}</h4>
          <p className="text-gray-600 mb-4 h-16 overflow-hidden text-ellipsis">{pedido.description}</p>
          <div className="flex items-center mb-3">
            <p className="font-medium text-sm">Criado por: {pedido.userName || 'Anônimo'}</p>
          </div>
          <div className="flex justify-between items-center">
            <Link to={`/requests/${pedido.id}`} className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-full text-sm transition duration-300 w-full text-center">
              <i className="fas fa-eye mr-1"></i> Ver Detalhes
            </Link>
          </div>
        </div>
      </div>
    ));
  };

  return (
    <section id="products" className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Pedidos Próximos a Você</h2>
          <form onSubmit={handleSearch} className="max-w-lg mx-auto">
            <div className="flex items-center border-2 border-gray-200 rounded-full p-1 bg-white shadow-sm">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="O que você precisa?"
                className="w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none bg-transparent"
              />
              <button type="submit" className="bg-blue-600 text-white rounded-full p-2 hover:bg-blue-700 focus:outline-none">
                <i className="fas fa-search"></i>
              </button>
            </div>
          </form>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {renderContent()}
        </div>
      </div>
    </section>
  );
};

export default HomePage;