import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { doc, updateDoc } from "firebase/firestore";
import { useEmpresa } from "../context/EmpresaContext";

export default function Restaurante() {
  const { empresa, setEmpresa } = useEmpresa();

  const [dados, setDados] = useState({
    nome: "",
    slogan: "",
    telefone: "",
    whatsapp: "",
    endereco: "",
    instagram: "",
    email: "",
    logo: "",
    corPrimaria: "#92400e",
    corSecundaria: "#111827"
  });

  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    if (!empresa) return;

    setDados({
      nome: empresa.nome || "",
      slogan: empresa.slogan || "",
      telefone: empresa.telefone || "",
      whatsapp: empresa.whatsapp || "",
      endereco: empresa.endereco || "",
      instagram: empresa.instagram || "",
      email: empresa.email || "",
      logo: empresa.logo || "",
      corPrimaria: empresa.corPrimaria || "#92400e",
      corSecundaria: empresa.corSecundaria || "#111827"
    });
  }, [empresa]);

  const atualizar = (campo, valor) => {
    setDados(prev => ({
      ...prev,
      [campo]: valor
    }));
  };

  const salvar = async () => {
    if (!empresa?.id) return;

    try {
      setSalvando(true);

      await updateDoc(
        doc(db, "restaurantes", empresa.id),
        dados
      );

      setEmpresa(prev => ({
        ...prev,
        ...dados
      }));

      alert("Configurações salvas com sucesso!");
    } catch (error) {
      console.error("Erro ao salvar restaurante:", error);
      alert("Erro ao salvar as configurações.");
    } finally {
      setSalvando(false);
    }
  };

  if (!empresa) {
    return (
      <div className="bg-white rounded-2xl p-8 text-center">
        <h2 className="text-xl font-bold text-stone-800">
          Nenhum restaurante selecionado
        </h2>
        <p className="text-stone-500 mt-2">
          Selecione um restaurante para editar suas configurações.
        </p>
      </div>
    );
  }

  const campos = [
    ["nome", "Nome do restaurante"],
    ["slogan", "Slogan"],
    ["telefone", "Telefone"],
    ["whatsapp", "WhatsApp"],
    ["endereco", "Endereço"],
    ["instagram", "Instagram"],
    ["email", "Email"],
    ["logo", "URL da Logo"]
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6">
        <h1 className="text-2xl font-bold text-stone-800">
          Dados do Restaurante
        </h1>
        <p className="text-sm text-stone-500 mt-1">
          Configure as informações exibidas para os clientes.
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6">
        <div className="grid md:grid-cols-2 gap-5">
          {campos.map(([campo, label]) => (
            <div key={campo}>
              <label className="block text-sm font-semibold text-stone-700 mb-2">
                {label}
              </label>

              <input
                type={campo === "email" ? "email" : "text"}
                value={dados[campo]}
                onChange={e => atualizar(campo, e.target.value)}
                className="w-full border border-stone-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-600"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6">
        <h2 className="text-xl font-bold text-stone-800 mb-5">
          Identidade Visual
        </h2>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-stone-700 mb-2">
              Cor Primária
            </label>

            <div className="flex gap-3 items-center">
              <input
                type="color"
                value={dados.corPrimaria}
                onChange={e =>
                  atualizar("corPrimaria", e.target.value)
                }
                className="w-16 h-12 cursor-pointer"
              />

              <span className="font-mono text-sm">
                {dados.corPrimaria}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-stone-700 mb-2">
              Cor Secundária
            </label>

            <div className="flex gap-3 items-center">
              <input
                type="color"
                value={dados.corSecundaria}
                onChange={e =>
                  atualizar("corSecundaria", e.target.value)
                }
                className="w-16 h-12 cursor-pointer"
              />

              <span className="font-mono text-sm">
                {dados.corSecundaria}
              </span>
            </div>
          </div>
        </div>

        {dados.logo && (
          <div className="mt-6">
            <p className="text-sm font-semibold text-stone-700 mb-2">
              Pré-visualização da Logo
            </p>

            <div className="border border-stone-200 rounded-xl p-4 inline-block">
              <img
                src={dados.logo}
                alt={dados.nome || "Logo"}
                className="max-h-24 max-w-xs object-contain"
              />
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-end">
        <button
          onClick={salvar}
          disabled={salvando}
          className="bg-amber-700 hover:bg-amber-800 disabled:opacity-50 text-white px-8 py-3 rounded-xl font-bold"
        >
          {salvando ? "Salvando..." : "Salvar Configurações"}
        </button>
      </div>
    </div>
  );
}