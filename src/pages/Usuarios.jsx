import React, { useEffect, useState } from "react";
import { useEmpresa } from "../context/EmpresaContext";
import {
  listarUsuarios,
  criarUsuario,
  atualizarUsuario,
  excluirUsuario
} from "../services/usuariosService";

export default function Usuarios() {
  const { empresa } = useEmpresa();
  const [usuarios, setUsuarios] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [novoUsuario, setNovoUsuario] = useState({
    nome: "",
    email: "",
    perfil: "garcom",
    ativo: true
  });

  useEffect(() => {
    if (!empresa?.id) {
      setCarregando(false);
      return;
    }

    async function carregarUsuarios() {
      try {
        setCarregando(true);
        const lista = await listarUsuarios(empresa.id);
        setUsuarios(lista);
      } catch (erro) {
        console.error("Erro ao carregar usuários:", erro);
        alert("Não foi possível carregar os usuários.");
      } finally {
        setCarregando(false);
      }
    }

    carregarUsuarios();
  }, [empresa?.id]);

  const limparFormulario = () => {
    setNovoUsuario({
      nome: "",
      email: "",
      perfil: "garcom",
      ativo: true
    });
  };

  const adicionarUsuario = async () => {
    if (!empresa?.id) return;

    const nome = novoUsuario.nome.trim();
    const email = novoUsuario.email.trim();

    if (!nome) {
      alert("Informe o nome do usuário.");
      return;
    }

    if (!email) {
      alert("Informe o e-mail do usuário.");
      return;
    }

    try {
      setSalvando(true);

      const usuario = {
        nome,
        email,
        perfil: novoUsuario.perfil,
        ativo: true
      };

      const resultado = await criarUsuario(empresa.id, usuario);

      setUsuarios(prev => [
        ...prev,
        {
          id: resultado.id,
          ...usuario
        }
      ]);

      limparFormulario();
    } catch (erro) {
      console.error("Erro ao criar usuário:", erro);
      alert("Não foi possível cadastrar o usuário.");
    } finally {
      setSalvando(false);
    }
  };

  const alterarPerfil = async (usuario, novoPerfil) => {
    if (!empresa?.id) return;

    try {
      await atualizarUsuario(
        empresa.id,
        usuario.id,
        { perfil: novoPerfil }
      );

      setUsuarios(prev =>
        prev.map(item =>
          item.id === usuario.id
            ? { ...item, perfil: novoPerfil }
            : item
        )
      );
    } catch (erro) {
      console.error("Erro ao alterar perfil:", erro);
      alert("Não foi possível alterar o perfil.");
    }
  };

  const alternarAtivo = async (usuario) => {
    if (!empresa?.id) return;

    try {
      const novoStatus = !usuario.ativo;

      await atualizarUsuario(
        empresa.id,
        usuario.id,
        { ativo: novoStatus }
      );

      setUsuarios(prev =>
        prev.map(item =>
          item.id === usuario.id
            ? { ...item, ativo: novoStatus }
            : item
        )
      );
    } catch (erro) {
      console.error("Erro ao alterar status:", erro);
      alert("Não foi possível alterar o status.");
    }
  };

  const removerUsuario = async (id) => {
    if (!empresa?.id) return;

    const confirmar = window.confirm(
      "Deseja realmente excluir este usuário?"
    );

    if (!confirmar) return;

    try {
      await excluirUsuario(empresa.id, id);

      setUsuarios(prev =>
        prev.filter(usuario => usuario.id !== id)
      );
    } catch (erro) {
      console.error("Erro ao excluir usuário:", erro);
      alert("Não foi possível excluir o usuário.");
    }
  };

  if (!empresa) {
    return (
      <div className="min-h-screen bg-stone-100 p-8">
        <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-lg p-10 text-center">
          <div className="text-4xl mb-3">👥</div>
          <h2 className="text-xl font-bold text-stone-800">
            Nenhuma empresa selecionada
          </h2>
          <p className="text-stone-500 mt-2">
            Selecione uma empresa para gerenciar os usuários.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-stone-900">
            Usuários
          </h1>
          <p className="text-stone-500 mt-1">
            Gerencie a equipe de {empresa.nome || "sua empresa"}
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">
          <h2 className="text-xl font-bold text-stone-800 mb-5">
            Novo Usuário
          </h2>

          <div className="grid md:grid-cols-2 gap-4">
            <input
              className="border border-stone-300 rounded-xl p-3"
              placeholder="Nome"
              value={novoUsuario.nome}
              onChange={e =>
                setNovoUsuario(prev => ({
                  ...prev,
                  nome: e.target.value
                }))
              }
            />

            <input
              type="email"
              className="border border-stone-300 rounded-xl p-3"
              placeholder="E-mail"
              value={novoUsuario.email}
              onChange={e =>
                setNovoUsuario(prev => ({
                  ...prev,
                  email: e.target.value
                }))
              }
            />

            <select
              className="border border-stone-300 rounded-xl p-3"
              value={novoUsuario.perfil}
              onChange={e =>
                setNovoUsuario(prev => ({
                  ...prev,
                  perfil: e.target.value
                }))
              }
            >
              <option value="administrador">Administrador</option>
              <option value="gerente">Gerente</option>
              <option value="garcom">Garçom</option>
              <option value="cozinha">Cozinha</option>
              <option value="caixa">Caixa</option>
            </select>

            <button
              onClick={adicionarUsuario}
              disabled={salvando}
              className="bg-amber-700 hover:bg-amber-800 disabled:opacity-50 text-white rounded-xl p-3 font-bold"
            >
              {salvando ? "Salvando..." : "Adicionar Usuário"}
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {carregando ? (
            <div className="p-10 text-center text-stone-500">
              Carregando usuários...
            </div>
          ) : usuarios.length === 0 ? (
            <div className="p-10 text-center">
              <div className="text-4xl mb-3">👥</div>
              <p className="text-stone-500">
                Nenhum usuário cadastrado.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-stone-200">
                  <tr>
                    <th className="p-4 text-left">Nome</th>
                    <th className="p-4 text-left">E-mail</th>
                    <th className="p-4 text-left">Perfil</th>
                    <th className="p-4 text-left">Status</th>
                    <th className="p-4 text-center">Ações</th>
                  </tr>
                </thead>

                <tbody>
                  {usuarios.map(usuario => (
                    <tr
                      key={usuario.id}
                      className="border-b border-stone-100 hover:bg-stone-50"
                    >
                      <td className="p-4 font-semibold text-stone-800">
                        {usuario.nome}
                      </td>

                      <td className="p-4 text-stone-600">
                        {usuario.email}
                      </td>

                      <td className="p-4">
                        <select
                          value={usuario.perfil || "garcom"}
                          onChange={e =>
                            alterarPerfil(
                              usuario,
                              e.target.value
                            )
                          }
                          className="border border-stone-300 rounded-lg px-3 py-2 text-sm"
                        >
                          <option value="administrador">
                            Administrador
                          </option>
                          <option value="gerente">
                            Gerente
                          </option>
                          <option value="garcom">
                            Garçom
                          </option>
                          <option value="cozinha">
                            Cozinha
                          </option>
                          <option value="caixa">
                            Caixa
                          </option>
                        </select>
                      </td>

                      <td className="p-4">
                        <button
                          onClick={() =>
                            alternarAtivo(usuario)
                          }
                          className={`px-3 py-1 rounded-full text-white text-sm font-medium ${
                            usuario.ativo
                              ? "bg-green-600"
                              : "bg-red-600"
                          }`}
                        >
                          {usuario.ativo
                            ? "Ativo"
                            : "Inativo"}
                        </button>
                      </td>

                      <td className="p-4 text-center">
                        <button
                          onClick={() =>
                            removerUsuario(usuario.id)
                          }
                          className="text-red-600 hover:text-red-800 font-bold"
                        >
                          Excluir
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}