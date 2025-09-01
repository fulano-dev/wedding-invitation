import React from 'react';

export default function ConfirmModal({ open, onClose, nome, valorPix, detalhesPessoas }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="bg-neutral-900 rounded-2xl p-8 max-w-md w-full border border-yellow-400 shadow-xl text-center">
        <h2 className="text-2xl font-bold text-yellow-400 mb-4">Confirmação enviada!</h2>
        <p className="text-neutral-100 mb-2">Obrigado, <span className="font-semibold text-yellow-400">{nome}</span>!</p>
        <p className="text-neutral-100 mb-2">Valor do Pix: <span className="font-semibold text-yellow-400">R$ {valorPix}</span></p>
        <div className="text-left mb-4">
          <p className="text-yellow-400 font-semibold mb-1">Resumo dos convidados:</p>
          <ul className="text-neutral-100 text-sm list-disc pl-4">
            {detalhesPessoas.map((p, i) => (
              <li key={i}>{p.nome}: {p.idade}, {p.valor}</li>
            ))}
          </ul>
        </div>
        <button
          className="mt-2 px-6 py-2 rounded-lg bg-yellow-500 text-white font-semibold hover:bg-yellow-600 transition"
          onClick={onClose}
        >Fechar</button>
      </div>
    </div>
  );
}
