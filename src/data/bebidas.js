// ======================================================
// BEBIDAS
// ======================================================

const bebidas = {
  id: "bebidas",

  categoria: "Bebidas",

  secoes: [

    // ======================================================
    // BEBIDAS SEM ÁLCOOL
    // ======================================================

    {
      tipo: "subcategoria",
      titulo: "Bebidas sem álcool",

      produtos: [

        {
          id: "agua",
          nome: "Água",
          descricao: "Com ou sem gás",
          preco: 6
        },

        {
          id: "coca-cola",
          nome: "Coca-Cola",
          preco: 8
        },

        {
          id: "coca-cola-zero",
          nome: "Coca-Cola Zero",
          preco: 8
        },

        {
          id: "guarana",
          nome: "Guaraná",
          preco: 8
        },

        {
          id: "guarana-zero",
          nome: "Guaraná Zero",
          preco: 8
        },

        {
          id: "tonica",
          nome: "Tônica",
          preco: 8
        },

        {
          id: "red-bull",
          nome: "Red Bull",
          descricao: "Tradicional, Sem Açúcar, Tropical ou Melancia",
          preco: 15
        },

        {
          id: "suco-natural",
          nome: "Suco Natural",
          descricao: "Abacaxi, Abacaxi com hortelã, Laranja, Suco Verde ou Morango",
          quantidade: "300ml",
          preco: 14
        },

        {
          id: "suco-uva",
          nome: "Suco Integral de Uva",
          quantidade: "300ml",
          preco: 10
        }

      ]
    },

    // ======================================================
    // DRINKS SEM ÁLCOOL
    // ======================================================

    {
      tipo: "subcategoria",
      titulo: "Drinks sem álcool",

      produtos: [

        {
          id: "moscow-mule-zero",
          nome: "Moscow Mule",
          descricao: "Calda de gengibre, suco de limão, tônica e espuma cítrica",
          preco: 28
        },

        {
          id: "mojito-zero",
          nome: "Mojito",
          descricao: "Suco de limão, xarope de açúcar, hortelã e água com gás",
          preco: 25
        },

        {
          id: "bacurau-zero",
          nome: "Bacurau",
          descricao: "Cordial de capim limão, maracujá, suco de limão e tônica",
          preco: 25
        },

        {
          id: "la-dolce-vitta-zero",
          nome: "La Dolce Vitta",
          descricao: "Morangos, manjericão, suco de limão, calda de gengibre e água tônica",
          preco: 28
        },

        {
          id: "pink-lemonade",
          nome: "Pink Lemonade",
          descricao: "Suco de limão, xarope de açúcar, geleia de frutas vermelhas, hortelã e água com gás",
          preco: 28
        }

      ]
    },

    // ======================================================
    // CAFÉS
    // ======================================================

    {
      tipo: "subcategoria",
      titulo: "Cafés",

      produtos: [

        { id: "expresso", nome: "Expresso", preco: 7 },

        { id: "americano", nome: "Americano", preco: 7 },

        { id: "pingado", nome: "Pingado", preco: 7 },

        { id: "cappuccino", nome: "Cappuccino", preco: 7 },

        { id: "mocaccino", nome: "Mocaccino", preco: 7 },

        { id: "chocolate-cremoso", nome: "Chocolate Cremoso", preco: 9 },

        { id: "cafe-bule", nome: "Café passado no bule", preco: 16 }

      ]
    },

    // ======================================================
    // CHOPP & CERVEJAS
    // ======================================================

    {
      tipo: "subcategoria",
      titulo: "Chopp & Cervejas",

      produtos: [

        {
          id: "chopp-pilsen",
          nome: "Chopp Pilsen Artesanal",
          variacoes: [
            { tamanho: "300ml", preco: 14 },
            { tamanho: "500ml", preco: 17 }
          ]
        },

        {
          id: "chopp-heineken",
          nome: "Chopp Heineken",
          variacoes: [
            { tamanho: "300ml", preco: 16 },
            { tamanho: "500ml", preco: 20 }
          ]
        },

        {
          id: "chopp-ipa",
          nome: "Chopp IPA",
          variacoes: [
            { tamanho: "300ml", preco: 16 },
            { tamanho: "500ml", preco: 20 }
          ]
        },

        {
          id: "chopp-red-ale",
          nome: "Chopp Red Ale",
          variacoes: [
            { tamanho: "300ml", preco: 16 },
            { tamanho: "500ml", preco: 20 }
          ]
        },

        {
          id: "chopp-steinberg",
          nome: "Chopp Steinberg",
          descricao: "Blond Ale com especiarias",
          variacoes: [
            { tamanho: "300ml", preco: 15 },
            { tamanho: "500ml", preco: 18 }
          ]
        },

        {
          id: "heineken-long-neck",
          nome: "Heineken Long Neck",
          preco: 15
        },

        {
          id: "heineken-zero",
          nome: "Heineken Zero",
          preco: 15
        },

        {
          id: "corona",
          nome: "Corona",
          preco: 15
        },

        {
          id: "stella-sem-gluten",
          nome: "Stella sem glúten",
          preco: 15
        },

        {
          id: "balde-long-neck",
          nome: "Balde de Long Neck",
          descricao: "Escolha entre Heineken, Heineken Zero, Corona ou Stella sem glúten",
          quantidade: "5 long necks",
          preco: 70
        }

      ]
    },

    // ======================================================
    // DOSES
    // ======================================================

    {
      tipo: "subcategoria",
      titulo: "Doses",

      produtos: [

        {
          id: "tequila-cuervo",
          nome: "Tequila Jose Cuervo Reposado Gold",
          preco: 25
        },

        {
          id: "cachaca-weber",
          nome: "Cachaça Weber Haus Amburana",
          preco: 22
        },

        {
          id: "red-label",
          nome: "Whisky Johnnie Walker Red Label",
          preco: 24
        },

        {
          id: "bacardi-prata",
          nome: "Bacardi Prata",
          preco: 19
        },

        {
          id: "campari",
          nome: "Campari",
          preco: 20
        },

        {
          id: "gin-antiqua",
          nome: "Gin Weber Haus Antiqua",
          preco: 17
        }

      ]
    }

  ]
};

export default bebidas;