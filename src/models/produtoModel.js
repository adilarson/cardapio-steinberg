export const produtoModel = {
  id: "", // ID único (ex: slug gerado pelo nome ou ID do Firestore)
  nome: "",
  descricao: "",
  quantidade: "", // Novo: Para armazenar pesos/unidades (ex: "500g", "6 un.")
  serve: "",      // Novo: Para combos e pratos grandes (ex: "2 pessoas")
  
  // Vínculos estruturais indispensáveis para o SaaS organizar o cardápio
  categoria: "",    // Ex: "Almoço e Janta", "Drinks", "Bebidas"
  subcategoria: "", // Novo: Ex: "Entradas", "Autorais", "Doses"
  
  preco: 0,
  imagem: "",
  ativo: true,
  ordem: 0, // Novo: Para o orderBy("ordem") que o seu Cliente.jsx utiliza
  
  configuradores: [
    // Exemplo:
    // {
    //   tipo: "radio",
    //   titulo: "Ponto da Carne",
    //   campo: "pontoCarne",
    //   opcoes: ["Mal passada", "Ao ponto", "Bem passada"]
    // }
  ]
};
