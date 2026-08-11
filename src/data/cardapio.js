import almocoJanta from "./almocoJanta";
import petiscos from "./petiscos";
import combos from "./combos";
import sobremesas from "./sobremesas";
import bebidas from "./bebidas";
import drinks from "./drinks";
import vinhos from "./vinhos";
// import evento from "./evento";

// Função auxiliar para extrair produtos com segurança se a categoria for um objeto com seções,
// ou retornar o próprio dado caso ele já seja uma lista pura (array).
const extrairProdutos = (dados) => {
  if (!dados) return [];
  if (Array.isArray(dados)) return dados;
  if (dados.secoes && Array.isArray(dados.secoes)) {
    return dados.secoes.flatMap(secao => secao.produtos || []);
  }
  return [];
};

const cardapio = [
  ...extrairProdutos(almocoJanta),
  ...extrairProdutos(petiscos),
  ...extrairProdutos(combos),
  ...extrairProdutos(sobremesas),
  ...extrairProdutos(bebidas),
  ...extrairProdutos(drinks),
  ...extrairProdutos(vinhos),
  // ...extrairProdutos(evento),
];

export default cardapio;
