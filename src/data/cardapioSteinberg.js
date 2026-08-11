import almocoJanta from "./almocoJanta";
import petiscos from "./petiscos";
import combos from "./combos";
import sobremesas from "./sobremesas";
import drinks from "./drinks";
import bebidas from "./bebidas";
import vinhos from "./vinhos";

const cardapioSteinberg = {
  restaurante: {
    nome: "Steinberg",
    moeda: "R$",
    idioma: "pt-BR"
  },
  categorias: [
    {
      id: "almoco-janta",
      nome: "Almoço e Janta",
      horario: {
        almoco: "Sábados e domingos das 11h30 às 16h00",
        janta: "Sextas e sábados das 19h00 às 22h30 e domingos das 18h00 às 20h00"
      },
      subcategorias: [
        {
          nome: "Entradas",
          itens: almocoJanta?.secoes?.find(s => s.titulo === "Entradas")?.produtos || []
        },
        {
          nome: "Saladas da Horta",
          itens: almocoJanta?.secoes?.find(s => s.titulo === "Saladas da Horta")?.produtos || []
        },
        {
          nome: "Carnes da Parrilla",
          itens: almocoJanta?.secoes?.find(s => s.titulo === "Carnes da Parrilla")?.produtos || []
        },
        {
          nome: "Sugestão do Chef",
          destaque: true,
          itens: almocoJanta?.secoes?.find(s => s.titulo === "Sugestão do Chef")?.produtos || []
        },
        {
          nome: "Pratos Principais",
          itens: almocoJanta?.secoes?.find(s => s.titulo === "Pratos Principais")?.produtos || []
        }
      ]
    },
    {
      id: "petiscos-sunset",
      nome: "Petiscos / Sunset",
      horario: {
        texto:
          "Sextas das 17h30 às 22h30 • Sábados das 16h00 às 22h30 • Domingos das 16h00 às 20h00"
      },
      subcategorias: [
        { 
          nome: "Entradas", 
          itens: petiscos?.secoes?.find(s => s.titulo === "Entradas")?.produtos || [] 
        },
        { 
          nome: "Hambúrgueres", 
          itens: petiscos?.secoes?.find(s => s.titulo === "Hambúrgueres")?.produtos || [] 
        },
        { 
          nome: "Tábua Steinberg", 
          destaque: true, 
          itens: petiscos?.secoes?.find(s => s.titulo === "Tábua Steinberg")?.produtos || [] 
        },
        { 
          nome: "Pizzetas", 
          itens: petiscos?.secoes?.find(s => s.titulo === "Pizzetas")?.produtos || [] 
        }
      ]
    },
    {
          
      id: "combos",
      nome: "Combos pra Dois",
      subcategorias: [
        {
          nome: "Combos Almoço e Janta",
          horario: {
            almoco: "Sábados e domingos das 11h30 às 16h00",
            janta: "Sextas e sábados das 19h00 às 22h30 • Domingos das 18h00 às 20h00"
          },
          destaque: "Combos Mais Vendidos",
          itens: [
            ...(combos?.secoes?.find(s => s.titulo === "Combos Almoço e Janta")?.destaque?.produtos || []),
            ...(combos?.secoes?.find(s => s.titulo === "Combos Almoço e Janta")?.produtos || [])
          ]
        },
        {
          nome: "Combos Petiscos / Sunset",
          horario: {
            texto:
              "Sextas das 17h30 às 22h30 • Sábados das 16h00 às 22h30 • Domingos das 16h00 às 20h00"
          },
          // Corrigido para buscar com a barra vertical "|" exatamente como está salvo no combos.js
          itens: combos?.secoes?.find(s => s.titulo === "Combos Petiscos | Sunset")?.produtos || []
        }
      ]
    },

    {
      id: "sobremesas",
      nome: "Sobremesas",
      subcategorias: [
        {
          nome: "Sobremesas",
          itens: sobremesas?.secoes?.find(s => s.titulo === "Sobremesas")?.produtos || []
        }
      ]
    },
    {
      id: "drinks",
      nome: "Drinks e Coqueteis",
      subcategorias: [
        { 
          nome: "Autorais", 
          itens: drinks?.secoes?.find(s => s.titulo === "Autorais")?.produtos || [] 
        },
        { 
          nome: "Clássicos", 
          itens: drinks?.secoes?.find(s => s.titulo === "Clássicos")?.produtos || [] 
        }
      ]
    },
    {
      id: "bebidas",
      nome: "Bebidas e Chopes",
      subcategorias: [
        { 
          nome: "Bebidas sem álcool", 
          itens: bebidas?.secoes?.find(s => s.titulo === "Bebidas sem álcool")?.produtos || [] 
        },
        { 
          nome: "Drinks sem álcool", 
          itens: bebidas?.secoes?.find(s => s.titulo === "Drinks sem álcool")?.produtos || [] 
        },
        { 
          nome: "Cafés", 
          itens: bebidas?.secoes?.find(s => s.titulo === "Cafés")?.produtos || [] 
        },
        { 
          nome: "Chopp & Cervejas", 
          itens: bebidas?.secoes?.find(s => s.titulo === "Chopp & Cervejas")?.produtos || [] 
        },
        { 
          nome: "Doses", 
          itens: bebidas?.secoes?.find(s => s.titulo === "Doses")?.produtos || [] 
        }
      ]
    },
    {
      id: "vinhos",
      nome: "Adega de Vinhos",
      subcategorias: [
        { 
          nome: "Brancos", 
          itens: vinhos?.secoes?.find(s => s.titulo === "Brancos")?.produtos || [] 
        },
        { 
          nome: "Espumantes", 
          itens: vinhos?.secoes?.find(s => s.titulo === "Espumantes")?.produtos || [] 
        },
        { 
          nome: "Rosé", 
          itens: vinhos?.secoes?.find(s => s.titulo === "Rosé")?.produtos || [] 
        },
        { 
          nome: "Tintos", 
          itens: vinhos?.secoes?.find(s => s.titulo === "Tintos")?.produtos || [] 
        },
        { 
          nome: "Taça de vinho", 
          itens: vinhos?.secoes?.find(s => s.titulo === "Taça de vinho")?.produtos || [] 
        }
      ]
    }
  ]
};

export default cardapioSteinberg;
