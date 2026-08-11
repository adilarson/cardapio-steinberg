// ======================================================
// PETISCOS / SUNSET
// ======================================================

const petiscos = {

  id: "petiscos-sunset",
  categoria: "Petiscos / Sunset",
  horarios: {
    funcionamento:
      "Sextas das 17h30 às 22h30, sábados das 16h00 às 22h30 e domingos das 16h00 às 20h00"
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
          id: "frango-crocante",
          nome: "Frango crocante",
          quantidade: "500g",
          descricao:
            "Tiras de frango fritas e empanadas com farinha panko. Acompanha molho Steinberg.",
          preco: 53
        },
        {
          id: "bolinho-batata",
          nome: "Bolinho de batata",
          quantidade: "6 un.",
          descricao:
            "Bolinho tradicional alemão patrimônio da cidade de Sapiranga.",
          preco: 26
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
          id: "batata-cheddar-bacon",
          nome: "Batata com cheddar e bacon",
          quantidade: "500g",
          descricao:
            "Batatas crocantes, cobertas com creme de cheddar, páprica defumada e crispy de bacon.",
          preco: 39
        },
        {
          id: "bruschetta-mozzarella",
          nome: "Bruschettas mozzarella e pomodoro",
          quantidade: "6 un.",
          descricao:
            "Focaccia tostada, mussarela de búfala, tomatinhos marinados no pesto e parmesão.",
          preco: 48
        },
        {
          id: "bruschetta-gorgonzola",
          nome: "Bruschettas de gorgonzola e cebola caramelizada",
          quantidade: "6 un.",
          descricao:
            "Focaccia tostada, creme de gorgonzola, cebola caramelizada e parmesão.",
          preco: 48
        },
        {
          id: "focaccia-casa",
          nome: "Focaccia da casa",
          descricao:
            "Focaccia de longa fermentação, servida com geleia da casa e manteiga artesanal.",
          preco: 39
        },
        {
          id: "focaccia-steinberg",
          nome: "Focaccia Steinberg",
          descricao:
            "Massa de longa fermentação, doce de leite, farofa crocante e flor de sal.",
          preco: 47
        }
      ],
      adicionais: [
        {
          nome: "Molho Steinberg",
          preco: 4
        },
        {
          nome: "Geleia de pimenta",
          preco: 4
        },
        {
          nome: "Chimichurri",
          preco: 8
        }
      ]
    },
        // ======================================================
    // HAMBÚRGUERES
    // ======================================================
    {
      tipo: "subcategoria",
      titulo: "Hambúrgueres",
      observacao: "Acompanha mini porção de fritas.",
      produtos: [
        {
          id: "king-segundo",
          nome: "King segundo",
          descricao:
            "Pão brioche com gergelim, hambúrguer de costela 180g, queijo coalho grelhado, geleia de pimenta, bacon crocante, crispy de cebola, rúcula e maionese do chef.",
          preco: 53
        },
        {
          id: "classico-steinberg",
          nome: "Clássico Steinberg",
          descricao:
            "Pão brioche com gergelim, hambúrguer 180g, mussarela, gorgonzola, rúcula, bacon, cebola caramelizada e maionese do chef.",
          preco: 48
        },
        {
          id: "bacon",
          nome: "Bacon",
          descricao:
            "Pão brioche, hambúrguer de costela grelhado 180g, cheddar, cebola caramelizada na cerveja, bacon crocante e maionese defumada.",
          preco: 49
        }
      ]
    },
    // ======================================================
    // TÁBUA STEINBERG
    // ======================================================
    {
      tipo: "destaque",
      titulo: "Tábua Steinberg",
      produtos: [
        {
          id: "tabua-steinberg",
          nome: "Tábua Steinberg",
          descricao:
            "Filé grelhado e fatiado (500g), batata frita (500g), fatias de focaccia, ovo de codorna, azeitona, pepino, chimichurri e barbecue.",
          preco: 199,
          serve: "3 pessoas"
        }
      ]
    },
    // ======================================================
    // PIZZETAS
    // ======================================================
    {
      tipo: "subcategoria",
      titulo: "Pizzetas",
      observacao: "Massa de longa fermentação.",
      produtos: [
        {
          id: "gauderia",
          nome: "Gaudéria",
          descricao:
            "Molho de tomates assados, carne desfiada cozida lentamente, mussarela, provolone, cebola roxa e orégano.",

          preco: 49
        },
        {
          id: "steinberg",
          nome: "Steinberg",
          descricao:
            "Molho de tomates assados, tomatinhos cereja, mussarela de búfala, manjericão e azeite de ervas.",
          preco: 41
        },
        {
          id: "quatro-maggio",
          nome: "4 Maggio",
          descricao:
            "Molho de tomates assados, parmesão, provolone, mussarela, gorgonzola, pimenta do reino e orégano.",
          preco: 43
        },
        {
          id: "itali",
          nome: "Itali",
          descricao:
            "Molho de tomates assados, salame italiano, stracciatella de búfala, tomate cereja e manjericão fresco.",
          preco: 47
        }
      ]
    }
  ]
};
export default petiscos;