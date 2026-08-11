import React, { useState, useEffect } from "react";
import { useEmpresa } from "../context/EmpresaContext";
import { carregarConfiguradoresDoProduto } from "../services/configuradorService";

export default function ConfiguradorProduto({
  aberto,
  produto,
  onClose,
  onAdicionar
}) {
  const [selecoes, setSelecoes] = useState({});
  const [observacao, setObservacao] = useState("");
  const [quantidade, setQuantidade] = useState(1);
  const { empresa } = useEmpresa();
  const [configuradores, setConfiguradores] = useState([]);

  useEffect(() => {
    if (!produto || !empresa?.id) return;

    async function carregar() {
      const lista = await carregarConfiguradoresDoProduto(empresa.id, produto.id);
      setConfiguradores(lista || []);
      setSelecoes({});
      setObservacao("");
      setQuantidade(1);
    }

    carregar();
  }, [produto, empresa?.id]);

  const alterarSelecao = (campo, opcao, isCheckbox = false) => {
    if (isCheckbox) {
      const selecionados = selecoes[campo] ?? [];
      if (selecionados.includes(opcao)) {
        setSelecoes(prev => ({
          ...prev,
          [campo]: selecionados.filter(item => item !== opcao)
        }));
      } else {
        setSelecoes(prev => ({
          ...prev,
          [campo]: [...selecionados, opcao]
        }));
      }
    } else {
      setSelecoes(prev => ({
        ...prev,
        [campo]: opcao
      }));
    }
  };

  function atualizarCampo(campo, valor) {
    setSelecoes(prev => ({
      ...prev,
      [campo]: valor
    }));
  }

  // CORRIGIDO: Agora varre os configuradores usando 'campo' e valida strings ou objetos
    // CORRIGIDO: Proteção contra itens sem configuradores ou preços inválidos (Previne o NaN)
  const calcularPrecoUnitario = () => {
    if (!produto) return 0;
    
    // Força a conversão do preço para número absoluto, prevenindo strings quebradas
    let total = Number(produto.preco) || 0;

    // Se o produto não tiver configuradores cadastrados, retorna o preço base direto
    if (!configuradores || !Array.isArray(configuradores) || configuradores.length === 0) {
      return total;
    }

    configuradores.forEach(grupo => {
      const valorSelecionado = selecoes[grupo.campo];
      if (!valorSelecionado) return;

      if (Array.isArray(valorSelecionado)) {
        valorSelecionado.forEach(item => {
          const opcaoObj = grupo.opcoes?.find(o => (o.nome ?? o) === item);
          if (opcaoObj && typeof opcaoObj === "object") {
            total += Number(opcaoObj.preco) || 0;
          }
        });
      } else {
        const opcaoObj = grupo.opcoes?.find(o => (o.nome ?? o) === valorSelecionado);
        if (opcaoObj && typeof opcaoObj === "object") {
          total += Number(opcaoObj.preco) || 0;
        }
      }
    });

    return total;
  };

  const precoUnitario = calcularPrecoUnitario();
  const precoTotalGeral = precoUnitario * quantidade;

  const confirmar = () => {
    const produtoFinal = {
      ...produto,
      quantidade,
      observacaoDoConfigurador: observacao, // Evita colidir com a descrição do produto
      configuracoes: selecoes,
      precoUnitario: precoUnitario,
      precoFinal: precoTotalGeral
    };
    onAdicionar(produtoFinal);
  };

  if (!aberto || !produto) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex justify-center items-end">
      <div className="bg-white w-full max-w-md rounded-t-3xl shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header do Modal */}
        <div className="flex justify-between items-center border-b border-stone-200 px-6 py-5 flex-shrink-0">
          <div>
            <h2 className="text-2xl font-bold text-stone-900">{produto.nome}</h2>
            <p className="text-stone-500 text-sm">Configure seu pedido</p>
          </div>
          <button onClick={onClose} className="text-2xl text-stone-400 hover:text-stone-700">✕</button>
        </div>

        {/* Corpo com Scroll para telas de celular menores */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {configuradores.map((config, index) => (
            <div key={index} className="border-b border-stone-100 pb-4 last:border-0 last:pb-0">
              <h3 className="font-bold text-stone-800 mb-3 flex items-center justify-between">
                <span>{config.titulo}</span>
                {config.tipo === "radio" && <span className="text-xs text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md font-normal">Obrigatório</span>}
              </h3>
              
              {/* Opções estilo RADIO */}
              {config.tipo === "radio" && (
                <div className="space-y-3">
                  {config.opcoes.map((opcao, i) => {
                    const nomeOpcao = opcao.nome ?? opcao;
                    return (
                      <label key={i} className="flex items-center gap-3 cursor-pointer text-stone-700 select-none">
                        <input
                          type="radio"
                          name={config.campo}
                          checked={selecoes[config.campo] === nomeOpcao}
                          onChange={() => alterarSelecao(config.campo, nomeOpcao)}
                          className="w-4 h-4 text-amber-700 focus:ring-amber-500 border-stone-300"
                        />
                        <span className="flex-1">{nomeOpcao}</span>
                        {opcao.preco > 0 && (
                          <span className="text-sm font-medium text-stone-500">+R$ {opcao.preco.toFixed(2)}</span>
                        )}
                      </label>
                    );
                  })}
                </div>
              )}

              {/* Opções estilo CHECKBOX */}
              {config.tipo === "checkbox" && (
                <div className="space-y-3">
                  {config.opcoes.map((opcao, i) => {
                    const nome = opcao.nome ?? opcao;
                    const selecionados = selecoes[config.campo] ?? [];
                    const marcado = selecionados.includes(nome);

                    return (
                      <label key={i} className="flex items-center justify-between cursor-pointer text-stone-700 select-none">
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={marcado}
                            onChange={() => alterarSelecao(config.campo, nome, true)}
                            className="w-4 h-4 text-amber-700 focus:ring-amber-500 border-stone-300 rounded"
                          />
                          <span>{nome}</span>
                        </div>
                        {opcao.preco > 0 && (
                          <span className="text-amber-700 font-semibold text-sm">
                            +R$ {opcao.preco.toFixed(2)}
                          </span>
                        )}
                      </label>
                    );
                  })}
                </div>
              )}

              {/* Opções estilo TEXTAREA */}
              {config.tipo === "textarea" && (
                <textarea
                  rows={3}
                  className="w-full border border-stone-200 rounded-xl p-3 bg-stone-50 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm resize-none"
                  placeholder="Deixe uma observação específica para este item..."
                  value={selecoes[config.campo] ?? ""}
                  onChange={(e) => atualizarCampo(config.campo, e.target.value)}
                />
              )}
            </div>
          ))}

          {/* Seletor de Quantidade do Item */}
          <div className="flex items-center justify-between pt-2 border-t border-stone-100">
            <span className="font-bold text-stone-800">Quantidade</span>
            <div className="flex items-center gap-4 bg-stone-100 px-3 py-2 rounded-xl">
              <button 
                type="button" 
                onClick={() => setQuantidade(q => Math.max(1, q - 1))}
                className="font-bold text-lg text-stone-500 hover:text-stone-900 w-6"
              >
                -
              </button>
              <span className="font-bold text-stone-900 w-4 text-center">{quantidade}</span>
              <button 
                type="button" 
                onClick={() => setQuantidade(q => q + 1)}
                className="font-bold text-lg text-stone-500 hover:text-stone-900 w-6"
              >
                +
              </button>
            </div>
          </div>
        </div>

        {/* Footer com o Preço Dinâmico e Botão */}
        <div className="border-t border-stone-200 p-5 bg-stone-50 flex-shrink-0 rounded-b-3xl">
          <button
            onClick={confirmar}
            className="w-full bg-amber-700 hover:bg-amber-800 text-white rounded-xl py-4 font-bold flex justify-between px-6 transition duration-150 shadow-md"
          >
            <span>Adicionar ao Pedido</span>
            <span>R$ {precoTotalGeral.toFixed(2)}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
