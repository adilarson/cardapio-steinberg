import React,{useState,useEffect,useMemo} from "react";
import {useParams,useNavigate} from "react-router-dom";
import {db} from "../firebase";
import {collection,query,orderBy,onSnapshot,addDoc} from "firebase/firestore";
import {useEmpresa} from "../context/EmpresaContext";
import cardapioSteinberg from "../data/cardapioSteinberg";
import Header from "../components/Header";
import CategoriaTabs from "../components/CategoriaTabs";
import ProdutoCard from "../components/ProdutoCard";
import Carrinho from "../components/Carrinho";
import ConfiguradorProduto from "../components/ConfiguradorProduto";
import ContaMesa from "../components/ContaMesa"; // Importação mantida com segurança
import evento from "../data/evento";

export default function Cliente(){

const {restaurantSlug}=useParams();
const navigate=useNavigate();
const {empresa,carregarRestaurantePorSlug,carregando}=useEmpresa();

const [categoriaAtiva,setCategoriaAtiva]=useState("Almoço e Janta");
const [subcategoriaAtiva,setSubcategoriaAtiva]=useState(null);
const [numeroMesa,setNumeroMesa]=useState("Principal");
const [carrinho,setCarrinho]=useState([]);
const [clickCount,setClickCount]=useState(0);
const [mostrarMenuSecreto,setMostrarMenuSecreto]=useState(false);
const [produtoSelecionado,setProdutoSelecionado]=useState(null);
const [mostrarConfigurador,setMostrarConfigurador]=useState(false);
const [mostrarContaMesa, setMostrarContaMesa] = useState(false); // Mantém o controle da conta parcial
const [cardapio,setCardapio]=useState(cardapioSteinberg);
const [avisoFlutuante,setAvisoFlutuante]=useState({
 visivel:false,
 texto:"",
 tipo:"sucesso"
});

useEffect(()=>{
 if(restaurantSlug){
  carregarRestaurantePorSlug(restaurantSlug);
 }
},[restaurantSlug]);

useEffect(()=>{
 const params=new URLSearchParams(window.location.search);
 const mesa=params.get("mesa");
 if(mesa) setNumeroMesa(mesa);
},[]);

useEffect(()=>{
 if(!empresa?.id) return;
 const q=query(
  collection(db,"restaurantes",empresa.id,"produtos"),
  orderBy("ordem","asc")
 );
 const unsub=onSnapshot(q,(snapshot)=>{
  const produtosFirebase=snapshot.docs.map(doc=>({
   id:doc.id,
   ...doc.data()
  }));
  const estrutura={
   ...cardapioSteinberg,
   categorias:cardapioSteinberg.categorias.map(cat=>({
    ...cat,
    subcategorias:cat.subcategorias.map(sub=>({
     ...sub,
     itens:sub.itens.map(itemLocal => {
      const itemFirebase = produtosFirebase.find(prod => prod.id === itemLocal.id);
      return itemFirebase ? { ...itemLocal, ...itemFirebase } : itemLocal;
     }).filter(item => item.ativo !== false)
    }))
   }))
  };
  setCardapio(estrutura);
 });
 return()=>unsub();
},[empresa?.id]);

const removerItem=(i)=>{
setCarrinho(prev=>
prev.filter((_,index)=>index!==i)
);
};

const enviarPedidoAoFirebase=async(observacaoPedido="")=>{
if(!empresa?.id||carrinho.length===0) return;
const agora=new Date();
await addDoc(
collection(db,"restaurantes",empresa.id,"pedidos"),
{
mesa: numeroMesa,
itens:carrinho,
observacao:observacaoPedido,
status:"Pendente",
hora:agora.toLocaleTimeString("pt-BR",{
hour:"2-digit",
minute:"2-digit"
}),
timestamp:new Date()
}
);
setCarrinho([]);
dispararAviso("Pedido enviado com sucesso!");
};

const handleLogoClick=()=>{
const n=clickCount+1;
setClickCount(n);
if(n>=5){
setClickCount(0);
setMostrarMenuSecreto(true);
}
};

const dispararAviso=(texto,tipo="sucesso")=>{
setAvisoFlutuante({visivel:true,texto,tipo});
setTimeout(()=>{
setAvisoFlutuante({
visivel:false,
texto:"",
tipo:"sucesso"
});
},5000);
};

const adicionarAoCarrinho = (produto) => {
  setCarrinho(prev => [
    ...prev,
    {
      ...produto,
      // CORREÇÃO DA OBSERVAÇÃO: Mapeia para os dois campos para garantir o recebimento na Cozinha
      observacao: produto.observacao || "",
      observacaoDoConfigurador: produto.observacao || produto.observacaoDoConfigurador || "",
      medida: produto.quantidade && typeof produto.quantidade === "string" ? produto.quantidade : "",
      quantidade: 1, 
      precoUnitario: Number(produto.precoFinal ?? produto.preco) || 0
    }
  ]);
  dispararAviso(`${produto.nome} adicionado ao pedido!`);
};

const abrirConfigurador = (produto) => {
  if (produto.configuradores?.length) {
    setProdutoSelecionado(produto);
    setMostrarConfigurador(true);
    return;
  }
  adicionarAoCarrinho(produto);
};

const aumentarQuantidade=(i)=>{
setCarrinho(prev=>
prev.map((item,index)=>
index===i
?{
...item,
quantidade:(Number(item.quantidade)||1)+1
}
:item
)
);
};

const diminuirQuantidade=(i)=>{
setCarrinho(prev=>
prev.flatMap((item,index)=>{
if(index!==i) return item;
const qtd=(Number(item.quantidade)||1)-1;
if(qtd<=0) return [];
return{
...item,
quantidade:qtd
};
})
);
};

if(carregando) return <div className="p-8 text-center font-serif text-stone-600">Carregando cardápio...</div>;
if(!empresa) return <div className="p-8 text-center text-stone-600">Restaurante não encontrado.</div>;

const BlackListCategorias = ["Todos"];
const categorias = (cardapio?.categorias || []).filter(cat => !BlackListCategorias.includes(cat.nome));
const categoriaSelecionada = categorias.find(cat => cat.nome === categoriaAtiva);

  return (
    <div className="min-h-screen bg-[#faf9f6] text-stone-900 pb-36 font-sans antialiased">
      {avisoFlutuante.visivel && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-[#3d2314] text-amber-400 px-6 py-3 rounded-xl shadow-xl font-serif text-sm">
          {avisoFlutuante.texto}
        </div>
      )}

      {mostrarMenuSecreto && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white rounded-2xl p-6 w-80 text-stone-800">
            <h2 className="text-xl font-bold mb-5">Painel Operacional</h2>
            <button
              onClick={() => navigate(`/${empresa.slug}/painel/cozinha`)}
              className="w-full bg-stone-900 text-amber-500 py-3 rounded-xl mb-3 font-bold"
            >
              🍳 Cozinha
            </button>
            <button
              onClick={() => navigate(`/${empresa.slug}/painel/garcom`)}
              className="w-full bg-amber-800 text-white py-3 rounded-xl mb-3 font-bold"
            >
              🔔 Garçom
            </button>
            <button onClick={() => setMostrarMenuSecreto(false)} className="w-full bg-stone-200 py-2 rounded-xl font-medium">
              Fechar
            </button>
          </div>
        </div>
      )}

      <Header numeroMesa={numeroMesa} handleLogoClick={handleLogoClick} />
      
      <CategoriaTabs
        categorias={categorias}
        categoriaAtiva={categoriaAtiva}
        setCategoriaAtiva={(nome) => {
          setCategoriaAtiva(nome);
          setSubcategoriaAtiva(null);
        }}
      />

     <main className="max-w-4xl mx-auto px-4 md:px-8 mt-6">
  
  {/* BOTÃO DE CONTA INTEGRADO NO TOPO - CORRIGIDO PARA setMostrarContaMesa */}
  <div className="flex justify-end mb-4">
    <button
      onClick={() => setMostrarContaMesa(true)}
      className="bg-[#3d2314] hover:bg-[#2b180d] text-amber-400 font-serif text-xs font-bold px-5 py-2.5 rounded-xl shadow-md flex items-center gap-2 uppercase tracking-wide transition"
    >
      📊 Ver Extrato da Mesa
    </button>
  </div>

  {/* Linha Divisória Compacta e Sem Título Duplicado */}
  <div className="text-center border-b-2 border-stone-800 pb-4 mb-6">
    <div className="inline-block bg-[#3d2314] text-amber-400 font-serif text-[10px] md:text-xs px-5 py-1.5 rounded-full tracking-wider shadow-sm uppercase">
      📌 Toque em qualquer item para pedir na Mesa {numeroMesa}
      </div>
      </div>

        {categoriaSelecionada && (
          <>
            {categoriaSelecionada.horario && (
              <div className="bg-[#f5f2eb] border border-stone-300/60 rounded-xl p-4 mb-8 font-sans text-stone-800 shadow-sm max-w-xl mx-auto">
                <h3 className="font-serif font-bold text-[#3d2314] mb-2 flex items-center gap-2">
                  🕒 Horários de Funcionamento
                </h3>
                {categoriaSelecionada.horario.almoco && (
                  <p className="text-xs leading-relaxed">
                    <strong className="text-[#3d2314]">Almoço:</strong> {categoriaSelecionada.horario.almoco}
                  </p>
                )}
                {categoriaSelecionada.horario.janta && (
                  <p className="text-xs leading-relaxed mt-0.5">
                    <strong className="text-[#3d2314]">Janta:</strong> {categoriaSelecionada.horario.janta}
                  </p>
                )}
                {categoriaSelecionada.horario.texto && (
                  <p className="text-xs leading-relaxed">{categoriaSelecionada.horario.texto}</p>
                )}
              </div>
            )}

            {categoriaSelecionada.subcategorias.map((subcategoria) => {
              if (subcategoria.itens.length === 0) return null;
              return (
                <div key={subcategoria.nome} className="mb-10">
                  <div className="flex items-center gap-3 mb-5 border-b border-[#3d2314]/30 pb-1">
                    <h2 className="text-xl font-serif font-bold text-[#3d2314] uppercase tracking-wider">
                      {subcategoria.nome}
                    </h2>
                    {subcategoria.destaque && (
                      <span className="bg-[#3d2314] text-amber-400 text-[10px] px-2.5 py-0.5 rounded-full font-serif uppercase tracking-wider font-bold">
                        ★ Destaque
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                    {subcategoria.itens.map((item) => (
                      <div 
                        key={item.id} 
                        onClick={() => abrirConfigurador(item)}
                        className="border-b border-stone-300/40 pb-3 flex gap-4 items-start justify-between cursor-pointer hover:bg-stone-100/40 p-1 rounded-lg transition duration-150 group"
                      >
                        <div className="flex-1">
                          <div className="flex justify-between items-baseline gap-2">
                            <h3 className="font-serif font-bold text-sm text-[#3d2314] leading-tight group-hover:text-amber-800 transition">
                              {item.nome}
                              {item.medida && (
                                <span className="font-sans font-normal text-[10px] text-stone-400 ml-2 italic whitespace-nowrap">
                                  {item.medida}
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
                          <span className="text-[10px] font-bold text-amber-800 font-serif tracking-wider uppercase mt-1 inline-block opacity-60 group-hover:opacity-100 transition">
                            + Escolher & Pedir
                          </span>
                        </div>

                        {item.imagem && (
                          <div className="w-14 h-14 rounded-xl overflow-hidden bg-stone-200 flex-shrink-0 border border-stone-300/60 shadow-sm group-hover:scale-105 transition duration-200">
                            <img src={item.imagem} alt={item.nome} className="w-full h-full object-cover" loading="lazy" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </>
        )}

        <div className="mt-12 pt-6 border-t border-stone-300 flex flex-col sm:flex-row justify-between items-center text-[10px] text-stone-400 uppercase tracking-wider gap-2">
          <span>* 10% de taxa de serviço opcional</span>
          <span className="font-bold text-[#3d2314] font-serif">{empresa.nome}</span>
          <span>Não cobramos couvert artístico</span>
        </div>
      </main>

      <ConfiguradorProduto
        aberto={mostrarConfigurador}
        produto={produtoSelecionado}
        onClose={() => {
          setMostrarConfigurador(false);
          setProdutoSelecionado(null);
        }}
        onAdicionar={(produtoConfigurado) => {
          adicionarAoCarrinho(produtoConfigurado);
          setMostrarConfigurador(false);
          setProdutoSelecionado(null);
        }}
      />

      <Carrinho
        carrinho={carrinho}
        numeroMesa={numeroMesa}
        enviarPedidoAoFirebase={enviarPedidoAoFirebase}
        aumentarQuantidade={aumentarQuantidade}
        diminuirQuantidade={diminuirQuantidade}
        removerItem={removerItem}
      />

        {/* BLOCCO CORRIGIDO NO FINAL DO CLIENTE.JSX */}
        {mostrarContaMesa && (
      <ContaMesa 
       restaurantSlug={restaurantSlug} 
       numeroMesa={numeroMesa} 
       onClose={() => setMostrarContaMesa(false)} 
      />
     )}
    </div>
  );
}
