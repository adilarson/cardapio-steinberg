import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { useEmpresa } from "../context/EmpresaContext";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

export default function GraficoVendas() {
  const { empresa } = useEmpresa();
  const [dadosGrafico, setDadosGrafico] = useState([]);
  const [variacaoPercentual, setVariacaoPercentual] = useState("0%");
  const [crescimento, setCrescimento] = useState(true);

  useEffect(() => {
    if (!empresa?.id) return;

    // Escuta ativa de toda a coleção de pedidos ordenada por tempo
    const q = query(
      collection(db, "restaurantes", empresa.id, "pedidos"),
      orderBy("timestamp", "asc")
    );

       const unsubscribe = onSnapshot(q, (snapshot) => {
      const pedidos = snapshot.docs.map(doc => doc.data());
      
      const hoje = new Date();
      hoje.setHours(23, 59, 59, 999); // Garante a captação do dia atual completo
      
      const diasSemanaTexto = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
      
      const mapaUltimos7Dias = {};
      const listaDiasOrdenados = [];

      // 1. GERA OS ÚLTIMOS 7 DIAS BASEADOS NO CALENDÁRIO LOCAL DO BRASIL
      for (let i = 6; i >= 0; i--) {
        const dataRetroativa = new Date();
        dataRetroativa.setDate(hoje.getDate() - i);
        
        // Chave local pura sem interferência de fuso horário UTC (Ex: "19/8/2026")
        const chaveDataLocal = `${dataRetroativa.getDate()}/${dataRetroativa.getMonth() + 1}/${dataRetroativa.getFullYear()}`;
        const nomeDia = diasSemanaTexto[dataRetroativa.getDay()];
        
        mapaUltimos7Dias[chaveDataLocal] = { dia: nomeDia, vendas: 0 };
        listaDiasOrdenados.push(chaveDataLocal);
      }

      let totalSemanaAtual = 0;
      let totalSemanaAnterior = 0;

      const inicioSemanaAtual = new Date();
      inicioSemanaAtual.setDate(hoje.getDate() - 6);
      inicioSemanaAtual.setHours(0,0,0,0);

      const inicioSemanaAnterior = new Date();
      inicioSemanaAnterior.setDate(hoje.getDate() - 13);
      inicioSemanaAnterior.setHours(0,0,0,0);

      // 2. COMPILA O FATURAMENTO CRUTANDO AS CHAVES LOCAIS
      pedidos.forEach((pedido) => {
        if (!pedido.timestamp) return;
        
        const dataPedido = pedido.timestamp.toDate ? pedido.timestamp.toDate() : new Date(pedido.timestamp);
        
        // Monta a mesma estrutura de chave local para checagem idêntica
        const chavePedidoLocal = `${dataPedido.getDate()}/${dataPedido.getMonth() + 1}/${dataPedido.getFullYear()}`;

        const estaPago = pedido.pago === true || pedido.pago === "true";
        const statusValido = ["Pendente", "Preparando", "Aguardando Garçom", "Pronto", "Entregue", "Finalizado"].includes(pedido.status);

        if (estaPago || statusValido) {
          const totalPedido = pedido.itens?.reduce((soma, item) => {
            const preco = item.precoFinal ?? item.preco ?? 0;
            return soma + (Number(preco) * Number(item.quantidade));
          }, 0) || 0;

          // Se a data do pedido bater com a janela dos últimos 7 dias locais, injeta no gráfico
          if (mapaUltimos7Dias[chavePedidoLocal] !== undefined) {
            mapaUltimos7Dias[chavePedidoLocal].vendas += totalPedido;
          }

          if (dataPedido >= inicioSemanaAtual) {
            totalSemanaAtual += totalPedido;
          } else if (dataPedido >= inicioSemanaAnterior && dataPedido < inicioSemanaAtual) {
            totalSemanaAnterior += totalPedido;
          }
        }
      });

      const dadosFinaisRecharts = listaDiasOrdenados.map(chave => mapaUltimos7Dias[chave]);
      setDadosGrafico(dadosFinaisRecharts);

      if (totalSemanaAnterior > 0) {
        const diff = ((totalSemanaAtual - totalSemanaAnterior) / totalSemanaAnterior) * 100;
        setVariacaoPercentual(`${Math.abs(Math.round(diff))}%`);
        setCrescimento(diff >= 0);
      } else {
        setVariacaoPercentual(totalSemanaAtual > 0 ? "100%" : "0%");
        setCrescimento(true);
      }
    }, (error) => {
      console.error("Erro na engine reativa do gráfico de vendas:", error);
    });

    return () => unsubscribe();
  }, [empresa?.id]);
  return (
    <div className="bg-white rounded-3xl border border-stone-200 shadow-sm p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-stone-800">
            Vendas dos Últimos 7 Dias
          </h2>
          <p className="text-stone-500 mt-1">
            Receita diária em tempo real do restaurante
          </p>
        </div>
        <div className={`px-4 py-2 rounded-xl font-semibold flex items-center gap-1 text-sm ${
          crescimento 
            ? "bg-emerald-100 text-emerald-700" 
            : "bg-red-100 text-red-700"
        }`}>
          <span>{crescimento ? "▲" : "▼"}</span>
          <span>{variacaoPercentual}</span>
        </div>
      </div>
      
      <div style={{ width: "100%", height: 350 }}>
        <ResponsiveContainer>
          <AreaChart data={dadosGrafico}>
            <defs>
              <linearGradient id="corVendas" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="#92400e"
                  stopOpacity={0.45}
                />
                <stop
                  offset="95%"
                  stopColor="#92400e"
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="4 4"
              stroke="#e7e5e4"
            />
            <XAxis
              dataKey="dia"
              tick={{ fill: "#78716c" }}
            />
            <YAxis
              tick={{ fill: "#78716c" }}
              tickFormatter={(valor) => `R$ ${valor}`}
            />
            <Tooltip
              formatter={(valor) => [
                valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }),
                "Faturamento"
              ]}
              contentStyle={{
                borderRadius: 16,
                border: "none",
                boxShadow: "0 10px 30px rgba(0,0,0,.15)"
              }}
            />
            <Area
              type="monotone"
              dataKey="vendas"
              stroke="#92400e"
              strokeWidth={4}
              fill="url(#corVendas)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
