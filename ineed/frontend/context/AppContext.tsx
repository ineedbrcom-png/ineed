import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { Toaster } from 'react-hot-toast';
import { User } from '../types'; // CORREÇÃO: Caminho para os tipos compartilhados
import * as api from '../services/apiService'; // CORREÇÃO: Caminho para o seu serviço de API

// --- Tipos e Estado Inicial ---

interface AppState {
  isLoading: boolean; // Para sabermos quando a verificação inicial está acontecendo
  isAuthenticated: boolean;
  currentUser: User | null;
  token: string | null;
  socket: Socket | null; // Add socket to state
  notifications: any[]; // Vamos usar 'any' por enquanto
  isLoginModalOpen: boolean;
  isRegisterModalOpen: boolean;
  isPremiumModalOpen: boolean;
  isForgotPasswordModalOpen: boolean;
  isCreateRequestModalOpen: boolean;
}

const initialState: AppState = {
  isLoading: true, // Começa carregando
  isAuthenticated: false,
  currentUser: null,
  token: null,
  socket: null,
  notifications: [],
  isLoginModalOpen: false,
  isRegisterModalOpen: false,
  isForgotPasswordModalOpen: false,
  isPremiumModalOpen: false,
  isCreateRequestModalOpen: false,
};

type Action =
  | { type: 'LOGIN_SUCCESS'; payload: { token: string; user: User; rememberMe: boolean } }
  | { type: 'LOGOUT' }
  | { type: 'SET_SOCKET'; payload: Socket | null }
  | { type: 'INITIAL_AUTH_CHECK_COMPLETE' }
  | { type: 'SET_USER'; payload: User }
  | { type: 'NEW_NOTIFICATION'; payload: any }
  | { type: 'OPEN_LOGIN_MODAL' }
  | { type: 'CLOSE_LOGIN_MODAL' }
  | { type: 'OPEN_REGISTER_MODAL' }
  | { type: 'CLOSE_REGISTER_MODAL' }
  | { type: 'OPEN_FORGOT_PASSWORD_MODAL' }
  | { type: 'CLOSE_FORGOT_PASSWORD_MODAL' }
  | { type: 'OPEN_PREMIUM_MODAL' }
  | { type: 'CLOSE_PREMIUM_MODAL' }
  | { type: 'OPEN_CREATE_REQUEST_MODAL' }
  | { type: 'CLOSE_CREATE_REQUEST_MODAL' };

const AppReducer = (state: AppState, action: Action): AppState => {
  switch (action.type) {
    case 'LOGIN_SUCCESS':
      if (action.payload.rememberMe) {
        localStorage.setItem('authToken', action.payload.token);
        sessionStorage.removeItem('authToken');
      } else {
        sessionStorage.setItem('authToken', action.payload.token);
        localStorage.removeItem('authToken');
      }
      return { ...state, isAuthenticated: true, token: action.payload.token, currentUser: action.payload.user, isLoading: false };
    case 'LOGOUT':
      localStorage.removeItem('authToken');
      sessionStorage.removeItem('authToken');
      state.socket?.disconnect();
      return { ...initialState, isLoading: false };
    case 'SET_SOCKET':
      return { ...state, socket: action.payload };
    case 'INITIAL_AUTH_CHECK_COMPLETE':
      return { ...state, isLoading: false };
    case 'SET_USER':
      return { ...state, currentUser: action.payload };
    case 'NEW_NOTIFICATION':
      // Adiciona a nova notificação no início da lista
      return { ...state, notifications: [action.payload, ...state.notifications] };
    case 'OPEN_LOGIN_MODAL':
      return { ...state, isLoginModalOpen: true, isRegisterModalOpen: false, isForgotPasswordModalOpen: false };
    case 'CLOSE_LOGIN_MODAL':
      return { ...state, isLoginModalOpen: false };
    case 'OPEN_REGISTER_MODAL':
      return { ...state, isRegisterModalOpen: true, isLoginModalOpen: false, isForgotPasswordModalOpen: false };
    case 'CLOSE_REGISTER_MODAL':
      return { ...state, isRegisterModalOpen: false };
    case 'OPEN_FORGOT_PASSWORD_MODAL':
      return { ...state, isForgotPasswordModalOpen: true, isLoginModalOpen: false, isRegisterModalOpen: false, isCreateRequestModalOpen: false };
    case 'CLOSE_FORGOT_PASSWORD_MODAL':
      return { ...state, isForgotPasswordModalOpen: false };
    case 'OPEN_PREMIUM_MODAL':
      return { ...state, isPremiumModalOpen: true };
    case 'CLOSE_PREMIUM_MODAL':
        return { ...state, isPremiumModalOpen: false };
    case 'OPEN_CREATE_REQUEST_MODAL':
      return { ...state, isCreateRequestModalOpen: true, isLoginModalOpen: false, isRegisterModalOpen: false };
    case 'CLOSE_CREATE_REQUEST_MODAL':
      return { ...state, isCreateRequestModalOpen: false };
    default:
      return state;
  }
};

// --- Contexto e Provedor ---

interface AppContextProps {
  state: AppState;
  dispatch: React.Dispatch<Action>;
  handleUpdateUser: (userData: Partial<User>) => Promise<void>;
}

const AppContext = createContext<AppContextProps | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(AppReducer, initialState);

  // Efeito para verificar a autenticação na inicialização do app
  useEffect(() => {
    const checkCurrentUser = async () => {
      const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
      if (token) {
        try {
          // Usa a função do apiService que já tem o token no header
          const user = await api.getCurrentUser();
          dispatch({ type: 'LOGIN_SUCCESS', payload: { token, user, rememberMe: !!localStorage.getItem('authToken') } });
        } catch (error) {
          console.error('Sessão inválida, deslogando.', error);
          dispatch({ type: 'LOGOUT' });
        }
      } else {
        dispatch({ type: 'INITIAL_AUTH_CHECK_COMPLETE' });
      }
    };

    checkCurrentUser();
  }, []); // Roda apenas uma vez

  // Efeito para gerenciar a conexão do WebSocket
  useEffect(() => {
    if (!state.isAuthenticated || !state.token || state.socket) {
      return;
    }

    const WEBSOCKET_URL = 'https://ineed-backend-service-781597570567.us-central1.run.app';
    
    const newSocket = io(WEBSOCKET_URL, {
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      autoConnect: true,
      extraHeaders: {
        Authorization: `Bearer ${state.token}`,
      },
    });

    dispatch({ type: 'SET_SOCKET', payload: newSocket });

    newSocket.on('connect', () => {
      console.log('✅ Conectado ao WebSocket! ID:', newSocket.id);
    });

    newSocket.on('new-notification', (notification) => {
      console.log('Nova notificação recebida:', notification);
      dispatch({ type: 'NEW_NOTIFICATION', payload: notification });
      alert(`Nova Notificação: ${notification.text}`);
    });

    newSocket.on('disconnect', (reason) => {
      console.log('🔌 Desconectado do WebSocket:', reason);
      dispatch({ type: 'SET_SOCKET', payload: null });
    });

    // Função de limpeza para desconectar quando o componente desmontar ou o usuário deslogar
    return () => {
      if (newSocket.connected) {
        console.log('Cleaning up socket connection.');
        newSocket.disconnect();
      }
    };
  }, [state.isAuthenticated, state.token]);

  // Se ainda estiver verificando a autenticação, pode mostrar um loader
  if (state.isLoading) {
    return <div className="flex items-center justify-center h-screen">Carregando...</div>;
  }

  const handleUpdateUser = async (userData: Partial<User>) => {
    const updatedUser = await api.updateUser(userData);
    dispatch({ type: 'SET_USER', payload: updatedUser });
  };

  return (
    <AppContext.Provider value={{ state, dispatch, handleUpdateUser }}>
      <Toaster position="top-center" reverseOrder={false} />
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};