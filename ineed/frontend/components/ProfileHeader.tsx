import React, { useRef, useState } from 'react';
import type { User } from '../types';
import { StarRating } from './StarRating';

interface ProfileHeaderProps {
  user: User;
  isEditing: boolean;
  editableUser: User;
  onEnterEditMode: () => void;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onUserChange: (field: keyof User, value: any) => void;
}

const VerificationBadge: React.FC<{ label: string; icon: string; verified: boolean }> = ({ label, icon, verified }) => {
    if (!verified) return null;
    return (
        <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs sm:text-sm font-medium flex items-center">
            <i className={`${icon} mr-1.5`}></i> {label}
        </span>
    );
};

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ user, isEditing, editableUser, onEnterEditMode, onInputChange, onUserChange }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleAvatarClick = () => {
    if (isEditing) {
      fileInputRef.current?.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      setIsUploading(true);
      reader.onloadend = () => {
        onUserChange('avatarUrl', reader.result as string);
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const displayUser = isEditing ? editableUser : user;

  return (
    <section className="py-8 bg-white border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="bg-white rounded-lg overflow-hidden relative">
          <div className="p-1">
            <div className="flex flex-col md:flex-row items-center md:items-start">
              <div 
                className={`relative group flex-shrink-0 ${isEditing ? 'cursor-pointer' : ''}`}
                onClick={handleAvatarClick}
              >
                <img 
                  src={displayUser.avatarUrl} 
                  alt="Foto de Perfil" 
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border-4 border-blue-100 shadow-md"
                />
                {isEditing && (
                   <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      {isUploading ? (
                        <svg className="animate-spin h-8 w-8 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      ) : (
                        <i className="fas fa-camera text-white text-2xl"></i>
                      )}
                   </div>
                )}
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/png, image/jpeg, image/webp"
                  onChange={handleFileChange}
                />
              </div>
              
              <div className="md:ml-6 mt-4 md:mt-0 text-center md:text-left flex-grow">
                <div className="flex flex-col md:flex-row md:items-center">
                  {isEditing ? (
                    <input
                      type="text"
                      name="name"
                      value={editableUser.name}
                      onChange={onInputChange}
                      className="text-2xl sm:text-3xl font-bold text-gray-800 bg-blue-50 border-b-2 border-blue-300 focus:border-blue-500 outline-none px-2 py-1 rounded-t-md"
                    />
                  ) : (
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">{user.name}</h1>
                  )}
                  <span className="text-gray-600 ml-0 md:ml-2 text-lg">@{user.username}</span>
                </div>
                
                {isEditing ? (
                  <textarea
                    name="bio"
                    value={editableUser.bio}
                    onChange={onInputChange}
                    className="text-gray-600 mt-2 max-w-xl w-full bg-blue-50 border border-blue-300 rounded-md p-2 focus:border-blue-500 outline-none"
                    rows={2}
                  />
                ) : (
                  <p className="text-gray-600 mt-2 max-w-xl">{user.bio}</p>
                )}
                
                <div className="flex flex-wrap items-center justify-center md:justify-start mt-3 text-sm text-gray-600">
                  <span className="flex items-center mr-4">
                    <i className="fas fa-map-marker-alt mr-1.5"></i>
                    {isEditing ? (
                      <input
                        type="text"
                        name="location"
                        value={editableUser.location}
                        onChange={onInputChange}
                        className="bg-blue-50 border-b-2 border-blue-300 focus:border-blue-500 outline-none px-2 py-1 rounded-t-md"
                      />
                    ) : (
                      user.location
                    )}
                  </span>
                  <span className="flex items-center">
                    <i className="fas fa-calendar-alt mr-1.5"></i> No iNeed desde {user.memberSince}
                  </span>
                </div>
                
                <div className="flex flex-wrap gap-2 mt-4 items-center justify-center md:justify-start">
                  <VerificationBadge label="E-mail" icon="fas fa-check-circle" verified={user.verifications.email} />
                  <VerificationBadge label="Telefone" icon="fas fa-check-circle" verified={user.verifications.phone} />
                  <VerificationBadge label="Documento" icon="fas fa-shield-alt" verified={user.verifications.document} />
                   {!isEditing && (
                      <button onClick={onEnterEditMode} className="ml-2 bg-blue-50 text-blue-700 font-semibold px-4 py-1.5 rounded-lg hover:bg-blue-100 text-sm transition">
                        <i className="fas fa-pencil-alt mr-2"></i>
                        Editar Perfil
                      </button>
                    )}
                </div>
              </div>
              
              <div className="mt-6 md:mt-0 md:ml-auto flex-shrink-0 self-center md:self-start">
                <div className="bg-blue-50 rounded-lg p-4 text-center">
                  <div className="text-3xl font-bold text-blue-600">{user.rating.average.toFixed(1)}</div>
                  <StarRating rating={user.rating.average} />
                  <div className="text-sm text-gray-600 mt-1">{user.rating.count} Avaliações</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProfileHeader;