import React from "react";
import { QRCodeCanvas } from "qrcode.react";

export default function GeradorQR() {

    const mesas = Array.from({ length: 50 }, (_, i) => i + 1);

    const dominio = "https://candid-meerkat-35c81d.netlify.app";

    return (

        <div className="min-h-screen bg-stone-100 p-8">

            <div className="max-w-7xl mx-auto">

                <div className="flex justify-between items-center mb-8">

                    <h1 className="text-3xl font-bold text-amber-900">

                        Gerador de QR Codes

                    </h1>

                    <button

                        onClick={() => window.print()}

                        className="bg-amber-900 text-white px-6 py-3 rounded-xl"

                    >

                        🖨️ Imprimir

                    </button>

                </div>

                <div className="grid grid-cols-4 gap-6">

                    {mesas.map((mesa) => {

                        const numero = String(mesa).padStart(2, "0");

                        const url = `${dominio}/?mesa=${numero}`;

                        return (

                            <div
                                key={mesa}
                                className="bg-white rounded-xl border p-5 text-center shadow"
                            >

                                <h2 className="font-bold text-xl text-amber-900">

                                    STEINBERG

                                </h2>

                                <p className="text-xs mb-3">

                                    Eco Village & Restaurante

                                </p>

                                <QRCodeCanvas
                                    value={url}
                                    size={180}
                                    level="H"
                                    includeMargin={true}
                                />

                                <h3 className="mt-4 font-bold text-lg">

                                    MESA {numero}

                                </h3>

                                <p className="text-xs text-gray-500 mt-2">

                                    Escaneie para acessar o cardápio

                                </p>

                            </div>

                        );

                    })}

                </div>

            </div>

        </div>

    );

}