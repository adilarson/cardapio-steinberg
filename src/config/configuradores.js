export function hamburguer() {

  return [
    {
      titulo: "Ponto da Carne",
      campo: "pontoCarne",
      tipo: "radio",
      opcoes: [
        "Mal passada",
        "Ao ponto",
        "Bem passada"
      ]
    },
    {
      titulo: "Adicionar",
      campo: "adicionais",
      tipo: "checkbox",
      opcoes: [
        {
          nome: "Bacon Extra",
          preco: 6
        },
        {
          nome: "Cheddar",
          preco: 5
        },
        {
          nome: "Cebola Caramelizada",
          preco: 4
        },
        {
          nome: "Ovo",
          preco: 4
        }
      ]
    },
    {
      titulo: "Retirar Ingredientes",
      campo: "removerIngredientes",
      tipo: "checkbox",
      opcoes: [
        "Tomate",
        "Alface",
        "Cebola",
        "Picles"
      ]
    },
    {
      titulo: "Observações",
      campo: "observacao",
      tipo: "textarea"
    }
  ];
}
export function carne() {
  return [
    {
      titulo: "Ponto da Carne",
      campo: "pontoCarne",
      tipo: "radio",
      opcoes: [
        "Mal passada",
        "Ao ponto",
        "Bem passada"
      ]
    },
    {
      titulo: "Observações",
      campo: "observacao",
      tipo: "textarea"
    }
  ];
}
export function drink() {
  return [
    {
      titulo: "Quantidade de Gelo",
      campo: "gelo",
      tipo: "radio",
      opcoes: [
        "Sem gelo",
        "Pouco gelo",
        "Normal"
      ]
    },
    {
      titulo: "Observações",
      campo: "observacao",
      tipo: "textarea"
    }
  ];
}
export function pizza() {

  return [
    {
      titulo: "Borda",
      campo: "borda",
      tipo: "radio",
      opcoes: [
        "Tradicional",
        "Catupiry",
        "Cheddar"
      ]
    },
    {
      titulo: "Adicionar",
      campo: "adicionais",
      tipo: "checkbox",
      opcoes: [
        {
          nome: "Bacon",
          preco: 7

        },
        {
          nome: "Calabresa",
          preco: 8
        },
        {
          nome: "Catupiry",
          preco: 6
        }
      ]
    },
    {
      titulo: "Observações",
      campo: "observacao",
      tipo: "textarea"
    }
  ];
}