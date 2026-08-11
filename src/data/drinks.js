// ======================================================
// DRINKS
// ======================================================

const drinks = {

  id: "drinks",

  categoria: "Drinks",
  secoes: [

    // ======================================================
    // AUTORAIS
    // ======================================================

    {
      tipo: "subcategoria",
      titulo: "Autorais",

      produtos: [
        {
          id: "bacurau",
          nome: "Bacurau",
          descricao:
            "Cachaça amburana, cordial de capim limão, maracujá e tônica.",
          preco: 39
        },
        {
          id: "la-dolce-vitta",
          nome: "La Dolce Vitta",
          descricao:
            "Cachaça amburana, morangos, manjericão, calda de gengibre e angostura.",
          preco: 39
        },
        {
          id: "sunset-chill",
          nome: "Sunset Chill",
          descricao:
            "Gin, Aperol, suco de laranja, mel, espumante brut e alecrim.",
          preco: 38
        },
        {
          id: "brisa-raiz",
          nome: "Brisa Raiz",
          descricao:
            "Cachaça amburana, calda de gengibre, capim limão, limão siciliano, camomila e clara de ovo.",
          preco: 34
        },
        {
          id: "clericot",
          nome: "Clericot na Taça",
          descricao:
            "Vinho branco, espumante brut, suco de limão, uva, morango, limão, laranja e hortelã.",
          preco: 39
        },
        {
          id: "coracao-selvagem",
          nome: "Coração Selvagem",
          descricao:
            "Vodka, calda de framboesa, suco de limão, hortelã, gengibre e espumante brut.",
          preco: 38
        },
        {
          id: "berry-melon",
          nome: "Berry Melon",
          descricao:
            "Gin, morango, hortelã e Red Bull Melancia.",
          preco: 39
        },
        {
          id: "essencia-da-terra",
          nome: "Essência da Terra",
          descricao:
            "Vodka, suco de limão, geleia de frutas vermelhas e hortelã.",
          preco: 33
        },
        {
          id: "flor-da-mata",
          nome: "Flor da Mata",
          descricao:
            "Vodka, morango, framboesa, limão, laranja e calda de gengibre.",
          preco: 39
        }
      ]
    },

    // ======================================================
    // CLÁSSICOS
    // ======================================================

    {
      tipo: "subcategoria",
      titulo: "Clássicos",
      produtos: [
        {
          id: "whisky-smash",
          nome: "Whisky Smash",
          descricao:
            "Whisky, limão siciliano, hortelã, xarope de açúcar e água com gás.",
          preco: 38
        },

        {
          id: "penicillin",
          nome: "Penicillin",
          descricao:
            "Whisky Scotch Johnnie Walker Red Label.",
          preco: 38
        },

        {
          id: "whisky-sour",
          nome: "Whisky Sour",
          descricao:
            "Whisky, limão, calda de açúcar e clara de ovo.",
          preco: 35
        },

        {
          id: "negroni",
          nome: "Negroni",
          descricao:
            "Gin, Vermute Rosso e Campari.",
          preco: 39
        },

        {
          id: "cosmopolitan",
          nome: "Cosmopolitan",
          descricao:
            "Vodka, limão, Cointreau, framboesa e morango.",
          preco: 37
        },

        {
          id: "banheiro",
          nome: "Banheiro",
          descricao:
            "Cachaça amburana, calda de açúcar, limão, vinho tinto seco e espuma de gengibre.",
          preco: 35
        },

        {
          id: "aperol-spritz",
          nome: "Aperol Spritz",
          descricao:
            "Aperol, espumante brut, água com gás e laranja.",
          preco: 39
        },

        {
          id: "moscow-mule",
          nome: "Moscow Mule",
          descricao:
            "Vodka, calda de gengibre, suco de limão, tônica e espuma cítrica.",
          preco: 35
        },

        {
          id: "red-bull-gin",
          nome: "Red Bull Gin",
          descricao:
            "Gin com Red Bull Tropical ou Melancia.",
          preco: 35
        },

        {
          id: "mojito",
          nome: "Mojito",
          descricao:
            "Rum Silver, hortelã, suco de limão, xarope de açúcar e água com gás.",
          preco: 32
        },
        {
          id: "caipirinha",
          nome: "Caipirinha",
          descricao:
            "Escolha o sabor.",
          variacoes: [
            {
              nome: "Limão Tahiti",
              preco: 30
            },
            {
              nome: "Morango",
              preco: 33
            }
          ]
        },
        {
          id: "caipiroska",
          nome: "Caipiroska",
          descricao:
            "Escolha o sabor.",
          variacoes: [
            {
              nome: "Limão Tahiti",
              preco: 32
            },
            {
              nome: "Morango",
              preco: 35
            }
          ]
        },
        {
          id: "gin-tonica",
          nome: "Gin Tônica",
          descricao:
            "Gin e água tônica.",
          preco: 29
        }
      ]
    }
  ]
};
export default drinks;