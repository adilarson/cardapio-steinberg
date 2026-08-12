import React from "react";
import { QRCodeCanvas } from "qrcode.react";
import { useEmpresa } from "../context/EmpresaContext";

export default function GeradorQR({ totalMesasManual }) {
    const { empresa } = useEmpresa();
    
    // Prioriza o que o usuário está digitando na tela em tempo real
    const totalDeMesas = totalMesasManual ? Number(totalMesasManual) : (empresa?.totalMesas ? Number(empresa.totalMesas) : 50);
    const mesas = Array.from({ length: totalDeMesas }, (_, i) => i + 1);
    
    const dominio = window.location.origin;

    if (!empresa) {
        return (
            <div className="p-8 text-center text-stone-500 print:hidden">
                Carregando dados da empresa...
            </div>
        );
    }

    return (
        <div className="bg-stone-100 p-2 area-gerador-qr">
            <div className="max-w-7xl mx-auto">
                {/* Cabeçalho do painel de QR Codes - Escondido na impressão */}
                <div className="flex justify-between items-center mb-8 print:hidden">
                    <div>
                        <h2 className="text-2xl font-bold text-amber-900">
                            QR Codes Gerados
                        </h2>
                        <p className="text-sm text-stone-500">
                            Exibindo {totalDeMesas} mesas configuradas para este estabelecimento.
                        </p>
                    </div>
                    <button
                        onClick={() => window.print()}
                        className="bg-amber-900 hover:bg-amber-950 text-white px-6 py-3 rounded-xl font-bold shadow transition"
                    >
                        📄 Salvar em PDF / Imprimir QR Codes
                    </button>
                </div>

                {/* Grid de Impressão */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 area-grid-print print:grid-cols-3 print:gap-6">
                    {mesas.map((mesa) => {
                        const numero = String(mesa).padStart(2, "0");
                        const url = `${dominio}/${empresa.slug}?mesa=${numero}`;
                        
                        return (
                            <div
                                key={mesa}
                                className="bg-white rounded-xl border p-5 text-center shadow card-qr-print print:shadow-none print:border-2 print:border-stone-400 print:break-inside-avoid print:my-4"
                            >
                                <h2 className="font-bold text-xl text-amber-900 uppercase print:text-lg">
                                    {empresa.nome || "CARDÁPIO DIGITAL"}
                                </h2>
                                <p className="text-xs mb-3 text-stone-600 print:text-[11px]">
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
                                
                                <h3 className="mt-4 font-black text-lg text-stone-800 print:text-base">
                                    MESA {numero}
                                </h3>
                                <p className="text-[10px] text-gray-400 mt-1 truncate print:text-[9px]">
                                    {url.replace("https://", "")}
                                </p>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* CSS de Impressão Ultra Forçado para SaaS */}
            <style>{`
                @media print {
                    /* 1. Esconde absolutamente tudo o que está na tela por padrão */
                    body * {
                        visibility: hidden !important;
                    }
                    
                    /* 2. Força o fundo da página a ficar totalmente branco */
                    body, html, #root {
                        background: white !important;
                        background-color: white !important;
                    }

                    /* 3. Torna VISÍVEL apenas a nossa área dos QR Codes e seus filhos */
                    .area-gerador-qr, .area-gerador-qr * {
                        visibility: visible !important;
                    }

                    /* 4. Remove margens, paddings e posicionamentos do layout do Admin do caminho */
                    .area-gerador-qr {
                        position: absolute !important;
                        left: 0 !important;
                        top: 0 !important;
                        width: 100% !important;
                        padding: 0 !important;
                        margin: 0 !important;
                        background: transparent !important;
                    }

                    /* 5. Força a Grid a se organizar perfeitamente em 3 colunas no papel */
                    .area-grid-print {
                        display: grid !important;
                        grid-template-columns: repeat(3, 1fr) !important;
                        gap: 20px !important;
                        width: 100% !important;
                    }

                    /* 6. Esconde qualquer elemento que tenha a classe print:hidden explicitamente */
                    .print\\:hidden {
                        display: none !important;
                        visibility: hidden !important;
                    }
                }
            `}</style>
        </div>
    );
}
