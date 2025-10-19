import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { CATEGORIES } from '../constants';
import { checkRequestContent } from '../services/apiService';
import type { Request, Location } from '../types';
import { useAppContext } from '../context/AppContext';

const GOOGLE_MAPS_API_KEY = 'AIzaSyCsnjI2bO4OorGwsGgBSsjW4rY_pLmuKB8';

const getPrivacyOffsetLocation = (location: Location, radiusInMeters: number): Location => {
    const radiusInDegrees = radiusInMeters / 111320; // Rough conversion
    const u = Math.random();
    const v = Math.random();
    const w = radiusInDegrees * Math.sqrt(u);
    const t = 2 * Math.PI * v;
    const x = w * Math.cos(t);
    const y = w * Math.sin(t);
    // Adjust for Earth's curvature
    const new_x = x / Math.cos(location.lat * (Math.PI / 180));
    return { lat: location.lat + y, lng: location.lng + new_x };
};

interface CreateRequestModalProps {
    requestToEdit?: Request | null;
}

const CreateRequestModal: React.FC<CreateRequestModalProps> = ({ requestToEdit }) => {
  const { state, dispatch, handleCreateRequest, handleUpdateRequest } = useAppContext();
  const { currentUser } = state;
  
  const isEditMode = !!requestToEdit;

  const [requestType, setRequestType] = useState<'service' | 'product'>('service');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [budget, setBudget] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  
  // Location State
  const [address, setAddress] = useState(currentUser?.location || 'São Paulo, SP');
  const [cep, setCep] = useState('');
  const [locationCoords, setLocationCoords] = useState<Location | null>(currentUser?.serviceArea.center || null);
  const [isGeocoding, setIsGeocoding] = useState(false);

  // UI State
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const onClose = () => dispatch({ type: 'CLOSE_CREATE_REQUEST_MODAL' });

  // Populate form if in edit mode
  useEffect(() => {
    if (isEditMode && requestToEdit) {
      setRequestType(requestToEdit.type);
      setTitle(requestToEdit.title);
      setDescription(requestToEdit.description);
      setCategory(requestToEdit.categoryId);
      setBudget(requestToEdit.budget || '');
      setPhotos(requestToEdit.photos || []);
      setLocationCoords(requestToEdit.location);
      setAddress('Localização original do pedido');
    }
  }, [requestToEdit, isEditMode]);


  const filteredCategories = useMemo(() => {
    return CATEGORIES.filter(c => c.type === requestType);
  }, [requestType]);

  // Set default category when type changes
  useEffect(() => {
    if (isEditMode) return;
    if (filteredCategories.length > 0) {
        setCategory(filteredCategories[0].id);
    } else {
        setCategory('');
    }
  }, [filteredCategories, isEditMode]);
  
  const handleBudgetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const MAX_BUDGET = 1000000000;
    const valueAsString = e.target.value;

    if (valueAsString === '') {
        setBudget('');
        return;
    }
    const numericValue = parseFloat(valueAsString);
    if (isNaN(numericValue)) return; // Prevents non-numeric input

    if (numericValue > MAX_BUDGET) {
        setBudget(MAX_BUDGET.toString());
    } else {
        setBudget(valueAsString);
    }
  };

  const handlePhotoUpload = (files: FileList) => {
    const fileArray = Array.from(files);
    fileArray.forEach(file => {
      if (photos.length >= 5) return;
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotos(prevPhotos => [...prevPhotos, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handlePhotoUpload(e.target.files);
    }
  };

  const removePhoto = (index: number) => {
    setPhotos(prevPhotos => prevPhotos.filter((_, i) => i !== index));
  };

  const handleDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const handleDragLeave = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };
  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setIsDragging(false);
    handlePhotoUpload(e.dataTransfer.files);
  };

  const geocodeAddress = useCallback(async (addressToGeocode: string) => {
    if (!addressToGeocode.trim() || !GOOGLE_MAPS_API_KEY) {
        setLocationCoords(null);
        return;
    }
    setIsGeocoding(true);
    try {
        const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(addressToGeocode)}&key=${GOOGLE_MAPS_API_KEY}`);
        const data = await response.json();
        if (data.status === 'OK' && data.results.length > 0) {
            setLocationCoords(data.results[0].geometry.location);
        } else {
            console.error('Geocoding failed:', data.status);
            setLocationCoords(null);
        }
    } catch (err) {
        console.error("Error geocoding address:", err);
        setLocationCoords(null);
    } finally {
        setIsGeocoding(false);
    }
  }, []);
  
  const handleCepChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedCep = e.target.value.replace(/\D/g, '').replace(/(\d{5})(\d)/, '$1-$2').substring(0, 9);
    setCep(formattedCep);
  };
  
  const geocodeCep = async () => {
    const cleanedCep = cep.replace(/\D/g, '');
    if (cleanedCep.length !== 8) return;
    setIsGeocoding(true);
    setLocationCoords(null);
    try {
        const response = await fetch(`https://viacep.com.br/ws/${cleanedCep}/json/`);
        const data = await response.json();
        if (!data.erro) {
            const fullAddress = `${data.logouro}, ${data.bairro}, ${data.localidade} - ${data.uf}`;
            setAddress(fullAddress);
            await geocodeAddress(fullAddress);
        } else {
            alert('CEP não encontrado.');
            setIsGeocoding(false);
        }
    } catch (error) {
        console.error("Failed to fetch address from CEP", error);
        alert('Falha ao buscar endereço do CEP.');
        setIsGeocoding(false);
    }
  };


  const handleUseCurrentLocation = () => {
      if (navigator.geolocation) {
          setIsGeocoding(true);
          setLocationCoords(null);
          navigator.geolocation.getCurrentPosition(
              (position) => {
                  const currentLocation = { lat: position.coords.latitude, lng: position.coords.longitude };
                  const privateLocation = getPrivacyOffsetLocation(currentLocation, 300);
                  setLocationCoords(privateLocation);
                  setAddress("Localização Atual (com privacidade)");
                  setCep('');
                  setIsGeocoding(false);
              },
              (error) => {
                  console.error("Geolocation error:", error);
                  alert("Não foi possível obter sua localização. Verifique as permissões do seu navegador.");
                  setIsGeocoding(false);
              }
          );
      } else {
          alert("Geolocalização não é suportada por este navegador.");
      }
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (!title.trim() || !description.trim() || !category || !currentUser) {
        setError('Título, descrição e categoria são obrigatórios.');
        setIsLoading(false);
        return;
    }
    
    if (!locationCoords) {
        setError('A localização do pedido é obrigatória. Use sua localização atual ou busque por CEP.');
        setIsLoading(false);
        return;
    }

    try {
      const moderationResult = await checkRequestContent(description);
      if (moderationResult.isInappropriate) {
        setError(`Pedido bloqueado: ${moderationResult.reason}`);
        setIsLoading(false);
        return;
      }

      if (isEditMode && requestToEdit) {
          const updatedRequest: Request = {
              ...requestToEdit,
              title, description,
              categoryId: category,
              type: requestType,
              location: locationCoords,
              budget: budget || undefined,
              photos: photos.length > 0 ? photos : undefined,
          };
          await handleUpdateRequest(updatedRequest);
      } else {
          const newRequestData = {
              title, description,
              categoryId: category,
              type: requestType,
              location: locationCoords,
              budget: budget || undefined,
              photos: photos.length > 0 ? photos : undefined,
          };
          await handleCreateRequest(newRequestData);
      }

    } catch (apiError: any) {
      console.error('Error during request submission:', apiError);
      setError(apiError.message || 'Não foi possível salvar o pedido. Tente novamente mais tarde.');
    } finally {
      setIsLoading(false);
    }
  };

  const formInputStyle = "w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-blue-50 border-blue-200 text-gray-800 placeholder-gray-400 transition-colors";
  const formLabelStyle = "block text-gray-700 mb-2 font-semibold";

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl relative max-h-[90vh] flex flex-col">
        <div className="p-6 border-b">
            <h2 className="text-2xl font-bold text-gray-800">{isEditMode ? 'Editar Pedido' : 'Criar Novo Pedido'}</h2>
            <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 text-2xl">&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="overflow-y-auto">
            <div className="p-8 space-y-5">
                <div>
                    <label className={formLabelStyle}>Tipo de Pedido</label>
                    <div className="flex space-x-4">
                        <label className="inline-flex items-center">
                            <input type="radio" name="requestType" value="service" checked={requestType === 'service'} onChange={() => setRequestType('service')} className="form-radio h-4 w-4 text-blue-600"/>
                            <span className="ml-2">Serviço</span>
                        </label>
                         <label className="inline-flex items-center">
                            <input type="radio" name="requestType" value="product" checked={requestType === 'product'} onChange={() => setRequestType('product')} className="form-radio h-4 w-4 text-blue-600"/>
                            <span className="ml-2">Produto</span>
                        </label>
                    </div>
                </div>

                <div>
                    <label htmlFor="title" className={formLabelStyle}>Título do Pedido</label>
                    <input id="title" type="text" value={title} onChange={(e) => setTitle(e.target.value)} className={formInputStyle} placeholder="Ex: Preciso de um notebook para trabalho" required/>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="category" className={formLabelStyle}>Subcategoria</label>
                        <select id="category" value={category} onChange={(e) => setCategory(e.target.value)} className={formInputStyle}>
                            {filteredCategories.map(cat => ( <option key={cat.id} value={cat.id}>{cat.name}</option>))}
                        </select>
                    </div>
                     <div>
                        <label htmlFor="budget" className={formLabelStyle}>Orçamento (Opcional)</label>
                        <div className="relative">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-500">R$</span>
                            <input 
                                id="budget" 
                                type="number"
                                value={budget}
                                onChange={handleBudgetChange}
                                className={`${formInputStyle} pl-10`}
                                placeholder="Ex: 250,50"
                                min="0.01"
                                max="1000000000"
                                step="0.01"
                            />
                        </div>
                    </div>
                </div>

                <div>
                    <label className={formLabelStyle}>Localização do Pedido</label>
                    <div className="space-y-3 p-4 bg-gray-50 rounded-lg border">
                        <button type="button" onClick={handleUseCurrentLocation} disabled={isGeocoding} className="w-full px-4 py-2 border border-blue-500 text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition text-sm flex items-center justify-center">
                            {isGeocoding ? <i className="fas fa-spinner fa-spin mr-2"></i> : <i className="fas fa-location-arrow mr-2"></i>}
                            Usar minha localização atual (com privacidade)
                        </button>
                        <div className="flex items-center">
                            <div className="flex-grow border-t border-gray-300"></div><span className="mx-4 text-gray-500 text-sm">ou</span><div className="flex-grow border-t border-gray-300"></div>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2">
                            <input id="cep" type="text" value={cep} onChange={handleCepChange} className={formInputStyle} placeholder="Insira um CEP brasileiro"/>
                            <button type="button" onClick={geocodeCep} disabled={isGeocoding || cep.replace(/\D/g, '').length !== 8} className="px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition text-sm flex-shrink-0 disabled:opacity-50">
                                Buscar por CEP
                            </button>
                        </div>
                        {locationCoords && <p className="text-xs text-green-600 mt-1"><i className="fas fa-check-circle mr-1"></i> Localização definida com sucesso!</p>}
                    </div>
                </div>


                <div>
                    <label htmlFor="description" className={formLabelStyle}>Descrição Detalhada</label>
                    <textarea id="description" rows={4} value={description} onChange={(e) => setDescription(e.target.value)} className={formInputStyle} placeholder="Descreva com detalhes o que você precisa..." required></textarea>
                    <p className="text-xs text-gray-500 mt-1">Nossa IA verifica o conteúdo para garantir a segurança da plataforma.</p>
                </div>

                <div>
                    <label className={formLabelStyle}>Fotos (Opcional)</label>
                    <label 
                        htmlFor="photos" 
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer block transition-colors ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-500'}`}
                    >
                        <i className="fas fa-cloud-upload-alt text-3xl text-blue-500 mb-2"></i>
                        <p className="text-gray-500">Arraste e solte ou clique para selecionar</p>
                        <input type="file" id="photos" multiple accept="image/*" onChange={handleFileSelect} className="hidden" />
                    </label>
                    {photos.length > 0 && (
                        <div className="mt-4 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                            {photos.map((photo, index) => (
                                <div key={index} className="relative group">
                                    <img src={photo} alt={`Preview ${index}`} className="w-full h-20 object-cover rounded-md" />
                                    <button onClick={() => removePhoto(index)} className="absolute top-1 right-1 bg-red-500 text-white rounded-full h-5 w-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity">&times;</button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {error && (
                    <div className="p-4 rounded-lg bg-red-100 border-red-400 border" role="alert">
                        <p className="text-red-800">{error}</p>
                    </div>
                )}
            </div>
            <div className="p-6 border-t bg-gray-50 flex justify-end">
                <button type="submit" disabled={isLoading} className="gradient-bg text-white font-bold py-2 px-6 rounded-lg hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center">
                    {isLoading && (
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8
 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    )}
                    {isLoading ? 'Salvando...' : (isEditMode ? 'Salvar Alterações' : 'Publicar Pedido')}
                </button>
            </div>
        </form>
      </div>
    </div>
  );
};

export default CreateRequestModal;
