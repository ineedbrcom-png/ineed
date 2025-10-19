import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useAppContext } from '../context/AppContext';
import { CATEGORIES } from '../constants';
import type { Request, Location, Category } from '../types';
import ExploreRequestCard from './ExploreRequestCard';

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

// Haversine formula to calculate distance
const getDistance = (loc1: Location, loc2: Location) => {
    const R = 6371; // Radius of the Earth in km
    const dLat = (loc2.lat - loc1.lat) * (Math.PI / 180);
    const dLng = (loc2.lng - loc1.lng) * (Math.PI / 180);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(loc1.lat * (Math.PI / 180)) * Math.cos(loc2.lat * (Math.PI / 180)) *
        Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
};

const parseBudget = (budgetStr?: string): number => {
    if (!budgetStr) return Infinity;
    const value = parseFloat(String(budgetStr).replace(',', '.'));
    return isNaN(value) ? Infinity : value;
};

const FilterPanel: React.FC<{
    mainCategoryFilter: 'all' | 'service' | 'product';
    subCategoryFilter: string;
    distanceFilter: number;
    priceFilter: number | null;
    locationSearch: string;
    isGeocoding: boolean;
    onMainCategoryChange: (c: 'all' | 'service' | 'product') => void;
    onSubCategoryChange: (c: string) => void;
    onDistanceChange: (d: number) => void;
    onPriceChange: (valueAsString: string) => void;
    onLocationChange: (l: string) => void;
    onGeocode: () => void;
    onUseCurrentLocation: () => void;
}> = ({
    mainCategoryFilter, subCategoryFilter, distanceFilter, priceFilter, locationSearch, isGeocoding,
    onMainCategoryChange, onSubCategoryChange, onDistanceChange, onPriceChange,
    onLocationChange, onGeocode, onUseCurrentLocation
}) => {
    
    const availableSubcategories = useMemo(() => {
        if (mainCategoryFilter === 'all') return CATEGORIES;
        return CATEGORIES.filter(c => c.type === mainCategoryFilter);
    }, [mainCategoryFilter]);
    
    return (
        <div className="bg-white rounded-lg shadow-lg p-6 space-y-6">
            <h3 className="text-xl font-bold text-gray-800">Filtros</h3>
            
            {/* Location */}
            <div>
                <label className="font-semibold text-gray-700 block mb-2">Localização</label>
                <div className="flex gap-2 mb-2">
                    <input type="text" placeholder="CEP ou Endereço" value={locationSearch} onChange={e => onLocationChange(e.target.value)} className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    <button onClick={onGeocode} disabled={isGeocoding} className="px-3 bg-blue-500 text-white rounded-md disabled:opacity-50 flex items-center justify-center w-12">
                        {isGeocoding ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-search"></i>}
                    </button>
                </div>
                <button onClick={onUseCurrentLocation} disabled={isGeocoding} className="text-sm text-blue-600 hover:underline w-full text-left">
                    <i className="fas fa-location-arrow mr-1"></i> Usar minha localização atual
                </button>
            </div>
            
            {/* Distance */}
            <div>
                <label htmlFor="distance" className="font-semibold text-gray-700 block mb-2">Distância</label>
                <input id="distance" type="range" min="1" max="100" value={distanceFilter} onChange={e => onDistanceChange(Number(e.target.value))} className="w-full" />
                <div className="text-sm text-gray-600 text-center">{distanceFilter} km</div>
            </div>

            {/* Price */}
            <div>
                <label htmlFor="price" className="font-semibold text-gray-700 block mb-2">Orçamento Máximo</label>
                <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">R$</span>
                    <input 
                        id="price" 
                        type="text"
                        placeholder="Sem limite"
                        value={priceFilter === null ? '' : String(priceFilter).replace('.', ',')}
                        onChange={e => onPriceChange(e.target.value)}
                        className="w-full border rounded-md pl-8 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
            </div>

            {/* Main Category */}
            <div>
                <label className="font-semibold text-gray-700 block mb-2">Categoria Principal</label>
                 <div className="flex bg-gray-100 rounded-lg p-1">
                    {(['all', 'service', 'product'] as const).map(cat => (
                        <button
                            key={cat}
                            onClick={() => onMainCategoryChange(cat)}
                            className={`flex-1 text-sm py-1.5 rounded-md transition-colors font-semibold ${mainCategoryFilter === cat ? 'bg-white text-blue-600 shadow' : 'text-gray-600 hover:bg-gray-200'}`}
                        >
                            {cat === 'all' ? 'Todos' : cat === 'service' ? 'Serviços' : 'Produtos'}
                        </button>
                    ))}
                </div>
            </div>
            
             {/* Subcategory */}
            <div>
                <label className="font-semibold text-gray-700 block mb-2">Subcategoria</label>
                <div className="max-h-48 overflow-y-auto space-y-2 pr-2">
                    <label className="flex items-center space-x-2 cursor-pointer">
                        <input type="radio" name="subcategory" value="all" checked={subCategoryFilter === 'all'} onChange={() => onSubCategoryChange('all')} className="form-radio text-blue-600"/>
                        <span className="text-gray-700">Todas as Subcategorias</span>
                    </label>
                    {availableSubcategories.map(cat => (
                         <label key={cat.id} className="flex items-center space-x-2 cursor-pointer">
                             <input type="radio" name="subcategory" value={cat.id} checked={subCategoryFilter === cat.id} onChange={() => onSubCategoryChange(cat.id)} className="form-radio text-blue-600"/>
                             <span className="text-gray-700">{cat.name}</span>
                         </label>
                    ))}
                </div>
            </div>

        </div>
    );
};


const ExplorePage: React.FC<{ initialCategoryFilter?: string | null }> = ({ initialCategoryFilter }) => {
    const { state, dispatch } = useAppContext();
    const { requests, currentUser } = state;

    // Filter States
    const [searchTerm, setSearchTerm] = useState('');
    const [mainCategoryFilter, setMainCategoryFilter] = useState<'all' | 'service' | 'product'>('all');
    const [subCategoryFilter, setSubCategoryFilter] = useState('all');
    const [sortBy, setSortBy] = useState<'newest' | 'distance'>('newest');
    const [locationSearch, setLocationSearch] = useState('');
    const [mapCenter, setMapCenter] = useState<Location | null>(currentUser?.serviceArea.center || null);
    const [isGeocoding, setIsGeocoding] = useState(false);
    const [distanceFilter, setDistanceFilter] = useState(25); // default 25km
    const [priceFilter, setPriceFilter] = useState<number | null>(null);

    const handlePriceChange = (valueAsString: string) => {
        const MAX_BUDGET = 1000000000;
        if (valueAsString === '') {
            setPriceFilter(null);
            return;
        }
        
        const cleanedValue = valueAsString.replace(/[^0-9,.]/g, '').replace(',', '.');
        let numericValue = parseFloat(cleanedValue);
        
        if (isNaN(numericValue) || numericValue < 0.01) {
             setPriceFilter(0.01);
            return;
        }

        if (numericValue > MAX_BUDGET) {
            setPriceFilter(MAX_BUDGET);
        } else {
            setPriceFilter(numericValue);
        }
    };

    useEffect(() => {
        if (initialCategoryFilter) {
            const initialCat = CATEGORIES.find(c => c.id === initialCategoryFilter);
            if(initialCat) {
                setMainCategoryFilter(initialCat.type);
                setSubCategoryFilter(initialCat.id);
            }
            dispatch({ type: 'SET_INITIAL_CATEGORY_FILTER', payload: null });
        }
    }, [initialCategoryFilter, dispatch]);

    const handleRequestClick = (request: Request) => dispatch({ type: 'OPEN_REQUEST_DETAILS', payload: request });

    const geocodeAddress = useCallback(async () => {
        if (!locationSearch.trim() || !GOOGLE_MAPS_API_KEY) return;
        setIsGeocoding(true);
        try {
            const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(locationSearch)}&key=${GOOGLE_MAPS_API_KEY}`);
            const data = await response.json();
            if (data.status === 'OK' && data.results.length > 0) {
                setMapCenter(data.results[0].geometry.location);
            } else {
                alert('Localização não encontrada.');
                setMapCenter(null);
            }
        } catch (err) {
            console.error("Error geocoding:", err);
            alert('Erro ao buscar localização.');
        } finally {
            setIsGeocoding(false);
        }
    }, [locationSearch]);

    const handleUseCurrentLocation = () => {
        if (navigator.geolocation) {
            setIsGeocoding(true);
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setMapCenter({ lat: position.coords.latitude, lng: position.coords.longitude });
                    setLocationSearch('Minha Localização Atual');
                    setIsGeocoding(false);
                },
                (error) => {
                    alert('Não foi possível obter sua localização.');
                    setIsGeocoding(false);
                }
            );
        }
    };
    
    const handleMainCategoryChange = (cat: 'all' | 'service' | 'product') => {
        setMainCategoryFilter(cat);
        setSubCategoryFilter('all');
    };

    const filteredAndSortedRequests = useMemo(() => {
        let filtered = requests || [];

        if (searchTerm) {
            filtered = filtered.filter(req =>
                req.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                req.description.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (subCategoryFilter !== 'all') {
            filtered = filtered.filter(req => req.categoryId === subCategoryFilter);
        } else if (mainCategoryFilter !== 'all') {
            filtered = filtered.filter(req => req.type === mainCategoryFilter);
        }
        
        if (priceFilter !== null) {
            filtered = filtered.filter(req => parseBudget(req.budget) <= priceFilter);
        }

        if (mapCenter) {
            filtered = filtered.filter(req => getDistance(mapCenter, req.location) <= distanceFilter);
        }
        
        return filtered;
    }, [requests, searchTerm, mainCategoryFilter, subCategoryFilter, mapCenter, distanceFilter, priceFilter]);

    return (
        <div className="container mx-auto px-4 py-8 animate-fade-in">
            <div className="text-center mb-8">
                <h1 className="text-4xl font-extrabold text-gray-800">Explore Pedidos</h1>
                <p className="text-gray-600 mt-2">Encontre oportunidades na sua comunidade.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                <div className="lg:col-span-1">
                    <div className="sticky top-24">
                        <FilterPanel
                            mainCategoryFilter={mainCategoryFilter}
                            subCategoryFilter={subCategoryFilter}
                            distanceFilter={distanceFilter}
                            priceFilter={priceFilter}
                            locationSearch={locationSearch}
                            isGeocoding={isGeocoding}
                            onMainCategoryChange={handleMainCategoryChange}
                            onSubCategoryChange={setSubCategoryFilter}
                            onDistanceChange={setDistanceFilter}
                            onPriceChange={handlePriceChange}
                            onLocationChange={setLocationSearch}
                            onGeocode={geocodeAddress}
                            onUseCurrentLocation={handleUseCurrentLocation}
                        />
                    </div>
                </div>

                <div className="lg:col-span-3">
                    <div className="mb-6 flex justify-between items-center">
                        <input
                            type="text"
                            placeholder="Buscar por palavra-chave..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full md:w-1/2 pl-4 pr-4 py-2 border rounded-full focus:ring-blue-500 focus:border-blue-500"
                        />
                         <div className="flex items-center gap-2">
                            <label htmlFor="sort" className="text-sm font-medium text-gray-700">Ordenar por:</label>
                            <select id="sort" value={sortBy} onChange={e => setSortBy(e.target.value as 'newest' | 'distance')} className="border rounded-full px-3 py-1.5 text-sm">
                                <option value="newest">Mais Recentes</option>
                                <option value="distance">Menor Distância</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                        {filteredAndSortedRequests.length > 0 ? (
                            filteredAndSortedRequests.map(request => (
                                <ExploreRequestCard key={request.id} request={request} onClick={() => handleRequestClick(request)} />
                            ))
                        ) : (
                            <div className="col-span-full text-center py-16 bg-white rounded-lg shadow-sm">
                                <i className="fas fa-search-minus text-5xl text-gray-300 mb-4"></i>
                                <h3 className="text-xl font-semibold text-gray-700">Nenhum resultado encontrado</h3>
                                <p className="text-gray-500 mt-2">Tente ajustar seus filtros de busca.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ExplorePage;