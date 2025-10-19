import React from 'react';
import { Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';

const Header: React.FC = () => {
  const { state, dispatch } = useAppContext();
  const { isAuthenticated, currentUser } = state;

  const handleLogout = () => {
    dispatch({ type: 'LOGOUT' });
    // Optionally, redirect to home page
    // window.location.href = '/';
  };

  return (
    <header className="bg-white shadow-md sticky top-0 z-40">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/" className="flex items-center space-x-2">
          <svg className="w-8 h-8 text-blue-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512">
            <path fill="currentColor" d="M480 96c0-35.3-28.7-64-64-64s-64 28.7-64 64s28.7 64 64 64s64-28.7 64-64zM320 288c0-12.9-6.3-24.5-16.8-31.9l-1.8-1.3c-8.9-6.4-17.6-13.3-26-20.6c-21.3-18.6-45.4-38.3-70.3-59.5C189.9 161.2 169 152.1 146.1 152c-2.3 0-4.6 .1-6.9 .2c-38.8 2.2-68.5 34.6-68.5 73.8V352c0 17.7 14.3 32 32 32s32-14.3 32-32V240.2c0-4.2 3.4-7.6 7.6-7.6c1.1 0 2.2 .2 3.2 .6c16.3 5.3 36.3 17.2 56.4 31.9c25.4 18.5 52.3 39.8 79.2 60.3c2.5 1.9 5.2 3.7 7.9 5.5c1.4 .9 2.7 1.8 4.1 2.7c16.3 11.2 36.3 17.2 56.4 17.2c61.9 0 112-50.1 112-112s-50.1-112-112-112zm-8.2 128c-11.8 0-23.4-2.2-34.3-6.4c-4.9-1.9-8.2-6.9-6.4-11.8c1.9-4.9 6.9-8.2 11.8-6.4c8.4 3.2 17.3 4.9 26.2 4.9c26.5 0 48-21.5 48-48s-21.5-48-48-48s-48 21.5-48 48c0 1.9 .1 3.7 .4 5.5c2.1 13.7-4.1 27.5-16.3 34.9c-15.1 9.2-34.3 6.9-47.3-5.9c-2-1.9-4-3.9-5.9-5.9c-25.9-20.9-53.5-42.7-79.6-61.7c-17.4-12.6-35.3-23.2-52.2-30.9c-2.8-1.2-5.9-1.8-8.9-1.8c-17.7 0-32-14.3-32-32s14.3-32 32-32c2.8 0 5.6 .3 8.3 .9c32.4 6.8 57.8 20.3 81.3 37.8c25.2 18.7 49.6 38.6 71.3 57.6c8.5 7.4 17.1 14.2 25.7 20.7l1.8 1.3c15.2 9.4 32.2 14.6 49.5 14.6c39.8 0 72 32.2 72 72s-32.2 72-72 72z" />
          </svg>
          <span className="font-bold text-xl text-gray-800">iNeed</span>
        </Link>
        <nav className="flex items-center space-x-4">
          {isAuthenticated && currentUser ? (
            <>
              <Link to="/notifications" className="text-gray-600 hover:text-blue-500">
                <i className="fas fa-bell"></i>
              </Link>
              <div className="relative group">
                <button className="flex items-center space-x-2">
                  <img
                    src={currentUser.avatarUrl || 'https://i.pravatar.cc/150'}
                    alt={currentUser.name}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <span className="hidden md:inline text-gray-700 font-medium">{currentUser.name}</span>
                  <i className="fas fa-chevron-down text-xs text-gray-500"></i>
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 hidden group-hover:block">
                  <Link to="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Meu Perfil</Link>
                  <Link to="/messages" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Mensagens</Link>
                  <div className="border-t border-gray-100 my-1"></div>
                  <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100">
                    Sair
                  </button>
                </div>
              </div>
            </>
          ) : (
            <>
              <button onClick={() => dispatch({ type: 'OPEN_LOGIN_MODAL' })} className="text-gray-600 font-medium hover:text-blue-500">
                Entrar
              </button>
              <button onClick={() => dispatch({ type: 'OPEN_REGISTER_MODAL' })} className="bg-blue-600 text-white px-4 py-2 rounded-full font-semibold hover:bg-blue-700 transition">
                Cadastrar
              </button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;