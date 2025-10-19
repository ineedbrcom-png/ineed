import React from 'react';
import { useAppContext } from '../context/AppContext'; // Ajuste o caminho
import { createCheckoutSession } from '../ineed-backend/src/routes/apiService'; // Ajuste o caminho

const PremiumModal: React.FC = () => {
  const { dispatch } = useAppContext();

  const onClose = () => dispatch({ type: 'CLOSE_PREMIUM_MODAL' });

  const handleSubscribe = async () => {
    try {
      // 1. Chama o backend para criar a sessão de checkout do Stripe
      const session = await createCheckoutSession();
      
      // 2. Redireciona o usuário para a página de pagamento do Stripe
      if (session.url) {
        window.location.href = session.url;
      } else {
        throw new Error('URL de checkout não recebida.');
      }
    } catch (error) {
      console.error("Falha ao iniciar a assinatura:", error);
      alert("Não foi possível processar a assinatura. Tente novamente.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md relative animate-fade-in-down" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-2xl z-10">
          &times;
        </button>
        
        <div className="p-8 text-center">
          <div className="text-yellow-400 text-4xl mb-4">
            <i className="fas fa-crown"></i>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Torne-se Premium!</h2>
          <p className="text-gray-600 mb-6">Desbloqueie recursos exclusivos e saia na frente.</p>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left space-y-3 mb-6">
            <p className="flex items-start"><i className="fas fa-check-circle text-blue-500 mr-2 mt-1"></i> <strong>Alertas Instantâneos:</strong> Receba notificações em tempo real para novos pedidos na sua área e categorias de interesse.</p>
            <p className="flex items-start"><i className="fas fa-check-circle text-blue-500 mr-2 mt-1"></i> <strong>Selo de Destaque:</strong> Seu perfil e propostas terão um selo Premium, aumentando sua visibilidade e confiança.</p>
            <p className="flex items-start"><i className="fas fa-check-circle text-blue-500 mr-2 mt-1"></i> <strong>Suporte Prioritário:</strong> Tenha acesso a um canal de suporte exclusivo para membros Premium.</p>
          </div>

          <div className="mb-6">
            <p className="text-4xl font-extrabold text-gray-800">R$ 40,00<span className="text-base font-medium text-gray-500">/mês</span></p>
          </div>
          
          <div className="space-y-3">
            <button 
              onClick={handleSubscribe}
              className="w-full bg-black text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center hover:bg-gray-800 transition"
            >
              <i className="fas fa-credit-card mr-2"></i> Assinar com Cartão
            </button>
             {/* Os botões de Apple/Google Pay podem ser adicionados aqui como métodos de pagamento no Stripe */}
             <button
              className="w-full bg-white border border-gray-300 text-gray-700 font-semibold py-3 px-4 rounded-lg flex items-center justify-center hover:bg-gray-100 transition"
            >
              <i className="fab fa-google mr-2 text-blue-500"></i> Assinar com Google
            </button>
          </div>

          <p className="text-xs text-gray-400 mt-6">
            A assinatura é renovada automaticamente. Cancele a qualquer momento.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PremiumModal;
