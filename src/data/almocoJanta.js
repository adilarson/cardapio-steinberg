// ======================================================
// ALMOÇO E JANTA
// ======================================================

const almocoJanta = {
  id: "almoco-janta",

  categoria: "Almoço e Janta",

  horarios: {
    Almoco: "Sábados e domingos das 11h30 às 16h00",
    Janta: "Sextas e sábados das 19h00 às 22h30 e domingos das 18h00 às 20h00"
  },

  secoes: [

    // ======================================================
    // ENTRADAS
    // ======================================================

    {
      tipo: "subcategoria",
      titulo: "Entradas",

      produtos: [

        {
          id: "croqueta-carne-panela",
          nome: "Croqueta de carne de panela",
          quantidade: "6 un.",
          descricao:
            "Carne de panela desfiada com delicioso molho branco e frito até a crocância perfeita. Acompanha molho Steinberg.",
          preco: 49
        },

        {
          id: "batata-frita",
          nome: "Batata frita",
          quantidade: "500g",
          descricao:
            "Batata fininha e crocante, com toque de sal defumado. Acompanha molho Steinberg.",
          preco: 26
        },

        {
          id: "polenta-frita",
          nome: "Polenta frita",
          quantidade: "500g",
          descricao:
            "Polenta frita e finalizada com parmesão e orégano. Acompanha molho Steinberg.",
          preco: 27
        },

        {
          id: "focaccia-casa",
          nome: "Focaccia da casa",
          descricao:
            "Focaccia de longa fermentação, servida com geleia da casa e manteiga artesanal.",
          preco: 39
        },

        {
          id: "provoleta",
          nome: "Provoleta grelhada",
          descricao:
            "Provoleta grelhada ao chimichurri com tomates confit.",
          preco: 35
        }

      ]
    },

    // ======================================================
    // SALADAS DA HORTA
    // ======================================================

    {
      tipo: "subcategoria",
      titulo: "Saladas da Horta",

      produtos: [

        {
          id: "salada-caprese",
          nome: "Salada Caprese",
          descricao:
            "Folhas verdes frescas, mussarela de búfala, tomates confitados, pesto de ervas e uma fatia de focaccia.",
          preco: 59
        },

        {
          id: "salada-steinberg",
          nome: "Salada Steinberg",
          descricao:
            "Folhas verdes frescas, picles de cenoura, tomate cereja, lascas de parmesão, croutons de brioche, molho Steinberg e terra salgada.",
          preco: 37,

          adicionais: [

            {
              nome: "Adicional de frango",
              quantidade: "150g",
              preco: 10
            },

            {
              nome: "Adicional de filé",
              quantidade: "150g",
              preco: 32
            }

          ]
        }

      ]
    },
        // ======================================================
    // CARNES DA PARRILLA
    // ======================================================

    {
      tipo: "subcategoria",
      titulo: "Carnes da Parrilla",

      produtos: [

        {
          id: "picanha",
          nome: "Picanha",
          quantidade: "500/600g",
          descricao:
            "Grelhada e fatiada acompanhada de farofa e chimichurri.",
          preco: 182
        },

        {
          id: "entrecot",
          nome: "Entrecot",
          quantidade: "500g",
          descricao:
            "Corte nobre e suculento acompanhado de farofa e chimichurri.",
          preco: 115
        }

      ],

      acompanhamentos: [

        {
          nome: "Arroz branco",
          preco: 14
        },

        {
          nome: "Legumes assados",
          preco: 14
        },

        {
          nome: "Maionese de batata",
          preco: 19
        },

        {
          nome: "Pão de alho",
          preco: 24
        }

      ]
    },

    // ======================================================
    // SUGESTÃO DO CHEF
    // ======================================================

    {
      tipo: "destaque",

      titulo: "Sugestão do Chef",

      produtos: [

        {
          id: "entrecot-para-dois",

          nome: "Entrecot para dois",

          descricao:
            "Corte nobre e suculento (500g) com provoleta grelhada, tomates confit e chimichurri. Acompanha mini salada Steinberg, arroz branco, pão de alho e farofa.",

          preco: 170,

          serve: "2 pessoas"
        }

      ]
    },

    // ======================================================
    // PRATOS PRINCIPAIS
    // ======================================================

    {
      tipo: "subcategoria",

      titulo: "Pratos Principais",

      produtos: [

        {
          id: "parmegiana",

          nome: "Parmegiana",

          descricao:
            "Filé mignon empanado e frito (250g) com molho de tomate rústico, presunto, pesto e fonduta de provolone. Acompanha arroz, mini salada verde e batata frita.",

          preco: 115
        },

        {
          id: "file-aos-formaggios",

          nome: "Filé aos formaggios",

          descricao:
            "Filé grelhado (500g), molho quatro queijos, crispy de bacon e cebola crispy. Acompanha arroz e mini salada.",

          preco: 170
        },

        {
          id: "tagliatelle-gorgonzola",

          nome: "Tagliatelle ao gorgonzola",

          descricao:
            "Tagliatelle ao molho de gorgonzola, entrecot grelhado (250g) ao demi glacê, crispy de cebola e azeite de ervas.",

          preco: 89
        },

        {
          id: "farcito",

          nome: "Farcito",

          descricao:
            "Filé mignon empanado e frito (250g) com molho gorgonzola e parmesão gratinado. Acompanha arroz, mini salada verde e batata frita.",

          preco: 115
        },

        {
          id: "mignon-italiano",

          nome: "Mignon italiano",

          descricao:
            "Risoto cremoso de tomate assado, filé mignon grelhado (250g), demi glace, tomate confit, pesto, crispy de couve e redução de balsâmico.",

          preco: 111
        },

        {
          id: "kids-file",

          nome: "Kids Filé",

          descricao:
            "Massa tagliatelle ao molho sugo, filé grelhado (150g), mini salada e fritas.",

          preco: 68
        },

        {
          id: "kids-frango",

          nome: "Kids Frango",

          descricao:
            "Arroz branco, frango grelhado, mini salada e batatinha frita.",

          preco: 41
        }
      ]
    }
  ]
};

export default almocoJanta;