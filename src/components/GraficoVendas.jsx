import React from "react";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

const dados = [
  { dia: "Seg", vendas: 820 },
  { dia: "Ter", vendas: 1150 },
  { dia: "Qua", vendas: 980 },
  { dia: "Qui", vendas: 1480 },
  { dia: "Sex", vendas: 2260 },
  { dia: "Sáb", vendas: 3840 },
  { dia: "Dom", vendas: 2910 }
];

export default function GraficoVendas() {
  return (
    <div className="bg-white rounded-3xl border border-stone-200 shadow-sm p-8">

      <div className="flex justify-between items-center mb-8">

        <div>

          <h2 className="text-2xl font-bold text-stone-800">
            Vendas dos Últimos 7 Dias
          </h2>

          <p className="text-stone-500 mt-1">
            Receita diária do restaurante
          </p>

        </div>

        <div className="bg-emerald-100 text-emerald-700 px-4 py-2 rounded-xl font-semibold">
          ▲ 18%
        </div>

      </div>

      <div style={{ width: "100%", height: 350 }}>

        <ResponsiveContainer>

          <AreaChart data={dados}>

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
            />

            <Tooltip
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