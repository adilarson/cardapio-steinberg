import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import { collection, onSnapshot, addDoc, doc, updateDoc, query, orderBy } from 'firebase/firestore';

// FUNÇÃO AUXILIAR PARA VALIDAR HORÁRIOS DO STEINBERG
const verificarHorarioCategoria = (categoria) => {
  const agora = new Date();
  const diaSemana = agora.getDay(); // 0 = Domingo, 5 = Sexta, 6 = Sábado
  const horaAtual = agora.getHours();
  const minutoAtual = agora.getMinutes();
  const tempoEmMinutos = horaAtual * 60 + minutoAtual;

  if (categoria === 'Almoço e Janta') {
    const eAlmoco = (diaSemana === 6 || diaSemana === 0) && (tempoEmMinutos >= 690 && tempoEmMinutos <= 960);
    const eJantaSextaSabado = (diaSemana === 5 || diaSemana === 6) && (tempoEmMinutos >= 1140 && tempoEmMinutos <= 1350);
    const eJantaDomingo = (diaSemana === 0) && (tempoEmMinutos >= 1080 && tempoEmMinutos <= 1200);

    if (eAlmoco || eJantaSextaSabado || eJantaDomingo) return { aberto: true, mensagem: "" };
    return { 
      aberto: false, 
      mensagem: "Disponível Almoço (Sáb/Dom 11h30-16h00) e Janta (Sex/Sáb 19h00-22h30 | Dom 18h00-20h00)" 
    };
  }

  if (categoria === 'Petiscos Sunset') {
    const eSexta = (diaSemana === 5) && (tempoEmMinutos >= 1050 && tempoEmMinutos <= 1350);
    const eSabado = (diaSemana === 6) && (tempoEmMinutos >= 960 && tempoEmMinutos <= 1350);
    const eDomingo = (diaSemana === 0) && (tempoEmMinutos >= 960 && tempoEmMinutos <= 1200);

    if (eSexta || eSabado || eDomingo) return { aberto: true, mensagem: "" };
    return { 
      aberto: false, 
      mensagem: "Disponível Sextas (17h30-22h30), Sábados (16h00-22h30) e Domingos (16h00-20h00)" 
    };
  }

  return { aberto: true, message: "" };
};

// BANCO DE DADOS LOCAL COMPLETO
const cardapioData = [
  { id: 1, nome: "Croqueta de carne de panela (Almoço/Janta)", preco: 49.00, descricao: "Carne de panela desfiada com delicioso molho branco e frito até a crocância perfeita. Acompanha molho Steinberg. (6 un.)", categoria: "Almoço e Janta" },
  { id: 2, nome: "Batata frita (Almoço/Janta)", preco: 26.00, descricao: "Batata fininha e crocante, com toque de sal defumado. Acompanha molho Steinberg. (500g)", categoria: "Almoço e Janta" },
  { id: 3, nome: "Polenta frita (Almoço/Janta)", preco: 27.00, descricao: "Polenta fritas e finalizadas com parmesão e orégano. Acompanha molho Steinberg. (500g)", categoria: "Almoço e Janta" },
  { id: 4, nome: "Focaccia da casa (Almoço/Janta)", preco: 39.00, descricao: "Focaccia de longa fermentação, servida com geleia da casa e manteiga artesanal.", categoria: "Almoço e Janta" },
  { id: 5, nome: "Provoleta grelhada", preco: 35.00, descricao: "Provoleta grelhada ao chimichurri com tomates confit.", categoria: "Almoço e Janta" },
  { id: 6, nome: "Salada Caprese", preco: 59.00, descricao: "Folhas verdes frescas, mussarela de búfala, tomates confitados, pesto de ervas e uma fatia de focaccia.", categoria: "Almoço e Janta" },
  { id: 7, nome: "Salada Steinberg Básica", preco: 37.00, descricao: "Folhas verdes frescas, picles de cenoura, tomate cereja, lascas de parmesão, croutons de brioche, molho Steinberg e terra salgada.", categoria: "Almoço e Janta" },
  { id: 8, nome: "Salada Steinberg com Frango", preco: 47.00, descricao: "Salada Steinberg clássica acompanhada de um adicional de frango grelhado de 150g.", categoria: "Almoço e Janta" },
  { id: 9, nome: "Salada Steinberg com Filé", preco: 69.00, descricao: "Salada Steinberg clássica acompanhada de um adicional de filé grelhado de 150g.", categoria: "Almoço e Janta" },
  { id: 10, nome: "Entrecot para dois (Sugestão do Chef)", preco: 170.00, descricao: "Corte nobre e suculento (500g) com provoleta grelhada, tomates confit e chimichurri. Acompanha mini salada Steinberg, arroz branco, pão de alho e farofa.", categoria: "Almoço e Janta" },
  { id: 11, nome: "Picanha na Parrilla", preco: 182.00, descricao: "Grelhada e fatiada acompanhada de farofa e chimichurri. (500/600g)", categoria: "Almoço e Janta" },
  { id: 12, nome: "Entrecot Individual", preco: 115.00, descricao: "Corte nobre e suculento acompanhado de farofa e chimichurri. (500g)", categoria: "Almoço e Janta" },
  { id: 13, nome: "Extra: Arroz branco", preco: 14.00, descricao: "Porção extra de arroz branco soltinho.", categoria: "Almoço e Janta" },
  { id: 14, nome: "Extra: Legumes assados", preco: 14.00, descricao: "Porção extra de legumes assados na brasa.", categoria: "Almoço e Janta" },
  { id: 15, nome: "Extra: Maionese de batata", preco: 19.00, descricao: "Porção extra da nossa maionese tradicional de batata.", categoria: "Almoço e Janta" },
  { id: 16, nome: "Extra: Pão de alho", preco: 24.00, descricao: "Porção extra de pão de alho assado na parrilla.", categoria: "Almoço e Janta" },
  { id: 17, nome: "Parmegiana", preco: 115.00, descricao: "Filé mignon empanado e frito (250g) com molho de tomate rústico, presunto, pesto e fonduta de provolone. Acompanha arroz, mini salada verde e batata frita.", categoria: "Almoço e Janta" },
  { id: 18, nome: "Farcito", preco: 115.00, descricao: "Filé mignon empanado e frito (250g) com molho gorgonzola e parmesão gratinado. Acompanha arroz, mini salada verde e batata frita.", categoria: "Almoço e Janta" },
  { id: 19, nome: "Filé aos Formaggios", preco: 170.00, descricao: "Filé grelhado (500g), molho quatro queijos, crispy de bacon e cebola crispy. Acompanha arroz e mini salada.", categoria: "Almoço e Janta" },
  { id: 20, nome: "Mignon Italiano", preco: 111.00, descricao: "Risoto cremoso de tomate assado, filé mignon grelhado (150g), demi glace, tomate confit, pesto, crispy de couve e redução de balsâmico.", categoria: "Almoço e Janta" },
  { id: 21, nome: "Tagliatelle ao Gorgonzola", preco: 89.00, descricao: "Tagliatelle ao molho de gorgonzola, entrecot grelhado (250g) ao demi glacê, crispy de cebola e azeite de ervas.", categoria: "Almoço e Janta" },
  { id: 22, nome: "Kids Filé", preco: 68.00, descricao: "Massa tagliatelle ao molho sugo, filé grelhado (150g), mini salada e fritas.", categoria: "Almoço e Janta" },
  { id: 23, nome: "Kids Frango", preco: 41.00, descricao: "Arroz branco, frango grelhado, mini salada e batatinha frita.", categoria: "Almoço e Janta" },
  // Categoria: Petiscos Sunset
  { id: 24, nome: "Croqueta de carne de panela (Sunset)", preco: 49.00, descricao: "Carne de panela desfiada com delicioso molho branco e frito até a crocância perfeita. Acompanha molho Steinberg. (6 un.)", categoria: "Petiscos Sunset" },
  { id: 25, nome: "Frango crocante", preco: 53.00, descricao: "Tiras de frango fritas e empanadas com farinha panko. Acompanha molho Steinberg. (500g)", categoria: "Petiscos Sunset" },
  { id: 26, nome: "Bolinho de batata", preco: 26.00, descricao: "Bolinho tradicional alemão patrimônio da cidade de Sapiranga. (6 un.)", categoria: "Petiscos Sunset" },
  { id: 27, nome: "Batata frita (Sunset)", preco: 26.00, descricao: "Batata fininha e crocante, com toque de sal defumado. Acompanha molho Steinberg. (500g)", categoria: "Petiscos Sunset" },
  { id: 28, nome: "Polenta frita (Sunset)", preco: 27.00, descricao: "Polenta fritas e finalizadas com parmesão e orégano. Acompanha molho Steinberg. (500g)", categoria: "Petiscos Sunset" },
  { id: 29, nome: "Batata com cheddar e bacon", preco: 39.00, descricao: "Batatas crocantes, cobertas com creme de cheddar, páprica defumada e crispy de bacon. (500g)", categoria: "Petiscos Sunset" },
  { id: 30, nome: "Bruschettas mozzarella e pomodoro", preco: 48.00, descricao: "Focaccia tostada, mussarela de búfala, tomatinhos marinados no pesto e parmesão. (6 un.)", categoria: "Petiscos Sunset" },
  { id: 31, nome: "Bruschettas de gorgonzola e cebola caramelizada", preco: 48.00, descricao: "Focaccia tostada, creme de gorgonzola, cebola caramelizada e parmesão. (6 un.)", categoria: "Petiscos Sunset" },
  { id: 32, nome: "Focaccia da casa (Sunset)", preco: 39.00, descricao: "Focaccia de longa fermentação, servida com geleia da casa e manteiga artesanal.", categoria: "Petiscos Sunset" },
  { id: 33, nome: "Focaccia Steinberg Doce", preco: 47.00, descricao: "Massa de longa fermentação, doce de leite, farofa crocante e flor de sal.", categoria: "Petiscos Sunset" },
  { id: 34, nome: "Molho Steinberg Adicional", preco: 4.00, descricao: "Porção extra do clássico molho da casa.", categoria: "Petiscos Sunset" },
  { id: 35, nome: "Geleia de pimenta Adicional", preco: 4.00, descricao: "Porção extra de geleia de pimenta artesanal.", categoria: "Petiscos Sunset" },
  { id: 36, nome: "Chimichurri Adicional", preco: 8.00, descricao: "Porção extra de chimichurri fresco batido.", categoria: "Petiscos Sunset" },
  { id: 37, nome: "Hambúrguer King segundo", preco: 53.00, descricao: "Pão brioche com gergelim, hambúrguer de costela 180g, queijo coalho grelhado, geleia de pimenta, bacon crocante, crispy de cebola, rúcula e maiorese do chef.", categoria: "Petiscos Sunset" },
  { id: 38, nome: "Clássico Steinberg Burger", preco: 48.00, descricao: "Pão brioche com gergelim, hambúrguer 180g, mussarela, gorgonzola, rúcula, bacon, cebola caramelizada e maionese do chef.", categoria: "Petiscos Sunset" },
  { id: 39, nome: "Hambúrguer Bacon Burger", preco: 49.00, descricao: "Pão brioche, hambúrguer de costela grelhado 180g, cheddar, cebola caramelizada na cerveja, bacon crocante e maionese defumada.", categoria: "Petiscos Sunset" },
  { id: 40, nome: "Tábua Steinberg Especial", preco: 199.00, descricao: "Filé grelhado e fatiado (500g), batata frita (500g), fatias de focaccia, ovo de codorna, azeitona, pepino, chimichurri e barbecue. Serve 3 pessoas.", categoria: "Petiscos Sunset" },
  { id: 41, nome: "Pizzeta Gaudéria", preco: 49.00, descricao: "Molho de tomates assados, carne desfiada cozida lentamente, mussarela, provolone, cebola roxa e orégano.", categoria: "Petiscos Sunset" },
  { id: 42, nome: "Pizzeta Steinberg", preco: 41.00, descricao: "Molho de tomates assados, tomatinhos cereja, mussarela de búfala, manjericão e azeite de ervas.", categoria: "Petiscos Sunset" },
  { id: 43, nome: "Pizzeta 4maggio", preco: 43.00, descricao: "Molho de tomates assados, parmesão, provolone, mussarela, gorgonzola, pimenta do reino e orégano.", categoria: "Petiscos Sunset" },
  { id: 44, nome: "Pizzeta Itali", preco: 47.00, descricao: "Molho de tomates assados, salame italiano, stracciatella de búfala, tomate cereja e manjericão fresco.", categoria: "Petiscos Sunset" },

  // Categoria: Combos pra Dois
  { id: 45, nome: "Combo dos MAIS VENDIDOS (Almoço/Janta)", preco: 175.00, descricao: "Croqueta de carne de panela (6 un.) + Prato principal à escolha (Farcito ou Parmegiana) + 1 Drink Coração Selvagem + 1 Chopp Pilsen Artesanal 300ml.", categoria: "Combos pra Dois" },
  { id: 46, nome: "Combo Essenciais (Almoço/Janta)", preco: 207.00, descricao: "Salada Steinberg + Entrecot grelhado com farofa e chimichurri + Sobremesa: Basca Clássica + 2 Taças de vinho tinto da casa.", categoria: "Combos pra Dois" },
  { id: 47, nome: "Combo Pôr do Sol", preco: 164.00, descricao: "Croqueta de carne de panela (6 un.) + Polenta frita com parmesão e orégano + Focaccia da casa com geleia e manteiga + 2 Drinks autorais à escolha.", categoria: "Combos pra Dois" },
  { id: 48, nome: "Combo Vinhedos", preco: 242.00, descricao: "1 Pizza Steinberg ou 4Maggio + 1 Bruschetta à escolha + 1 Garrafa de vinho à escolha: Miolo Seleção Rosé (Brasil) ou Becas Sauvignon Blanc (Chile).", categoria: "Combos pra Dois" },
  { id: 49, nome: "Combo Hamburgueria", preco: 169.00, descricao: "1 Clássico Steinberg Burger + 1 Bacon Burger + 1 Batata frita com cheddar e bacon + 2 Chopps Pilsen Artesanal 500ml.", categoria: "Combos pra Dois" },
  { id: 50, nome: "Combo Frituras Modo ON", preco: 135.00, descricao: "Frango crocante 500g + Bolinho de batata (6un) + Batata com cheddar e bacon 500g + Polenta frita 500g.", categoria: "Combos pra Dois" },

  // Categoria: Sobremesas
  { id: 51, nome: "Basca Clássica", preco: 33.00, descricao: "Torta rústica espanhola, com bordas caramelizadas e interior cremoso, finalizada com goiabada e flor de sal.", categoria: "Sobremesas" },
  { id: 52, nome: "Petit gâteau Steinberg", preco: 32.00, descricao: "Clássico petit gateau na versão de doce de leite, crocante de chocolate, calda de doce de leite quente, merengue suíço e sorvete de chocolate branco.", categoria: "Sobremesas" },
  { id: 53, nome: "Panna Cotta de Maracujá", preco: 26.00, descricao: "Clássica receita italiana com um toque de maracujá, acompanhada de compota de frutas amarelas e crocante de chocolate branco.", categoria: "Sobremesas" },
  { id: 54, nome: "Horta Centenária", preco: 36.00, descricao: "Mouse de chocolate meio amargo, compota de morangos, terra doce de nozes e hortelã.", categoria: "Sobremesas" },
  // Categoria: Bebidas e Chopes
  { id: 55, nome: "Água Mineral Crystal Sem Gás", preco: 6.00, descricao: "Garrafa de água mineral 500ml.", categoria: "Bebidas e Chopes" },
  { id: 56, nome: "Água Mineral Crystal Com Gás", preco: 6.50, descricao: "Garrafa de água mineral com gás 500ml.", categoria: "Bebidas e Chopes" },
  { id: 57, nome: "Refrigerante em Lata", preco: 8.00, descricao: "Opções: Coca-Cola, Coca Zero, Guaraná Antárctica, Guaraná Zero ou Tônica.", categoria: "Bebidas e Chopes" },
  { id: 58, nome: "Red Bull Energy Drink", preco: 15.00, descricao: "Opções: Tradicional, Sem Açúcar, Tropical ou Melancia.", categoria: "Bebidas e Chopes" },
  { id: 59, nome: "Suco Natural 300ml", preco: 14.00, descricao: "Sabores: Abacaxi, Abacaxi com Hortelã, Laranja, Suco Verde ou Morango.", categoria: "Bebidas e Chopes" },
  { id: 60, nome: "Suco Integral de Uva 300ml", preco: 10.00, descricao: "Suco de uva integral e puro da região.", categoria: "Bebidas e Chopes" },
  { id: 61, nome: "Café Expresso", preco: 7.00, descricao: "Expresso curto e encorpado.", categoria: "Bebidas e Chopes" },
  { id: 62, name: "Café Americano", preco: 7.00, descricao: "Expresso suave com água quente.", categoria: "Bebidas e Chopes" },
  { id: 63, nome: "Café Pingado", preco: 9.00, descricao: "O clássico café com leite.", categoria: "Bebidas e Chopes" },
  { id: 64, nome: "Café Cappuccino", preco: 9.00, descricao: "Expresso, leite vaporizado e um toque de cacau.", categoria: "Bebidas e Chopes" },
  { id: 65, nome: "Café Mocaccino", preco: 9.00, descricao: "Café expresso com calda de chocolate e leite vaporizado.", categoria: "Bebidas e Chopes" },
  { id: 66, nome: "Chocolate cremoso", preco: 9.00, descricao: "Chocolate quente cremoso europeu.", categoria: "Bebidas e Chopes" },
  { id: 67, nome: "Café passado no bule", preco: 16.00, descricao: "Café passado na hora de forma tradicional.", categoria: "Bebidas e Chopes" },
  { id: 68, nome: "Mocktail Moscow Mule (Sem Álcool)", preco: 28.00, descricao: "Calda de gengibre, suco de limão, tônica e nossa espuma cítrica especial.", categoria: "Bebidas e Chopes" },
  { id: 69, nome: "Mocktail Mojito (Sem Álcool)", preco: 25.00, descricao: "Suco de limão, xarope de açúcar, hortelã fresca e água com gás.", categoria: "Bebidas e Chopes" },
  { id: 70, nome: "Mocktail Bacurau (Sem Álcool)", preco: 25.00, descricao: "Cordial de capim limão, maracujá, suco de limão e água tônica.", categoria: "Bebidas e Chopes" },
  { id: 71, nome: "Mocktail La Dolce Vitta (Sem Álcool)", preco: 28.00, descricao: "Morangos batidos, manjericão, suco de limão, calda de gengibre e água tônica.", categoria: "Bebidas e Chopes" },
  { id: 72, nome: "Mocktail Pink Lemonade (Sem Álcool)", preco: 28.00, descricao: "Suco de limão, xarope de açúcar, geleia de frutas vermelhas, hortelã e água com gás.", categoria: "Bebidas e Chopes" },
  { id: 73, nome: "Chopp Pilsen Artesanal", categoria: "Bebidas e Chopes", descricao: "Chopp local, leve e refrescante.", variacoes: [{ tamanho: "300ml", preco: 14.00 }, { tamanho: "500ml", preco: 17.00 }] },
  { id: 74, nome: "Chopp Heineken", categoria: "Bebidas e Chopes", descricao: "Chopp Heineken tirado perfeitamente.", variacoes: [{ tamanho: "300ml", preco: 16.00 }, { tamanho: "500ml", preco: 20.00 }] },
  { id: 75, nome: "Chopp Especial (IPA / Red Ale)", categoria: "Bebidas e Chopes", descricao: "Consulte a torneira do dia.", variacoes: [{ tamanho: "300ml", preco: 16.00 }, { tamanho: "500ml", preco: 20.00 }] },
  { id: 76, nome: "Chopp Steinberg Premium", categoria: "Bebidas e Chopes", descricao: "Blond ale com cardamomo, gengibre e tomilho.", variacoes: [{ tamanho: "300ml", preco: 15.00 }, { tamanho: "500ml", preco: 18.00 }] },
  { id: 77, nome: "Cerveja Longneck", preco: 15.00, descricao: "Opções: Heineken, Heineken Zero, Corona, Stella Artois ou Stella Sem Glúten.", categoria: "Bebidas e Chopes" },
  { id: 78, nome: "Balde de Longneck (5 unidades)", preco: 70.00, descricao: "Leve 5 unidades geladas da sua preferência no balde.", categoria: "Bebidas e Chopes" },
  { id: 79, nome: "Dose: Tequila Jose Cuervo Reposado", preco: 25.00, descricao: "Dose tradicional de tequila premium.", categoria: "Bebidas e Chopes" },
  { id: 80, nome: "Dose: Cachaça Weber Haus Amburana", preco: 22.00, descricao: "Cachaça envelhecida local de alta qualidade.", categoria: "Bebidas e Chopes" },
  { id: 81, nome: "Dose: Whisky Johnnie Walker Red Label", preco: 24.00, descricao: "Dose de whisky escocês.", categoria: "Bebidas e Chopes" },
  { id: 82, nome: "Dose: Bacardi Prata", preco: 19.00, descricao: "Dose de rum prata para coquetéis.", categoria: "Bebidas e Chopes" },
  { id: 83, nome: "Dose: Campari", preco: 20.00, descricao: "Dose clássica de aperitivo amargo.", categoria: "Bebidas e Chopes" },
  { id: 84, nome: "Dose: Gin Weber Haus Antiqua", preco: 17.00, descricao: "Dose de gin artesanal premium de alambique.", categoria: "Bebidas e Chopes" },

  // Categoria: Drinks e Coquetéis
  { id: 85, nome: "Drink Autoral Bacurau", preco: 39.00, descricao: "Cachaça amburana, cordial de capim limão, maracujá e tônica.", categoria: "Drinks e Coquetéis" },
  { id: 86, nome: "Drink Autoral La Dolce Vitta", preco: 39.00, descricao: "Cachaça amburana, morangos, manjericão, calda de gengibre e angostura.", categoria: "Drinks e Coquetéis" },
  { id: 87, nome: "Drink Autoral Sunset Chill", preco: 38.00, descricao: "Gin, aperitivo Aperol, suco de laranja, mel, espumante brut e alecrim.", categoria: "Drinks e Coquetéis" },
  { id: 88, nome: "Drink Autoral Brisa raiz", preco: 34.00, descricao: "Cachaça amburana, calda de gengibre, capim limão, limão siciliano, camomila e clara de ovo.", categoria: "Drinks e Coquetéis" },
  { id: 89, nome: "Drink Clericot na taça", preco: 39.00, descricao: "Vinho branco, espumante brut, suco de limão, uva, morango, limão, laranja e hortelã.", categoria: "Drinks e Coquetéis" },
  { id: 90, nome: "Drink Autoral Coração Selvagem", preco: 38.00, descricao: "Vodka, calda de framboesa, suco de limão, hortelã, gengibre e espumante brut.", categoria: "Drinks e Coquetéis" },
  { id: 91, nome: "Drink Autoral Berry Melon", preco: 39.00, descricao: "Gin, morango, hortelã e redbull melancia.", categoria: "Drinks e Coquetéis" },
  { id: 92, nome: "Drink Autoral Essência da terra", preco: 33.00, descricao: "Vodka, suco de limão, geleia de frutas vermelhas e hortelã.", categoria: "Drinks e Coquetéis" },
  { id: 93, nome: "Drink Autoral Flor da mata", preco: 39.00, descricao: "Vodka, morango, framboesa, limão, laranja e calda de gengibre.", categoria: "Drinks e Coquetéis" },
  { id: 94, nome: "Whisky Smash", preco: 38.00, descricao: "Whisky, limão siciliano, hortelã, xarope de açúcar e água com gás.", categoria: "Drinks e Coquetéis" },
  { id: 95, nome: "Penicillin", preco: 38.00, descricao: "Whisky de malte, calda de gengibre, mel, suco de limão e spray defumado.", categoria: "Drinks e Coquetéis" },
  { id: 96, name: "Whisky Sour", preco: 35.00, descricao: "Whisky, limão, calda de açúcar e clara de ovo estruturada.", categoria: "Drinks e Coquetéis" },
  { id: 97, nome: "Negroni", preco: 39.00, descricao: "Gin, vermute rosso e campari.", categoria: "Drinks e Coquetéis" },
  { id: 98, nome: "Cosmopolitan", preco: 37.00, descricao: "Vodka, limão, Cointreau, framboesa e morango.", categoria: "Drinks e Coquetéis" },
  { id: 99, nome: "Banzeiro", preco: 35.00, descricao: "Cachaça amburana, calda de açúcar, limão, vinho tinto seco e espuma de gengibre.", categoria: "Drinks e Coquetéis" },
  { id: 100, nome: "Aperol Spritz", preco: 39.00, descricao: "Aperitivo aperol, espumante brut, água com gás e fatia de laranja.", categoria: "Drinks e Coquetéis" },
  { id: 101, nome: "Moscow Mule Clássico", preco: 35.00, descricao: "Vodka, calda de gengibre, suco de limão, tônica e espuma cítrica.", categoria: "Drinks e Coquetéis" },
  { id: 102, nome: "Red bull gin", preco: 35.00, descricao: "Gin e red bull gin (Opções: Tropical ou Melancia).", categoria: "Drinks e Coquetéis" },
  { id: 103, nome: "Mojito Clássico", preco: 32.00, descricao: "Rum silver, hortelã, suco de limão, xarope de açúcar e água com gás.", categoria: "Drinks e Coquetéis" },
  { id: 104, nome: "Caipirinha de Limão", preco: 30.00, descricao: "Cachaça prata, xarope de açúcar e limão tahiti.", categoria: "Drinks e Coquetéis" },
  { id: 105, nome: "Caipirinha de Morango", preco: 33.00, descricao: "Cachaça prata, xarope de açúcar e morango fresco.", categoria: "Drinks e Coquetéis" },
  { id: 106, nome: "Caipirosca de Limão", preco: 32.00, descricao: "Vodka, xarope de açúcar e limão tahiti.", categoria: "Drinks e Coquetéis" },
  { id: 107, nome: "Caipirosca de Morango", preco: 35.00, descricao: "Vodka, xarope de açúcar e morango fresco.", categoria: "Drinks e Coquetéis" },
  { id: 108, nome: "Gin Tônica Tradicional", preco: 29.00, descricao: "Gin, água tônica e fatias de limão.", categoria: "Drinks e Coquetéis" },
  // Categoria: Adega de Vinhos
  { id: 109, nome: "Vinho Branco Arte Casa Valduga (Blend - Brasil)", preco: 99.00, descricao: "Garrafa de vinho branco seco e aromático.", categoria: "Adega de Vinhos" },
  { id: 110, nome: "Vinho Branco Becas Sauvignon Blanc (Chile)", preco: 109.00, descricao: "Garrafa de vinho leve e refrescante.", categoria: "Adega de Vinhos" },
  { id: 111, nome: "Vinho Branco Miolo Reserva Seleção Pinot Grigio (Brasil)", preco: 133.00, descricao: "Garrafa de vinho fino elegante.", categoria: "Adega de Vinhos" },
  { id: 112, nome: "Vinho Branco Terroir Casa Valduga Chardonnay (Brasil)", preco: 162.00, descricao: "Garrafa de vinho marcante e complexo.", categoria: "Adega de Vinhos" },
  { id: 113, nome: "Vinho Branco Trovatti Pinot Grigio (Itália)", preco: 221.00, descricao: "Garrafa de vinho importado de alta gama.", categoria: "Adega de Vinhos" },
  { id: 114, nome: "Espumante Freebie Frisante Rosé (Blend - Brasil)", preco: 78.00, descricao: "Garrafa de frisante jovem e frutado.", categoria: "Adega de Vinhos" },
  { id: 115, nome: "Espumante Nero Celebration Moscatel (Brasil)", preco: 92.00, descricao: "Garrafa de espumante doce e festivo.", categoria: "Adega de Vinhos" },
  { id: 116, nome: "Espumante Nero Celebration Moscatel Rosé (Brasil)", preco: 92.00, descricao: "Garrafa de espumante rosé moscatel equilibrado.", categoria: "Adega de Vinhos" },
  { id: 117, nome: "Espumante Nero Celebration Brut (Blend - Brasil)", preco: 96.00, descricao: "Garrafa de espumante brut refrescante.", categoria: "Adega de Vinhos" },
  { id: 118, nome: "Espumante Premium Casa Valduga Brut Rosé (Brasil)", preco: 175.00, descricao: "Garrafa de espumante fino rosé brut.", categoria: "Adega de Vinhos" },
  { id: 119, nome: "Espumante Premium Casa Valduga Brut (Brasil)", preco: 175.00, descricao: "Garrafa de espumante clássico encorpado.", categoria: "Adega de Vinhos" },
  { id: 120, nome: "Espumante Premium Casa Valduga Nature (Brasil)", preco: 175.00, descricao: "Garrafa de espumante com zero dosagem de açúcar.", categoria: "Adega de Vinhos" },
  { id: 121, nome: "Espumante Chandon Reserve Brut (Blend - Brasil)", preco: 193.00, descricao: "Garrafa da renomada marca internacional Chandon.", categoria: "Adega de Vinhos" },
  { id: 122, nome: "Vinho Rosé Miolo Seleção (Blend - Brasil)", preco: 94.00, descricao: "Garrafa de vinho rosé leve e equilibrado.", categoria: "Adega de Vinhos" },
  { id: 123, nome: "Vinho Rosé Latitud 33 Malbec (Argentina)", preco: 110.00, descricao: "Garrafa de rosé argentino marcante.", categoria: "Adega de Vinhos" },
  { id: 124, nome: "Vinho Rosé Claude Val Rosé (Blend - França)", preco: 188.00, descricao: "Garrafa de vinho francês de alta sofisticação.", categoria: "Adega de Vinhos" },
  { id: 125, nome: "Vinho Tinto Almadén Suave Cabernet Sauvignon (Brasil)", preco: 63.00, descricao: "Garrafa de tinto suave agradável.", categoria: "Adega de Vinhos" },
  { id: 126, nome: "Vinho Tinto Miolo Seleção Cabernet/Merlot (Brasil)", preco: 79.00, descricao: "Garrafa de vinho seco harmonioso.", categoria: "Adega de Vinhos" },
  { id: 127, nome: "Vinho Tinto Origem Casa Valduga Carmenere (Brasil)", preco: 109.00, descricao: "Garrafa de vinho tinto frutado e especiado.", categoria: "Adega de Vinhos" },
  { id: 128, nome: "Vinho Tinto Becas CS Cabernet Sauvignon (Chile)", preco: 109.00, descricao: "Garrafa de tinto seco chileno encorpado.", categoria: "Adega de Vinhos" },
  { id: 129, nome: "Vinho Tinto Salvattore Clássico Cabernet Franc (Brasil)", preco: 128.00, descricao: "Garrafa de tinto seco estruturado.", categoria: "Adega de Vinhos" },
  { id: 130, nome: "Vinho Tinto Encantados Jovem Malbec (Argentina)", preco: 138.00, descricao: "Garrafa de malbec argentino vibrante.", categoria: "Adega de Vinhos" },
  { id: 131, nome: "Vinho Tinto Sinônimos Arte Viva Marselan (Brasil)", preco: 158.00, descricao: "Garrafa de vinho tinto de uva rara e estruturada.", categoria: "Adega de Vinhos" },
  { id: 132, nome: "Vinho Tinto Yali Reserva Wetland Pinot Noir (Chile)", preco: 162.00, descricao: "Garrafa de tinto leve, frutado e elegante.", categoria: "Adega de Vinhos" },
  { id: 133, nome: "Vinho Tinto Terroir Casa Valduga Merlot (Brasil)", preco: 177.00, descricao: "Garrafa de tinto refinado envelhecido.", categoria: "Adega de Vinhos" },
  { id: 134, nome: "Vinho Tinto Garzón Tannat de Corte (Uruguai)", preco: 213.00, descricao: "Garrafa de vinho uruguaio potente e premiado.", categoria: "Adega de Vinhos" },
  { id: 135, nome: "Vinho Tinto Cesare Pavese Barolo Nebbiolo (Itália)", preco: 949.00, descricao: "A joia da nossa adega. Garrafa do Barolo.", categoria: "Adega de Vinhos" },
  { id: 136, nome: "Taça de Vinho: Miolo Seleção Tinto (Brasil)", preco: 29.00, descricao: "Uma taça generosa do nosso tinto de mesa.", categoria: "Adega de Vinhos" },
  { id: 137, nome: "Taça de Vinho: Miolo Seleção Branco (Brasil)", preco: 29.00, descricao: "Uma taça do nosso vinho branco refrescante.", categoria: "Adega de Vinhos" }
];

export default function App() {
  const [telaAtual, setTelaAtual] = useState('cliente');
  const [clickCount, setClickCount] = useState(0);
  const [mostrarMenuSecreto, setMostrarMenuSecreto] = useState(false);
  const [pedidos, setPedidos] = useState([]);
  
  const [categoriaAtiva, setCategoriaAtiva] = useState('Todos');
  const [carrinho, setCarrinho] = useState([]);
  const [saudacao, setSaudacao] = useState('');
  const [numeroMesa, setNumeroMesa] = useState('Principal');

  // NOVO ESTADO: Controla os avisos flutuantes (Toasts) elegantes na tela
  const [avisoFlutuante, setAvisoFlutuante] = useState({ visivel: false, texto: "", tipo: "sucesso" });

    // Função interna para disparar as notificações personalizadas com mais tempo
  const dispararAviso = (texto, tipo = "sucesso") => {
    setAvisoFlutuante({ visivel: true, texto, tipo });
    setTimeout(() => {
      setAvisoFlutuante({ visivel: false, texto: "", tipo: "sucesso" });
    }, 6000); // AUMENTADO: Agora fica 6 segundos na tela para leitura calma
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const mesaParam = params.get('mesa');
    if (mesaParam) setNumeroMesa(mesaParam);
  }, []);

  useEffect(() => {
    const q = query(collection(db, "pedidos"), orderBy("timestamp", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const listaPedidos = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPedidos(listaPedidos);
    }, (error) => console.error(error));
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const hora = new Date().getHours();
    if (hora < 12) setSaudacao('Bom dia');
    else if (hora < 18) setSaudacao('Boa tarde');
    else setSaudacao('Boa noite');
  }, []);

  const handleLogoClick = () => {
    const novoContador = clickCount + 1;
    setClickCount(novoContador);
    if (novoContador >= 5) {
      setClickCount(0);
      setMostrarMenuSecreto(true);
    }
  };
  const enviarPedidoAoFirebase = async () => {
    if (carrinho.length === 0) return;
    const agora = new Date();
    const horaFormatada = agora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    const itensPedido = carrinho.map(item => `1x ${item.nome}`);

    try {
      await addDoc(collection(db, "pedidos"), {
        mesa: numeroMesa,
        itens: itensPedido,
        status: "Pendente",
        hora: horaFormatada,
        timestamp: new Date()
      });
      setCarrinho([]);
      // TROCADO: Sai o alert() do navegador e entra o aviso flutuante elegante do Steinberg
      dispararAviso("Pedido enviado com sucesso para a cozinha!", "sucesso");
    } catch (e) {
      console.error(e);
      dispararAviso("Erro ao enviar pedido.", "erro");
    }
  };

  const mudarStatusPedido = async (id, novoStatus) => {
    try {
      await updateDoc(doc(db, "pedidos", id), { status: novoStatus });
    } catch (e) {
      console.error(e);
    }
  };

  if (telaAtual === 'cozinha') {
    return (
      <div className="min-h-screen bg-stone-900 text-white font-sans p-4">
        <header className="flex justify-between items-center border-b border-stone-700 pb-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-amber-500 font-serif">STEINBERG • COZINHA</h1>
            <p className="text-xs text-stone-400">Monitor de Preparo Cloud KDS</p>
          </div>
          <button onClick={() => setTelaAtual('cliente')} className="bg-stone-700 hover:bg-stone-600 px-4 py-2 rounded-lg text-sm font-medium">Sair Painel</button>
        </header>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {pedidos.filter(p => p.status === 'Pendente' || p.status === 'Preparando').map(pedido => (
            <div key={pedido.id} className={`p-4 rounded-xl border ${pedido.status === 'Pendente' ? 'bg-stone-800 border-red-500 shadow-lg' : 'bg-stone-800 border-amber-500'}`}>
              <div className="flex justify-between items-center mb-3 pb-2 border-b border-stone-700">
                <span className="text-xl font-bold text-amber-400">MESA {pedido.mesa}</span>
                <span className="text-xs text-stone-400">{pedido.hora}</span>
              </div>
              <ul className="space-y-2 mb-4 min-h-[80px]">
                {pedido.itens.map((item, idx) => <li key={idx} className="text-sm font-medium">• {item}</li>)}
              </ul>
              <div className="flex gap-2">
                {pedido.status === 'Pendente' ? (
                  <button onClick={() => mudarStatusPedido(pedido.id, 'Preparando')} className="w-full bg-red-600 py-2 rounded-lg text-xs font-bold uppercase">Começar Preparo</button>
                ) : (
                  <button onClick={() => mudarStatusPedido(pedido.id, 'Pronto')} className="w-full bg-amber-500 text-stone-950 py-2 rounded-lg text-xs font-bold uppercase">Concluir Prato</button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (telaAtual === 'garcom') {
    return (
      <div className="min-h-screen bg-stone-100 text-stone-800 font-sans p-4">
        <header className="flex justify-between items-center border-b border-stone-300 pb-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-amber-900 font-serif">STEINBERG • GARÇOM</h1>
          </div>
          <button onClick={() => setTelaAtual('cliente')} className="bg-stone-300 hover:bg-stone-400 px-4 py-2 rounded-lg text-sm font-medium">Sair Painel</button>
        </header>
        <div className="space-y-4 max-w-md mx-auto">
          {pedidos.filter(p => p.status === 'Pronto').map(pedido => (
            <div key={pedido.id} className="bg-white p-4 rounded-xl border border-amber-300 shadow-md">
              <span className="text-lg font-bold text-amber-900 flex justify-between">🔔 SERVIR MESA {pedido.mesa} <span className="text-xs bg-amber-100 p-1 rounded font-bold">PRONTO</span></span>
              <ul className="text-sm text-stone-600 space-y-1 my-3">
                {pedido.itens.map((item, idx) => <li key={idx}>- {item}</li>)}
              </ul>
              <button onClick={() => mudarStatusPedido(pedido.id, 'Entregue')} className="w-full bg-emerald-600 text-white py-2 rounded-lg text-sm font-bold">Marcar como Entregue</button>
            </div>
          ))}
        </div>
      </div>
    );
  }
  const categorias = ['Todos', 'Almoço e Janta', 'Petiscos Sunset', 'Combos pra Dois', 'Bebidas e Chopes', 'Drinks e Coquetéis', 'Adega de Vinhos', 'Sobremesas', 'O Seu Evento'];
  const itensFiltrados = cardapioData.filter(item => item.categoria === categoriaAtiva);

  const adicionarAoCarrinho = (item, variacao = null) => {
    const precoFinal = variacao ? variacao.preco : item.preco;
    const nomeFinal = variacao ? `${item.nome} (${variacao.tamanho})` : item.nome;
    setCarrinho([...carrinho, { ...item, nome: nomeFinal, preco: precoFinal }]);
    // TROCADO: Sai o alert() do navegador e entra a caixinha elegante
    dispararAviso(`${nomeFinal} adicionado ao carrinho!`, "sucesso");
  };

  const statusHorario = verificarHorarioCategoria(categoriaAtiva);

  return (
    <div className="min-h-screen bg-stone-50 text-stone-800 font-sans relative">
      
            {/* ========================================================================= */}
      {/* NOTIFICAÇÃO FLUTUANTE AJUSTADA E CENTRALIZADA PARA CELULARES */}
      {/* ========================================================================= */}
      {avisoFlutuante.visivel && (
        <div className="fixed top-6 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none">
          <div className="bg-stone-900 text-amber-400 px-6 py-3 rounded-xl shadow-2xl border border-amber-900/30 flex items-center justify-center gap-3 text-center max-w-sm w-full animate-pulse">
            <span className="text-xl">✨</span>
            <p className="text-sm font-medium tracking-wide leading-relaxed">{avisoFlutuante.texto}</p>
          </div>
        </div>
      )}

      {mostrarMenuSecreto && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full text-center">
            <h3 className="font-serif text-xl font-bold text-amber-900 mb-2">Painel Operacional</h3>
            <div className="space-y-3">
              <button onClick={() => { setTelaAtual('cozinha'); setMostrarMenuSecreto(false); }} className="w-full bg-stone-900 text-amber-500 py-3 rounded-xl font-bold uppercase text-sm">🍳 Cozinha</button>
              <button onClick={() => { setTelaAtual('garcom'); setMostrarMenuSecreto(false); }} className="w-full bg-amber-900 text-white py-3 rounded-xl font-bold uppercase text-sm">🔔 Garçom</button>
              <button onClick={() => setMostrarMenuSecreto(false)} className="w-full bg-stone-100 text-stone-600 py-2 rounded-xl text-xs mt-4">Fechar</button>
            </div>
          </div>
        </div>
      )}

      <header className="bg-white border-b border-stone-200 sticky top-0 z-40 px-4 py-6 text-center shadow-sm">
        <h1 onClick={handleLogoClick} className="text-3xl font-serif tracking-widest text-amber-900 font-bold cursor-pointer select-none px-6 py-2">STEINBERG</h1>
        <p className="text-xs text-stone-500 mt-1 uppercase tracking-wider">ECO VILLAGE & RESTAURANTE</p>
        <p className="text-sm font-medium text-stone-600 mt-2">Olá! Seja bem-vindo à Mesa {numeroMesa}.</p>
      </header>

      <div className="flex overflow-x-auto gap-2 px-4 py-4 sticky top-[88px] bg-stone-50 z-30 overflow-y-hidden scrollbar-none">
        {categorias.map(cat => (
          <button key={cat} onClick={() => setCategoriaAtiva(cat)} className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${categoriaAtiva === cat ? 'bg-amber-900 text-white shadow-md' : 'bg-white text-stone-600 border border-stone-200'}`}>{cat}</button>
        ))}
      </div>

      <main className="max-w-md mx-auto px-4 pb-24 space-y-4">
        {!statusHorario.aberto && categoriaAtiva !== 'Todos' && (
          <div className="bg-amber-50 border border-amber-300 p-4 rounded-xl text-center shadow-sm">
            <span className="text-2xl">⏳</span>
            <h4 className="font-bold text-amber-900 mt-1">Categoria Fechada Agora</h4>
            <p className="text-xs text-amber-800 mt-1 leading-relaxed">{statusHorario.mensagem}</p>
          </div>
        )}

        {categoriaAtiva === 'O Seu Evento' ? (
          <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-md p-5 space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-serif font-bold text-amber-900 tracking-wide uppercase">O Seu Evento Merece Um Lugar À Altura!</h2>
              <p className="text-sm text-stone-600 mt-3 leading-relaxed">
                Na Steinberg, realizamos desde <strong>confraternizações e eventos corporativos</strong> até <strong>casamentos, aniversários e coquetéis</strong>, com toda a estrutura, gastronomia e charme para tornar cada momento inesquecível.
              </p>
            </div>
            <div className="border-t border-stone-100 pt-4 space-y-2">
              <h3 className="font-serif text-lg font-bold text-stone-900 uppercase tracking-wide">📐 O Espaço</h3>
              <p className="text-sm text-stone-600 leading-relaxed">
                Mais de <strong>1,5 hectares</strong> à sua disposição, com ambientes ao ar livre, cobertos, no gramado ou no restaurante, totalizando <strong>9 espaços exclusivos</strong> e personalizáveis para tornar seu evento único!
              </p>
              <p className="text-xs bg-stone-100 p-2 rounded text-stone-500 font-medium">
                📅 Disponibilidade para eventos tanto para dias de semana quanto para o final de semana.
              </p>
            </div>
            <div className="bg-amber-50/50 rounded-xl p-4 border border-amber-100 text-center space-y-4">
              <div>
                <h4 className="text-sm font-bold text-amber-900 uppercase">Maiores informações</h4>
                <p className="text-xs text-stone-500 mt-0.5">Fale diretamente com nossa curadoria</p>
              </div>
              <a 
                href="https://wa.me! Gostaria de receber mais informações sobre a reserva de espaços para eventos na Steinberg."
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block w-full bg-emerald-600 text-white hover:bg-emerald-700 py-3 rounded-xl font-bold tracking-wider text-sm transition-colors text-center shadow"
              >
                💬 Chamar no WhatsApp
              </a>
              <p className="text-xs font-semibold text-stone-500">📸 @steinbergecovillage</p>
            </div>
          </div>
        ) : (
          (categoriaAtiva === 'Todos' ? cardapioData : itensFiltrados).map(item => {
            const itemStatus = verificarHorarioCategoria(item.categoria);
            return (
              <div key={item.id} className={`bg-white p-4 rounded-xl border border-stone-200 shadow-sm flex flex-col justify-between transition-opacity ${!itemStatus.aberto ? 'opacity-60' : ''}`}>
                <div>
                  <div className="flex justify-between items-start gap-2">
                    <h3 className="font-serif text-lg font-bold text-stone-900">{item.nome}</h3>
                    {!item.variacoes && <span className="font-medium text-amber-900 whitespace-nowrap">R$ {item.preco.toFixed(2)}</span>}
                  </div>
                  <p className="text-sm text-stone-500 mt-1 leading-relaxed">{item.descricao}</p>
                </div>
                <div className="mt-4 pt-3 border-t border-stone-100 flex flex-col gap-2">
                  {item.variacoes ? (
                    <div className="grid grid-cols-2 gap-2">
                      {item.variacoes.map(v => (
                        <button 
                          key={v.tamanho} 
                          disabled={!itemStatus.aberto}
                          onClick={() => adicionarAoCarrinho(item, v)} 
                          className={`text-xs py-2 px-3 rounded-lg font-medium flex justify-between ${!itemStatus.aberto ? 'bg-stone-100 text-stone-400 cursor-not-allowed' : 'bg-stone-100 hover:bg-amber-900 hover:text-white text-stone-800'}`}
                        >
                          <span>{v.tamanho}</span><span>R$ {v.preco.toFixed(2)}</span>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <button 
                      disabled={!itemStatus.aberto}
                      onClick={() => adicionarAoCarrinho(item)} 
                      className={`w-full text-sm py-2 rounded-lg font-medium transition-colors ${!itemStatus.aberto ? 'bg-stone-200 text-stone-400 cursor-not-allowed' : 'bg-amber-900 text-white hover:bg-amber-950'}`}
                    >
                      {!itemStatus.aberto ? 'Indisponível no Horário' : 'Adicionar ao Pedido'}
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </main>

      {carrinho.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-stone-200 px-4 py-4 flex justify-between items-center max-w-md mx-auto rounded-t-2xl shadow-xl z-50">
          <div>
            <p className="text-xs text-stone-500 font-medium">{carrinho.length} itens no carrinho</p>
            <p className="text-xl font-bold text-amber-900">R$ {carrinho.reduce((acc, curr) => acc + curr.preco, 0).toFixed(2)}</p>
          </div>
          <button onClick={enviarPedidoAoFirebase} className="bg-amber-900 text-white px-6 py-3 rounded-xl font-medium shadow-md">Enviar Pedido</button>
        </div>
      )}
    </div>
  );
}
