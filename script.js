const STORAGE_KEY = "t20_fichas_v1";
const DADOS_HISTORY_KEY = "t20_dados_history_v1";
const app = document.getElementById("app");
const PROFICIENCIAS_DISPONIVEIS = [
    "Armas simples",
    "Armas marciais",
    "Armas exóticas",
    "Armas de fogo",
    "Armaduras leves",
    "Armaduras pesadas",
    "Escudos"
];

let RACAS_DB = [];
let RACAS_DB_CARREGADO = false;

const RACAS_FALLBACK = [
  {
    id: "humano",
    nome: "Humano",
    tipoAtributo: "distribuivel3",
    tamanho: "Médio",
    deslocamento: "9m",
    atributosFixos: {
      forca: 0,
      destreza: 0,
      constituicao: 0,
      inteligencia: 0,
      sabedoria: 0,
      carisma: 0
    },
    habilidades: [
      {
        nome: "Versátil",
        custoPm: 0,
        descricao: "Você recebe um poder geral à sua escolha."
      }
    ],
    periciasOutros: [],
    proficiencias: []
  },
  {
    id: "elfo",
    nome: "Elfo",
    tipoAtributo: "fixo",
    tamanho: "Médio",
    deslocamento: "9m",
    atributosFixos: {
      forca: 0,
      destreza: 2,
      constituicao: -1,
      inteligencia: 0,
      sabedoria: 0,
      carisma: 0
    },
    habilidades: [
      {
        nome: "Sentidos Élficos",
        custoPm: 0,
        descricao: "Você recebe os benefícios raciais correspondentes."
      }
    ],
    periciasOutros: [],
    proficiencias: []
  },
  {
    id: "anao",
    nome: "Anão",
    tipoAtributo: "fixo",
    tamanho: "Médio",
    deslocamento: "6m",
    atributosFixos: {
      forca: 0,
      destreza: 0,
      constituicao: 2,
      inteligencia: 0,
      sabedoria: 1,
      carisma: -1
    },
    habilidades: [
      {
        nome: "Tradição de Heredrimm",
        custoPm: 0,
        descricao: "Você recebe os benefícios raciais correspondentes."
      }
    ],
    periciasOutros: [],
    proficiencias: []
  }
];

let CLASSES_DB = [];
let CLASSES_CAMINHOS_DB = [];
let CLASSES_DB_CARREGADO = false;
let DIVINDADES_DB = [];
let DIVINDADES_DB_CARREGADO = false;

const CLASSES_FALLBACK = [
    {
        id: "guerreiro",
        nome: "Guerreiro",
        pvNivel1: 20,
        pvPorNivel: 5,
        pmPorNivel: 3,
        periciasBase: 2,
        usaMagia: 0,
        tipoMagia: "",
        descricao: "Especialista em combate e resistência.",
        habilidades: [],
        efeitos: [],
        escolhas: []
    }
];

let PODERES_MAGIAS_DB = {
    registros: [],
    efeitos: [],
    escolhas: [],
    incrementos: []
};
let PODERES_MAGIAS_DB_CARREGADO = false;

let ITENS_EQUIPAMENTOS_DB = {
    registros: [],
    atributos: [],
    efeitos: [],
    melhorias: [],
    melhoriasRegras: [],
    materiaisEspeciais: [],
    encantamentos: [],
    encantamentosRegras: []
};
let ITENS_EQUIPAMENTOS_DB_CARREGADO = false;

async function carregarClassesDB() {
    if (CLASSES_DB_CARREGADO) return;

    try {
        const res = await fetch("classes.json");
        if (!res.ok) throw new Error("classes.json não encontrado");

        const data = await res.json();
        const caminhosRaw = data.classes_caminhos || data.Classes_Caminhos || [];
        CLASSES_CAMINHOS_DB = caminhosRaw.map(r => ({
            id: String(r.id || r.Classes_Caminhos || "").trim(),
            classe_id: String(r.classe_id || r.Column2 || "").trim(),
            nome: String(r.nome || r.Column3 || "").trim(),
            descricao: String(r.descricao || r.Column4 || "").trim(),
            progressaoMagia: String(r.progressaoMagia || r.Column5 || "todos").trim().toLowerCase()
        })).filter(r => r.id && r.classe_id && r.nome);

        const classes = data.classes || [];
        const habilidades = data.classes_habilidades || [];
        const efeitos = data.classes_efeitos || [];
        const escolhas = data.classes_escolhas || [];

        // aceita tanto minúsculo quanto nome vindo da aba
        const classesPoderes =
            data.classes_poderes ||
            data.Classes_Poderes ||
            [];

        const classesPoderesEfeitos =
            data.classes_poderes_efeitos ||
            data.Classes_Poderes_Efeitos ||
            [];

        const classesPoderesEscolhas =
            data.classes_poderes_escolhas ||
            data.Classes_Poderes_Escolhas ||
            [];

        const classesPoderesIncrementos =
            data.classes_poderes_incrementos ||
            data.Classes_Poderes_Incrementos ||
            [];

        const poderesNormalizados = classesPoderes
            .filter(p => p && p.id != null && p.nome)
            .map(p => ({
                id: String(p.id),
                classe_id: p.classe_id || "",
                tipoRegistro: p.tipoRegistro || "poder",
                nome: p.nome || "",
                filtros: p.filtros || "",
                descricao: p.descricao || "",
                preRequisitos: p.preRequisitos || "",
                custoPm: Number(p.custoPm) || 0,
                custoVida: Number(p.custoVida) || 0,
                custoPmPermanente: Number(p.custoPmPermanente) || 0,
                custoVidaPermanente: Number(p.custoVidaPermanente) || 0,
                resumoUso: p.resumoUso || "",
                substituivelPorFiltros: p.substituivelPorFiltros || ""
            }));

        const poderesEfeitosNormalizados = classesPoderesEfeitos
            .filter(e => e && e.registro_id != null)
            .map(e => ({
                id: String(e.id || uid()),
                registro_id: String(e.registro_id),
                ordem: Number(e.ordem) || 0,
                tipo: e.tipo || "",
                alvo: e.alvo || "",
                valor: e.valor === "" || e.valor == null ? null : Number(e.valor),
                valorTexto: e.valorTexto || "",
                nomeAdicionado: e.nomeAdicionado || "",
                descricao: e.descricao || "",
                filtro: e.filtro || "",
                bonusAtaque: e.bonusAtaque === "" || e.bonusAtaque == null ? 0 : Number(e.bonusAtaque),
                dano: e.dano || "",
                critico: e.critico || "",
                tipoAtaque: e.tipoAtaque || "",
                alcance: e.alcance || ""
            }));

        const poderesEscolhasNormalizados = classesPoderesEscolhas
            .filter(e => e && e.registro_id != null)
            .map(e => ({
                id: String(e.id || uid()),
                registro_id: String(e.registro_id),
                ordem: Number(e.ordem) || 0,
                tipo: e.tipo || "",
                titulo: e.titulo || "",
                descricao: e.descricao || "",
                quantidade: Number(e.quantidade) || 0,
                filtro: e.filtro || "",
                opcoesTexto: e.opcoesTexto || "",
                regrasGrupo: e.regrasGrupo || "",
                dependeDe: e.dependeDe || ""
            }));

        const poderesIncrementosNormalizados = classesPoderesIncrementos
            .filter(e => e && e.registro_id != null)
            .map(e => ({
                id: String(e.id || uid()),
                registro_id: String(e.registro_id),
                ordem: Number(e.ordem) || 0,
                custoPm: Number(e.custoPm) || 0,
                custoVida: Number(e.custoVida) || 0,
                custoPmPermanente: Number(e.custoPmPermanente) || 0,
                custoVidaPermanente: Number(e.custoVidaPermanente) || 0,
                descricao: e.descricao || "",
                efeitoResumo: e.efeitoResumo || ""
            }));

        CLASSES_DB = classes.map(c => {
            const habilidadesDaClasse = habilidades
                .filter(h => h.classe_id === c.id)
                .sort((a, b) => (Number(a.ordem) || 0) - (Number(b.ordem) || 0))
                .map(h => ({
                    id: h.id,
                    nome: h.nome || "",
                    descricao: h.descricao || "",
                    custoPm: Number(h.custoPm) || 0,
                    ativavel: Number(h.ativavel) === 1,
                    permiteIntensificar: Number(h.permiteIntensificar) === 1,
                    origemTipo: h.origemTipo || "Classe",
                    origemNome: h.origemNome || c.nome,
                    nivelMinimo: Number(h.nivelMinimo) || 1
                }));

            const efeitosDaClasse = efeitos
                .filter(e => e.classe_id === c.id)
                .sort((a, b) => (Number(a.ordem) || 0) - (Number(b.ordem) || 0))
                .map(e => ({
                    id: e.id,
                    habilidade_id: e.habilidade_id || "",
                    tipo: e.tipo || "",
                    alvo: e.alvo || "",
                    valor: e.valor === "" || e.valor == null ? null : Number(e.valor),
                    valorTexto: e.valorTexto || "",
                    nomeAdicionado: e.nomeAdicionado || "",
                    descricao: e.descricao || "",
                    custoPm: e.custoPm === "" || e.custoPm == null ? 0 : Number(e.custoPm),
                    ativavel: Number(e.ativavel) === 1,
                    permiteIntensificar: Number(e.permiteIntensificar) === 1,
                    bonusAtaque: e.bonusAtaque === "" || e.bonusAtaque == null ? 0 : Number(e.bonusAtaque),
                    dano: e.dano || "",
                    critico: e.critico || "",
                    tipoAtaque: e.tipoAtaque || "",
                    alcance: e.alcance || "",
                    filtro: e.filtro || "",
                    somentePrimeiraClasse: Number(e.somentePrimeiraClasse) === 1,
                    nivelMinimo: Number(e.nivelMinimo) || 1
                }));

            const escolhasDaClasse = escolhas
                .filter(e => e.classe_id === c.id)
                .sort((a, b) => (Number(a.ordem) || 0) - (Number(b.ordem) || 0))
                .map(e => ({
                    id: e.id,
                    habilidade_id: e.habilidade_id || "",
                    tipo: e.tipo || "",
                    titulo: e.titulo || "",
                    descricao: e.descricao || "",
                    quantidade: Number(e.quantidade) || 0,
                    filtro: e.filtro || "",
                    opcoesTexto: e.opcoesTexto || "",
                    regrasGrupo: e.regrasGrupo || "",
                    dependeDe: e.dependeDe || "",
                    somentePrimeiraClasse: Number(e.somentePrimeiraClasse) === 1,
                    nivelMinimo: Number(e.nivelMinimo) || 1
                }));

            const poderesDaClasse = poderesNormalizados
                .filter(p => p.classe_id === c.id)
                .map(p => ({
                    ...p,
                    efeitos: poderesEfeitosNormalizados
                        .filter(e => e.registro_id === String(p.id))
                        .sort((a, b) => a.ordem - b.ordem),
                    escolhas: poderesEscolhasNormalizados
                        .filter(e => e.registro_id === String(p.id))
                        .sort((a, b) => a.ordem - b.ordem),
                    incrementos: poderesIncrementosNormalizados
                        .filter(e => e.registro_id === String(p.id))
                        .sort((a, b) => a.ordem - b.ordem)
                }));

            return {
                ...c,
                pvNivel1: Number(c.pvNivel1) || 0,
                pvPorNivel: Number(c.pvPorNivel) || 0,
                pmPorNivel: Number(c.pmPorNivel) || 0,
                usaMagia: Number(c.usaMagia) || 0,
                habilidades: habilidadesDaClasse,
                efeitos: efeitosDaClasse,
                escolhas: escolhasDaClasse,
                poderes: poderesDaClasse,
                atributoPrincipal: c.atributoPrincipal || "",
                periciasClasseTexto: c.periciasClasseTexto || "",
                proficienciasTexto: c.proficienciasTexto || ""
            };
        });
    } catch (err) {
        console.warn("Usando classes fallback:", err);
        CLASSES_DB = CLASSES_FALLBACK;
    }

    CLASSES_DB_CARREGADO = true;
}

async function carregarPoderesMagiasDB() {
    if (PODERES_MAGIAS_DB_CARREGADO) return;

    try {
        const res = await fetch("poderes_magias.json");
        if (!res.ok) throw new Error("poderes_magias.json não encontrado");

        const data = await res.json();

        PODERES_MAGIAS_DB = {
            registros: data.poderes_magias || [],
            efeitos: data.poderes_magias_efeitos || [],
            escolhas: data.poderes_magias_escolhas || [],
            incrementos: data.poderes_magias_incrementos || [],
            habilidadesGerais: data.habilidades_gerais || []
        };
    } catch (err) {
        console.warn("Erro carregando poderes_magias.json:", err);
        PODERES_MAGIAS_DB = {
            registros: [],
            efeitos: [],
            escolhas: [],
            incrementos: [],
            habilidadesGerais: []
        };
    }

    PODERES_MAGIAS_DB_CARREGADO = true;
}

async function carregarItensEquipamentosDB() {
    if (ITENS_EQUIPAMENTOS_DB_CARREGADO) return;

    try {
        const res = await fetch("itens_equipamentos.json");
        if (!res.ok) throw new Error("itens_equipamentos.json não encontrado");

        const data = await res.json();

        ITENS_EQUIPAMENTOS_DB = {
            registros: data.itens_equipamentos || [],
            atributos: data.itens_equipamentos_atributos || [],
            efeitos: data.itens_equipamentos_efeitos || [],
            melhorias: data.melhorias || [],
            melhoriasRegras: data.melhorias_regras || [],
            materiaisEspeciais: data.materiais_especiais || [],
            encantamentos: data.encantamentos || [],
            encantamentosRegras: data.encantamentos_regras || []
        };
    } catch (err) {
        console.warn("Erro carregando itens_equipamentos.json:", err);
        ITENS_EQUIPAMENTOS_DB = {
            registros: [],
            atributos: [],
            efeitos: [],
            melhorias: [],
            melhoriasRegras: [],
            materiaisEspeciais: [],
            encantamentos: [],
            encantamentosRegras: []
        };
    }

    ITENS_EQUIPAMENTOS_DB_CARREGADO = true;
}

let ORIGENS_DB = [];
let ORIGENS_HABILIDADES_DB = [];
let ORIGENS_EFEITOS_DB = [];
let ORIGENS_ESCOLHAS_DB = [];
let ORIGENS_DB_CARREGADO = false;

async function carregarOrigensDB() {
    if (ORIGENS_DB_CARREGADO) return;

    try {
        const res = await fetch("origem.json");
        if (!res.ok) throw new Error("origem.json não encontrado");

        const data = await res.json();

        ORIGENS_HABILIDADES_DB = data.origem_habilidades || [];
        ORIGENS_EFEITOS_DB = data.origem_efeitos || [];
        ORIGENS_ESCOLHAS_DB = data.origem_escolhas || [];

        ORIGENS_DB = (data.origem || []).map(origem => ({
            ...origem,
            habilidades: ORIGENS_HABILIDADES_DB
                .filter(h => h.origem_id === origem.id)
                .sort((a, b) => (Number(a.ordem) || 0) - (Number(b.ordem) || 0)),
            efeitos: ORIGENS_EFEITOS_DB
                .filter(e => e.origem_id === origem.id)
                .sort((a, b) => (Number(a.ordem) || 0) - (Number(b.ordem) || 0)),
            escolhas: ORIGENS_ESCOLHAS_DB
                .filter(e => e.origem_id === origem.id)
                .sort((a, b) => (Number(a.ordem) || 0) - (Number(b.ordem) || 0))
        }));
    } catch (err) {
        console.warn("Erro carregando origem.json:", err);
        ORIGENS_DB = [];
        ORIGENS_HABILIDADES_DB = [];
        ORIGENS_EFEITOS_DB = [];
        ORIGENS_ESCOLHAS_DB = [];
    }

    ORIGENS_DB_CARREGADO = true;
}
async function carregarDivindadesDB() {
    if (DIVINDADES_DB_CARREGADO) return;

    try {
        const res = await fetch("divindades.json");
        if (!res.ok) throw new Error("divindades.json não encontrado");

        const data = await res.json();

        const registros = data.divindades || data.Divindades || [];

        DIVINDADES_DB = registros
            .map(d => ({
                id: String(d.id || "").trim(),
                nome: String(d.nome || "").trim(),
                descricao: String(d.descricao || "").trim(),
                crencas_e_objetivos: String(d.crencas_e_objetivos || "").trim(),
                simbolo: String(d.simbolo || "").trim(),
                energia: String(d.energia || "").trim(),
                arma_preferida: String(d.arma_preferida || "").trim(),
                devotos_racas: String(d.devotos_racas || "").trim(),
                devotos_classes: String(d.devotos_classes || "").trim(),
                poderes: String(d.poderes || "").trim(),
                obrigacoes_restricoes: String(d.obrigacoes_restricoes || "").trim()
            }))
            .filter(d => d.id && d.nome)
            .sort((a, b) => String(a.nome || "").localeCompare(String(b.nome || ""), "pt-BR"));
    } catch (err) {
        console.warn("Erro carregando divindades.json:", err);
        DIVINDADES_DB = [];
    }

    DIVINDADES_DB_CARREGADO = true;
}

async function carregarTodosOsBancos() {
    await carregarRacasDB();
    await carregarClassesDB();
    await carregarPoderesMagiasDB();
    await carregarItensEquipamentosDB();
    await carregarOrigensDB();
    await carregarDivindadesDB();
}

function getClasseSelecionadaCriacao() {
    return CLASSES_DB.find(c => c.id === state.criacao.classeSelecionadaId) || null;
}


async function carregarRacasDB() {
  if (RACAS_DB_CARREGADO) return;

  try {
    const res = await fetch("racas.json");
    if (!res.ok) throw new Error("racas.json não encontrado");

    const data = await res.json();

    const racas = data.racas || [];
    const habilidades = data.racas_habilidades || [];
    const efeitos = data.racas_efeitos || [];
    const escolhas = data.racas_escolhas || [];

    RACAS_DB = racas.map(r => {
      const habilidadesDaRaca = habilidades
        .filter(h => h.raca_id === r.id)
        .sort((a, b) => (Number(a.ordem) || 0) - (Number(b.ordem) || 0))
        .map(h => ({
          id: h.id,
          nome: h.nome || "",
          descricao: h.descricao || "",
          custoPm: Number(h.custoPm) || 0,
          ativavel: Number(h.ativavel) === 1,
          permiteIntensificar: Number(h.permiteIntensificar) === 1,
          origemTipo: h.origemTipo || "Raça",
          origemNome: h.origemNome || r.nome
        }));

      const efeitosDaRaca = efeitos
        .filter(e => e.raca_id === r.id)
        .sort((a, b) => (Number(a.ordem) || 0) - (Number(b.ordem) || 0))
        .map(e => ({
          id: e.id,
          habilidade_id: e.habilidade_id || "",
          tipo: e.tipo || "",
          alvo: e.alvo || "",
          valor: e.valor === "" || e.valor == null ? null : Number(e.valor),
          valorTexto: e.valorTexto || "",
          nomeAdicionado: e.nomeAdicionado || "",
          descricao: e.descricao || "",
          custoPm: e.custoPm === "" || e.custoPm == null ? 0 : Number(e.custoPm),
          ativavel: Number(e.ativavel) === 1,
          permiteIntensificar: Number(e.permiteIntensificar) === 1,
          bonusAtaque: e.bonusAtaque === "" || e.bonusAtaque == null ? 0 : Number(e.bonusAtaque),
          dano: e.dano || "",
          critico: e.critico || "",
          tipoAtaque: e.tipoAtaque || "",
          alcance: e.alcance || "",
          filtro: e.filtro || ""
        }));

      const escolhasDaRaca = escolhas
        .filter(c => c.raca_id === r.id)
        .sort((a, b) => (Number(a.ordem) || 0) - (Number(b.ordem) || 0))
          .map(c => ({
              id: c.id,
              habilidade_id: c.habilidade_id || "",
              tipo: c.tipo || "",
              titulo: c.titulo || "",
              descricao: c.descricao || "",
              quantidade: Number(c.quantidade) || 0,
              filtro: c.filtro || "",
              opcoesTexto: c.opcoesTexto || "",
              regrasGrupo: c.regrasGrupo || "",
              dependeDe: c.dependeDe || ""
          }));

      return {
        ...r,
        atributosFixos: {
          forca: Number(r.forca) || 0,
          destreza: Number(r.destreza) || 0,
          constituicao: Number(r.constituicao) || 0,
          inteligencia: Number(r.inteligencia) || 0,
          sabedoria: Number(r.sabedoria) || 0,
          carisma: Number(r.carisma) || 0
        },
        habilidades: habilidadesDaRaca,
        efeitos: efeitosDaRaca,
        escolhas: escolhasDaRaca
      };
    });
  } catch (err) {
    console.warn("Usando raças fallback:", err);
    RACAS_DB = RACAS_FALLBACK;
  }

  RACAS_DB_CARREGADO = true;
}
function getOrigemSelecionadaCriacao() {
    return ORIGENS_DB.find(o => o.id === state.criacao.origemSelecionadaId) || null;
}

function selecionarOrigemCriacao(id) {
    state.criacao.origemSelecionadaId = id;
    state.criacao.origemEscolhas = {};
    state.criacao.escolhaOrigemAbertaId = null;

    const origem = getOrigemSelecionadaCriacao();
    const ficha = getFichaCriacao();
    if (ficha) {
        ficha.origem = origem?.nome || "";
    }

    render();
}
function getEscolhaOrigemValores(escolhaId) {
    return state.criacao.origemEscolhas?.[escolhaId] || [];
}

function abrirEscolhaOrigemCriacao(escolhaId) {
    state.criacao.escolhaOrigemAbertaId = escolhaId;
    render();
}

function fecharEscolhaOrigemCriacao() {
    state.criacao.escolhaOrigemAbertaId = null;
    document.body.classList.remove("modal-open");
    render();
}
function getPoderesUnicosDasOrigens() {
    return (ORIGENS_HABILIDADES_DB || [])
        .filter(h => String(h.tipo || "").toLowerCase() === "poder_unico")
        .sort((a, b) => String(a.nome || "").localeCompare(String(b.nome || ""), "pt-BR"));
}

function montarOpcaoPoderUnicoOrigem(habilidade) {
    return {
        id: `origem_habilidade:${habilidade.id}`,
        tipoAplicacao: "origem_habilidade_adicionar",
        label: `Poder único: ${habilidade.nome}`,
        valor: habilidade.nome,
        nomeCurto: habilidade.nome || "",
        descricao: habilidade.descricao || "",
        habilidadeOrigemId: habilidade.id,
        origemOrigemId: habilidade.origem_id || ""
    };
}
function getOpcoesPoderOrigemPorTexto(texto, ficha) {
    const chave = normalizarTextoRegra(texto);

    const montarListaPoderes = (filtro, usarFiltroForaConcedidos = true) => {
        let registros = buscarPoderesPorFiltro(filtro);

        if (usarFiltroForaConcedidos) {
            registros = filtrarForaPoderesConcedidos(registros);
        }

        const opcoes = registros
            .map(montarOpcaoDeRegistroBanco)
            .filter(Boolean)
            .map(op => ({
                ...op,
                id: `poder:${op.registroId || op.valor}`
            }));

        return filtrarOpcoesOrigemPorPreRequisito(opcoes, ficha);
    };

    if (
        chave === "um_poder_da_tormenta_a_escolha" ||
        chave === "um poder da tormenta a sua escolha" ||
        chave === "um poder da tormenta a escolha"
    ) {
        return montarListaPoderes("poder_tormenta");
    }

    if (
        chave === "um_poder_de_combate_a_escolha" ||
        chave === "um poder de combate a sua escolha" ||
        chave === "um poder de combate a escolha"
    ) {
        return montarListaPoderes("combate");
    }

    if (
        chave === "um_poder_de_destino_a_escolha" ||
        chave === "um poder de destino a sua escolha" ||
        chave === "um poder de destino a escolha"
    ) {
        return montarListaPoderes("destino");
    }

    if (
        chave === "um_poder_concedido_a_escolha" ||
        chave === "um poder concedido a sua escolha" ||
        chave === "um poder concedido a escolha"
    ) {
        return montarListaPoderes("poder_concedido", false);
    }

    if (chave === "*todos_os_poderes_exceto_concedidos_e_magicos*") {
        const opcoes = filtrarForaPoderesConcedidos(
            (PODERES_MAGIAS_DB.registros || []).filter(registro => {
                if (String(registro.tipoRegistro || "").toLowerCase() !== "poder") return false;

                const filtros = normalizarListaFiltros(registro.filtros || "");
                return !filtros.includes("poder_concedido") && !filtros.includes("poder_magico");
            })
        )
            .map(montarOpcaoDeRegistroBanco)
            .filter(Boolean)
            .map(op => ({
                ...op,
                id: `poder:${op.registroId || op.valor}`
            }));

        return filtrarOpcoesOrigemPorPreRequisito(opcoes, ficha);
    }

    const registro = (PODERES_MAGIAS_DB.registros || []).find(r =>
        String(r.tipoRegistro || "").toLowerCase() === "poder" &&
        normalizarTextoRegra(r.nome || "") === chave
    );

    if (!registro) return [];

    const op = montarOpcaoDeRegistroBanco(registro);

    return op
        ? filtrarOpcoesOrigemPorPreRequisito([{
            ...op,
            id: `poder:${op.registroId || op.valor}`
        }], ficha)
        : [];
}
function filtrarOpcoesOrigemPorPreRequisito(opcoes, ficha) {
    return (opcoes || []).filter(opcao => !getPreRequisitoNaoAtendidoOpcao(opcao, ficha));
}
function getRacaSelecionadaCriacao() {
  if (state.criacao.racaSelecionadaId === "custom") {
    return {
      id: "custom",
      nome: state.criacao.racaCustom.nome || "Custom",
      tipoAtributo: "custom",
      tamanho: state.criacao.racaCustom.tamanho || "",
      deslocamento: state.criacao.racaCustom.deslocamento || "",
      atributosFixos: { ...state.criacao.racaCustom.atributos },
      habilidades: (state.criacao.racaCustom.habilidadesTexto || "")
        .split("\n")
        .map(t => t.trim())
        .filter(Boolean)
        .map(nome => ({
          nome,
          custoPm: 0,
          descricao: "Habilidade racial custom."
        })),
      periciasOutros: [],
      proficiencias: []
    };
  }

  const r = RACAS_DB.find(r => r.id === state.criacao.racaSelecionadaId);
  if (!r) return null;

  return {
    ...r,
    atributosFixos: r.atributosFixos || {
      forca: Number(r.forca) || 0,
      destreza: Number(r.destreza) || 0,
      constituicao: Number(r.constituicao) || 0,
      inteligencia: Number(r.inteligencia) || 0,
      sabedoria: Number(r.sabedoria) || 0,
      carisma: Number(r.carisma) || 0
    }
  };
}

let state = {
  screen: "home",
  fichas: loadFichas(),
  fichaAtualId: null,
  modal: null,
  modalPayload: null,
  dados: {
    grupos: [
      { id: uid(), quantidade: 1, tipo: "d20" }
    ],
    ultimoResultado: null,
    historico: loadDadosHistorico()
  },
  criacao: {
  etapa: 0,
  ficha: null,
  listaRacasAberta: false,
  racaSelecionadaId: null,
  racaDistribuicao: [],
  racaEscolhas: {},
  escolhaAbertaId: null,

  listaClassesAberta: false,
  classeSelecionadaId: null,
  classeEscolhas: {},
  escolhaClasseAbertaId: null,
  origemSelecionadaId: null,
  origemEscolhas: {},
  escolhaOrigemAbertaId: null,
  divindadeSelecionadaId: null,
  divindadePoderSelecionadoNome: "",
  periciasInteligenciaAberta: false,
  periciasInteligenciaSelecoes: [],
  periciasInteligenciaQuantidade: 0,
  periciasInteligenciaAposFechar: "",

      poderClasseEscolhas: {},
      escolhaPoderClasseAbertaId: null,

      fluxoClasseAtivo: false,
      classeEvolucaoContexto: null,
      classeSelecaoEvolucaoId: "",

  racaCustom: {
    nome: "Custom",
    tamanho: "",
    deslocamento: "",
    atributos: {
      forca: 0,
      destreza: 0,
      constituicao: 0,
      inteligencia: 0,
      sabedoria: 0,
      carisma: 0
    },
    habilidadesTexto: ""
  }
 },
    evolucao: {
        ativa: false,
        fichaId: null,
        classeEscolhas: {},
        escolhaClasseAbertaId: null,
        classeEvolucaoContexto: null,
        classeSelecaoEvolucaoId: "",
        poderClasseEscolhas: {},
        escolhaPoderClasseAbertaId: null,
        divindadeEscolhaAberta: false,
        divindadeSelecionadaId: "",
        divindadePoderSelecionadoNome: ""
    },
};

const ETAPAS_CRIACAO = [
  "Identidade",
  "Atributos",
  "Raça",
  "Classe",
  "Origem",
  "Divindade",
  "Equipamento",
  "Revisão"
];

function abrirEscolhaCriacao(escolhaId) {
    state.criacao.escolhaAbertaId = escolhaId;
    render();
}

function fecharEscolhaCriacao() {
    state.criacao.escolhaAbertaId = null;
    document.body.classList.remove("modal-open");
    render();
}
function parseRegrasGrupo(texto) {
    const regras = {};
    if (!texto) return regras;

    String(texto)
        .split(";")
        .map(p => p.trim())
        .filter(Boolean)
        .forEach(parte => {
            const [chave, valor] = parte.split("=").map(v => v.trim());
            if (chave) regras[chave] = Number(valor);
        });

    return regras;
}

function normalizarListaFiltros(valor) {
    if (!valor) return [];

    if (Array.isArray(valor)) {
        return valor
            .map(v => String(v).trim().toLowerCase())
            .filter(Boolean);
    }

    return String(valor)
        .split("|")
        .map(v => v.trim().toLowerCase())
        .filter(Boolean);
}

function registroTemFiltro(registro, filtro) {
    if (!registro || !filtro) return false;

    const filtrosRegistro = normalizarListaFiltros(registro.filtros);
    const filtroBuscado = String(filtro).trim().toLowerCase();

    return filtrosRegistro.includes(filtroBuscado);
}

function registroTemTodosOsFiltros(registro, filtros) {
    const lista = normalizarListaFiltros(filtros);
    if (!lista.length) return true;

    return lista.every(filtro => registroTemFiltro(registro, filtro));
}

function buscarRegistrosPorFiltro(colecao, filtro, opcoes = {}) {
    const {
        todosFiltros = null,
        algumFiltro = null,
        tipoRegistro = null,
        ordenarPorNome = true
    } = opcoes;

    let resultados = Array.isArray(colecao) ? [...colecao] : [];

    if (tipoRegistro) {
        resultados = resultados.filter(r => String(r.tipoRegistro || "").toLowerCase() === String(tipoRegistro).toLowerCase());
    }

    if (filtro) {
        resultados = resultados.filter(r => registroTemFiltro(r, filtro));
    }

    if (todosFiltros) {
        resultados = resultados.filter(r => registroTemTodosOsFiltros(r, todosFiltros));
    }

    if (algumFiltro) {
        resultados = resultados.filter(r => registroTemAlgumFiltro(r, algumFiltro));
    }

    if (ordenarPorNome) {
        resultados.sort((a, b) => String(a.nome || "").localeCompare(String(b.nome || ""), "pt-BR"));
    }

    return resultados;
}

function buscarPoderesMagiasPorFiltro(filtro, opcoes = {}) {
    return buscarRegistrosPorFiltro(PODERES_MAGIAS_DB.registros || [], filtro, opcoes);
}

function buscarPoderesPorFiltro(filtro, opcoes = {}) {
    return buscarRegistrosPorFiltro(PODERES_MAGIAS_DB.registros || [], filtro, {
        ...opcoes,
        tipoRegistro: "poder"
    });
}

function buscarMagiasPorFiltro(filtro, opcoes = {}) {
    return buscarRegistrosPorFiltro(PODERES_MAGIAS_DB.registros || [], filtro, {
        ...opcoes,
        tipoRegistro: "magia"
    });
}

function getPoderesDaClasse(classeId) {
    const classe = getClasseDoBanco(classeId);
    return classe?.poderes || [];
}

function buscarPoderesDaClassePorFiltro(classeId, filtro) {
    const poderes = getPoderesDaClasse(classeId);

    return poderes
        .filter(p => registroTemFiltro(p, filtro))
        .sort((a, b) => String(a.nome || "").localeCompare(String(b.nome || ""), "pt-BR"));
}

function getPoderClassePorId(classeId, poderId) {
    return getPoderesDaClasse(classeId).find(p => String(p.id) === String(poderId)) || null;
}

function getRegistroPoderMagiaPorId(id) {
    return (PODERES_MAGIAS_DB.registros || []).find(r => String(r.id) === String(id)) || null;
}
function getRegistroMagiaPorNome(nome) {
    const alvo = normalizarTextoRegra(nome || "");
    if (!alvo) return null;

    return (PODERES_MAGIAS_DB.registros || []).find(r =>
        String(r.tipoRegistro || "").toLowerCase() === "magia" &&
        normalizarTextoRegra(r.nome || "") === alvo
    ) || null;
}

function montarIncrementosDaMagia(registroId) {
    return getIncrementosPoderMagia(registroId).map(inc => ({
        id: uid(),
        custoPm: Number(inc.custoPm) || 0,
        descricao: inc.descricao || "",
        selecionado: false
    }));
}

function aplicarDescontoMagiaRacial(magia, desconto = 1) {
    const base = Number(magia.custoPmBase ?? magia.custoPm) || 0;
    magia.custoPmBase = base;
    magia.descontoPmRacial = Math.max(Number(magia.descontoPmRacial) || 0, desconto);
    magia.custoPm = Math.max(0, base - magia.descontoPmRacial);
}

function adicionarOuAtualizarMagiaNaFicha(ficha, referencia, origemTipo, origemNome) {
    if (!ficha) return null;

    const nomeRef =
        typeof referencia === "string"
            ? referencia
            : (referencia?.nomeAdicionado || referencia?.nome || referencia?.valor || "");

    const registro =
        (typeof referencia === "object" && referencia?.registroId
            ? getRegistroPoderMagiaPorId(referencia.registroId)
            : null) ||
        getRegistroMagiaPorNome(nomeRef);

    const nomeFinal = registro?.nome || nomeRef;
    if (!nomeFinal) return null;

    const magiaExistente = (ficha.magias || []).find(m =>
        normalizarTextoRegra(m.nome) === normalizarTextoRegra(nomeFinal)
    );

    if (magiaExistente) {
        if (registro) {
            magiaExistente.registroId = magiaExistente.registroId || registro.id;
            magiaExistente.circulo = magiaExistente.circulo || registro.circulo || "";
            magiaExistente.execucao = magiaExistente.execucao || registro.execucao || "";
            magiaExistente.alcance = magiaExistente.alcance || registro.alcance || "";
            magiaExistente.area = magiaExistente.area || registro.area || "";
            magiaExistente.duracao = magiaExistente.duracao || registro.duracao || "";
            magiaExistente.resistencia = magiaExistente.resistencia || registro.resistencia || "";
            magiaExistente.descricao = magiaExistente.descricao || registro.descricao || "";
            if (!Array.isArray(magiaExistente.incrementos) || !magiaExistente.incrementos.length) {
                magiaExistente.incrementos = montarIncrementosDaMagia(registro.id);
            }
            if (magiaExistente.custoPmBase == null) {
                magiaExistente.custoPmBase = Number(registro.custoPm) || 0;
            }
            if (magiaExistente.custoPm == null || magiaExistente.custoPm === "") {
                magiaExistente.custoPm = Number(registro.custoPm) || 0;
            }
        }

        const existenteEhRacial = magiaExistente.origem === "Raça";
        const novaEhRacial = origemTipo === "Raça";

        if ((existenteEhRacial && !novaEhRacial) || (novaEhRacial && !existenteEhRacial)) {
            aplicarDescontoMagiaRacial(magiaExistente, 1);
        }

        return magiaExistente;
    }

    const custoBase = Number(registro?.custoPm) || 0;

    const magia = {
        id: uid(),
        nome: nomeFinal,
        circulo: registro?.circulo || "",
        custoPm: custoBase,
        custoPmBase: custoBase,
        descontoPmRacial: 0,
        execucao: registro?.execucao || "",
        alcance: registro?.alcance || "",
        area: registro?.area || "",
        duracao: registro?.duracao || "",
        resistencia: registro?.resistencia || "",
        descricao: registro?.descricao || "",
        incrementos: registro ? montarIncrementosDaMagia(registro.id) : [],
        origem: origemTipo || "Raça",
        origemDetalhe: origemNome || "",
        registroId: registro?.id || ""
    };

    ficha.magias.push(magia);
    return magia;
}

function getHabilidadeGeralPorId(id) {
    return (PODERES_MAGIAS_DB.habilidadesGerais || []).find(h => String(h.id) === String(id)) || null;
}

function getIncrementosPoderMagia(registroId) {
    return (PODERES_MAGIAS_DB.incrementos || [])
        .filter(i => String(i.registro_id) === String(registroId))
        .sort((a, b) => (Number(a.ordem) || 0) - (Number(b.ordem) || 0));
}

function getItemEquipamentoCompletoPorId(id) {
    const base = getItemEquipamentoPorId(id);
    if (!base) return null;

    const atributos = getAtributosItemEquipamento(id);

    return {
        ...base,
        atributos: atributos || {}
    };
}

function itemAceitaMelhorias(item) {
    return Number(item?.aceitaMelhorias) === 1 || item?.aceitaMelhorias === true;
}

function itemAceitaEncantamentos(item) {
    return Number(item?.aceitaEncantamentos) === 1 || item?.aceitaEncantamentos === true;
}

function criarEntradaInventario(baseId) {
    const base = getItemEquipamentoPorId(baseId);
    if (!base) return null;

    return {
        id: uid(),
        baseId: base.id,
        quantidade: Number(base.quantidadePadrao) || 1,
        melhorias: [],
        materialEspecialId: "",
        encantamentos: [],
        equipado: false
    };
}

function getMelhoriasItem(item) {
    return item?.melhorias || [];
}

function getEncantamentosItem(item) {
    return item?.encantamentos || [];
}

function getMaterialEspecialItem(item) {
    if (!item?.materialEspecialId) return null;
    return (ITENS_EQUIPAMENTOS_DB.materiaisEspeciais || []).find(m => String(m.id) === String(item.materialEspecialId)) || null;
}

function getMelhoriasAplicadas(item) {
    return getMelhoriasItem(item)
        .map(id => (ITENS_EQUIPAMENTOS_DB.melhorias || []).find(m => String(m.id) === String(id)))
        .filter(Boolean);
}

function getEncantamentosAplicados(item) {
    return getEncantamentosItem(item)
        .map(id => (ITENS_EQUIPAMENTOS_DB.encantamentos || []).find(e => String(e.id) === String(id)))
        .filter(Boolean);
}

function calcularPrecoBaseItem(itemFicha) {
    const base = getItemEquipamentoPorId(itemFicha.baseId);
    return Number(base?.preco) || 0;
}

function calcularPrecoMelhorias(itemFicha) {
    const qtd = getMelhoriasItem(itemFicha).length;
    if (qtd <= 0) return 0;

    const regra = getRegraMelhoria(qtd);
    if (!regra) return 0;

    return Number(regra.aumentoPreco) || 0;
}

function calcularPrecoEncantamentos(itemFicha) {
    const qtd = getEncantamentosItem(itemFicha).length;
    if (qtd <= 0) return 0;

    const regra = getRegraEncantamento(qtd);
    if (!regra) return 0;

    return Number(regra.aumentoPreco) || 0;
}

function calcularPrecoMaterialEspecial(itemFicha) {
    const material = getMaterialEspecialItem(itemFicha);
    return Number(material?.aumentoPreco) || 0;
}

function calcularPrecoTotalItem(itemFicha) {
    return (
        calcularPrecoBaseItem(itemFicha) +
        calcularPrecoMelhorias(itemFicha) +
        calcularPrecoEncantamentos(itemFicha) +
        calcularPrecoMaterialEspecial(itemFicha)
    ) * (Number(itemFicha.quantidade) || 1);
}

function calcularCdItem(itemFicha) {
    let cd = 0;

    const qtdMelhorias = getMelhoriasItem(itemFicha).length;
    const qtdEncantamentos = getEncantamentosItem(itemFicha).length;

    const regraMelhoria = getRegraMelhoria(qtdMelhorias);
    const regraEncantamento = getRegraEncantamento(qtdEncantamentos);

    if (regraMelhoria) cd += Number(regraMelhoria.aumentoCd) || 0;
    if (regraEncantamento) cd += Number(regraEncantamento.aumentoCd) || 0;

    return cd;
}

function normalizarChaveProficiencia(valor) {
    return String(valor || "")
        .trim()
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[\s-]+/g, "_");
}

function fichaTemProficiencia(ficha, proficiencia) {
    if (!proficiencia) return true;
    if (!ficha) return false;

    const alvo = normalizarChaveProficiencia(proficiencia);
    return (ficha.proficiencias || []).some(p => normalizarChaveProficiencia(p) === alvo);
}

function personagemPodeUsarItem(ficha, itemFicha) {
    const itemBase = getItemEquipamentoPorId(itemFicha.baseId);
    if (!itemBase) return true;

    const profNec = itemBase.proficienciaNecessaria || "";
    return fichaTemProficiencia(ficha, profNec);
}
function abrirModalProficiencias() {
    const ficha = getFichaAtual();
    if (!ficha) return;

    state.modal = "proficiencias";
    state.modalPayload = {};
    render();
}

function garantirArrayProficienciasFicha(ficha) {
    if (!ficha) return [];
    if (!Array.isArray(ficha.proficiencias)) {
        ficha.proficiencias = [];
    }
    return ficha.proficiencias;
}

function toggleProficienciaFicha(nomeProficiencia, marcado) {
    const ficha = getFichaAtual();
    if (!ficha) return;

    const lista = garantirArrayProficienciasFicha(ficha);
    const chave = normalizarChaveProficiencia(nomeProficiencia);
    const idx = lista.findIndex(p => normalizarChaveProficiencia(p) === chave);

    if (marcado) {
        if (idx < 0) {
            lista.push(nomeProficiencia);
        }
    } else {
        if (idx >= 0) {
            lista.splice(idx, 1);
        }
    }

    saveFichas();
    renderMantendoScrollEscolha();
}

function renderProficienciasModal() {
    if (state.modal !== "proficiencias") return "";

    const ficha = getFichaAtual();
    if (!ficha) return "";

    const lista = [...PROFICIENCIAS_DISPONIVEIS];

    setTimeout(() => {
        document.body.classList.add("modal-open");
    }, 0);

    return `
      <div class="overlay" onclick="fecharModal()">
        <div class="overlay-card" onclick="event.stopPropagation()">
          <div class="overlay-header">
            <div>
              <div class="overlay-title">Proficiências</div>
              <div class="overlay-subtitle">Selecione as proficiências que o personagem possui.</div>
            </div>
            <button class="btn ghost" onclick="fecharModal()">Fechar</button>
          </div>

          <div class="overlay-body">
            <div class="list">
              ${lista.map(prof => {
        const marcada = fichaTemProficiencia(ficha, prof);

        return `
                    <label class="list-item" style="cursor:pointer;">
                      <div class="choice-main">
                        <div class="list-item-title">${escapeHtml(prof)}</div>
                      </div>

                      <input
                        class="choice-checkbox"
                        type="checkbox"
                        ${marcada ? "checked" : ""}
                        onclick="event.stopPropagation()"
                        onchange="toggleProficienciaFicha('${escapeAttr(prof)}', this.checked)"
                      >
                    </label>
                  `;
    }).join("")}
            </div>
          </div>
        </div>
      </div>
    `;
}
function encontrarItemEmpilhavelNoInventario(ficha, entradaNova) {
    const inventario = ficha?.inventario || [];

    return inventario.find(item => {
        const mesmoBanco =
            !item.manual &&
            !entradaNova.manual &&
            String(item.baseId || "") === String(entradaNova.baseId || "");

        const mesmoManual =
            !!item.manual &&
            !!entradaNova.manual &&
            normalizarTextoRegra(item.nomeManual || "") === normalizarTextoRegra(entradaNova.nomeManual || "") &&
            normalizarTextoRegra(item.descricaoManual || "") === normalizarTextoRegra(entradaNova.descricaoManual || "") &&
            normalizarTextoRegra(item.categoriaManual || "") === normalizarTextoRegra(entradaNova.categoriaManual || "");

        const semCustomizacao =
            !(item.melhorias || []).length &&
            !(entradaNova.melhorias || []).length &&
            !(item.encantamentos || []).length &&
            !(entradaNova.encantamentos || []).length &&
            !item.materialEspecialId &&
            !entradaNova.materialEspecialId &&
            !item.equipado &&
            !entradaNova.equipado;

        return semCustomizacao && (mesmoBanco || mesmoManual);
    }) || null;
}

function adicionarItemInventarioPorBaseId(baseId, modo = "ganhar", valorPago = null) {
    const ficha = fichaContextoAtualParaInventario();
    if (!ficha) return;

    const entrada = criarEntradaInventario(baseId);
    if (!entrada) return;

    const preco = calcularPrecoTotalItem(entrada);

    let custo = 0;
    if (modo === "pagar") {
        custo = preco;
    } else if (modo === "desconto") {
        custo = Math.max(0, Number(valorPago) || 0);
    }

    if (custo > getDinheiroFicha(ficha)) {
        alert("Dinheiro insuficiente.");
        return;
    }

    if (!Array.isArray(ficha.inventario)) {
        ficha.inventario = [];
    }

    const existente = encontrarItemEmpilhavelNoInventario(ficha, entrada);

    if (existente) {
        existente.quantidade = (Number(existente.quantidade) || 1) + (Number(entrada.quantidade) || 1);
    } else {
        ficha.inventario.push(entrada);
    }

    if (custo > 0) {
        alterarDinheiroFicha(ficha, -custo);
    }

    if (typeof recalcularEquipamentosEFicha === "function") {
        recalcularEquipamentosEFicha(ficha);
    }

    fecharModalAdicionarItemInventario();
    salvarERenderizarInventarioContexto();
}
function abrirPromptDescontoItem(baseId) {
    state.ui = state.ui || {};
    state.ui.itemDescontoBaseId = baseId;
    state.ui.itemDescontoValor = "";
    render();
}

function updateValorDescontoItem(valor) {
    state.ui = state.ui || {};
    state.ui.itemDescontoValor = valor;
}

function confirmarDescontoItem() {
    const baseId = state.ui?.itemDescontoBaseId;
    const valor = state.ui?.itemDescontoValor;

    if (!baseId) return;
    adicionarItemInventarioPorBaseId(baseId, "desconto", valor);

    state.ui.itemDescontoBaseId = "";
    state.ui.itemDescontoValor = "";
}
function adicionarItemInventarioNaFicha(ficha, baseId) {
    if (!ficha) return false;

    const entrada = criarEntradaInventario(baseId);
    if (!entrada) return false;

    if (!Array.isArray(ficha.inventario)) {
        ficha.inventario = [];
    }

    const existente = encontrarItemEmpilhavelNoInventario(ficha, entrada);

    if (existente) {
        existente.quantidade = (Number(existente.quantidade) || 1) + (Number(entrada.quantidade) || 1);
        return true;
    }

    ficha.inventario.push(entrada);
    return true;
}
function getBaseItemDaEntrada(entrada) {
    if (!entrada) return null;
    if (entrada.manual || !entrada.baseId) return null;
    return getItemEquipamentoPorId(entrada.baseId);
}

function getItensEquipados(ficha) {
    return (ficha?.inventario || []).filter(item => item && item.equipado);
}

function getItensEquipadosPorCategoria(ficha, categoria) {
    return getItensEquipados(ficha).filter(item => {
        const base = getBaseItemDaEntrada(item);
        return normalizarTextoRegra(base?.categoria || "") === normalizarTextoRegra(categoria || "");
    });
}
function getArmasEquipadas(ficha) {
    return getItensEquipados(ficha).filter(item => {
        if (!item || item.manual) return false;

        const base = getBaseItemDaEntrada(item);
        const attrs = getAtributosItemEquipamento(item.baseId);

        if (!base || !attrs) return false;

        const categoria = normalizarTextoRegra(base.categoria || "");
        const temDadosDeAtaque =
            attrs.dano || attrs.critico || attrs.tipoDano || attrs.alcance || attrs.bonusAtaque != null;

        return categoria === "arma" || temDadosDeAtaque;
    });
}

function montarAtaqueAutomaticoDeItem(item, ataqueExistente = null) {
    const base = getBaseItemDaEntrada(item);
    const attrs = getAtributosItemEquipamento(item.baseId) || {};

    if (!base) return null;

    return {
        id: `atk_auto_${item.id}`,
        nomeBase: base.nome || "Arma",
        bonusBase: attrs.bonusAtaque ?? 0,
        danoBase: attrs.dano || "",
        criticoBase: attrs.critico || "",
        tipoBase: attrs.tipoDano || "",
        alcanceBase: attrs.alcance || "",

        nomeExtra: ataqueExistente?.nomeExtra ?? "",
        bonusExtra: ataqueExistente?.bonusExtra ?? "",
        danoExtra: ataqueExistente?.danoExtra ?? "",
        criticoExtra: ataqueExistente?.criticoExtra ?? "",
        tipoExtra: ataqueExistente?.tipoExtra ?? "",
        alcanceExtra: ataqueExistente?.alcanceExtra ?? "",

        automatico: true,
        origemEquipamento: true,
        itemInventarioId: item.id,
        baseId: item.baseId
    };
}

function sincronizarAtaquesEquipadosNaFicha(ficha) {
    if (!ficha) return;

    const ataquesAtuais = Array.isArray(ficha.ataques) ? ficha.ataques : [];

    const ataquesManuais = ataquesAtuais.filter(a => !a?.origemEquipamento);

    const mapaExistentes = new Map(
        ataquesAtuais
            .filter(a => a?.origemEquipamento && a?.itemInventarioId)
            .map(a => [a.itemInventarioId, a])
    );

    const ataquesAutomaticos = getArmasEquipadas(ficha)
        .map(item => montarAtaqueAutomaticoDeItem(item, mapaExistentes.get(item.id)))
        .filter(Boolean)
        .sort((a, b) => String(a.nomeBase || "").localeCompare(String(b.nomeBase || ""), "pt-BR"));

    ficha.ataques = [...ataquesManuais, ...ataquesAutomaticos];

    if (!ficha.ataques.length) {
        ficha.ataques = [
            {
                id: uid(),
                nome: "",
                bonus: "",
                dano: "",
                critico: "",
                tipo: "",
                alcance: "",
                automatico: false,
                origemEquipamento: false
            }
        ];
    }
}
function getDinheiroFicha(ficha) {
    return Number(ficha?.dinheiro) || 0;
}

function setDinheiroFicha(ficha, valor) {
    if (!ficha) return;
    ficha.dinheiro = Math.max(0, Number(valor) || 0);
}

function alterarDinheiroFicha(ficha, delta) {
    if (!ficha) return;
    setDinheiroFicha(ficha, getDinheiroFicha(ficha) + (Number(delta) || 0));
}

function fichaContextoAtualParaInventario() {
    return state.screen === "criacao" ? getFichaCriacao() : getFichaAtual();
}

function salvarERenderizarInventarioContexto() {
    if (state.screen !== "criacao") {
        saveFichas();
    }
    render();
}
function updateDinheiroCriacao(valor) {
    const ficha = getFichaCriacao();
    if (!ficha) return;

    setDinheiroFicha(ficha, valor);
    render();
}
function togglePainelDinheiro() {
    state.ui = state.ui || {};
    state.ui.painelDinheiroAberto = !state.ui.painelDinheiroAberto;

    const ficha = fichaContextoAtualParaInventario();
    state.ui.edicaoDinheiroRapida = String(getDinheiroFicha(ficha));

    render();
}

function updateEdicaoDinheiroRapida(valor) {
    state.ui = state.ui || {};
    state.ui.edicaoDinheiroRapida = valor;
}

function confirmarEdicaoDinheiroRapida() {
    const ficha = fichaContextoAtualParaInventario();
    if (!ficha) return;

    setDinheiroFicha(ficha, state.ui?.edicaoDinheiroRapida || 0);

    if (state.screen !== "criacao") {
        saveFichas();
    }

    render();
}
function renderWidgetDinheiroFlutuante() {
    const ficha = fichaContextoAtualParaInventario();
    if (!ficha) return "";

    const aberto = !!state.ui?.painelDinheiroAberto;
    const valor = getDinheiroFicha(ficha);

    return `
      <div style="position:fixed; left:16px; bottom:20px; z-index:1200; display:flex; flex-direction:column; gap:10px; align-items:flex-end;">
        <button class="btn" onclick="togglePainelDinheiro()">
          T$ ${escapeHtml(String(valor))}
        </button>

        ${aberto ? `
          <div class="panel" style="width:220px; box-shadow:0 8px 24px rgba(0,0,0,.18);">
            <div class="panel-title">Dinheiro</div>
            <div class="panel-body">
              <div class="field">
                <label>T$ atual</label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value="${escapeAttr(String(state.ui?.edicaoDinheiroRapida || valor))}"
                  oninput="updateEdicaoDinheiroRapida(this.value)"
                >
              </div>

              <div style="height:10px"></div>

              <div class="actions">
                <button class="btn" onclick="confirmarEdicaoDinheiroRapida()">Salvar</button>
              </div>
            </div>
          </div>
        ` : ""}
      </div>
    `;
}
function temArmaduraEquipada(ficha) {
    return getItensEquipadosPorCategoria(ficha, "armadura").length > 0;
}
function getBonusDefesaEquipamentos(ficha) {
    if (!ficha) return 0;

    return getItensEquipados(ficha).reduce((total, item) => {
        const attrs = getAtributosItemEquipamento(item.baseId);
        if (!attrs) return total;

        return total + (Number(attrs.defesa) || 0);
    }, 0);
}

function getPenalidadeArmaduraEquipamentos(ficha) {
    if (!ficha) return 0;

    return getItensEquipados(ficha).reduce((total, item) => {
        const attrs = getAtributosItemEquipamento(item.baseId);
        if (!attrs) return total;

        return total + (Number(attrs.penalidadeArmadura) || 0);
    }, 0);
}

function recalcularDefesaFicha(ficha) {
    if (!ficha) return;

    const destreza = Number(getAtributoFinal(ficha, "destreza")) || 0;
    const armadura = Number(getBonusDefesaEquipamentos(ficha)) || 0;
    const outros = Number(ficha.defesaOutros) || 0;

    ficha.defesa = 10 + destreza + armadura + outros;
}
function alternarEquipadoInventario(itemId, marcado) {
    const ficha = state.screen === "criacao" ? getFichaCriacao() : getFichaAtual();
    if (!ficha) return;

    const item = (ficha.inventario || []).find(i => String(i.id) === String(itemId));
    if (!item) return;

    item.equipado = !!marcado;

    if (typeof recalcularEquipamentosEFicha === "function") {
        recalcularEquipamentosEFicha(ficha);
    }
    if (state.screen !== "criacao") {
        saveFichas();
    }

    render();
}
function recalcularEquipamentosEFicha(ficha) {
    if (!ficha) return;

    ficha.defesaOutros = Number(ficha.defesaOutros) || 0;
    ficha.penalidadeArmadura = getPenalidadeArmaduraEquipamentos(ficha);

    recalcularDefesaFicha(ficha);
    sincronizarAtaquesEquipadosNaFicha(ficha);
    reaplicarBonusesCondicionaisPericias(ficha);
}
function getCategoriasItensDisponiveis() {
    const categorias = new Set(
        (ITENS_EQUIPAMENTOS_DB?.registros || [])
            .map(item => String(item.categoria || "").trim())
            .filter(Boolean)
    );

    return [...categorias].sort((a, b) => a.localeCompare(b, "pt-BR"));
}

function getCategoriaItensSelecionada() {
    return state.ui?.categoriaItensSelecionada || "";
}

function setCategoriaItensSelecionada(categoria) {
    state.ui = state.ui || {};
    state.ui.categoriaItensSelecionada = categoria || "";
    render();
}
function renderModalAdicionarItemInventario() {
    if (!state.ui?.modalAdicionarItemInventario) return "";

    const categorias = getCategoriasItensDisponiveis();
    const categoriaAtual = getCategoriaItensSelecionada() || categorias[0] || "";
    const itens = categoriaAtual ? buscarItensPorCategoria(categoriaAtual) : [];

    return `
      <div class="overlay" onclick="fecharModalAdicionarItemInventario()">
        <div class="overlay-card" onclick="event.stopPropagation()">
          <div class="overlay-header">
            <div>
              <div class="overlay-title">Adicionar item ao inventário</div>
              <div class="overlay-subtitle">Escolha um item do banco ou crie um item manual.</div>
            </div>
            <button class="btn ghost" onclick="fecharModalAdicionarItemInventario()">Fechar</button>
          </div>

          <div class="overlay-body">
            <div class="panel">
              <div class="panel-title">Banco de itens</div>
              <div class="panel-body">
                <div class="field">
                  <label>Categoria</label>
                  <select onchange="setCategoriaItensSelecionada(this.value)">
                    ${categorias.map(cat => `
                      <option value="${escapeAttr(cat)}" ${cat === categoriaAtual ? "selected" : ""}>
                        ${escapeHtml(cat)}
                      </option>
                    `).join("")}
                  </select>
                </div>

                <div style="height:12px"></div>

                                ${!itens.length
            ? `<div class="empty">Nenhum item encontrado.</div>`
            : `
                      <div class="list">
                        ${itens.map(item => `
                          <div class="list-item">
                            <div>
                              <div class="list-item-title">${escapeHtml(item.nome || "")}</div>
                              <div class="list-item-sub">
                                ${escapeHtml(item.categoria || "")}
                                ${item.preco ? ` • T$ ${escapeHtml(String(item.preco))}` : ""}
                              </div>
                            </div>
                            <div class="actions" style="display:flex; gap:8px; flex-wrap:wrap;">
                              <button class="btn" onclick="adicionarItemInventarioPorBaseId('${item.id}', 'ganhar')">
                                Ganhar
                              </button>
                              <button class="btn" onclick="adicionarItemInventarioPorBaseId('${item.id}', 'pagar')">
                                Pagar
                              </button>
                              <button class="btn ghost" onclick="abrirPromptDescontoItem('${item.id}')">
                                Desconto
                              </button>
                            </div>
                          </div>
                        `).join("")}
                      </div>
                    `}

                ${state.ui?.itemDescontoBaseId ? `
                  <div style="height:14px"></div>

                  <div class="panel">
                    <div class="panel-title">Comprar com desconto</div>
                    <div class="panel-body">
                      <div class="field">
                        <label>Quanto foi pago (T$)</label>
                        <input
                          type="number"
                          min="0"
                          step="1"
                          value="${escapeAttr(String(state.ui?.itemDescontoValor || ""))}"
                          oninput="updateValorDescontoItem(this.value)"
                        >
                      </div>

                      <div style="height:12px"></div>

                      <div class="actions">
                        <button class="btn" onclick="confirmarDescontoItem()">Confirmar desconto</button>
                      </div>
                    </div>
                  </div>
                ` : ""}
              </div>
            </div>

            <div style="height:14px"></div>

            <div class="panel">
              <div class="panel-title">Adicionar manualmente</div>
              <div class="panel-body">
                <div class="row-2">
                  <div class="field">
                    <label>Nome</label>
                    <input
                      value="${escapeAttr(state.ui?.novoItemManual?.nome || "")}"
                      oninput="updateNovoItemManual('nome', this.value)"
                    >
                  </div>

                  <div class="field">
                    <label>Categoria</label>
                    <input
                      value="${escapeAttr(state.ui?.novoItemManual?.categoria || "")}"
                      oninput="updateNovoItemManual('categoria', this.value)"
                    >
                  </div>
                </div>

                <div style="height:12px"></div>

                <div class="row-2">
                  <div class="field">
                    <label>Quantidade</label>
                    <input
                      type="number"
                      min="1"
                      value="${escapeAttr(String(state.ui?.novoItemManual?.quantidade || 1))}"
                      oninput="updateNovoItemManual('quantidade', this.value)"
                    >
                  </div>

                  <div class="field">
                    <label>Descrição</label>
                    <input
                      value="${escapeAttr(state.ui?.novoItemManual?.descricao || "")}"
                      oninput="updateNovoItemManual('descricao', this.value)"
                    >
                  </div>
                </div>

                <div style="height:12px"></div>

                <div class="actions">
                  <button class="btn" onclick="adicionarItemManualInventario()">Adicionar manualmente</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
}
function abrirModalAdicionarItemInventario() {
    state.ui = state.ui || {};
    state.ui.modalAdicionarItemInventario = true;
    state.ui.novoItemManual = state.ui.novoItemManual || {
        nome: "",
        categoria: "",
        quantidade: 1,
        descricao: ""
    };
    render();
}

function fecharModalAdicionarItemInventario() {
    state.ui = state.ui || {};
    state.ui.modalAdicionarItemInventario = false;
    render();
}

function updateNovoItemManual(campo, valor) {
    state.ui = state.ui || {};
    state.ui.novoItemManual = state.ui.novoItemManual || {
        nome: "",
        categoria: "",
        quantidade: 1,
        descricao: ""
    };

    state.ui.novoItemManual[campo] = valor;
}
function criarEntradaInventarioManual(dados = {}) {
    return {
        id: uid(),
        baseId: "",
        nomeManual: String(dados.nome || "").trim(),
        categoriaManual: String(dados.categoria || "").trim(),
        descricaoManual: String(dados.descricao || "").trim(),
        quantidade: Math.max(1, Number(dados.quantidade) || 1),
        melhorias: [],
        materialEspecialId: "",
        encantamentos: [],
        equipado: false,
        manual: true
    };
}
function abrirDetalhesItemInventario(itemId) {
    state.ui = state.ui || {};
    state.ui.itemInventarioDetalheId = itemId;
    render();
}

function fecharDetalhesItemInventario() {
    state.ui = state.ui || {};
    state.ui.itemInventarioDetalheId = "";
    render();
}
function getTiposItemBanco(item) {
    return normalizarListaFiltros(
        item?.tipos || item?.tipo || item?.subtipo || item?.tags || ""
    );
}

function itemBancoBateComTipoGenerico(item, tipoBase) {
    const base = normalizarTextoRegra(tipoBase || "");
    if (!base) return false;

    const tipos = getTiposItemBanco(item);

    return tipos.some(tipo => {
        const t = normalizarTextoRegra(tipo);
        return t === base || t.startsWith(base + "_");
    });
}
function getQuantidadeEscolhaOrigem(escolha) {
    const qtd = Number(escolha?.quantidade);
    if (!Number.isNaN(qtd) && qtd > 0) return qtd;

    if (String(escolha?.filtro || "").toLowerCase() === "origem_amnesico_mestre") {
        return 2;
    }

    return 0;
}
function buscarItensPorTipoGenerico(tipoBase) {
    return (ITENS_EQUIPAMENTOS_DB?.registros || [])
        .filter(item => itemBancoBateComTipoGenerico(item, tipoBase))
        .sort((a, b) => String(a.nome || "").localeCompare(String(b.nome || ""), "pt-BR"));
}

function resolverFiltroEscolhaItemOrigem(texto) {
    const chave = normalizarTextoRegra(texto);

    if (chave.includes("arma simples")) return { modo: "tipo_generico", valor: "arma_simples" };
    if (chave.includes("arma marcial")) return { modo: "tipo_generico", valor: "arma_marcial" };
    if (chave.includes("arma exótica") || chave.includes("arma exotica")) return { modo: "tipo_generico", valor: "arma_exotica" };

    if (chave.includes("armadura leve")) return { modo: "tipo_generico", valor: "armadura_leve" };
    if (chave.includes("armadura pesada")) return { modo: "tipo_generico", valor: "armadura_pesada" };
    if (chave.includes("escudo")) return { modo: "tipo_generico", valor: "escudo" };

    if (chave.includes("animal")) return { modo: "tipo_generico", valor: "animal" };

    return null;
}

function montarOpcoesItemOrigemAPartirTexto(textoItem) {
    const filtro = resolverFiltroEscolhaItemOrigem(textoItem);

    if (filtro?.modo === "tipo_generico") {
        const itens = buscarItensPorTipoGenerico(filtro.valor);

        if (itens.length) {
            return itens.map(registro => ({
                id: `origem_item_banco:${registro.id}`,
                tipoAplicacao: "origem_item_banco_adicionar",
                label: `Item: ${registro.nome}`,
                valor: registro.nome,
                itemBaseId: registro.id,
                descricao: registro.descricao || ""
            }));
        }
    }

    const registroExato = getRegistroItemPorNomeExato(textoItem);
    if (registroExato) {
        return [{
            id: `origem_item_banco:${registroExato.id}`,
            tipoAplicacao: "origem_item_banco_adicionar",
            label: `Item: ${registroExato.nome}`,
            valor: registroExato.nome,
            itemBaseId: registroExato.id,
            descricao: registroExato.descricao || ""
        }];
    }

    return [{
        id: `origem_item_custom:${textoItem}`,
        tipoAplicacao: "origem_item_custom_adicionar",
        label: `Item: ${textoItem}`,
        valor: textoItem,
        nomeCurto: textoItem,
        descricao: "Item concedido pela origem."
    }];
}
function getItemInventarioDetalheAtual() {
    const ficha = state.screen === "criacao" ? getFichaCriacao() : getFichaAtual();
    if (!ficha) return null;

    const itemId = state.ui?.itemInventarioDetalheId;
    if (!itemId) return null;

    return (ficha.inventario || []).find(item => String(item.id) === String(itemId)) || null;
}
function renderModalDetalhesItemInventario() {
    const item = getItemInventarioDetalheAtual();
    if (!item) return "";

    const base = getBaseItemDaEntrada(item);
    const nome = base?.nome || item.nomeManual || "Item";
    const categoria = base?.categoria || item.categoriaManual || "";
    const descricao = base?.descricao || item.descricaoManual || "";
    const atributos = base ? (getAtributosItemEquipamento(base.id) || {}) : {};
    const melhorias = getMelhoriasAplicadas(item);
    const encantamentos = getEncantamentosAplicados(item);
    const material = getMaterialEspecialItem(item);

    return `
      <div class="overlay" onclick="fecharDetalhesItemInventario()">
        <div class="overlay-card" onclick="event.stopPropagation()">
          <div class="overlay-header">
            <div>
              <div class="overlay-title">${escapeHtml(nome)}</div>
              <div class="overlay-subtitle">
                ${escapeHtml(categoria || (item.manual ? "Item manual" : ""))}
                ${item.quantidade > 1 ? ` • Quantidade: ${escapeHtml(String(item.quantidade))}` : ""}
              </div>
            </div>
            <button class="btn ghost" onclick="fecharDetalhesItemInventario()">Fechar</button>
          </div>

          <div class="overlay-body">
            ${descricao ? `
              <div class="panel">
                <div class="panel-title">Descrição</div>
                <div class="panel-body">${escapeHtml(descricao)}</div>
              </div>
              <div style="height:14px"></div>
            ` : ""}

            ${base ? `
              <div class="panel">
                <div class="panel-title">Dados do item</div>
                <div class="panel-body">
                  <div class="list">
                    <div class="list-item">
                      <div>
                        <div class="list-item-title">Preço total</div>
                        <div class="list-item-sub">T$ ${escapeHtml(String(calcularPrecoTotalItem(item)))}</div>
                      </div>
                    </div>

                    <div class="list-item">
                      <div>
                        <div class="list-item-title">CD de fabricação</div>
                        <div class="list-item-sub">${escapeHtml(String(calcularCdItem(item)))}</div>
                      </div>
                    </div>

                    ${base.proficienciaNecessaria ? `
                      <div class="list-item">
                        <div>
                          <div class="list-item-title">Proficiência necessária</div>
                          <div class="list-item-sub">${escapeHtml(base.proficienciaNecessaria)}</div>
                        </div>
                      </div>
                    ` : ""}

                    ${base.carga != null ? `
                      <div class="list-item">
                        <div>
                          <div class="list-item-title">Carga</div>
                          <div class="list-item-sub">${escapeHtml(String(base.carga))}</div>
                        </div>
                      </div>
                    ` : ""}

                    ${atributos.dano ? `
                      <div class="list-item">
                        <div>
                          <div class="list-item-title">Dano</div>
                          <div class="list-item-sub">${escapeHtml(String(atributos.dano))}</div>
                        </div>
                      </div>
                    ` : ""}

                    ${atributos.critico ? `
                      <div class="list-item">
                        <div>
                          <div class="list-item-title">Crítico</div>
                          <div class="list-item-sub">${escapeHtml(String(atributos.critico))}</div>
                        </div>
                      </div>
                    ` : ""}

                    ${atributos.tipoDano ? `
                      <div class="list-item">
                        <div>
                          <div class="list-item-title">Tipo de dano</div>
                          <div class="list-item-sub">${escapeHtml(String(atributos.tipoDano))}</div>
                        </div>
                      </div>
                    ` : ""}

                    ${atributos.alcance ? `
                      <div class="list-item">
                        <div>
                          <div class="list-item-title">Alcance</div>
                          <div class="list-item-sub">${escapeHtml(String(atributos.alcance))}</div>
                        </div>
                      </div>
                    ` : ""}

                    ${atributos.defesa ? `
                      <div class="list-item">
                        <div>
                          <div class="list-item-title">Defesa</div>
                          <div class="list-item-sub">${escapeHtml(String(atributos.defesa))}</div>
                        </div>
                      </div>
                    ` : ""}

                    ${atributos.penalidadeArmadura ? `
                      <div class="list-item">
                        <div>
                          <div class="list-item-title">Penalidade de armadura</div>
                          <div class="list-item-sub">${escapeHtml(String(atributos.penalidadeArmadura))}</div>
                        </div>
                      </div>
                    ` : ""}
                  </div>
                </div>
              </div>
            ` : ""}

            ${(material || melhorias.length || encantamentos.length) ? `
              <div style="height:14px"></div>
              <div class="panel">
                <div class="panel-title">Aprimoramentos</div>
                <div class="panel-body">
                  <div class="list">
                    ${material ? `
                      <div class="list-item">
                        <div>
                          <div class="list-item-title">Material especial</div>
                          <div class="list-item-sub">${escapeHtml(material.nome || "")}</div>
                        </div>
                      </div>
                    ` : ""}

                    ${melhorias.length ? `
                      <div class="list-item">
                        <div>
                          <div class="list-item-title">Melhorias</div>
                          <div class="list-item-sub">${escapeHtml(melhorias.map(m => m.nome).join(", "))}</div>
                        </div>
                      </div>
                    ` : ""}

                    ${encantamentos.length ? `
                      <div class="list-item">
                        <div>
                          <div class="list-item-title">Encantamentos</div>
                          <div class="list-item-sub">${escapeHtml(encantamentos.map(e => e.nome).join(", "))}</div>
                        </div>
                      </div>
                    ` : ""}
                  </div>
                </div>
              </div>
            ` : ""}
          </div>
        </div>
      </div>
    `;
}
function adicionarItemManualInventario() {
    const ficha = state.screen === "criacao" ? getFichaCriacao() : getFichaAtual();
    if (!ficha) return;

    const dados = state.ui?.novoItemManual || {};
    if (!String(dados.nome || "").trim()) return;

    ficha.inventario = ficha.inventario || [];
    const entrada = criarEntradaInventarioManual(dados);
    const existente = encontrarItemEmpilhavelNoInventario(ficha, entrada);

    if (existente) {
        existente.quantidade = (Number(existente.quantidade) || 1) + (Number(entrada.quantidade) || 1);
    } else {
        ficha.inventario.push(entrada);
    }

    if (state.screen !== "criacao") {
        saveFichas();
    }

    state.ui.novoItemManual = {
        nome: "",
        categoria: "",
        quantidade: 1,
        descricao: ""
    };

    fecharModalAdicionarItemInventario();
}
function removerItemInventarioSemConfirmar(itemId) {
    const ficha = state.screen === "criacao" ? getFichaCriacao() : getFichaAtual();
    if (!ficha) return;

    const item = (ficha.inventario || []).find(i => String(i.id) === String(itemId));
    if (!item) return;

    const quantidade = Math.max(1, Number(item.quantidade) || 1);

    if (quantidade > 1) {
        item.quantidade = quantidade - 1;
    } else {
        ficha.inventario = (ficha.inventario || []).filter(i => String(i.id) !== String(itemId));
    }

    if (typeof recalcularEquipamentosEFicha === "function") {
        recalcularEquipamentosEFicha(ficha);
    }

    if (state.screen !== "criacao") {
        saveFichas();
    }

    render();
}
function removerItemInventario(itemId) {
    const ficha = state.screen === "criacao" ? getFichaCriacao() : getFichaAtual();
    if (!ficha) return;

    const item = (ficha.inventario || []).find(i => String(i.id) === String(itemId));
    if (!item) return;

    const base = getBaseItemDaEntrada(item);
    const nome = base?.nome || item.nomeManual || "item";
    const quantidade = Math.max(1, Number(item.quantidade) || 1);

    const mensagem = quantidade > 1
        ? `Remover 1 unidade de ${nome}?`
        : `Excluir ${nome}?`;

    if (!confirm(mensagem)) return;

    if (quantidade > 1) {
        item.quantidade = quantidade - 1;
    } else {
        ficha.inventario = (ficha.inventario || []).filter(i => String(i.id) !== String(itemId));
    }

    if (typeof recalcularEquipamentosEFicha === "function") {
        recalcularEquipamentosEFicha(ficha);
    }

    if (state.screen !== "criacao") {
        saveFichas();
    }

    render();
}
function renderInventarioSimples(ficha) {
    const itens = ficha?.inventario || [];

    return `
      <div class="panel">
        <div class="panel-title">Inventário</div>
        <div class="panel-body">
          <div class="actions" style="margin-bottom:12px;">
            <button class="btn" onclick="abrirModalAdicionarItemInventario()">Adicionar item</button>
          </div>

          ${!itens.length
            ? `<div class="empty">Nenhum item no inventário.</div>`
            : `
              <div class="list">
                ${itens.map(item => {
                const base = getBaseItemDaEntrada(item);
                const nome = base?.nome || item.nomeManual || "Item";
                const qtd = Math.max(1, Number(item.quantidade) || 1);
                const titulo = `${qtd} x ${nome}`;

                return `
                      <div class="list-item" style="align-items:center; gap:12px;">
                        <div style="flex:1; min-width:0;">
                          <button
                            class="btn ghost"
                            style="padding:0; border:none; background:none; justify-content:flex-start; text-align:left; width:100%;"
                            onclick="abrirDetalhesItemInventario('${item.id}')"
                          >
                            <span class="list-item-title">${escapeHtml(titulo)}</span>
                          </button>
                        </div>

                        <div class="actions" style="display:flex; align-items:center; gap:10px; flex-wrap:nowrap;">
                          <label style="display:flex; align-items:center; gap:6px; margin:0;">
                            <input
                              type="checkbox"
                              ${item.equipado ? "checked" : ""}
                              onchange="alternarEquipadoInventario('${item.id}', this.checked)"
                            >
                            Equipado
                          </label>

                          <button class="btn danger" onclick="removerItemInventario('${item.id}')">
                            Excluir
                          </button>
                        </div>
                      </div>
                    `;
            }).join("")}
              </div>
            `}
        </div>
      </div>
    `;
}
function personagemSemArmadura(ficha) {
    return !temArmaduraEquipada(ficha);
}
function buscarItensEquipamentosPorFiltro(filtro, opcoes = {}) {
    return buscarRegistrosPorFiltro(ITENS_EQUIPAMENTOS_DB.registros || [], filtro, opcoes);
}

function buscarItensPorCategoria(categoria, opcoes = {}) {
    let resultados = [...(ITENS_EQUIPAMENTOS_DB.registros || [])];

    if (categoria) {
        resultados = resultados.filter(r => String(r.categoria || "").toLowerCase() === String(categoria).toLowerCase());
    }

    if (opcoes.filtro) {
        resultados = resultados.filter(r => registroTemFiltro(r, opcoes.filtro));
    }

    resultados.sort((a, b) => String(a.nome || "").localeCompare(String(b.nome || ""), "pt-BR"));
    return resultados;
}

function getItemEquipamentoPorId(id) {
    return (ITENS_EQUIPAMENTOS_DB.registros || []).find(r => String(r.id) === String(id)) || null;
}

function getAtributosItemEquipamento(registroId) {
    return (ITENS_EQUIPAMENTOS_DB.atributos || []).find(r => String(r.registro_id) === String(registroId)) || null;
}

function buscarMelhoriasPorFiltro(filtro, opcoes = {}) {
    return buscarRegistrosPorFiltro(ITENS_EQUIPAMENTOS_DB.melhorias || [], filtro, opcoes);
}

function buscarMateriaisEspeciaisPorFiltro(filtro, opcoes = {}) {
    return buscarRegistrosPorFiltro(ITENS_EQUIPAMENTOS_DB.materiaisEspeciais || [], filtro, opcoes);
}

function buscarEncantamentosPorFiltro(filtro, opcoes = {}) {
    return buscarRegistrosPorFiltro(ITENS_EQUIPAMENTOS_DB.encantamentos || [], filtro, opcoes);
}

function getRegraMelhoria(numeroMelhorias) {
    return (ITENS_EQUIPAMENTOS_DB.melhoriasRegras || []).find(r => Number(r.numeroMelhorias) === Number(numeroMelhorias)) || null;
}

function getRegraEncantamento(numeroEncantamentos) {
    return (ITENS_EQUIPAMENTOS_DB.encantamentosRegras || []).find(r => Number(r.numeroEncantamentos) === Number(numeroEncantamentos)) || null;
}

function listarNomesRegistros(lista) {
    return (lista || []).map(r => r.nome);
}

function escolhaRacialDesbloqueada(escolha) {
    if (!escolha?.dependeDe) return true;

    const raca = getRacaSelecionadaCriacao();
    const ficha = getFichaCriacao();
    const escolhasDisponiveis = getEscolhasRaciaisDisponiveis(raca, ficha);

    let dependencia = escolhasDisponiveis.find(e => e.id === escolha.dependeDe);

    if (!dependencia && escolha.origemMemoriaPostuma) {
        dependencia = escolhasDisponiveis.find(e =>
            e.origemMemoriaPostuma &&
            String(e.escolhaBaseId || "") === String(escolha.dependeDe)
        );
    }

    if (!dependencia) return true;

    return escolhaRacialPreenchida(dependencia);
}

function escolhaClasseDesbloqueada(escolha) {
    if (!escolha?.dependeDe) return true;

    const dependencia = getClasseSelecionadaCriacao()?.escolhas?.find(e => e.id === escolha.dependeDe);
    if (!dependencia) return true;

    return escolhaClassePreenchida(dependencia);
}

function getCaminhosClasse(classeId) {
    return (CLASSES_CAMINHOS_DB || []).filter(c => String(c.classe_id) === String(classeId));
}

function getCaminhoClassePorNome(classeId, nome) {
    const alvo = normalizarTextoRegra(nome || "");
    return getCaminhosClasse(classeId).find(c =>
        normalizarTextoRegra(c.nome) === alvo
    ) || null;
}

function getCaminhoArcanistaDaFicha(ficha) {
    if (!ficha) return null;

    if (String(ficha.arcanistaCaminho || "").trim()) {
        return String(ficha.arcanistaCaminho).trim();
    }

    const caminhos = ["Bruxo", "Feiticeiro", "Mago"];

    const encontradoNaFicha = caminhos.find(nome =>
        (ficha.habilidades || []).some(h =>
            normalizarTextoRegra(h.nome) === normalizarTextoRegra(nome)
        )
    );

    if (encontradoNaFicha) return encontradoNaFicha;

    // durante a criação: olhar escolhas pendentes da classe
    const pendenteCriacao = Object.values(state.criacao?.classeEscolhas || {})
        .flat()
        .find(op =>
            op?.tipoAplicacao === "grupo_escolha" &&
            caminhos.some(nome => normalizarTextoRegra(nome) === normalizarTextoRegra(op.valor))
        );

    if (pendenteCriacao?.valor) return pendenteCriacao.valor;

    // durante evolução da ficha pronta
    const pendenteEvolucao = Object.values(state.evolucao?.classeEscolhas || {})
        .flat()
        .find(op =>
            op?.tipoAplicacao === "grupo_escolha" &&
            caminhos.some(nome => normalizarTextoRegra(nome) === normalizarTextoRegra(op.valor))
        );

    if (pendenteEvolucao?.valor) return pendenteEvolucao.valor;

    return null;
}

function classeRecebeMagiasNoNivel(classe, nivelClasse, ficha) {
    if (!classe || nivelClasse <= 0) return false;

    const nomeClasse = normalizarTextoRegra(classe.nome || "");

    if (nomeClasse !== "arcanista") {
        return true;
    }

    const caminho = getCaminhoArcanistaDaFicha(ficha);
    if (!caminho) return false;

    const registroCaminho = getCaminhoClassePorNome(classe.id, caminho);
    const progressao = String(registroCaminho?.progressaoMagia || "todos").toLowerCase();

    if (progressao === "impares") {
        return nivelClasse % 2 === 1;
    }

    return true;
}

function periciaJaTreinadaNaCriacao(ficha, nomePericia) {
    const pericia = ficha?.pericias?.find(p => p.nome === nomePericia);
    return !!pericia?.treinada;
}

function getTodasEscolhasAtuaisComoValores() {
    const valores = [];

    Object.values(state.criacao.racaEscolhas || {}).forEach(lista => {
        (lista || []).forEach(item => {
            if (item?.valor) valores.push(item.valor);
        });
    });

    Object.values(state.criacao.classeEscolhas || {}).forEach(lista => {
        (lista || []).forEach(item => {
            if (item?.valor) valores.push(item.valor);
        });
    });

    return valores;
}

function opcaoPericiaIndisponivelPorTreinoGlobal(opcao, escolhaIdAtual, tipoOrigem) {
    const ficha = getFichaCriacao();
    if (!ficha || opcao.tipoAplicacao !== "pericia_treinada") return false;

    const pericia = ficha.pericias.find(p => p.nome === opcao.valor);
    if (pericia?.treinada) return true;

    const colecao = tipoOrigem === "classe"
        ? (state.criacao.classeEscolhas || {})
        : (state.criacao.racaEscolhas || {});

    for (const [escolhaId, lista] of Object.entries(colecao)) {
        if (escolhaId === escolhaIdAtual) continue;

        if ((lista || []).some(item => item.tipoAplicacao === "pericia_treinada" && item.valor === opcao.valor)) {
            return true;
        }
    }

    return false;
}

function extrairQuantidadePreRequisitoPoderTormenta(texto) {
    const base = String(texto || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    if (!base) return 0;

    if (/\bum\b|\buma\b/.test(base) && /poder(?:es)? da tormenta/.test(base)) return 1;
    if (/\bdois\b/.test(base) && /poder(?:es)? da tormenta/.test(base)) return 2;
    if (/\btres\b/.test(base) && /poder(?:es)? da tormenta/.test(base)) return 3;
    if (/\bquatro\b/.test(base) && /poder(?:es)? da tormenta/.test(base)) return 4;
    if (/\bcinco\b/.test(base) && /poder(?:es)? da tormenta/.test(base)) return 5;

    const match = base.match(/(\d+)\s+outros?\s+poder(?:es)? da tormenta|(\d+)\s+poder(?:es)? da tormenta/);
    if (match) {
        return Number(match[1] || match[2]) || 0;
    }

    return 0;
}

function analisarPreRequisitoPoderTormentaLivre(texto) {
    const base = normalizarTextoRegra(texto);
    if (!base.includes("poder") || !base.includes("tormenta")) {
        return null;
    }

    // casos como "outro poder da tormenta" / "outros poderes da tormenta"
    if (/\boutro\b|\boutros\b/.test(base)) {
        const numero = extrairQuantidadePreRequisitoPoderTormenta(base);
        return {
            minimo: numero > 0 ? numero : 1,
            exigeOutro: true
        };
    }

    // casos como "um poder da tormenta", "quatro poderes da tormenta"
    const numero = extrairQuantidadePreRequisitoPoderTormenta(base);
    if (numero > 0) {
        return {
            minimo: numero,
            exigeOutro: false
        };
    }

    return null;
}

function contarPoderesTormentaPendentesNaCriacao() {
    let total = 0;

    Object.values(state.criacao.racaEscolhas || {}).forEach(lista => {
        (lista || []).forEach(item => {
            if (item?.ehPoderTormenta) total++;
        });
    });

    Object.values(state.criacao.classeEscolhas || {}).forEach(lista => {
        (lista || []).forEach(item => {
            if (item?.ehPoderTormenta) total++;
        });
    });

    return total;
}

function contarPoderesTormentaNaFicha(ficha) {
    if (!ficha) return 0;

    let total = 0;
    const vistos = new Set();

    (ficha.habilidades || []).forEach(habilidade => {
        const registroId = habilidade?.registroId;
        if (!registroId) return;

        const registro = getRegistroPoderMagiaPorId(registroId);
        if (!registro) return;

        if (!registroTemFiltro(registro, "poder_tormenta")) return;

        const chave = normalizarTextoRegra(registro.nome || registroId);
        if (vistos.has(chave)) return;

        vistos.add(chave);
        total++;
    });

    const escolhasResolvidas = Array.isArray(ficha.escolhasRaciaisResolvidas)
        ? ficha.escolhasRaciaisResolvidas
        : [];

    escolhasResolvidas.forEach(escolha => {
        (escolha?.opcoes || []).forEach(op => {
            if (!op?.ehPoderTormenta) return;

            const chave = normalizarTextoRegra(op.valor || op.nome || op.id || "");
            if (!chave || vistos.has(chave)) return;

            vistos.add(chave);
            total++;
        });
    });

    return total;
}
function getTotalPoderesTormentaParaPreRequisito(ficha) {
    return contarPoderesTormentaNaFicha(ficha) + contarPoderesTormentaPendentesNaCriacao();
}

function normalizarNomePreRequisitoLivre(txt) {
    return normalizarTextoRegra(txt)
        .replace(/^pre-?requisitos?\s*:\s*/i, "")
        .replace(/^outro\s+/i, "")
        .replace(/^outra\s+/i, "")
        .replace(/\.$/, "")
        .trim();
}

function normalizarTextoRegra(txt) {
    return String(txt || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/\s+/g, " ")
        .trim();
}

function contarPoderesTormentaPendentesComPerdaCarisma() {
    let total = 0;

    Object.values(state.criacao.racaEscolhas || {}).forEach(lista => {
        (lista || []).forEach(item => {
            if (item?.ehPoderTormenta && item?.contaCarismaTormenta !== false) {
                total++;
            }
        });
    });

    Object.values(state.criacao.classeEscolhas || {}).forEach(lista => {
        (lista || []).forEach(item => {
            if (item?.ehPoderTormenta && item?.contaCarismaTormenta !== false) {
                total++;
            }
        });
    });

    return total;
}

function contarPoderesTormentaNaFichaComPerdaCarisma(ficha) {
    if (!ficha) return 0;

    let total = 0;

    (ficha.habilidades || []).forEach(h => {
        if (!h?.registroId) return;

        const registro = getRegistroPoderMagiaPorId(h.registroId);
        if (!registro) return;

        if (registroTemFiltro(registro, "poder_tormenta")) {
            total++;
        }
    });

    return total;
}

function getTotalPoderesTormentaComPerdaCarisma(ficha) {
    return contarPoderesTormentaNaFichaComPerdaCarisma(ficha) + contarPoderesTormentaPendentesComPerdaCarisma();
}

function calcularPenalidadeCarismaPorTormenta(totalPoderesTormenta) {
    const total = Number(totalPoderesTormenta) || 0;
    if (total <= 0) return 0;
    return 1 + Math.floor((total - 1) / 2);
}

function getMapaAtributosPreReq(ficha) {
    const getValor = (atributo) => {
        if (state.screen === "criacao") {
            return getAtributoFinalCriacaoPreview(ficha, atributo);
        }
        return getAtributoFinal(ficha, atributo);
    };

    return {
        forca: getValor("forca"),
        destreza: getValor("destreza"),
        constituicao: getValor("constituicao"),
        inteligencia: getValor("inteligencia"),
        sabedoria: getValor("sabedoria"),
        carisma: getValor("carisma")
    };
}

function getNiveisDeClasseNoContexto(ficha) {
    const mapa = {};

    (ficha?.classesPersonagem || []).forEach(cp => {
        const id = cp.classeId || cp.id;
        if (!id) return;
        mapa[id] = Number(cp.nivel) || 0;
    });

    const classeCriacao = getClasseSelecionadaCriacao?.();
    const ctxCriacao = state.criacao?.classeEvolucaoContexto;

    if (classeCriacao) {
        if (ctxCriacao?.classeId === classeCriacao.id) {
            mapa[classeCriacao.id] = Math.max(
                mapa[classeCriacao.id] || 0,
                Number(ctxCriacao.nivelAlvo) || 1
            );
        } else if (!mapa[classeCriacao.id]) {
            mapa[classeCriacao.id] = 1;
        }
    }

    return mapa;
}

function getNomesPericiasTreinadasNoContexto(ficha) {
    const set = new Set();

    (ficha?.pericias || []).forEach(p => {
        if (p?.treinada) set.add(p.nome);
    });

    Object.values(state.criacao?.racaEscolhas || {}).forEach(lista => {
        (lista || []).forEach(op => {
            if (op?.tipoAplicacao === "pericia_treinada" && op?.valor) set.add(op.valor);
        });
    });

    Object.values(state.criacao?.classeEscolhas || {}).forEach(lista => {
        (lista || []).forEach(op => {
            if (op?.tipoAplicacao === "pericia_treinada" && op?.valor) set.add(op.valor);
        });
    });

    return set;
}

function getNomesHabilidadesNoContexto(ficha) {
    const set = new Set();

    (ficha?.habilidades || []).forEach(h => {
        if (h?.nome) set.add(normalizarNomePreRequisitoLivre(h.nome));
    });

    Object.values(state.criacao?.racaEscolhas || {}).forEach(lista => {
        (lista || []).forEach(op => {
            if ((op?.tipoAplicacao === "habilidade_adicionar" || op?.tipoAplicacao === "poder_adicionar") && op?.valor) {
                set.add(normalizarNomePreRequisitoLivre(op.valor));
            }
        });
    });

    Object.values(state.criacao?.classeEscolhas || {}).forEach(lista => {
        (lista || []).forEach(op => {
            if ((op?.tipoAplicacao === "habilidade_adicionar" || op?.tipoAplicacao === "poder_adicionar") && op?.valor) {
                set.add(normalizarNomePreRequisitoLivre(op.valor));
            }
        });
    });

    return set;
}

function getNomesConhecidosDePoderesEHabilidades() {
    const set = new Set();

    (PODERES_MAGIAS_DB.registros || []).forEach(r => {
        if (r?.nome) set.add(normalizarNomePreRequisitoLivre(r.nome));
    });

    CLASSES_DB.forEach(classe => {
        (classe?.poderes || []).forEach(p => {
            if (p?.nome) set.add(normalizarNomePreRequisitoLivre(p.nome));
        });

        (classe?.habilidades || []).forEach(h => {
            if (h?.nome) set.add(normalizarNomePreRequisitoLivre(h.nome));
        });
    });

    RACAS_DB.forEach(raca => {
        (raca?.habilidades || []).forEach(h => {
            if (h?.nome) set.add(normalizarNomePreRequisitoLivre(h.nome));
        });
    });

    return set;
}

function normalizarNomeDivindadeParaFiltro(nome) {
    const base = String(nome || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/['’]/g, "")
        .replace(/\bde\b|\bdo\b|\bda\b|\bdos\b|\bdas\b/g, " ")
        .replace(/[^a-z0-9]+/g, "_")
        .replace(/^_+|_+$/g, "");

    const aliases = {
        "tanna_toh": "tannatoh",
        "lin_wu": "linwu"
    };

    return `devoto_${aliases[base] || base}`;
}

function getFiltroDevocaoDaFicha(ficha) {
    const nome = String(ficha?.divindade || "").trim();
    if (!nome) return "";
    return normalizarNomeDivindadeParaFiltro(nome);
}

function filtrarForaPoderesConcedidos(registros) {
    return (registros || []).filter(r => !registroTemFiltro(r, "poder_concedido"));
}
function filtrarForaMagiasJaConhecidas(registros, ficha) {
    const magiasConhecidas = (ficha?.magias || []).map(m => ({
        id: String(m?.registroId || "").trim(),
        nome: normalizarTextoRegra(m?.nome || "")
    }));

    return (registros || []).filter(registro => {
        const idRegistro = String(registro?.id || "").trim();
        const nomeRegistro = normalizarTextoRegra(registro?.nome || "");

        return !magiasConhecidas.some(magia =>
            (magia.id && idRegistro && magia.id === idRegistro) ||
            (magia.nome && nomeRegistro && magia.nome === nomeRegistro)
        );
    });
}
function getEscolhasPoderClasseEstado() {
    return state.screen === "criacao"
        ? (state.criacao.poderClasseEscolhas || {})
        : (state.evolucao.poderClasseEscolhas || {});
}

function getEscolhaPoderClasseAbertaId() {
    return state.screen === "criacao"
        ? state.criacao.escolhaPoderClasseAbertaId
        : state.evolucao.escolhaPoderClasseAbertaId;
}

function setEscolhaPoderClasseAbertaId(id) {
    if (state.screen === "criacao") {
        state.criacao.escolhaPoderClasseAbertaId = id;
    } else {
        state.evolucao.escolhaPoderClasseAbertaId = id;
    }
}

function getEscolhaPoderClasseValores(escolhaId) {
    const mapa = getEscolhasPoderClasseEstado();
    return mapa?.[escolhaId] || [];
}

function toggleEscolhaPoderClasseValor(escolhaId, opcao, quantidadeMaxima) {
    const mapa = getEscolhasPoderClasseEstado();

    if (!mapa[escolhaId]) {
        mapa[escolhaId] = [];
    }

    const lista = mapa[escolhaId];
    const idx = lista.findIndex(item => item.id === opcao.id);

    if (idx >= 0) {
        lista.splice(idx, 1);
    } else {
        if (opcao.ehAumentoAtributo) {
            const ficha = getFichaCriacao();
            const atributo = opcao.atributoEscolhido || opcao.valor;

            if (!podeEscolherAumentoDeAtributo(ficha, atributo)) return;
        }

        if (lista.length >= quantidadeMaxima) return;
        lista.push(opcao);
    }

    render();
}
function renderEscolhaPoderClasseModal() {
    const escolhaId = getEscolhaPoderClasseAbertaId();
    if (!escolhaId) return "";

    const ficha = state.screen === "criacao" ? getFichaCriacao() : getFichaEvolucaoAtual();
    const classe = state.screen === "criacao"
        ? (getClasseEvolucaoAtualCriacao() || getClasseSelecionadaCriacao())
        : getClasseEvolucaoAtualFicha?.();

    if (!classe) return "";

    const poder = (classe.poderes || []).find(p =>
        (p.escolhas || []).some(e => String(e.id) === String(escolhaId))
    );

    const escolha = (poder?.escolhas || []).find(e => String(e.id) === String(escolhaId));
    if (!escolha) return "";

    const opcoes = getOpcoesEscolha(escolha, ficha);
    const selecionados = getEscolhaPoderClasseValores(escolha.id);

    return `
      <div class="overlay" onclick="setEscolhaPoderClasseAbertaId(null); render();">
        <div class="overlay-card" onclick="event.stopPropagation()">
          <div class="overlay-header">
            <div>
              <div class="overlay-title">${escapeHtml(escolha.titulo || "Escolha")}</div>
              <div class="overlay-subtitle">${escapeHtml(escolha.descricao || "")}</div>
            </div>
            <button class="btn ghost" onclick="setEscolhaPoderClasseAbertaId(null); render();">Fechar</button>
          </div>

          <div class="overlay-body">
            <div class="list">
              ${opcoes.map(opcao => {
        const marcado = selecionados.some(s => s.id === opcao.id);

        return `
                  <label class="list-item" style="cursor:pointer;">
                    <div style="display:flex; align-items:flex-start; gap:10px; flex:1;">
                      <input
                        type="${Number(escolha.quantidade) === 1 ? "radio" : "checkbox"}"
                        name="escolha-poder-${escapeAttr(escolha.id)}"
                        ${marcado ? "checked" : ""}
                        onchange="toggleEscolhaPoderClasseValor('${escolha.id}', ${JSON.stringify(opcao).replace(/"/g, '&quot;')}, ${Number(escolha.quantidade) || 1})"
                      >
                      <div>
                        <div class="list-item-title">${escapeHtml(opcao.label || opcao.nomeCurto || opcao.valor || "")}</div>
                        ${opcao.descricao ? `<div class="list-item-sub">${escapeHtml(opcao.descricao)}</div>` : ``}
                      </div>
                    </div>
                  </label>
                `;
    }).join("")}
            </div>
          </div>
        </div>
      </div>
    `;
}
function getPoderesConcedidosDaDivindade(ficha) {
    const nomesDoBanco = ficha?.divindadeDados?.poderes || [];

    if (Array.isArray(nomesDoBanco) && nomesDoBanco.length) {
        return nomesDoBanco
            .map(nome => getRegistroPoderPorNome(nome) || {
                id: "",
                nome,
                descricao: "",
                preRequisitos: "",
                custoPm: 0,
                tipoRegistro: "poder"
            })
            .sort((a, b) => String(a.nome || "").localeCompare(String(b.nome || ""), "pt-BR"));
    }

    const filtroDevocao = getFiltroDevocaoDaFicha(ficha);
    if (!filtroDevocao) return [];

    return (buscarPoderesPorFiltro("poder_concedido") || [])
        .filter(r => registroTemFiltro(r, filtroDevocao))
        .sort((a, b) => String(a.nome || "").localeCompare(String(b.nome || ""), "pt-BR"));
}

function montarContextoPreRequisitos(ficha) {
    return {
        ficha,
        atributos: getMapaAtributosPreReq(ficha),
        niveisClasse: getNiveisDeClasseNoContexto(ficha),
        periciasTreinadas: getNomesPericiasTreinadasNoContexto(ficha),
        habilidades: getNomesHabilidadesNoContexto(ficha),
        poderesTormenta: getTotalPoderesTormentaParaPreRequisito(ficha),
        circuloMaximo: getCirculoMaximoNoContexto(ficha),
        nivelPersonagem: getNivelTotalFicha(ficha) || 1,
        proficiencias: new Set((ficha?.proficiencias || []).map(p => normalizarTextoRegra(p))),
        podeLancarMagias: personagemPodeLancarMagiasNoContexto(ficha),
    };
}

function getAliasAtributoPreReq() {
    return {
        "for": "forca",
        "forca": "forca",
        "des": "destreza",
        "destreza": "destreza",
        "con": "constituicao",
        "constituicao": "constituicao",
        "int": "inteligencia",
        "inteligencia": "inteligencia",
        "sab": "sabedoria",
        "sabedoria": "sabedoria",
        "car": "carisma",
        "carisma": "carisma"
    };
}

function getAliasClassePreReq() {
    return {
        "barbaro": "barbaro",
        "bárbaro": "barbaro",
        "arcanista": "arcanista",
        "bardo": "bardo",
        "bucaneiro": "bucaneiro",
        "cacador": "cacador",
        "caçador": "cacador",
        "cavaleiro": "cavaleiro",
        "clerigo": "clerigo",
        "clérigo": "clerigo",
        "druida": "druida",
        "guerreiro": "guerreiro",
        "inventor": "inventor",
        "ladino": "ladino",
        "lutador": "lutador",
        "nobre": "nobre",
        "paladino": "paladino"
    };
}

function getAliasProficienciaPreReq() {
    return {
        "armas marciais": "armas marciais",
        "armas simples": "armas simples",
        "armas de fogo": "armas de fogo",
        "escudos": "escudos",
        "armaduras pesadas": "armaduras pesadas",
        "armaduras leves": "armaduras leves"
    };
}

function personagemPodeLancarMagiasNoContexto(ficha) {
    const classes = ficha?.classesPersonagem || [];

    for (const cp of classes) {
        const classe = getClasseDoBanco(cp.classeId);
        if (classe?.usaMagia) return true;
    }

    const habilidades = [
        ...(ficha?.habilidades || []),
        ...Object.values(state.criacao?.classeEscolhas || {}).flat(),
        ...Object.values(state.criacao?.racaEscolhas || {}).flat()
    ];

    return habilidades.some(h => {
        const nome = normalizarTextoRegra(h?.nome || h?.valor || "");
        return nome === "magias" || nome.startsWith("magias (");
    });
}

function getCirculoMaximoNoContexto(ficha) {
    const habilidades = [
        ...(ficha?.habilidades || []),
        ...Object.values(state.criacao?.classeEscolhas || {}).flat(),
        ...Object.values(state.criacao?.racaEscolhas || {}).flat()
    ];

    // adicionar também habilidades automáticas da classe no nível atual da criação
    const classeCriacao = getClasseEvolucaoAtualCriacao?.() || getClasseSelecionadaCriacao?.();
    const ctxCriacao = state.criacao?.classeEvolucaoContexto;

    if (classeCriacao && ctxCriacao?.nivelAlvo) {
        const habilidadesClasse = getHabilidadesClasseDisponiveisNoNivel(
            classeCriacao,
            Number(ctxCriacao.nivelAlvo) || 1
        );

        habilidades.push(...habilidadesClasse);
    }

    // adicionar também no contexto da evolução da ficha pronta
    const classeEvolucao = getClasseEvolucaoAtualFicha?.();
    const ctxEvolucao = state.evolucao?.classeEvolucaoContexto;

    if (classeEvolucao && ctxEvolucao?.nivelAlvo) {
        const habilidadesClasse = getHabilidadesClasseDisponiveisNoNivel(
            classeEvolucao,
            Number(ctxEvolucao.nivelAlvo) || 1
        );

        habilidades.push(...habilidadesClasse);
    }

    let max = 0;

    habilidades.forEach(h => {
        const nome = normalizarTextoRegra(h?.nome || h?.valor || "");
        const m = nome.match(/^magias \((\d+).*circulo\)$/);
        if (m) {
            max = Math.max(max, Number(m[1]) || 0);
        }
    });

    return max;
}

function extrairPartesPreRequisito(texto) {
    return String(texto || "")
        .split(/\s*,\s*/g)
        .map(s => s.trim())
        .filter(Boolean)
        .map(parte => {
            const opcoesOu = parte
                .split(/\s+ou\s+/i)
                .map(s => s.trim())
                .filter(Boolean);

            return opcoesOu.length > 1
                ? { tipo: "ou", opcoes: opcoesOu }
                : { tipo: "simples", valor: parte };
        });
}

function avaliarPartePreRequisito(parte, ctx) {
    const raw = String(parte || "").trim();
    const txt = normalizarTextoRegra(raw);
    if (!txt) return null;

    const aliasAttr = getAliasAtributoPreReq();
    const aliasClasse = getAliasClassePreReq();

    // atributo: "Des 2", "Destreza 3"
    let m = txt.match(/\b(for|forca|des|destreza|con|constituicao|int|inteligencia|sab|sabedoria|car|carisma)\s+(-?\d+)\b/);
    if (m) {
        const chave = aliasAttr[m[1]];
        const minimo = Number(m[2]) || 0;
        const atual = Number(ctx.atributos?.[chave]) || 0;
        if (atual >= minimo) return null;

        const nomes = {
            forca: "Força",
            destreza: "Destreza",
            constituicao: "Constituição",
            inteligencia: "Inteligência",
            sabedoria: "Sabedoria",
            carisma: "Carisma"
        };

        return `${nomes[chave]} ${minimo}`;
    }

    // classe: "Bárbaro 3"
    m = txt.match(/\b(barbaro|bárbaro|arcanista|bardo|bucaneiro|cacador|caçador|cavaleiro|clerigo|clérigo|druida|guerreiro|inventor|ladino|lutador|nobre|paladino)\s+(\d+)\b/);
    if (m) {
        const classeId = aliasClasse[m[1]];
        const minimo = Number(m[2]) || 0;
        const atual = Number(ctx.niveisClasse?.[classeId]) || 0;
        if (atual >= minimo) return null;

        const nomeFmt = raw.replace(/\s+/g, " ").trim();
        return nomeFmt;
    }

    // círculo: "2º círculo", "3 circulo"
    m = txt.match(/\b(\d+)\s*(?:o|º)?\s*circulo\b/);
    if (m) {
        const minimo = Number(m[1]) || 0;
        const atual = Number(ctx.circuloMaximo) || 0;
        if (atual >= minimo) return null;
        return `${minimo}º círculo`;
    }

    // poderes da tormenta: "quatro outros poderes da tormenta", "1 poder da tormenta"
    const regraTormenta = analisarPreRequisitoPoderTormentaLivre(raw);
    if (regraTormenta) {
        const totalAtual = Number(ctx.poderesTormenta) || 0;

        if (totalAtual >= regraTormenta.minimo) return null;
        return raw;
    }

    // perícia: "treinado em Fortitude", "Fortitude"
    m = txt.match(/(?:treinado em|treinado na|pericia|perícia)\s+(.+)/);
    if (m) {
        const nomeReq = normalizarTextoRegra(m[1]);

        const tem = [...ctx.periciasTreinadas].some(p => {
            const nomeAtual = normalizarTextoRegra(p);
            return nomeAtual === nomeReq || nomeAtual.startsWith(nomeReq + " (");
        });

        if (tem) return null;
        return raw;
    }

    // nível de personagem: "6º nível de personagem"
    m = txt.match(/\b(\d+)\s*(?:o|º)?\s*nivel de personagem\b/);
    if (m) {
        const minimo = Number(m[1]) || 0;
        const atual = Number(ctx.nivelPersonagem) || 0;
        if (atual >= minimo) return null;
        return `${minimo}º nível de personagem`;
    }

    // proficiência
    const aliasProf = getAliasProficienciaPreReq();
    const profNormalizada = normalizarTextoRegra(raw);
    if (aliasProf[profNormalizada]) {
        const chave = aliasProf[profNormalizada];
        if (ctx.proficiencias?.has(chave)) return null;
        return raw;
    }

    m = txt.match(/^proficiencia com (.+)$/);
    if (m) {
        const chave = normalizarTextoRegra(m[1]);
        if (ctx.proficiencias?.has(chave)) return null;
        return raw;
    }

    // lançar magias / habilidade magias
    if (txt === "lancar magias" || txt === "lançar magias" || txt === "habilidade magias" || txt === "magias") {
        if (ctx.podeLancarMagias) return null;
        return "lançar magias";
    }

    // poder/habilidade específica: "Dentes Afiados", "Anatomia Insana", etc.
    const nomeLivre = normalizarNomePreRequisitoLivre(raw);

    const temHabilidade = [...ctx.habilidades].some(h => h === nomeLivre);
    if (temHabilidade) return null;

    const nomesConhecidos = getNomesConhecidosDePoderesEHabilidades();
    if (nomesConhecidos.has(nomeLivre)) {
        return raw;
    }

    return null;
}

function getPendenciasPreRequisito(opcao, ficha) {
    const ctx = montarContextoPreRequisitos(ficha);
    const pendencias = [];

    if ((Number(opcao?.circulo) || 0) > 0 && ctx.circuloMaximo < Number(opcao.circulo)) {
        pendencias.push(`${Number(opcao.circulo)}º círculo`);
    }

    const texto = String(opcao?.preRequisitos || "").trim();
    if (!texto) return pendencias;

    const partes = extrairPartesPreRequisito(texto);

    partes.forEach(parte => {
        if (parte.tipo === "simples") {
            const falta = avaliarPartePreRequisito(parte.valor, ctx);
            if (falta) pendencias.push(falta);
            return;
        }

        if (parte.tipo === "ou") {
            const algumaAtende = parte.opcoes.some(op => !avaliarPartePreRequisito(op, ctx));
            if (!algumaAtende) {
                pendencias.push(parte.opcoes.join(" ou "));
            }
        }
    });

    return pendencias;
}

function getPreRequisitoNaoAtendidoOpcao(opcao, ficha) {
    return getPendenciasPreRequisito(opcao, ficha).join(", ");
}

function podeSelecionarOpcaoClasse(escolha, opcao) {
    const selecionados = getEscolhaClasseValores(escolha.id);
    const quantidade = Number(escolha.quantidade) || 0;

    if (selecionados.some(item => item.id === opcao.id)) return true;
    if (!escolhaClasseDesbloqueada(escolha)) return false;
    if (selecionados.length >= quantidade) return false;

    if (opcaoPericiaIndisponivelPorTreinoGlobal(opcao, escolha.id, "classe")) return false;

    const ficha = getFichaCriacao();
    if (getPreRequisitoNaoAtendidoOpcao(opcao, ficha)) return false;

    if (opcao.tipoAplicacao === "habilidade_adicionar" && !opcao.ehAumentoAtributo) {
        const ficha = getFichaCriacao();
        const nomeOpcao = opcao.valor || "";

        const jaTemNaoRacial = fichaTemHabilidadeNaoRacial(ficha, nomeOpcao);

        const jaEscolhidaEmOutraEscolha = Object.entries(state.criacao.classeEscolhas || {}).some(([outraEscolhaId, lista]) => {
            if (outraEscolhaId === escolha.id) return false;
            return (lista || []).some(item =>
                item.tipoAplicacao === "habilidade_adicionar" &&
                !item.ehAumentoAtributo &&
                normalizarNomeHabilidade(item.valor) === normalizarNomeHabilidade(nomeOpcao)
            );
        });

        if (jaTemNaoRacial || jaEscolhidaEmOutraEscolha) {
            return false;
        }
    }

    if (opcao.ehAumentoAtributo) {
        const ficha = getFichaCriacao();
        const atributo = opcao.atributoEscolhido || opcao.valor;

        if (!podeEscolherAumentoDeAtributo(ficha, atributo)) {
            return false;
        }
    }

    return true;
}
function podeSelecionarOpcaoClasseEvolucao(escolha, opcao) {
    const selecionados = getEscolhaClasseValoresEvolucao(escolha.id);
    const quantidade = Number(escolha.quantidade) || 0;

    if (selecionados.some(item => item.id === opcao.id)) return true;
    if (!escolhaClasseDesbloqueada(escolha)) return false;
    if (selecionados.length >= quantidade) return false;

    if (opcaoPericiaIndisponivelPorTreinoGlobal(opcao, escolha.id, "classe")) return false;

    const ficha = getFichaEvolucaoAtual();
    if (!ficha) return false;

    if (getPreRequisitoNaoAtendidoOpcao(opcao, ficha)) return false;

    if (opcao.tipoAplicacao === "habilidade_adicionar" && !opcao.ehAumentoAtributo) {
        const nomeOpcao = opcao.valor || "";
        const jaTem = (ficha.habilidades || []).some(h =>
            normalizarTextoRegra(h.nome) === normalizarTextoRegra(nomeOpcao)
        );

        if (jaTem) return false;
    }

    return true;
}
function podeSelecionarOpcaoRacial(escolha, opcao) {
    const selecionados = getEscolhaRacialValores(escolha.id);
    const quantidade = Number(escolha.quantidade) || 0;

    if (selecionados.some(item => item.id === opcao.id)) return true;
    if (!escolhaRacialDesbloqueada(escolha)) return false;
    if (selecionados.length >= quantidade) return false;

    if (opcaoPericiaIndisponivelPorTreinoGlobal(opcao, escolha.id, "raca")) return false;

    const regras = parseRegrasGrupo(escolha.regrasGrupo);
    const categoria = getCategoriaOpcao(opcao);
    const contagem = contarSelecionadasPorCategoria(selecionados);

    const chaveMax = `max_${categoria}`;
    if (regras[chaveMax] != null && (contagem[categoria] || 0) >= regras[chaveMax]) {
        return false;
    }

    // Magias concedidas por raça ignoram pré-requisitos do próprio registro
    // (como "1º círculo" ou "Habilidade Magias").
    if (escolha.tipo === "magia" && opcao?.tipoAplicacao === "magia_adicionar") {
        return true;
    }

    const ficha = getFichaCriacao();
    if (getPreRequisitoNaoAtendidoOpcao(opcao, ficha)) return false;

    return true;
}

function getCategoriaOpcao(opcao) {
    if (!opcao) return "";

    if (opcao.id.startsWith("pericia:")) return "pericia";
    if (opcao.id.startsWith("poder:")) return "poder";
    if (opcao.id.startsWith("magia:")) return "magia";
    if (opcao.id.startsWith("proficiencia:")) return "proficiencia";
    if (opcao.id.startsWith("habilidade:")) return "habilidade";

    return "";
}

function contarSelecionadasPorCategoria(selecionados) {
    const contagem = {};

    (selecionados || []).forEach(opcao => {
        const categoria = getCategoriaOpcao(opcao);
        contagem[categoria] = (contagem[categoria] || 0) + 1;
    });

    return contagem;
}

function podeSelecionarOpcaoGrupo(escolha, opcao) {
    const selecionados = getEscolhaRacialValores(escolha.id);
    const quantidade = Number(escolha.quantidade) || 0;

    if (selecionados.some(item => item.id === opcao.id)) {
        return true;
    }

    if (selecionados.length >= quantidade) {
        return false;
    }

    const regras = parseRegrasGrupo(escolha.regrasGrupo);
    const categoria = getCategoriaOpcao(opcao);
    const contagem = contarSelecionadasPorCategoria(selecionados);

    const chaveMax = `max_${categoria}`;
    if (regras[chaveMax] != null && (contagem[categoria] || 0) >= regras[chaveMax]) {
        return false;
    }

    return true;
}

function toggleListaRacasCriacao() {
  state.criacao.listaRacasAberta = !state.criacao.listaRacasAberta;
  render();
}

function selecionarRacaCriacao(id) {
    const ficha = getFichaCriacao();

    if (ficha && state.criacao.racaSelecionadaId !== id) {
        limparPericiasInteligenciaDaFicha(ficha);
    }

    state.criacao.racaSelecionadaId = id;
    state.criacao.racaDistribuicao = [];
    state.criacao.racaEscolhas = {};
    state.criacao.periciasInteligenciaAberta = false;
    state.criacao.periciasInteligenciaSelecoes = [];
    state.criacao.periciasInteligenciaQuantidade = 0;
    state.criacao.periciasInteligenciaAposFechar = "";
    render();
}

function racaUsaDistribuicaoLivre(raca) {
    const tipo = String(raca?.tipoAtributo || "");
    return [
        "distribuivel3",
        "distribuivel3_sem_carisma",
        "distribuivel3_sem_constituicao"
    ].includes(tipo);
}

function getAtributosBloqueadosDistribuicaoRacial(raca) {
    const tipo = String(raca?.tipoAtributo || "");

    if (tipo === "distribuivel3_sem_carisma") return ["carisma"];
    if (tipo === "distribuivel3_sem_constituicao") return ["constituicao"];

    return [];
}

function atributoPermitidoNaDistribuicaoRacial(raca, attr) {
    return !getAtributosBloqueadosDistribuicaoRacial(raca).includes(attr);
}

function toggleAtributoDistribuicaoRacial(attr) {
    const raca = getRacaSelecionadaCriacao();
    if (!raca || !racaUsaDistribuicaoLivre(raca)) return;
    if (!atributoPermitidoNaDistribuicaoRacial(raca, attr)) return;

    const lista = state.criacao.racaDistribuicao;
    const idx = lista.indexOf(attr);

    if (idx >= 0) {
        lista.splice(idx, 1);
    } else {
        if (lista.length >= 3) return;
        lista.push(attr);
    }

    render();
}

function updateRacaCustom(field, value) {
  state.criacao.racaCustom[field] = value;
  render();
}

function updateRacaCustomAtributo(attr, value) {
  state.criacao.racaCustom.atributos[attr] = Number(value) || 0;
  render();
}

function limparEfeitosRaciaisFicha(ficha) {
    const treinosNaoRaciais = new Set(
        (ficha.efeitosAplicados || [])
            .filter(e => e.origemTipo !== "Raça" && e.tipo === "pericia_treinada" && e.alvo)
            .map(e => normalizarTextoRegra(e.alvo))
    );

    ficha.modRacialAtributos = {
        forca: 0,
        destreza: 0,
        constituicao: 0,
        inteligencia: 0,
        sabedoria: 0,
        carisma: 0
    };

    ficha.habilidades = (ficha.habilidades || []).filter(h => h.origem !== "Raça");
    ficha.magias = (ficha.magias || []).filter(m => m.origem !== "Raça");
    ficha.efeitosAplicados = (ficha.efeitosAplicados || []).filter(e => e.origemTipo !== "Raça");

    ficha.pericias.forEach(p => {
        p.outrosRacial = 0;
        p.treinada = treinosNaoRaciais.has(normalizarTextoRegra(p.nome));
    });

    ficha.proficiencias = [];
}

function aplicarRacaNaFichaCriacao() {
    const ficha = getFichaCriacao();
    const raca = getRacaSelecionadaCriacao();
    if (!ficha || !raca) return false;

    limparEfeitosRaciaisFicha(ficha);

    ficha.raca = raca.nome || "";
    ficha.tamanho = raca.tamanho || "";
    ficha.deslocamento = raca.deslocamento || "";

    if (raca.tipoAtributo === "fixo" || raca.tipoAtributo === "custom") {
        ficha.modRacialAtributos = {
            forca: Number(raca.atributosFixos?.forca) || 0,
            destreza: Number(raca.atributosFixos?.destreza) || 0,
            constituicao: Number(raca.atributosFixos?.constituicao) || 0,
            inteligencia: Number(raca.atributosFixos?.inteligencia) || 0,
            sabedoria: Number(raca.atributosFixos?.sabedoria) || 0,
            carisma: Number(raca.atributosFixos?.carisma) || 0
        };
    }

    if (racaUsaDistribuicaoLivre(raca)) {
        if (state.criacao.racaDistribuicao.length !== 3) return false;

        const mods = {
            forca: 0,
            destreza: 0,
            constituicao: 0,
            inteligencia: 0,
            sabedoria: 0,
            carisma: 0
        };

        const atributosBloqueados = getAtributosBloqueadosDistribuicaoRacial(raca);
        if (state.criacao.racaDistribuicao.some(attr => atributosBloqueados.includes(attr))) {
            return false;
        }

        state.criacao.racaDistribuicao.forEach(attr => {
            mods[attr] += 1;
        });

        ficha.modRacialAtributos = mods;
    }

    (raca.habilidades || []).forEach(h => {
        adicionarHabilidadeNaFicha(ficha, h, "Raça", raca.nome);
    });

    (raca.efeitos || []).forEach(efeito => {
        if (efeito.tipo === "atributo_racial") return;
        aplicarEfeitoNaFicha(ficha, efeito, "Raça", raca.nome);
    });

    const escolhasOk = aplicarEscolhasRaciaisNaFicha(ficha, raca);
    if (!escolhasOk) return false;

    return true;
}
function racaCriacaoValida() {
    const raca = getRacaSelecionadaCriacao();
    if (!raca) return false;

    if (racaUsaDistribuicaoLivre(raca)) {
        if (state.criacao.racaDistribuicao.length !== 3) {
            return false;
        }

        const atributosBloqueados = getAtributosBloqueadosDistribuicaoRacial(raca);
        if (state.criacao.racaDistribuicao.some(attr => atributosBloqueados.includes(attr))) {
            return false;
        }
    }

    if (raca.tipoAtributo === "custom" && !(raca.nome && raca.deslocamento)) {
        return false;
    }

    if (!todasEscolhasRaciaisPreenchidas(raca)) {
        return false;
    }

    return true;
}

function getBonusRacialPorNivel(ficha, tipo) {
    if (!ficha?.efeitosAplicados) return 0;

    return ficha.efeitosAplicados
        .filter(e => e.origemTipo === "Raça" && e.tipo === tipo)
        .reduce((soma, e) => soma + (Number(e.valor) || 0), 0);
}

function traduzirTipoEfeito(tipo) {
    const mapa = {
        atributo_racial: "Atributo racial",
        pericia_bonus: "Bônus em perícia",
        pericia_treinada: "Treinado em",
        habilidade_adicionar: "Concede habilidade",
        magia_adicionar: "Concede magia",
        magia_escolher: "Escolha de magia",
        proficiencia_adicionar: "Concede proficiência",
        deslocamento_bonus: "Bônus de deslocamento",
        deslocamento_definir: "Deslocamento",
        pv_bonus_nivel1: "PV no nível 1",
        pv_bonus_por_nivel: "PV por nível",
        pm_bonus_nivel1: "PM no nível 1",
        pm_bonus_por_nivel: "PM por nível",
        ataque_bonus: "Bônus de ataque",
        dano_bonus: "Bônus de dano",
        ataque_adicionar: "Concede ataque",
        defesa_bonus: "Bônus de Defesa",
        tamanho_definir: "Tamanho",
        poder_tormenta_adicionar: "Poder da Tormenta",
        descricao_apenas: "Descrição"
    };

    return mapa[tipo] || tipo;
}

function efeitoDeveAparecerNaPrevia(tipoOrigem, efeito) {
    if (!efeito?.tipo) return false;

    // Raça: atributos já aparecem em "Atributos raciais"
    if (tipoOrigem === "raca") {
        if (efeito.tipo === "atributo_racial") return false;
    }

    // Classe: PV/PM já aparecem na prévia da classe
    if (tipoOrigem === "classe") {
        if (efeito.tipo === "pv_bonus_nivel1") return false;
        if (efeito.tipo === "pv_bonus_por_nivel") return false;
        if (efeito.tipo === "pm_bonus_nivel1") return false;
        if (efeito.tipo === "pm_bonus_por_nivel") return false;
    }

    return true;
}

function descreverEfeitoParaJogador(e) {
    const tipoTraduzido = traduzirTipoEfeito(e.tipo || "");

    switch (e.tipo) {
        case "atributo_racial":
            return `${tipoTraduzido}: ${e.alvo} ${e.valor >= 0 ? "+" : ""}${e.valor}`;

        case "pericia_bonus":
            return `${tipoTraduzido}: ${e.alvo} ${e.valor >= 0 ? "+" : ""}${e.valor}`;

        case "pericia_treinada":
            return `${tipoTraduzido}: ${e.alvo}`;

        case "habilidade_adicionar":
            return `${tipoTraduzido}: ${e.nomeAdicionado || e.alvo || ""}`;

        case "magia_adicionar":
            return `${tipoTraduzido}: ${e.nomeAdicionado || e.alvo || ""}`;

        case "proficiencia_adicionar":
            return `${tipoTraduzido}: ${e.alvo || e.nomeAdicionado || ""}`;

        case "deslocamento_bonus":
            return `${tipoTraduzido}: +${e.valor}m`;

        case "deslocamento_definir":
            return `${tipoTraduzido}: ${e.valorTexto || ""}`;

        case "pv_bonus_nivel1":
        case "pv_bonus_por_nivel":
        case "pm_bonus_nivel1":
        case "pm_bonus_por_nivel":
        case "ataque_bonus":
        case "dano_bonus":
        case "defesa_bonus":
        case "poder_tormenta_adicionar":
            return `${tipoTraduzido}: ${e.valor >= 0 ? "+" : ""}${e.valor}`;

        case "ataque_adicionar":
            return `${tipoTraduzido}: ${e.nomeAdicionado || "Ataque"}`;

        case "tamanho_definir":
            return `${tipoTraduzido}: ${e.valorTexto || ""}`;

        case "descricao_apenas":
            return e.descricao || "Descrição adicional";

        default:
            return `${tipoTraduzido}`;
    }
}

async function iniciarCriacaoFicha() {
    await carregarTodosOsBancos();

    const ficha = fichaVazia();

    state.criacao = {
        etapa: 0,
        ficha,
        listaRacasAberta: false,
        racaSelecionadaId: null,
        racaDistribuicao: [],
        racaEscolhas: {},
        escolhaAbertaId: null,

        listaClassesAberta: false,
        classeSelecionadaId: null,
        classeEscolhas: {},
        escolhaClasseAbertaId: null,
        origemSelecionadaId: null,
        origemEscolhas: {},
        escolhaOrigemAbertaId: null,
        divindadeSelecionadaId: null,
        divindadePoderSelecionadoNome: "",
        periciasInteligenciaAberta: false,
        periciasInteligenciaSelecoes: [],
        periciasInteligenciaQuantidade: 0,
        periciasInteligenciaAposFechar: "",

        fluxoClasseAtivo: false,
        classeEvolucaoContexto: null,
        classeSelecaoEvolucaoId: "",

        racaCustom: {
            nome: "Custom",
            tamanho: "",
            deslocamento: "",
            atributos: {
                forca: 0,
                destreza: 0,
                constituicao: 0,
                inteligencia: 0,
                sabedoria: 0,
                carisma: 0
            },
            habilidadesTexto: ""
        }
    };

    state.screen = "criacao";
    render();
}

function getFichaCriacao() {
  return state.criacao?.ficha || null;
}

function updateFichaCriacao(field, value) {
  const ficha = getFichaCriacao();
  if (!ficha) return;

  ficha[field] = value;
}
function garantirControlePericiasInteligencia(ficha) {
    if (!ficha) return {
        totalConcedido: 0,
        selecionadas: []
    };

    if (!ficha.controlePericiasInteligencia || typeof ficha.controlePericiasInteligencia !== "object") {
        ficha.controlePericiasInteligencia = {
            totalConcedido: 0,
            selecionadas: []
        };
    }

    if (!Array.isArray(ficha.controlePericiasInteligencia.selecionadas)) {
        ficha.controlePericiasInteligencia.selecionadas = [];
    }

    ficha.controlePericiasInteligencia.totalConcedido =
        Number(ficha.controlePericiasInteligencia.totalConcedido) || 0;

    if (ficha.controlePericiasInteligencia.selecionadas.length > ficha.controlePericiasInteligencia.totalConcedido) {
        ficha.controlePericiasInteligencia.totalConcedido =
            ficha.controlePericiasInteligencia.selecionadas.length;
    }

    return ficha.controlePericiasInteligencia;
}

function limparPericiasInteligenciaDaFicha(ficha) {
    if (!ficha) return;

    const controle = garantirControlePericiasInteligencia(ficha);
    const selecionadas = new Set(
        (controle.selecionadas || []).map(nome => normalizarTextoRegra(nome))
    );

    ficha.pericias.forEach(pericia => {
        if (selecionadas.has(normalizarTextoRegra(pericia.nome))) {
            pericia.treinada = false;
        }
    });

    ficha.efeitosAplicados = (ficha.efeitosAplicados || []).filter(e => e.origemTipo !== "Inteligência");

    controle.selecionadas = [];
    controle.totalConcedido = 0;
}

function getTotalPericiasInteligenciaDevidoNaCriacao(ficha) {
    if (!ficha) return 0;
    return Math.max(0, Number(getAtributoFinalCriacaoPreview(ficha, "inteligencia")) || 0);
}

function getTotalPericiasInteligenciaConcedidas(ficha) {
    const controle = garantirControlePericiasInteligencia(ficha);
    return Number(controle.totalConcedido) || 0;
}

function getPericiasDisponiveisParaInteligencia(ficha) {
    return (ficha?.pericias || [])
        .filter(pericia => !pericia.treinada)
        .sort((a, b) => String(a.nome || "").localeCompare(String(b.nome || ""), "pt-BR"));
}
function criacaoJaPassouDaOrigem() {
    return Number(state.criacao?.etapa) >= 5;
}
function prepararModalPericiasInteligenciaCriacao(ficha, aposFechar = "") {
    if (!ficha) return false;

    const totalDevido = getTotalPericiasInteligenciaDevidoNaCriacao(ficha);
    const totalConcedido = getTotalPericiasInteligenciaConcedidas(ficha);
    const faltam = Math.max(0, totalDevido - totalConcedido);

    state.criacao.periciasInteligenciaAposFechar = aposFechar || "";

    if (faltam <= 0) {
        state.criacao.periciasInteligenciaAberta = false;
        state.criacao.periciasInteligenciaSelecoes = [];
        state.criacao.periciasInteligenciaQuantidade = 0;
        return false;
    }

    const disponiveis = getPericiasDisponiveisParaInteligencia(ficha);
    if (!disponiveis.length) {
        state.criacao.periciasInteligenciaAberta = false;
        state.criacao.periciasInteligenciaSelecoes = [];
        state.criacao.periciasInteligenciaQuantidade = 0;
        return false;
    }

    state.criacao.periciasInteligenciaAberta = true;
    state.criacao.periciasInteligenciaSelecoes = [];
    state.criacao.periciasInteligenciaQuantidade = Math.min(faltam, disponiveis.length);

    return true;
}

function togglePericiaInteligenciaCriacao(nomePericia) {
    const ficha = getFichaCriacao();
    if (!ficha) return;

    const quantidade = Number(state.criacao.periciasInteligenciaQuantidade) || 0;
    if (quantidade <= 0) return;

    if (!Array.isArray(state.criacao.periciasInteligenciaSelecoes)) {
        state.criacao.periciasInteligenciaSelecoes = [];
    }

    const lista = state.criacao.periciasInteligenciaSelecoes;
    const idx = lista.findIndex(nome => normalizarTextoRegra(nome) === normalizarTextoRegra(nomePericia));

    if (idx >= 0) {
        lista.splice(idx, 1);
    } else {
        if (lista.length >= quantidade) return;
        lista.push(nomePericia);
    }

    renderMantendoScrollEscolha();
}

function finalizarConclusaoNivelClasseCriacao() {
    const continuar = confirm("Subir mais níveis?");
    if (continuar) {
        abrirSelecaoProximoNivelClasse();
        return;
    }

    state.criacao.fluxoClasseAtivo = false;
    state.criacao.classeEvolucaoContexto = null;
    state.criacao.classeEscolhas = {};
    state.criacao.escolhaClasseAbertaId = null;

    if (Number(state.criacao.etapa) < 4) {
        state.criacao.etapa = 4;
    }

    render();
}

function confirmarPericiasInteligenciaCriacao() {
    const ficha = getFichaCriacao();
    if (!ficha) return;

    const quantidade = Number(state.criacao.periciasInteligenciaQuantidade) || 0;
    const selecionadas = state.criacao.periciasInteligenciaSelecoes || [];

    if (selecionadas.length !== quantidade) return;

    const controle = garantirControlePericiasInteligencia(ficha);

    selecionadas.forEach(nomePericia => {
        const pericia = (ficha.pericias || []).find(p =>
            normalizarTextoRegra(p.nome) === normalizarTextoRegra(nomePericia)
        );

        if (!pericia) return;

        pericia.treinada = true;

        if (!(controle.selecionadas || []).some(nome => normalizarTextoRegra(nome) === normalizarTextoRegra(nomePericia))) {
            controle.selecionadas.push(pericia.nome);
        }

        ficha.efeitosAplicados = ficha.efeitosAplicados || [];
        ficha.efeitosAplicados.push({
            id: uid(),
            origemTipo: "Inteligência",
            origemNome: "Inteligência",
            tipo: "pericia_treinada",
            alvo: pericia.nome
        });
    });

    controle.totalConcedido = controle.selecionadas.length;

    const acao = state.criacao.periciasInteligenciaAposFechar || "";

    state.criacao.periciasInteligenciaAberta = false;
    state.criacao.periciasInteligenciaSelecoes = [];
    state.criacao.periciasInteligenciaQuantidade = 0;
    state.criacao.periciasInteligenciaAposFechar = "";
    document.body.classList.remove("modal-open");

    if (acao === "classe_concluida") {
        finalizarConclusaoNivelClasseCriacao();
        return;
    }

    render();
}

function fecharModalPericiasInteligenciaCriacao() {
    state.criacao.periciasInteligenciaAberta = false;
    state.criacao.periciasInteligenciaSelecoes = [];
    state.criacao.periciasInteligenciaQuantidade = 0;
    state.criacao.periciasInteligenciaAposFechar = "";
    document.body.classList.remove("modal-open");
    render();
}

function renderModalPericiasInteligenciaCriacao() {
    const ficha = getFichaCriacao();
    if (!ficha || !state.criacao.periciasInteligenciaAberta) return "";

    const quantidade = Number(state.criacao.periciasInteligenciaQuantidade) || 0;
    const selecionadas = state.criacao.periciasInteligenciaSelecoes || [];
    const pericias = getPericiasDisponiveisParaInteligencia(ficha);

    if (quantidade <= 0 || !pericias.length) return "";

    document.body.classList.add("modal-open");

    return `
      <div class="overlay">
  <div class="overlay-card" onclick="event.stopPropagation()">
    <div class="overlay-header">
      <div>
        <div class="overlay-title">Perícias por Inteligência</div>
        <div class="overlay-subtitle">
          Escolha ${quantidade} ${quantidade === 1 ? "perícia treinada" : "perícias treinadas"} pela sua Inteligência.
          • Selecionados: ${selecionadas.length} / ${quantidade}
        </div>
      </div>

      <div class="actions" style="justify-content:flex-end; align-items:center;">
        <button
          class="btn primary"
          onclick="confirmarPericiasInteligenciaCriacao()"
          ${selecionadas.length !== quantidade ? "disabled" : ""}
        >
          Confirmar
        </button>
      </div>
    </div>

          <div class="overlay-body">
            <div class="list">
              ${pericias.map(pericia => {
        const checked = selecionadas.some(nome =>
            normalizarTextoRegra(nome) === normalizarTextoRegra(pericia.nome)
        );
        const disabled = !checked && selecionadas.length >= quantidade;

        return `
                    <div class="list-item" style="align-items:flex-start; gap:12px; ${disabled ? "opacity:.65;" : ""}">
                      <div class="choice-main">
                        <div class="list-item-title">${escapeHtml(pericia.nome)}</div>
                        <div class="list-item-sub">Atributo: ${escapeHtml(pericia.atributo || "")}</div>
                      </div>

                      <input
                        class="choice-checkbox"
                        type="checkbox"
                        ${checked ? "checked" : ""}
                        ${disabled ? "disabled" : ""}
                        onclick="event.stopPropagation()"
                        onchange="togglePericiaInteligenciaCriacao('${escapeAttr(pericia.nome)}')"
                      >
                    </div>
                  `;
    }).join("")}
            </div>
          </div>
        </div>
      </div>
    `;
}
function proximaEtapaCriacao() {
    let abrirModalInteligencia = false;

    if (state.criacao.etapa === 2) {
        if (!racaCriacaoValida()) return;
        const ok = aplicarRacaNaFichaCriacao();
        if (!ok) return;
    }

    if (state.criacao.etapa === 4) {
        if (!origemCriacaoValida()) return;
        const ok = aplicarOrigemNaFichaCriacao();
        if (!ok) return;

        abrirModalInteligencia = prepararModalPericiasInteligenciaCriacao(getFichaCriacao());
    }

    if (state.criacao.etapa === 5) {
        if (!divindadeCriacaoValida()) return;
        const ok = aplicarDivindadeNaFichaCriacao();
        if (!ok) return;
    }

    if (state.criacao.etapa < ETAPAS_CRIACAO.length - 1) {
        let proxima = state.criacao.etapa + 1;

        if (proxima === 5 && criacaoDevePularEtapaDivindade()) {
            proxima = 6;
        }

        state.criacao.etapa = proxima;
        render();
        return;
    }

    if (abrirModalInteligencia) {
        render();
    }
}

function voltarEtapaCriacao() {
    if (state.criacao.etapa <= 0) return;

    let anterior = state.criacao.etapa - 1;

    if (state.criacao.etapa === 6 && criacaoDevePularEtapaDivindade()) {
        anterior = 4;
    }

    state.criacao.etapa = Math.max(0, anterior);
    render();
}

function concluirCriacaoFicha() {
    const ficha = getFichaCriacao();
    if (!ficha) return;

    atualizarNivelTotalFicha(ficha);
    reaplicarProgressaoClasses(ficha);

    state.fichas.unshift(ficha);
    state.fichaAtualId = ficha.id;
    recalcularEquipamentosEFicha(ficha);
    saveFichas();

    state.criacao = {
        etapa: 0,
        ficha: null,
        listaRacasAberta: false,
        racaSelecionadaId: null,
        racaDistribuicao: [],
        racaEscolhas: {},
        escolhaAbertaId: null,

        listaClassesAberta: false,
        classeSelecionadaId: null,
        classeEscolhas: {},
        escolhaClasseAbertaId: null,
        origemSelecionadaId: null,
        origemEscolhas: {},
        escolhaOrigemAbertaId: null,
        divindadeSelecionadaId: null,
        divindadePoderSelecionadoNome: "",
        periciasInteligenciaAberta: false,
        periciasInteligenciaSelecoes: [],
        periciasInteligenciaQuantidade: 0,
        periciasInteligenciaAposFechar: "",

        fluxoClasseAtivo: false,
        classeEvolucaoContexto: null,
        classeSelecaoEvolucaoId: "",

        racaCustom: {
            nome: "Custom",
            tamanho: "",
            deslocamento: "",
            atributos: {
                forca: 0,
                destreza: 0,
                constituicao: 0,
                inteligencia: 0,
                sabedoria: 0,
                carisma: 0
            },
            habilidadesTexto: ""
        }
    };

    state.screen = "ficha";
    render();
}

function loadFichas() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function saveFichas() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.fichas));
}
function exportarFichasJson() {
    try {
        const payload = {
            versao: 1,
            exportadoEm: new Date().toISOString(),
            fichas: Array.isArray(state.fichas) ? state.fichas : []
        };

        const json = JSON.stringify(payload, null, 2);
        const blob = new Blob([json], { type: "application/json;charset=utf-8" });
        const url = URL.createObjectURL(blob);

        const data = new Date();
        const yyyy = data.getFullYear();
        const mm = String(data.getMonth() + 1).padStart(2, "0");
        const dd = String(data.getDate()).padStart(2, "0");
        const hh = String(data.getHours()).padStart(2, "0");
        const mi = String(data.getMinutes()).padStart(2, "0");

        const a = document.createElement("a");
        a.href = url;
        a.download = `tormenta20-fichas-${yyyy}-${mm}-${dd}-${hh}${mi}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        URL.revokeObjectURL(url);
    } catch (err) {
        console.error(err);
        alert("Não foi possível exportar as fichas.");
    }
}

function abrirSeletorImportacaoFichas() {
    const input = document.getElementById("inputImportarFichas");
    if (!input) return;
    input.click();
}

function importarFichasJson(arquivo) {
    if (!arquivo) return;

    const reader = new FileReader();

    reader.onload = function (e) {
        try {
            const bruto = e?.target?.result;
            const dados = JSON.parse(bruto);

            const fichasImportadas = Array.isArray(dados)
                ? dados
                : Array.isArray(dados?.fichas)
                    ? dados.fichas
                    : null;

            if (!Array.isArray(fichasImportadas)) {
                alert("Arquivo inválido. Selecione um JSON de fichas exportado pelo sistema.");
                return;
            }

            const substituir = confirm(
                "Deseja substituir as fichas atuais pelas fichas do arquivo?\n\n" +
                "OK = substituir tudo\n" +
                "Cancelar = mesclar com as fichas atuais"
            );

            if (substituir) {
                state.fichas = fichasImportadas;
            } else {
                const atuais = Array.isArray(state.fichas) ? state.fichas : [];
                const mapa = new Map();

                atuais.forEach(f => {
                    if (f?.id) mapa.set(f.id, f);
                });

                fichasImportadas.forEach(f => {
                    if (!f) return;
                    if (!f.id) f.id = uid();
                    mapa.set(f.id, f);
                });

                state.fichas = Array.from(mapa.values());
            }

            saveFichas();
            render();
            alert("Fichas importadas com sucesso.");
        } catch (err) {
            console.error(err);
            alert("Não foi possível ler o arquivo JSON.");
        }
    };

    reader.readAsText(arquivo);
}

function handleInputImportarFichas(input) {
    const arquivo = input?.files?.[0];
    if (!arquivo) return;

    importarFichasJson(arquivo);
    input.value = "";
}

function loadDadosHistorico() {
  try {
    return JSON.parse(localStorage.getItem(DADOS_HISTORY_KEY)) || [];
  } catch {
    return [];
  }
}

function saveDadosHistorico() {
  localStorage.setItem(DADOS_HISTORY_KEY, JSON.stringify(state.dados.historico));
}

function uid() {
  return "id-" + Date.now() + "-" + Math.random().toString(16).slice(2);
}

function fichaVazia() {
  return {
    id: uid(),
    nome: "",
    jogador: "",
    raca: "",
      classesPersonagem: [],
      arcanistaCaminho: "",
      nivelTotal: 0,
      escolhasClasseResolvidas: [],
      inventario: [],
      dinheiro: 0,
      origem: "",
      origemId: "",
      escolhasOrigemResolvidas: [],
      divindade: "",
      divindadeId: "",
      divindadeDados: null,
      divindadePoderEscolhido: "",
    tamanho: "",
    xp: 0,
    deslocamento: "",
    forcaBase: 0,
destrezaBase: 0,
constituicaoBase: 0,
inteligenciaBase: 0,
sabedoriaBase: 0,
carismaBase: 0,
      aumentosPorAtributo: {
          forca: 0,
          destreza: 0,
          constituicao: 0,
          inteligencia: 0,
          sabedoria: 0,
          carisma: 0
      },
      controlePericiasInteligencia: {
          totalConcedido: 0,
          selecionadas: []
      },
modRacialAtributos: {
  forca: 0,
  destreza: 0,
  constituicao: 0,
  inteligencia: 0,
  sabedoria: 0,
  carisma: 0
},
    pontosAtributoIniciais: 10,
    pontosAtributoAtuais: 10,
    pvMax: 0,
    pvAtual: 0,
      pmMax: 0,
      pmAtual: 0,
      defesa: 10,
      defesaOutros: 0,
      penalidadeArmadura: 0,
      ataques: [
          {
              id: uid(),
              nome: "",
              bonus: "",
              dano: "",
              critico: "",
              tipo: "",
              alcance: "",
              automatico: false,
              origemEquipamento: false
          }
      ],
  pericias: [
  { nome: "Acrobacia", outros: 0, treinada: false, atributo: "DES", somenteTreinada: false, penalidadeArmadura: true },
  { nome: "Adestramento", outros: 0, treinada: false, atributo: "CAR", somenteTreinada: true, penalidadeArmadura: false },
  { nome: "Atletismo", outros: 0, treinada: false, atributo: "FOR", somenteTreinada: false, penalidadeArmadura: false },
  { nome: "Atuação", outros: 0, treinada: false, atributo: "CAR", somenteTreinada: true, penalidadeArmadura: false },
  { nome: "Cavalgar", outros: 0, treinada: false, atributo: "DES", somenteTreinada: false, penalidadeArmadura: false },
  { nome: "Conhecimento", outros: 0, treinada: false, atributo: "INT", somenteTreinada: true, penalidadeArmadura: false },
  { nome: "Cura", outros: 0, treinada: false, atributo: "SAB", somenteTreinada: false, penalidadeArmadura: false },
  { nome: "Diplomacia", outros: 0, treinada: false, atributo: "CAR", somenteTreinada: false, penalidadeArmadura: false },
  { nome: "Enganação", outros: 0, treinada: false, atributo: "CAR", somenteTreinada: false, penalidadeArmadura: false },
  { nome: "Fortitude", outros: 0, treinada: false, atributo: "CON", somenteTreinada: false, penalidadeArmadura: false },
  { nome: "Furtividade", outros: 0, treinada: false, atributo: "DES", somenteTreinada: false, penalidadeArmadura: true },
  { nome: "Guerra", outros: 0, treinada: false, atributo: "INT", somenteTreinada: true, penalidadeArmadura: false },
  { nome: "Iniciativa", outros: 0, treinada: false, atributo: "DES", somenteTreinada: false, penalidadeArmadura: false },
  { nome: "Intimidação", outros: 0, treinada: false, atributo: "CAR", somenteTreinada: false, penalidadeArmadura: false },
  { nome: "Intuição", outros: 0, treinada: false, atributo: "SAB", somenteTreinada: false, penalidadeArmadura: false },
  { nome: "Investigação", outros: 0, treinada: false, atributo: "INT", somenteTreinada: false, penalidadeArmadura: false },
  { nome: "Jogatina", outros: 0, treinada: false, atributo: "CAR", somenteTreinada: true, penalidadeArmadura: false },
  { nome: "Ladinagem", outros: 0, treinada: false, atributo: "DES", somenteTreinada: true, penalidadeArmadura: true },
  { nome: "Luta", outros: 0, treinada: false, atributo: "FOR", somenteTreinada: false, penalidadeArmadura: false },
  { nome: "Misticismo", outros: 0, treinada: false, atributo: "INT", somenteTreinada: true, penalidadeArmadura: false },
  { nome: "Nobreza", outros: 0, treinada: false, atributo: "INT", somenteTreinada: true, penalidadeArmadura: false },
  { nome: "Ofício", outros: 0, treinada: false, atributo: "INT", somenteTreinada: true, penalidadeArmadura: false },
  { nome: "Percepção", outros: 0, treinada: false, atributo: "SAB", somenteTreinada: false, penalidadeArmadura: false },
  { nome: "Pilotagem", outros: 0, treinada: false, atributo: "DES", somenteTreinada: true, penalidadeArmadura: false },
  { nome: "Pontaria", outros: 0, treinada: false, atributo: "DES", somenteTreinada: false, penalidadeArmadura: false },
  { nome: "Reflexos", outros: 0, treinada: false, atributo: "DES", somenteTreinada: false, penalidadeArmadura: false },
  { nome: "Religião", outros: 0, treinada: false, atributo: "SAB", somenteTreinada: true, penalidadeArmadura: false },
  { nome: "Sobrevivência", outros: 0, treinada: false, atributo: "SAB", somenteTreinada: false, penalidadeArmadura: false },
  { nome: "Vontade", outros: 0, treinada: false, atributo: "SAB", somenteTreinada: false, penalidadeArmadura: false }
],
    equipamentos: [],
    proficiencias: [],
    contadorPoderesTormenta: 0,
    efeitosAplicados: [],
    habilidades: [],
    magias: [],
    anotacoes: ""
  };
}

function getFichaAtual() {
  return state.fichas.find(f => f.id === state.fichaAtualId);
}

function getNivelTotalPersonagem(ficha) {
    if (!ficha?.classesPersonagem?.length) return 0;

    return ficha.classesPersonagem.reduce((total, item) => {
        return total + (Number(item.niveis) || 0);
    }, 0);
}

function atualizarNivelTotalFicha(ficha) {
    ficha.nivelTotal = getNivelTotalPersonagem(ficha);
}
function garantirAumentosPorAtributo(ficha) {
    if (!ficha.aumentosPorAtributo) {
        ficha.aumentosPorAtributo = {
            forca: 0,
            destreza: 0,
            constituicao: 0,
            inteligencia: 0,
            sabedoria: 0,
            carisma: 0
        };
    }

    ["forca", "destreza", "constituicao", "inteligencia", "sabedoria", "carisma"].forEach(chave => {
        ficha.aumentosPorAtributo[chave] = Number(ficha.aumentosPorAtributo[chave]) || 0;
    });

    return ficha.aumentosPorAtributo;
}

function getLimiteAumentoPorAtributo(nivelTotal) {
    const nivel = Math.max(1, Number(nivelTotal) || 1);

    if (nivel >= 17) return 4;
    if (nivel >= 11) return 3;
    if (nivel >= 5) return 2;
    return 1;
}

function getChaveAtributoAumento(valor) {
    const chave = normalizarTextoRegra(valor || "");

    if (chave === "forca") return "forca";
    if (chave === "destreza") return "destreza";
    if (chave === "constituicao") return "constituicao";
    if (chave === "inteligencia") return "inteligencia";
    if (chave === "sabedoria") return "sabedoria";
    if (chave === "carisma") return "carisma";

    return "";
}

function getNivelTotalParaEscolhaDeClasse(ficha) {
    let total = getNivelTotalFicha(ficha);

    const ctx = state.screen === "criacao"
        ? state.criacao?.classeEvolucaoContexto
        : state.evolucao?.classeEvolucaoContexto;

    if (ctx?.classeId) {
        const atualNaClasse = getNivelClasse(ficha, ctx.classeId);
        const alvoNaClasse = Number(ctx.nivelAlvo) || atualNaClasse;
        total += Math.max(0, alvoNaClasse - atualNaClasse);
    }

    return Math.max(1, total || 1);
}

function getAumentosAplicadosNoAtributo(ficha, atributo) {
    const chave = getChaveAtributoAumento(atributo);
    if (!chave) return 0;

    garantirAumentosPorAtributo(ficha);
    return Number(ficha.aumentosPorAtributo[chave]) || 0;
}

function getAumentosPendentesNoEstado(atributo) {
    const chave = getChaveAtributoAumento(atributo);
    if (!chave) return 0;

    const escolhas = state.screen === "criacao"
        ? state.criacao?.classeEscolhas
        : state.evolucao?.classeEscolhas;

    let total = 0;

    Object.values(escolhas || {}).forEach(lista => {
        (lista || []).forEach(opcao => {
            if (!opcao?.ehAumentoAtributo) return;

            const atributoEscolhido = opcao.atributoEscolhido || opcao.valor || "";

            if (getChaveAtributoAumento(atributoEscolhido) === chave) {
                total += 1;
            }
        });
    });

    return total;
}

function podeEscolherAumentoDeAtributo(ficha, atributo) {
    const chave = getChaveAtributoAumento(atributo);
    if (!chave) return false;

    const nivelTotal = getNivelTotalParaEscolhaDeClasse(ficha);
    const limite = getLimiteAumentoPorAtributo(nivelTotal);
    const aplicados = getAumentosAplicadosNoAtributo(ficha, chave);
    const pendentes = getAumentosPendentesNoEstado(chave);

    return (aplicados + pendentes) < limite;
}

function aplicarAumentoDeAtributoNaFicha(ficha, atributo) {
    const chave = getChaveAtributoAumento(atributo);
    if (!ficha || !chave) return false;

    garantirAumentosPorAtributo(ficha);

    const nivelTotal = getNivelTotalFicha(ficha);
    const limite = getLimiteAumentoPorAtributo(nivelTotal);
    const aplicados = getAumentosAplicadosNoAtributo(ficha, chave);

    if (aplicados >= limite) return false;

    ficha.aumentosPorAtributo[chave] = aplicados + 1;
    return true;
}

function getNivelClasse(ficha, classeId) {
    const item = ficha?.classesPersonagem?.find(c => c.classeId === classeId);
    return Number(item?.niveis) || 0;
}

function classeEhPrimeira(ficha, classeId) {
    const item = ficha?.classesPersonagem?.find(c => c.classeId === classeId);
    return !!item?.primeiraClasse;
}

function limparEfeitosClasseFicha(ficha) {
    const treinosNaoClasse = new Set(
        (ficha.efeitosAplicados || [])
            .filter(e => e.origemTipo !== "Classe" && e.tipo === "pericia_treinada" && e.alvo)
            .map(e => normalizarTextoRegra(e.alvo))
    );

    ficha.habilidades = (ficha.habilidades || []).filter(h => h.origem !== "Classe");
    ficha.magias = (ficha.magias || []).filter(m => m.origem !== "Classe");
    ficha.efeitosAplicados = (ficha.efeitosAplicados || []).filter(e => e.origemTipo !== "Classe");

    ficha.proficiencias = [];

    ficha.pericias.forEach(p => {
        p.treinada = treinosNaoClasse.has(normalizarTextoRegra(p.nome));
        p.outrosPoder = 0;
    });
    garantirAumentosPorAtributo(ficha);
    Object.keys(ficha.aumentosPorAtributo).forEach(chave => {
        ficha.aumentosPorAtributo[chave] = 0;
    });
    ficha.arcanistaCaminho = "";
    ficha.pvMax = 0;
    ficha.pvAtual = 0;
    ficha.pmMax = 0;
    ficha.pmAtual = 0;
}

function getClasseDoBanco(classeId) {
    return CLASSES_DB.find(c => c.id === classeId) || null;
}

function getClassesResumoFicha(ficha) {
    return formatarClassesPersonagem(ficha);
}
function getResumoClasseCurtoFicha(ficha) {
    const classes = ficha?.classesPersonagem || [];

    if (!classes.length) {
        return ficha?.classeNivel || "Sem classe";
    }

    if (classes.length === 1) {
        return classes[0].nome || "Sem classe";
    }

    return "Multiclasse";
}
function formatarClassesPersonagem(ficha) {
    if (!ficha?.classesPersonagem?.length) return "—";

    return ficha.classesPersonagem
        .map(c => `${c.nome} ${c.niveis}`)
        .join(", ");
}

function getRegistroClasse(ficha, classeId) {
    return ficha?.classesPersonagem?.find(c => c.classeId === classeId) || null;
}

function garantirPrimeiraClasseUnica(ficha) {
    const lista = ficha.classesPersonagem || [];
    let encontrou = false;

    lista.forEach(item => {
        if (item.primeiraClasse && !encontrou) {
            encontrou = true;
        } else {
            item.primeiraClasse = false;
        }
    });

    if (!encontrou && lista.length > 0) {
        lista[0].primeiraClasse = true;
    }
}

function getEscolhasClasseDisponiveisNoNivel(classe, nivelClasse, primeiraClasse, ficha = null) {
    const fichaContexto =
        ficha ||
        getFichaCriacao?.() ||
        getFichaEvolucaoAtual?.() ||
        getFichaAtual?.() ||
        null;

    const escolhasDaClasse = (classe?.escolhas || []).filter(escolha => {
        const nivelMinimo = Number(escolha.nivelMinimo) || 1;
        if (nivelMinimo !== nivelClasse) return false;
        if (escolha.somentePrimeiraClasse && !primeiraClasse) return false;
        const jaTemDivindade = !!String(ficha?.divindade || "").trim();

        if (escolha.filtro === "divindade_classe" && jaTemDivindade) {
            return false;
        }
        return true;
    });

    const escolhasInternas = getEscolhasInternasDeHabilidadesClasseNoNivel(classe, nivelClasse);
    const escolhasMagias = getEscolhasMagiasPorHabilidadeClasse(classe, nivelClasse, fichaContexto);

    return [...escolhasDaClasse, ...escolhasInternas, ...escolhasMagias];
}

function getEscolhasInternasDeHabilidadesClasseNoNivel(classe, nivelClasse) {
    const habilidadesDoNivel = getHabilidadesClasseDisponiveisNoNivel(classe, nivelClasse);

    const escolhasInternas = [];

    habilidadesDoNivel.forEach(h => {
        // se a própria habilidade já trouxer escolhas internas
        if (Array.isArray(h.escolhas) && h.escolhas.length) {
            h.escolhas.forEach(e => {
                escolhasInternas.push({
                    ...e,
                    id: e.id || `${h.id}-escolha-${uid()}`,
                    habilidade_id: h.id
                });
            });
        }

        // se o registro da habilidade existir no banco geral, reaproveita escolhas de lá
        if (h.registroId) {
            const registro = getRegistroPoderMagiaPorId(h.registroId);
            if (registro && Array.isArray(registro.escolhas)) {
                registro.escolhas.forEach(e => {
                    escolhasInternas.push({
                        ...e,
                        id: e.id || `${h.id}-registro-escolha-${uid()}`,
                        habilidade_id: h.id
                    });
                });
            }
        }
    });

    return escolhasInternas;
}

function getEscolhasMagiasPorHabilidadeClasse(classe, nivelClasse, ficha) {
    const habilidadesDoNivel = getHabilidadesClasseDisponiveisNoNivel(classe, nivelClasse);
    const escolhas = [];

    habilidadesDoNivel.forEach(h => {
        const nome = normalizarTextoRegra(h.nome || "");
        const desc = normalizarTextoRegra(h.descricao || "");
        const nomeClasse = normalizarTextoRegra(classe.nome || classe.id || "");

        let habilidadeGeraMagias = false;

        if (nomeClasse === "arcanista") {
            // Para Arcanista, só a habilidade "Magias" gera a escolha.
            habilidadeGeraMagias = nome === "magias";
        } else {
            habilidadeGeraMagias =
                nome.includes("magias") ||
                (desc.includes("aprende") && desc.includes("magia"));
        }

        if (!habilidadeGeraMagias) return;

        let filtroMagia = "";
        let quantidade = 0;

        if (nomeClasse === "arcanista") {
            const caminho = getCaminhoArcanistaDaFicha(ficha);

            if (!classeRecebeMagiasNoNivel(classe, nivelClasse, ficha)) {
                return;
            }

            filtroMagia = "magia_arcana_1";

            if (nivelClasse === 1) {
                quantidade = normalizarTextoRegra(caminho) === "mago" ? 4 : 3;
            } else {
                quantidade = 1;
            }
        } else if (nomeClasse === "bardo") {
            filtroMagia = "magia_arcana_1";
            quantidade = 2;
        } else if (nomeClasse === "clerigo") {
            filtroMagia = "magia_divina_1";
            quantidade = (nivelClasse === 1) ? 3 : 1;
        } else if (nomeClasse === "druida") {
            filtroMagia = "magia_divina_1";

            if (nivelClasse === 1) {
                quantidade = 2;
            } else if (nivelClasse % 2 === 0) {
                quantidade = 1;
            } else {
                quantidade = 0;
            }
        }

        if (filtroMagia && quantidade > 0) {
            escolhas.push({
                id: `magias-${classe.id}-${nivelClasse}`,
                tipo: "magia",
                titulo: "Escolha suas magias",
                descricao: `Selecione ${quantidade} magia(s) disponíveis para este nível.`,
                quantidade,
                filtro: filtroMagia,
                opcoesTexto: "",
                regrasGrupo: "",
                dependeDe: "",
                habilidade_id: h.id
            });
        }
    });

    return escolhas.reduce((acc, escolha) => {
        if (!acc.some(e => e.id === escolha.id)) {
            acc.push(escolha);
        }
        return acc;
    }, []);
}
function getEfeitosClasseDisponiveisNoNivel(classe, nivelClasse, primeiraClasse) {
    return (classe?.efeitos || []).filter(efeito => {
        const nivelMinimo = Number(efeito.nivelMinimo) || 1;
        if (nivelMinimo > nivelClasse) return false;
        if (efeito.somentePrimeiraClasse && !primeiraClasse) return false;
        return true;
    });
}

function getHabilidadesClasseDisponiveisNoNivel(classe, nivelClasse) {
    return (classe?.habilidades || []).filter(h => {
        const nivelMinimo = Number(h.nivelMinimo) || 1;
        return nivelMinimo <= nivelClasse;
    });
}

function aplicarEscolhasClasseResolvidasNaFicha(ficha) {
    (ficha.escolhasClasseResolvidas || []).forEach(registro => {
        const classe = getClasseDoBanco(registro.classeId);
        if (!classe) return;

        const nivelAtualDaClasse = getNivelClasse(ficha, registro.classeId);
        if (registro.nivelClasse > nivelAtualDaClasse) return;

        (registro.selecionadas || []).forEach(opcao => {
            if (opcao.tipoAplicacao === "pericia_treinada") {
                const pericia = ficha.pericias.find(p => p.nome === opcao.valor);
                if (pericia) pericia.treinada = true;

                ficha.efeitosAplicados.push({
                    id: uid(),
                    origemTipo: "Classe",
                    origemNome: classe.nome,
                    tipo: "pericia_treinada",
                    alvo: opcao.valor
                });
            }

            if (opcao.tipoAplicacao === "proficiencia_adicionar") {
                adicionarProficienciaNaFicha(ficha, opcao.valor);
            }

            if (opcao.tipoAplicacao === "magia_adicionar") {
                adicionarOuAtualizarMagiaNaFicha(
                    ficha,
                    {
                        registroId: opcao.registroId || "",
                        nome: opcao.valor || ""
                    },
                    "Classe",
                    classe.nome
                );

                ficha.efeitosAplicados.push({
                    id: uid(),
                    origemTipo: "Classe",
                    origemNome: classe.nome,
                    tipo: "magia_adicionar",
                    alvo: opcao.valor
                });
            }

            if (opcao.tipoAplicacao === "grupo_escolha") {
                if (opcao.ehDivindade) {
                    aplicarDivindadeEscolhidaDeClasseNaFicha(ficha, classe, opcao);
                }
                if (opcao.ehAumentoAtributo) {
                    const ok = aplicarAumentoDeAtributoNaFicha(ficha, opcao.valor);

                    if (ok) {
                        ficha.efeitosAplicados.push({
                            id: uid(),
                            origemTipo: "Classe",
                            origemNome: classe.nome,
                            tipo: "aumento_atributo",
                            alvo: opcao.valor
                        });
                    }
                }
                if (classe.id === "arcanista") {
                    const caminho = getCaminhoClassePorNome(classe.id, opcao.valor);

                    ficha.arcanistaCaminho = opcao.valor || "";

                    if (caminho) {
                        const jaTem = (ficha.habilidades || []).some(h =>
                            normalizarTextoRegra(h.nome) === normalizarTextoRegra(caminho.nome)
                        );

                        if (!jaTem) {
                            adicionarHabilidadeNaFicha(
                                ficha,
                                {
                                    nome: caminho.nome,
                                    descricao: caminho.descricao || "",
                                    custoPm: 0,
                                    custoVida: 0,
                                    custoPmPermanente: 0,
                                    custoVidaPermanente: 0,
                                    resumoUso: "",
                                    incrementos: [],
                                    escolhas: []
                                },
                                "Classe",
                                classe.nome
                            );
                        }
                    }

                    ficha.efeitosAplicados.push({
                        id: uid(),
                        origemTipo: "Classe",
                        origemNome: classe.nome,
                        tipo: "caminho_arcanista",
                        alvo: opcao.valor
                    });
                }
            }

            if (opcao.tipoAplicacao === "habilidade_adicionar") {
                let registroHabilidade = null;

                if (opcao.registroId) {
                    registroHabilidade = getPoderClassePorId(classe.id, opcao.registroId);

                    if (!registroHabilidade) {
                        registroHabilidade = getRegistroPoderMagiaPorId(opcao.registroId);
                    }
                }

                const nomeHabilidade =
                    opcao.nomeCurto ||
                    registroHabilidade?.nome ||
                    opcao.valor ||
                    "";
                const ehEmpatiaSelvagem = normalizarNomeHabilidade(nomeHabilidade) === "empatia selvagem";
                const temEmpatiaRacial = fichaTemHabilidadeComOrigem(ficha, "Empatia Selvagem", "Raça");

                if (ehEmpatiaSelvagem && temEmpatiaRacial) {
                    aplicarBonusEmpatiaSelvagemDahllan(ficha, "Classe", classe.nome);
                } else {
                    adicionarHabilidadeNaFicha(
                        ficha,
                        {
                            nome: nomeHabilidade,
                            descricao: registroHabilidade?.descricao || `Escolhido na evolução da classe ${classe.nome}.`,
                            custoPm: Number(registroHabilidade?.custoPm) || 0,
                            custoVida: Number(registroHabilidade?.custoVida) || 0,
                            custoPmPermanente: Number(registroHabilidade?.custoPmPermanente) || 0,
                            custoVidaPermanente: Number(registroHabilidade?.custoVidaPermanente) || 0,
                            resumoUso: registroHabilidade?.resumoUso || "",
                            registroId: registroHabilidade?.id || "",
                            ativavel: Number(registroHabilidade?.custoPm) > 0 || Number(registroHabilidade?.custoVida) > 0,
                            permiteIntensificar: Array.isArray(registroHabilidade?.incrementos) && registroHabilidade.incrementos.length > 0,
                            incrementos: registroHabilidade?.incrementos || [],
                            escolhas: registroHabilidade?.escolhas || []
                        },
                        "Classe",
                        classe.nome
                    );
                }

                if (opcao.ehAumentoAtributo && opcao.atributoEscolhido) {
                    const ok = aplicarAumentoDeAtributoNaFicha(ficha, opcao.atributoEscolhido);

                    if (ok) {
                        ficha.efeitosAplicados.push({
                            id: uid(),
                            origemTipo: "Classe",
                            origemNome: classe.nome,
                            tipo: "aumento_atributo",
                            alvo: opcao.atributoEscolhido
                        });
                    }
                }
            }
        });
    });
}

function calcularPVTotalFicha(ficha) {
    const nivelTotal = getNivelTotalFicha(ficha);
    const constituicao = getAtributoFinal(ficha, "constituicao");

    let total = 0;

    (ficha.classesPersonagem || []).forEach(cp => {
        const classe = getClasseDoBanco(cp.classeId);
        if (!classe) return;

        const niveis = Number(cp.niveis) || 0;
        const primeiraClasse = !!cp.primeiraClasse;

        if (niveis <= 0) return;

        if (primeiraClasse) {
            total += Number(classe.pvNivel1) || 0;
            if (niveis > 1) {
                total += (niveis - 1) * (Number(classe.pvPorNivel) || 0);
            }
        } else {
            total += niveis * (Number(classe.pvPorNivel) || 0);
        }
    });

    total += nivelTotal * constituicao;

    total += getBonusRacialPorNivel(ficha, "pv_bonus_nivel1");
    total += Math.max(0, nivelTotal - 1) * getBonusRacialPorNivel(ficha, "pv_bonus_por_nivel");

    return total;
}

function calcularPMTotalFicha(ficha) {
    const nivelTotal = getNivelTotalFicha(ficha);

    let total = 0;

    (ficha.classesPersonagem || []).forEach(cp => {
        const classe = getClasseDoBanco(cp.classeId);
        if (!classe) return;

        const niveis = Number(cp.niveis) || 0;
        if (niveis <= 0) return;

        total += niveis * (Number(classe.pmPorNivel) || 0);
    });

    total += getBonusRacialPorNivel(ficha, "pm_bonus_nivel1");
    total += Math.max(0, nivelTotal - 1) * getBonusRacialPorNivel(ficha, "pm_bonus_por_nivel");

    return total;
}

function reaplicarProgressaoClasses(ficha) {
    if (!ficha) return;

    garantirPrimeiraClasseUnica(ficha);
    atualizarNivelTotalFicha(ficha);
    limparEfeitosClasseFicha(ficha);

    if (!Array.isArray(ficha.proficiencias)) {
        ficha.proficiencias = [];
    }

    (ficha.classesPersonagem || []).forEach(item => {
        const classe = getClasseDoBanco(item.classeId);
        if (!classe) return;

        const nivelClasse = Number(item.niveis) || 0;
        const primeiraClasse = !!item.primeiraClasse;

        if (nivelClasse <= 0) return;

        const proficienciasBaseClasse = String(classe.proficienciasTexto || "")
            .split("|")
            .map(v => v.trim())
            .filter(Boolean);

        proficienciasBaseClasse.forEach(nome => {
            adicionarProficienciaNaFicha(ficha, nome);
        });

        if (primeiraClasse) {
            ficha.pvMax += Number(classe.pvNivel1) || 0;
            if (nivelClasse > 1) {
                ficha.pvMax += (nivelClasse - 1) * (Number(classe.pvPorNivel) || 0);
            }
        } else {
            ficha.pvMax += nivelClasse * (Number(classe.pvPorNivel) || 0);
        }

        ficha.pmMax += nivelClasse * (Number(classe.pmPorNivel) || 0);

        getHabilidadesClasseDisponiveisNoNivel(classe, nivelClasse).forEach(h => {
            adicionarHabilidadeNaFicha(ficha, h, "Classe", classe.nome);
        });

        getEfeitosClasseDisponiveisNoNivel(classe, nivelClasse, primeiraClasse).forEach(efeito => {
            aplicarEfeitoNaFicha(ficha, efeito, "Classe", classe.nome);
        });
    });

    ficha.pvMax += getNivelTotalFicha(ficha) * getAtributoFinal(ficha, "constituicao");

    aplicarEscolhasClasseResolvidasNaFicha(ficha);

    ficha.pvAtual = ficha.pvMax;
    ficha.pmAtual = ficha.pmMax;
}

function iniciarFluxoClasseCriacao() {
    const classe = getClasseSelecionadaCriacao();
    if (!classe) return;

    state.criacao.fluxoClasseAtivo = true;
    prepararNivelClasseCriacao(classe.id);
}

function prepararNivelClasseCriacao(classeId) {
    const ficha = getFichaCriacao();
    const classe = getClasseDoBanco(classeId);
    if (!ficha || !classe) return;

    const registro = getRegistroClasse(ficha, classeId);
    const nivelAlvo = registro ? (Number(registro.niveis) || 0) + 1 : 1;
    const primeiraClasse = !registro && (ficha.classesPersonagem || []).length === 0;

    state.criacao.classeEvolucaoContexto = {
        classeId: classe.id,
        nome: classe.nome,
        nivelAlvo,
        primeiraClasse
    };

    state.criacao.classeEscolhas = {};
    state.criacao.escolhaClasseAbertaId = null;
    state.criacao.classeSelecaoEvolucaoId = classe.id;

    render();
}

function abrirSelecaoProximoNivelClasse() {
    state.criacao.classeEvolucaoContexto = null;
    state.criacao.classeEscolhas = {};
    state.criacao.escolhaClasseAbertaId = null;
    render();
}

function getClasseEvolucaoAtualCriacao() {
    const ctx = state.criacao.classeEvolucaoContexto;
    if (!ctx) return null;
    return getClasseDoBanco(ctx.classeId);
}

function escolhaClasseNivelPreenchida(escolha) {
    const valores = getEscolhaClasseValores(escolha.id);
    return valores.length === (Number(escolha.quantidade) || 0);
}

function todasEscolhasClasseNivelPreenchidas(classe, nivelAlvo, primeiraClasse, ficha = null) {
    const fichaContexto =
        ficha ||
        getFichaCriacao?.() ||
        getFichaEvolucaoAtual?.() ||
        getFichaAtual?.() ||
        null;

    const escolhas = getEscolhasClasseDisponiveisNoNivel(
        classe,
        nivelAlvo,
        primeiraClasse,
        fichaContexto
    );

    if (!escolhas.length) return true;

    return escolhas.every(escolha => {
        if (!escolhaClasseDesbloqueada(escolha)) return false;
        return escolhaClasseNivelPreenchida(escolha);
    });
}

function classeNivelAtualValido() {
    const classe = getClasseEvolucaoAtualCriacao();
    const ctx = state.criacao.classeEvolucaoContexto;
    if (!classe || !ctx) return false;

    return todasEscolhasClasseNivelPreenchidas(classe, ctx.nivelAlvo, ctx.primeiraClasse);
}

function salvarEscolhasClasseDoNivelNaFicha(ficha, classe, nivelClasse) {
    const escolhasDoNivel = getEscolhasClasseDisponiveisNoNivel(
        classe,
        nivelClasse,
        state.criacao.classeEvolucaoContexto?.primeiraClasse
    );

    escolhasDoNivel.forEach(escolha => {
        const selecionadas = getEscolhaClasseValores(escolha.id);
        const quantidade = Number(escolha.quantidade) || 0;

        if (selecionadas.length !== quantidade) return;

        ficha.escolhasClasseResolvidas.push({
            id: uid(),
            classeId: classe.id,
            classeNome: classe.nome,
            nivelClasse,
            escolhaId: escolha.id,
            selecionadas: JSON.parse(JSON.stringify(selecionadas))
        });
    });
}

function concluirNivelClasseCriacao() {
    const ficha = getFichaCriacao();
    const classe = getClasseEvolucaoAtualCriacao();
    const ctx = state.criacao.classeEvolucaoContexto;

    if (!ficha || !classe || !ctx) return;
    if (!classeNivelAtualValido()) return;

    let registro = getRegistroClasse(ficha, classe.id);

    if (!registro) {
        registro = {
            classeId: classe.id,
            nome: classe.nome,
            niveis: 0,
            primeiraClasse: (ficha.classesPersonagem || []).length === 0
        };
        ficha.classesPersonagem.push(registro);
    }

    registro.niveis = ctx.nivelAlvo;

    salvarEscolhasClasseDoNivelNaFicha(ficha, classe, ctx.nivelAlvo);
    reaplicarProgressaoClasses(ficha);
    recalcularEquipamentosEFicha(ficha);

    if (criacaoJaPassouDaOrigem()) {
        if (prepararModalPericiasInteligenciaCriacao(ficha, "classe_concluida")) {
            render();
            return;
        }
    }

    finalizarConclusaoNivelClasseCriacao();
}

function iniciarEvolucaoFicha() {
    const ficha = getFichaAtual();
    if (!ficha) return;

    state.evolucao = {
        ativa: true,
        fichaId: ficha.id,
        classeEscolhas: {},
        escolhaClasseAbertaId: null,
        classeEvolucaoContexto: null,
        classeSelecaoEvolucaoId: "",
        poderClasseEscolhas: {},
        escolhaPoderClasseAbertaId: null
    };

    state.screen = "evolucao";
    render();
}

function getFichaEvolucaoAtual() {
    return state.fichas.find(f => f.id === state.evolucao.fichaId) || null;
}

function prepararNivelClasseEvolucao(classeId) {
    const ficha = getFichaEvolucaoAtual();
    const classe = getClasseDoBanco(classeId);
    if (!ficha || !classe) return;

    const registro = getRegistroClasse(ficha, classeId);
    const nivelAlvo = registro ? (Number(registro.niveis) || 0) + 1 : 1;
    const primeiraClasse = !registro && (ficha.classesPersonagem || []).length === 0;

    state.evolucao.classeEvolucaoContexto = {
        classeId: classe.id,
        nome: classe.nome,
        nivelAlvo,
        primeiraClasse
    };

    state.evolucao.classeEscolhas = {};
    state.evolucao.escolhaClasseAbertaId = null;
    state.evolucao.classeSelecaoEvolucaoId = classe.id;

    render();
}

function abrirSelecaoProximoNivelEvolucao() {
    state.evolucao.classeEvolucaoContexto = null;
    state.evolucao.classeEscolhas = {};
    state.evolucao.escolhaClasseAbertaId = null;
    state.evolucao.poderClasseEscolhas = {};
    state.evolucao.escolhaPoderClasseAbertaId = null;
    render();
}

function getClasseEvolucaoAtualFicha() {
    const ctx = state.evolucao.classeEvolucaoContexto;
    if (!ctx) return null;
    return getClasseDoBanco(ctx.classeId);
}

function getEscolhaClasseValoresEvolucao(escolhaId) {
    return state.evolucao.classeEscolhas?.[escolhaId] || [];
}

function toggleEscolhaClasseValorEvolucao(escolhaId, opcao, quantidadeMaxima) {
    if (!state.evolucao.classeEscolhas) {
        state.evolucao.classeEscolhas = {};
    }

    if (!state.evolucao.classeEscolhas[escolhaId]) {
        state.evolucao.classeEscolhas[escolhaId] = [];
    }

    const ficha = getFichaEvolucaoAtual();
    const classe = getClasseEvolucaoAtualFicha();
    const ctx = state.evolucao.classeEvolucaoContexto;

    if (!ficha || !classe || !ctx) return;

    const escolha = getEscolhasClasseDisponiveisNoNivel(
        classe,
        ctx.nivelAlvo || 1,
        !!ctx.primeiraClasse,
        ficha
    ).find(e => e.id === escolhaId);

    if (!escolha) return;

    const limite = Number(quantidadeMaxima ?? escolha.quantidade) || 0;
    const lista = state.evolucao.classeEscolhas[escolhaId];
    const idx = lista.findIndex(item => item.id === opcao.id);

    if (idx >= 0) {
        lista.splice(idx, 1);
    } else {
        if (!podeSelecionarOpcaoClasseEvolucao(escolha, opcao)) return;
        if (limite > 0 && lista.length >= limite) return;
        lista.push(opcao);
    }

    renderMantendoScrollEscolha();
}
function classeNivelAtualValidoEvolucao() {
    const classe = getClasseEvolucaoAtualFicha();
    const ctx = state.evolucao.classeEvolucaoContexto;
    const ficha = getFichaEvolucaoAtual();

    if (!classe || !ctx || !ficha) return false;

    const escolhas = getEscolhasClasseDisponiveisNoNivel(
        classe,
        ctx.nivelAlvo,
        ctx.primeiraClasse,
        ficha
    );

    if (!escolhas.length) return true;

    return escolhas.every(escolha => {
        if (!escolhaClasseDesbloqueada(escolha)) return false;
        const valores = getEscolhaClasseValoresEvolucao(escolha.id);
        return valores.length === (Number(escolha.quantidade) || 0);
    });
}

function salvarEscolhasClasseDoNivelNaFichaEvolucao(ficha, classe, nivelClasse) {
    const escolhasDoNivel = getEscolhasClasseDisponiveisNoNivel(
        classe,
        nivelClasse,
        state.evolucao.classeEvolucaoContexto?.primeiraClasse,
        ficha
    );

    escolhasDoNivel.forEach(escolha => {
        const selecionadas = getEscolhaClasseValoresEvolucao(escolha.id);
        const quantidade = Number(escolha.quantidade) || 0;

        if (selecionadas.length !== quantidade) return;

        ficha.escolhasClasseResolvidas.push({
            id: uid(),
            classeId: classe.id,
            classeNome: classe.nome,
            nivelClasse,
            escolhaId: escolha.id,
            selecionadas: JSON.parse(JSON.stringify(selecionadas))
        });
    });
}

function concluirNivelClasseEvolucao() {
    const ficha = getFichaEvolucaoAtual();
    const classe = getClasseEvolucaoAtualFicha();
    const ctx = state.evolucao.classeEvolucaoContexto;

    if (!ficha || !classe || !ctx) return;
    if (!classeNivelAtualValidoEvolucao()) return;

    let registro = getRegistroClasse(ficha, classe.id);

    if (!registro) {
        registro = {
            classeId: classe.id,
            nome: classe.nome,
            niveis: 0,
            primeiraClasse: (ficha.classesPersonagem || []).length === 0
        };
        ficha.classesPersonagem.push(registro);
    }

    registro.niveis = ctx.nivelAlvo;

    salvarEscolhasClasseDoNivelNaFichaEvolucao(ficha, classe, ctx.nivelAlvo);
    reaplicarProgressaoClasses(ficha);
    recalcularEquipamentosEFicha(ficha);
    saveFichas();

    const continuar = confirm("Subir mais níveis?");
    if (continuar) {
        abrirSelecaoProximoNivelEvolucao();
        return;
    }

    state.evolucao = {
        ativa: false,
        fichaId: null,
        classeEscolhas: {},
        escolhaClasseAbertaId: null,
        classeEvolucaoContexto: null,
        classeSelecaoEvolucaoId: "",
        poderClasseEscolhas: {},
        escolhaPoderClasseAbertaId: null
    };

    state.screen = "ficha";
    render();
}

function go(screen) {
  state.screen = screen;
  render();
}

function abrirModal(tipo) {
  state.modal = tipo;
  render();
}

function abrirFicha(id) {
  state.fichaAtualId = id;
  go("ficha");
}

function criarFicha() {
  const nova = fichaVazia();
  state.fichas.unshift(nova);
  state.fichaAtualId = nova.id;
  saveFichas();
  go("ficha");
}

function excluirFicha(id) {
  const ok = confirm("Excluir esta ficha?");
  if (!ok) return;
  state.fichas = state.fichas.filter(f => f.id !== id);
  if (state.fichaAtualId === id) state.fichaAtualId = null;
  saveFichas();
  render();
}

function updateFicha(field, value) {
    const ficha = getFichaAtual();
    if (!ficha) return;

    ficha[field] = value;

    const camposQueRecalculamDefesa = new Set([
        "forcaBase",
        "destrezaBase",
        "constituicaoBase",
        "inteligenciaBase",
        "sabedoriaBase",
        "carismaBase",
        "defesaOutros"
    ]);

    if (camposQueRecalculamDefesa.has(field)) {
        recalcularDefesaFicha(ficha);
    }

    saveFichas();
    render();
}

function aumentarNivel() {
  const ficha = getFichaAtual();
  if (!ficha) return;

  const atual = Number(ficha.nivelTotal || 1);
  ficha.nivelTotal = atual + 1;

  saveFichas();
  render();
}

function diminuirNivel() {
  const ficha = getFichaAtual();
  if (!ficha) return;

  const atual = Number(ficha.nivelTotal || 1);
  ficha.nivelTotal = Math.max(1, atual - 1);

  saveFichas();
  render();
}

function addEquipamento() {
  const ficha = getFichaAtual();
  if (!ficha) return;

  const novo = {
    id: uid(),
    nome: "",
    quantidade: 1,
    slots: 0,
    preco: "",
    descricao: "",
    efeitos: ""
  };

  ficha.equipamentos.push(novo);
  saveFichas();
  abrirDetalheEquipamento(novo.id);
}

function abrirDetalheEquipamento(id) {
  state.modal = "equipamento";
  state.modalPayload = { id };
  render();
}

function fecharModal() {
  state.modal = null;
  state.modalPayload = null;
  document.body.classList.remove("modal-open");
  render();
}

function getEquipamentoAtual() {
  const ficha = getFichaAtual();
  if (!ficha || !state.modalPayload?.id) return null;
  return ficha.equipamentos.find(e => e.id === state.modalPayload.id) || null;
}

function updateEquipamento(id, field, value) {
  const ficha = getFichaAtual();
  if (!ficha) return;

  const equip = ficha.equipamentos.find(e => e.id === id);
  if (!equip) return;

  if (field === "quantidade" || field === "slots") {
    equip[field] = Number(value) || 0;
  } else {
    equip[field] = value;
  }

  saveFichas();
}

function excluirEquipamento(id) {
  const ficha = getFichaAtual();
  if (!ficha) return;

  const ok = confirm("Excluir este equipamento?");
  if (!ok) return;

  ficha.equipamentos = ficha.equipamentos.filter(e => e.id !== id);
  saveFichas();
  fecharModal();
}

function custoSubirAtributo(valorAtual) {
  if (valorAtual < 0) return 1;
  if (valorAtual === 0) return 1;
  if (valorAtual === 1) return 2;
  if (valorAtual === 2) return 4;
  return 7;
}

function subirAtributo(campo) {
    const ficha = getFichaAtual();
    if (!ficha) return;

    const atual = Number(ficha[campo + "Base"]) || 0;
    const custo = custoSubirAtributo(atual);

    if (ficha.pontosAtributoAtuais < custo) return;

    ficha[campo + "Base"] = atual + 1;
    ficha.pontosAtributoAtuais -= custo;

    recalcularDefesaFicha(ficha);
    saveFichas();
    render();
}

function descerAtributo(campo) {
    const ficha = getFichaAtual();
    if (!ficha) return;

    const atual = Number(ficha[campo + "Base"]) || 0;

    let retorno;

    if (atual <= 0) {
        retorno = 1;
    } else {
        retorno = custoSubirAtributo(atual - 1);
    }

    ficha[campo + "Base"] = atual - 1;
    ficha.pontosAtributoAtuais += retorno;

    recalcularDefesaFicha(ficha);
    saveFichas();
    render();
}

function adicionarHabilidadeNaFicha(ficha, habilidade, origemTipo, origemNome) {
    if (!ficha) return;

    const nome = String(habilidade?.nome || "Habilidade").trim();
    const descricao = String(habilidade?.descricao || "").trim();
    const nomeNormalizado = normalizarTextoRegra(nome);
    const descricaoNormalizada = normalizarTextoRegra(descricao);
    const origemTipoNormalizada = normalizarTextoRegra(origemTipo || "Raça");

    const ehHabilidadeDeCirculoMagico =
        /^magias\s*\(?\d+/.test(nomeNormalizado) ||
        /^magias\s+\d+/.test(nomeNormalizado);

    const jaExisteCirculoMagico = ehHabilidadeDeCirculoMagico &&
        (ficha.habilidades || []).some(h =>
            normalizarTextoRegra(h.nome || "") === nomeNormalizado &&
            normalizarTextoRegra(h.descricao || "") === descricaoNormalizada
        );

    if (jaExisteCirculoMagico) return;

    const jaExisteHabilidadeClasseIdentica =
        origemTipoNormalizada === "classe" &&
        (ficha.habilidades || []).some(h =>
            normalizarTextoRegra(h.origem || "") === "classe" &&
            normalizarTextoRegra(h.nome || "") === nomeNormalizado &&
            normalizarTextoRegra(h.descricao || "") === descricaoNormalizada
        );

    if (jaExisteHabilidadeClasseIdentica) return;

    ficha.habilidades.push({
        id: uid(),
        nome,
        custoPm: Number(habilidade.custoPm) || 0,
        custoVida: Number(habilidade.custoVida) || 0,
        custoPmPermanente: Number(habilidade.custoPmPermanente) || 0,
        custoVidaPermanente: Number(habilidade.custoVidaPermanente) || 0,
        descricao,
        resumoUso: habilidade.resumoUso || "",
        selecionada: false,
        origem: origemTipo || "Raça",
        origemDetalhe: origemNome || "",
        registroId: habilidade.registroId || "",
        ativavel: habilidade.ativavel || false,
        permiteIntensificar: habilidade.permiteIntensificar || false,
        incrementos: habilidade.incrementos || [],
        escolhas: habilidade.escolhas || []
    });
}

function adicionarProficienciaNaFicha(ficha, nome) {
    if (!ficha || !nome) return;

    if (!Array.isArray(ficha.proficiencias)) {
        ficha.proficiencias = [];
    }

    if (!ficha.proficiencias.includes(nome)) {
        ficha.proficiencias.push(nome);
    }
}
function getArmasElegiveisParaFoco(ficha) {
    return (ITENS_EQUIPAMENTOS_DB.registros || [])
        .filter(item => String(item.categoria || "").toLowerCase() === "arma")
        .filter(item => String(item.nome || "").trim())
        .filter(item => {
            const prof = String(item.proficienciaNecessaria || "").trim();
            return !prof || fichaTemProficiencia(ficha, prof);
        })
        .sort((a, b) => String(a.nome || "").localeCompare(String(b.nome || ""), "pt-BR"));
}

function getMagiasElegiveisParaFoco(ficha) {
    return (ficha?.magias || [])
        .filter(m => String(m?.nome || "").trim())
        .reduce((acc, magia) => {
            const chave = normalizarTextoRegra(magia.nome);
            if (!acc.some(m => normalizarTextoRegra(m.nome) === chave)) {
                acc.push(magia);
            }
            return acc;
        }, [])
        .sort((a, b) => String(a.nome || "").localeCompare(String(b.nome || ""), "pt-BR"));
}

function montarOpcoesFocoEmArma(opcaoBase, ficha) {
    return getArmasElegiveisParaFoco(ficha).map(item => ({
        ...opcaoBase,
        id: `habilidade:${opcaoBase.registroId}:arma:${item.id}`,
        label: `Foco em Arma: ${item.nome}`,
        valor: `Foco em Arma: ${item.nome}`,
        nomeCurto: `Foco em Arma: ${item.nome}`,
        escolhaEspecial: "foco_em_arma",
        escolhaEspecialValor: item.nome,
        itemBaseId: item.id,
        preRequisitos: ""
    }));
}

function montarOpcoesFocoEmMagia(opcaoBase, ficha) {
    return getMagiasElegiveisParaFoco(ficha).map(magia => ({
        ...opcaoBase,
        id: `habilidade:${opcaoBase.registroId}:magia:${normalizarTextoRegra(magia.nome)}`,
        label: `Foco em Magia: ${magia.nome}`,
        valor: `Foco em Magia: ${magia.nome}`,
        nomeCurto: `Foco em Magia: ${magia.nome}`,
        escolhaEspecial: "foco_em_magia",
        escolhaEspecialValor: magia.nome,
        magiaNome: magia.nome,
        preRequisitos: ""
    }));
}

function expandirOpcoesEspeciaisDePoder(opcoesBase, ficha) {
    const resultado = [];

    (opcoesBase || []).forEach(opcao => {
        const nome = normalizarTextoRegra(opcao?.nomeCurto || opcao?.valor || "");

        if (nome === "foco em arma") {
            resultado.push(...montarOpcoesFocoEmArma(opcao, ficha));
            return;
        }

        if (nome === "foco em magia") {
            resultado.push(...montarOpcoesFocoEmMagia(opcao, ficha));
            return;
        }

        if (nome === "aumento de atributo") {
            const escolhaAtributo = (opcao.escolhas || []).find(e =>
                normalizarTextoRegra(e?.filtro || "") === "atributo_aumento"
            );

            if (escolhaAtributo) {
                [
                    "Força",
                    "Destreza",
                    "Constituição",
                    "Inteligência",
                    "Sabedoria",
                    "Carisma"
                ].forEach(nomeAtributo => {
                    resultado.push({
                        ...opcao,
                        id: `${opcao.id}:${normalizarTextoRegra(nomeAtributo)}`,
                        label: `Poder: Aumento de Atributo (${nomeAtributo})`,
                        nomeCurto: `Aumento de Atributo (${nomeAtributo})`,
                        valor: "Aumento de Atributo",
                        atributoEscolhido: nomeAtributo,
                        ehAumentoAtributo: true,
                        descricao: `${opcao.descricao || ""}\n\nAtributo escolhido: ${nomeAtributo}`.trim()
                    });
                });
                return;
            }
        }

        resultado.push(opcao);
    });

    return resultado;
}
function adicionarMagiaNaFicha(ficha, nome, origemTipo, origemNome) {
    return adicionarOuAtualizarMagiaNaFicha(ficha, nome, origemTipo, origemNome);
}
function adicionarAtaqueNaFicha(ficha, efeito) {
  ficha.ataques.push({
    nome: efeito.nomeAdicionado || "Ataque",
    bonus: efeito.bonusAtaque || 0,
    dano: efeito.dano || "",
    critico: efeito.critico || "",
    tipo: efeito.tipoAtaque || "",
    alcance: efeito.alcance || ""
  });
}
function montarOpcaoDeRegistroBanco(registro) {
    if (!registro) return null;

    const tipo = String(registro.tipoRegistro || "").toLowerCase();
    const nome = String(registro.nome || "").trim();
    const descricao = String(registro.descricao || "").trim();
    const preRequisitos = String(registro.preRequisitos || "").trim();
    const ehPoderTormenta = registroTemFiltro(registro, "poder_tormenta");
    const circulo = Number(registro.circulo) || 0;

    if (tipo === "magia") {
        return {
            id: `magia:${registro.id}`,
            tipoAplicacao: "magia_adicionar",
            label: `Magia: ${nome}`,
            valor: nome,
            registroId: registro.id,

            nomeCurto: nome,
            descricao,
            preRequisitos,
            ehPoderTormenta: false,
            circulo
        };
    }

    if (tipo === "poder" || tipo === "habilidade") {
        return {
            id: `habilidade:banco:${registro.id}`,
            tipoAplicacao: "habilidade_adicionar",
            label: `${tipo === "poder" ? "Poder" : "Habilidade"}: ${nome}`,
            valor: nome,
            registroId: registro.id,

            nomeCurto: nome,
            descricao,
            preRequisitos,
            ehPoderTormenta,
            circulo: 0
        };
    }

    return null;
}

function expandirFiltrosEquivalentes(filtro) {
    const base = String(filtro || "").trim().toLowerCase();
    if (!base) return [];

    const set = new Set([base]);

    if (base.startsWith("poderes_")) {
        set.add(base.replace(/^poderes_/, ""));
    }

    if (base.startsWith("poder_")) {
        set.add(base.replace(/^poder_/, ""));
    }

    return [...set];
}

function registroTemAlgumFiltro(registro, filtros) {
    const lista = normalizarListaFiltros(registro?.filtros || registro?.filtro || "");
    const alvo = (filtros || []).map(f => String(f || "").trim().toLowerCase()).filter(Boolean);
    return alvo.some(f => lista.includes(f));
}

function buscarPoderesPorFiltroFlexivel(filtro) {
    const filtros = expandirFiltrosEquivalentes(filtro);

    return (PODERES_MAGIAS_DB.registros || [])
        .filter(r => String(r.tipoRegistro || "").toLowerCase() === "poder")
        .filter(r => registroTemAlgumFiltro(r, filtros))
        .sort((a, b) => String(a.nome || "").localeCompare(String(b.nome || ""), "pt-BR"));
}

function buscarPoderesDaClassePorFiltroFlexivel(classeId, filtro) {
    const classe = getClasseDoBanco(classeId);
    if (!classe) return [];

    const filtros = expandirFiltrosEquivalentes(filtro);

    return (classe.poderes || [])
        .filter(p => registroTemAlgumFiltro(p, filtros))
        .sort((a, b) => String(a.nome || "").localeCompare(String(b.nome || ""), "pt-BR"));
}
function getOpcoesBancoPorFiltro(tipoEscolha, filtro) {
    if (!filtro) return [];

    if (tipoEscolha === "magia") {
        return buscarMagiasPorFiltro(filtro).map(montarOpcaoDeRegistroBanco).filter(Boolean);
    }

    if (tipoEscolha === "poder") {
        return filtrarForaPoderesConcedidos(
            buscarPoderesPorFiltroFlexivel
                ? buscarPoderesPorFiltroFlexivel(filtro)
                : buscarPoderesPorFiltro(filtro)
        )
            .map(montarOpcaoDeRegistroBanco)
            .filter(Boolean);
    }

    if (tipoEscolha === "habilidade") {
        return buscarPoderesMagiasPorFiltro(filtro, {
            algumFiltro: ["habilidade", filtro]
        }).map(montarOpcaoDeRegistroBanco).filter(Boolean);
    }

    return [];
}

function montarOpcaoPericiaBonus(nomePericia, valor = 2) {
    return {
        id: `pericia:${nomePericia}:bonus`,
        tipoAplicacao: "pericia_bonus",
        label: `Bônus em perícia: ${nomePericia} (+${valor})`,
        valor: nomePericia,
        bonus: Number(valor) || 2
    };
}

function ordenarOpcoesParaExibicao(opcoes, podeSelecionarFn) {
    return (opcoes || [])
        .map((opcao, indexOriginal) => ({
            opcao,
            indexOriginal,
            habilitada: !!podeSelecionarFn(opcao)
        }))
        .sort((a, b) => {
            if (a.habilitada !== b.habilitada) {
                return a.habilitada ? -1 : 1; // habilitadas primeiro
            }
            return a.indexOriginal - b.indexOriginal; // mantém ordem original dentro do grupo
        })
        .map(item => item.opcao);
}
function getOpcoesHabilidadesRaciaisParaOsteon() {
    return (RACAS_DB || [])
        .filter(raca => raca && raca.id !== "osteon")
        .flatMap(raca => {
            const tamanhoOrigem = raca.tamanho || "";

            return (raca.habilidades || [])
                .filter(habilidade => habilidade && habilidade.id)
                .map(habilidade => ({
                    id: `habilidade_racial:${raca.id}:${habilidade.id}`,
                    tipoAplicacao: "habilidade_racial_copiada",
                    label: `${raca.nome}: ${habilidade.nome}`,
                    valor: habilidade.nome,
                    nomeCurto: `${raca.nome}: ${habilidade.nome}`,
                    descricao: habilidade.descricao || "",
                    racaOrigemId: raca.id,
                    habilidadeOrigemId: habilidade.id,
                    tamanhoOrigem
                }));
        })
        .sort((a, b) => String(a.label || "").localeCompare(String(b.label || ""), "pt-BR"));
}
function getEscolhasRaciaisExtrasMemoriaPostuma(ficha) {
    const raca = getRacaSelecionadaCriacao();
    if (!raca || String(raca.id) !== "osteon") return [];

    const memoriaEscolhas = getEscolhaRacialValores("esc_ost_memoria");
    if (!Array.isArray(memoriaEscolhas) || !memoriaEscolhas.length) return [];

    const extras = [];

    memoriaEscolhas.forEach(opcao => {
        if (!opcao || opcao.tipoAplicacao !== "habilidade_racial_copiada") return;

        const racaOrigem = (RACAS_DB || []).find(r => String(r.id) === String(opcao.racaOrigemId));
        if (!racaOrigem) return;

        const habilidadeOrigem = (racaOrigem.habilidades || []).find(h => String(h.id) === String(opcao.habilidadeOrigemId));
        if (!habilidadeOrigem) return;

        const escolhasDaHabilidade = (racaOrigem.escolhas || [])
            .filter(e => String(e.habilidade_id || "") === String(habilidadeOrigem.id));

        escolhasDaHabilidade.forEach(escolhaBase => {
            extras.push({
                ...escolhaBase,
                id: `memoria:${racaOrigem.id}:${habilidadeOrigem.id}:${escolhaBase.id}`,
                titulo: `${racaOrigem.nome}: ${escolhaBase.titulo || habilidadeOrigem.nome || "Escolha"}`,
                descricao: escolhaBase.descricao || "",
                origemMemoriaPostuma: true,
                racaOrigemId: racaOrigem.id,
                habilidadeOrigemId: habilidadeOrigem.id,
                escolhaBaseId: escolhaBase.id
            });
        });
    });

    return extras;
}
function getEscolhasRaciaisDisponiveis(raca, ficha) {
    const escolhasBase = Array.isArray(raca?.escolhas) ? raca.escolhas : [];
    const extras = getEscolhasRaciaisExtrasMemoriaPostuma(ficha);
    return [...escolhasBase, ...extras];
}
function getOpcoesEscolhaOrigem(escolha, ficha) {
    if (!escolha) return [];

    if (escolha.tipo === "item_origem") {
        return parseListaPipe(escolha.opcoesTexto)
            .flatMap(montarOpcoesItemOrigemAPartirTexto);
    }

    if (escolha.tipo === "grupo" || escolha.tipo === "especial" || escolha.tipo === "grupo_especial") {
        // Origens normais
        if (escolha.filtro === "beneficios_origem_misto") {
            const opcoes = [];

            const pericias = parseListaPipe(escolha.opcoesPericias).flatMap(nome => {
                if (normalizarTextoRegra(nome) === "*todas_as_pericias*") {
                    return ficha.pericias.map(p => ({
                        id: `pericia:${p.nome}`,
                        tipoAplicacao: "pericia_treinada",
                        label: `Perícia: ${p.nome}`,
                        valor: p.nome
                    }));
                }

                return [{
                    id: `pericia:${nome}`,
                    tipoAplicacao: "pericia_treinada",
                    label: `Perícia: ${nome}`,
                    valor: nome
                }];
            });

            const poderes = parseListaPipe(escolha.opcoesPoderes)
                .flatMap(nome => getOpcoesPoderOrigemPorTexto(nome, ficha));

            const poderesUnicos = parseListaPipe(escolha.opcoesPoderUnico).flatMap(nome => {
                const habilidade = (ORIGENS_HABILIDADES_DB || []).find(h =>
                    normalizarTextoRegra(h.nome || "") === normalizarTextoRegra(nome)
                );

                if (!habilidade) return [];

                return [montarOpcaoPoderUnicoOrigem(habilidade)];
            });

            return [...pericias, ...poderes, ...poderesUnicos];
        }

        // EXCEÇÃO: Amnésico
        if (escolha.filtro === "origem_amnesico_mestre") {
            const pericias = ficha.pericias.map(p => ({
                id: `pericia:${p.nome}`,
                tipoAplicacao: "pericia_treinada",
                label: `Perícia: ${p.nome}`,
                valor: p.nome
            }));

            const poderes = filtrarForaPoderesConcedidos(
                (PODERES_MAGIAS_DB.registros || []).filter(registro => {
                    if (String(registro.tipoRegistro || "").toLowerCase() !== "poder") return false;

                    const filtros = normalizarListaFiltros(registro.filtros || "");
                    return !filtros.includes("poder_concedido") && !filtros.includes("poder_magico");
                })
            )
                .map(montarOpcaoDeRegistroBanco)
                .filter(Boolean)
                .map(op => ({
                    ...op,
                    id: `poder:${op.registroId || op.valor}`
                }));

            const poderesUnicos = getPoderesUnicosDasOrigens().map(habilidade =>
                montarOpcaoPoderUnicoOrigem(habilidade)
            );

            const criarNovo = {
                id: "origem_habilidade:custom_manual",
                tipoAplicacao: "origem_habilidade_custom_manual",
                label: "Poder único: Criar novo",
                valor: "Poder único personalizado",
                nomeCurto: "Criar novo",
                descricao: "Não aplica efeitos na ficha, use-os na hora de jogar."
            };

            return [...pericias, ...poderes, ...poderesUnicos, criarNovo];
        }

        // Origem custom
        if (escolha.filtro === "origem_custom_misto") {
            const pericias = ficha.pericias.map(p => ({
                id: `pericia:${p.nome}`,
                tipoAplicacao: "pericia_treinada",
                label: `Perícia: ${p.nome}`,
                valor: p.nome
            }));

            const poderes = filtrarForaPoderesConcedidos(
                (PODERES_MAGIAS_DB.registros || []).filter(registro => {
                    if (String(registro.tipoRegistro || "").toLowerCase() !== "poder") return false;

                    const filtros = normalizarListaFiltros(registro.filtros || "");
                    return !filtros.includes("poder_concedido") && !filtros.includes("poder_magico");
                })
            )
                .map(montarOpcaoDeRegistroBanco)
                .filter(Boolean)
                .map(op => ({
                    ...op,
                    id: `poder:${op.registroId || op.valor}`
                }));

            const poderesUnicos = parseListaPipe(escolha.opcoesPoderUnico).flatMap(nome => {
                if (normalizarTextoRegra(nome) === "criar poder unico (manual)") {
                    return [{
                        id: "origem_habilidade:custom_manual",
                        tipoAplicacao: "origem_habilidade_custom_manual",
                        label: "Poder único: Criar novo",
                        valor: "Poder único personalizado",
                        nomeCurto: "Criar novo",
                        descricao: "Não aplica efeitos na ficha, use-os na hora de jogar."
                    }];
                }

                const habilidade = (ORIGENS_HABILIDADES_DB || []).find(h =>
                    normalizarTextoRegra(h.nome || "") === normalizarTextoRegra(nome)
                );

                if (!habilidade) return [];
                return [montarOpcaoPoderUnicoOrigem(habilidade)];
            });

            return [...pericias, ...poderes, ...poderesUnicos];
        }
    }

    return [];
}
function getOpcoesEscolha(escolha, ficha) {
    if (!escolha) return [];

    if (escolha.tipo === "pericia_treinada") {
        let opcoes = [];

        if (escolha.filtro === "todas") {
            opcoes = ficha.pericias.map(p => p.nome);
        } else if (escolha.filtro === "lista") {
            opcoes = (escolha.opcoesTexto || "")
                .split("|")
                .map(v => v.trim())
                .filter(Boolean);
        } else {
            opcoes = (escolha.opcoesTexto || "")
                .split("|")
                .map(v => v.trim())
                .filter(Boolean);
        }

        return opcoes.map(nome => ({
            id: `pericia:${nome}`,
            tipoAplicacao: "pericia_treinada",
            label: `Perícia: ${nome}`,
            valor: nome
        }));
    }

    if (escolha.tipo === "proficiencia") {
        const opcoes = (escolha.opcoesTexto || "")
            .split("|")
            .map(v => v.trim())
            .filter(Boolean);

        return opcoes.map(nome => ({
            id: `proficiencia:${nome}`,
            tipoAplicacao: "proficiencia_adicionar",
            label: `Proficiência: ${nome}`,
            valor: nome
        }));
    }

    if (escolha.tipo === "magia") {
        if (escolha.filtro && escolha.filtro !== "lista") {
            const filtros = normalizarListaFiltros(escolha.filtro);

            const registros = filtros.length <= 1
                ? buscarMagiasPorFiltro(filtros[0] || escolha.filtro)
                : filtros.flatMap(filtro => buscarMagiasPorFiltro(filtro));

            const unicos = registros.reduce((acc, registro) => {
                if (!acc.some(r => String(r.id) === String(registro.id))) {
                    acc.push(registro);
                }
                return acc;
            }, []);

            return filtrarForaMagiasJaConhecidas(unicos, ficha)
                .sort((a, b) => String(a.nome || "").localeCompare(String(b.nome || ""), "pt-BR"))
                .map(montarOpcaoDeRegistroBanco)
                .filter(Boolean);
        }

        const opcoes = (escolha.opcoesTexto || "")
            .split("|")
            .map(v => v.trim())
            .filter(Boolean)
            .filter(nome => {
                const nomeNormalizado = normalizarTextoRegra(nome);
                return !(ficha?.magias || []).some(m =>
                    normalizarTextoRegra(m?.nome || "") === nomeNormalizado
                );
            });

        return opcoes.map(nome => ({
            id: `magia:${nome}`,
            tipoAplicacao: "magia_adicionar",
            label: `Magia: ${nome}`,
            valor: nome
        }));
    }

    if (escolha.tipo === "habilidade" || escolha.tipo === "poder") {
        const classeAtualCriacao = getClasseEvolucaoAtualCriacao?.() || getClasseSelecionadaCriacao?.();
        const classeAtualEvolucao = getClasseEvolucaoAtualFicha?.();
        const classeContexto = classeAtualEvolucao || classeAtualCriacao;

        if (classeContexto?.id && escolha.filtro) {
            const poderesClasseBase = buscarPoderesDaClassePorFiltroFlexivel(classeContexto.id, escolha.filtro).map(registro => ({
                id: `habilidade:classe:${registro.id}`,
                tipoAplicacao: "habilidade_adicionar",
                label: `Poder de classe: ${registro.nome}`,
                valor: registro.nome,
                registroId: registro.id,
                origemBanco: "classe",
                nomeCurto: registro.nome || "",
                descricao: String(registro.descricao || "").trim(),
                preRequisitos: String(registro.preRequisitos || "").trim(),
                escolhas: registro.escolhas || []
            }));

            const poderesClasse = expandirOpcoesEspeciaisDePoder(poderesClasseBase, ficha);

            const filtrosSubstituicao = [];
            buscarPoderesDaClassePorFiltroFlexivel(classeContexto.id, escolha.filtro).forEach(p => {
                normalizarListaFiltros(p.substituivelPorFiltros).forEach(f => filtrosSubstituicao.push(f));
            });

            const substituicoesBase = [...new Set(filtrosSubstituicao)]
                .flatMap(filtro => filtrarForaPoderesConcedidos(
                    buscarPoderesPorFiltroFlexivel(filtro)
                ))
                .reduce((acc, registro) => {
                    if (!acc.some(r => String(r.id) === String(registro.id))) {
                        acc.push(registro);
                    }
                    return acc;
                }, [])
                .map(registro => ({
                    id: `habilidade:geral:${registro.id}`,
                    tipoAplicacao: "habilidade_adicionar",
                    label: `Substituir por: ${registro.nome}`,
                    valor: registro.nome,
                    registroId: registro.id,
                    origemBanco: "geral",
                    nomeCurto: registro.nome || "",
                    descricao: String(registro.descricao || "").trim(),
                    preRequisitos: String(registro.preRequisitos || "").trim(),
                    escolhas: registro.escolhas || []
                }));

            const substituicoes = expandirOpcoesEspeciaisDePoder(substituicoesBase, ficha);

            if (poderesClasse.length || substituicoes.length) {
                return [...poderesClasse, ...substituicoes];
            }
        }

        if (escolha.filtro && escolha.filtro !== "lista") {
            const opcoesBase = getOpcoesBancoPorFiltro(escolha.tipo, escolha.filtro);
            return escolha.tipo === "poder"
                ? expandirOpcoesEspeciaisDePoder(opcoesBase, ficha)
                : opcoesBase;
        }

        const opcoes = (escolha.opcoesTexto || "")
            .split("|")
            .map(v => v.trim())
            .filter(Boolean);

        return opcoes.map(nome => ({
            id: `habilidade:${nome}`,
            tipoAplicacao: "habilidade_adicionar",
            label: `${escolha.tipo === "poder" ? "Poder" : "Habilidade"}: ${nome}`,
            valor: nome,
            nomeCurto: nome,
            descricao: "",
            preRequisitos: "",
            escolhas: []
        }));
    }

    if (escolha.tipo === "grupo") {
        if (escolha.filtro === "pericia_ou_poder") {
            const pericias = ficha.pericias.map(nomeObj => ({
                id: `pericia:${nomeObj.nome}`,
                tipoAplicacao: "pericia_treinada",
                label: `Perícia: ${nomeObj.nome}`,
                valor: nomeObj.nome
            }));

            const poderes = filtrarForaPoderesConcedidos(
                buscarPoderesPorFiltro("poder_geral")
            )
                .map(montarOpcaoDeRegistroBanco)
                .filter(Boolean)
                .map(op => ({
                    ...op,
                    id: `poder:${op.registroId || op.valor}`
                }));

            return [...pericias, ...poderes];
        }

        if (escolha.filtro === "pericia_ou_poder_ou_habilidade_racial") {
            const pericias = ficha.pericias.map(pericia => ({
                id: `pericia:${pericia.nome}`,
                tipoAplicacao: "pericia_treinada",
                label: `Perícia: ${pericia.nome}`,
                valor: pericia.nome
            }));

            const poderes = filtrarForaPoderesConcedidos(
                buscarPoderesPorFiltro("poder_geral")
            )
                .map(montarOpcaoDeRegistroBanco)
                .filter(Boolean)
                .map(op => ({
                    ...op,
                    id: `poder:${op.registroId || op.valor}`
                }));

            const habilidadesRaciais = getOpcoesHabilidadesRaciaisParaOsteon();

            return [...pericias, ...poderes, ...habilidadesRaciais];
        }

        if (escolha.filtro === "pericia_bonus_ou_poder_tormenta") {
            const ehEscolhaLefou = escolha.id === "esc_lef_deform";

            const pericias = ficha.pericias.map(pericia => ({
                ...montarOpcaoPericiaBonus(pericia.nome, 2),
                ehPoderTormenta: ehEscolhaLefou,
                contaCarismaTormenta: false
            }));

            const poderesTormenta = buscarPoderesPorFiltro("poder_tormenta")
                .map(montarOpcaoDeRegistroBanco)
                .filter(Boolean)
                .map(op => ({
                    ...op,
                    id: `poder:${op.registroId || op.valor}`,
                    label: op.label.replace(/^Poder:/, "Poder da Tormenta:"),
                    ehPoderTormenta: true,
                    contaCarismaTormenta: !ehEscolhaLefou ? true : false
                }));

            return [...pericias, ...poderesTormenta];
        }

        if (escolha.filtro === "atributo_aumento") {
            const nivelTotal = getNivelTotalParaEscolhaDeClasse(ficha);
            const limite = getLimiteAumentoPorAtributo(nivelTotal);

            return [
                "Força",
                "Destreza",
                "Constituição",
                "Inteligência",
                "Sabedoria",
                "Carisma"
            ].map(nome => {
                const aplicados = getAumentosAplicadosNoAtributo(ficha, nome);
                const pendentes = getAumentosPendentesNoEstado(nome);
                const usados = aplicados + pendentes;

                return {
                    id: `grupo:${escolha.id}:${nome}`,
                    tipoAplicacao: "grupo_escolha",
                    label: nome,
                    valor: nome,
                    nomeCurto: nome,
                    descricao: `Aumentos neste atributo: ${usados} / ${limite}`,
                    ehAumentoAtributo: true
                };
            });
        }

        if (escolha.filtro === "divindade_classe") {
            let classeContexto = null;

            if (state.screen === "criacao") {
                classeContexto = getClasseEvolucaoAtualCriacao() || getClasseSelecionadaCriacao();
            } else {
                classeContexto = getClasseEvolucaoAtualFicha?.();

                if (!classeContexto) {
                    const classeIdFallback =
                        state.evolucao?.classeSelecaoEvolucaoId ||
                        state.evolucao?.classeId ||
                        "";

                    if (classeIdFallback) {
                        classeContexto = getClasseDoBanco(classeIdFallback);
                    }
                }
            }

            if (!classeContexto) return [];

            const divindades = getDivindadesPermitidasParaClasse(classeContexto);

            return divindades.map(divindade => ({
                id: `grupo:${escolha.id}:${divindade.id}`,
                tipoAplicacao: "grupo_escolha",
                label: divindade.nome,
                valor: divindade.nome,
                nomeCurto: divindade.nome,
                descricao: divindade.descricao || "",
                ehDivindade: true,
                divindadeId: divindade.id || ""
            }));
        }

        if (escolha.id === "esc_arc_caminho") {
            const caminhos = getCaminhosClasse("arcanista");

            if (caminhos.length) {
                return caminhos.map(caminho => ({
                    id: `grupo:${escolha.id}:${caminho.id}`,
                    tipoAplicacao: "grupo_escolha",
                    label: caminho.nome,
                    valor: caminho.nome,
                    nomeCurto: caminho.nome,
                    descricao: caminho.descricao || ""
                }));
            }
        }

        if (String(escolha.opcoesTexto || "").trim()) {
            return String(escolha.opcoesTexto || "")
                .split("|")
                .map(v => v.trim())
                .filter(Boolean)
                .map(nome => ({
                    id: `grupo:${escolha.id}:${nome}`,
                    tipoAplicacao: "grupo_escolha",
                    label: nome,
                    valor: nome,
                    nomeCurto: nome,
                    descricao: ""
                }));
        }
    }

    return [];
}

function getEscolhaRacialValores(escolhaId) {
    return state.criacao.racaEscolhas?.[escolhaId] || [];
}

function renderMantendoScrollEscolha() {
    const overlayBody = document.querySelector(".overlay .overlay-body");
    const overlayScrollTop = overlayBody ? overlayBody.scrollTop : 0;
    const windowScrollY = window.scrollY;

    render();

    requestAnimationFrame(() => {
        const novoOverlayBody = document.querySelector(".overlay .overlay-body");
        if (novoOverlayBody) {
            novoOverlayBody.scrollTop = overlayScrollTop;
        }
        window.scrollTo(0, windowScrollY);
    });
}

function toggleEscolhaRacialValor(escolhaId, opcao, quantidadeMaxima) {
    if (!state.criacao.racaEscolhas[escolhaId]) {
        state.criacao.racaEscolhas[escolhaId] = [];
    }

    const raca = getRacaSelecionadaCriacao();
    const ficha = getFichaCriacao();
    const escolha = getEscolhasRaciaisDisponiveis(raca, ficha).find(e => e.id === escolhaId);
    if (!escolha) return;

    const lista = state.criacao.racaEscolhas[escolhaId];
    const idx = lista.findIndex(item => item.id === opcao.id);

    if (idx >= 0) {
        lista.splice(idx, 1);
    } else {
        if (!podeSelecionarOpcaoRacial(escolha, opcao)) return;
        if (lista.length >= quantidadeMaxima) return;
        lista.push(opcao);
    }

    renderMantendoScrollEscolha();
}
function toggleEscolhaOrigemValor(escolhaId, opcao, quantidadeMaxima) {
    if (!state.criacao.origemEscolhas) {
        state.criacao.origemEscolhas = {};
    }

    if (!state.criacao.origemEscolhas[escolhaId]) {
        state.criacao.origemEscolhas[escolhaId] = [];
    }

    const ficha = getFichaCriacao();
    if (!ficha) return;

    const lista = state.criacao.origemEscolhas[escolhaId];
    const limite = Number(quantidadeMaxima) || 0;
    const idx = lista.findIndex(item => item.id === opcao.id);

    if (idx >= 0) {
        lista.splice(idx, 1);
    } else {
        if (opcaoPericiaIndisponivelNaOrigem(opcao, ficha)) return;
        if (limite > 0 && lista.length >= limite) return;
        lista.push(opcao);
    }

    renderMantendoScrollEscolha();
}

function renderEscolhaCriacaoModal() {
    const f = getFichaCriacao();
    const raca = getRacaSelecionadaCriacao();
    const escolhaId = state.criacao.escolhaAbertaId;

    if (!f || !raca || !escolhaId) return "";

    const escolhasDisponiveis = getEscolhasRaciaisDisponiveis(raca, f);
    const escolha = escolhasDisponiveis.find(e => e.id === escolhaId);
    if (!escolha) return "";

    const selecionados = getEscolhaRacialValores(escolha.id);
    const quantidade = Number(escolha.quantidade) || 0;
    const opcoesBase = getOpcoesEscolha(escolha, f);

    const opcoes = ordenarOpcoesParaExibicao(opcoesBase, (opcao) => {
        const checked = selecionados.some(item => item.id === opcao.id);
        return checked || podeSelecionarOpcaoRacial(escolha, opcao);
    });

    setTimeout(() => {
        document.body.classList.add("modal-open");
    }, 0);

    return `
    <div class="overlay" onclick="fecharEscolhaCriacao()">
      <div class="overlay-card" onclick="event.stopPropagation()">
        <div class="overlay-header">
          <div>
  <div class="overlay-title">${escapeHtml(escolha.titulo || "Escolha")}</div>
  <div class="subtitle">
    ${escapeHtml(escolha.descricao || "")}
    ${escolha.descricao ? " • " : ""}
    Selecionados: ${selecionados.length} / ${quantidade}
  </div>
</div>
          <button class="btn ghost" onclick="fecharEscolhaCriacao()">Fechar</button>
        </div>

        <div class="overlay-body">
          <div class="list">
            ${opcoes.map(opcao => {
                const checked = selecionados.some(item => item.id === opcao.id);
                const disabled = !checked && !podeSelecionarOpcaoRacial(escolha, opcao);
                const expandida = opcaoEscolhaEstaExpandida("raca", escolha.id, opcao.id);
                const titulo = getTituloOpcaoEscolha(opcao);
                const descricao = String(opcao.descricao || "").trim();
                const preReqFaltando =
                    escolha.tipo === "magia" && opcao?.tipoAplicacao === "magia_adicionar"
                        ? ""
                        : getPreRequisitoNaoAtendidoOpcao(opcao, f);

                return `
        <div class="list-item" style="align-items:flex-start; gap:12px; ${disabled ? "opacity:.65;" : ""}">
            <button
                type="button"
                class="btn ghost"
                style="flex:1; text-align:left; justify-content:flex-start; padding:0; background:none; border:none;"
                onclick="toggleExpansaoOpcaoEscolha('raca', '${escolha.id}', '${opcao.id}')"
            >
                <div style="display:flex; align-items:flex-start; justify-content:space-between; gap:10px; width:100%;">
                    <div style="flex:1;">
                        <div class="list-item-title">${escapeHtml(titulo)}</div>
                        ${preReqFaltando ? `<div class="list-item-sub">Pré-requisito: ${escapeHtml(preReqFaltando)}</div>` : ``}
                        ${expandida && descricao ? `<div class="muted" style="margin-top:8px; white-space:normal; line-height:1.45;">${escapeHtml(descricao)}</div>` : ``}
                    </div>
                    <div class="muted" style="font-size:12px; padding-top:2px;">${expandida ? "▲" : "▼"}</div>
                </div>
            </button>

            <input
                class="choice-checkbox"
                type="checkbox"
                ${checked ? "checked" : ""}
                ${disabled ? "disabled" : ""}
                onclick="event.stopPropagation()"
                onchange='toggleEscolhaRacialValor("${escolha.id}", ${JSON.stringify(opcao).replace(/'/g, "&apos;")}, ${quantidade})'
            >
        </div>
    `;
            }).join("")}
          </div>
        </div>
      </div>
    </div>
  `;
}

function getMapaExpansaoEscolhasCriacao() {
    if (!state.criacao.opcoesExpandidas) {
        state.criacao.opcoesExpandidas = {};
    }
    return state.criacao.opcoesExpandidas;
}

function getChaveExpansaoOpcao(tipo, escolhaId, opcaoId) {
    return `${tipo}:${escolhaId}:${opcaoId}`;
}

function opcaoEscolhaEstaExpandida(tipo, escolhaId, opcaoId) {
    const mapa = getMapaExpansaoEscolhasCriacao();
    return !!mapa[getChaveExpansaoOpcao(tipo, escolhaId, opcaoId)];
}

function toggleExpansaoOpcaoEscolha(tipo, escolhaId, opcaoId) {
    const mapa = getMapaExpansaoEscolhasCriacao();
    const chave = getChaveExpansaoOpcao(tipo, escolhaId, opcaoId);
    mapa[chave] = !mapa[chave];
    renderMantendoScrollEscolha();
}

function getTituloOpcaoEscolha(opcao) {
    if (!opcao) return "";
    return String(opcao.nomeCurto || opcao.valor || opcao.label || "")
        .replace(/^(Perícia|Magia|Poder de classe|Poder da Tormenta|Poder|Habilidade|Proficiência|Substituir por|Bônus em perícia):\s*/i, "")
        .trim();
}

function escolhaRacialPreenchida(escolha) {
    const valores = getEscolhaRacialValores(escolha.id);
    return valores.length === (Number(escolha.quantidade) || 0);
}

function todasEscolhasRaciaisPreenchidas(raca) {
    const ficha = getFichaCriacao();
    const escolhas = getEscolhasRaciaisDisponiveis(raca, ficha);
    if (!escolhas.length) return true;

    return escolhas.every(escolha => escolhaRacialPreenchida(escolha));
}

function aplicarEscolhasRaciaisNaFicha(ficha, raca) {
    const escolhas = getEscolhasRaciaisDisponiveis(raca, ficha);
    if (!escolhas.length) return true;

    for (const escolha of escolhas) {
        const selecionadas = getEscolhaRacialValores(escolha.id);
        const quantidade = Number(escolha.quantidade) || 0;

        if (selecionadas.length !== quantidade) {
            return false;
        }

        selecionadas.forEach(opcao => {
            if (opcao.tipoAplicacao === "pericia_bonus") {
                const pericia = ficha.pericias.find(p => p.nome === opcao.valor);
                if (pericia) {
                    pericia.outrosRacial = (Number(pericia.outrosRacial) || 0) + (Number(opcao.bonus) || 2);
                }

                ficha.efeitosAplicados.push({
                    id: uid(),
                    origemTipo: "Raça",
                    origemNome: raca.nome,
                    tipo: "pericia_bonus",
                    alvo: opcao.valor,
                    valor: Number(opcao.bonus) || 2
                });
            }

            if (opcao.tipoAplicacao === "pericia_treinada") {
                const pericia = ficha.pericias.find(p => p.nome === opcao.valor);
                if (pericia) {
                    pericia.treinada = true;
                }

                ficha.efeitosAplicados.push({
                    id: uid(),
                    origemTipo: "Raça",
                    origemNome: raca.nome,
                    tipo: "pericia_treinada",
                    alvo: opcao.valor
                });
            }

            if (opcao.tipoAplicacao === "proficiencia_adicionar") {
                adicionarProficienciaNaFicha(ficha, opcao.valor);

                ficha.efeitosAplicados.push({
                    id: uid(),
                    origemTipo: "Raça",
                    origemNome: raca.nome,
                    tipo: "proficiencia_adicionar",
                    alvo: opcao.valor
                });
            }

            if (opcao.tipoAplicacao === "magia_adicionar") {
                adicionarOuAtualizarMagiaNaFicha(
                    ficha,
                    {
                        registroId: opcao.registroId || "",
                        nome: opcao.valor || "",
                        nomeAdicionado: opcao.nomeAdicionado || ""
                    },
                    "Raça",
                    raca.nome
                );

                ficha.efeitosAplicados.push({
                    id: uid(),
                    origemTipo: "Raça",
                    origemNome: raca.nome,
                    tipo: "magia_adicionar",
                    alvo: opcao.valor
                });
            }

            if (opcao.tipoAplicacao === "habilidade_racial_copiada") {
                aplicarHabilidadeRacialCopiadaNaFicha(ficha, opcao);
                return;
            }

            if (opcao.tipoAplicacao === "habilidade_adicionar") {
                const registro = opcao.registroId ? getRegistroPoderMagiaPorId(opcao.registroId) : null;

                adicionarHabilidadeNaFicha(
                    ficha,
                    {
                        nome: registro?.nome || opcao.valor,
                        descricao: registro?.descricao || `Escolhido na criação pela raça ${raca.nome}.`,
                        custoPm: Number(registro?.custoPm) || 0
                    },
                    "Raça",
                    raca.nome
                );

                const habilidadeAdicionada = ficha.habilidades[ficha.habilidades.length - 1];
                if (habilidadeAdicionada && registro) {
                    habilidadeAdicionada.registroId = registro.id;
                    habilidadeAdicionada.ativavel = Number(registro.ativavel) === 1 || registro.ativavel === true;
                    habilidadeAdicionada.permiteIntensificar = Number(registro.permiteIntensificar) === 1 || registro.permiteIntensificar === true;
                }

                ficha.efeitosAplicados.push({
                    id: uid(),
                    origemTipo: "Raça",
                    origemNome: raca.nome,
                    tipo: "habilidade_adicionar",
                    alvo: opcao.valor
                });
            }
        });
    }

    ficha.escolhasRaciaisResolvidas = Object.entries(state.criacao.racaEscolhas || {}).map(([escolhaId, opcoes]) => ({
        escolhaId,
        opcoes: (opcoes || []).map(op => ({ ...op }))
    }));

    return true;
}

function aplicarHabilidadeRacialCopiadaNaFicha(ficha, opcao) {
    const racaOrigem = (RACAS_DB || []).find(r => String(r.id) === String(opcao.racaOrigemId));
    if (!racaOrigem) return;

    const habilidade = (racaOrigem.habilidades || []).find(h => String(h.id) === String(opcao.habilidadeOrigemId));
    if (!habilidade) return;

    const jaTem = (ficha.habilidades || []).some(h =>
        String(h.registroId || "") === String(habilidade.id)
    );

    if (!jaTem) {
        adicionarHabilidadeNaFicha(
            ficha,
            {
                ...habilidade,
                registroId: habilidade.id
            },
            "Raça",
            `Memória Póstuma (${racaOrigem.nome})`
        );
    }

    const efeitos = (racaOrigem.efeitos || [])
        .filter(efeito => String(efeito.habilidade_id) === String(habilidade.id));

    efeitos.forEach(efeito => {
        aplicarEfeitoNaFicha(
            ficha,
            efeito,
            "Raça",
            `Memória Póstuma (${racaOrigem.nome})`
        );
    });

    if (opcao.tamanhoOrigem) {
        ficha.tamanho = opcao.tamanhoOrigem;
    }
}
function aplicarEfeitoNaFicha(ficha, efeito, origemTipo, origemNome) {
  if (!efeito || !efeito.tipo) return;

  ficha.efeitosAplicados.push({
    id: uid(),
    origemTipo: origemTipo || "Raça",
    origemNome: origemNome || "",
    tipo: efeito.tipo,
    alvo: efeito.alvo || "",
    valor: efeito.valor,
    valorTexto: efeito.valorTexto || "",
    nomeAdicionado: efeito.nomeAdicionado || ""
  });

  switch (efeito.tipo) {
    case "atributo_racial":
      if (efeito.alvo && ficha.modRacialAtributos[efeito.alvo] != null) {
        ficha.modRacialAtributos[efeito.alvo] += Number(efeito.valor) || 0;
      }
      break;

    case "pericia_bonus": {
      const pericia = ficha.pericias.find(p => p.nome === efeito.alvo);
      if (pericia) {
        pericia.outrosRacial = (Number(pericia.outrosRacial) || 0) + (Number(efeito.valor) || 0);
      }
      break;
    }

    case "pericia_treinada": {
      const pericia = ficha.pericias.find(p => p.nome === efeito.alvo);
      if (pericia) {
        pericia.treinada = true;
      }
      break;
    }
      case "penalidade_armadura": {
          ficha.penalidadeArmadura = (Number(ficha.penalidadeArmadura) || 0) + (Number(efeito.valor) || 0);
          break;
      }

    case "habilidade_adicionar":
      adicionarHabilidadeNaFicha(
        ficha,
        {
          nome: efeito.nomeAdicionado,
          descricao: efeito.descricao,
          custoPm: efeito.custoPm,
          ativavel: efeito.ativavel,
          permiteIntensificar: efeito.permiteIntensificar
        },
        origemTipo,
        origemNome
      );
      break;

      case "habilidade_geral_adicionar": {
          const registro = getHabilidadeGeralPorId(efeito.alvo || efeito.valorTexto || efeito.nomeAdicionado);

          if (registro) {
              const jaExiste = (ficha.habilidades || []).some(h =>
                  String(h.registroId) === String(registro.id) ||
                  String(h.nome || "").trim().toLowerCase() === String(registro.nome || "").trim().toLowerCase()
              );

              if (!jaExiste) {
                  adicionarHabilidadeNaFicha(
                      ficha,
                      {
                          nome: registro.nome || "",
                          descricao: registro.descricao || "",
                          custoPm: 0
                      },
                      origemTipo || "Raça",
                      origemNome || ""
                  );

                  const habilidadeAdicionada = ficha.habilidades[ficha.habilidades.length - 1];
                  if (habilidadeAdicionada) {
                      habilidadeAdicionada.registroId = registro.id;
                      habilidadeAdicionada.tipoRegistro = "habilidade_geral";
                  }
              }
          }
          break;
      }

      case "magia_adicionar":
          adicionarOuAtualizarMagiaNaFicha(
              ficha,
              {
                  registroId: efeito.registroId || "",
                  nomeAdicionado: efeito.nomeAdicionado || efeito.alvo || ""
              },
              origemTipo,
              origemNome
          );
          break;

    case "proficiencia_adicionar":
      adicionarProficienciaNaFicha(ficha, efeito.alvo || efeito.nomeAdicionado);
      break;

    case "deslocamento_bonus": {
      const atual = parseInt(String(ficha.deslocamento || "0").replace(/[^\d-]/g, ""), 10) || 0;
      ficha.deslocamento = `${atual + (Number(efeito.valor) || 0)}m`;
      break;
    }

    case "deslocamento_definir":
      ficha.deslocamento = efeito.valorTexto || ficha.deslocamento;
      break;

      case "pv_bonus_nivel1":
      case "pv_bonus_por_nivel":
      case "pm_bonus_nivel1":
      case "pm_bonus_por_nivel":
          break;

    case "ataque_adicionar":
      adicionarAtaqueNaFicha(ficha, efeito);
      break;

    case "defesa_bonus":
      ficha.defesa = (Number(ficha.defesa) || 0) + (Number(efeito.valor) || 0);
      break;

    case "tamanho_definir":
      ficha.tamanho = efeito.valorTexto || ficha.tamanho;
      break;

    case "poder_tormenta_adicionar":
      ficha.contadorPoderesTormenta = (Number(ficha.contadorPoderesTormenta) || 0) + (Number(efeito.valor) || 0);
      break;

    case "descricao_apenas":
      break;
  }
}

function adicionarPontoAtributo() {
  const ficha = getFichaAtual();
  if (!ficha) return;

  ficha.pontosAtributoAtuais += 1;

  saveFichas();
  render();
}

function addHabilidade() {
  const ficha = getFichaAtual();
  if (!ficha) return;

  const nova = {
    id: uid(),
    nome: "",
    custoPm: 0,
    descricao: "",
    selecionada: false
  };

  ficha.habilidades.push(nova);
  saveFichas();
  abrirDetalheHabilidade(nova.id);
}

function abrirDetalheHabilidade(id) {
  state.modal = "habilidade";
  state.modalPayload = { id };
  render();
}

function getHabilidadeAtual() {
  const ficha = getFichaAtual();
  if (!ficha || !state.modalPayload?.id) return null;
  return ficha.habilidades.find(h => h.id === state.modalPayload.id) || null;
}
function getRegistroBancoDaHabilidadeFicha(habilidade) {
    const registroId = String(habilidade?.registroId || "").trim();
    if (!registroId) return null;

    const registroPoderMagia = getRegistroPoderMagiaPorId(registroId);
    if (registroPoderMagia) return registroPoderMagia;

    return null;
}

function habilidadeFichaEhPoder(habilidade) {
    if (!habilidade) return false;

    const origem = normalizarTextoRegra(habilidade.origem || "");
    const registro = getRegistroBancoDaHabilidadeFicha(habilidade);
    const tipoRegistro = normalizarTextoRegra(registro?.tipoRegistro || habilidade?.tipoRegistro || "");

    // Tudo que vem de classe, origem ou divindade vai para Poderes
    if (origem === "classe" || origem === "origem" || origem === "divindade") {
        return true;
    }

    // Se veio de raça, só vira poder quando o registro no banco for um poder
    if (origem === "raca" || origem === "raça") {
        if (tipoRegistro === "poder") return true;
    }

    return false;
}

function getHabilidadesRaciaisVisiveis(ficha) {
    return (ficha?.habilidades || [])
        .filter(habilidadeDeveAparecerNaFicha)
        .filter(h => {
            const origem = normalizarTextoRegra(h.origem || "");
            return (origem === "raca" || origem === "raça") && !habilidadeFichaEhPoder(h);
        });
}

function getPoderesVisiveis(ficha) {
    return (ficha?.habilidades || [])
        .filter(habilidadeDeveAparecerNaFicha)
        .filter(habilidadeFichaEhPoder);
}
function habilidadeDeveAparecerNaFicha(habilidade) {
    if (!habilidade) return false;

    const registroId = String(habilidade.registroId || "").trim();
    const nome = normalizarTextoRegra(habilidade.nome || "");
    const origem = normalizarTextoRegra(habilidade.origem || "");
    const origemDetalhe = normalizarTextoRegra(habilidade.origemDetalhe || "");

    // Arcanista
    if (registroId === "hab_arc_magias") return false;
    if (nome === "magias" && origem === "classe" && origemDetalhe === "arcanista") {
        return false;
    }

    // Clérigo
    if (registroId === "hab_clerigo_2") return false;
    if (nome === "magias" && origem === "classe" && origemDetalhe === "clerigo") {
        return false;
    }

    // Druida
    if (nome === "magias" && origem === "classe" && origemDetalhe === "druida") {
        return false;
    }

    return true;
}
function updateHabilidade(id, field, value) {
  const ficha = getFichaAtual();
  if (!ficha) return;

  const habilidade = ficha.habilidades.find(h => h.id === id);
  if (!habilidade) return;

  if (field === "custoPm") {
    habilidade[field] = Math.max(0, Number(value) || 0);
  } else if (field === "selecionada") {
    habilidade[field] = !!value;
  } else {
    habilidade[field] = value;
  }

  saveFichas();

  // Só rerenderiza quando precisa atualizar a lista/resumo da ficha
  if (field === "selecionada") {
    render();
  }
}

function excluirHabilidade(id) {
  const ficha = getFichaAtual();
  if (!ficha) return;

  const ok = confirm("Excluir esta habilidade?");
  if (!ok) return;

  ficha.habilidades = ficha.habilidades.filter(h => h.id !== id);
  saveFichas();
  fecharModal();
}

function getCustoTotalHabilidadesSelecionadas() {
  const ficha = getFichaAtual();
  if (!ficha) return 0;

  return ficha.habilidades
    .filter(h => h.selecionada)
    .reduce((total, h) => total + (Number(h.custoPm) || 0), 0);
}

function usarHabilidadesSelecionadas() {
  const ficha = getFichaAtual();
  if (!ficha) return;

  const total = getCustoTotalHabilidadesSelecionadas();
  const pmAtual = Number(ficha.pmAtual) || 0;

  if (total > pmAtual) return;
  if (total < 0) return;

  ficha.pmAtual = pmAtual - total;

  ficha.habilidades.forEach(h => {
    h.selecionada = false;
  });

  saveFichas();
  render();
}

function addMagia() {
  const ficha = getFichaAtual();
  if (!ficha) return;

  const nova = {
    id: uid(),
    nome: "",
    circulo: "",
    custoPm: 1,
    execucao: "",
    alcance: "",
    area: "",
    duracao: "",
    resistencia: "",
    descricao: "",
    incrementos: []
  };

  ficha.magias.push(nova);
  saveFichas();
  abrirDetalheMagia(nova.id);
}

function abrirDetalheMagia(id) {
  state.modal = "magia";
  state.modalPayload = { id };
  render();
}

function getMagiaAtual() {
  const ficha = getFichaAtual();
  if (!ficha || !state.modalPayload?.id) return null;
  return ficha.magias.find(m => m.id === state.modalPayload.id) || null;
}

function updateMagia(id, field, value) {
  const ficha = getFichaAtual();
  if (!ficha) return;

  const magia = ficha.magias.find(m => m.id === id);
  if (!magia) return;

  if (field === "custoPm") {
    magia[field] = Math.max(0, Number(value) || 0);
  } else {
    magia[field] = value;
  }

  saveFichas();
}

function addIncrementoMagia(idMagia) {
  const ficha = getFichaAtual();
  if (!ficha) return;

  const magia = ficha.magias.find(m => m.id === idMagia);
  if (!magia) return;

  magia.incrementos.push({
    id: uid(),
    custoPm: 1,
    descricao: "",
    selecionado: false
  });

  saveFichas();
  render();
}

function updateIncrementoMagia(idMagia, idIncremento, field, value) {
  const ficha = getFichaAtual();
  if (!ficha) return;

  const magia = ficha.magias.find(m => m.id === idMagia);
  if (!magia) return;

  const incremento = magia.incrementos.find(i => i.id === idIncremento);
  if (!incremento) return;

  if (field === "custoPm") {
    incremento[field] = Math.max(0, Number(value) || 0);
  } else if (field === "selecionado") {
    incremento[field] = !!value;
  } else {
    incremento[field] = value;
  }

  saveFichas();

  if (field === "selecionado") {
    render();
  }
}

function excluirIncrementoMagia(idMagia, idIncremento) {
  const ficha = getFichaAtual();
  if (!ficha) return;

  const magia = ficha.magias.find(m => m.id === idMagia);
  if (!magia) return;

  magia.incrementos = magia.incrementos.filter(i => i.id !== idIncremento);
  saveFichas();
  render();
}

function excluirMagia(id) {
  const ficha = getFichaAtual();
  if (!ficha) return;

  const ok = confirm("Excluir esta magia?");
  if (!ok) return;

  ficha.magias = ficha.magias.filter(m => m.id !== id);
  saveFichas();
  fecharModal();
}

function getCustoTotalMagia(magia) {
  if (!magia) return 0;

  const base = Number(magia.custoPm) || 0;
  const extras = (magia.incrementos || [])
    .filter(i => i.selecionado)
    .reduce((total, i) => total + (Number(i.custoPm) || 0), 0);

  return base + extras;
}

function podeSelecionarIncremento(magia, incrementoId) {
  const ficha = getFichaAtual();
  if (!ficha || !magia) return false;

  const pmAtual = Number(ficha.pmAtual) || 0;
  const base = Number(magia.custoPm) || 0;

  if (pmAtual < base) return false;

  const incremento = magia.incrementos.find(i => i.id === incrementoId);
  if (!incremento) return false;

  if (incremento.selecionado) return true;

  const custoAtual = getCustoTotalMagia(magia);
  const novoTotal = custoAtual + (Number(incremento.custoPm) || 0);

  return novoTotal <= pmAtual;
}

function usarMagiaAtual() {
  const ficha = getFichaAtual();
  const magia = getMagiaAtual();
  if (!ficha || !magia) return;

  const pmAtual = Number(ficha.pmAtual) || 0;
  const custoTotal = getCustoTotalMagia(magia);

  if (custoTotal > pmAtual) return;

  ficha.pmAtual = pmAtual - custoTotal;

  (magia.incrementos || []).forEach(i => {
    i.selecionado = false;
  });

  saveFichas();
  render();
}

function updateAtaque(i, campo, valor) {
    const f = getFichaAtual();
    if (!f || !f.ataques || !f.ataques[i]) return;

    const ataque = f.ataques[i];

    if (ataque.origemEquipamento) {
        const mapaCamposAuto = {
            nome: "nomeExtra",
            bonus: "bonusExtra",
            dano: "danoExtra",
            critico: "criticoExtra",
            tipo: "tipoExtra",
            alcance: "alcanceExtra"
        };

        const campoExtra = mapaCamposAuto[campo];
        if (!campoExtra) return;

        ataque[campoExtra] = valor;
    } else {
        ataque[campo] = valor;
    }

    saveFichas();
    render();
}

function addAtaque() {
    const f = getFichaAtual();
    if (!f) return;

    f.ataques = f.ataques || [];
    f.ataques.push({
        id: uid(),
        nome: "",
        bonus: "",
        dano: "",
        critico: "",
        tipo: "",
        alcance: "",
        automatico: false,
        origemEquipamento: false
    });

    saveFichas();
    render();
}

function removeAtaque(i) {
    const f = getFichaAtual();
    if (!f || !Array.isArray(f.ataques) || !f.ataques[i]) return;

    const ataque = f.ataques[i];
    if (ataque.origemEquipamento) return;

    f.ataques.splice(i, 1);

    if (!f.ataques.length) {
        f.ataques.push({
            id: uid(),
            nome: "",
            bonus: "",
            dano: "",
            critico: "",
            tipo: "",
            alcance: "",
            automatico: false,
            origemEquipamento: false
        });
    }

    saveFichas();
    render();
}

function getNivelTotalFicha(ficha) {
    return getNivelTotalPersonagem(ficha);
}

function getMetadeNivel(ficha) {
  return Math.floor(getNivelTotalFicha(ficha) / 2);
}

function getBonusTreino(ficha) {
  const nivel = getNivelTotalFicha(ficha);

  if (nivel >= 15) return 6;
  if (nivel >= 7) return 4;
  if (nivel >= 1) return 2;
  return 0;
}

function getValorAtributoPericia(ficha, atributo) {
  if (!ficha) return 0;

  switch (atributo) {
    case "FOR":
      return getAtributoFinal(ficha, "forca");

    case "DES":
      return getAtributoFinal(ficha, "destreza");

    case "CON":
      return getAtributoFinal(ficha, "constituicao");

    case "INT":
      return getAtributoFinal(ficha, "inteligencia");

    case "SAB":
      return getAtributoFinal(ficha, "sabedoria");

    case "CAR":
      return getAtributoFinal(ficha, "carisma");

    default:
      return 0;
  }
}
function getOutrosPericia(p) {
    return (
        (Number(p?.outrosRacial) || 0) +
        (Number(p?.outrosPoder) || 0) +
        (Number(p?.outros) || 0)
    );
}

function normalizarNomeHabilidade(valor) {
    return normalizarTextoRegra(valor || "");
}

function fichaTemHabilidadeComOrigem(ficha, nome, origem) {
    const alvo = normalizarNomeHabilidade(nome);
    return (ficha?.habilidades || []).some(h =>
        normalizarNomeHabilidade(h.nome) === alvo &&
        (!origem || h.origem === origem)
    );
}

function fichaTemHabilidadeNaoRacial(ficha, nome) {
    const alvo = normalizarNomeHabilidade(nome);
    return (ficha?.habilidades || []).some(h =>
        normalizarNomeHabilidade(h.nome) === alvo &&
        h.origem !== "Raça"
    );
}

function adicionarBonusPoderPericia(ficha, nomePericia, valor) {
    const pericia = (ficha?.pericias || []).find(p => normalizarTextoRegra(p.nome) === normalizarTextoRegra(nomePericia));
    if (!pericia) return;

    pericia.outrosPoder = (Number(pericia.outrosPoder) || 0) + (Number(valor) || 0);
}
function fichaTemHabilidadePorRegistroId(ficha, registroId) {
    return (ficha?.habilidades || []).some(h =>
        String(h.registroId || "") === String(registroId)
    );
}
function fichaTemHabilidadePorNome(ficha, nome) {
    return (ficha?.habilidades || []).some(h =>
        normalizarTextoRegra(h.nome || "") === normalizarTextoRegra(nome || "")
    );
}
function limparBonusesCondicionaisPericias(ficha) {
    (ficha?.pericias || []).forEach(p => {
        p.outrosPoder = 0;
    });
}

function aplicarBonusReptiliano(ficha) {
    if (!ficha) return;

    const temReptiliano =
        fichaTemHabilidadePorRegistroId(ficha, "hab_trog_reptiliano") ||
        fichaTemHabilidadePorNome(ficha, "Reptiliano");

    if (!temReptiliano) return;

    if (!temArmaduraEquipada(ficha)) {
        adicionarBonusPoderPericia(ficha, "Furtividade", 5);

        ficha.efeitosAplicados.push({
            id: uid(),
            origemTipo: "Habilidade",
            origemNome: "Reptiliano",
            tipo: "pericia_bonus",
            alvo: "Furtividade",
            valor: 5,
            valorTexto: "Reptiliano (sem armadura)"
        });
    }
}

function reaplicarBonusesCondicionaisPericias(ficha) {
    if (!ficha) return;

    limparBonusesCondicionaisPericias(ficha);

    aplicarBonusReptiliano(ficha);
}

function aplicarBonusEmpatiaSelvagemDahllan(ficha, origemTipo, origemNome) {
    adicionarBonusPoderPericia(ficha, "Adestramento", 2);

    ficha.efeitosAplicados.push({
        id: uid(),
        origemTipo: origemTipo || "Classe",
        origemNome: origemNome || "",
        tipo: "pericia_bonus",
        alvo: "Adestramento",
        valor: 2,
        valorTexto: "Empatia Selvagem (Dahllan)"
    });
}
function calcularTotalPericia(ficha, pericia) {
  if (!ficha || !pericia) return 0;

  if (pericia.somenteTreinada && !pericia.treinada) {
    return 0;
  }

  const atributo = getValorAtributoPericia(ficha, pericia.atributo);
  const metadeNivel = getMetadeNivel(ficha);
  const treino = pericia.treinada ? getBonusTreino(ficha) : 0;
  const outros = getOutrosPericia(pericia);
  const penalidadeArmadura = pericia.penalidadeArmadura ? (Number(ficha.penalidadeArmadura) || 0) : 0;

  return atributo + metadeNivel + treino + outros + penalidadeArmadura;
}

function updatePericia(index, field, value) {
    const ficha = getFichaAtual();
    if (!ficha) return;

    if (field === "treinada") {
        ficha.pericias[index][field] = !!value;
    } else if (field === "outros") {
        ficha.pericias[index][field] = Number(value) || 0;
    } else {
        ficha.pericias[index][field] = value;
    }

    saveFichas();
    render();
}

function renderHome() {
  app.innerHTML = `
    <div class="screen">
      <div class="topbar">
        <div>
          <h1 class="logo">Tormenta</h1>
          <div class="subtitle">Gerenciador de ficha, livro e dados</div>
        </div>
      </div>

      <div class="menu-grid">
        <button class="menu-card" onclick="go('personagens')">
          <h3>Personagem</h3>
          <p>Criar, abrir e editar fichas salvas neste navegador.</p>
        </button>

        <button class="menu-card" onclick="go('livro')">
          <h3>Livro</h3>
          <p>Área reservada para o PDF do livro. Vamos ligar isso na próxima etapa.</p>
        </button>

        <button class="menu-card" onclick="go('dados')">
          <h3>Dados</h3>
          <p>Área reservada para rolagem de dados. Vamos montar depois.</p>
        </button>
      </div>
    </div>
  `;
}

function renderPersonagens() {
    app.innerHTML = `
    <div class="screen">
      <div class="topbar">
        <div>
          <h2>Personagem</h2>
          <div class="subtitle">Crie um novo personagem ou abra uma ficha já existente.</div>
        </div>

        <div class="actions">
          <button class="btn" onclick="exportarFichasJson()">Exportar fichas</button>
          <button class="btn" onclick="abrirSeletorImportacaoFichas()">Importar fichas</button>
          <button class="btn ghost" onclick="go('home')">Voltar</button>
        </div>
      </div>

      <input
        id="inputImportarFichas"
        type="file"
        accept=".json,application/json"
        style="display:none"
        onchange="handleInputImportarFichas(this)"
      >

      <div class="row-2">
        <div class="panel">
          <div class="panel-title">Criar personagem</div>
          <div class="panel-body">
            <p class="subtitle">
              Siga as etapas do processo de criação do personagem antes de abrir a ficha de jogo.
            </p>

            <div style="margin-top:16px;">
              <button class="btn primary" onclick="iniciarCriacaoFicha()">Criar personagem</button>
            </div>
          </div>
        </div>

        <div class="panel">
          <div class="panel-title">Abrir ficha existente</div>
          <div class="panel-body">
            ${state.fichas.length === 0
            ? `<div class="empty">Nenhuma ficha salva ainda.</div>`
            : `
                  <div class="list">
                    ${state.fichas.map(f => `
                      <div class="list-item">
                        <div>
                          <div class="list-item-title">${escapeHtml(f.nome || "Sem nome")}</div>
                          <div class="list-item-sub">
                            ${escapeHtml(getResumoClasseCurtoFicha(f))}
                            ${f.raca ? " • " + escapeHtml(f.raca) : ""}
                            • Nível ${escapeHtml(getNivelTotalPersonagem(f))}
                          </div>
                        </div>

                        <div class="actions">
                          <button class="btn" onclick="abrirFicha('${f.id}')">Abrir</button>
                          <button class="btn danger" onclick="excluirFicha('${f.id}')">Excluir</button>
                        </div>
                      </div>
                    `).join("")}
                  </div>
                `
        }
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderBarraCriacao() {
  return `
    <div class="criacao-etapas">
      ${ETAPAS_CRIACAO.map((nome, index) => `
        <div class="criacao-etapa ${index === state.criacao.etapa ? "ativa" : ""} ${index < state.criacao.etapa ? "feita" : ""}">
          ${escapeHtml(nome)}
        </div>
      `).join("")}
    </div>
  `;
}

function renderResumoCriacao(f) {
  return `
    <div class="panel">
      <div class="panel-title">Resumo</div>
      <div class="panel-body">
        <div class="list">
          <div class="list-item">
            <div>
              <div class="list-item-title">Nome</div>
              <div class="list-item-sub">${escapeHtml(f.nome || "—")}</div>
            </div>
          </div>

          <div class="list-item">
  <div>
    <div class="list-item-title">Atributos</div>
    <div class="list-item-sub">
      FOR ${getAtributoFinalCriacaoPreview(f, "forca")} • DES ${getAtributoFinalCriacaoPreview(f, "destreza")} • CON ${getAtributoFinalCriacaoPreview(f, "constituicao")}<br>
      INT ${getAtributoFinalCriacaoPreview(f, "inteligencia")} • SAB ${getAtributoFinalCriacaoPreview(f, "sabedoria")} • CAR ${getAtributoFinalCriacaoPreview(f, "carisma")}
    </div>
  </div>
</div>

          <div class="list-item">
            <div>
              <div class="list-item-title">Raça</div>
              <div class="list-item-sub">${escapeHtml(f.raca || "—")}</div>
            </div>
          </div>

          <div class="list-item">
  <div>
    <div class="list-item-title">Classes</div>
    <div class="list-item-sub">${escapeHtml(formatarClassesPersonagem(f))}</div>
  </div>
</div>

<div class="list-item">
  <div>
    <div class="list-item-title">Nível total</div>
    <div class="list-item-sub">${escapeHtml(String(getNivelTotalPersonagem(f)))}</div>
  </div>
</div>

<div class="list-item">
  <div>
    <div class="list-item-title">PV</div>
    <div class="list-item-sub">${escapeHtml(String(getPVMaxCriacaoPreview(f)))}</div>
  </div>
</div>

<div class="list-item">
  <div>
    <div class="list-item-title">PM</div>
    <div class="list-item-sub">${escapeHtml(String(getPMMaxCriacaoPreview(f)))}</div>
  </div>
</div>

          <div class="list-item">
            <div>
              <div class="list-item-title">Origem</div>
              <div class="list-item-sub">${escapeHtml(f.origem || "—")}</div>
            </div>
          </div>

          <div class="list-item">
            <div>
              <div class="list-item-title">Divindade</div>
              <div class="list-item-sub">${escapeHtml(f.divindade || "—")}</div>
            </div>
          </div>

          <div class="list-item">
            <div>
              <div class="list-item-title">Tamanho</div>
              <div class="list-item-sub">${escapeHtml(f.tamanho || "—")}</div>
            </div>
          </div>

          <div class="list-item">
            <div>
              <div class="list-item-title">Deslocamento</div>
              <div class="list-item-sub">${escapeHtml(f.deslocamento || "—")}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

function selecionarClasseCriacao(id) {
    state.criacao.classeSelecionadaId = id;
    state.criacao.classeEscolhas = {};
    render();
}

function getEscolhaClasseValores(escolhaId) {
    return state.criacao.classeEscolhas?.[escolhaId] || [];
}

function toggleEscolhaClasseValor(escolhaId, opcao, quantidadeMaxima) {
    if (!state.criacao.classeEscolhas) {
        state.criacao.classeEscolhas = {};
    }

    if (!state.criacao.classeEscolhas[escolhaId]) {
        state.criacao.classeEscolhas[escolhaId] = [];
    }

    const ficha = getFichaCriacao();
    const classe = getClasseEvolucaoAtualCriacao() || getClasseSelecionadaCriacao();
    const ctx = state.criacao.classeEvolucaoContexto;

    if (!classe) return;

    const nivelAlvo = ctx?.nivelAlvo || 1;
    const primeiraClasse = !!ctx?.primeiraClasse;

    const escolha = getEscolhasClasseDisponiveisNoNivel(
        classe,
        nivelAlvo,
        primeiraClasse,
        ficha
    ).find(e => e.id === escolhaId);

    if (!escolha) return;

    const limite = Number(quantidadeMaxima ?? escolha.quantidade) || 0;
    const lista = state.criacao.classeEscolhas[escolhaId];
    const idx = lista.findIndex(item => item.id === opcao.id);

    if (idx >= 0) {
        lista.splice(idx, 1);
    } else {
        if (!podeSelecionarOpcaoClasse(escolha, opcao)) return;
        if (limite > 0 && lista.length >= limite) return;
        lista.push(opcao);
    }

    renderMantendoScrollEscolha();
}

function escolhaClassePreenchida(escolha) {
    const valores = getEscolhaClasseValores(escolha.id);
    return valores.length === (Number(escolha.quantidade) || 0);
}

function todasEscolhasClassePreenchidas(classe) {
    const ficha = getFichaCriacao();
    const ctx = state.criacao.classeEvolucaoContexto;

    if (!classe || !ctx) {
        const escolhas = classe?.escolhas || [];
        if (!escolhas.length) return true;
        return escolhas.every(escolha => escolhaClassePreenchida(escolha));
    }

    const escolhas = getEscolhasClasseDisponiveisNoNivel(
        classe,
        ctx.nivelAlvo || 1,
        !!ctx.primeiraClasse,
        ficha
    );

    if (!escolhas.length) return true;

    return escolhas.every(escolha => escolhaClassePreenchida(escolha));
}

function classeCriacaoValida() {
    const classe = getClasseEvolucaoAtualCriacao() || getClasseSelecionadaCriacao();
    if (!classe) return false;
    return todasEscolhasClassePreenchidas(classe);
}
function abrirEscolhaClasseCriacao(escolhaId) {
    state.criacao.escolhaClasseAbertaId = escolhaId;
    render();
}

function fecharEscolhaClasseCriacao() {
    state.criacao.escolhaClasseAbertaId = null;
    document.body.classList.remove("modal-open");
    render();
}
function abrirEscolhaClasseEvolucao(escolhaId) {
    state.evolucao.escolhaClasseAbertaId = escolhaId;
    render();
}

function fecharEscolhaClasseEvolucao() {
    state.evolucao.escolhaClasseAbertaId = null;
    document.body.classList.remove("modal-open");
    render();
}
function parseListaPipe(texto) {
    return String(texto || "")
        .split("|")
        .map(v => v.trim())
        .filter(Boolean);
}
function parseListaTextoLivre(texto) {
    return String(texto || "")
        .split(/[|,]/)
        .map(v => v.trim())
        .filter(Boolean);
}

function getRegistroPoderPorNome(nome) {
    const alvo = normalizarTextoRegra(nome || "");
    if (!alvo) return null;

    return (PODERES_MAGIAS_DB.registros || []).find(r =>
        String(r.tipoRegistro || "").toLowerCase() === "poder" &&
        normalizarTextoRegra(r.nome || "") === alvo
    ) || null;
}

function getRacaAtualParaDivindade() {
    const ficha = getFichaCriacao();
    const raca = getRacaSelecionadaCriacao();

    return {
        id: normalizarTextoRegra(raca?.id || ""),
        nome: normalizarTextoRegra(raca?.nome || ficha?.raca || "")
    };
}

function getClassesAtuaisParaDivindade() {
    const ficha = getFichaCriacao();
    const classeCriacao = getClasseSelecionadaCriacao();

    const lista = new Set();

    if (classeCriacao?.id) lista.add(normalizarTextoRegra(classeCriacao.id));
    if (classeCriacao?.nome) lista.add(normalizarTextoRegra(classeCriacao.nome));

    (ficha?.classesPersonagem || []).forEach(c => {
        if (c?.id) lista.add(normalizarTextoRegra(c.id));
        if (c?.nome) lista.add(normalizarTextoRegra(c.nome));
    });

    return [...lista].filter(Boolean);
}

function classeAtualEhClerigo() {
    return getClassesAtuaisParaDivindade().includes(normalizarTextoRegra("clerigo"));
}

function divindadeDisponivelParaPersonagem(divindade) {
    if (!divindade) return false;
    if (classeAtualEhClerigo()) return true;

    const racaAtual = getRacaAtualParaDivindade();
    const classesAtuais = getClassesAtuaisParaDivindade();

    const racasPermitidas = parseListaTextoLivre(divindade.devotos_racas).map(normalizarTextoRegra);
    const classesPermitidas = parseListaTextoLivre(divindade.devotos_classes).map(normalizarTextoRegra);

    if (racasPermitidas.includes("todos")) return true;
    if (racaAtual.id && racasPermitidas.includes(racaAtual.id)) return true;
    if (racaAtual.nome && racasPermitidas.includes(racaAtual.nome)) return true;
    if (classesAtuais.some(c => classesPermitidas.includes(c))) return true;

    return false;
}

function getDivindadesDisponiveisCriacao() {
    return (DIVINDADES_DB || []).filter(divindadeDisponivelParaPersonagem);
}

function getDivindadeSelecionadaCriacao() {
    const idState = state.criacao?.divindadeSelecionadaId;
    if (idState) {
        return (DIVINDADES_DB || []).find(d => String(d.id) === String(idState)) || null;
    }

    const ficha = getFichaCriacao();
    const idFicha = ficha?.divindadeId;
    if (idFicha) {
        return (DIVINDADES_DB || []).find(d => String(d.id) === String(idFicha)) || null;
    }

    const nomeFicha = ficha?.divindade;
    if (nomeFicha) {
        return getDivindadeDoBancoPorNome(nomeFicha);
    }

    return null;
}
function divindadeVeioDaClasseNaCriacao() {
    const ficha = getFichaCriacao();
    if (!ficha) return false;

    return (ficha.efeitosAplicados || []).some(e =>
        normalizarTextoRegra(e?.origemTipo || "") === normalizarTextoRegra("Classe") &&
        normalizarTextoRegra(e?.tipo || "") === normalizarTextoRegra("divindade_escolhida")
    );
}

function sincronizarDivindadeCriacaoComFicha() {
    const ficha = getFichaCriacao();
    if (!ficha) return;

    if (!state.criacao.divindadeSelecionadaId) {
        if (ficha.divindadeId) {
            state.criacao.divindadeSelecionadaId = ficha.divindadeId;
        } else if (ficha.divindade) {
            const divindade = getDivindadeDoBancoPorNome(ficha.divindade);
            if (divindade) {
                state.criacao.divindadeSelecionadaId = divindade.id || null;
            }
        }
    }

    if (!state.criacao.divindadePoderSelecionadoNome && ficha.divindadePoderEscolhido) {
        state.criacao.divindadePoderSelecionadoNome = ficha.divindadePoderEscolhido;
    }
}
function getDivindadeDoBancoPorNome(nome) {
    const alvo = normalizarTextoRegra(nome || "");
    if (!alvo) return null;

    return (DIVINDADES_DB || []).find(d =>
        normalizarTextoRegra(d.nome || "") === alvo
    ) || null;
}

function getDivindadesPermitidasParaClasse(classe) {
    if (!classe) return [];

    const classeId = normalizarTextoRegra(classe.id || "");
    const classeNome = normalizarTextoRegra(classe.nome || "");

    if (classeId === "clerigo" || classeNome === "clerigo") {
        return [...(DIVINDADES_DB || [])].sort((a, b) =>
            String(a.nome || "").localeCompare(String(b.nome || ""), "pt-BR")
        );
    }

    return (DIVINDADES_DB || [])
        .filter(divindade => {
            const classesPermitidas = parseListaTextoLivre(divindade.devotos_classes)
                .map(normalizarTextoRegra);

            if (
                classesPermitidas.includes("todos") ||
                classesPermitidas.includes("qualquer")
            ) {
                return true;
            }

            return classesPermitidas.includes(classeId) || classesPermitidas.includes(classeNome);
        })
        .sort((a, b) => String(a.nome || "").localeCompare(String(b.nome || ""), "pt-BR"));
}
function getDivindadesPermitidasParaFicha(ficha) {
    if (!ficha) return [];

    const classes = Array.isArray(ficha.classesPersonagem) ? ficha.classesPersonagem : [];
    const racaId = normalizarTextoRegra(ficha.racaId || "");
    const racaNome = normalizarTextoRegra(ficha.raca || "");

    return (DIVINDADES_DB || [])
        .filter(divindade => {
            if (normalizarTextoRegra(divindade.id) === "nenhum") return false;

            const racasPermitidas = parseListaTextoLivre(divindade.devotos_racas)
                .map(normalizarTextoRegra);

            const classesPermitidas = parseListaTextoLivre(divindade.devotos_classes)
                .map(normalizarTextoRegra);

            const racaOk =
                !racasPermitidas.length ||
                racasPermitidas.includes("todos") ||
                racasPermitidas.includes("todas") ||
                racasPermitidas.includes("qualquer") ||
                racasPermitidas.includes(racaId) ||
                racasPermitidas.includes(racaNome);

            const classeOk =
                !classesPermitidas.length ||
                classesPermitidas.includes("todos") ||
                classesPermitidas.includes("todas") ||
                classesPermitidas.includes("qualquer") ||
                classes.some(c => {
                    const classeId = normalizarTextoRegra(c?.classeId || "");
                    const classeNome = normalizarTextoRegra(c?.nome || "");
                    return classesPermitidas.includes(classeId) || classesPermitidas.includes(classeNome);
                });

            return racaOk && classeOk;
        })
        .sort((a, b) => String(a.nome || "").localeCompare(String(b.nome || ""), "pt-BR"));
}

function getDivindadePorId(id) {
    return (DIVINDADES_DB || []).find(d => String(d.id) === String(id)) || null;
}

function limparDivindadeNaFicha(ficha) {
    if (!ficha) return;

    ficha.habilidades = (ficha.habilidades || []).filter(h =>
        normalizarTextoRegra(h.origem || "") !== normalizarTextoRegra("Divindade")
    );

    ficha.efeitosAplicados = (ficha.efeitosAplicados || []).filter(e =>
        normalizarTextoRegra(e.origemTipo || "") !== normalizarTextoRegra("Divindade")
    );

    ficha.divindade = "";
    ficha.divindadeId = "";
    ficha.divindadeDados = null;
    ficha.divindadePoderEscolhido = "";
}

function aplicarDivindadeNaFichaGenerica(ficha, divindade, poderSelecionado) {
    if (!ficha || !divindade || !poderSelecionado) return false;

    limparDivindadeNaFicha(ficha);

    ficha.divindade = divindade.nome || "";
    ficha.divindadeId = divindade.id || "";
    ficha.divindadeDados = {
        id: divindade.id || "",
        nome: divindade.nome || "",
        descricao: divindade.descricao || "",
        crencas_e_objetivos: divindade.crencas_e_objetivos || "",
        simbolo: divindade.simbolo || "",
        energia: divindade.energia || "",
        arma_preferida: divindade.arma_preferida || "",
        devotos_racas: divindade.devotos_racas || "",
        devotos_classes: divindade.devotos_classes || "",
        poderes: parseListaTextoLivre(divindade.poderes),
        obrigacoes_restricoes: divindade.obrigacoes_restricoes || ""
    };
    ficha.divindadePoderEscolhido = poderSelecionado.nome || "";

    adicionarHabilidadeNaFicha(
        ficha,
        {
            nome: poderSelecionado.nome || "",
            descricao: poderSelecionado.descricao || "",
            custoPm: Number(poderSelecionado.custoPm) || 0,
            custoVida: Number(poderSelecionado.custoVida) || 0,
            custoPmPermanente: Number(poderSelecionado.custoPmPermanente) || 0,
            custoVidaPermanente: Number(poderSelecionado.custoVidaPermanente) || 0,
            resumoUso: poderSelecionado.resumoUso || "",
            incrementos: poderSelecionado.registroId ? getIncrementosPoderMagia(poderSelecionado.registroId) : [],
            escolhas: poderSelecionado.escolhas || [],
            registroId: poderSelecionado.id || poderSelecionado.registroId || ""
        },
        "Divindade",
        divindade.nome
    );

    ficha.efeitosAplicados.push({
        id: uid(),
        origemTipo: "Divindade",
        origemNome: divindade.nome || "",
        tipo: "divindade_escolhida",
        alvo: divindade.nome || ""
    });

    return true;
}

function abrirEscolhaDivindadeEvolucao() {
    const ficha = getFichaEvolucaoAtual();
    if (!ficha) return;
    if (normalizarTextoRegra(ficha.divindadeId || "") !== "nenhum") return;

    state.evolucao.divindadeEscolhaAberta = true;
    state.evolucao.divindadeSelecionadaId = "";
    state.evolucao.divindadePoderSelecionadoNome = "";
    render();
}

function fecharEscolhaDivindadeEvolucao() {
    state.evolucao.divindadeEscolhaAberta = false;
    state.evolucao.divindadeSelecionadaId = "";
    state.evolucao.divindadePoderSelecionadoNome = "";
    document.body.classList.remove("modal-open");
    render();
}

function selecionarDivindadeEvolucao(id) {
    state.evolucao.divindadeSelecionadaId = id || "";
    state.evolucao.divindadePoderSelecionadoNome = "";
    render();
}

function selecionarPoderDivindadeEvolucao(nome) {
    state.evolucao.divindadePoderSelecionadoNome = String(nome || "").trim();
    render();
}

function confirmarEscolhaDivindadeEvolucao() {
    const ficha = getFichaEvolucaoAtual();
    if (!ficha) return;

    if (normalizarTextoRegra(ficha.divindadeId || "") !== "nenhum") return;

    const divindade = getDivindadePorId(state.evolucao.divindadeSelecionadaId);
    if (!divindade) return;

    const poderNome = String(state.evolucao.divindadePoderSelecionadoNome || "").trim();
    if (!poderNome) return;

    const poderSelecionado = getPoderesDaDivindade(divindade).find(p =>
        normalizarTextoRegra(p.nome || "") === normalizarTextoRegra(poderNome)
    );

    if (!poderSelecionado) return;

    const ok = aplicarDivindadeNaFichaGenerica(ficha, divindade, poderSelecionado);
    if (!ok) return;

    saveFichas();
    fecharEscolhaDivindadeEvolucao();
}
function aplicarDivindadeEscolhidaDeClasseNaFicha(ficha, classe, opcao) {
    if (!ficha || !classe || !opcao) return false;

    const nomeDivindade = String(opcao.valor || opcao.nomeCurto || "").trim();
    if (!nomeDivindade) return false;

    const divindade = opcao.divindadeId
        ? (DIVINDADES_DB || []).find(d => String(d.id) === String(opcao.divindadeId))
        : getDivindadeDoBancoPorNome(nomeDivindade);

    if (!divindade) return false;

    limparDivindadeNaFichaCriacao(ficha);

    ficha.divindade = divindade.nome || "";
    ficha.divindadeId = divindade.id || "";
    ficha.divindadeDados = {
        id: divindade.id || "",
        nome: divindade.nome || "",
        descricao: divindade.descricao || "",
        crencas_e_objetivos: divindade.crencas_e_objetivos || "",
        simbolo: divindade.simbolo || "",
        energia: divindade.energia || "",
        arma_preferida: divindade.arma_preferida || "",
        devotos_racas: divindade.devotos_racas || "",
        devotos_classes: divindade.devotos_classes || "",
        poderes: parseListaTextoLivre(divindade.poderes),
        obrigacoes_restricoes: divindade.obrigacoes_restricoes || ""
    };
    ficha.divindadePoderEscolhido = "";

    ficha.efeitosAplicados.push({
        id: uid(),
        origemTipo: "Classe",
        origemNome: classe.nome,
        tipo: "divindade_escolhida",
        alvo: divindade.nome || ""
    });

    if (state?.criacao) {
        state.criacao.divindadeSelecionadaId = divindade.id || null;
        state.criacao.divindadePoderSelecionadoNome = "";
    }

    return true;
}

function selecionarDivindadeCriacao(id) {
    state.criacao.divindadeSelecionadaId = id || null;
    state.criacao.divindadePoderSelecionadoNome = "";
    render();
}

function selecionarPoderDivindadeCriacao(nome) {
    state.criacao.divindadePoderSelecionadoNome = String(nome || "").trim();
    render();
}

function getPoderesDaDivindade(divindade) {
    return parseListaTextoLivre(divindade?.poderes).map(nome => {
        const registro = getRegistroPoderPorNome(nome);

        if (registro) return registro;

        return {
            id: "",
            nome,
            descricao: "",
            preRequisitos: "",
            custoPm: 0,
            tipoRegistro: "poder"
        };
    });
}
function abrirModalDetalhesDivindade() {
    const ficha = getFichaAtual();
    if (!ficha || !ficha.divindadeDados) return;

    state.modal = "divindade";
    state.modalPayload = {};
    render();
}
function renderDivindadeModal() {
    if (state.modal !== "divindade") return "";

    const ficha = getFichaAtual();
    const d = ficha?.divindadeDados;

    if (!ficha || !d) return "";

    setTimeout(() => {
        document.body.classList.add("modal-open");
    }, 0);

    return `
    <div class="overlay" onclick="fecharModal()">
      <div class="overlay-card" onclick="event.stopPropagation()">
        <div class="overlay-header">
          <div>
            <div class="overlay-title">Divindade</div>
            <div class="overlay-subtitle">${escapeHtml(ficha.divindade || d.nome || "")}</div>
          </div>
          <button class="btn ghost" onclick="fecharModal()">Fechar</button>
        </div>

        <div class="overlay-body">
          <div class="panel">
            <div class="panel-title">Detalhes</div>
            <div class="panel-body">
              <div class="list">
                <div class="list-item">
                  <div>
                    <div class="list-item-title">Energia</div>
                    <div class="list-item-sub">${escapeHtml(d.energia || "—")}</div>
                  </div>
                </div>

                <div class="list-item">
                  <div>
                    <div class="list-item-title">Arma preferida</div>
                    <div class="list-item-sub">${escapeHtml(d.arma_preferida || "—")}</div>
                  </div>
                </div>

                <div class="list-item">
                  <div>
                    <div class="list-item-title">Obrigações e restrições</div>
                    <div class="list-item-sub" style="white-space:pre-wrap;">${escapeHtml(d.obrigacoes_restricoes || "—")}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}
function renderEscolhaDivindadeEvolucaoModal() {
    if (!state.evolucao?.divindadeEscolhaAberta) return "";

    const ficha = getFichaAtual();
    if (!ficha) return "";

    const divindades = getDivindadesPermitidasParaFicha(ficha);
    const divindade = getDivindadePorId(state.evolucao.divindadeSelecionadaId);
    const poderes = getPoderesDaDivindade(divindade);
    const poderSelecionado = String(state.evolucao.divindadePoderSelecionadoNome || "").trim();

    document.body.classList.add("modal-open");

    return `
      <div class="overlay" onclick="fecharEscolhaDivindadeEvolucao()">
        <div class="overlay-card" onclick="event.stopPropagation()">
          <div class="overlay-header">
            <div>
              <div class="overlay-title">Escolher divindade</div>
              <div class="overlay-subtitle">Seu personagem não possui divindade. Escolha uma agora.</div>
            </div>
            <button class="btn ghost" onclick="fecharEscolhaDivindadeEvolucao()">Fechar</button>
          </div>

          <div class="overlay-body">
            <div class="field">
              <label>Divindade</label>
              <select onchange="selecionarDivindadeEvolucao(this.value)">
                <option value="">Selecione...</option>
                ${divindades.map(d => `
                  <option value="${escapeAttr(d.id)}" ${divindade?.id === d.id ? "selected" : ""}>
                    ${escapeHtml(d.nome)}
                  </option>
                `).join("")}
              </select>
            </div>

            ${!divindade ? `` : `
              <div style="height:12px"></div>

              <div class="notice">
                ${escapeHtml(divindade.descricao || "")}
              </div>

              <div style="height:12px"></div>

              <div class="panel">
                <div class="panel-title">Informações da divindade</div>
                <div class="panel-body">
                  <div class="field">
                    <label>Crenças e objetivos</label>
                    <textarea rows="4" disabled>${escapeHtml(divindade.crencas_e_objetivos || "")}</textarea>
                  </div>

                  <div style="height:12px"></div>

                  <div class="row-3">
                    <div class="field">
                      <label>Símbolo</label>
                      <input value="${escapeAttr(divindade.simbolo || "")}" disabled>
                    </div>

                    <div class="field">
                      <label>Energia</label>
                      <input value="${escapeAttr(divindade.energia || "")}" disabled>
                    </div>

                    <div class="field">
                      <label>Arma preferida</label>
                      <input value="${escapeAttr(divindade.arma_preferida || "")}" disabled>
                    </div>
                  </div>

                  <div style="height:12px"></div>

                  <div class="field">
                    <label>Obrigações e restrições</label>
                    <textarea rows="4" disabled>${escapeHtml(divindade.obrigacoes_restricoes || "")}</textarea>
                  </div>
                </div>
              </div>

              <div style="height:12px"></div>

              <div class="panel">
                <div class="panel-title">Poder concedido</div>
                <div class="panel-body">
                  <div class="field">
                    <label>Poder</label>
                    <select onchange="selecionarPoderDivindadeEvolucao(this.value)">
                      <option value="">Selecione...</option>
                      ${poderes.map(p => `
                        <option value="${escapeAttr(p.nome || "")}" ${normalizarTextoRegra(poderSelecionado) === normalizarTextoRegra(p.nome || "") ? "selected" : ""}>
                          ${escapeHtml(p.nome || "")}
                        </option>
                      `).join("")}
                    </select>
                  </div>
                </div>
              </div>
            `}

            <div style="height:14px"></div>

            <div class="actions" style="justify-content:flex-end;">
              <button
                class="btn primary"
                onclick="confirmarEscolhaDivindadeEvolucao()"
                ${!divindade || !poderSelecionado ? "disabled" : ""}
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
}
function getPoderDivindadeSelecionadoCriacao() {
    const nome = String(state.criacao?.divindadePoderSelecionadoNome || "").trim();
    if (!nome) return null;

    const divindade = getDivindadeSelecionadaCriacao();
    const poderes = getPoderesDaDivindade(divindade);

    return poderes.find(p => normalizarTextoRegra(p.nome || "") === normalizarTextoRegra(nome)) || null;
}

function criacaoDevePularEtapaDivindade() {
    const ficha = getFichaCriacao();
    return !!String(ficha?.divindade || "").trim() &&
        !!String(ficha?.divindadePoderEscolhido || "").trim();
}

function limparDivindadeNaFichaCriacao(ficha) {
    limparDivindadeNaFicha(ficha);
}

function divindadeCriacaoValida() {
    sincronizarDivindadeCriacaoComFicha();

    const divindade = getDivindadeSelecionadaCriacao();
    if (!divindade) return false;

    const poderNome = String(state.criacao?.divindadePoderSelecionadoNome || "").trim();
    if (!poderNome) return false;

    const poderes = getPoderesDaDivindade(divindade);
    return poderes.some(p => normalizarTextoRegra(p.nome || "") === normalizarTextoRegra(poderNome));
}

function aplicarDivindadeNaFichaCriacao() {
    const ficha = getFichaCriacao();
    if (!ficha) return false;

    sincronizarDivindadeCriacaoComFicha();

    const divindade = getDivindadeSelecionadaCriacao();
    if (!divindade) return false;

    const poderNome = String(state.criacao?.divindadePoderSelecionadoNome || "").trim();
    if (!poderNome) return false;

    const poderes = getPoderesDaDivindade(divindade);
    const poderSelecionado = poderes.find(p =>
        normalizarTextoRegra(p.nome || "") === normalizarTextoRegra(poderNome)
    );

    if (!poderSelecionado) return false;

    return aplicarDivindadeNaFichaGenerica(ficha, divindade, poderSelecionado);
}

function adicionarItemCustomNaFicha(ficha, nome, descricao = "", quantidade = 1) {
    if (!ficha) return;

    ficha.inventario = ficha.inventario || [];
    ficha.inventario.push({
        id: uid(),
        baseId: "",
        manual: true,
        nomeManual: nome,
        descricaoManual: descricao,
        categoriaManual: "",
        quantidade: Math.max(1, Number(quantidade) || 1),
        melhorias: [],
        materialEspecialId: "",
        encantamentos: [],
        equipado: false
    });
}
function adicionarHabilidadeOrigemNaFicha(ficha, habilidade, origemNome) {
    if (!ficha || !habilidade) return;

    adicionarHabilidadeNaFicha(
        ficha,
        {
            nome: habilidade.nome || "",
            descricao: habilidade.descricao || "",
            custoPm: Number(habilidade.custoPm) || 0
        },
        "Origem",
        origemNome || ""
    );

    const adicionada = ficha.habilidades[ficha.habilidades.length - 1];
    if (adicionada) {
        adicionada.registroId = habilidade.id || "";
        adicionada.tipoRegistro = "origem_habilidade";
    }
}
function getRegistroItemPorNomeExato(nome) {
    return (ITENS_EQUIPAMENTOS_DB?.registros || []).find(r =>
        normalizarTextoRegra(r.nome || "") === normalizarTextoRegra(nome || "")
    ) || null;
}

function montarOpcaoItemOrigem(textoItem) {
    const registro = getRegistroItemPorNomeExato(textoItem);

    if (registro) {
        return {
            id: `origem_item_banco:${registro.id}`,
            tipoAplicacao: "origem_item_banco_adicionar",
            label: `Item: ${registro.nome}`,
            valor: registro.nome,
            itemBaseId: registro.id,
            descricao: registro.descricao || ""
        };
    }

    return {
        id: `origem_item_custom:${textoItem}`,
        tipoAplicacao: "origem_item_custom_adicionar",
        label: `Item: ${textoItem}`,
        valor: textoItem,
        nomeCurto: textoItem,
        descricao: "Item concedido pela origem."
    };
}

function getEscolhasOrigemDisponiveis(origem) {
    if (!origem) return [];

    const escolhasBase = Array.isArray(origem.escolhas) ? [...origem.escolhas] : [];

    // Custom e Amnésico usam o modal de inventário para itens definidos pelo mestre.
    // Não geram escolhas automáticas de item para não travar a etapa.
    if (origem.id === "custom" || origem.id === "amnesico") {
        return escolhasBase;
    }

    const itensBancoEscolha = parseListaPipe(origem.itensBancoEscolha);
    const itensCustomEscolha = parseListaPipe(origem.itensCustomEscolha);

    if (itensBancoEscolha.length) {
        escolhasBase.push({
            id: `esc_itens_banco_${origem.id}`,
            origem_id: origem.id,
            titulo: "Escolha de item",
            descricao: "Escolha um dos itens abaixo.",
            tipo: "item_origem",
            quantidade: 1,
            opcoesTexto: itensBancoEscolha.join("|")
        });
    }

    if (itensCustomEscolha.length) {
        escolhasBase.push({
            id: `esc_itens_custom_${origem.id}`,
            origem_id: origem.id,
            titulo: "Escolha de item",
            descricao: "Escolha um dos itens abaixo.",
            tipo: "item_origem",
            quantidade: 1,
            opcoesTexto: itensCustomEscolha.join("|")
        });
    }

    return escolhasBase;
}
function opcaoPericiaIndisponivelNaOrigem(opcao, ficha) {
    if (!opcao || opcao.tipoAplicacao !== "pericia_treinada" || !ficha) return false;

    const nomePericia = normalizarTextoRegra(opcao.valor || "");
    return (ficha.pericias || []).some(pericia =>
        normalizarTextoRegra(pericia.nome || "") === nomePericia &&
        !!pericia.treinada
    );
}
function aplicarOrigemNaFichaCriacao() {
    const ficha = getFichaCriacao();
    const origem = getOrigemSelecionadaCriacao();
    if (!ficha || !origem) return false;

    ficha.origem = origem.nome || "";
    ficha.origemId = origem.id || "";

    // Amnésico sempre recebe o poder único automaticamente
    if (origem.id === "amnesico") {
        (origem.habilidades || [])
            .filter(h =>
                normalizarTextoRegra(h.nome || "") === normalizarTextoRegra("Lembranças Graduais"))
            .forEach(habilidade => {
                adicionarHabilidadeOrigemNaFicha(ficha, habilidade, origem.nome);

                (ORIGENS_EFEITOS_DB || [])
                    .filter(e => String(e.habilidade_id || "") === String(habilidade.id))
                    .forEach(efeito => aplicarEfeitoNaFicha(ficha, efeito, "Origem", origem.nome));
            });
    }

        parseListaPipe(origem.itensBancoFixos).forEach(nomeItem => {
        const registro = (ITENS_EQUIPAMENTOS_DB.registros || []).find(r =>
            normalizarTextoRegra(r.nome || "") === normalizarTextoRegra(nomeItem)
        );
        if (registro) {
            adicionarItemInventarioNaFicha(ficha, registro.id);
        } else {
            adicionarItemCustomNaFicha(ficha, nomeItem, "Item concedido pela origem.");
        }
    });

    parseListaPipe(origem.itensCustomFixos).forEach(nomeItem => {
        adicionarItemCustomNaFicha(ficha, nomeItem, "Item concedido pela origem.");
    });

    const escolhas = getEscolhasOrigemDisponiveis(origem);
    for (const escolha of escolhas) {
        const selecionadas = getEscolhaOrigemValores(escolha.id);
        const quantidade = getQuantidadeEscolhaOrigem(escolha);

        if (selecionadas.length !== quantidade) return false;

        selecionadas.forEach(opcao => {
            if (opcao.tipoAplicacao === "pericia_treinada") {
                const pericia = ficha.pericias.find(p => p.nome === opcao.valor);
                if (pericia) pericia.treinada = true;

                ficha.efeitosAplicados.push({
                    id: uid(),
                    origemTipo: "Origem",
                    origemNome: origem.nome,
                    tipo: "pericia_treinada",
                    alvo: opcao.valor
                });
            }

            if (opcao.tipoAplicacao === "habilidade_adicionar") {
                const registro = getRegistroPoderMagiaPorId(opcao.registroId);
                if (registro) {
                    adicionarHabilidadeNaFicha(
                        ficha,
                        {
                            nome: registro.nome || "",
                            descricao: registro.descricao || "",
                            custoPm: Number(registro.custoPm) || 0
                        },
                        "Origem",
                        origem.nome
                    );

                    const adicionada = ficha.habilidades[ficha.habilidades.length - 1];
                    if (adicionada) adicionada.registroId = registro.id;
                }
            }
            if (opcao.tipoAplicacao === "origem_item_banco_adicionar") {
                adicionarItemInventarioNaFicha(ficha, opcao.itemBaseId);
            }

            if (opcao.tipoAplicacao === "origem_item_custom_adicionar") {
                adicionarItemCustomNaFicha(ficha, opcao.valor, "Item escolhido da origem.");
            }

            if (opcao.tipoAplicacao === "origem_habilidade_adicionar") {
                if (origem.id === "amnesico") return;
                const habilidade = (origem.habilidades || []).find(h => String(h.id) === String(opcao.habilidadeOrigemId))
                    || (ORIGENS_HABILIDADES_DB || []).find(h => String(h.id) === String(opcao.habilidadeOrigemId));

                if (habilidade) {
                    adicionarHabilidadeOrigemNaFicha(ficha, habilidade, origem.nome);

                    (ORIGENS_EFEITOS_DB || [])
                        .filter(e => String(e.habilidade_id || "") === String(habilidade.id))
                        .forEach(efeito => aplicarEfeitoNaFicha(ficha, efeito, "Origem", origem.nome));
                }
            }

            if (opcao.tipoAplicacao === "origem_habilidade_custom_manual") {
                adicionarHabilidadeNaFicha(
                    ficha,
                    {
                        nome: "Poder único personalizado",
                        descricao: "Não aplica efeitos na ficha, use-os na hora de jogar.",
                        custoPm: 0
                    },
                    "Origem",
                    origem.nome
                );
            }
        });
    }
    ficha.escolhasOrigemResolvidas = Object.entries(state.criacao.origemEscolhas || {}).map(([escolhaId, opcoes]) => ({
        escolhaId,
        opcoes: (opcoes || []).map(op => ({ ...op }))
    }));

    return true;
}
function origemCriacaoValida() {
    const origem = getOrigemSelecionadaCriacao();
    if (!origem) return false;

    const escolhas = getEscolhasOrigemDisponiveis(origem);
    return escolhas.every(escolha => {
        const valores = getEscolhaOrigemValores(escolha.id);
        const quantidade = getQuantidadeEscolhaOrigem(escolha);

        return valores.length === quantidade;
    });
}
function renderEscolhaOrigemCriacaoModal() {
    const f = getFichaCriacao();
    const origem = getOrigemSelecionadaCriacao();
    const escolhaId = state.criacao.escolhaOrigemAbertaId;

    if (!f || !origem || !escolhaId) return "";

    const escolha = getEscolhasOrigemDisponiveis(origem).find(e => e.id === escolhaId);
    if (!escolha) return "";

    const opcoes = getOpcoesEscolhaOrigem(escolha, f);
    const selecionados = getEscolhaOrigemValores(escolha.id);
    const quantidade = getQuantidadeEscolhaOrigem(escolha);

    document.body.classList.add("modal-open");

    return `
      <div class="overlay" onclick="fecharEscolhaOrigemCriacao()">
        <div class="overlay-card" onclick="event.stopPropagation()">
          <div class="overlay-header">
            <div>
              <div class="overlay-title">${escapeHtml(escolha.titulo || "Escolha de origem")}</div>
              <div class="overlay-subtitle">${escapeHtml(escolha.descricao || "")}</div>
            </div>
            <button class="btn ghost" onclick="fecharEscolhaOrigemCriacao()">Fechar</button>
          </div>

          <div class="overlay-body">
            <div class="notice">
              Selecionados: <strong>${selecionados.length} / ${quantidade}</strong>
            </div>

            <div style="height:12px"></div>

            <div class="list">
              ${opcoes.map(opcao => {
            const checked = selecionados.some(item => item.id === opcao.id);
            const indisponivel = opcaoPericiaIndisponivelNaOrigem(opcao, f);
            const disabled = !checked && (indisponivel || selecionados.length >= quantidade);

        return `
                    <div class="list-item" style="align-items:flex-start; gap:12px; ${disabled ? "opacity:.65;" : ""}">
                      <div style="flex:1;">
                        <div class="list-item-title">${escapeHtml(getTituloOpcaoEscolha(opcao))}</div>
                        ${opcao.descricao ? `<div class="list-item-sub">${escapeHtml(opcao.descricao)}</div>` : ``}
                        ${indisponivel ? `<div class="list-item-sub">Você já é treinado nesta perícia.</div>` : ``}
                      </div>

                      <input
                        type="checkbox"
                        ${checked ? "checked" : ""}
                        ${disabled ? "disabled" : ""}
                        onchange='toggleEscolhaOrigemValor("${escolha.id}", ${JSON.stringify(opcao).replace(/'/g, "&apos;")}, ${quantidade})'
                      >
                    </div>
                  `;
    }).join("")}
            </div>
          </div>
        </div>
      </div>
    `;
}
function renderEscolhaClasseCriacaoModal() {
    const f = getFichaCriacao();
    const classe = getClasseEvolucaoAtualCriacao() || getClasseSelecionadaCriacao();
    const escolhaId = state.criacao.escolhaClasseAbertaId;

    if (!f || !classe || !escolhaId) return "";

    const ctx = state.criacao.classeEvolucaoContexto;
    const nivelAlvo = ctx?.nivelAlvo || 1;
    const primeiraClasse = !!ctx?.primeiraClasse;

    const escolha = getEscolhasClasseDisponiveisNoNivel(classe, nivelAlvo, primeiraClasse, f)
        .find(e => e.id === escolhaId);

    if (!escolha) return "";

    const selecionados = getEscolhaClasseValores(escolha.id);
    const quantidade = Number(escolha.quantidade) || 0;
    const opcoesBase = getOpcoesEscolha(escolha, f);

    const opcoes = ordenarOpcoesParaExibicao(opcoesBase, (opcao) => {
        const checked = selecionados.some(item => item.id === opcao.id);
        const desbloqueada = escolhaClasseDesbloqueada(escolha);
        return checked || (desbloqueada && podeSelecionarOpcaoClasse(escolha, opcao));
    });

    setTimeout(() => {
        document.body.classList.add("modal-open");
    }, 0);

    return `
    <div class="overlay" onclick="fecharEscolhaClasseCriacao()">
      <div class="overlay-card" onclick="event.stopPropagation()">
        <div class="overlay-header">
          <div>
            <div class="overlay-title">${escapeHtml(escolha.titulo || "Escolha")}</div>
            <div class="subtitle">
              ${escapeHtml(escolha.descricao || "")}
              ${escolha.descricao ? " • " : ""}
              Selecionados: ${selecionados.length} / ${quantidade}
            </div>
          </div>
          <button class="btn ghost" onclick="fecharEscolhaClasseCriacao()">Fechar</button>
        </div>

        <div class="overlay-body">
          <div class="list">
            ${opcoes.map(opcao => {
                const checked = selecionados.some(item => item.id === opcao.id);
                const desbloqueada = escolhaClasseDesbloqueada(escolha);
                const disabled = !checked && (!desbloqueada || !podeSelecionarOpcaoClasse(escolha, opcao));
                const expandida = opcaoEscolhaEstaExpandida("classe", escolha.id, opcao.id);
                const titulo = getTituloOpcaoEscolha(opcao);
                const descricao = String(opcao.descricao || "").trim();
                const preReqFaltando = getPreRequisitoNaoAtendidoOpcao(opcao, f);

                return `
        <div class="list-item" style="align-items:flex-start; gap:12px; ${disabled ? "opacity:.65;" : ""}">
            <button
                type="button"
                class="btn ghost"
                style="flex:1; text-align:left; justify-content:flex-start; padding:0; background:none; border:none;"
                onclick="toggleExpansaoOpcaoEscolha('classe', '${escolha.id}', '${opcao.id}')"
            >
                <div style="display:flex; align-items:flex-start; justify-content:space-between; gap:10px; width:100%;">
                    <div style="flex:1;">
                        <div class="list-item-title">${escapeHtml(titulo)}</div>
                        ${preReqFaltando ? `<div class="list-item-sub">Pré-requisito: ${escapeHtml(preReqFaltando)}</div>` : ``}
                        ${expandida && descricao ? `<div class="muted" style="margin-top:8px; white-space:normal; line-height:1.45;">${escapeHtml(descricao)}</div>` : ``}
                    </div>
                    <div class="muted" style="font-size:12px; padding-top:2px;">${expandida ? "▲" : "▼"}</div>
                </div>
            </button>

            <input
                class="choice-checkbox"
                type="checkbox"
                ${checked ? "checked" : ""}
                ${disabled ? "disabled" : ""}
                onclick="event.stopPropagation()"
                onchange='toggleEscolhaClasseValor("${escolha.id}", ${JSON.stringify(opcao).replace(/'/g, "&apos;")}, ${quantidade})'
            >
        </div>
    `;
            }).join("")}
          </div>
        </div>
      </div>
    </div>
  `;
}
function renderEscolhaClasseEvolucaoModal() {
    const f = getFichaEvolucaoAtual();
    const classe = getClasseEvolucaoAtualFicha();
    const escolhaId = state.evolucao.escolhaClasseAbertaId;

    if (!f || !classe || !escolhaId) return "";

    const ctx = state.evolucao.classeEvolucaoContexto;
    const nivelAlvo = ctx?.nivelAlvo || 1;
    const primeiraClasse = !!ctx?.primeiraClasse;

    const escolha = getEscolhasClasseDisponiveisNoNivel(classe, nivelAlvo, primeiraClasse, f)
        .find(e => e.id === escolhaId);

    if (!escolha) return "";

    const selecionados = getEscolhaClasseValoresEvolucao(escolha.id);
    const quantidade = Number(escolha.quantidade) || 0;
    const opcoesBase = getOpcoesEscolha(escolha, f);

    const opcoes = ordenarOpcoesParaExibicao(opcoesBase, (opcao) => {
        const checked = selecionados.some(item => item.id === opcao.id);
        const desbloqueada = escolhaClasseDesbloqueada(escolha);
        return checked || (desbloqueada && podeSelecionarOpcaoClasseEvolucao(escolha, opcao));
    });

    setTimeout(() => {
        document.body.classList.add("modal-open");
    }, 0);

    return `
    <div class="overlay" onclick="fecharEscolhaClasseEvolucao()">
      <div class="overlay-card" onclick="event.stopPropagation()">
        <div class="overlay-header">
          <div>
            <div class="overlay-title">${escapeHtml(escolha.titulo || "Escolha")}</div>
            <div class="subtitle">
              ${escapeHtml(escolha.descricao || "")}
              ${escolha.descricao ? " • " : ""}
              Selecionados: ${selecionados.length} / ${quantidade}
            </div>
          </div>
          <button class="btn ghost" onclick="fecharEscolhaClasseEvolucao()">Fechar</button>
        </div>

        <div class="overlay-body">
          <div class="list">
            ${opcoes.map(opcao => {
        const checked = selecionados.some(item => item.id === opcao.id);
        const desbloqueada = escolhaClasseDesbloqueada(escolha);
        const disabled = !checked && (!desbloqueada || !podeSelecionarOpcaoClasseEvolucao(escolha, opcao));
        const expandida = opcaoEscolhaEstaExpandida("classe", escolha.id, opcao.id);
        const titulo = getTituloOpcaoEscolha(opcao);
        const descricao = String(opcao.descricao || "").trim();
        const preReqFaltando = getPreRequisitoNaoAtendidoOpcao(opcao, f);

        return `
        <div class="list-item" style="align-items:flex-start; gap:12px; ${disabled ? "opacity:.65;" : ""}">
            <button
                type="button"
                class="btn ghost"
                style="flex:1; text-align:left; justify-content:flex-start; padding:0; background:none; border:none;"
                onclick="toggleExpansaoOpcaoEscolha('classe', '${escolha.id}', '${opcao.id}')"
            >
                <div style="display:flex; align-items:flex-start; justify-content:space-between; gap:10px; width:100%;">
                    <div style="flex:1;">
                        <div class="list-item-title">${escapeHtml(titulo)}</div>
                        ${preReqFaltando ? `<div class="list-item-sub">Pré-requisito: ${escapeHtml(preReqFaltando)}</div>` : ``}
                        ${expandida && descricao ? `<div class="muted" style="margin-top:8px; white-space:normal; line-height:1.45;">${escapeHtml(descricao)}</div>` : ``}
                    </div>
                    <div class="muted" style="font-size:12px; padding-top:2px;">${expandida ? "▲" : "▼"}</div>
                </div>
            </button>

            <input
                class="choice-checkbox"
                type="checkbox"
                ${checked ? "checked" : ""}
                ${disabled ? "disabled" : ""}
                onclick="event.stopPropagation()"
                onchange='toggleEscolhaClasseValorEvolucao("${escolha.id}", ${JSON.stringify(opcao).replace(/'/g, "&apos;")}, ${quantidade})'
            >
        </div>
    `;
    }).join("")}
          </div>
        </div>
      </div>
    </div>
  `;
}
function aplicarEscolhasClasseNaFicha(ficha, classe) {
    const escolhas = classe?.escolhas || [];
    if (!escolhas.length) return true;

    for (const escolha of escolhas) {
        const selecionadas = getEscolhaClasseValores(escolha.id);
        const quantidade = Number(escolha.quantidade) || 0;

        if (selecionadas.length !== quantidade) return false;

        selecionadas.forEach(opcao => {
            if (opcao.tipoAplicacao === "pericia_treinada") {
                const pericia = ficha.pericias.find(p => p.nome === opcao.valor);
                if (pericia) pericia.treinada = true;

                ficha.efeitosAplicados.push({
                    id: uid(),
                    origemTipo: "Classe",
                    origemNome: classe.nome,
                    tipo: "pericia_treinada",
                    alvo: opcao.valor
                });
            }

            if (opcao.tipoAplicacao === "magia_adicionar") {
                adicionarOuAtualizarMagiaNaFicha(
                    ficha,
                    {
                        registroId: opcao.registroId || "",
                        nome: opcao.valor || "",
                        nomeAdicionado: opcao.nomeAdicionado || ""
                    },
                    "Classe",
                    classe.nome
                );

                ficha.efeitosAplicados.push({
                    id: uid(),
                    origemTipo: "Classe",
                    origemNome: classe.nome,
                    tipo: "magia_adicionar",
                    alvo: opcao.valor
                });
            }
           
            if (opcao.tipoAplicacao === "grupo_escolha") {
                if (opcao.ehDivindade) {
                    aplicarDivindadeEscolhidaDeClasseNaFicha(ficha, classe, opcao);
                }
                if (opcao.ehAumentoAtributo) {
                    const ok = aplicarAumentoDeAtributoNaFicha(ficha, opcao.valor);

                    if (ok) {
                        ficha.efeitosAplicados.push({
                            id: uid(),
                            origemTipo: "Classe",
                            origemNome: classe.nome,
                            tipo: "aumento_atributo",
                            alvo: opcao.valor
                        });
                    }
                }
                if (classe.id === "arcanista") {
                    const caminho = getCaminhoClassePorNome(classe.id, opcao.valor);

                    ficha.arcanistaCaminho = opcao.valor || "";

                    if (caminho) {
                        const jaTem = (ficha.habilidades || []).some(h =>
                            normalizarTextoRegra(h.nome) === normalizarTextoRegra(caminho.nome)
                        );

                        if (!jaTem) {
                            adicionarHabilidadeNaFicha(
                                ficha,
                                {
                                    nome: caminho.nome,
                                    descricao: caminho.descricao || "",
                                    custoPm: 0,
                                    custoVida: 0,
                                    custoPmPermanente: 0,
                                    custoVidaPermanente: 0,
                                    resumoUso: "",
                                    incrementos: [],
                                    escolhas: []
                                },
                                "Classe",
                                classe.nome
                            );
                        }
                    }

                    ficha.efeitosAplicados.push({
                        id: uid(),
                        origemTipo: "Classe",
                        origemNome: classe.nome,
                        tipo: "caminho_arcanista",
                        alvo: opcao.valor
                    });
                }
            }

            if (opcao.tipoAplicacao === "habilidade_adicionar") {
                let registroHabilidade = null;

                if (opcao.registroId) {
                    registroHabilidade = getRegistroPoderMagiaPorId(opcao.registroId);

                    if (!registroHabilidade) {
                        registroHabilidade = getPoderClassePorId(classe.id, opcao.registroId);
                    }
                }

                const nomeHabilidade =
                    opcao.nomeCurto ||
                    registroHabilidade?.nome ||
                    opcao.valor ||
                    "";
                const ehEmpatiaSelvagem = normalizarNomeHabilidade(nomeHabilidade) === "empatia selvagem";
                const temEmpatiaRacial = fichaTemHabilidadeComOrigem(ficha, "Empatia Selvagem", "Raça");

                if (ehEmpatiaSelvagem && temEmpatiaRacial) {
                    aplicarBonusEmpatiaSelvagemDahllan(ficha, "Classe", classe.nome);
                } else {
                    adicionarHabilidadeNaFicha(
                        ficha,
                        {
                            nome: nomeHabilidade,
                            descricao: registroHabilidade?.descricao || `Escolhido na evolução da classe ${classe.nome}.`,
                            custoPm: Number(registroHabilidade?.custoPm) || 0,
                            custoVida: Number(registroHabilidade?.custoVida) || 0,
                            custoPmPermanente: Number(registroHabilidade?.custoPmPermanente) || 0,
                            custoVidaPermanente: Number(registroHabilidade?.custoVidaPermanente) || 0,
                            resumoUso: registroHabilidade?.resumoUso || "",
                            registroId: registroHabilidade?.id || "",
                            ativavel: Number(registroHabilidade?.custoPm) > 0 || Number(registroHabilidade?.custoVida) > 0,
                            permiteIntensificar: Array.isArray(registroHabilidade?.incrementos) && registroHabilidade.incrementos.length > 0,
                            incrementos: registroHabilidade?.incrementos || [],
                            escolhas: registroHabilidade?.escolhas || []
                        },
                        "Classe",
                        classe.nome
                    );
                }

                ficha.efeitosAplicados.push({
                    id: uid(),
                    origemTipo: "Classe",
                    origemNome: classe.nome,
                    tipo: "habilidade_adicionar",
                    alvo: nomeHabilidade
                });
                if (opcao.ehAumentoAtributo && opcao.atributoEscolhido) {
                    const ok = aplicarAumentoDeAtributoNaFicha(ficha, opcao.atributoEscolhido);

                    if (ok) {
                        ficha.efeitosAplicados.push({
                            id: uid(),
                            origemTipo: "Classe",
                            origemNome: classe.nome,
                            tipo: "aumento_atributo",
                            alvo: opcao.atributoEscolhido
                        });
                    }
                }
            }

            if (opcao.tipoAplicacao === "proficiencia_adicionar") {
                adicionarProficienciaNaFicha(ficha, opcao.valor);
            }
        });
    }

    return true;
}

function aplicarClasseNaFichaCriacao() {
    const ficha = getFichaCriacao();
    const classe = getClasseSelecionadaCriacao();
    if (!ficha || !classe) return false;

    if (!ficha.classesPersonagem) {
        ficha.classesPersonagem = [];
    }

    const classeExistente = ficha.classesPersonagem.find(c => c.classeId === classe.id);

    if (!classeExistente) {
        ficha.classesPersonagem = [
            {
                classeId: classe.id,
                nome: classe.nome || "",
                niveis: 1,
                primeiraClasse: true
            }
        ];
    } else {
        classeExistente.niveis = 1;
    }

    atualizarNivelTotalFicha(ficha);
    reaplicarProgressaoClasses(ficha);

    const escolhasOk = aplicarEscolhasClasseNaFicha(ficha, classe);
    if (!escolhasOk) return false;

    return true;
}

function renderConteudoEtapaCriacao() {
  const f = getFichaCriacao();
  if (!f) return "";

    const etapa = state.criacao.etapa;    

  if (etapa === 0) {
    return `
      <div class="panel">
        <div class="panel-title">Identidade</div>
        <div class="panel-body">
          <div class="row-2">
            <div class="field">
              <label>Nome do personagem</label>
              <input value="${escapeAttr(f.nome)}" onchange="updateFichaCriacao('nome', this.value)">
            </div>

            <div class="field">
              <label>Nome do jogador</label>
              <input value="${escapeAttr(f.jogador)}" onchange="updateFichaCriacao('jogador', this.value)">
            </div>
          </div>
        </div>
      </div>
    `;
  }

  if (etapa === 1) {
    return `
      <div class="panel">
        <div class="panel-title">Atributos</div>
        <div class="panel-body">
          <div class="notice">
            Pontos disponíveis: <strong>${f.pontosAtributoAtuais}</strong>
            <button class="btn small" onclick="adicionarPontoAtributoCriacao()" style="margin-left:10px;">+1 ponto</button>
          </div>

          <div style="height:14px"></div>

          <div class="row-6">
  ${renderAtributoCriacao("For", "forca", getAtributoBase(f, "forca"))}
  ${renderAtributoCriacao("Des", "destreza", getAtributoBase(f, "destreza"))}
  ${renderAtributoCriacao("Con", "constituicao", getAtributoBase(f, "constituicao"))}
  ${renderAtributoCriacao("Int", "inteligencia", getAtributoBase(f, "inteligencia"))}
  ${renderAtributoCriacao("Sab", "sabedoria", getAtributoBase(f, "sabedoria"))}
  ${renderAtributoCriacao("Car", "carisma", getAtributoBase(f, "carisma"))}
</div>
        </div>
      </div>
    `;
  }

    if (etapa === 2) {
        const raca = getRacaSelecionadaCriacao();
        const escolhasRaciaisDisponiveis = getEscolhasRaciaisDisponiveis(raca, f);

        return `
    <div class="panel">
      <div class="panel-title">Raça</div>
      <div class="panel-body">
        <div class="field">
          <label>Escolha a raça</label>
          <select onchange="selecionarRacaCriacao(this.value)">
            <option value="">Selecione...</option>
            ${RACAS_DB.map(r => `
              <option value="${r.id}" ${state.criacao.racaSelecionadaId === r.id ? "selected" : ""}>
                ${escapeHtml(r.nome)}
              </option>
            `).join("")}
            <option value="custom" ${state.criacao.racaSelecionadaId === "custom" ? "selected" : ""}>
              Custom
            </option>
          </select>
        </div>
      </div>
    </div>

    ${!raca
                ? `<div style="margin-top:14px;" class="panel"><div class="panel-body"><div class="empty">Nenhuma raça selecionada.</div></div></div>`
                : `
          <div style="height:14px"></div>

          <div class="panel">
            <div class="panel-title">Prévia da raça</div>
            <div class="panel-body">
              <div class="row-3">
                <div class="field">
                  <label>Raça</label>
                  <input value="${escapeAttr(raca.nome || "")}" disabled>
                </div>

                <div class="field">
                  <label>Tamanho</label>
                  ${raca.id === "custom"
                    ? `<input value="${escapeAttr(raca.tamanho || "")}" oninput="updateRacaCustom('tamanho', this.value)">`
                    : `<input value="${escapeAttr(raca.tamanho || "")}" disabled>`
                }
                </div>

                <div class="field">
                  <label>Deslocamento</label>
                  ${raca.id === "custom"
                    ? `<input value="${escapeAttr(raca.deslocamento || "")}" oninput="updateRacaCustom('deslocamento', this.value)">`
                    : `<input value="${escapeAttr(raca.deslocamento || "")}" disabled>`
                }
                </div>
              </div>
            </div>
          </div>

          <div style="height:14px"></div>

          <div class="panel">
            <div class="panel-title">Atributos raciais</div>
            <div class="panel-body">
              ${raca.tipoAtributo === "fixo"
                    ? `
                    <div class="list">
                      ${[
                        ["forca", "Força"],
                        ["destreza", "Destreza"],
                        ["constituicao", "Constituição"],
                        ["inteligencia", "Inteligência"],
                        ["sabedoria", "Sabedoria"],
                        ["carisma", "Carisma"]
                    ].map(([attr, nome]) => `
                        <div class="list-item">
                          <div class="list-item-title">${nome}</div>
                          <div>${Number(raca.atributosFixos?.[attr]) || 0}</div>
                        </div>
                      `).join("")}
                    </div>
                  `
                : racaUsaDistribuicaoLivre(raca)
                    ? `
      <div class="notice">
        Escolha 3 atributos diferentes para receber +1.
        ${getAtributosBloqueadosDistribuicaoRacial(raca).length
                        ? `<br>Atributos bloqueados: <strong>${getAtributosBloqueadosDistribuicaoRacial(raca)
                            .map(attr => ({
                                forca: "Força",
                                destreza: "Destreza",
                                constituicao: "Constituição",
                                inteligencia: "Inteligência",
                                sabedoria: "Sabedoria",
                                carisma: "Carisma"
                            }[attr] || attr))
                            .join(", ")}</strong>`
                        : ""
                    }
        <br>
        Selecionados: <strong>${state.criacao.racaDistribuicao.length} / 3</strong>
      </div>

      <div style="height:12px"></div>

      <div class="list">
        ${[
                        ["forca", "Força"],
                        ["destreza", "Destreza"],
                        ["constituicao", "Constituição"],
                        ["inteligencia", "Inteligência"],
                        ["sabedoria", "Sabedoria"],
                        ["carisma", "Carisma"]
                    ].map(([attr, nome]) => {
                        const bloqueado = !atributoPermitidoNaDistribuicaoRacial(raca, attr);
                        const selecionado = state.criacao.racaDistribuicao.includes(attr);
                        const limiteAtingido = !selecionado && state.criacao.racaDistribuicao.length >= 3;

                        return `
              <label class="list-item" style="cursor:${bloqueado ? "not-allowed" : "pointer"}; opacity:${bloqueado ? "0.55" : "1"};">
                <div>
                  <div class="list-item-title">${nome}</div>
                  ${bloqueado ? `<div class="muted" style="font-size:12px;">Indisponível para esta raça</div>` : ``}
                </div>
                <input
                  type="checkbox"
                  ${selecionado ? "checked" : ""}
                  ${(bloqueado || limiteAtingido) ? "disabled" : ""}
                  onchange="toggleAtributoDistribuicaoRacial('${attr}')"
                >
              </label>
            `;
                    }).join("")}
      </div>
    `
                        : `
                      <div class="row-3">
                        ${[
                            ["forca", "Força"],
                            ["destreza", "Destreza"],
                            ["constituicao", "Constituição"],
                            ["inteligencia", "Inteligência"],
                            ["sabedoria", "Sabedoria"],
                            ["carisma", "Carisma"]
                        ].map(([attr, nome]) => `
                          <div class="field">
                            <label>${nome}</label>
                            <input
                              type="number"
                              value="${escapeAttr(raca.atributosFixos?.[attr] || 0)}"
                              oninput="updateRacaCustomAtributo('${attr}', this.value)"
                            >
                          </div>
                        `).join("")}
                      </div>
                    `
                }
            </div>
          </div>

          <div style="height:14px"></div>

          <div class="panel">
            <div class="panel-title">Habilidades raciais</div>
            <div class="panel-body">
              ${raca.id === "custom"
                    ? `
                    <div class="field">
                      <label>Habilidades (uma por linha)</label>
                      <textarea oninput="updateRacaCustom('habilidadesTexto', this.value)">${escapeHtml(state.criacao.racaCustom.habilidadesTexto || "")}</textarea>
                    </div>
                  `
                    : `
                    ${(raca.habilidades || []).length === 0
                        ? `<div class="empty">Sem habilidades cadastradas.</div>`
                        : `
                          <div class="list">
                            ${(raca.habilidades || []).map(h => `
                              <div class="list-item">
                                <div>
                                  <div class="list-item-title">${escapeHtml(h.nome || "Habilidade")}</div>
                                  <div class="list-item-sub">${escapeHtml(h.descricao || "")}</div>
                                </div>
                              </div>
                            `).join("")}
                          </div>
                        `
                    }
                  `
                }
            </div>
          
          </div>

          <div style="height:14px"></div>

          <div class="panel">
  <div class="panel-title">Escolhas exigidas</div>
  <div class="panel-body">
    ${!escolhasRaciaisDisponiveis.length
                ? `<div class="empty">Sem escolhas cadastradas.</div>`
                : `
        <div class="list">
          ${escolhasRaciaisDisponiveis.map(escolha => {
                    const selecionados = getEscolhaRacialValores(escolha.id);
                    const quantidade = Number(escolha.quantidade) || 0;
                    const preenchida = selecionados.length === quantidade;
                    const desbloqueada = escolhaRacialDesbloqueada(escolha);

                    return `
<div class="list-item">
  <div>
    <div class="list-item-title">${escapeHtml(escolha.titulo || escolha.tipo || "Escolha")}</div>
    <div class="list-item-sub">
      ${escapeHtml(escolha.descricao || "")}
      ${escolha.descricao ? "<br>" : ""}
      Selecionados: ${selecionados.length} / ${quantidade}
    </div>
  </div>

  <div class="actions">
    <button class="btn" onclick="abrirEscolhaCriacao('${escolha.id}')" ${!desbloqueada ? "disabled" : ""}>
      Escolher
    </button>
    <span style="font-weight:bold; color:${!desbloqueada ? "#9a6a00" : preenchida ? "#1d6f3a" : "#b00020"};">
      ${!desbloqueada ? "Pendente" : preenchida ? "Completo" : "Pendente"}
    </span>
  </div>
</div>
`;
                }).join("")}
          </div>
      `}
  </div>
</div>
        `
            }
  `;
    }

    if (etapa === 3) {
        const ficha = getFichaCriacao();
        const classeSelecionada = getClasseSelecionadaCriacao();
        const classeEmResolucao = getClasseEvolucaoAtualCriacao();
        const ctx = state.criacao.classeEvolucaoContexto;

        if (!state.criacao.fluxoClasseAtivo) {
            return `
      <div class="panel">
        <div class="panel-title">Classe inicial</div>
        <div class="panel-body">
          <div class="field">
            <label>Escolha a primeira classe</label>
            <select onchange="selecionarClasseCriacao(this.value)">
              <option value="">Selecione...</option>
              ${CLASSES_DB.map(c => `
                <option value="${c.id}" ${state.criacao.classeSelecionadaId === c.id ? "selected" : ""}>
                  ${escapeHtml(c.nome)}
                </option>
              `).join("")}
            </select>
          </div>

          ${!classeSelecionada
                    ? `<div style="margin-top:14px;" class="empty">Nenhuma classe selecionada.</div>`
                    : `
                <div style="height:14px"></div>

                <div class="panel">
                  <div class="panel-title">Prévia da classe</div>
                  <div class="panel-body">
                    <div class="row-3">
                      <div class="field">
                        <label>Classe</label>
                        <input value="${escapeAttr(classeSelecionada.nome || "")}" disabled>
                      </div>
                      <div class="field">
                        <label>PV no nível 1</label>
                        <input value="${escapeAttr(classeSelecionada.pvNivel1 || 0)}" disabled>
                      </div>
                      <div class="field">
                        <label>PM por nível</label>
                        <input value="${escapeAttr(classeSelecionada.pmPorNivel || 0)}" disabled>
                      </div>
                    </div>

                    <div style="height:14px"></div>

                    <div class="panel">
                      <div class="panel-title">Descrição</div>
                      <div class="panel-body">
                        ${classeSelecionada.descricao ? escapeHtml(classeSelecionada.descricao) : `<span class="empty">Sem descrição.</span>`}
                      </div>
                    </div>
                  </div>
                </div>

                <div style="height:14px"></div>

                <div class="actions">
                  <button class="btn primary" onclick="iniciarFluxoClasseCriacao()">Prosseguir para evolução</button>
                </div>
              `
                }
        </div>
      </div>
    `;
        }

        if (!ctx || !classeEmResolucao) {
            return `
      <div class="panel">
        <div class="panel-title">Evolução de classes</div>
        <div class="panel-body">
          <div class="notice">
            Classes atuais: <strong>${escapeHtml(formatarClassesPersonagem(ficha))}</strong><br>
            Nível total: <strong>${getNivelTotalPersonagem(ficha)}</strong>
          </div>

          <div style="height:14px"></div>

          <div class="field">
            <label>Escolha a classe para o próximo nível</label>
            <select onchange="state.criacao.classeSelecaoEvolucaoId = this.value">
              <option value="">Selecione...</option>
              ${CLASSES_DB.map(c => `
                <option value="${c.id}" ${state.criacao.classeSelecaoEvolucaoId === c.id ? "selected" : ""}>
                  ${escapeHtml(c.nome)}
                </option>
              `).join("")}
            </select>
          </div>

          <div style="height:14px"></div>

          <div class="actions">
            <button class="btn primary" onclick="prepararNivelClasseCriacao(state.criacao.classeSelecaoEvolucaoId)" ${!state.criacao.classeSelecaoEvolucaoId ? "disabled" : ""}>
              Abrir próximo nível
            </button>
          </div>
        </div>
      </div>
    `;
        }

        const escolhasDoNivel = getEscolhasClasseDisponiveisNoNivel(classeEmResolucao, ctx.nivelAlvo, ctx.primeiraClasse);
        const efeitosDoNivel = (classeEmResolucao.efeitos || []).filter(e => {
            const nivelMinimo = Number(e.nivelMinimo) || 1;
            if (nivelMinimo !== ctx.nivelAlvo) return false;
            if (e.somentePrimeiraClasse && !ctx.primeiraClasse) return false;
            return true;
        });

        const habilidadesDoNivel = (classeEmResolucao.habilidades || []).filter(h => {
            const nivelMinimo = Number(h.nivelMinimo) || 1;
            return nivelMinimo === ctx.nivelAlvo;
        });

        return `
    <div class="panel">
      <div class="panel-title">Evolução de classe</div>
      <div class="panel-body">
        <div class="notice">
          Resumo atual: <strong>${escapeHtml(formatarClassesPersonagem(ficha))}</strong><br>
          Nível total atual: <strong>${getNivelTotalPersonagem(ficha)}</strong>
        </div>

        <div style="height:14px"></div>

        <div class="row-3">
          <div class="field">
            <label>Classe</label>
            <input value="${escapeAttr(classeEmResolucao.nome)}" disabled>
          </div>
          <div class="field">
            <label>Nível da classe que será alcançado</label>
            <input value="${escapeAttr(ctx.nivelAlvo)}" disabled>
          </div>
          <div class="field">
            <label>Primeira classe?</label>
            <input value="${ctx.primeiraClasse ? "Sim" : "Não"}" disabled>
          </div>
        </div>
      </div>
    </div>

    <div style="height:14px"></div>

    <div class="panel">
      <div class="panel-title">Ganho automático deste nível</div>
      <div class="panel-body">
        <div class="list">
          ${ctx.nivelAlvo === 1 && ctx.primeiraClasse
                ? `<div class="list-item"><div class="list-item-title">PV no nível 1</div><div>${classeEmResolucao.pvNivel1 || 0}</div></div>`
                : ""
            }
          <div class="list-item"><div class="list-item-title">PV por nível</div><div>${classeEmResolucao.pvPorNivel || 0}</div></div>
          <div class="list-item"><div class="list-item-title">PM por nível</div><div>${classeEmResolucao.pmPorNivel || 0}</div></div>
        </div>
      </div>
    </div>

    <div style="height:14px"></div>

    <div class="panel">
      <div class="panel-title">Habilidades deste nível</div>
      <div class="panel-body">
        ${!habilidadesDoNivel.length
                ? `<div class="empty">Sem habilidades novas neste nível.</div>`
                : `
              <div class="list">
                ${habilidadesDoNivel.map(h => `
                  <div class="list-item">
                    <div>
                      <div class="list-item-title">${escapeHtml(h.nome || "Habilidade")}</div>
                      <div class="list-item-sub">${escapeHtml(h.descricao || "")}</div>
                    </div>
                  </div>
                `).join("")}
              </div>
            `
            }
      </div>
    </div>

    <div style="height:14px"></div>

    <div class="panel">
      <div class="panel-title">Efeitos automáticos deste nível</div>
      <div class="panel-body">
        ${!efeitosDoNivel.filter(e => efeitoDeveAparecerNaPrevia("classe", e)).length
                ? `<div class="empty">Sem efeitos automáticos visíveis neste nível.</div>`
                : `
              <div class="list">
                ${efeitosDoNivel
                    .filter(e => efeitoDeveAparecerNaPrevia("classe", e))
                    .map(e => `
                    <div class="list-item">
                      <div>
                        <div class="list-item-title">${escapeHtml(traduzirTipoEfeito(e.tipo || "efeito"))}</div>
                        <div class="list-item-sub">${escapeHtml(descreverEfeitoParaJogador(e))}</div>
                      </div>
                    </div>
                  `).join("")}
              </div>
            `
            }
      </div>
    </div>

    <div style="height:14px"></div>

    <div class="panel">
      <div class="panel-title">Escolhas deste nível</div>
      <div class="panel-body">
        ${!escolhasDoNivel.length
                ? `<div class="empty">Sem escolhas obrigatórias neste nível.</div>`
                : `
              <div class="list">
                ${escolhasDoNivel.map(escolha => {
                    const selecionados = getEscolhaClasseValores(escolha.id);
                    const quantidade = Number(escolha.quantidade) || 0;
                    const preenchida = selecionados.length === quantidade;
                    const desbloqueada = escolhaClasseDesbloqueada(escolha);

                    return `
                    <div class="list-item">
                      <div>
                        <div class="list-item-title">${escapeHtml(escolha.titulo || escolha.tipo || "Escolha")}</div>
                        <div class="list-item-sub">
                          ${escapeHtml(escolha.descricao || "")}
                          ${escolha.descricao ? "<br>" : ""}
                          Selecionados: ${selecionados.length} / ${quantidade}
                        </div>
                      </div>

                      <div class="actions">
                        <button class="btn" onclick="abrirEscolhaClasseCriacao('${escolha.id}')" ${!desbloqueada ? "disabled" : ""}>
                          Escolher
                        </button>
                        <span style="font-weight:bold; color:${!desbloqueada ? "#9a6a00" : preenchida ? "#1d6f3a" : "#b00020"};">
                          ${!desbloqueada ? "Pendente" : preenchida ? "Completo" : "Pendente"}
                        </span>
                      </div>
                    </div>
                  `;
                }).join("")}
              </div>
            `
            }
      </div>
    </div>

    <div style="height:14px"></div>

    <div class="actions" style="justify-content:flex-end;">
      <button class="btn" onclick="abrirSelecaoProximoNivelClasse()">Voltar para seleção de classe</button>
      <button class="btn primary" onclick="concluirNivelClasseCriacao()" ${!classeNivelAtualValido() ? "disabled" : ""}>
        Prosseguir
      </button>
    </div>
  `;
    }

    if (etapa === 4) {
        const origem = getOrigemSelecionadaCriacao();
        const escolhasOrigemDisponiveis = getEscolhasOrigemDisponiveis(origem);
        const habilidadesFixasOrigem = origem?.id === "amnesico"
            ? (origem.habilidades || []).filter(h =>
                normalizarTextoRegra(h.nome || "") === normalizarTextoRegra("Lembranças Graduais")
            )
            : [];
        const origemUsaItensLivres = origem?.id === "custom" || origem?.id === "amnesico";
        const itensBanco = parseListaPipe(origem?.itensBancoFixos);
        const itensCustom = parseListaPipe(origem?.itensCustomFixos);
        const itensEscolhaBanco = parseListaPipe(origem?.itensBancoEscolha);
        const itensEscolhaCustom = parseListaPipe(origem?.itensCustomEscolha);
        const itensJaAdicionadosNaOrigem = origemUsaItensLivres ? (f.inventario || []) : [];

        return `
      <div class="panel">
        <div class="panel-title">Origem</div>
        <div class="panel-body">
          <div class="field">
            <label>Origem</label>
            <select onchange="selecionarOrigemCriacao(this.value)">
              <option value="">Selecione...</option>
              ${ORIGENS_DB.map(o => `
                <option value="${o.id}" ${state.criacao.origemSelecionadaId === o.id ? "selected" : ""}>
                  ${escapeHtml(o.nome)}
                </option>
              `).join("")}
            </select>
          </div>

                    ${!origem ? "" : `
            <div style="height:12px"></div>

            <div class="notice">${escapeHtml(origem.descricao || "")}</div>

            <div style="height:12px"></div>

            <div class="panel">
  <div class="panel-title">Itens recebidos</div>
  <div class="panel-body">
    ${(!itensBanco.length && !itensCustom.length && !itensEscolhaBanco.length && !itensEscolhaCustom.length)
                    ? `<div class="empty">Nenhum item listado.</div>`
                    : `
          <div class="list">
            ${itensBanco.map(i => `<div class="list-item"><div>${escapeHtml(i)}</div></div>`).join("")}
            ${itensCustom.map(i => `<div class="list-item"><div>${escapeHtml(i)}</div></div>`).join("")}
            ${itensEscolhaBanco.map(i => `<div class="list-item"><div>${escapeHtml(i)} <span class="muted">(escolha)</span></div></div>`).join("")}
            ${itensEscolhaCustom.map(i => `<div class="list-item"><div>${escapeHtml(i)} <span class="muted">(escolha)</span></div></div>`).join("")}
          </div>
        `
                }
    </div>
</div>
${origemUsaItensLivres ? `
  <div style="height:12px"></div>

  <div class="panel">
    <div class="panel-title">Itens definidos pelo mestre</div>
    <div class="panel-body">
      <div class="notice">
        Use o botão abaixo para adicionar os itens da origem ao inventário sem limite de preço.
        ${origem.id === "amnesico"
                    ? " O limite de T$ e a escolha dos itens ficam a critério do mestre."
                    : " Os itens da origem custom são definidos com o mestre."
                }
      </div>

      <div style="height:12px"></div>

      <div class="actions">
        <button class="btn" onclick="abrirModalAdicionarItemInventario()">Adicionar item da origem</button>
      </div>
    </div>
  </div>

  <div style="height:12px"></div>

  <div class="panel">
    <div class="panel-title">Itens já adicionados</div>
    <div class="panel-body">
      ${!(f.inventario || []).length
                    ? `<div class="empty">Nenhum item adicionado ainda.</div>`
                    : `
          <div class="list">
            ${(f.inventario || []).map(item => {
                const base = getBaseItemDaEntrada(item);
                const nome = base?.nome || item.nomeManual || "Item";
                const qtd = Math.max(1, Number(item.quantidade) || 1);

                return `
      <div class="list-item">
        <div>${escapeHtml(`${qtd} x ${nome}`)}</div>

        <div class="actions">
          <button class="btn danger" onclick="removerItemInventarioSemConfirmar('${item.id}')">
            Excluir
          </button>
        </div>
      </div>
    `;
            }).join("")}
          </div>
        `}
    </div>
  </div>
` : ""}
${habilidadesFixasOrigem.length ? `
  <div style="height:12px"></div>

              <div class="panel">
                <div class="panel-title">Poder recebido automaticamente</div>
                <div class="panel-body">
                  <div class="list">
                    ${habilidadesFixasOrigem.map(h => `
                      <div class="list-item">
                        <div>
                          <div class="list-item-title">${escapeHtml(h.nome || "")}</div>
                          <div class="list-item-sub">${escapeHtml(h.descricao || "")}</div>
                        </div>
                        <div class="actions">
                          <span style="font-weight:bold; color:#1d6f3a;">Automático</span>
                        </div>
                      </div>
                    `).join("")}
                  </div>
                </div>
              </div>
            ` : ""}

            <div style="height:12px"></div>

            <div class="panel">
              <div class="panel-title">Escolhas da origem</div>
              <div class="panel-body">
                ${!escolhasOrigemDisponiveis.length
                    ? `<div class="empty">Sem escolhas cadastradas.</div>`
                    : `
                          <div class="list">
                            ${escolhasOrigemDisponiveis.map(escolha => {
                        const selecionados = getEscolhaOrigemValores(escolha.id);
                        const quantidade = getQuantidadeEscolhaOrigem(escolha);
                        const preenchida = selecionados.length === quantidade;

                        return `
                                  <div class="list-item">
                                    <div>
                                      <div class="list-item-title">${escapeHtml(escolha.titulo || "Escolha")}</div>
                                      <div class="list-item-sub">
                                        ${escapeHtml(escolha.descricao || "")}
                                        ${escolha.descricao ? "<br>" : ""}
                                        Selecionados: ${selecionados.length} / ${quantidade}
                                      </div>
                                    </div>

                                    <div class="actions">
                                      <button class="btn" onclick="abrirEscolhaOrigemCriacao('${escolha.id}')">Escolher</button>
                                      <span style="font-weight:bold; color:${preenchida ? "#1d6f3a" : "#b00020"};">
                                        ${preenchida ? "Completo" : "Pendente"}
                                      </span>
                                    </div>
                                  </div>
                                `;
                    }).join("")}
                          </div>
                        `
                }
              </div>
            </div>
          `}
        </div>
      </div>
    `;
    }

    if (etapa === 5) {
        sincronizarDivindadeCriacaoComFicha();

        const divindadesDisponiveis = getDivindadesDisponiveisCriacao();
        const divindade = getDivindadeSelecionadaCriacao();
        const poderes = getPoderesDaDivindade(divindade);
        const poderSelecionado = getPoderDivindadeSelecionadoCriacao();
        const divindadeTravada = divindadeVeioDaClasseNaCriacao();

        return `
  <div class="panel">
    <div class="panel-title">Divindade</div>
    <div class="panel-body">
      <div class="field">
        <label>Divindade</label>
        <select onchange="selecionarDivindadeCriacao(this.value)" ${divindadeTravada ? "disabled" : ""}>
          <option value="">Selecione...</option>
          ${divindadesDisponiveis.map(d => `
            <option value="${d.id}" ${divindade?.id === d.id ? "selected" : ""}>
              ${escapeHtml(d.nome)}
            </option>
          `).join("")}
        </select>
        ${divindadeTravada ? `<div class="hint">Esta divindade foi definida pela sua classe e não pode ser alterada aqui.</div>` : ``}
      </div>

      ${divindadeTravada ? `
        <div style="height:12px"></div>
        <div class="notice">
          Sua divindade já foi definida pela classe. Falta apenas escolher o poder concedido.
        </div>
      ` : ``}

      ${!divindadesDisponiveis.length
                ? `
          <div style="height:12px"></div>
          <div class="notice">Nenhuma divindade disponível para a combinação atual de raça/classe.</div>
        `
                : !divindade
                    ? `
            <div style="height:12px"></div>
            <div class="notice">Escolha uma divindade para ver suas informações e selecionar um poder concedido.</div>
          `
                    : `
            <div style="height:12px"></div>

            <div class="notice">
              ${escapeHtml(divindade.descricao || "")}
            </div>

            <div style="height:12px"></div>

            <div class="panel">
              <div class="panel-title">Informações da divindade</div>
              <div class="panel-body">
                <div class="field">
                  <label>Crenças e objetivos</label>
                  <textarea rows="4" disabled>${escapeHtml(divindade.crencas_e_objetivos || "")}</textarea>
                </div>

                <div style="height:12px"></div>

                <div class="row-3">
                  <div class="field">
                    <label>Símbolo</label>
                    <input value="${escapeAttr(divindade.simbolo || "")}" disabled>
                  </div>

                  <div class="field">
                    <label>Energia</label>
                    <input value="${escapeAttr(divindade.energia || "")}" disabled>
                  </div>

                  <div class="field">
                    <label>Arma preferida</label>
                    <input value="${escapeAttr(divindade.arma_preferida || "")}" disabled>
                  </div>
                </div>

                <div style="height:12px"></div>

                <div class="field">
                  <label>Obrigações e restrições</label>
                  <textarea rows="5" disabled>${escapeHtml(divindade.obrigacoes_restricoes || "")}</textarea>
                </div>
              </div>
            </div>

            <div style="height:12px"></div>

            <div class="panel">
              <div class="panel-title">Poderes concedidos possíveis</div>
              <div class="panel-body">
                ${!poderes.length
                        ? `<div class="notice">Nenhum poder concedido cadastrado para esta divindade.</div>`
                        : `
                    <div class="list">
                      ${poderes.map(registro => `
                        <div class="list-item">
                          <div>
                            <div class="list-item-title">${escapeHtml(registro.nome || "")}</div>
                            ${registro.descricao ? `<div class="list-item-sub">${escapeHtml(registro.descricao)}</div>` : ``}
                            ${registro.preRequisitos ? `<div class="list-item-sub" style="margin-top:6px;">Pré-requisitos: ${escapeHtml(registro.preRequisitos)}</div>` : ``}
                          </div>
                        </div>
                      `).join("")}
                    </div>
                  `
                    }
              </div>
            </div>

            <div style="height:12px"></div>

            <div class="panel">
              <div class="panel-title">Escolha do jogador</div>
              <div class="panel-body">
                <div class="field">
                  <label>Poder concedido</label>
                  <select onchange="selecionarPoderDivindadeCriacao(this.value)">
                    <option value="">Selecione...</option>
                    ${poderes.map(p => `
                      <option value="${escapeAttr(p.nome || "")}" ${normalizarTextoRegra(state.criacao.divindadePoderSelecionadoNome || "") === normalizarTextoRegra(p.nome || "") ? "selected" : ""}>
                        ${escapeHtml(p.nome || "")}
                      </option>
                    `).join("")}
                  </select>
                </div>

                ${poderSelecionado
                        ? `
                    <div style="height:12px"></div>
                    <div class="notice">
                      <strong>${escapeHtml(poderSelecionado.nome || "")}</strong>
                      ${poderSelecionado.descricao ? `<br>${escapeHtml(poderSelecionado.descricao)}` : ``}
                    </div>
                  `
                        : ``
                    }
              </div>
            </div>
          `
            }
    </div>
  </div>
`;
    }

  if (etapa === 6) {
        return `
        <div class="panel">
  <div class="panel-title">Dinheiro inicial</div>
  <div class="panel-body">
    <div class="field">
      <label>T$ inicial</label>
      <input
        type="number"
        min="0"
        step="1"
        value="${escapeAttr(String(getDinheiroFicha(f) || 0))}"
        onchange="updateDinheiroCriacao(this.value)"
      >
    </div>
  </div>
</div>
   
      <div style="height:14px"></div>
      ${renderInventarioSimples(f)}
    `;
    }

  return `
    <div class="panel">
      <div class="panel-title">Revisão</div>
      <div class="panel-body">
        <div class="notice">
          Revise os dados do personagem. Ao concluir, a ficha será salva e aberta na tela de jogo.
        </div>
      </div>
    </div>
  `;
}

function subirAtributoCriacao(campo) {
  const ficha = getFichaCriacao();
  if (!ficha) return;

  const atual = Number(ficha[campo + "Base"]) || 0;
  const custo = custoSubirAtributo(atual);

  if (ficha.pontosAtributoAtuais < custo) return;

  ficha[campo + "Base"] = atual + 1;
  ficha.pontosAtributoAtuais -= custo;

  render();
}

function descerAtributoCriacao(campo) {
  const ficha = getFichaCriacao();
  if (!ficha) return;

  const atual = Number(ficha[campo + "Base"]) || 0;

  let retorno;

  if (atual <= 0) {
    retorno = 1;
  } else {
    retorno = custoSubirAtributo(atual - 1);
  }

  ficha[campo + "Base"] = atual - 1;
  ficha.pontosAtributoAtuais += retorno;

  render();
}

function adicionarPontoAtributoCriacao() {
  const ficha = getFichaCriacao();
  if (!ficha) return;

  ficha.pontosAtributoAtuais += 1;
  render();
}

function getAtributoBase(ficha, atributo) {
  if (!ficha) return 0;

  switch (atributo) {
    case "forca":
      return Number(ficha.forcaBase) || 0;
    case "destreza":
      return Number(ficha.destrezaBase) || 0;
    case "constituicao":
      return Number(ficha.constituicaoBase) || 0;
    case "inteligencia":
      return Number(ficha.inteligenciaBase) || 0;
    case "sabedoria":
      return Number(ficha.sabedoriaBase) || 0;
    case "carisma":
      return Number(ficha.carismaBase) || 0;
    default:
      return 0;
  }
}

function getModRacial(ficha, atributo) {
    if (!ficha?.modRacialAtributos) return 0;
    return Number(ficha.modRacialAtributos[atributo]) || 0;
}

function getAtributoFinal(ficha, atributo) {
    const base = Number(ficha[atributo + "Base"]) || 0;
    const racial = Number(ficha.modRacialAtributos?.[atributo]) || 0;
    const aumento = Number(ficha.aumentosPorAtributo?.[atributo]) || 0;

    let total = base + racial + aumento;

    if (atributo === "carisma") {
        total -= calcularPenalidadeCarismaPorTormenta(
            contarPoderesTormentaNaFichaComPerdaCarisma(ficha)
        );
    }

    return total;
}

function getAtributoFinalCriacaoPreview(ficha, atributo) {
    if (!ficha) return 0;

    const base = Number(ficha[atributo + "Base"]) || 0;

    if (state.screen !== "criacao") {
        return getAtributoFinal(ficha, atributo);
    }

    const raca = getRacaSelecionadaCriacao();
    if (!raca) {
        return getAtributoFinal(ficha, atributo);
    }

    let racial = 0;

    if (raca.tipoAtributo === "fixo" || raca.tipoAtributo === "custom") {
        racial = Number(raca.atributosFixos?.[atributo]) || 0;
    } else if (racaUsaDistribuicaoLivre(raca)) {
        racial = state.criacao.racaDistribuicao.includes(atributo) ? 1 : 0;
    } else {
        racial = Number(ficha.modRacialAtributos?.[atributo]) || 0;
    }

    const aumento = Number(ficha.aumentosPorAtributo?.[atributo]) || 0;

    let total = base + racial + aumento;

    if (atributo === "carisma") {
        total -= calcularPenalidadeCarismaPorTormenta(
            getTotalPoderesTormentaComPerdaCarisma(ficha)
        );
    }

    return total;
}

function getPVMaxCriacaoPreview(ficha) {
    if (!ficha) return 0;
    return calcularPVTotalFicha(ficha);
}

function getPMMaxCriacaoPreview(ficha) {
    if (!ficha) return 0;
    return calcularPMTotalFicha(ficha);
}

function renderAtributoCriacao(nome, campo, valor) {
    return `
    <div class="attr">
      <div class="attr-header">${escapeHtml(nome.toUpperCase())}</div>
      <button class="attr-btn" onclick="subirAtributoCriacao('${campo}')">+</button>
      <div class="attr-value">${escapeHtml(getAtributoBase(getFichaCriacao(), campo))}</div>
      <button class="attr-btn" onclick="descerAtributoCriacao('${campo}')">-</button>
    </div>
  `;
}

function renderCriacao() {
    const f = getFichaCriacao();
    if (!f) {
        go("personagens");
        return;
    }

    if (
        !state.criacao.escolhaAbertaId &&
        !state.criacao.escolhaClasseAbertaId &&
        !state.criacao.escolhaOrigemAbertaId &&
        !state.criacao.periciasInteligenciaAberta
    ) {
        document.body.classList.remove("modal-open");
    }

    app.innerHTML = `
    <div class="screen">
      <div class="topbar">
        <div>
          <h2>Criação de personagem</h2>
          <div class="subtitle">Siga as etapas para montar o personagem antes de abrir a ficha de jogo.</div>
        </div>

        <div class="actions">
          <button class="btn ghost" onclick="go('personagens')">Cancelar</button>
        </div>
      </div>

      ${renderBarraCriacao()}

      <div style="height:14px"></div>

      <div class="row-2 criacao-layout">
  <div class="criacao-main">
    ${renderConteudoEtapaCriacao()}

    <div style="height:14px"></div>

    <div class="actions" style="justify-content:space-between;">
      <button class="btn" onclick="voltarEtapaCriacao()" ${state.criacao.etapa === 0 ? "disabled" : ""}>
        Voltar
      </button>

      ${
        state.criacao.etapa === ETAPAS_CRIACAO.length - 1
            ? `<button class="btn primary" onclick="concluirCriacaoFicha()">Concluir personagem</button>`
            : `
      <button
        class="btn primary"
        onclick="proximaEtapaCriacao()"
        ${state.criacao.etapa === 2 && !racaCriacaoValida()
            ? "disabled"
            : state.criacao.etapa === 3
                ? "disabled"
                : state.criacao.etapa === 5 && !divindadeCriacaoValida()
                    ? "disabled"
                    : ""
}
      >
        Próximo
      </button>
    `
}
    </div>
  </div>

  <div class="criacao-side">
    ${renderResumoCriacao(f)}
  </div>
</div>

${renderEscolhaCriacaoModal()}
${renderEscolhaClasseCriacaoModal()}
${renderModalPericiasInteligenciaCriacao()}
${renderModalAdicionarItemInventario()}
${renderModalDetalhesItemInventario()}
${renderEscolhaOrigemCriacaoModal()}
    </div>
  `;
}
function renderEvolucao() {
    const ficha = getFichaEvolucaoAtual();
    if (!ficha) {
        state.screen = "ficha";
        return render();
    }

    const classe = getClasseEvolucaoAtualFicha();
    const ctx = state.evolucao.classeEvolucaoContexto;

    if (!ctx || !classe) {
        app.innerHTML = `
      <div class="screen">
        <div class="topbar">        
          <div>
            <h2>Evolução</h2>
            <div class="subtitle">Classes atuais: ${escapeHtml(formatarClassesPersonagem(ficha))}</div>
          </div>

          <div class="actions">
            <button class="btn ghost" onclick="state.screen='ficha'; render()">Fechar</button>
          </div>
        </div>

        <div class="panel">
          <div class="panel-title">Escolha a classe para o próximo nível</div>
          <div class="panel-body">
            <div class="field">
              <label>Classe</label>
              <select onchange="state.evolucao.classeSelecaoEvolucaoId = this.value; render()">
                <option value="">Selecione...</option>
                ${CLASSES_DB.map(c => `
                  <option value="${c.id}" ${state.evolucao.classeSelecaoEvolucaoId === c.id ? "selected" : ""}>
                    ${escapeHtml(c.nome)}
                  </option>
                `).join("")}
              </select>
            </div>

            <div style="height:14px"></div>

            <div class="actions">
              <button
                class="btn primary"
                onclick="prepararNivelClasseEvolucao(state.evolucao.classeSelecaoEvolucaoId)"
                ${!state.evolucao.classeSelecaoEvolucaoId ? "disabled" : ""}
              >
                Abrir próximo nível
              </button>
            </div>
          </div>
        </div>

        <div style="height:14px"></div>

        ${normalizarTextoRegra(ficha.divindadeId || "") === "nenhum" ? `
          <div class="panel">
            <div class="panel-title">Divindade</div>
            <div class="panel-body">
              <div class="subtitle">
                Este personagem não possui divindade. Você pode escolher uma agora antes de continuar a evolução.
              </div>

              <div style="height:12px"></div>

              <div class="actions">
                <button class="btn" onclick="abrirEscolhaDivindadeEvolucao()">Escolher divindade</button>
              </div>
            </div>
          </div>

          <div style="height:14px"></div>
        ` : ``}

        ${renderEscolhaDivindadeEvolucaoModal()}
      </div>
    `;
        return;
    }

    const escolhasDoNivel = getEscolhasClasseDisponiveisNoNivel(
        classe,
        ctx.nivelAlvo,
        ctx.primeiraClasse,
        ficha
    );

    const efeitosDoNivel = (classe.efeitos || []).filter(e => {
        const nivelMinimo = Number(e.nivelMinimo) || 1;
        if (nivelMinimo !== ctx.nivelAlvo) return false;
        if (e.somentePrimeiraClasse && !ctx.primeiraClasse) return false;
        return true;
    });

    const habilidadesDoNivel = (classe.habilidades || []).filter(h => {
        const nivelMinimo = Number(h.nivelMinimo) || 1;
        return nivelMinimo === ctx.nivelAlvo;
    });

    if (!state.evolucao.escolhaClasseAbertaId && !state.evolucao.divindadeEscolhaAberta) {
        document.body.classList.remove("modal-open");
    }

    app.innerHTML = `
    <div class="screen">
      <div class="topbar">
        <div>
          <h2>Evolução</h2>
          <div class="subtitle">${escapeHtml(formatarClassesPersonagem(ficha))} • Nível total ${getNivelTotalPersonagem(ficha)}</div>
        </div>

        <div class="actions">
          <button class="btn ghost" onclick="state.screen='ficha'; render()">Fechar</button>
        </div>
      </div>

      ${normalizarTextoRegra(ficha.divindadeId || "") === "nenhum" ? `
        <div class="panel">
          <div class="panel-title">Divindade</div>
          <div class="panel-body">
            <div class="subtitle">
              Este personagem não possui divindade. Você pode escolher uma agora antes de continuar a evolução.
            </div>

            <div style="height:12px"></div>

            <div class="actions">
              <button class="btn" onclick="abrirEscolhaDivindadeEvolucao()">Escolher divindade</button>
            </div>
          </div>
        </div>

        <div style="height:14px"></div>
      ` : ``}

      <div class="panel">
        <div class="panel-title">Próximo nível</div>
        <div class="panel-body">
          <div class="row-3">
            <div class="field">
              <label>Classe</label>
              <input value="${escapeAttr(classe.nome)}" disabled>
            </div>
            <div class="field">
              <label>Nível alvo</label>
              <input value="${escapeAttr(ctx.nivelAlvo)}" disabled>
            </div>
            <div class="field">
              <label>Primeira classe?</label>
              <input value="${ctx.primeiraClasse ? "Sim" : "Não"}" disabled>
            </div>
          </div>
        </div>
      </div>

      <div style="height:14px"></div>

      <div class="panel">
        <div class="panel-title">Habilidades deste nível</div>
        <div class="panel-body">
          ${!habilidadesDoNivel.length
            ? `<div class="empty">Sem habilidades novas neste nível.</div>`
            : `
                <div class="list">
                  ${habilidadesDoNivel.map(h => `
                    <div class="list-item">
                      <div>
                        <div class="list-item-title">${escapeHtml(h.nome || "Habilidade")}</div>
                        <div class="list-item-sub">${escapeHtml(h.descricao || "")}</div>
                      </div>
                    </div>
                  `).join("")}
                </div>
              `
        }
        </div>
      </div>

      <div style="height:14px"></div>

      <div class="panel">
        <div class="panel-title">Efeitos automáticos deste nível</div>
        <div class="panel-body">
          ${!efeitosDoNivel.filter(e => efeitoDeveAparecerNaPrevia("classe", e)).length
            ? `<div class="empty">Sem efeitos automáticos visíveis neste nível.</div>`
            : `
                <div class="list">
                  ${efeitosDoNivel
                .filter(e => efeitoDeveAparecerNaPrevia("classe", e))
                .map(e => `
                      <div class="list-item">
                        <div>
                          <div class="list-item-title">${escapeHtml(traduzirTipoEfeito(e.tipo || "efeito"))}</div>
                          <div class="list-item-sub">${escapeHtml(descreverEfeitoParaJogador(e))}</div>
                        </div>
                      </div>
                    `).join("")}
                </div>
              `
        }
        </div>
      </div>

      <div style="height:14px"></div>

      <div class="panel">
        <div class="panel-title">Escolhas deste nível</div>
        <div class="panel-body">
          ${!escolhasDoNivel.length
            ? `<div class="empty">Sem escolhas obrigatórias neste nível.</div>`
            : `
                <div class="list">
                  ${escolhasDoNivel.map(escolha => {
                const selecionados = getEscolhaClasseValoresEvolucao(escolha.id);
                const quantidade = Number(escolha.quantidade) || 0;
                const preenchida = selecionados.length === quantidade;
                const desbloqueada = escolhaClasseDesbloqueada(escolha);

                return `
                        <div class="list-item">
                          <div>
                            <div class="list-item-title">${escapeHtml(escolha.titulo || escolha.tipo || "Escolha")}</div>
                            <div class="list-item-sub">
                              ${escapeHtml(escolha.descricao || "")}
                              ${escolha.descricao ? "<br>" : ""}
                              Selecionados: ${selecionados.length} / ${quantidade}
                            </div>
                          </div>

                          <div class="actions">
                            <button
                              class="btn ${preenchida ? "ok" : "ghost"}"
                              onclick="abrirEscolhaClasseEvolucao('${escolha.id}')"
                              ${!desbloqueada ? "disabled" : ""}
                            >
                              ${preenchida ? "Escolhido" : "Escolher"}
                            </button>

                            <span style="font-weight:bold; color:${preenchida ? "#1d6f3a" : "#b00020"};">
                              ${preenchida ? "Completo" : "Pendente"}
                            </span>
                          </div>
                        </div>
                      `;
            }).join("")}
                </div>
              `
        }
        </div>
      </div>

      <div style="height:14px"></div>

      <div class="actions" style="justify-content:flex-end;">
        <button class="btn" onclick="abrirSelecaoProximoNivelEvolucao()">Voltar</button>
        <button class="btn primary" onclick="concluirNivelClasseEvolucao()" ${!classeNivelAtualValidoEvolucao() ? "disabled" : ""}>
          Concluir nível
        </button>
      </div>

      ${renderEscolhaClasseEvolucaoModal()}
      ${renderEscolhaDivindadeEvolucaoModal()}
    </div>
  `;
}

function renderLivro() {
  app.innerHTML = `
    <div class="screen">
      <div class="topbar">
        <div>
          <h2>Livro</h2>
          <div class="subtitle">PDF com rolagem vertical, texto selecionável e busca.</div>
        </div>
        <button class="btn ghost" onclick="go('home')">Voltar</button>
      </div>

      <div class="sheet">
        <div class="panel">
          <div class="panel-title">Livro Tormenta20</div>
          <div class="panel-body">
            <div class="pdf-toolbar">
              <input type="file" id="pdfUpload" accept="application/pdf">
              <button class="btn" onclick="carregarPDF()">Carregar PDF</button>

              <input type="text" id="searchText" placeholder="Pesquisar texto">
              <button class="btn" onclick="buscarTexto()">Buscar</button>
              <button class="btn" onclick="resultadoAnterior()">◀</button>
              <button class="btn" onclick="proximoResultado()">▶</button>

              <input type="number" id="goPageInput" min="1" placeholder="Página">
              <button class="btn" onclick="irParaPagina()">Ir</button>
            </div>

            <div style="display:flex; gap:16px; flex-wrap:wrap; margin:10px 0 14px;">
              <label class="checkbox-line">
                <input type="checkbox" id="searchWholeWord" checked>
                <span>Palavra/frase exata</span>
              </label>
            </div>

            <div id="pdfStatus" class="pdf-status">Nenhum PDF carregado.</div>
            <div id="pdfSearchInfo" class="pdf-search-info"></div>

            <div id="pdfViewerWrap" class="pdf-viewer-wrap">
              <div id="pdfPages" class="pdf-pages"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  iniciarPDF();
}

function renderDados() {
  app.innerHTML = `
    <div class="screen">
      <div class="topbar">
        <div>
          <h2>Dados</h2>
          <div class="subtitle">Monte rolagens compostas como d4 + 2d6 + d20.</div>
        </div>
        <div class="actions">
          <button class="btn ghost" onclick="go('home')">Voltar</button>
          <button class="btn" onclick="addGrupoDado()">Adicionar dado</button>
          <button class="btn primary" onclick="rolarTodosDados()">Rolar tudo</button>
        </div>
      </div>

      <div class="sheet">
        <div class="sheet-grid">
          <div class="panel">
            <div class="panel-title">Montagem da rolagem</div>
            <div class="panel-body">
              <div class="list">
                ${state.dados.grupos.map(g => `
                  <div class="list-item">
                    <div style="display:grid; grid-template-columns: 120px 160px; gap:10px; align-items:end;">
                      <div class="field">
                        <label>Quantidade</label>
                        <input
                          type="number"
                          min="1"
                          value="${g.quantidade}"
                          onchange="updateGrupoDado('${g.id}', 'quantidade', this.value)"
                        >
                      </div>

                      <div class="field">
                        <label>Tipo</label>
                        <select onchange="updateGrupoDado('${g.id}', 'tipo', this.value)">
                          ${["d4", "d6", "d8", "d10", "d12", "d20", "d100"].map(tipo => `
                            <option value="${tipo}" ${g.tipo === tipo ? "selected" : ""}>${tipo}</option>
                          `).join("")}
                        </select>
                      </div>
                    </div>

                    <div class="actions">
                      <button class="btn danger" onclick="removeGrupoDado('${g.id}')">Remover</button>
                    </div>
                  </div>
                `).join("")}
              </div>

              <div style="margin-top:14px" class="notice">
                Fórmula atual: <strong>${state.dados.grupos.map(g => `${g.quantidade}${g.tipo}`).join(" + ")}</strong>
              </div>
            </div>
          </div>

          <div class="row-2">
            <div class="panel">
              <div class="panel-title">Último resultado</div>
              <div class="panel-body">
                ${
                  !state.dados.ultimoResultado
                    ? `<div class="empty">Nenhuma rolagem ainda.</div>`
                    : `
                      <div style="font-weight:bold; margin-bottom:10px;">
                        ${escapeHtml(state.dados.ultimoResultado.formula)}
                      </div>

                      <div class="list">
                        ${state.dados.ultimoResultado.grupos.map(g => `
                          <div class="list-item">
                            <div>
                              <div class="list-item-title">${g.quantidade}${g.tipo}</div>
                              <div class="list-item-sub">${g.resultados.join(" + ")}</div>
                            </div>
                            <div style="font-weight:bold; font-size:20px;">${g.subtotal}</div>
                          </div>
                        `).join("")}
                      </div>

                      <div style="margin-top:16px; font-size:24px; font-weight:900;">
                        Total: ${state.dados.ultimoResultado.total}
                      </div>
                    `
                }
              </div>
            </div>

            <div class="panel">
              <div class="panel-title">Histórico</div>
              <div class="panel-body">
                <div class="actions" style="margin-bottom:12px;">
                  <button class="btn danger" onclick="limparHistoricoDados()">Limpar histórico</button>
                </div>

                ${
                  state.dados.historico.length === 0
                    ? `<div class="empty">Sem histórico.</div>`
                    : `
                      <div class="list">
                        ${state.dados.historico.map(item => `
                          <div class="list-item">
                            <div>
                              <div class="list-item-title">${escapeHtml(item.formula)}</div>
                              <div class="list-item-sub">
                                ${item.grupos.map(g => `${g.quantidade}${g.tipo}: ${g.resultados.join(" + ")}`).join(" • ")}
                              </div>
                            </div>
                            <div style="font-weight:bold; font-size:20px;">${item.total}</div>
                          </div>
                        `).join("")}
                      </div>
                    `
                }
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderFicha() {
  const f = getFichaAtual();
  if (!f) {
    go("personagens");
    return;
  }
    const habilidadesRaciaisVisiveis = getHabilidadesRaciaisVisiveis(f);
    const poderesVisiveis = getPoderesVisiveis(f);

  app.innerHTML = `
    <div class="screen">
      <div class="topbar">
        <div>
          <h2>Ficha do personagem</h2>
          <div class="subtitle">Visual inspirado na ficha de Tormenta20, adaptado para navegador.</div>
        </div>

        <div class="actions">
          <button class="btn ghost" onclick="go('personagens')">Voltar</button>
          <button class="btn primary" onclick="salvarAviso()">Salvar</button>
        </div>
      </div>

      <div class="sheet">
        <div class="sheet-grid">
          <div class="row-2">
            <div class="panel">
              <div class="panel-title">Personagem</div>
              <div class="panel-body">
                <div class="field">
                  <label>Nome do personagem</label>
                  <input value="${escapeAttr(f.nome)}" onchange="updateFicha('nome', this.value)">
                </div>
              </div>
            </div>

            <div class="panel">
              <div class="panel-title">Jogador</div>
              <div class="panel-body">
                <div class="field">
                  <label>Nome do jogador</label>
                  <input value="${escapeAttr(f.jogador)}" onchange="updateFicha('jogador', this.value)">
                </div>
              </div>
            </div>
          </div>

          <div class="row-4">
            <div class="panel">
              <div class="panel-title">Raça</div>
              <div class="panel-body-centro">
                <input style="text-align:center;"value="${escapeAttr(f.raca)}"disabled>              
              </div>
            </div>

            <div class="panel">
              <div class="panel-title">Origem</div>
              <div class="panel-body-centro">
                <input style="text-align:center;"value="${escapeAttr(f.origem)}"disabled>
              </div>
            </div>

            <div class="panel">
  <div class="panel-title">Classes</div>
  <div class="static-field">
    ${escapeHtml(formatarClassesPersonagem(f))}
  </div>
</div>

                                    <div class="panel">
              <div class="panel-title">Divindade</div>
              <div class="panel-body">
                ${f.divindade
          ? `
                    <button class="btn btn-divindade" type="button" onclick="abrirModalDetalhesDivindade()">
                      ${escapeHtml(f.divindade)}
                    </button>
                  `
          : `
                    <div class="muted">Nenhuma divindade.</div>
                  `
                }
              </div>
            </div>
          </div>
         
          <div class="row-2">
  <div>
    <div class="row-3">
      <div class="panel">
        <div class="panel-title">XP</div>
        <div class="panel-body-centro">
          <input style="text-align:center;type="number" value="${escapeAttr(f.xp)}" onchange="updateFicha('xp', Number(this.value))">
        </div>
      </div>

      <div class="panel">
        <div class="panel-title">Nível total</div>
        <div class="panel-body">
          <div style="display:flex; align-items:center; justify-content:center; min-height:38px;">
            <div style="min-width:48px; text-align:center; font-size:24px; font-weight:bold;">
              ${escapeAttr(getNivelTotalPersonagem(f))}
            </div>
          </div>
        </div>
      </div>

      <div class="panel">
        <div class="panel-title">Evolução</div>
        <div class="panel-body">
          <button class="btn" style="width:100%;" onclick="iniciarEvolucaoFicha()">
            Subir Nível
          </button>
        </div>
      </div>
       </div>  
       
          <div style="height:14px"></div>
           <div class="notice" style="display:flex; align-items:center; justify-content:center; gap:10px;">
  <span>Pontos disponíveis: <strong>${f.pontosAtributoAtuais}</strong></span>

  <button class="btn small" onclick="adicionarPontoAtributo()">
    +1 ponto
  </button>
</div>
<div style="height:14px"></div>
              <div class="row-6">
                ${renderAtributo("For", "forca", getAtributoFinal(f, "forca"))}
                ${renderAtributo("Des", "destreza", getAtributoFinal(f, "destreza"))}
                ${renderAtributo("Con", "constituicao", getAtributoFinal(f, "constituicao"))}
                ${renderAtributo("Int", "inteligencia", getAtributoFinal(f, "inteligencia"))}
                ${renderAtributo("Sab", "sabedoria", getAtributoFinal(f, "sabedoria"))}
                ${renderAtributo("Car", "carisma", getAtributoFinal(f, "carisma"))}
              </div>

              <div style="height:14px"></div>

              <div class="row-3">
                <div class="panel">
                  <div class="panel-title">Pontos de vida</div>
                  <div class="panel-body small-grid">
                    <div class="field">
                      <label>Máximos</label>
                      <input type="number" style="text-align:center; "value="${escapeAttr(f.pvMax)}" onchange="updateFicha('pvMax', Number(this.value))">
                    </div>
                    <div class="field">
                      <label>Atuais</label>
                      <input type="number" style="text-align:center; "value="${escapeAttr(f.pvAtual)}" onchange="updateFicha('pvAtual', Number(this.value))">
                    </div>
                  </div>
                </div>

                <div class="panel">
                  <div class="panel-title">Pontos de mana</div>
                  <div class="panel-body small-grid">
                    <div class="field">
                      <label>Máximos</label>
                      <input type="number" style="text-align:center;"value="${escapeAttr(f.pmMax)}" onchange="updateFicha('pmMax', Number(this.value))">
                    </div>
                    <div class="field">
                      <label>Atuais</label>
                      <input type="number" style="text-align:center;"value="${escapeAttr(f.pmAtual)}" onchange="updateFicha('pmAtual', Number(this.value))">
                    </div>
                  </div>
                </div>

                <div class="panel">
  <div class="panel-title">Defesa</div>
  <div class="panel-body small-grid">
    <div class="field">
      <label>Total </label>
      <input
        type="number"
        style="text-align:center;"
        value="${escapeAttr(f.defesa)}"
        disabled
      >
    </div>

    <div class="field">
      <label>Outros</label>
      <input
        type="number"
        style="text-align:center;"
        value="${escapeAttr(f.defesaOutros || 0)}"
        onchange="updateFicha('defesaOutros', Number(this.value))"
      >
    </div>
  </div>
</div>
              </div>

              <div style="height:14px"></div>

              <div class="panel">
                <div class="panel-title">Ataques</div>
                <div class="panel-body">
                  <div class="table-wrap">
                    <table>
                      <thead>
                        <tr>
                          <th>Ataque</th>
                          <th>Teste de ataque</th>
                          <th>Dano</th>
                          <th>Crítico</th>
                          <th>Tipo</th>
                          <th>Alcance</th>
                          <th></th>
                        </tr>
                      </thead>
                      <tbody>
  ${f.ataques.map((a, i) => {
      const auto = !!a.origemEquipamento;

      const nomeValor = auto ? (a.nomeExtra || a.nomeBase || "") : (a.nome || "");
      const bonusValor = auto
          ? `${a.bonusBase ?? ""}${a.bonusExtra ? ` ${a.bonusExtra}` : ""}`.trim()
          : (a.bonus || "");
      const danoValor = auto
          ? `${a.danoBase || ""}${a.danoExtra ? ` ${a.danoExtra}` : ""}`.trim()
          : (a.dano || "");
      const criticoValor = auto
          ? `${a.criticoBase || ""}${a.criticoExtra ? ` ${a.criticoExtra}` : ""}`.trim()
          : (a.critico || "");
      const tipoValor = auto
          ? `${a.tipoBase || ""}${a.tipoExtra ? ` ${a.tipoExtra}` : ""}`.trim()
          : (a.tipo || "");
      const alcanceValor = auto
          ? `${a.alcanceBase || ""}${a.alcanceExtra ? ` ${a.alcanceExtra}` : ""}`.trim()
          : (a.alcance || "");

      return `
        <tr ${auto ? `style="background:rgba(0,0,0,.03);"` : ""}>
          <td>
            <input
              value="${escapeAttr(nomeValor)}"
              onchange="updateAtaque(${i}, 'nome', this.value)"
            >
          </td>
          <td>
            <input
              value="${escapeAttr(bonusValor)}"
              onchange="updateAtaque(${i}, 'bonus', this.value)"
            >
          </td>
          <td>
            <input
              value="${escapeAttr(danoValor)}"
              onchange="updateAtaque(${i}, 'dano', this.value)"
            >
          </td>
          <td>
            <input
              value="${escapeAttr(criticoValor)}"
              onchange="updateAtaque(${i}, 'critico', this.value)"
            >
          </td>
          <td>
            <input
              value="${escapeAttr(tipoValor)}"
              onchange="updateAtaque(${i}, 'tipo', this.value)"
            >
          </td>
          <td>
            <input
              value="${escapeAttr(alcanceValor)}"
              onchange="updateAtaque(${i}, 'alcance', this.value)"
            >
          </td>
          <td>
            ${auto
              ? `<span class="muted">Arma equipada</span>`
              : `<button class="btn danger" onclick="removeAtaque(${i})">X</button>`
          }
          </td>
        </tr>
      `;
  }).join("")}
</tbody>
                    </table>
                  </div>

                  <div style="margin-top:12px">
                    <button class="btn" onclick="addAtaque()">Adicionar ataque</button>
                  </div>
                </div>
              </div>

              <div style="height:14px"></div>

              <div class="row-4">
                <div class="panel">
  <div class="panel-title">Penalidade de armadura</div>
  <div class="panel-body">
    <div class="field">
      <input
        type="number"
        style="text-align:center;"
        value="${escapeAttr(f.penalidadeArmadura || 0)}"
        disabled
      >
    </div>
  </div>
</div>

<div class="panel">
    <div class="panel-title">Proficiências</div>
    <div class="panel-body">
      <div class="field">
        <button class="btn" onclick="abrirModalProficiencias()">Ver / editar</button>
      </div>

      <div style="height:10px"></div>
    </div>
  </div>

                <div class="panel">
                  <div class="panel-title">Tamanho</div>
                  <div class="panel-body-centro">
                    <input style="text-align:center;"value="${escapeAttr(f.tamanho)}"onchange="updateFicha('tamanho', this.value)">
                  </div>
                </div>

                <div class="panel">
                  <div class="panel-title">Deslocamento</div>
                  <div class="panel-body-centro">
                    <input style="text-align:center;"value="${escapeAttr(f.deslocamento)}" onchange="updateFicha('deslocamento', this.value)">
                  </div>
                </div>
              </div>

                          <div style="height:14px"></div>

<div class="panel">
  <div class="panel-title">Habilidades de raça</div>
  <div class="panel-body">
    ${
      habilidadesRaciaisVisiveis.length === 0
          ? `<div class="empty">Nenhuma habilidade racial cadastrada.</div>`
          : `
          <div class="list">
            ${habilidadesRaciaisVisiveis.map(h => `
              <div class="list-item">
                <div style="display:flex; align-items:flex-start; gap:10px; flex:1;">
                  <input
                    type="checkbox"
                    ${h.selecionada ? "checked" : ""}
                    onchange="updateHabilidade('${h.id}', 'selecionada', this.checked)"
                    style="margin-top:4px;"
                  >

                  <button
                    class="btn ghost"
                    style="padding:0; min-height:auto; border:none; background:none; text-align:left; box-shadow:none;"
                    onclick="abrirDetalheHabilidade('${h.id}')"
                  >
                    <div class="list-item-title">${escapeHtml(h.nome || "Sem nome")}</div>
                  </button>
                </div>

                <div style="font-weight:bold;">
                  ${Number(h.custoPm) || 0} PM
                </div>
              </div>
            `).join("")}
          </div>
        `
      }
  </div>
</div>

<div style="height:14px"></div>

<div class="panel">
  <div class="panel-title">Poderes</div>
  <div class="panel-body">
    ${poderesVisiveis.length === 0
          ? `<div class="empty">Nenhum poder cadastrado.</div>`
          : `
          <div class="list">
            ${poderesVisiveis.map(h => `
              <div class="list-item">
                <div style="display:flex; align-items:flex-start; gap:10px; flex:1;">
                  <input
                    type="checkbox"
                    ${h.selecionada ? "checked" : ""}
                    onchange="updateHabilidade('${h.id}', 'selecionada', this.checked)"
                    style="margin-top:4px;"
                  >

                  <button
                    class="btn ghost"
                    style="padding:0; min-height:auto; border:none; background:none; text-align:left; box-shadow:none;"
                    onclick="abrirDetalheHabilidade('${h.id}')"
                  >
                    <div class="list-item-title">${escapeHtml(h.nome || "Sem nome")}</div>
                  </button>
                </div>

                <div style="font-weight:bold;">
                  ${Number(h.custoPm) || 0} PM
                </div>
              </div>
            `).join("")}
          </div>
        `
      }

    <div style="height:12px"></div>

    ${(() => {
          const totalPm = getCustoTotalHabilidadesSelecionadas();
          const pmAtual = Number(f.pmAtual) || 0;
          const excedeu = totalPm > pmAtual;

          return `
          <div class="row-2">
            <div class="notice" style="${excedeu ? "background:#ffd7d7; border-color:#c43a3a; color:#7a1010;" : ""}">
              PM total selecionado:
              <strong style="${excedeu ? "color:#b00020;" : ""}">
                ${totalPm}
              </strong>
              <br>
              PM atual do personagem: <strong>${pmAtual}</strong>
            </div>

            <div class="actions" style="justify-content:flex-end; align-items:center;">
              <button class="btn" onclick="addHabilidade()">Adicionar habilidade</button>
              <button
                class="btn primary"
                onclick="usarHabilidadesSelecionadas()"
                ${excedeu ? "disabled" : ""}
                style="${excedeu ? "opacity:.5; cursor:not-allowed;" : ""}"
              >
                Usar habilidades
              </button>
            </div>
          </div>
        `;
      })()
    }
  </div>
</div>

<div style="height:14px"></div>

<div class="panel">
  <div class="panel-title">Magias</div>
  <div class="panel-body">
    ${
      f.magias.length === 0
        ? `<div class="empty">Nenhuma magia cadastrada.</div>`
        : `
          <div class="list">
            ${f.magias.map(m => {
              const custoBase = Number(m.custoPm) || 0;
              const semPm = custoBase > (Number(f.pmAtual) || 0);

              return `
                <div class="list-item">
                  <div style="flex:1;">
                    <button
                      class="btn ghost"
                      style="padding:0; min-height:auto; border:none; background:none; text-align:left; box-shadow:none;"
                      onclick="abrirDetalheMagia('${m.id}')"
                    >
                      <div class="list-item-title">${escapeHtml(m.nome || "Sem nome")}</div>
                    </button>

                    <div class="list-item-sub">
                      Círculo: ${escapeHtml(m.circulo || "—")} • Custo: ${custoBase} PM
                    </div>
                  </div>

                  <div class="actions">
                    <button
                      class="btn primary"
                      onclick="abrirDetalheMagia('${m.id}')"
                      ${semPm ? "disabled" : ""}
                    >
                      Usar
                    </button>
                  </div>
                </div>
              `;
            }).join("")}
          </div>
        `
    }

    <div style="margin-top:12px">
      <button class="btn" onclick="addMagia()">Adicionar magia</button>
    </div>
  </div>
</div>

<div style="height:14px"></div>
${renderInventarioSimples(f)}

<div style="height:14px"></div>

               <div class="panel">
                  <div class="panel-title">Anotações</div>
                  <div class="panel-body">
                    <textarea onchange="updateFicha('anotacoes', this.value)">${escapeHtml(f.anotacoes)}</textarea>
                  </div>
                </div>
              </div>
                       
            <div>
              <div class="panel">
  <div class="panel-title">Perícias</div>
  <div class="panel-body">
    <div class="pericias-list">
      ${f.pericias.map((p, i) => `
        <div class="pericia-item">
          <div>
            <div class="pericia-name">${escapeHtml(p.nome)}</div>
            <div class="subtitle">
  ${escapeHtml(p.atributo)}
  ${p.somenteTreinada ? " • Só treinada" : ""}
  ${p.penalidadeArmadura ? " • Pen. arm." : ""}
  • Total:
  <span class="pericia-total">
    ${calcularTotalPericia(f, p)}
  </span>
</div>
          </div>

                    <div class="row-2">
            <div class="field">
              <label>Racial</label>
              <input
                class="campo-pericia-centro"
                type="number"
                value="${escapeAttr(
                    (Number(p?.outrosRacial) || 0) + (Number(p?.outrosPoder) || 0)
                )}"
                disabled
                readonly
              >
            </div>

            <div class="field">
              <label>Outros</label>
              <input
                class="campo-pericia-centro"
                type="number"
                value="${escapeAttr(Number(p?.outros) || 0)}"
                onchange="updatePericia(${i}, 'outros', this.value)"
              >
            </div>
          </div>

          <div class="checkbox-line">
            <input
              type="checkbox"
              ${p.treinada ? "checked" : ""}
              onchange="updatePericia(${i}, 'treinada', this.checked)"
            />
            <span>Treino</span>
          </div>
        </div>
      `).join("")}
    </div>

    <div style="margin-top:14px" class="notice">
      Metade do nível: <strong>${getMetadeNivel(f)}</strong><br>
      Bônus de treino atual: <strong>+${getBonusTreino(f)}</strong>
    </div>
  </div>
</div>

      <div class="side-buttons">
        <button class="btn primary floating" onclick="abrirModal('livro')">Livro</button>
        <button class="btn primary floating" onclick="abrirModal('dados')">Dados</button>
      </div>

      ${renderLivroModal()}
      ${renderDadosModal()}
      ${renderEquipamentoModal()}
      ${renderHabilidadeModal()}
      ${renderMagiaModal()}
      ${renderModalAdicionarItemInventario()}
      ${renderWidgetDinheiroFlutuante()}
      ${renderModalDetalhesItemInventario()}
      ${renderEscolhaDivindadeEvolucaoModal()}
      ${renderProficienciasModal()}
    </div>
  `;
}

function renderLivroModal() {
  if (state.modal !== "livro") return "";

  setTimeout(() => {
    document.body.classList.add("modal-open");

    const viewer = document.getElementById("pdfViewerWrap");
    if (viewer && !viewer.dataset.ready) {
      viewer.dataset.ready = "1";
      iniciarPDF();
    }
  }, 0);

  return `
    <div class="overlay" onclick="fecharModal()">
      <div class="overlay-card" onclick="event.stopPropagation()">
        <div class="overlay-header">
          <div>
            <div class="overlay-title">Livro</div>
            <div class="subtitle">Consulta rápida sem sair da ficha.</div>
          </div>
          <button class="btn ghost" onclick="fecharModal()">Fechar</button>
        </div>

        <div class="overlay-body">
          <div class="panel">
            <div class="panel-title">Livro Tormenta20</div>
            <div class="panel-body">
              <div class="pdf-toolbar">
                <input type="file" id="pdfUpload" accept="application/pdf">
                <button class="btn" onclick="carregarPDF()">Carregar PDF</button>

                <input type="text" id="searchText" placeholder="Pesquisar texto">
                <button class="btn" onclick="buscarTexto()">Buscar</button>
                <button class="btn" onclick="resultadoAnterior()">◀</button>
                <button class="btn" onclick="proximoResultado()">▶</button>

                <input type="number" id="goPageInput" min="1" placeholder="Página">
                <button class="btn" onclick="irParaPagina()">Ir</button>
              </div>

              <div style="display:flex; gap:16px; flex-wrap:wrap; margin:10px 0 14px;">
                <label class="checkbox-line">
                  <input type="checkbox" id="searchWholeWord" checked>
                  <span>Palavra/frase exata</span>
                </label>
              </div>

              <div id="pdfStatus" class="pdf-status">Nenhum PDF carregado.</div>
              <div id="pdfSearchInfo" class="pdf-search-info"></div>

              <div id="pdfViewerWrap" class="pdf-viewer-wrap">
                <div id="pdfPages" class="pdf-pages"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderDadosModal() {
  if (state.modal !== "dados") return "";

  setTimeout(() => {
    document.body.classList.add("modal-open");
  }, 0);

  return `
    <div class="overlay" onclick="fecharModal()">
      <div class="overlay-card" onclick="event.stopPropagation()">
        <div class="overlay-header">
          <div>
            <div class="overlay-title">Dados</div>
            <div class="subtitle">Rolagem rápida sem sair da ficha.</div>
          </div>
          <button class="btn ghost" onclick="fecharModal()">Fechar</button>
        </div>

        <div class="overlay-body">
          <div class="sheet-grid">
            <div class="panel">
              <div class="panel-title">Montagem da rolagem</div>
              <div class="panel-body">
                <div class="actions" style="margin-bottom:12px;">
                  <button class="btn" onclick="addGrupoDado()">Adicionar dado</button>
                  <button class="btn primary" onclick="rolarTodosDados()">Rolar tudo</button>
                </div>

                <div class="list">
                  ${state.dados.grupos.map(g => `
                    <div class="list-item">
                      <div style="display:grid; grid-template-columns: 120px 160px; gap:10px; align-items:end;">
                        <div class="field">
                          <label>Quantidade</label>
                          <input
                            type="number"
                            min="1"
                            value="${g.quantidade}"
                            oninput="updateGrupoDado('${g.id}', 'quantidade', this.value)"
                          >
                        </div>

                        <div class="field">
                          <label>Tipo</label>
                          <select onchange="updateGrupoDado('${g.id}', 'tipo', this.value)">
                            ${["d4", "d6", "d8", "d10", "d12", "d20", "d100"].map(tipo => `
                              <option value="${tipo}" ${g.tipo === tipo ? "selected" : ""}>${tipo}</option>
                            `).join("")}
                          </select>
                        </div>
                      </div>

                      <div class="actions">
                        <button class="btn danger" onclick="removeGrupoDado('${g.id}')">Remover</button>
                      </div>
                    </div>
                  `).join("")}
                </div>

                <div style="margin-top:14px" class="notice">
                  Fórmula atual: <strong>${state.dados.grupos.map(g => `${g.quantidade}${g.tipo}`).join(" + ")}</strong>
                </div>
              </div>
            </div>

            <div class="row-2">
              <div class="panel">
                <div class="panel-title">Último resultado</div>
                <div class="panel-body">
                  ${
                    !state.dados.ultimoResultado
                      ? `<div class="empty">Nenhuma rolagem ainda.</div>`
                      : `
                        <div style="font-weight:bold; margin-bottom:10px;">
                          ${escapeHtml(state.dados.ultimoResultado.formula)}
                        </div>

                        <div class="list">
                          ${state.dados.ultimoResultado.grupos.map(g => `
                            <div class="list-item">
                              <div>
                                <div class="list-item-title">${g.quantidade}${g.tipo}</div>
                                <div class="list-item-sub">${g.resultados.join(" + ")}</div>
                              </div>
                              <div style="font-weight:bold; font-size:20px;">${g.subtotal}</div>
                            </div>
                          `).join("")}
                        </div>

                        <div style="margin-top:16px; font-size:24px; font-weight:900;">
                          Total: ${state.dados.ultimoResultado.total}
                        </div>
                      `
                  }
                </div>
              </div>

              <div class="panel">
                <div class="panel-title">Histórico</div>
                <div class="panel-body">
                  <div class="actions" style="margin-bottom:12px;">
                    <button class="btn danger" onclick="limparHistoricoDados()">Limpar histórico</button>
                  </div>

                  ${
                    state.dados.historico.length === 0
                      ? `<div class="empty">Sem histórico.</div>`
                      : `
                        <div class="list">
                          ${state.dados.historico.map(item => `
                            <div class="list-item">
                              <div>
                                <div class="list-item-title">${escapeHtml(item.formula)}</div>
                                <div class="list-item-sub">
                                  ${item.grupos.map(g => `${g.quantidade}${g.tipo}: ${g.resultados.join(" + ")}`).join(" • ")}
                                </div>
                              </div>
                              <div style="font-weight:bold; font-size:20px;">${item.total}</div>
                            </div>
                          `).join("")}
                        </div>
                      `
                  }
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderEquipamentoModal() {
  if (state.modal !== "equipamento") return "";

  const equip = getEquipamentoAtual();
  if (!equip) return "";

  setTimeout(() => {
    document.body.classList.add("modal-open");
  }, 0);

  return `
    <div class="overlay" onclick="fecharModal()">
      <div class="overlay-card" onclick="event.stopPropagation()">
        <div class="overlay-header">
          <div>
            <div class="overlay-title">Equipamento</div>
            <div class="subtitle">Detalhes do item</div>
          </div>
          <button class="btn ghost" onclick="fecharModal()">Fechar</button>
        </div>

        <div class="overlay-body">
          <div class="sheet-grid">
            <div class="panel">
              <div class="panel-title">Informações básicas</div>
              <div class="panel-body">
                <div class="row-3">
                  <div class="field">
                    <label>Nome</label>
                    <input
                      value="${escapeAttr(equip.nome)}"
                      oninput="updateEquipamento('${equip.id}', 'nome', this.value)"
                    >
                  </div>

                  <div class="field">
                    <label>Quantidade</label>
                    <input
                      type="number"
                      min="1"
                      value="${escapeAttr(equip.quantidade)}"
                      oninput="updateEquipamento('${equip.id}', 'quantidade', this.value)"
                    >
                  </div>

                  <div class="field">
                    <label>Slots / peso</label>
                    <input
                      type="number"
                      min="0"
                      value="${escapeAttr(equip.slots)}"
                      oninput="updateEquipamento('${equip.id}', 'slots', this.value)"
                    >
                  </div>
                </div>

                <div style="height:14px"></div>

                <div class="field">
                  <label>Preço</label>
                  <input
                    value="${escapeAttr(equip.preco)}"
                    oninput="updateEquipamento('${equip.id}', 'preco', this.value)"
                  >
                </div>
              </div>
            </div>

            <div class="panel">
              <div class="panel-title">Descrição</div>
              <div class="panel-body">
                <div class="field">
                  <textarea
                    oninput="updateEquipamento('${equip.id}', 'descricao', this.value)"
                  >${escapeHtml(equip.descricao)}</textarea>
                </div>
              </div>
            </div>

            <div class="panel">
              <div class="panel-title">Efeitos</div>
              <div class="panel-body">
                <div class="field">
                  <textarea
                    oninput="updateEquipamento('${equip.id}', 'efeitos', this.value)"
                  >${escapeHtml(equip.efeitos)}</textarea>
                </div>
              </div>
            </div>

            <div class="actions">
              <button class="btn danger" onclick="excluirEquipamento('${equip.id}')">Excluir equipamento</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderHabilidadeModal() {
  if (state.modal !== "habilidade") return "";

  const habilidade = getHabilidadeAtual();
  if (!habilidade) return "";

  setTimeout(() => {
    document.body.classList.add("modal-open");
  }, 0);

  return `
    <div class="overlay" onclick="fecharModal()">
      <div class="overlay-card" onclick="event.stopPropagation()">
        <div class="overlay-header">
          <div>
            <div class="overlay-title">Habilidade</div>
            <div class="subtitle">Descrição e edição</div>
          </div>
          <button class="btn ghost" onclick="fecharModal()">Fechar</button>
        </div>

        <div class="overlay-body">
          <div class="sheet-grid">
            <div class="panel">
              <div class="panel-title">Informações básicas</div>
              <div class="panel-body">
                <div class="row-2">
                  <div class="field">
                    <label>Nome</label>
                    <input
                      value="${escapeAttr(habilidade.nome)}"
                      oninput="updateHabilidade('${habilidade.id}', 'nome', this.value)"
                    >
                  </div>

                  <div class="field">
                    <label>Custo de PM</label>
                    <input
                      type="number"
                      min="0"
                      value="${escapeAttr(habilidade.custoPm)}"
                      oninput="updateHabilidade('${habilidade.id}', 'custoPm', this.value)"
                    >
                  </div>
                </div>
              </div>
            </div>

            <div class="panel">
              <div class="panel-title">Descrição</div>
              <div class="panel-body">
                <div class="field">
                  <textarea
                    oninput="updateHabilidade('${habilidade.id}', 'descricao', this.value)"
                  >${escapeHtml(habilidade.descricao)}</textarea>
                </div>
              </div>
            </div>

            <div class="actions">
              <button class="btn danger" onclick="excluirHabilidade('${habilidade.id}')">Excluir habilidade</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderAtributo(nome, campo, valor) {
  return `
    <div class="attr">

      <div class="attr-header">
        ${escapeHtml(nome.toUpperCase())}
      </div>

      <button class="attr-btn" onclick="subirAtributo('${campo}')">
        +
      </button>

      <div class="attr-value">
        ${escapeHtml(valor)}
      </div>

      <button class="attr-btn" onclick="descerAtributo('${campo}')">
        -
      </button>

    </div>
  `;
}

function renderMagiaModal() {
  if (state.modal !== "magia") return "";

  const magia = getMagiaAtual();
  const ficha = getFichaAtual();
  if (!magia || !ficha) return "";

  const pmAtual = Number(ficha.pmAtual) || 0;
  const custoBase = Number(magia.custoPm) || 0;
  const custoTotal = getCustoTotalMagia(magia);
  const semPmParaBase = pmAtual < custoBase;
  const excedeu = custoTotal > pmAtual;

  setTimeout(() => {
    document.body.classList.add("modal-open");
  }, 0);

  return `
    <div class="overlay" onclick="fecharModal()">
      <div class="overlay-card" onclick="event.stopPropagation()">
        <div class="overlay-header">
          <div>
            <div class="overlay-title">Magia</div>
            <div class="subtitle">Detalhes, incrementos e uso</div>
          </div>
          <button class="btn ghost" onclick="fecharModal()">Fechar</button>
        </div>

        <div class="overlay-body">
          <div class="sheet-grid">
            <div class="panel">
              <div class="panel-title">Informações básicas</div>
              <div class="panel-body">
                <div class="row-3">
                  <div class="field">
                    <label>Nome</label>
                    <input
                      value="${escapeAttr(magia.nome)}"
                      oninput="updateMagia('${magia.id}', 'nome', this.value)"
                    >
                  </div>

                  <div class="field">
                    <label>Círculo</label>
                    <input
                      value="${escapeAttr(magia.circulo)}"
                      oninput="updateMagia('${magia.id}', 'circulo', this.value)"
                    >
                  </div>

                  <div class="field">
                    <label>Custo base de PM</label>
                    <input
                      type="number"
                      min="0"
                      value="${escapeAttr(magia.custoPm)}"
                      oninput="updateMagia('${magia.id}', 'custoPm', this.value)"
                    >
                  </div>
                </div>

                <div style="height:14px"></div>

                <div class="row-3">
                  <div class="field">
                    <label>Execução</label>
                    <input
                      value="${escapeAttr(magia.execucao)}"
                      oninput="updateMagia('${magia.id}', 'execucao', this.value)"
                    >
                  </div>

                  <div class="field">
                    <label>Alcance</label>
                    <input
                      value="${escapeAttr(magia.alcance)}"
                      oninput="updateMagia('${magia.id}', 'alcance', this.value)"
                    >
                  </div>

                  <div class="field">
                    <label>Área</label>
                    <input
                      value="${escapeAttr(magia.area)}"
                      oninput="updateMagia('${magia.id}', 'area', this.value)"
                    >
                  </div>
                </div>

                <div style="height:14px"></div>

                <div class="row-2">
                  <div class="field">
                    <label>Duração</label>
                    <input
                      value="${escapeAttr(magia.duracao)}"
                      oninput="updateMagia('${magia.id}', 'duracao', this.value)"
                    >
                  </div>

                  <div class="field">
                    <label>Resistência</label>
                    <input
                      value="${escapeAttr(magia.resistencia)}"
                      oninput="updateMagia('${magia.id}', 'resistencia', this.value)"
                    >
                  </div>
                </div>
              </div>
            </div>

            <div class="panel">
              <div class="panel-title">Descrição</div>
              <div class="panel-body">
                <div class="field">
                  <textarea
                    oninput="updateMagia('${magia.id}', 'descricao', this.value)"
                  >${escapeHtml(magia.descricao)}</textarea>
                </div>
              </div>
            </div>

            <div class="panel">
              <div class="panel-title">Incrementos</div>
              <div class="panel-body">
                ${
  !magia.incrementos.length
    ? `<div class="empty">Nenhum incremento cadastrado.</div>`
    : `
      <div class="list">
        ${magia.incrementos.map(inc => {
          const disabled = !inc.selecionado && !podeSelecionarIncremento(magia, inc.id);

          return `
            <div class="list-item" style="align-items:flex-start;">
              <div style="display:flex; gap:10px; align-items:flex-start; flex:1;">
                <input
                  type="checkbox"
                  ${inc.selecionado ? "checked" : ""}
                  ${disabled ? "disabled" : ""}
                  onchange="updateIncrementoMagia('${magia.id}', '${inc.id}', 'selecionado', this.checked)"
                  style="margin-top:4px;"
                >

                <div style="flex:1;">
                  <div class="field">
                    <label>Custo do incremento</label>
                    <input
                      type="number"
                      min="0"
                      value="${escapeAttr(inc.custoPm)}"
                      oninput="updateIncrementoMagia('${magia.id}', '${inc.id}', 'custoPm', this.value)"
                    >
                  </div>

                  <div class="field" style="margin-top:8px;">
                    <label>Descrição do incremento</label>
                    <textarea
                      oninput="updateIncrementoMagia('${magia.id}', '${inc.id}', 'descricao', this.value)"
                    >${escapeHtml(inc.descricao || "")}</textarea>
                  </div>
                </div>
              </div>

              <div class="actions">
                <button class="btn danger" onclick="excluirIncrementoMagia('${magia.id}', '${inc.id}')">Excluir</button>
              </div>
            </div>
          `;
        }).join("")}
      </div>
    `
}

                <div style="height:14px"></div>

                <button class="btn" onclick="addIncrementoMagia('${magia.id}')">Adicionar incremento</button>
              </div>
            </div>

            <div class="panel">
              <div class="panel-title">Resumo de uso</div>
              <div class="panel-body">
                <div class="notice" style="${excedeu || semPmParaBase ? "background:#ffd7d7; border-color:#c43a3a; color:#7a1010;" : ""}">
                  PM atual: <strong>${pmAtual}</strong><br>
                  Custo base: <strong>${custoBase}</strong><br>
                  Custo total: <strong style="${excedeu || semPmParaBase ? "color:#b00020;" : ""}">${custoTotal}</strong>
                </div>

                <div style="height:12px"></div>

                <div class="actions">
                  <button
                    class="btn primary"
                    onclick="usarMagiaAtual()"
                    ${excedeu || semPmParaBase ? "disabled" : ""}
                  >
                    Usar magia
                  </button>

                  <button class="btn danger" onclick="excluirMagia('${magia.id}')">
                    Excluir magia
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

function salvarAviso() {
  saveFichas();
  alert("Ficha salva no navegador.");
}

function addGrupoDado() {
  state.dados.grupos.push({
    id: uid(),
    quantidade: 1,
    tipo: "d6"
  });
  render();
}

function removeGrupoDado(id) {
  if (state.dados.grupos.length === 1) return;
  state.dados.grupos = state.dados.grupos.filter(g => g.id !== id);
  render();
}

function updateGrupoDado(id, field, value) {
  const grupo = state.dados.grupos.find(g => g.id === id);
  if (!grupo) return;

  if (field === "quantidade") {
    grupo[field] = Math.max(1, Number(value) || 1);
  } else {
    grupo[field] = value;
  }
}

function rolarGrupo(quantidade, tipo) {
  const faces = Number(tipo.replace("d", ""));
  const resultados = [];

  for (let i = 0; i < quantidade; i++) {
    resultados.push(Math.floor(Math.random() * faces) + 1);
  }

  return {
    quantidade,
    tipo,
    resultados,
    subtotal: resultados.reduce((a, b) => a + b, 0)
  };
}

function rolarTodosDados() {
  const gruposRolados = state.dados.grupos.map(g =>
    rolarGrupo(g.quantidade, g.tipo)
  );

  const total = gruposRolados.reduce((acc, grupo) => acc + grupo.subtotal, 0);

  const formula = gruposRolados
    .map(g => `${g.quantidade}${g.tipo}`)
    .join(" + ");

  const resultado = {
    id: uid(),
    data: new Date().toISOString(),
    formula,
    grupos: gruposRolados,
    total
  };

  state.dados.ultimoResultado = resultado;
  state.dados.historico.unshift(resultado);
  state.dados.historico = state.dados.historico.slice(0, 20);
  saveDadosHistorico();

  render();
}

function limparHistoricoDados() {
  const ok = confirm("Limpar histórico de rolagens?");
  if (!ok) return;

  state.dados.historico = [];
  saveDadosHistorico();
  render();
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function escapeAttr(value) {
  return escapeHtml(value);
}

function render() {
  if (state.screen === "home") return renderHome();
  if (state.screen === "personagens") return renderPersonagens();
  if (state.screen === "criacao") return renderCriacao();
  if (state.screen === "evolucao") return renderEvolucao();
  if (state.screen === "livro") return renderLivro();
  if (state.screen === "dados") return renderDados();
  if (state.screen === "ficha") return renderFicha();
}

let pdfDoc = null;
let pdfPagesText = [];
let pdfRenderedScale = 1.25;
let pdfPageStates = [];
let pdfObserver = null;
let pdfPageMaps = [];

let activeSearchTerm = "";
let searchMatches = [];
let currentMatchIndex = -1;

const DB_NAME = "t20LivroDB";
const STORE_NAME = "arquivos";
const PDF_KEY = "livroPdf";
const PDF_READING_STATE_KEY = "livroReadingState";

function setPdfStatus(text) {
  const el = document.getElementById("pdfStatus");
  if (el) el.textContent = text;
}

function setPdfSearchInfo(text) {
  const el = document.getElementById("pdfSearchInfo");
  if (el) el.textContent = text;
}

function abrirBanco() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);

    request.onupgradeneeded = function (event) {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = function () {
      resolve(request.result);
    };

    request.onerror = function () {
      reject(request.error);
    };
  });
}

async function salvarPdfNoBanco(arrayBuffer) {
  const db = await abrirBanco();

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    const request = store.put(arrayBuffer, PDF_KEY);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

async function lerPdfDoBanco() {
  const db = await abrirBanco();

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    const request = store.get(PDF_KEY);

    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => reject(request.error);
  });
}

async function iniciarPDF() {
  try {
    const pdfSalvo = await lerPdfDoBanco();
    if (pdfSalvo) {
      setPdfStatus("Abrindo PDF salvo...");
      await abrirPDF(pdfSalvo);
    } else {
      setPdfStatus("Nenhum PDF carregado.");
    }
  } catch (err) {
    console.error("Erro ao iniciar PDF:", err);
    setPdfStatus("Erro ao abrir PDF salvo.");
  }
}

async function carregarPDF() {
  const input = document.getElementById("pdfUpload");

  if (!input || !input.files || !input.files.length) {
    alert("Selecione um arquivo PDF primeiro.");
    return;
  }

  const file = input.files[0];

  try {
    setPdfStatus("Lendo arquivo...");
    const arrayBuffer = await file.arrayBuffer();
    await salvarPdfNoBanco(arrayBuffer);
    await abrirPDF(arrayBuffer);
  } catch (err) {
    console.error("Erro ao carregar PDF:", err);
    alert("Não foi possível carregar esse PDF.");
    setPdfStatus("Falha ao carregar PDF.");
  }
}

async function abrirPDF(data) {
  try {
    destruirObserverPdf();

    activeSearchTerm = "";
    searchMatches = [];
    currentMatchIndex = -1;
    setPdfSearchInfo("");

    setPdfStatus("Processando PDF...");
    const loadingTask = pdfjsLib.getDocument({ data });
    pdfDoc = await loadingTask.promise;

    pdfPagesText = new Array(pdfDoc.numPages).fill("");
    pdfPageMaps = new Array(pdfDoc.numPages).fill(null);
    pdfPageStates = new Array(pdfDoc.numPages).fill(null).map(() => ({
      rendered: false,
      rendering: false,
      textReady: false,
      width: 0,
      height: 0,
      textDivs: [],
      matches: []
    }));

    await prepararEstruturaPaginas();
    iniciarObserverPdf();
    configurarPersistenciaDeLeitura();

    await restaurarEstadoLeitura();

    setPdfStatus(`PDF carregado. ${pdfDoc.numPages} páginas.`);
  } catch (err) {
    console.error("Erro ao abrir PDF:", err);
    alert("Não foi possível abrir o PDF.");
    setPdfStatus("Falha ao abrir PDF.");
  }
}

function destruirObserverPdf() {
  if (pdfObserver) {
    pdfObserver.disconnect();
    pdfObserver = null;
  }
}

async function prepararEstruturaPaginas() {
  const pagesContainer = document.getElementById("pdfPages");
  if (!pagesContainer || !pdfDoc) return;

  pagesContainer.innerHTML = "";

  const firstPage = await pdfDoc.getPage(1);
  const firstViewport = firstPage.getViewport({ scale: pdfRenderedScale });
  const ratio = firstViewport.height / firstViewport.width;

  for (let num = 1; num <= pdfDoc.numPages; num++) {
    const pageWrap = document.createElement("div");
    pageWrap.className = "pdf-page loading";
    pageWrap.dataset.page = String(num);

    const width = Math.min(firstViewport.width, 900);
    const height = width * ratio;

    pageWrap.style.maxWidth = `${width}px`;
    pageWrap.style.minHeight = `${height}px`;
    pageWrap.innerHTML = `<div>Carregando página ${num}...</div>`;

    pagesContainer.appendChild(pageWrap);
  }
}

function iniciarObserverPdf() {
  const wrap = document.getElementById("pdfViewerWrap");
  const pageEls = document.querySelectorAll(".pdf-page");

  if (!wrap || !pageEls.length) return;

  pdfObserver = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const pageNum = Number(entry.target.dataset.page);
        renderPaginaSobDemanda(pageNum);
      }
    },
    {
      root: wrap,
      rootMargin: "1200px 0px",
      threshold: 0.01
    }
  );

  pageEls.forEach((el) => pdfObserver.observe(el));

  renderPaginaSobDemanda(1);
  renderPaginaSobDemanda(2);
  renderPaginaSobDemanda(3);
}

function buildPageTextMap(textItems) {
  let fullText = "";
  const itemRanges = [];

  for (let i = 0; i < textItems.length; i++) {
    const str = textItems[i].str || "";
    const start = fullText.length;
    fullText += str;
    const end = fullText.length;

    itemRanges.push({
      index: i,
      start,
      end,
      text: str
    });

    if (i < textItems.length - 1) {
      fullText += " ";
    }
  }

  return {
    fullText,
    itemRanges
  };
}

function findMatchesInPageMap(pageMap, regex) {
  const matches = [];
  if (!pageMap || !regex) return matches;

  regex.lastIndex = 0;

  let result;
  while ((result = regex.exec(pageMap.fullText)) !== null) {
    const matchStart = result.index;
    const matchText = result[0];
    const matchEnd = matchStart + matchText.length;

    const matchedItems = pageMap.itemRanges
      .filter(item => item.end > matchStart && item.start < matchEnd)
      .map(item => item.index);

    matches.push({
      start: matchStart,
      end: matchEnd,
      itemIndexes: matchedItems
    });

    if (result.index === regex.lastIndex) {
      regex.lastIndex++;
    }
  }

  return matches;
}

function clearTextHighlightsOnPage(pageNumber) {
  const pageState = pdfPageStates[pageNumber - 1];
  if (!pageState?.textDivs) return;

  pageState.textDivs.forEach(div => {
    if (!div) return;
    div.classList.remove("pdf-text-hit", "pdf-text-hit-current");
  });
}

function applyMatchHighlight(pageNumber, match, isCurrent = false) {
  const pageEl = document.querySelector(`.pdf-page[data-page="${pageNumber}"]`);
  if (!pageEl || !match) return;

  const pageState = pdfPageStates[pageNumber - 1];
  if (!pageState?.textDivs) return;

  match.itemIndexes.forEach(idx => {
    const div = pageState.textDivs[idx];
    if (!div) return;
    div.classList.add(isCurrent ? "pdf-text-hit-current" : "pdf-text-hit");
  });
}

function clearAllTextHighlights() {
  pdfPageStates.forEach((state, idx) => {
    if (state?.textDivs?.length) {
      state.textDivs.forEach(div => {
        if (!div) return;
        div.classList.remove("pdf-text-hit", "pdf-text-hit-current");
      });
    }
  });
}

async function renderPaginaSobDemanda(num) {
  if (!pdfDoc) return;

  const state = pdfPageStates[num - 1];
  if (!state || state.rendered || state.rendering) return;

  state.rendering = true;

  try {
    const page = await pdfDoc.getPage(num);
    const viewport = page.getViewport({ scale: pdfRenderedScale });

    const pageWrap = document.querySelector(`.pdf-page[data-page="${num}"]`);
    if (!pageWrap) {
      state.rendering = false;
      return;
    }

    pageWrap.innerHTML = "";
    pageWrap.classList.remove("loading");
    pageWrap.style.maxWidth = `${viewport.width}px`;
    pageWrap.style.minHeight = `${viewport.height}px`;
    pageWrap.style.height = `${viewport.height}px`;

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = viewport.width;
    canvas.height = viewport.height;

    const textLayerDiv = document.createElement("div");
    textLayerDiv.className = "textLayer";
    textLayerDiv.style.width = `${viewport.width}px`;
    textLayerDiv.style.height = `${viewport.height}px`;

    pageWrap.appendChild(canvas);
    pageWrap.appendChild(textLayerDiv);

    await page.render({
      canvasContext: ctx,
      viewport
    }).promise;

    const textContent = await page.getTextContent();
    const pageMap = buildPageTextMap(textContent.items);

    pdfPagesText[num - 1] = pageMap.fullText;
    pdfPageMaps[num - 1] = pageMap;

    const textDivs = [];
    const textLayerTask = pdfjsLib.renderTextLayer({
      textContent,
      container: textLayerDiv,
      viewport,
      textDivs
    });

    if (textLayerTask?.promise) {
      await textLayerTask.promise;
    }

    state.width = viewport.width;
    state.height = viewport.height;
    state.textReady = true;
    state.rendered = true;
    state.textDivs = textDivs;

    if (activeSearchTerm) {
      const options = getSearchOptions();
      const regex = buildSearchRegex(activeSearchTerm, options);
      const matches = findMatchesInPageMap(pageMap, regex);
      state.matches = matches;

      matches.forEach(match => applyMatchHighlight(num, match, false));
    }
  } catch (err) {
    console.error(`Erro ao renderizar página ${num}:`, err);
  } finally {
    state.rendering = false;
  }
}

function limparDestaquesBusca() {
  document.querySelectorAll(".pdf-hit").forEach(el => el.classList.remove("pdf-hit"));
  clearAllTextHighlights();
}

function salvarEstadoLeitura(state) {
  localStorage.setItem(PDF_READING_STATE_KEY, JSON.stringify(state));
}

function lerEstadoLeitura() {
  try {
    return JSON.parse(localStorage.getItem(PDF_READING_STATE_KEY)) || null;
  } catch {
    return null;
  }
}

function configurarPersistenciaDeLeitura() {
  const wrap = document.getElementById("pdfViewerWrap");
  if (!wrap) return;

  let timeout = null;

  wrap.addEventListener("scroll", () => {
    clearTimeout(timeout);

    timeout = setTimeout(() => {
      const pages = [...document.querySelectorAll(".pdf-page")];
      if (!pages.length) return;

      const wrapRect = wrap.getBoundingClientRect();

      let bestPage = null;
      let bestDistance = Infinity;

      pages.forEach((pageEl) => {
        const rect = pageEl.getBoundingClientRect();
        const distance = Math.abs(rect.top - wrapRect.top);

        if (distance < bestDistance) {
          bestDistance = distance;
          bestPage = Number(pageEl.dataset.page);
        }
      });

      if (bestPage) {
        salvarEstadoLeitura({ page: bestPage });
      }
    }, 150);
  });
}

async function restaurarEstadoLeitura() {
  const state = lerEstadoLeitura();
  if (!state?.page || !pdfDoc) return;

  const pagina = Number(state.page);
  if (!pagina || pagina < 1 || pagina > pdfDoc.numPages) return;

  await renderPaginaSobDemanda(pagina);

  const pageEl = document.querySelector(`.pdf-page[data-page="${pagina}"]`);
  if (pageEl) {
    pageEl.scrollIntoView({ behavior: "auto", block: "start" });
    setPdfStatus(`PDF carregado. Retomado na página ${pagina}.`);
  }
}

async function garantirTextoDaPagina(pageNumber) {
  if (!pdfDoc) return "";

  if (pdfPageMaps[pageNumber - 1]?.fullText) {
    return pdfPageMaps[pageNumber - 1].fullText;
  }

  const page = await pdfDoc.getPage(pageNumber);
  const textContent = await page.getTextContent();
  const pageMap = buildPageTextMap(textContent.items);

  pdfPageMaps[pageNumber - 1] = pageMap;
  pdfPagesText[pageNumber - 1] = pageMap.fullText;

  return pageMap.fullText;
}

function aplicarHighlightsNaPagina(pageNumber) {
  const termo = activeSearchTerm.trim();
  if (!termo) return;

  const options = getSearchOptions();
  const regex = buildSearchRegex(termo, options);
  if (!regex) return;

  const pageEl = document.querySelector(`.pdf-page[data-page="${pageNumber}"]`);
  if (!pageEl) return;

  const spans = pageEl.querySelectorAll(".textLayer span");

  spans.forEach(span => {
    span.classList.remove("pdf-text-hit", "pdf-text-hit-current");

    const txt = span.textContent || "";
    regex.lastIndex = 0;

    if (regex.test(txt)) {
      span.classList.add("pdf-text-hit");
    }
  });
}

function atualizarHighlightAtual() {
  clearAllTextHighlights();

  if (currentMatchIndex < 0 || currentMatchIndex >= searchMatches.length) return;

  const current = searchMatches[currentMatchIndex];
  const pageState = pdfPageStates[current.page - 1];
  const pageMap = pdfPageMaps[current.page - 1];

  if (!pageMap) return;

  const options = getSearchOptions();
  const regex = buildSearchRegex(activeSearchTerm, options);
  const matches = findMatchesInPageMap(pageMap, regex);

  matches.forEach((match, idx) => {
    applyMatchHighlight(current.page, match, idx === current.matchIndexOnPage);
  });

  const currentMatch = matches[current.matchIndexOnPage];
  if (!currentMatch) return;

  const textDivs = pageState?.textDivs || [];
  const firstIdx = currentMatch.itemIndexes[0];
  const firstDiv = textDivs[firstIdx];

  if (firstDiv) {
    firstDiv.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });
  }
}

function escapeRegex(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function getSearchOptions() {
  const wholeWord = document.getElementById("searchWholeWord")?.checked ?? true;
  return { wholeWord };
}

function buildSearchRegex(term, options = {}) {
  const escaped = escapeRegex(term.trim());
  if (!escaped) return null;

  const flags = "giu";

  if (options.wholeWord) {
    return new RegExp(`(?<![\\p{L}\\p{N}_])${escaped}(?![\\p{L}\\p{N}_])`, flags);
  }

  return new RegExp(escaped, flags);
}

function textMatchesSearch(text, regex) {
  if (!regex) return false;
  regex.lastIndex = 0;
  return regex.test(text);
}

function normalizeForSearch(text, caseSensitive) {
  return caseSensitive ? text : text.toLowerCase();
}

async function buscarTexto() {
  const input = document.getElementById("searchText");
  if (!input || !pdfDoc) return;

  const termo = input.value.trim();
  limparDestaquesBusca();

  activeSearchTerm = termo;
  searchMatches = [];
  currentMatchIndex = -1;

  if (!termo) {
    setPdfStatus(`PDF carregado. ${pdfDoc.numPages} páginas.`);
    setPdfSearchInfo("");
    return;
  }

  const options = getSearchOptions();
  const regex = buildSearchRegex(termo, options);

  if (!regex) {
    setPdfStatus("Busca inválida.");
    setPdfSearchInfo("");
    return;
  }

  setPdfStatus(`Buscando por "${termo}"...`);

  for (let i = 1; i <= pdfDoc.numPages; i++) {
    await garantirTextoDaPagina(i);

    const pageMap = pdfPageMaps[i - 1];
    const matches = findMatchesInPageMap(pageMap, regex);

    if (matches.length > 0) {
      searchMatches.push(
        ...matches.map((match, localIndex) => ({
          page: i,
          matchIndexOnPage: localIndex,
          itemIndexes: match.itemIndexes
        }))
      );
    }
  }

  if (searchMatches.length === 0) {
    setPdfStatus(`Nenhum resultado para: "${termo}"`);
    setPdfSearchInfo("");
    return;
  }

  currentMatchIndex = 0;
  await navegarParaResultadoAtual();
}

async function navegarParaResultadoAtual() {
  if (currentMatchIndex < 0 || currentMatchIndex >= searchMatches.length) return;

  limparDestaquesBusca();

  const current = searchMatches[currentMatchIndex];
  await renderPaginaSobDemanda(current.page);

  const pageEl = document.querySelector(`.pdf-page[data-page="${current.page}"]`);
  if (pageEl) {
    pageEl.classList.add("pdf-hit");
    pageEl.scrollIntoView({ behavior: "smooth", block: "center" });
    salvarEstadoLeitura({ page: current.page });
  }

  atualizarHighlightAtual();
  setPdfStatus(`Resultado ${currentMatchIndex + 1} de ${searchMatches.length} na página ${current.page}.`);
  setPdfSearchInfo(`"${activeSearchTerm}" — resultado ${currentMatchIndex + 1} de ${searchMatches.length}`);
}

async function proximoResultado() {
  if (searchMatches.length === 0) return;
  currentMatchIndex = (currentMatchIndex + 1) % searchMatches.length;
  await navegarParaResultadoAtual();
}

async function resultadoAnterior() {
  if (searchMatches.length === 0) return;
  currentMatchIndex = (currentMatchIndex - 1 + searchMatches.length) % searchMatches.length;
  await navegarParaResultadoAtual();
}

async function irParaPagina() {
  if (!pdfDoc) return;

  const input = document.getElementById("goPageInput");
  if (!input) return;

  const pagina = Number(input.value);
  if (!pagina || pagina < 1 || pagina > pdfDoc.numPages) {
    alert(`Digite uma página entre 1 e ${pdfDoc.numPages}.`);
    return;
  }

  limparDestaquesBusca();
  await renderPaginaSobDemanda(pagina);

  const pageEl = document.querySelector(`.pdf-page[data-page="${pagina}"]`);
  if (pageEl) {
    pageEl.classList.add("pdf-hit");
    pageEl.scrollIntoView({ behavior: "smooth", block: "start" });
    setPdfStatus(`Indo para a página ${pagina}.`);
    setPdfSearchInfo("");
    salvarEstadoLeitura({ page: pagina });
  }
}
carregarTodosOsBancos().then(() => {
    render();
});