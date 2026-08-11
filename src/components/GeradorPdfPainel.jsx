import React, { useRef, useState, useEffect } from "react";
import html2pdf from "html2pdf.js";
import { db } from "../firebase";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { useEmpresa } from "../context/EmpresaContext";
import cardapioSteinberg from "../data/cardapioSteinberg";

export default function GeradorPdfPainel() {
  const { empresa } = useEmpresa();
  const cardapioAreaRef = useRef();
  const [cardapioSincronizado, setCardapioSincronizado] = useState(null);
  const [gerando, setGerando] = useState(false);
  const [imagensCarregadas, setImagensCarregadas] = useState({});

  // Função utilitária para converter URLs de imagem do Firebase/Internet em Base64
  // Isso remove em definitivo qualquer bloqueio de CORS na geração do PDF para o SaaS
  const obterImagemBase64 = (url) => {
    return new Promise((resolve) => {
      if (!url) return resolve(null);
      
      const img = new Image();
      img.setAttribute("crossOrigin", "anonymous");
      
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);
        const dataURL = canvas.toDataURL("image/jpeg");
        resolve(dataURL);
      };
      
      img.onerror = () => {
        console.warn("Falha ao converter imagem para o PDF. Ignorando foto:", url);
        resolve(null);
      };
      
      img.src = url;
    });
  };

  useEffect(() => {
    if (!empresa?.id) return;

    const q = query(
      collection(db, "restaurantes", empresa.id, "produtos"),
      orderBy("ordem", "asc")
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const produtosFirebase = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Captura todas as URLs de imagens válidas e as pré-carrega convertendo para Base64
      const mapaImagens = {};
      for (const prod of produtosFirebase) {
        if (prod.imagem && !mapaImagens[prod.imagem]) {
          const base64 = await obterImagemBase64(prod.imagem);
          if (base64) mapaImagens[prod.imagem] = base64;
        }
      }
      setImagensCarregadas(mapaImagens);

      const estrutura = {
        ...cardapioSteinberg,
        categorias: cardapioSteinberg.categorias.map(cat => ({
          ...cat,
          subcategorias: cat.subcategorias.map(sub => {
            const itensAtualizados = sub.itens.map(itemLocal => {
              const itemFirebase = produtosFirebase.find(prod => prod.id === itemLocal.id);
              return itemFirebase ? { ...itemLocal, ...itemFirebase } : itemLocal;
            });
            
            return {
              ...sub,
              itens: itensAtualizados.filter(item => item.ativo !== false)
            };
          })
        }))
      };

      setCardapioSincronizado(estrutura);
    }, (error) => {
      console.error("Erro ao sincronizar dados para o PDF:", error);
    });

    return () => unsubscribe();
  }, [empresa?.id]);

  const dispararDownloadPdf = () => {
    if (!cardapioSincronizado) return alert("Os dados do cardápio ainda estão carregando.");
    
    setGerando(true);
    const elemento = cardapioAreaRef.current;

    const opcoes = {
      margin: 12,
      filename: `cardapio-impresso-${empresa?.slug || "restaurante"}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { 
        scale: 2, 
        useCORS: true, 
        letterRendering: true 
      },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" }
    };

    html2pdf()
      .set(opcoes)
      .from(elemento)
      .save()
      .then(() => setGerando(false))
      .catch((err) => {
        console.error("Erro na geração do PDF:", err);
        setGerando(false);
      });
  };

  if (!empresa) return null;

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-200/80 max-w-4xl mx-auto my-6 text-stone-800">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-stone-200 pb-4 mb-6 gap-4">
        <div>
          <h3 className="text-lg font-bold text-stone-900">🖨️ Gerador de Cardápio Físico (Mesa)</h3>
          <p className="text-sm text-stone-500">Gere um arquivo PDF otimizado em alta definição para imprimir e colocar nas mesas físicas.</p>
        </div>
        <button
          onClick={dispararDownloadPdf}
          disabled={gerando || !cardapioSincronizado}
          className="w-full sm:w-auto bg-stone-900 hover:bg-stone-800 text-amber-500 font-bold px-6 py-3 rounded-xl shadow-md transition duration-150 disabled:opacity-50 whitespace-nowrap"
        >
          {gerando ? "⏳ Processando PDF..." : "📥 Baixar PDF Impressão"}
        </button>
      </div>

      <div className="border border-stone-300 rounded-xl bg-stone-100 p-4 max-h-[400px] overflow-y-auto shadow-inner">
        <p className="text-xs text-center text-stone-400 font-mono mb-2 uppercase tracking-widest">--- Início da Pré-visualização do PDF ---</p>
        
        <div 
          ref={cardapioAreaRef} 
          className="bg-[#faf9f6] p-10 text-stone-900 shadow-sm mx-auto font-sans"
          style={{ width: "100%", maxWidth: "210mm", minHeight: "297mm" }}
        >
          <div className="text-center border-b-2 border-stone-800 pb-4 mb-8">
            <h1 className="font-serif text-5xl font-bold text-[#3d2314] tracking-wide uppercase">
              {empresa.nome}
            </h1>
            <p className="text-xs font-sans text-stone-500 mt-1 uppercase tracking-widest font-medium">
              Eco Village & Restaurante
            </p>
          </div>

          {cardapioSincronizado?.categorias?.map((categoria) => {
            const totalItens = categoria.subcategorias.reduce((acc, sub) => acc + sub.itens.length, 0);
            if (totalItens === 0) return null;

            return (
              <div key={categoria.id} className="mb-10 block break-inside-avoid">
                <h2 className="font-serif text-2xl font-bold text-[#3d2314] border-b border-[#3d2314] pb-1 mb-5 uppercase tracking-wider">
                  {categoria.nome}
                </h2>

                <div className="grid grid-cols-2 gap-x-10 gap-y-6">
                  {categoria.subcategorias.map((sub) => 
                    sub.itens.map((item) => {
                      // Se houver uma conversão Base64 salva para esta imagem, usamos ela no PDF
                      const imagemSegura = imagensCarregadas[item.imagem] || item.imagem;

                      return (
                        <div key={item.id} className="border-b border-stone-300/40 pb-3 pt-1 flex gap-4 items-center justify-between break-inside-avoid">
                          <div className="flex-1">
                            <div className="flex justify-between items-baseline gap-2">
                              <h3 className="font-serif font-bold text-sm text-[#3d2314] leading-tight">
                                {item.nome}
                                {item.quantidade && (
                                  <span className="font-sans font-normal text-[11px] text-stone-400 ml-2 italic whitespace-nowrap">
                                    {item.quantidade}
                                  </span>
                                )}
                              </h3>
                              <span className="font-serif font-bold text-sm text-[#3d2314] whitespace-nowrap">
                                R$ {item.preco?.toFixed(2)}
                              </span>
                            </div>
                            
                            {item.descricao && (
                              <p className="text-[11px] text-stone-500 font-sans mt-1 leading-normal max-w-[95%]">
                                  {item.descricao}
                              </p>
                            )}
                          </div>

                          {item.imagem && (
                            <div className="w-16 h-16 rounded-xl overflow-hidden bg-stone-100 flex-shrink-0 border border-stone-200">
                              <img 
                                src={imagemSegura} 
                                alt={item.nome}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
          
          <div className="mt-12 pt-6 border-t-2 border-stone-800 flex justify-between items-center text-[10px] text-stone-500 font-sans uppercase tracking-wider gap-2">
            <span>* 10% de taxa de serviço opcional</span>
            <span className="font-bold text-[#3d2314] font-serif">{empresa.nome}</span>
            <span>Não cobramos couvert artístico</span>
          </div>

        </div>
        <p className="text-xs text-center text-stone-400 font-mono mt-4 uppercase tracking-widest">--- Fim da Pré-visualização do PDF ---</p>
      </div>

    </div>
  );
}
