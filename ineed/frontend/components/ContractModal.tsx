import React from 'react';
import type { ContractDetails } from '../types';

interface ContractModalProps {
  details: ContractDetails;
  onClose: () => void;
}

const ContractModal: React.FC<ContractModalProps> = ({ details, onClose }) => {
    
  const printContract = () => {
    const printableContent = document.getElementById('contractContent')?.innerHTML;
    if (printableContent) {
        const printWindow = window.open('', '', 'height=800,width=800');
        printWindow?.document.write('<html><head><title>Contrato iNeed</title>');
        printWindow?.document.write('<style>body { font-family: Arial, sans-serif; line-height: 1.6; } h2, h3 { font-weight: bold; } .signature { margin-top: 80px; border-top: 1px solid black; width: 250px; } </style>');
        printWindow?.document.write('</head><body>');
        printWindow?.document.write(printableContent);
        printWindow?.document.write('</body></html>');
        printWindow?.document.close();
        printWindow?.print();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col animate-fade-in-down">
        <div className="p-6 border-b flex justify-between items-center">
            <h3 className="text-xl font-bold text-gray-800">Contrato Gerado por IA</h3>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">&times;</button>
        </div>

        <div className="p-8 overflow-y-auto" id="contractContent">
            <h2 className="text-center text-xl font-bold mb-6">CONTRATO DE PRESTAÇÃO DE SERVIÇOS / COMPRA E VENDA</h2>
            
            <h3 className="font-bold mt-6 mb-2">CLÁUSULA PRIMEIRA - DAS PARTES</h3>
            <p><strong>CONTRATANTE:</strong> {details.clientName}</p>
            <p><strong>CONTRATADO:</strong> {details.providerName}</p>
            
            <h3 className="font-bold mt-6 mb-2">CLÁUSULA SEGUNDA - DO OBJETO</h3>
            <p>{details.serviceDescription}</p>
            
            <h3 className="font-bold mt-6 mb-2">CLÁUSULA TERCEIRA - DO VALOR</h3>
            <p>O valor total acordado para o objeto deste contrato é de <strong>R$ {details.value.toFixed(2)}</strong>.</p>
            
            <h3 className="font-bold mt-6 mb-2">CLÁUSULA QUARTA - DO PRAZO</h3>
            <p>O prazo para entrega/conclusão do objeto será de <strong>{details.deliveryTime}</strong> a contar da data de aceite.</p>
            
            <h3 className="font-bold mt-6 mb-2">CLÁUSULA QUINTA - DISPOSIÇÕES GERAIS</h3>
            <p>Este contrato é gerado com base na negociação realizada na plataforma iNeed e serve como um registro do acordo entre as partes. Ambas as partes concordam com os termos aqui descritos.</p>
            
            <div className="text-center mt-16">
                <p>E por estarem justos e contratados, firmam o presente.</p>
                
                <div className="flex justify-around mt-16">
                    <div className="text-center">
                        <p className="signature">_______________________________________</p>
                        <p className="mt-2">{details.clientName}</p>
                        <p className="text-sm font-bold">CONTRATANTE</p>
                    </div>
                    
                    <div className="text-center">
                        <p className="signature">_______________________________________</p>
                        <p className="mt-2">{details.providerName}</p>
                        <p className="text-sm font-bold">CONTRATADO</p>
                    </div>
                </div>
                
                <div className="text-center mt-8 text-gray-500 text-sm">
                    <p>Gerado em {details.date}</p>
                </div>
            </div>
        </div>
        
        <div className="flex justify-end gap-4 p-6 border-t bg-gray-50">
            <button onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100">Fechar</button>
            <button onClick={printContract} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center">
                <i className="fas fa-print mr-2"></i> Imprimir
            </button>
            <button onClick={() => alert("Função de download em PDF a ser implementada.")} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center">
                <i className="fas fa-download mr-2"></i> Baixar PDF
            </button>
        </div>
      </div>
    </div>
  );
};

export default ContractModal;