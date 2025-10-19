import React, { useState, useMemo, useEffect } from 'react';
import { GoogleIcon } from './icons';
import { useAppContext } from '../context/AppContext';

// Add reCAPTCHA to the window type to avoid TypeScript errors
declare global {
  interface Window {
    grecaptcha: any;
  }
}

/**
 * Validates a Brazilian CPF number.
 */
const validateCpf = (cpf: string): boolean => {
  const cleanedCpf = cpf.replace(/[^\d]/g, '');
  if (cleanedCpf.length !== 11 || /^(\d)\1{10}$/.test(cleanedCpf)) return false;
  let sum = 0, remainder;
  for (let i = 1; i <= 9; i++) sum += parseInt(cleanedCpf.substring(i - 1, i)) * (11 - i);
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleanedCpf.substring(9, 10))) return false;
  sum = 0;
  for (let i = 1; i <= 10; i++) sum += parseInt(cleanedCpf.substring(i - 1, i)) * (12 - i);
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleanedCpf.substring(10, 11))) return false;
  return true;
};

const PasswordCriterion: React.FC<{ label: string; met: boolean }> = ({ label, met }) => (
    <li className={`flex items-center text-sm transition-colors duration-300 ${met ? 'text-green-600' : 'text-gray-500'}`}>
      <i className={`fas ${met ? 'fa-check-circle' : 'fa-circle'} mr-2`}></i>
      {label}
    </li>
);

enum AuthTab {
  Login = 'login',
  Register = 'register',
}

const AuthModal: React.FC = () => {
  const { dispatch, handleSocialLogin, handleEmailLogin, handleRegister } = useAppContext();
  const [activeTab, setActiveTab] = useState<AuthTab>(AuthTab.Login);
  
  // Registration form state
  const [registerName, setRegisterName] = useState('');
  const [registerUsername, setRegisterUsername] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerCpf, setRegisterCpf] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [cep, setCep] = useState('');
  const [address, setAddress] = useState({ street: '', number: '', neighborhood: '', city: '', state: '' });
  
  const [isCpfTouched, setIsCpfTouched] = useState(false);
  const [isRecaptchaVerified, setIsRecaptchaVerified] = useState(false);
  
  // Login State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  // General state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');


  const onClose = () => dispatch({ type: 'CLOSE_AUTH_MODAL' });

  // Render reCAPTCHA when register tab is active
  useEffect(() => {
    if (activeTab === AuthTab.Register) {
      setIsRecaptchaVerified(false); // Reset on tab switch
      const timer = setTimeout(() => {
        if (typeof window.grecaptcha !== 'undefined' && window.grecaptcha.render && document.getElementById('recaptcha-container')) {
            window.grecaptcha.render('recaptcha-container', {
              'sitekey': '6LclteErAAAAALTmElSjuAfFU5KjJMgr_eGzO3vA', // Test key
              'callback': () => setIsRecaptchaVerified(true),
              'expired-callback': () => setIsRecaptchaVerified(false),
            });
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [activeTab]);


  // Auto-fill address from CEP
  useEffect(() => {
    const fetchAddress = async () => {
      const cleanedCep = cep.replace(/\D/g, '');
      if (cleanedCep.length === 8) {
        try {
          const response = await fetch(`https://viacep.com.br/ws/${cleanedCep}/json/`);
          const data = await response.json();
          if (!data.erro) {
            setAddress(prev => ({
              ...prev,
              street: data.logouro,
              neighborhood: data.bairro,
              city: data.localidade,
              state: data.uf,
            }));
          }
        } catch (error) {
          console.error("Failed to fetch address from CEP", error);
        }
      }
    };
    fetchAddress();
  }, [cep]);


  // Memoized validation checks
  const isCpfValid = useMemo(() => validateCpf(registerCpf), [registerCpf]);
  const passwordCriteria = useMemo(() => ({
    minLength: password.length >= 8,
    hasUpper: /[A-Z]/.test(password),
    hasLower: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  }), [password]);
  const isPasswordValid = useMemo(() => Object.values(passwordCriteria).every(Boolean), [passwordCriteria]);
  const doPasswordsMatch = useMemo(() => password === confirmPassword && password !== '', [password, confirmPassword]);

  const isRegisterFormValid = useMemo(() => {
    return registerName.trim() !== '' &&
           registerUsername.trim() !== '' &&
           registerEmail.trim() !== '' &&
           isCpfValid &&
           isPasswordValid &&
           doPasswordsMatch &&
           dateOfBirth.trim() !== '' &&
           phoneNumber.replace(/\D/g, '').length >= 10 &&
           cep.replace(/\D/g, '').length === 8 &&
           address.street.trim() !== '' &&
           address.number.trim() !== '' &&
           address.city.trim() !== '' &&
           address.state.trim() !== '' &&
           isRecaptchaVerified;
  }, [registerName, registerUsername, registerEmail, isCpfValid, isPasswordValid, doPasswordsMatch, dateOfBirth, phoneNumber, cep, address, isRecaptchaVerified]);

  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedCpf = e.target.value.replace(/\D/g, '').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})$/, '$1-$2').substring(0, 14);
    setRegisterCpf(formattedCpf);
  };
  
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedPhone = e.target.value.replace(/\D/g, '').replace(/^(\d{2})(\d)/g, '($1) $2').replace(/(\d{5})(\d)/, '$1-$2').substring(0, 15);
    setPhoneNumber(formattedPhone);
  };

  const handleCepChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedCep = e.target.value.replace(/\D/g, '').replace(/(\d{5})(\d)/, '$1-$2').substring(0, 9);
    setCep(formattedCep);
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
        await handleEmailLogin(loginEmail, loginPassword);
        // Modal is closed by context on success
    } catch(err: any) {
        setError(err.message || "Falha no login. Verifique suas credenciais.");
    } finally {
        setIsLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isRegisterFormValid) {
      setError("Por favor, preencha todos os campos corretamente e verifique o reCAPTCHA.");
      return;
    }
    setError('');
    setIsLoading(true);
    
    const registrationData = {
        name: registerName,
        username: registerUsername,
        email: registerEmail,
        location: `${address.city}, ${address.state}`,
        // In a real app, password would be sent here. The mock API doesn't use it.
    };
    
    try {
        await handleRegister(registrationData);
        // Modal is closed by context on success
    } catch (err: any) {
        setError(err.message || "Não foi possível concluir o cadastro. Tente novamente.");
    } finally {
        setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError('');
    try {
        await handleSocialLogin();
    } catch (err: any) {
        setError(err.message || "Falha no login com Google.");
    } finally {
        setIsLoading(false);
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className={`bg-white rounded-lg shadow-xl w-full ${activeTab === AuthTab.Register ? 'max-w-2xl' : 'max-w-md'} relative animate-fade-in-down max-h-[90vh] flex flex-col transition-all duration-300 ease-in-out`}>
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 text-2xl z-10">
          &times;
        </button>
        
        <div className="p-8 overflow-y-auto">
          <div className="flex border-b mb-6">
            <button 
              onClick={() => { setActiveTab(AuthTab.Login); setError(''); }}
              className={`flex-1 py-2 text-lg font-semibold transition ${activeTab === AuthTab.Login ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}>
              Entrar
            </button>
            <button 
              onClick={() => { setActiveTab(AuthTab.Register); setError(''); }}
              className={`flex-1 py-2 text-lg font-semibold transition ${activeTab === AuthTab.Register ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}>
              Cadastrar
            </button>
          </div>

          {activeTab === AuthTab.Login && (
            <div>
              <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Bem-vindo de volta!</h2>
              
              {error && <p className="text-red-500 text-sm text-center mb-4">{error}</p>}

              <div className="space-y-3">
                 <button 
                    onClick={handleGoogleLogin}
                    disabled={isLoading}
                    className="w-full bg-white border border-gray-300 text-gray-700 font-semibold py-2.5 px-4 rounded-lg flex items-center justify-center hover:bg-gray-100 transition disabled:opacity-75"
                  >
                    {isLoading ? (
                       <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Autenticando...
                       </>
                    ) : (
                      <>
                        <GoogleIcon className="h-5 w-5 mr-2" />
                        Continuar com Google
                      </>
                    )}
                  </button>
                  <button onClick={handleSocialLogin} disabled={isLoading} className="w-full bg-black text-white font-semibold py-2.5 px-4 rounded-lg flex items-center justify-center hover:bg-gray-800 transition disabled:opacity-75">
                      <i className="fab fa-apple mr-2 text-lg"></i>
                      Entrar com Apple
                  </button>
              </div>
              
              <div className="my-6 flex items-center">
                <div className="flex-grow border-t border-gray-300"></div>
                <span className="mx-4 text-gray-500 text-sm">ou</span>
                <div className="flex-grow border-t border-gray-300"></div>
              </div>

              <form onSubmit={handleLoginSubmit}>
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2" htmlFor="login-email">Email</label>
                  <input className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" type="email" id="login-email" placeholder="seu@email.com" required value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2" htmlFor="login-password">Senha</label>
                  <input className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" type="password" id="login-password" placeholder="********" required value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} />
                </div>
                <div className="text-right text-sm mb-4">
                    <a href="#" className="text-blue-600 hover:underline">Esqueceu sua senha?</a>
                </div>
                <button type="submit" disabled={isLoading} className="w-full gradient-bg text-white font-bold py-2 px-4 rounded-lg hover:opacity-90 transition transform hover:scale-105 disabled:opacity-75">
                    {isLoading ? 'Entrando...' : 'Entrar'}
                </button>
              </form>
              <div className="text-center text-sm text-gray-600 mt-4">
                Não tem uma conta? <button onClick={() => setActiveTab(AuthTab.Register)} className="font-semibold text-blue-600 hover:underline">Cadastre-se</button>
              </div>
            </div>
          )}

          {activeTab === AuthTab.Register && (
            <div>
              <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Crie sua Conta Completa</h2>
              {error && <p className="text-red-500 text-sm text-center mb-4">{error}</p>}
              <form onSubmit={handleRegisterSubmit} className="space-y-4">
                <input className="w-full px-4 py-2 border rounded-lg" type="text" placeholder="Nome Completo" required value={registerName} onChange={(e) => setRegisterName(e.target.value)} />
                <input className="w-full px-4 py-2 border rounded-lg" type="text" placeholder="Nome de Usuário (@)" required value={registerUsername} onChange={(e) => setRegisterUsername(e.target.value)} />
                <input className="w-full px-4 py-2 border rounded-lg" type="email" placeholder="Email" required value={registerEmail} onChange={(e) => setRegisterEmail(e.target.value)}/>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input type="date" className="w-full px-4 py-2 border rounded-lg text-gray-500" required value={dateOfBirth} onChange={e => setDateOfBirth(e.target.value)} />
                  <input type="tel" className="w-full px-4 py-2 border rounded-lg" placeholder="Telefone (xx) xxxxx-xxxx" required value={phoneNumber} onChange={handlePhoneChange} />
                </div>
                
                <input type="text" className={`w-full px-4 py-2 border rounded-lg ${ isCpfTouched && !isCpfValid ? 'border-red-500' : ''}`} placeholder="CPF" required value={registerCpf} onChange={handleCpfChange} onBlur={() => setIsCpfTouched(true)} maxLength={14} />
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <input type="text" className="w-full px-4 py-2 border rounded-lg sm:col-span-1" placeholder="CEP" required value={cep} onChange={handleCepChange} />
                  <input type="text" className="w-full px-4 py-2 border rounded-lg sm:col-span-2 bg-gray-100" placeholder="Endereço" required value={address.street} onChange={e => setAddress({...address, street: e.target.value})} />
                </div>
                 <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <input type="text" className="w-full px-4 py-2 border rounded-lg" placeholder="Número" required value={address.number} onChange={e => setAddress({...address, number: e.target.value})} />
                  <input type="text" className="w-full px-4 py-2 border rounded-lg sm:col-span-2 bg-gray-100" placeholder="Bairro" required value={address.neighborhood} onChange={e => setAddress({...address, neighborhood: e.target.value})} />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                   <input type="text" className="w-full px-4 py-2 border rounded-lg bg-gray-100" placeholder="Cidade" required value={address.city} onChange={e => setAddress({...address, city: e.target.value})}/>
                   <input type="text" className="w-full px-4 py-2 border rounded-lg bg-gray-100" placeholder="Estado" required value={address.state} onChange={e => setAddress({...address, state: e.target.value})}/>
                </div>
                
                <input className="w-full px-4 py-2 border rounded-lg" type="password" placeholder="Crie uma senha" required value={password} onChange={(e) => setPassword(e.target.value)} />
                <input className="w-full px-4 py-2 border rounded-lg" type="password" placeholder="Confirme a senha" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                
                {password && (
                  <div className="bg-gray-50 border p-3 rounded-lg">
                    <ul className="space-y-1">
                      <PasswordCriterion label="As senhas coincidem" met={doPasswordsMatch} />
                      <PasswordCriterion label="Pelo menos 8 caracteres" met={passwordCriteria.minLength} />
                      <PasswordCriterion label="Uma letra maiúscula (A-Z)" met={passwordCriteria.hasUpper} />
                      <PasswordCriterion label="Uma letra minúscula (a-z)" met={passwordCriteria.hasLower} />
                      <PasswordCriterion label="Pelo menos um número (0-9)" met={passwordCriteria.hasNumber} />
                      <PasswordCriterion label="Um caractere especial (!@#$...)" met={passwordCriteria.hasSpecial} />
                    </ul>
                  </div>
                )}
                
                <div className="flex flex-col items-center justify-center my-4 p-2 bg-gray-50 rounded-md min-h-[100px]">
                    <div id="recaptcha-container"></div>
                </div>

                <button type="submit" disabled={!isRegisterFormValid || isLoading} className="w-full gradient-bg text-white font-bold py-2 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed">
                    {isLoading ? 'Criando conta...' : 'Criar Conta'}
                </button>
              </form>
               <div className="text-center text-sm text-gray-600 mt-4">
                Já tem uma conta? <button onClick={() => setActiveTab(AuthTab.Login)} className="font-semibold text-blue-600 hover:underline">Faça Login</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;