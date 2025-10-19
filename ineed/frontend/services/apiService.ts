import type { Request, User, UserOrder, ContractGenerationResult, ModerationResult } from '../types';
import { checkRequestContentWithAI, generateContractWithAI, getAIWelcomeMessageWithAI } from './geminiService';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

// --- API FUNCTIONS ---

// --- Authentication ---
export const loginWithEmail = async (email: string, password: string, rememberMe: boolean): Promise<{ token: string, user: User, rememberMe: boolean }> => {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }), // Enviando email e senha
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Falha no login.');
  }
  return { ...data, rememberMe };
};

export const register = async (userData: { name?: string; email?: string, password?: string }, rememberMe: boolean): Promise<{ token: string, user: User, rememberMe: boolean }> => {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        nome: userData.name, 
        email: userData.email,
        password: userData.password
    }),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Falha no cadastro.');
  }
  return { ...data, rememberMe };
};

export const socialLogin = async (): Promise<{ token: string, user: User }> => {
    throw new Error("Login social ainda não implementado com o backend real.");
};

export const getCurrentUser = async (): Promise<User> => {
    const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
    if (!token) throw new Error("Não autenticado");

    const response = await fetch(`${API_BASE_URL}/users/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) {
        localStorage.removeItem('authToken');
        sessionStorage.removeItem('authToken');
        throw new Error("Sessão inválida ou expirada.");
    }
    return response.json();
};

export const uploadProfilePicture = async (file: File): Promise<string> => {
    const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
    if (!token) throw new Error("Não autenticado");

    const urlResponse = await fetch(`${API_BASE_URL}/users/me/upload-url`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ contentType: file.type })
    });

    if (!urlResponse.ok) {
        throw new Error('Não foi possível obter a URL de upload.');
    }

    const { signedUrl, publicUrl } = await urlResponse.json();

    const uploadResponse = await fetch(signedUrl, {
        method: 'PUT',
        headers: { 'Content-Type': file.type },
        body: file
    });

    if (!uploadResponse.ok) {
        throw new Error('Falha no upload da imagem.');
    }

    return publicUrl;
};

// --- User ---
export const updateUser = async (userData: Partial<User>): Promise<User> => {
    const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
    if (!token) throw new Error("Não autenticado");

    const response = await fetch(`${API_BASE_URL}/users/me`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(userData)
    });

    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.message || 'Falha ao atualizar perfil.');
    }
    return data;
};

export const getUserProfile = async (userId: string): Promise<User> => {
    const response = await fetch(`${API_BASE_URL}/users/${userId}`);
    if (!response.ok) throw new Error("Usuário não encontrado.");
    return response.json();
};

// --- Requests (Exemplos, precisam de rotas no backend) ---
export const getRequests = async (): Promise<Request[]> => {
    const response = await fetch(`${API_BASE_URL}/requests`);
    if (!response.ok) throw new Error('Falha ao buscar pedidos.');
    return response.json();
};

export const createRequest = async (requestData: Omit<Request, 'id' | 'userId' | 'userName' | 'userAvatar'>): Promise<Request> => {
    const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
    const response = await fetch(`${API_BASE_URL}/requests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(requestData),
    });
    if (!response.ok) throw new Error('Falha ao criar pedido.');
    return response.json();
};

// --- Gemini Services (via Backend Mock) ---
export const checkRequestContent = async (text: string): Promise<ModerationResult> => {
    return checkRequestContentWithAI(text);
};

export const generateContract = async (transcript: string): Promise<ContractGenerationResult> => {
    return generateContractWithAI(transcript);
};

export const getAIWelcomeMessage = async (): Promise<{ message: string }> => {
    return getAIWelcomeMessageWithAI();
};