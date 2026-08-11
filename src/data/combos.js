// ======================================================
// COMBOS PRA DOIS
// ======================================================

const combos = {

  id: "combos-pra-dois",

  categoria: "Combos pra Dois",

  secoes: [

    // ======================================================
    // COMBOS ALMOÇO E JANTA
    // ======================================================
    {
      tipo: "subcategoria",
      titulo: "Combos Almoço e Janta",
      horarios: {
        almoco: "Sábados e domingos das 11h30 às 16h00",
        janta:
          "Sextas e sábados das 19h00 às 22h30 e domingos das 18h00 às 20h00"
      },
      destaque: {
        titulo: "Mais Vendidos",
        produtos: [
          {
            id: "combo-mais-vendidos",
            nome: "Combo dos Mais Vendidos",
            descricao:
              "Croqueta de carne de panela (6 un.), prato principal à escolha (Farcito ou Parmegiana), 1 Drink Coração Selvagem e 1 Chopp Pilsen Artesanal 300ml.",
            preco: 175
          }
        ]
      },
      produtos: [
        {
          id: "combo-essenciais",
          nome: "Combo Essenciais",
          descricao:
            "Salada Steinberg, Entrecot grelhado com farofa e chimichurri, Sobremesa Basca Clássica e 2 Taças de vinho tinto da casa.",
          preco: 207
        }
      ]
    },
    // ======================================================
    // COMBOS PETISCOS | SUNSET
    // ======================================================
    {
      tipo: "subcategoria",
      titulo: "Combos Petiscos | Sunset",
      horarios: {
        funcionamento:
          "Sextas das 17h30 às 22h30, sábados das 16h00 às 22h30 e domingos das 16h00 às 20h00"
      },
      produtos: [
        {
          id: "combo-por-do-sol",
          nome: "Combo Pôr do Sol",
          descricao:
            "Croqueta de carne de panela (6 un.), Polenta frita com parmesão e orégano, Focaccia da casa com geleia artesanal e 2 Drinks autorais à escolha.",
          preco: 164
        },
        {
          id: "combo-hamburgueria",
          nome: "Combo Hamburgueria",
          descricao:
            "1 Clássico Steinberg, 1 Bacon Burger, Batata frita com cheddar e bacon e 2 Chopps Pilsen Artesanal 500ml.",
          preco: 169
        },
        {
          id: "combo-vinhedos",
          nome: "Combo Vinhedos",
          descricao:
            "Pizza Steinberg ou 4 Maggio, Bruschetta à escolha e 1 Garrafa de vinho à escolha (Miolo Seleção Rosé ou Becas Sauvignon Blanc).",
          preco: 242
        },
        {
          id: "combo-frituras",
          nome: "Combo Frituras Modo ON",
          descricao:
            "Frango crocante 500g, Bolinho de batata (6 un.), Batata com cheddar e bacon 500g e Polenta frita 500g.",
          preco: 135
        }
      ]
    }
  ]
};
export default combos;