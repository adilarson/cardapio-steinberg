import React from "react";
import { QRCodeCanvas } from "qrcode.react";
import { useEmpresa } from "../context/EmpresaContext";

export default function GeradorQR() {
    const { empresa } = useEmpresa();
    
    // Gera dinamicamente até a quantidade de mesas cadastrada ou 50 por padrão
    const mesas = Array.from({ length: 50 }, (_, i) => i + 1);
    
    // Captura o domínio do Netlify ou local automaticamente
    const dominio = window.location.origin;

    if (!empresa) {
        return (
            <div className="p-8 text-center text-stone-500">
                Carregando dados da empresa...
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-stone-100 p-8">
            <div className="max-w-7xl mx-auto">
                {/* Cabeçalho - Escondido ao imprimir para economizar papel */}
                <div className="flex justify-between items-center mb-8 print:hidden">
                    <h1 className="text-3xl font-bold text-amber-900">
                        Gerador de QR Codes
                    </h1>
                    <button
                        onClick={() => window.print()}
                        className="bg-amber-900 hover:bg-amber-950 text-white px-6 py-3 rounded-xl font-bold shadow transition"
                    >
                        🖨️ Imprimir Todos os QR Codes
                    </button>
                </div>

                {/* Grid de Impressão */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 print:grid-cols-3 print:gap-4">
                    {mesas.map((mesa) => {
                        const numero = String(mesa).padStart(2, "0");
                        
                        // CORREÇÃO CRÍTICA: Agora inclui o slug dinâmico na rota!
                        const url = `${dominio}/${empresa.slug}?mesa=${numero}`;
                        
                        return (
                            <div
                                key={mesa}
                                className="bg-white rounded-xl border p-5 text-center shadow print:shadow-none print:border-gray-400 print:break-inside-avoid print:my-2"
                            >
                                <h2 className="font-bold text-xl text-amber-900 uppercase">
                                    {empresa.nome || "CARDÁPIO DIGITAL"}
                                </h2>
                                <p className="text-xs mb-3 text-stone-600">
                                    {empresa.segmento || "Escaneie para pedir"}
                                </p>
                                
                                <div className="flex justify-center">
                                    <QRCodeCanvas
                                        value={url}
                                        size={160}
                                        level="H"
                                        includeMargin={true}
                                    />
                                </div>
                                
                                <h3 className="mt-4 font-black text-lg text-stone-800">
                                    MESA {numero}
                                </h3>
                                <p className="text-[10px] text-gray-400 mt-1 truncate">
                                    {url.replace("https://", "")}
                                </p>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
