
import React from 'react';
import { useAppContext } from '../context/AppContext';

const Footer: React.FC = () => {
  const { dispatch } = useAppContext();
  
  return (
    <footer className="bg-gray-800 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* About */}
          <div className="md:col-span-2 lg:col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <i className="fas fa-hand-holding-heart text-2xl"></i>
              <h2 className="text-2xl font-bold">iNeed</h2>
            </div>
            <p className="text-gray-400 mb-2">Conectando necessidades, fortalecendo comunidades.</p>
            <a href="https://www.ineedbr.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white text-sm">
                www.ineedbr.com
            </a>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Links Rápidos</h3>
            <ul className="space-y-2">
              <li><a href="https://www.ineedbr.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white">Sobre Nós</a></li>
              <li><a href="https://www.ineedbr.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white">Termos de Serviço</a></li>
              <li><a href="https://www.ineedbr.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white">Política de Privacidade</a></li>
              <li><a href="https://www.ineedbr.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white">FAQ</a></li>
            </ul>
          </div>
          
          {/* Contact and Socials */}
          <div className="md:col-span-2">
             <h3 className="text-lg font-semibold mb-4">Contato</h3>
              <p className="text-gray-400 mb-4">Tem alguma dúvida ou sugestão? Entre em contato conosco!</p>
              <button 
                onClick={() => dispatch({ type: 'OPEN_CONTACT_MODAL' })}
                className="gradient-bg text-white font-bold py-2 px-6 rounded-lg hover:opacity-90 transition w-full sm:w-auto"
              >
                Fale Conosco
              </button>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-10 pt-6 text-center text-gray-500">
          <p>&copy; {new Date().getFullYear()} iNeed. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
