import React, { useEffect, useRef, useState } from 'react';
import { CATEGORIES } from '../constants';
import type { Request, Location } from '../types';

// Fix: Add a global window declaration for `window.google` to fix TypeScript errors.
declare global {
    interface Window {
        google: any;
    }
}

// --- Google Map Configuration ---
const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
const MAP_CENTER = { lat: -23.55052, lng: -46.633308 }; // São Paulo
const MAP_ZOOM = 13;

// A minimal, clean map style from Snazzy Maps (Silver)
const mapStyles = [
    {"elementType":"geometry","stylers":[{"color":"#f5f5f5"}]},{"elementType":"labels.icon","stylers":[{"visibility":"off"}]},{"elementType":"labels.text.fill","stylers":[{"color":"#616161"}]},{"elementType":"labels.text.stroke","stylers":[{"color":"#f5f5f5"}]},{"featureType":"administrative.land_parcel","elementType":"labels.text.fill","stylers":[{"color":"#bdbdbd"}]},{"featureType":"poi","elementType":"geometry","stylers":[{"color":"#eeeeee"}]},{"featureType":"poi","elementType":"labels.text.fill","stylers":[{"color":"#757575"}]},{"featureType":"poi.park","elementType":"geometry","stylers":[{"color":"#e5e5e5"}]},{"featureType":"poi.park","elementType":"labels.text.fill","stylers":[{"color":"#9e9e9e"}]},{"featureType":"road","elementType":"geometry","stylers":[{"color":"#ffffff"}]},{"featureType":"road.arterial","elementType":"labels.text.fill","stylers":[{"color":"#757575"}]},{"featureType":"road.highway","elementType":"geometry","stylers":[{"color":"#dadada"}]},{"featureType":"road.highway","elementType":"labels.text.fill","stylers":[{"color":"#616161"}]},{"featureType":"road.local","elementType":"labels.text.fill","stylers":[{"color":"#9e9e9e"}]},{"featureType":"transit.line","elementType":"geometry","stylers":[{"color":"#e5e5e5"}]},{"featureType":"transit.station","elementType":"geometry","stylers":[{"color":"#eeeeee"}]},{"featureType":"water","elementType":"geometry","stylers":[{"color":"#c9c9c9"}]},{"featureType":"water","elementType":"labels.text.fill","stylers":[{"color":"#9e9e9e"}]}
];

// Helper to convert Tailwind color names to RGB values for rgba()
const colorMap: { [key: string]: string } = {
    'blue-500': '59, 130, 246', 'green-500': '34, 197, 94', 'purple-500': '139, 92, 246', 'orange-500': '249, 115, 22', 'red-500': '239, 68, 68', 'yellow-500': '234, 179, 8', 'sky-500': '14, 165, 233', 'gray-600': '75, 85, 99', 'indigo-500': '99, 102, 241', 'slate-500': '100, 116, 139', 'teal-500': '20, 184, 166', 'amber-600': '217, 119, 6', 'fuchsia-500': '217, 70, 239', 'emerald-500': '16, 185, 129', 'cyan-500': '6, 182, 212', 'lime-500': '132, 204, 22', 'orange-600': '234, 88, 12', 'pink-500': '236, 72, 153', 'zinc-700': '63, 63, 70', 'amber-500': '245, 158, 11', 'rose-400': '251, 113, 133', 'stone-500': '120, 113, 108', 'rose-500': '244, 63, 94', 'teal-700': '15, 118, 110', 'violet-600': '124, 58, 237',
};

function getCategoryColor(categoryId: string): string {
    const category = CATEGORIES.find(c => c.id === categoryId);
    const colorKey = category ? category.color.replace('bg-', '') : 'gray-600';
    return colorMap[colorKey] || colorMap['gray-600'];
}

interface InteractiveMapProps {
    requests?: Request[];
    onMarkerClick?: (request: Request) => void;
    serviceArea?: {
        center: Location;
        radius: number;
    };
    isEditable?: boolean;
    onServiceAreaChange?: (center: Location, radius: number) => void;
    mapCenter?: Location | null;
}

const InteractiveMap: React.FC<InteractiveMapProps> = ({ requests, onMarkerClick, serviceArea, isEditable = false, onServiceAreaChange, mapCenter }) => {
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<any>(null); // To hold the map instance
    const [isApiLoaded, setApiLoaded] = useState(false);

    useEffect(() => {
        const loadScript = () => {
            if (window.google?.maps) {
                setApiLoaded(true);
                return;
            }
            if (document.getElementById('google-maps-script')) return;

            const script = document.createElement('script');
            script.id = 'google-maps-script';
            script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}`;
            script.async = true;
            script.defer = true;
            script.onload = () => setApiLoaded(true);
            script.onerror = () => console.error("Google Maps script failed to load.");
            document.head.appendChild(script);
        };
        
        if (GOOGLE_MAPS_API_KEY) {
            loadScript();
        }
    }, []);

    useEffect(() => {
        if (isApiLoaded && mapRef.current && window.google) {
            const map = new window.google.maps.Map(mapRef.current, {
                center: mapCenter || serviceArea?.center || MAP_CENTER,
                zoom: serviceArea ? 9 : MAP_ZOOM,
                styles: mapStyles,
                disableDefaultUI: true,
                zoomControl: false, // Explicitly disable default controls
            });
            mapInstanceRef.current = map;

            if (serviceArea) {
                 const circle = new window.google.maps.Circle({
                    strokeColor: '#0083b0',
                    strokeOpacity: 0.8,
                    strokeWeight: 2,
                    fillColor: '#00b4db',
                    fillOpacity: 0.25,
                    map,
                    center: serviceArea.center,
                    radius: serviceArea.radius,
                    editable: isEditable,
                    draggable: isEditable,
                });

                if(isEditable && onServiceAreaChange) {
                    circle.addListener('radius_changed', () => {
                        onServiceAreaChange(circle.getCenter().toJSON(), circle.getRadius());
                    });
                    circle.addListener('center_changed', () => {
                        onServiceAreaChange(circle.getCenter().toJSON(), circle.getRadius());
                    });
                }

            } else if (requests && onMarkerClick) {
                requests.forEach(request => {
                    const colorRgb = getCategoryColor(request.categoryId);
                    const circle = new window.google.maps.Circle({
                        strokeColor: `rgb(${colorRgb})`,
                        strokeOpacity: 0.8,
                        strokeWeight: 1,
                        fillColor: `rgba(${colorRgb}, 0.4)`,
                        fillOpacity: 0.4,
                        map,
                        center: request.location,
                        radius: 300, // 300 meters radius
                        clickable: true,
                    });
    
                    circle.addListener('click', () => {
                        onMarkerClick(request);
                    });
                });
            }
        }
    }, [isApiLoaded, requests, onMarkerClick, serviceArea, isEditable, onServiceAreaChange]);
    
    useEffect(() => {
        if (mapInstanceRef.current && mapCenter) {
            mapInstanceRef.current.panTo(mapCenter);
            mapInstanceRef.current.setZoom(14);
        }
    }, [mapCenter]);

    const handleZoomIn = () => {
        if (mapInstanceRef.current) {
            const currentZoom = mapInstanceRef.current.getZoom();
            mapInstanceRef.current.setZoom(currentZoom + 1);
        }
    };
    
    const handleZoomOut = () => {
        if (mapInstanceRef.current) {
            const currentZoom = mapInstanceRef.current.getZoom();
            mapInstanceRef.current.setZoom(currentZoom - 1);
        }
    };

    if (!GOOGLE_MAPS_API_KEY) {
        return (
            <div className="w-full h-96 bg-gray-200 rounded-lg flex items-center justify-center text-center p-4">
                <div className="text-red-600">
                    <i className="fas fa-exclamation-triangle fa-2x mb-2"></i>
                    <h3 className="font-semibold">Erro de Configuração do Mapa</h3>
                    <p className="text-sm text-gray-700">A chave da API do Google Maps não foi configurada.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="relative">
            <div ref={mapRef} className="w-full h-96 bg-gray-200 rounded-lg shadow-lg" />
            <div className="absolute bottom-4 right-4 flex flex-col space-y-2">
                <button
                    onClick={handleZoomIn}
                    className="bg-white w-10 h-10 rounded-full shadow-lg flex items-center justify-center text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    aria-label="Aumentar zoom"
                >
                    <i className="fas fa-plus"></i>
                </button>
                <button
                    onClick={handleZoomOut}
                    className="bg-white w-10 h-10 rounded-full shadow-lg flex items-center justify-center text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    aria-label="Diminuir zoom"
                >
                    <i className="fas fa-minus"></i>
                </button>
            </div>
        </div>
    );
};

export default InteractiveMap;