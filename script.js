const STORAGE_KEY = "t20_fichas_v1";
const DADOS_HISTORY_KEY = "t20_dados_history_v1";
const MESTRE_INICIATIVA_STORAGE_KEY = "t20_mestre_iniciativa_v1";
const RASCUNHO_CRIACAO_KEY = "t20_ficha_em_andamento_v1";
const MENU_USUARIO_TEMA_KEY = "t20_menu_usuario_tema";
const app = document.getElementById("app");
const MESTRE_MODAL_BASE_DPR = window.devicePixelRatio || 1;
const PROFICIENCIAS_DISPONIVEIS = [
    "Armas simples",
    "Armas marciais",
    "Armas exÃ³ticas",
    "Armas de fogo",
    "Armaduras leves",
    "Armaduras pesadas",
    "Escudos"
];

const ESPECIALIZACOES_OFICIO = [
    "Alfaiate",
    "Alquimista",
    "Armeiro",
    "ArtesÃ£o",
    "Cozinheiro",
    "Escriba",
    "Fazendeiro",
    "Minerador",
    "Engenhoqueiro"
];
const PODERES_INVENTOR_FORMULAS = {
    alquimistaIniciado: "Alquimista Iniciado",
    mestreAlquimista: "Mestre Alquimista"
};
const GOLPE_PESSOAL_EFEITOS = [
    {
        codigo: "amplo",
        nome: "Amplo",
        custoPm: 3,
        repetivel: false,
        descricao: "Seu ataque atinge todas as criaturas em alcance curto (incluindo aliados, mas nÃ£o vocÃª mesmo). FaÃ§a um Ãºnico teste de ataque e compare com a Defesa de cada criatura."
    },
    {
        codigo: "atordoante",
        nome: "Atordoante",
        custoPm: 2,
        repetivel: false,
        descricao: "Uma criatura que sofra dano do ataque fica atordoada por uma rodada (apenas uma vez por cena; Fortitude CD For anula)."
    },
    {
        codigo: "brutal",
        nome: "Brutal",
        custoPm: 1,
        repetivel: false,
        descricao: "Fornece um dado extra de dano do mesmo tipo."
    },
    {
        codigo: "conjurador",
        nome: "Conjurador",
        custoPm: 0,
        repetivel: false,
        exigeMagia: true,
        descricao: "Escolha uma magia de 1Âº ou 2Âº cÃ­rculos. Se acertar seu golpe, vocÃª lanÃ§a a magia como aÃ§Ã£o livre."
    },
    {
        codigo: "destruidor",
        nome: "Destruidor",
        custoPm: 2,
        repetivel: false,
        descricao: "Aumenta o multiplicador de crÃ­tico em +1."
    },
    {
        codigo: "distante",
        nome: "Distante",
        custoPm: 1,
        repetivel: false,
        descricao: "Aumenta o alcance em um passo."
    },
    {
        codigo: "elemental",
        nome: "Elemental",
        custoPm: 2,
        repetivel: true,
        exigeElemento: true,
        descricao: "Causa +2d6 pontos de dano de Ã¡cido, eletricidade, fogo ou frio."
    },
    {
        codigo: "impactante",
        nome: "Impactante",
        custoPm: 1,
        repetivel: false,
        descricao: "Empurra o alvo 1,5m para cada 10 pontos de dano causado (arredondado para baixo)."
    },
    {
        codigo: "letal",
        nome: "Letal",
        custoPm: 2,
        repetivel: true,
        maxUsos: 2,
        descricao: "Aumenta a margem de ameaÃ§a em +2. VocÃª pode escolher este efeito duas vezes para aumentar a margem de ameaÃ§a em +5."
    },
    {
        codigo: "penetrante",
        nome: "Penetrante",
        custoPm: 1,
        repetivel: false,
        descricao: "Ignora 10 pontos de RD."
    },
    {
        codigo: "preciso",
        nome: "Preciso",
        custoPm: 1,
        repetivel: false,
        descricao: "Quando faz o teste de ataque, vocÃª rola dois dados e usa o melhor resultado."
    },
    {
        codigo: "qualquer_arma",
        nome: "Qualquer Arma",
        custoPm: 1,
        repetivel: false,
        descricao: "VocÃª pode usar seu Golpe Pessoal com qualquer tipo de arma."
    },
    {
        codigo: "ricocheteante",
        nome: "Ricocheteante",
        custoPm: 1,
        repetivel: false,
        descricao: "A arma volta para vocÃª apÃ³s o ataque."
    },
    {
        codigo: "teleguiado",
        nome: "Teleguiado",
        custoPm: 1,
        repetivel: false,
        descricao: "Ignora penalidades por camuflagem ou cobertura leves."
    },
    {
        codigo: "lento",
        nome: "Lento",
        custoPm: -2,
        repetivel: false,
        descricao: "Seu ataque exige uma aÃ§Ã£o completa para ser usado."
    },
    {
        codigo: "perto_da_morte",
        nome: "Perto da Morte",
        custoPm: -2,
        repetivel: false,
        descricao: "O ataque sÃ³ pode ser usado se vocÃª estiver com um quarto de seus PV ou menos."
    },
    {
        codigo: "sacrificio",
        nome: "SacrifÃ­cio",
        custoPm: -2,
        repetivel: false,
        descricao: "Sempre que usa seu Golpe Pessoal, vocÃª perde 10 PV."
    }
];

let AMEACAS_DB = {
    ameacas: [],
    poderes: [],
    magias: [],
    equipamento: [],
    tesouro: []
};
let AMEACAS_DB_CARREGADO = false;

let REGRAS_DB = {};
let REGRAS_DB_CARREGADO = false;

async function carregarRegrasDB() {
    if (REGRAS_DB_CARREGADO) return;

    try {
        const res = await fetch("regras.json");
        if (!res.ok) throw new Error("regras.json nÃ£o encontrado");

        const data = await res.json();
        REGRAS_DB = data && typeof data === "object" ? data : {};
    } catch (err) {
        console.warn("Erro carregando regras.json:", err);
        REGRAS_DB = {};
    }

    REGRAS_DB_CARREGADO = true;
}
function garantirEstadoAmeacasMestre() {
    if (!state.mestre) state.mestre = {};

    if (!Array.isArray(state.mestre.ameacasEmCena)) {
        state.mestre.ameacasEmCena = [];
    }

    if (typeof state.mestre.ameacaSelecionadaInstanciaId !== "string") {
        state.mestre.ameacaSelecionadaInstanciaId = "";
    }

    if (typeof state.mestre.jogadoresAbertos !== "boolean") {
        state.mestre.jogadoresAbertos = true;
    }

    if (typeof state.mestre.ameacasAbertas !== "boolean") {
        state.mestre.ameacasAbertas = true;
    }

    if (typeof state.mestre.iniciativaAberta !== "boolean") {
        state.mestre.iniciativaAberta = false;
    }

    if (!Array.isArray(state.mestre.iniciativaOrdem)) {
        state.mestre.iniciativaOrdem = [];
    }
    if (typeof state.mestre.iniciativaMinimizada !== "boolean") {
        state.mestre.iniciativaMinimizada = false;
    }

    if (!state.mestre.ameacasModal) {
        state.mestre.ameacasModal = {
            nd: "",
            busca: "",
            selecionadas: {}
        };
    }
}

const GOLPE_PESSOAL_ELEMENTOS = ["Ã¡cido", "eletricidade", "fogo", "frio"];
const GOLPE_PESSOAL_ATRIBUTOS_MENTAIS = ["inteligencia", "sabedoria", "carisma"];

let RACAS_DB = [];
let RACAS_DB_CARREGADO = false;

const RACAS_FALLBACK = [
    {
        id: "humano",
        nome: "Humano",
        tipoAtributo: "distribuivel3",
        tamanho: "MÃ©dio",
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
                nome: "VersÃ¡til",
                custoPm: 0,
                descricao: "VocÃª recebe um poder geral Ã  sua escolha."
            }
        ],
        periciasOutros: [],
        proficiencias: []
    },
    {
        id: "elfo",
        nome: "Elfo",
        tipoAtributo: "fixo",
        tamanho: "MÃ©dio",
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
                nome: "Sentidos Ã‰lficos",
                custoPm: 0,
                descricao: "VocÃª recebe os benefÃ­cios raciais correspondentes."
            }
        ],
        periciasOutros: [],
        proficiencias: []
    },
    {
        id: "anao",
        nome: "AnÃ£o",
        tipoAtributo: "fixo",
        tamanho: "MÃ©dio",
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
                nome: "TradiÃ§Ã£o de Heredrimm",
                custoPm: 0,
                descricao: "VocÃª recebe os benefÃ­cios raciais correspondentes."
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
        descricao: "Especialista em combate e resistÃªncia.",
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

async function carregarAmeacasDB() {
    if (AMEACAS_DB_CARREGADO) return;

    try {
        const res = await fetch("ameacas.json");
        if (!res.ok) throw new Error("ameacas.json nÃ£o encontrado");

        const data = await res.json();

        AMEACAS_DB = {
            ameacas: Array.isArray(data.ameacas) ? data.ameacas : [],
            poderes: Array.isArray(data.ameacas_poderes) ? data.ameacas_poderes : [],
            magias: Array.isArray(data.ameacas_magias) ? data.ameacas_magias : [],
            equipamento: Array.isArray(data.ameacas_equipamento) ? data.ameacas_equipamento : [],
            tesouro: Array.isArray(data.ameacas_tesouro) ? data.ameacas_tesouro : []
        };
    } catch (err) {
        console.warn("Erro carregando ameacas.json:", err);
        AMEACAS_DB = {
            ameacas: [],
            poderes: [],
            magias: [],
            equipamento: [],
            tesouro: []
        };
    }

    AMEACAS_DB_CARREGADO = true;
}

async function carregarClassesDB() {
    if (CLASSES_DB_CARREGADO) return;

    try {
        const res = await fetch("classes.json");
        if (!res.ok) throw new Error("classes.json nÃ£o encontrado");

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

        // aceita tanto minÃºsculo quanto nome vindo da aba
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
        if (!res.ok) throw new Error("poderes_magias.json nÃ£o encontrado");

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
        if (!res.ok) throw new Error("itens_equipamentos.json nÃ£o encontrado");

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
        if (!res.ok) throw new Error("origem.json nÃ£o encontrado");

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
        if (!res.ok) throw new Error("divindades.json nÃ£o encontrado");

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
    // Carregamento em paralelo: cada funÃ§Ã£o popula sua prÃ³pria variÃ¡vel global
    // e nenhuma depende do resultado das outras, entÃ£o nÃ£o hÃ¡ motivo para serializar.
    await Promise.all([
        carregarRacasDB(),
        carregarClassesDB(),
        carregarPoderesMagiasDB(),
        carregarItensEquipamentosDB(),
        carregarOrigensDB(),
        carregarDivindadesDB(),
        carregarAmeacasDB(),
        carregarRegrasDB()
    ]);
}

function getClasseSelecionadaCriacao() {
    return CLASSES_DB.find(c => c.id === state.criacao.classeSelecionadaId) || null;
}


async function carregarRacasDB() {
    if (RACAS_DB_CARREGADO) return;

    try {
        const res = await fetch("racas.json");
        if (!res.ok) throw new Error("racas.json nÃ£o encontrado");

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
                    origemTipo: h.origemTipo || "RaÃ§a",
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
        console.warn("Usando raÃ§as fallback:", err);
        RACAS_DB = RACAS_FALLBACK;
    }

    RACAS_DB_CARREGADO = true;
}
function iconePericiaSomenteTreinada() {
    return `
      <span class="pericia-badge" title="SÃ³ treinada" aria-label="SÃ³ treinada">
        <svg viewBox="0 0 24 24" class="pericia-icone pericia-icone-preenchido" aria-hidden="true">
          <path d="M12 3.5l2.6 5.27 5.82.85-4.21 4.1.99 5.78L12 16.73 6.8 19.5l.99-5.78-4.21-4.1 5.82-.85z"></path>
        </svg>
      </span>
    `;
}

function iconePericiaPenalidadeArmadura() {
    return `
      <span class="pericia-badge" title="Penalidade de armadura" aria-label="Penalidade de armadura">
        <svg viewBox="0 0 24 24" class="pericia-icone-armadura" aria-hidden="true">
          <path
            class="pericia-escudo-preenchido"
            d="M12 3l7 3v5c0 4.5-2.7 7.6-7 10-4.3-2.4-7-5.5-7-10V6z"
          ></path>
          <path
            class="pericia-escudo-barra"
            d="M5 19L19 5"
          ></path>
        </svg>
      </span>
    `;
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
        label: `Poder Ãºnico: ${habilidade.nome}`,
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

        return finalizarOpcoesPoderesOrigem(opcoes, ficha);
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

        return finalizarOpcoesPoderesOrigem(opcoes, ficha);
    }

    const registro = (PODERES_MAGIAS_DB.registros || []).find(r =>
        String(r.tipoRegistro || "").toLowerCase() === "poder" &&
        normalizarTextoRegra(r.nome || "") === chave
    );

    if (!registro) return [];

    const op = montarOpcaoDeRegistroBanco(registro);

    return op
        ? finalizarOpcoesPoderesOrigem([{
            ...op,
            id: `poder:${op.registroId || op.valor}`
        }], ficha)
        : [];
}
function finalizarOpcoesPoderesOrigem(opcoes, ficha) {
    return filtrarOpcoesOrigemPorPreRequisito(
        expandirOpcoesEspeciaisDePoder(opcoes || [], ficha),
        ficha
    );
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

let filtroAdicionarHabilidadeTimer = null;
let filtroAdicionarMagiaTimer = null;
let filtroEscolhaClasseTimer = null;

function getTemaMenuUsuarioSalvo() {
    try {
        return localStorage.getItem(MENU_USUARIO_TEMA_KEY) === "noite" ? "noite" : "dia";
    } catch (err) {
        return "dia";
    }
}

function salvarTemaMenuUsuario(tema) {
    try {
        localStorage.setItem(MENU_USUARIO_TEMA_KEY, tema === "noite" ? "noite" : "dia");
    } catch (err) {
        // Preferencia visual; se o navegador bloquear o storage, apenas nao persiste.
    }
}

function aplicarTemaMenuUsuario(tema) {
    document.body.classList.toggle("t20-theme-noite", tema === "noite");
}

let state = {
    screen: "home",
    fichas: [],
    fichasCarregando: false,
    fichasCarregadas: false,
    fichaAtualId: null,

    auth: {
        modo: "login",
        email: "",
        senha: "",
        nomeExibicao: "",
        confirmarNovaSenha: "",
        carregandoSessao: true,
        sessaoVerificada: false
    },

    menuUsuario: {
        aberto: false,
        tema: getTemaMenuUsuarioSalvo(),
        modal: null,
        nome: "",
        novaSenha: "",
        confirmarSenha: ""
    },

    mesaOnlineId: "",
    mesaOnlineNome: "",

    mestre: {
        mesaId: "",
        mesaNome: "",
        fichas: [],
        fichaSelecionadaId: "",
        carregando: false,
        sidebarAberta: true,
        renderizandoFichaRemota: false,
        mesasCriadas: []
    },

    secoesFicha: {
        habilidadesRaciais: true,
        poderes: true,
        magias: true,
        inventario: true
    },
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
        golpePessoalModal: null,
        filtroEscolhaClasse: "",
        planoClasses: [],

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
        golpePessoalModal: null,
        filtroEscolhaClasse: "",
        divindadeEscolhaAberta: false,
        divindadeSelecionadaId: "",
        divindadePoderSelecionadoNome: ""
    },
};
const ETAPAS_CRIACAO = [
    "Identidade",
    "Atributos",
    "RaÃ§a",
    "Classe",
    "Origem",
    "Divindade",
    "Equipamento",
    "RevisÃ£o"
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
function getGolpePessoalStateAtual() {
    return state.screen === "criacao"
        ? state.criacao
        : state.evolucao;
}

function isGolpePessoalOpcao(opcao) {
    const nome = normalizarTextoRegra(opcao?.nomeCurto || opcao?.valor || opcao?.nome || "");
    return nome === "golpe pessoal" || nome.startsWith("golpe pessoal:");
}

function criarConfigInicialGolpePessoal() {
    return {
        custoBase: 1,
        efeitos: [],
        conjurador: null
    };
}

function abrirGolpePessoalModal() {
    const origem = getEscolhaClasseSelecionadaQueAbriuPoder();
    if (!origem?.opcao) return;

    const ctx = getGolpePessoalStateAtual();
    ctx.golpePessoalModal = {
        escolhaClasseId: origem.escolhaId || "",
        opcaoId: origem.opcao.id || "",
        config: JSON.parse(JSON.stringify(origem.opcao.golpePessoalConfig || criarConfigInicialGolpePessoal()))
    };

    render();
}

function fecharGolpePessoalModal() {
    const ctx = getGolpePessoalStateAtual();
    if (ctx) {
        ctx.golpePessoalModal = null;
    }

    if (state.screen === "criacao") {
        state.criacao.escolhaPoderClasseAbertaId = null;
    } else {
        state.evolucao.escolhaPoderClasseAbertaId = null;
    }

    render();
}

function getGolpePessoalModalAtual() {
    return getGolpePessoalStateAtual().golpePessoalModal || null;
}

function getGolpePessoalConfigAtual() {
    return getGolpePessoalModalAtual()?.config || null;
}

function getDefinicaoGolpePessoal(codigo) {
    return GOLPE_PESSOAL_EFEITOS.find(e => e.codigo === codigo) || null;
}

function contarEfeitoGolpePessoal(config, codigo) {
    return (config?.efeitos || []).filter(e => e.codigo === codigo).length;
}

function podeAdicionarEfeitoGolpePessoal(config, codigo) {
    const def = getDefinicaoGolpePessoal(codigo);
    if (!def) return false;

    const qtd = contarEfeitoGolpePessoal(config, codigo);

    if (!def.repetivel && qtd > 0) return false;
    if (def.maxUsos && qtd >= def.maxUsos) return false;

    return true;
}

function calcularCustoGolpePessoal(config) {
    let total = Number(config?.custoBase || 1);

    for (const efeito of (config?.efeitos || [])) {
        total += Number(efeito?.custoPm || 0);
    }

    if (config?.conjurador?.magiaNome) {
        total += Number(config?.conjurador?.custoPmMagia || 0) + 1;
    }

    return Math.max(1, total);
}

function getResumoGolpePessoal(config) {
    const partes = [];

    for (const efeito of (config?.efeitos || [])) {
        if (efeito.codigo === "elemental") {
            partes.push(`Elemental (${efeito.elemento || "elemento"})`);
            continue;
        }

        partes.push(efeito.nome || efeito.codigo);
    }

    if (config?.conjurador?.magiaNome) {
        partes.push(`Conjurador (${config.conjurador.magiaNome})`);
    }

    return partes.join(", ");
}

function montarDescricaoGolpePessoal(config, descricaoBase = "") {
    const linhas = [];

    if (descricaoBase) {
        linhas.push(descricaoBase.trim());
    }

    linhas.push(`Custo total: ${calcularCustoGolpePessoal(config)} PM`);

    const efeitos = (config?.efeitos || []).map(efeito => {
        if (efeito.codigo === "elemental") {
            return `â€¢ ${efeito.nome} (${efeito.elemento || "elemento"}): ${efeito.descricao}`;
        }
        return `â€¢ ${efeito.nome}: ${efeito.descricao}`;
    });

    if (efeitos.length) {
        linhas.push("Efeitos escolhidos:");
        linhas.push(...efeitos);
    }

    if (config?.conjurador?.magiaNome) {
        linhas.push("Conjurador:");
        linhas.push(`â€¢ Magia: ${config.conjurador.magiaNome}`);
        linhas.push(`â€¢ CÃ­rculo: ${config.conjurador.circulo || "?"}`);
        linhas.push(`â€¢ Custo da magia: ${Number(config.conjurador.custoPmMagia) || 0} PM`);
        linhas.push(`â€¢ Atributo-chave: ${config.conjurador.atributoMental || "inteligencia"}`);

        if (config.conjurador.execucao) {
            linhas.push(`â€¢ ExecuÃ§Ã£o: ${config.conjurador.execucao}`);
        }
        if (config.conjurador.alcance) {
            linhas.push(`â€¢ Alcance: ${config.conjurador.alcance}`);
        }
        if (config.conjurador.area) {
            linhas.push(`â€¢ Ãrea: ${config.conjurador.area}`);
        }
        if (config.conjurador.duracao) {
            linhas.push(`â€¢ DuraÃ§Ã£o: ${config.conjurador.duracao}`);
        }
        if (config.conjurador.resistencia) {
            linhas.push(`â€¢ ResistÃªncia: ${config.conjurador.resistencia}`);
        }
        if (config.conjurador.descricao) {
            linhas.push(`â€¢ DescriÃ§Ã£o da magia: ${config.conjurador.descricao}`);
        }
    }

    return linhas.filter(Boolean).join("\n");
}

function criarRegistroGolpePessoalParaFicha(opcao) {
    const config = JSON.parse(JSON.stringify(opcao?.golpePessoalConfig || criarConfigInicialGolpePessoal()));
    const custoCalculado = calcularCustoGolpePessoal(config);
    const resumo = getResumoGolpePessoal(config) || "ConfiguraÃ§Ã£o";

    const resumoUso = config?.conjurador?.magiaNome
        ? `Custo: ${Number(custoCalculado) || 0} PM â€¢ Conjurador: ${config.conjurador.magiaNome}`
        : `Custo: ${Number(custoCalculado) || 0} PM`;

    return {
        id: uid(),
        tipoRegistro: "poder",
        nome: `Golpe Pessoal: ${resumo}`,
        nomeCurto: `Golpe Pessoal: ${resumo}`,
        descricao: montarDescricaoGolpePessoal(config, opcao?.descricaoBase || opcao?.descricao || ""),
        custoPm: Number(custoCalculado) || 0,
        custoVida: 0,
        custoPmPermanente: 0,
        custoVidaPermanente: 0,
        resumoUso,
        ativavel: true,
        permiteIntensificar: false,
        incrementos: [],
        escolhas: [],
        origemBase: "classe",
        filtros: "poder|poder_classe|poder_guerreiro",
        escolhaEspecial: "golpe_pessoal",
        escolhaEspecialValor: resumo,
        golpePessoalConfig: config
    };
}

function getMagiasElegiveisConjuradorGolpePessoal(ficha) {
    return (ficha?.magias || [])
        .map(magia => {
            const registro =
                (magia?.registroId ? getRegistroPoderMagiaPorId(magia.registroId) : null) ||
                getRegistroMagiaPorNome(magia?.nome || "");

            const circulo = Number(magia?.circulo || registro?.circulo || 0);
            if (circulo < 1 || circulo > 2) return null;

            return {
                id: magia?.registroId || registro?.id || uid(),
                nome: magia?.nome || registro?.nome || "",
                circulo,
                custoPm: Number(magia?.custoPmBase ?? magia?.custoPm ?? registro?.custoPm) || 0,
                registroId: magia?.registroId || registro?.id || "",
                descricao: magia?.descricao || registro?.descricao || "",
                execucao: magia?.execucao || registro?.execucao || "",
                alcance: magia?.alcance || registro?.alcance || "",
                area: magia?.area || registro?.area || "",
                duracao: magia?.duracao || registro?.duracao || "",
                resistencia: magia?.resistencia || registro?.resistencia || ""
            };
        })
        .filter(Boolean)
        .sort((a, b) => String(a.nome || "").localeCompare(String(b.nome || ""), "pt-BR"));
}
function adicionarEfeitoGolpePessoal(codigo) {
    const config = getGolpePessoalConfigAtual();
    if (!config) return;

    if (!podeAdicionarEfeitoGolpePessoal(config, codigo)) return;

    const def = getDefinicaoGolpePessoal(codigo);
    if (!def) return;

    if (codigo === "conjurador") {
        const ficha =
            state.screen === "criacao"
                ? getFichaCriacao?.()
                : getFichaEvolucaoAtual?.() || getFichaAtual?.();

        const magias = getMagiasElegiveisConjuradorGolpePessoal(ficha);
        if (!magias.length) {
            alert("Nenhuma magia de 1Âº ou 2Âº cÃ­rculos disponÃ­vel para Conjurador.");
            return;
        }

        const magia = magias[0];

        config.conjurador = {
            magiaId: magia.id,
            magiaNome: magia.nome,
            custoPmMagia: Number(magia.custoPm) || 0,
            circulo: Number(magia.circulo) || 1,
            atributoMental: "inteligencia",
            registroId: magia.registroId || "",
            descricao: magia.descricao || "",
            execucao: magia.execucao || "",
            alcance: magia.alcance || "",
            area: magia.area || "",
            duracao: magia.duracao || "",
            resistencia: magia.resistencia || ""
        };

        render();
        return;
    }

    if (codigo === "elemental") {
        config.efeitos.push({
            codigo: def.codigo,
            nome: def.nome,
            custoPm: Number(def.custoPm) || 0,
            descricao: def.descricao || "",
            elemento: GOLPE_PESSOAL_ELEMENTOS[0]
        });

        render();
        return;
    }

    config.efeitos.push({
        codigo: def.codigo,
        nome: def.nome,
        custoPm: Number(def.custoPm) || 0,
        descricao: def.descricao || ""
    });

    render();
}
function recalcularCdMagiasFichaAtual() {
    const ficha = getFichaAtual();
    if (!ficha) return;

    atualizarCdMagiasNaFicha(ficha, true);
    saveFichas();
    render();
}

function abrirModalEdicaoFichaMobile(tipo) {
    const ficha = getFichaAtual();
    if (!ficha) return;

    if (tipo === "cdMagias") {
        atualizarCdMagiasNaFicha(ficha, true);
        saveFichas();
    }

    state.modal = "ficha_mobile_edicao";
    state.modalPayload = { tipo };
    render();
}

function getCampoModalFichaMobile(campo) {
    return document.querySelector(`[data-mf-mobile-field="${campo}"]`)?.value ?? "";
}

function getNumeroModalFichaMobile(campo) {
    return Number(getCampoModalFichaMobile(campo)) || 0;
}

function salvarEFecharModalEdicaoFichaMobile() {
    if (state.modal !== "ficha_mobile_edicao") {
        fecharModal();
        return;
    }

    const ficha = getFichaAtual();
    const tipo = state.modalPayload?.tipo;

    if (ficha) {
        if (tipo === "pv") {
            ficha.pvAtual = getNumeroModalFichaMobile("pvAtual");
            ficha.pvMax = getNumeroModalFichaMobile("pvMax");
        } else if (tipo === "pm") {
            ficha.pmAtual = getNumeroModalFichaMobile("pmAtual");
            ficha.pmMax = getNumeroModalFichaMobile("pmMax");
        } else if (tipo === "defesa") {
            ficha.defesaOutros = getNumeroModalFichaMobile("defesaOutros");
            recalcularDefesaFicha(ficha);
        } else if (tipo === "xp") {
            ficha.xp = getNumeroModalFichaMobile("xp");
        } else if (tipo === "tamanho") {
            ficha.tamanho = getCampoModalFichaMobile("tamanho");
        } else if (tipo === "deslocamento") {
            ficha.deslocamento = getCampoModalFichaMobile("deslocamento");
        } else if (tipo === "cdMagias") {
            ficha.cdMagias = getNumeroModalFichaMobile("cdMagias");
        }

        saveFichas();
    }

    state.modal = null;
    state.modalPayload = null;
    document.body.classList.remove("modal-open");
    render();
}
function removerEfeitoGolpePessoal(codigo, indice = -1) {
    const config = getGolpePessoalConfigAtual();
    if (!config) return;

    if (codigo === "conjurador") {
        config.conjurador = null;
        render();
        return;
    }

    const lista = config.efeitos || [];
    if (!lista.length) return;

    if (indice >= 0 && lista[indice]?.codigo === codigo) {
        lista.splice(indice, 1);
        render();
        return;
    }

    const idx = lista.findIndex(e => e.codigo === codigo);
    if (idx >= 0) {
        lista.splice(idx, 1);
        render();
    }
}

function alterarElementoGolpePessoal(indice, valor) {
    const config = getGolpePessoalConfigAtual();
    const efeito = config?.efeitos?.[indice];
    if (!efeito || efeito.codigo !== "elemental") return;

    efeito.elemento = valor;
    render();
}

function alterarMagiaConjuradorGolpePessoal(registroId) {
    const config = getGolpePessoalConfigAtual();
    if (!config?.conjurador) return;

    const ficha =
        state.screen === "criacao"
            ? getFichaCriacao?.()
            : getFichaEvolucaoAtual?.() || getFichaAtual?.();

    const magia = getMagiasElegiveisConjuradorGolpePessoal(ficha)
        .find(m => String(m.registroId || m.id) === String(registroId));

    if (!magia) return;

    config.conjurador.magiaId = magia.id;
    config.conjurador.magiaNome = magia.nome;
    config.conjurador.custoPmMagia = Number(magia.custoPm) || 0;
    config.conjurador.circulo = Number(magia.circulo) || 1;
    config.conjurador.registroId = magia.registroId || "";
    config.conjurador.descricao = magia.descricao || "";
    config.conjurador.execucao = magia.execucao || "";
    config.conjurador.alcance = magia.alcance || "";
    config.conjurador.area = magia.area || "";
    config.conjurador.duracao = magia.duracao || "";
    config.conjurador.resistencia = magia.resistencia || "";

    render();
}

function alterarAtributoMentalConjuradorGolpePessoal(valor) {
    const config = getGolpePessoalConfigAtual();
    if (!config?.conjurador) return;

    config.conjurador.atributoMental = valor;
    render();
}

function confirmarGolpePessoalModal() {
    const ficha = state.screen === "criacao"
        ? (getFichaCriacao?.() || null)
        : (getFichaEvolucaoAtual?.() || getFichaAtual?.() || null);

    const classe = state.screen === "criacao"
        ? (getClasseEvolucaoAtualCriacao?.() || getClasseSelecionadaCriacao?.() || null)
        : (getClasseEvolucaoAtualFicha?.() || null);

    if (!ficha || !classe) return;

    const ctx = getGolpePessoalStateAtual();
    const modal = ctx?.golpePessoalModal;
    if (!modal) return;

    const mapaClasse = state.screen === "criacao"
        ? (state.criacao.classeEscolhas || {})
        : (state.evolucao.classeEscolhas || {});

    const lista = Array.isArray(mapaClasse[modal.escolhaClasseId]) ? mapaClasse[modal.escolhaClasseId] : [];
    const opcao = lista.find(item => String(item.id || "") === String(modal.opcaoId || ""));
    if (!opcao) return;

    const config = JSON.parse(JSON.stringify(getGolpePessoalConfigAtual() || criarConfigInicialGolpePessoal()));
    const custoFinal = calcularCustoGolpePessoal(config);
    const resumo = getResumoGolpePessoal(config) || "ConfiguraÃ§Ã£o";
    const descricaoBaseBanco = opcao.descricao || "";

    opcao.descricaoBase = descricaoBaseBanco;
    opcao.label = `Poder de classe: Golpe Pessoal`;
    opcao.valor = `Golpe Pessoal: ${resumo}`;
    opcao.nomeCurto = `Golpe Pessoal: ${resumo}`;
    opcao.escolhaEspecial = "golpe_pessoal";
    opcao.escolhaEspecialValor = resumo;
    opcao.golpePessoalConfig = config;
    opcao.custoPm = custoFinal;
    opcao.resumoUso = `Custo: ${custoFinal} PM`;
    opcao.descricao = montarDescricaoGolpePessoal(config, descricaoBaseBanco);
    opcao.escolhasConfirmadas = true;

    aplicarEscolhasDoPoderClasseNaFichaImediatamente(ficha, classe, opcao);

    ctx.golpePessoalModal = null;

    if (state.screen === "criacao") {
        state.criacao.escolhaPoderClasseAbertaId = null;
        state.criacao.escolhaClasseAbertaId = null;
        sincronizarFichaTemporariaClassesCriacao();
    } else {
        state.evolucao.escolhaPoderClasseAbertaId = null;
        state.evolucao.escolhaClasseAbertaId = null;
    }

    saveFichas?.();
    render();
}
function renderGolpePessoalModal() {
    const modal = getGolpePessoalModalAtual();
    const config = modal?.config;
    if (!config) return "";

    const ficha =
        state.screen === "criacao"
            ? getFichaCriacao?.()
            : getFichaEvolucaoAtual?.() || getFichaAtual?.();

    const magiasConjurador = getMagiasElegiveisConjuradorGolpePessoal(ficha);
    const custoTotal = calcularCustoGolpePessoal(config);

    setTimeout(() => {
        document.body.classList.add("modal-open");
    }, 0);

    return `
      <div class="overlay mf-add-habilidade-overlay" onclick="fecharGolpePessoalModal()">
        <div class="overlay-card mf-add-habilidade-modal mf-magia-detail-modal mf-classe-submodal" onclick="event.stopPropagation()">
          <div class="overlay-header mf-add-habilidade-header">
            <div>
              <div class="overlay-title">Golpe Pessoal</div>
              <div class="subtitle">Monte os efeitos do golpe. Custo atual: <strong>${escapeHtml(String(custoTotal))} PM</strong></div>
            </div>

            <div class="mf-classe-submodal-actions">
              <button class="mf-add-habilidade-btn mf-classe-submodal-btn-ok" onclick="confirmarGolpePessoalModal()">Confirmar</button>
              <button class="mf-add-habilidade-btn mf-add-habilidade-btn-fechar" onclick="fecharGolpePessoalModal()">Fechar</button>
            </div>
          </div>

          <div class="overlay-body mf-add-habilidade-body mf-magia-detail-body">
            <div class="mf-magia-detail-scroll">
              ${GOLPE_PESSOAL_EFEITOS.map(def => {
        const qtd = def.codigo === "conjurador"
            ? (config?.conjurador ? 1 : 0)
            : contarEfeitoGolpePessoal(config, def.codigo);

        const podeAdd = podeAdicionarEfeitoGolpePessoal(config, def.codigo);
        const custoLabel = def.custoPm >= 0 ? `+${def.custoPm}` : `${def.custoPm}`;

        return `
                    <div class="mf-magia-detail-card mf-classe-submodal-effect">
                      <div class="mf-classe-submodal-effect-head">
                        <div>
                          <div class="mf-magia-detail-card-title">${escapeHtml(def.nome)} (${escapeHtml(String(custoLabel))} PM)</div>
                          <div class="mf-classe-submodal-row-sub">${escapeHtml(def.descricao)}</div>
                          ${qtd > 0 ? `<div class="muted" style="margin-top:6px;">Selecionado${qtd > 1 ? ` ${qtd}x` : ""}</div>` : ""}
                        </div>

                        <div class="mf-classe-submodal-effect-actions">
                          <button class="mf-add-habilidade-btn mf-classe-submodal-btn-add mf-classe-submodal-btn-sm" ${podeAdd ? "" : "disabled"} onclick="adicionarEfeitoGolpePessoal('${escapeAttr(def.codigo)}')">Adicionar</button>
                          <button class="mf-add-habilidade-btn mf-classe-submodal-btn-remove mf-classe-submodal-btn-sm" ${qtd > 0 ? "" : "disabled"} onclick="removerEfeitoGolpePessoal('${escapeAttr(def.codigo)}')">Remover</button>
                        </div>
                      </div>

                      ${def.codigo === "conjurador" && config?.conjurador ? `
                        <div class="mf-classe-submodal-row2">
                          <div class="mf-magia-detail-field">
                            <label>Magia</label>
                            <select onchange="alterarMagiaConjuradorGolpePessoal(this.value)">
                              ${magiasConjurador.map(magia => `
                                <option
                                  value="${escapeAttr(String(magia.registroId || magia.id))}"
                                  ${(String(config.conjurador.registroId || config.conjurador.magiaId) === String(magia.registroId || magia.id)) ? "selected" : ""}
                                >
                                  ${escapeHtml(`${magia.nome} (${magia.circulo}Âº cÃ­rculo, ${magia.custoPm} PM)`)}
                                </option>
                              `).join("")}
                            </select>
                          </div>

                          <div class="mf-magia-detail-field">
                            <label>Atributo mental</label>
                            <select onchange="alterarAtributoMentalConjuradorGolpePessoal(this.value)">
                              ${GOLPE_PESSOAL_ATRIBUTOS_MENTAIS.map(attr => `
                                <option value="${escapeAttr(attr)}" ${config.conjurador.atributoMental === attr ? "selected" : ""}>
                                  ${escapeHtml(attr)}
                                </option>
                              `).join("")}
                            </select>
                          </div>
                        </div>
                      ` : ""}

                      ${def.codigo === "elemental" ? (config.efeitos || []).map((efeito, indice) => {
            if (efeito.codigo !== "elemental") return "";
            return `
                            <div class="mf-classe-submodal-row2">
                                <div class="mf-magia-detail-field">
                                  <label>Elemento</label>
                                  <select onchange="alterarElementoGolpePessoal(${indice}, this.value)">
                                    ${GOLPE_PESSOAL_ELEMENTOS.map(elemento => `
                                      <option value="${escapeAttr(elemento)}" ${efeito.elemento === elemento ? "selected" : ""}>
                                        ${escapeHtml(elemento)}
                                      </option>
                                    `).join("")}
                                  </select>
                                </div>
                                <button class="mf-add-habilidade-btn mf-classe-submodal-btn-remove" onclick="removerEfeitoGolpePessoal('elemental', ${indice})">Remover</button>
                              </div>
                          `;
        }).join("") : ""}
                    </div>
                  `;
    }).join("")}
            </div>
          </div>
        </div>
      </div>
    `;
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
function getPoderClassePorNome(classeId, nome) {
    const classe = getClasseDoBanco(classeId);
    const alvo = normalizarTextoRegra(nome || "");
    if (!classe || !alvo) return null;

    return (classe.poderes || []).find(p =>
        normalizarTextoRegra(p.nome || "") === alvo
    ) || null;
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
function getRegistroPoderPorNome(nome) {
    const alvo = normalizarTextoRegra(nome || "");
    if (!alvo) return null;

    return (PODERES_MAGIAS_DB.registros || []).find(r =>
        String(r.tipoRegistro || "").toLowerCase() === "poder" &&
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

        const existenteEhRacial = magiaExistente.origem === "RaÃ§a";
        const novaEhRacial = origemTipo === "RaÃ§a";

        if ((existenteEhRacial && !novaEhRacial) || (novaEhRacial && !existenteEhRacial)) {
            aplicarDescontoMagiaRacial(magiaExistente, 1);
        }

        if (referencia?.origemEspecial === "inventor_formula") {
            magiaExistente.tipoMagiaInventor = "formula";
            magiaExistente.prefixoExibicao = "FÃ³rmula";
            magiaExistente.origem = origemTipo || magiaExistente.origem || "Classe";
            magiaExistente.origemDetalhe = origemNome || magiaExistente.origemDetalhe || "";
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
        origem: origemTipo || "RaÃ§a",
        origemDetalhe: origemNome || "",
        registroId: registro?.id || "",
        tipoMagiaInventor: referencia?.tipoMagiaInventor || "",
        prefixoExibicao: referencia?.origemEspecial === "inventor_formula" ? "FÃ³rmula" : ""
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

function renderProficienciasModalMobile(ficha, lista) {
    return `
      <div class="overlay mf-add-habilidade-overlay" onclick="fecharModal()">
        <div class="overlay-card mf-add-habilidade-modal mf-magia-detail-modal mf-status-compact-modal mf-status-classes-modal" onclick="event.stopPropagation()">
          <div class="overlay-header mf-add-habilidade-header">
            <div>
              <div class="overlay-title">Proficiencias</div>
              <div class="subtitle">Selecione as proficiencias do personagem.</div>
            </div>
            <button class="mf-add-habilidade-btn mf-add-habilidade-btn-fechar" onclick="fecharModal()">Fechar</button>
          </div>

          <div class="overlay-body mf-add-habilidade-body mf-magia-detail-body">
            <div class="t20-divider"></div>

            <div class="mf-magia-detail-scroll">
              <div class="mf-magia-detail-card">
                <div class="mf-magia-detail-card-title">Proficiencias</div>
                <div class="mf-detail-choice-list">
                  ${lista.map(prof => {
        const marcada = fichaTemProficiencia(ficha, prof);

        return `
                    <label class="mf-detail-choice-row">
                      <span class="mf-detail-choice-main">${escapeHtml(prof)}</span>
                      <input
                        type="checkbox"
                        ${marcada ? "checked" : ""}
                        onchange="toggleProficienciaFicha('${escapeAttr(prof)}', this.checked)"
                      >
                    </label>
                  `;
    }).join("")}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
}

function renderProficienciasModal() {
    if (state.modal !== "proficiencias") return "";

    const ficha = getFichaAtual();
    if (!ficha) return "";

    const lista = [...PROFICIENCIAS_DISPONIVEIS];

    setTimeout(() => {
        document.body.classList.add("modal-open");
    }, 0);

    const mobile = state.screen === "ficha";

    if (mobile) {
        return renderProficienciasModalMobile(ficha, lista);
    }

    return `
      <div class="overlay" onclick="fecharModal()">
        <div class="overlay-card" onclick="event.stopPropagation()">
          <div class="overlay-header">
            <div>
              <div class="overlay-title">ProficiÃªncias</div>
              <div class="overlay-subtitle">Selecione as proficiÃªncias que o personagem possui.</div>
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
      <div style="position:fixed; right:20px; bottom:125px; z-index:1200; display:flex; flex-direction:column; gap:10px; align-items:flex-end;">
        <button class="btn" onclick="togglePainelDinheiro()">
          T$ ${escapeHtml(String(valor))}
        </button>

        ${aberto ? `
          <div class="panel" style="width:220px; box-shadow:0 8px 24px rgba(0,0,0,.18);">
            <div class="panel-title">Dinheiro</div>
            <div class="panel-body">
              <div class="field mf-add-habilidade-field">
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
    const mobile = state.screen === "ficha" || (state.screen === "criacao" && isMobileFicha());

    if (mobile) {
        return `
      <div class="overlay mf-add-habilidade-overlay" onclick="fecharModalAdicionarItemInventario()">
        <div class="overlay-card mf-add-habilidade-modal mf-add-item-modal" onclick="event.stopPropagation()">
          <div class="overlay-header mf-add-habilidade-header">
            <div>
              <div class="overlay-title">Adicionar item</div>
              <div class="subtitle">Escolha um item do banco ou crie um item manual.</div>
            </div>
            <button class="mf-add-habilidade-btn mf-add-habilidade-btn-fechar" onclick="fecharModalAdicionarItemInventario()">Fechar</button>
          </div>

          <div class="overlay-body mf-add-item-body">
            <details class="mf-add-item-manual">
              <summary class="mf-add-item-manual-head">add manual</summary>
              <div class="mf-add-item-manual-body">
                <div class="mf-add-item-form-grid">
                  <div class="field mf-add-item-field">
                    <label>Nome</label>
                    <input
                      value="${escapeAttr(state.ui?.novoItemManual?.nome || "")}"
                      oninput="updateNovoItemManual('nome', this.value)"
                    >
                  </div>

                  <div class="field mf-add-item-field">
                    <label>Categoria</label>
                    <input
                      value="${escapeAttr(state.ui?.novoItemManual?.categoria || "")}"
                      oninput="updateNovoItemManual('categoria', this.value)"
                    >
                  </div>

                  <div class="field mf-add-item-field">
                    <label>Quantidade</label>
                    <input
                      type="number"
                      min="1"
                      value="${escapeAttr(String(state.ui?.novoItemManual?.quantidade || 1))}"
                      oninput="updateNovoItemManual('quantidade', this.value)"
                    >
                  </div>

                  <div class="field mf-add-item-field">
                    <label>Descricao</label>
                    <input
                      value="${escapeAttr(state.ui?.novoItemManual?.descricao || "")}"
                      oninput="updateNovoItemManual('descricao', this.value)"
                    >
                  </div>
                </div>

                <button class="mf-add-habilidade-btn mf-add-habilidade-btn-manual" onclick="adicionarItemManualInventario()">add manual</button>
              </div>
            </details>

            <div class="t20-divider"></div>

            <div class="field mf-add-item-field">
              <label>Categoria</label>
              <select onchange="setCategoriaItensSelecionada(this.value)">
                ${categorias.map(cat => `
                  <option value="${escapeAttr(cat)}" ${cat === categoriaAtual ? "selected" : ""}>
                    ${escapeHtml(cat)}
                  </option>
                `).join("")}
              </select>
            </div>

            <div class="t20-divider"></div>

            ${!itens.length
            ? `<div class="empty">Nenhum item encontrado.</div>`
            : `
              <div class="mf-add-habilidade-lista mf-add-item-lista">
                <div class="mf-add-habilidade-lista-head">
                  <div>Item</div>
                  <div>Acao</div>
                </div>

                ${itens.map(item => `
                  <div class="mf-add-habilidade-row mf-add-item-row">
                    <div class="mf-add-habilidade-info">
                      <div class="mf-add-habilidade-nome">${escapeHtml(item.nome || "")}</div>
                      <div class="mf-add-habilidade-origem">
                        ${escapeHtml(item.categoria || "")}
                        ${item.preco ? ` - T$ ${escapeHtml(String(item.preco))}` : ""}
                      </div>
                    </div>

                    <div class="mf-add-item-actions">
                      <button class="mf-add-habilidade-btn mf-add-item-btn-red" onclick="adicionarItemInventarioPorBaseId('${escapeAttr(item.id)}', 'ganhar')">Ganhar</button>
                      <button class="mf-add-habilidade-btn mf-add-item-btn-red" onclick="adicionarItemInventarioPorBaseId('${escapeAttr(item.id)}', 'pagar')">Pagar</button>
                      <button class="mf-add-habilidade-btn mf-add-item-btn-white" onclick="abrirPromptDescontoItem('${escapeAttr(item.id)}')">Desconto</button>
                    </div>
                  </div>
                `).join("")}
              </div>
            `}

            ${state.ui?.itemDescontoBaseId ? `
              <div class="t20-divider"></div>
              <div class="mf-add-item-desconto">
                <div class="field mf-add-item-field">
                  <label>Quanto foi pago (T$)</label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value="${escapeAttr(String(state.ui?.itemDescontoValor || ""))}"
                    oninput="updateValorDescontoItem(this.value)"
                  >
                </div>
                <button class="mf-add-habilidade-btn mf-add-item-btn-red" onclick="confirmarDescontoItem()">Confirmar</button>
              </div>
            ` : ""}
          </div>
        </div>
      </div>
    `;
    }

    return `
      <div class="overlay" onclick="fecharModalAdicionarItemInventario()">
        <div class="overlay-card" onclick="event.stopPropagation()">
          <div class="overlay-header">
            <div>
              <div class="overlay-title">Adicionar item ao inventÃ¡rio</div>
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
                                ${item.preco ? ` â€¢ T$ ${escapeHtml(String(item.preco))}` : ""}
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
                    <label>DescriÃ§Ã£o</label>
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
    if (chave.includes("arma exÃ³tica") || chave.includes("arma exotica")) return { modo: "tipo_generico", valor: "arma_exotica" };

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

function renderLinhaDetalheMobile(rotulo, valor) {
    if (valor == null || String(valor).trim() === "") return "";

    return `
      <div class="mf-detail-kv-row">
        <span>${escapeHtml(rotulo)}</span>
        <strong>${escapeHtml(String(valor))}</strong>
      </div>
    `;
}

function renderModalDetalhesItemInventarioMobile(item, dados) {
    const { base, nome, categoria, descricao, atributos, melhorias, encantamentos, material } = dados;
    const quantidade = Math.max(1, Number(item.quantidade) || 1);
    const dadosItemHtml = [
        renderLinhaDetalheMobile("Quantidade", quantidade),
        renderLinhaDetalheMobile("Equipado", item.equipado ? "Sim" : "Nao"),
        base ? renderLinhaDetalheMobile("Preco total", `T$ ${calcularPrecoTotalItem(item)}`) : "",
        base ? renderLinhaDetalheMobile("CD de fabricacao", calcularCdItem(item)) : "",
        base?.proficienciaNecessaria ? renderLinhaDetalheMobile("Proficiencia necessaria", base.proficienciaNecessaria) : "",
        base?.carga != null ? renderLinhaDetalheMobile("Carga", base.carga) : "",
        atributos?.dano ? renderLinhaDetalheMobile("Dano", atributos.dano) : "",
        atributos?.critico ? renderLinhaDetalheMobile("Critico", atributos.critico) : "",
        atributos?.tipoDano ? renderLinhaDetalheMobile("Tipo de dano", atributos.tipoDano) : "",
        atributos?.alcance ? renderLinhaDetalheMobile("Alcance", atributos.alcance) : "",
        atributos?.defesa ? renderLinhaDetalheMobile("Defesa", atributos.defesa) : "",
        atributos?.penalidadeArmadura ? renderLinhaDetalheMobile("Penalidade de armadura", atributos.penalidadeArmadura) : ""
    ].join("");
    const aprimoramentosHtml = [
        material ? renderLinhaDetalheMobile("Material especial", material.nome || "") : "",
        melhorias.length ? renderLinhaDetalheMobile("Melhorias", melhorias.map(m => m.nome).join(", ")) : "",
        encantamentos.length ? renderLinhaDetalheMobile("Encantamentos", encantamentos.map(e => e.nome).join(", ")) : ""
    ].join("");

    return `
      <div class="overlay mf-add-habilidade-overlay" onclick="fecharDetalhesItemInventario()">
        <div class="overlay-card mf-add-habilidade-modal mf-magia-detail-modal" onclick="event.stopPropagation()">
          <div class="overlay-header mf-add-habilidade-header">
            <div>
              <div class="overlay-title">${escapeHtml(nome)}</div>
              <div class="subtitle">${escapeHtml(categoria || (item.manual ? "Item manual" : "Detalhes do item"))}</div>
            </div>
            <button class="mf-add-habilidade-btn mf-add-habilidade-btn-fechar" onclick="fecharDetalhesItemInventario()">Fechar</button>
          </div>

          <div class="overlay-body mf-add-habilidade-body mf-magia-detail-body">
            <div class="t20-divider"></div>

            <div class="mf-magia-detail-scroll">
              ${descricao ? `
                <div class="mf-magia-detail-card">
                  <div class="mf-magia-detail-card-title">Descricao</div>
                  <div class="mf-detail-text">${escapeHtml(descricao)}</div>
                </div>
              ` : ""}

              <div class="mf-magia-detail-card">
                <div class="mf-magia-detail-card-title">Dados do item</div>
                <div class="mf-detail-kv">
                  ${dadosItemHtml || `<div class="mf-magia-detail-vazio">Nenhum detalhe adicional cadastrado.</div>`}
                </div>
              </div>

              ${aprimoramentosHtml ? `
                <div class="mf-magia-detail-card">
                  <div class="mf-magia-detail-card-title">Aprimoramentos</div>
                  <div class="mf-detail-kv">${aprimoramentosHtml}</div>
                </div>
              ` : ""}

              <button type="button" class="mf-magia-detail-btn-excluir" onclick="removerItemInventario('${escapeAttr(item.id)}')">
                Remover item
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
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
    const mobile = state.screen === "ficha";

    if (mobile) {
        return renderModalDetalhesItemInventarioMobile(item, {
            base,
            nome,
            categoria,
            descricao,
            atributos,
            melhorias,
            encantamentos,
            material
        });
    }

    return `
      <div class="overlay" onclick="fecharDetalhesItemInventario()">
        <div class="overlay-card" onclick="event.stopPropagation()">
          <div class="overlay-header">
            <div>
              <div class="overlay-title">${escapeHtml(nome)}</div>
              <div class="overlay-subtitle">
                ${escapeHtml(categoria || (item.manual ? "Item manual" : ""))}
                ${item.quantidade > 1 ? ` â€¢ Quantidade: ${escapeHtml(String(item.quantidade))}` : ""}
              </div>
            </div>
            <button class="btn ghost" onclick="fecharDetalhesItemInventario()">Fechar</button>
          </div>

          <div class="overlay-body">
            ${descricao ? `
              <div class="panel">
                <div class="panel-title">DescriÃ§Ã£o</div>
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
                        <div class="list-item-title">PreÃ§o total</div>
                        <div class="list-item-sub">T$ ${escapeHtml(String(calcularPrecoTotalItem(item)))}</div>
                      </div>
                    </div>

                    <div class="list-item">
                      <div>
                        <div class="list-item-title">CD de fabricaÃ§Ã£o</div>
                        <div class="list-item-sub">${escapeHtml(String(calcularCdItem(item)))}</div>
                      </div>
                    </div>

                    ${base.proficienciaNecessaria ? `
                      <div class="list-item">
                        <div>
                          <div class="list-item-title">ProficiÃªncia necessÃ¡ria</div>
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
                          <div class="list-item-title">CrÃ­tico</div>
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
        <div
          class="panel-title"
          style="cursor:pointer; display:flex; justify-content:space-between; align-items:center;"
          onclick="toggleSecaoFicha('inventario')"
        >
          <span>Invent&aacute;rio</span>
          <span>${secaoFichaEstaAberta('inventario') ? "&#9650;" : "&#9660;"}</span>
        </div>

        ${secaoFichaEstaAberta('inventario') ? `
          <div class="panel-body">
            <div class="actions" style="margin-bottom:12px;">
              <button class="btn" onclick="abrirModalAdicionarItemInventario()">Adicionar item</button>
            </div>

            ${!itens.length
                ? `<div class="empty">Nenhum item no invent&aacute;rio.</div>`
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
        ` : ""}
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

function escolhaClasseDesbloqueada(escolha, classeContexto = null) {
    if (!escolha?.dependeDe) return true;

    const classe =
        classeContexto ||
        (state.screen === "evolucao" ? getClasseEvolucaoAtualFicha?.() : getClasseEvolucaoAtualCriacao?.()) ||
        getClasseEvolucaoAtualCriacao?.() ||
        getClasseEvolucaoAtualFicha?.() ||
        getClasseSelecionadaCriacao?.();

    const dependencia = classe?.escolhas?.find(e => e.id === escolha.dependeDe);
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
function normalizarNomeEscolaMagia(valor) {
    return normalizarTextoRegra(valor || "");
}
function getEscolasDruidaNoContexto(ficha) {
    const vistos = new Set();
    const escolas = [];

    const adicionar = (nome) => {
        const chave = normalizarNomeEscolaMagia(nome);
        if (!chave || vistos.has(chave)) return;
        vistos.add(chave);
        escolas.push(String(nome).trim());
    };

    (ficha?.druidaEscolas || []).forEach(adicionar);

    (ficha?.escolhasClasseResolvidas || [])
        .filter(reg => String(reg?.escolhaId || "") === "esc_druida_escolas")
        .forEach(reg => {
            (reg?.selecionadas || []).forEach(op => adicionar(op?.valor || op?.nomeCurto || ""));
        });

    (state.criacao?.classeEscolhas?.["esc_druida_escolas"] || []).forEach(op =>
        adicionar(op?.valor || op?.nomeCurto || "")
    );

    (state.evolucao?.classeEscolhas?.["esc_druida_escolas"] || []).forEach(op =>
        adicionar(op?.valor || op?.nomeCurto || "")
    );

    return escolas;
}

function druidaJaEscolheuEscolas(ficha) {
    return getEscolasDruidaNoContexto(ficha).length >= 3;
}

function filtrarMagiasPorEscolasDoDruida(registros, ficha) {
    const escolas = getEscolasDruidaNoContexto(ficha)
        .map(normalizarNomeEscolaMagia);

    if (!escolas.length) return [];

    return (registros || []).filter(registro =>
        escolas.includes(normalizarNomeEscolaMagia(registro?.escola || ""))
    );
}

function getMagiasDruidaNoContexto(ficha) {
    const circuloMaximo = getCirculoMaximoPorClasseNoContexto(ficha, "druida") || 1;
    const registros = [];

    for (let c = 1; c <= circuloMaximo; c++) {
        registros.push(...buscarMagiasPorFiltro(`magia_divina_${c}`));
    }

    const unicos = registros.reduce((acc, registro) => {
        if (!acc.some(r => String(r.id) === String(registro.id))) {
            acc.push(registro);
        }
        return acc;
    }, []);

    return filtrarForaMagiasJaConhecidas(
        filtrarMagiasPorEscolasDoDruida(unicos, ficha),
        ficha
    )
        .sort((a, b) => String(a.nome || "").localeCompare(String(b.nome || ""), "pt-BR"))
        .map(montarOpcaoDeRegistroBanco)
        .filter(Boolean);
}

function getMagiasDruidaSegredosNatureza(ficha) {
    const circuloMaximo = getCirculoMaximoPorClasseNoContexto(ficha, "druida") || 1;
    const registros = [];

    for (let c = 1; c <= circuloMaximo; c++) {
        registros.push(...buscarMagiasPorFiltro(`magia_arcana_${c}`));
        registros.push(...buscarMagiasPorFiltro(`magia_divina_${c}`));
        registros.push(...buscarMagiasPorFiltro(`magia_universal_${c}`));
    }

    const unicos = registros.reduce((acc, registro) => {
        if (!acc.some(r => String(r.id) === String(registro.id))) {
            acc.push(registro);
        }
        return acc;
    }, []);

    return filtrarForaMagiasJaConhecidas(
        filtrarMagiasPorEscolasDoDruida(unicos, ficha),
        ficha
    )
        .sort((a, b) => String(a.nome || "").localeCompare(String(b.nome || ""), "pt-BR"))
        .map(montarOpcaoDeRegistroBanco)
        .filter(Boolean);
}
function getEscolasBardoNoContexto(ficha) {
    const vistos = new Set();
    const escolas = [];

    const adicionar = (nome) => {
        const chave = normalizarNomeEscolaMagia(nome);
        if (!chave || vistos.has(chave)) return;
        vistos.add(chave);
        escolas.push(String(nome).trim());
    };

    (ficha?.bardoEscolas || []).forEach(adicionar);

    (ficha?.escolhasClasseResolvidas || [])
        .filter(reg => String(reg?.escolhaId || "") === "esc_bardo_escolas")
        .forEach(reg => {
            (reg?.selecionadas || []).forEach(op => adicionar(op?.valor || op?.nomeCurto || ""));
        });

    (state.criacao?.classeEscolhas?.["esc_bardo_escolas"] || []).forEach(op =>
        adicionar(op?.valor || op?.nomeCurto || "")
    );

    (state.evolucao?.classeEscolhas?.["esc_bardo_escolas"] || []).forEach(op =>
        adicionar(op?.valor || op?.nomeCurto || "")
    );

    return escolas;
}

function bardoJaEscolheuEscolas(ficha) {
    return getEscolasBardoNoContexto(ficha).length >= 3;
}

function filtrarMagiasPorEscolasDoBardo(registros, ficha) {
    const escolas = getEscolasBardoNoContexto(ficha)
        .map(normalizarNomeEscolaMagia);

    if (!escolas.length) return [];

    return (registros || []).filter(registro =>
        escolas.includes(normalizarNomeEscolaMagia(registro?.escola || ""))
    );
}
function getMagiasArcanistaConhecimentoMagico(ficha) {
    const circuloMaximo = getCirculoMaximoPorClasseNoContexto(ficha, "arcanista") || 1;
    const registros = [];

    for (let c = 1; c <= circuloMaximo; c++) {
        registros.push(...buscarMagiasPorFiltro(`magia_arcana_${c}`));
        registros.push(...buscarMagiasPorFiltro(`magia_universal_${c}`));
    }

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
function getMagiasClerigoConhecimentoMagico(ficha) {
    const circuloMaximo = getCirculoMaximoPorClasseNoContexto(ficha, "clerigo") || 1;
    const registros = [];

    for (let c = 1; c <= circuloMaximo; c++) {
        registros.push(...buscarMagiasPorFiltro(`magia_divina_${c}`));
        registros.push(...buscarMagiasPorFiltro(`magia_universal_${c}`));
    }

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
function getMagiasBardoAumentarRepertorio(ficha) {
    const circuloMaximo = getCirculoMaximoPorClasseNoContexto(ficha, "bardo") || 1;
    const registros = [];

    for (let c = 1; c <= circuloMaximo; c++) {
        registros.push(...buscarMagiasPorFiltro(`magia_arcana_${c}`));
        registros.push(...buscarMagiasPorFiltro(`magia_divina_${c}`));
        registros.push(...buscarMagiasPorFiltro(`magia_universal_${c}`));
    }

    const unicos = registros.reduce((acc, registro) => {
        if (!acc.some(r => String(r.id) === String(registro.id))) {
            acc.push(registro);
        }
        return acc;
    }, []);

    return filtrarForaMagiasJaConhecidas(
        filtrarMagiasPorEscolasDoBardo(unicos, ficha),
        ficha
    )
        .sort((a, b) => String(a.nome || "").localeCompare(String(b.nome || ""), "pt-BR"))
        .map(montarOpcaoDeRegistroBanco)
        .filter(Boolean);
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

    // durante a criaÃ§Ã£o: olhar escolhas pendentes da classe
    const pendenteCriacao = Object.values(state.criacao?.classeEscolhas || {})
        .flat()
        .find(op =>
            op?.tipoAplicacao === "grupo_escolha" &&
            caminhos.some(nome => normalizarTextoRegra(nome) === normalizarTextoRegra(op.valor))
        );

    if (pendenteCriacao?.valor) return pendenteCriacao.valor;

    // durante evoluÃ§Ã£o da ficha pronta
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
    return fichaTemPericiaTreinadaOuOficio(ficha, nomePericia);
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

    if (fichaTemPericiaTreinadaOuOficio(ficha, opcao.valor)) return true;

    const colecao = tipoOrigem === "classe"
        ? (state.criacao.classeEscolhas || {})
        : (state.criacao.racaEscolhas || {});

    for (const [escolhaId, lista] of Object.entries(colecao)) {
        if (escolhaId === escolhaIdAtual) continue;

        if ((lista || []).some(item =>
            item.tipoAplicacao === "pericia_treinada" &&
            normalizarTextoRegra(item.valor || "") === normalizarTextoRegra(opcao.valor || "")
        )) {
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


function garantirOficiosFicha(ficha) {
    if (!ficha) return [];

    if (!Array.isArray(ficha.oficios)) {
        if (Array.isArray(ficha.especializacoesOficio)) {
            ficha.oficios = [...ficha.especializacoesOficio];
        } else {
            ficha.oficios = [];
        }
    }

    ficha.oficios = ficha.oficios
        .map(v => String(v || "").trim())
        .filter(Boolean)
        .filter((valor, indice, arr) =>
            arr.findIndex(item => normalizarTextoRegra(item) === normalizarTextoRegra(valor)) === indice
        );

    return ficha.oficios;
}

function montarNomePericiaOficio(especialidade) {
    const nome = String(especialidade || "").trim();
    return nome ? `OfÃ­cio (${nome})` : "OfÃ­cio";
}

function extrairEspecializacaoOficio(nomePericia) {
    const texto = String(nomePericia || "").trim();
    const match = texto.match(/^Of[iÃ­]cio\s*\(([^)]+)\)$/i);
    return match ? String(match[1] || "").trim() : "";
}

function ehPericiaOficioEspecializada(nomePericia) {
    return !!extrairEspecializacaoOficio(nomePericia);
}

function fichaTemPericiaTreinadaOuOficio(ficha, nomePericia) {
    if (!ficha || !nomePericia) return false;

    const nomeNormalizado = normalizarTextoRegra(nomePericia);
    const especializacao = extrairEspecializacaoOficio(nomePericia);

    // OfÃ­cio especializado: bloqueia sÃ³ a prÃ³pria especializaÃ§Ã£o
    if (especializacao) {
        return garantirOficiosFicha(ficha).some(of =>
            normalizarTextoRegra(of) === normalizarTextoRegra(especializacao)
        );
    }

    // OfÃ­cio genÃ©rico: continua disponÃ­vel enquanto ainda existir
    // alguma especializaÃ§Ã£o nÃ£o aprendida
    if (nomeNormalizado === normalizarTextoRegra("OfÃ­cio")) {
        const oficios = garantirOficiosFicha(ficha);
        const totalEspecializacoes = ESPECIALIZACOES_OFICIO.length;
        const totalAprendidas = oficios.filter(Boolean).length;

        return totalAprendidas >= totalEspecializacoes;
    }

    const pericia = (ficha.pericias || []).find(p =>
        normalizarTextoRegra(p.nome || "") === nomeNormalizado
    );

    return !!pericia?.treinada;
}

function getPericiasExpandidas(ficha, apenasNaoTreinadas = false) {
    const resultado = [];

    (ficha?.pericias || []).forEach(pericia => {
        const nomeBase = String(pericia?.nome || "").trim();
        if (!nomeBase) return;

        if (normalizarTextoRegra(nomeBase) === normalizarTextoRegra('OfÃ­cio')) {
            ESPECIALIZACOES_OFICIO.forEach(especialidade => {
                const nome = montarNomePericiaOficio(especialidade);
                const treinada = fichaTemPericiaTreinadaOuOficio(ficha, nome);
                if (apenasNaoTreinadas && treinada) return;
                resultado.push({
                    ...pericia,
                    nome,
                    nomeBase,
                    especializacaoOficio: especialidade,
                    treinada
                });
            });
            return;
        }

        if (apenasNaoTreinadas && pericia?.treinada) return;
        resultado.push({ ...pericia, nome: nomeBase, nomeBase, treinada: !!pericia?.treinada });
    });

    return resultado;
}

function aplicarTreinoPericiaNaFicha(ficha, nomePericia, origemTipo = '', origemNome = '') {
    if (!ficha || !nomePericia) return false;

    const especializacao = extrairEspecializacaoOficio(nomePericia);
    ficha.efeitosAplicados = Array.isArray(ficha.efeitosAplicados) ? ficha.efeitosAplicados : [];

    if (especializacao) {
        const oficios = garantirOficiosFicha(ficha);
        const jaTem = oficios.some(of => normalizarTextoRegra(of) === normalizarTextoRegra(especializacao));
        if (!jaTem) {
            oficios.push(especializacao);
        }

        const periciaOficio = (ficha.pericias || []).find(p =>
            normalizarTextoRegra(p.nome || '') === normalizarTextoRegra('OfÃ­cio')
        );
        if (periciaOficio) {
            periciaOficio.treinada = true;
        }

        const alvoPadrao = montarNomePericiaOficio(especializacao);
        const jaTemEfeito = ficha.efeitosAplicados.some(e =>
            normalizarTextoRegra(e?.tipo || '') === 'pericia_treinada' &&
            normalizarTextoRegra(e?.alvo || '') === normalizarTextoRegra(alvoPadrao) &&
            normalizarTextoRegra(e?.origemTipo || '') === normalizarTextoRegra(origemTipo) &&
            normalizarTextoRegra(e?.origemNome || '') === normalizarTextoRegra(origemNome)
        );

        if (!jaTemEfeito) {
            ficha.efeitosAplicados.push({
                id: uid(),
                origemTipo,
                origemNome,
                tipo: 'pericia_treinada',
                alvo: alvoPadrao
            });
        }

        return true;
    }

    const pericia = (ficha.pericias || []).find(p =>
        normalizarTextoRegra(p.nome || '') === normalizarTextoRegra(nomePericia)
    );
    if (!pericia) return false;

    pericia.treinada = true;

    const jaTemEfeito = ficha.efeitosAplicados.some(e =>
        normalizarTextoRegra(e?.tipo || '') === 'pericia_treinada' &&
        normalizarTextoRegra(e?.alvo || '') === normalizarTextoRegra(pericia.nome) &&
        normalizarTextoRegra(e?.origemTipo || '') === normalizarTextoRegra(origemTipo) &&
        normalizarTextoRegra(e?.origemNome || '') === normalizarTextoRegra(origemNome)
    );

    if (!jaTemEfeito) {
        ficha.efeitosAplicados.push({
            id: uid(),
            origemTipo,
            origemNome,
            tipo: 'pericia_treinada',
            alvo: pericia.nome
        });
    }

    return true;
}


function marcarTreinoPericiaSemRegistrar(ficha, nomePericia) {
    if (!ficha || !nomePericia) return false;

    const especializacao = extrairEspecializacaoOficio(nomePericia);

    if (especializacao) {
        const oficios = garantirOficiosFicha(ficha);
        const jaTem = oficios.some(of => normalizarTextoRegra(of) === normalizarTextoRegra(especializacao));
        if (!jaTem) {
            oficios.push(especializacao);
        }

        const periciaOficio = (ficha.pericias || []).find(p =>
            normalizarTextoRegra(p.nome || '') === normalizarTextoRegra('OfÃ­cio')
        );
        if (periciaOficio) {
            periciaOficio.treinada = true;
        }
        return true;
    }

    const pericia = (ficha.pericias || []).find(p =>
        normalizarTextoRegra(p.nome || '') === normalizarTextoRegra(nomePericia)
    );
    if (!pericia) return false;

    pericia.treinada = true;
    return true;
}

function reconstruirTreinosPericiaDaFicha(ficha) {
    if (!ficha) return;

    const oficios = garantirOficiosFicha(ficha);

    (ficha.pericias || []).forEach(pericia => {
        pericia.treinada = false;
    });

    (ficha.efeitosAplicados || []).forEach(efeito => {
        if (normalizarTextoRegra(efeito?.tipo || '') !== 'pericia_treinada') return;

        const alvo = String(efeito?.alvo || '').trim();
        if (!alvo) return;

        const especializacao = extrairEspecializacaoOficio(alvo);
        if (especializacao) {
            const jaTem = oficios.some(of => normalizarTextoRegra(of) === normalizarTextoRegra(especializacao));
            if (!jaTem) oficios.push(especializacao);
            return;
        }

        const pericia = (ficha.pericias || []).find(p =>
            normalizarTextoRegra(p.nome || '') === normalizarTextoRegra(alvo)
        );
        if (pericia) {
            pericia.treinada = true;
        }
    });

    const periciaOficio = (ficha.pericias || []).find(p =>
        normalizarTextoRegra(p.nome || '') === normalizarTextoRegra('OfÃ­cio')
    );
    if (periciaOficio && oficios.length > 0) {
        periciaOficio.treinada = true;
    }
}

function renderResumoOficiosFicha(ficha) {
    return "";
}

function opcaoGenericaOficioTemEspecializacaoSelecionada(lista, opcaoBase) {
    const itens = Array.isArray(lista) ? lista : [];
    if (!ehOpcaoPericiaOficioGenerico(opcaoBase)) return false;

    const prefixoId = `${String(opcaoBase?.id || "")}:oficio:`;
    return itens.some(item => {
        const itemId = String(item?.id || "");
        const mesmoPrefixo = prefixoId && itemId.startsWith(prefixoId);
        const ehEspecializacao = !!item?.especializacaoOficio || ehPericiaOficioEspecializada(item?.valor || "");
        return mesmoPrefixo || ehEspecializacao;
    });
}

function ehOpcaoPericiaOficioGenerico(opcao) {
    return opcao?.tipoAplicacao === "pericia_treinada"
        && normalizarTextoRegra(opcao?.valor || "") === normalizarTextoRegra("OfÃ­cio");
}

function criarOpcaoEspecializadaOficio(opcaoBase, especialidade) {
    const nome = montarNomePericiaOficio(especialidade);
    return {
        ...opcaoBase,
        id: `${String(opcaoBase?.id || "oficio")}:oficio:${normalizarTextoRegra(especialidade).replace(/\s+/g, "_")}`,
        valor: nome,
        label: `PerÃ­cia: ${nome}`,
        especializacaoOficio: especialidade
    };
}
function getEspecializacoesOficioDisponiveisParaEscolha(ficha, selecoesAtuais = []) {
    const atuais = Array.isArray(selecoesAtuais) ? selecoesAtuais : [];

    return ESPECIALIZACOES_OFICIO.filter(nome => {
        const jaTemNaFicha = fichaTemPericiaTreinadaOuOficio(ficha, montarNomePericiaOficio(nome));
        const jaSelecionadoNoModal = atuais.some(item =>
            normalizarTextoRegra(item) === normalizarTextoRegra(nome)
        );

        return !jaTemNaFicha || jaSelecionadoNoModal;
    });
}
function abrirModalEspecializacoesOficioEscolha(contexto) {
    const payload = { ...(contexto || {}) };
    const targetState = payload.targetState === "evolucao" ? state.evolucao : state.criacao;
    const lista = Array.isArray(targetState?.[payload.escolhaKey]?.[payload.escolhaId])
        ? targetState[payload.escolhaKey][payload.escolhaId]
        : [];

    const selecoesAtuais = lista
        .filter(item => {
            const itemId = String(item?.id || "");
            const prefixoId = `${String(payload?.opcaoBase?.id || "")}:oficio:`;
            return itemId.startsWith(prefixoId) || !!item?.especializacaoOficio || ehPericiaOficioEspecializada(item?.valor || "");
        })
        .map(item => String(item?.especializacaoOficio || extrairEspecializacaoOficio(item?.valor || "") || "").trim())
        .filter(Boolean);

    state.modal = "oficios_escolha";
    state.modalPayload = {
        ...payload,
        selecoes: selecoesAtuais
    };
    render();
}

function toggleEspecializacaoOficioEscolha(nome) {
    if (state.modal !== "oficios_escolha") return;
    state.modalPayload = state.modalPayload || {};
    state.modalPayload.selecoes = Array.isArray(state.modalPayload.selecoes)
        ? state.modalPayload.selecoes
        : [];

    const lista = state.modalPayload.selecoes;
    const idx = lista.findIndex(item => normalizarTextoRegra(item) === normalizarTextoRegra(nome));

    if (idx >= 0) {
        lista.splice(idx, 1);
    } else {
        const maximo = Number(state.modalPayload?.maximo) || 1;
        if (lista.length >= maximo) return;
        lista.push(nome);
    }

    render();
}

function confirmarModalEspecializacoesOficioEscolha() {
    if (state.modal !== "oficios_escolha") return;

    const payload = state.modalPayload || {};
    const selecoes = Array.isArray(payload.selecoes)
        ? payload.selecoes.map(v => String(v || "").trim()).filter(Boolean)
        : [];

    if (!selecoes.length) return;

    const targetState = payload.targetState === "evolucao" ? state.evolucao : state.criacao;
    targetState[payload.escolhaKey] = targetState[payload.escolhaKey] || {};
    targetState[payload.escolhaKey][payload.escolhaId] = targetState[payload.escolhaKey][payload.escolhaId] || [];

    const lista = targetState[payload.escolhaKey][payload.escolhaId];
    const ficha = payload.targetState === "evolucao" ? getFichaEvolucaoAtual() : getFichaCriacao();

    selecoes.forEach(nome => {
        const opcao = criarOpcaoEspecializadaOficio(payload.opcaoBase || {}, nome);
        const jaExisteNaLista = lista.some(item => normalizarTextoRegra(item?.valor || "") === normalizarTextoRegra(opcao.valor || ""));
        const jaTemNaFicha = ficha ? fichaTemPericiaTreinadaOuOficio(ficha, opcao.valor || "") : false;
        if (!jaExisteNaLista && !jaTemNaFicha) {
            lista.push(opcao);
        }
    });

    fecharModal();

    if (payload.targetState === "evolucao") {
        render();
    } else {
        sincronizarFichaTemporariaClassesCriacao();
        renderMantendoScrollEscolha();
    }
}

function renderModalEspecializacoesOficioEscolha() {
    if (state.modal !== "oficios_escolha") return "";

    state.modalPayload = state.modalPayload || {};
    const selecoes = Array.isArray(state.modalPayload.selecoes)
        ? state.modalPayload.selecoes
        : [];
    const ficha = state.modalPayload?.targetState === "evolucao"
        ? getFichaEvolucaoAtual()
        : getFichaCriacao();

    const especializacoesDisponiveis = getEspecializacoesOficioDisponiveisParaEscolha(ficha, selecoes);
    const maximo = Number(state.modalPayload.maximo) || 1;
    const titulo = state.modalPayload.titulo || "Escolha os ofÃ­cios";

    return `
      <div class="overlay mf-add-habilidade-overlay" onclick="fecharModal()">
        <div class="overlay-card mf-add-habilidade-modal mf-magia-detail-modal mf-classe-submodal" onclick="event.stopPropagation()">
          <div class="overlay-header mf-add-habilidade-header">
            <div>
              <div class="overlay-title">${escapeHtml(titulo)}</div>
              <div class="subtitle">Selecionados: ${selecoes.length} / ${maximo}</div>
            </div>
            <div class="mf-classe-submodal-actions">
              <button class="mf-add-habilidade-btn mf-add-habilidade-btn-fechar" onclick="fecharModal()">Cancelar</button>
              <button class="mf-add-habilidade-btn mf-classe-submodal-btn-ok" onclick="confirmarModalEspecializacoesOficioEscolha()">Confirmar</button>
            </div>
          </div>
          <div class="overlay-body mf-add-habilidade-body mf-magia-detail-body">
            <div class="mf-magia-detail-scroll">
              <div class="mf-magia-detail-card">
                <div class="mf-magia-detail-card-title">Especializacoes</div>
                <div class="mf-detail-choice-list">
    ${especializacoesDisponiveis.length === 0
            ? `<div class="mf-magia-detail-vazio">Todas as especializacoes de Oficio ja foram aprendidas.</div>`
            : especializacoesDisponiveis.map(nome => {
                const checked = selecoes.some(item => normalizarTextoRegra(item) === normalizarTextoRegra(nome));
                const disabled = !checked && selecoes.length >= maximo;
                return `
              <label class="mf-classe-submodal-row ${disabled ? "disabled" : ""}">
                <div class="mf-classe-submodal-row-title">${escapeHtml(nome)}</div>
                <input
                  class="mf-classe-submodal-check"
                  type="checkbox"
                  ${checked ? "checked" : ""}
                  ${disabled ? "disabled" : ""}
                  onclick="event.stopPropagation()"
                  onchange="toggleEspecializacaoOficioEscolha('${escapeAttr(nome)}')"
                >
              </label>
            `;
            }).join("")
        }
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
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
        mapa[id] = Number(cp.nivel || cp.niveis) || 0;
    });

    // Contexto da criaÃ§Ã£o
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

    // Contexto da evoluÃ§Ã£o da ficha aberta
    const ctxEvolucao = state.evolucao?.classeEvolucaoContexto;
    if (ctxEvolucao?.classeId) {
        mapa[ctxEvolucao.classeId] = Math.max(
            mapa[ctxEvolucao.classeId] || 0,
            Number(ctxEvolucao.nivelAlvo) || 1
        );
    }

    return mapa;
}

function getNomesPericiasTreinadasNoContexto(ficha) {
    const set = new Set();

    (ficha?.pericias || []).forEach(p => {
        if (p?.treinada) set.add(p.nome);
    });

    garantirOficiosFicha(ficha).forEach(oficio => {
        set.add(montarNomePericiaOficio(oficio));
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
        .replace(/['â€™]/g, "")
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
    const limite = Number(quantidadeMaxima) || 0;
    const idx = lista.findIndex(item => item.id === opcao.id);

    if (idx >= 0) {
        lista.splice(idx, 1);
    } else {
        if (opcao.escolhaBloqueada) return;

        if (opcao.ehAumentoAtributo) {
            const ficha = state.screen === "criacao" ? getFichaCriacao() : getFichaEvolucaoAtual();
            const atributo = opcao.atributoEscolhido || opcao.valor;

            if (!podeEscolherAumentoDeAtributo(ficha, atributo)) return;
        }

        if (limite > 0 && lista.length >= limite) return;
        lista.push(opcao);
    }

    renderMantendoScrollEscolha();
}
function poderClassePodeSerEscolhidoMaisDeUmaVez(nomePoder) {
    const nome = normalizarNomeHabilidade(nomePoder || "");
    return [
        "aumentar repertorio",
        "orar",
        "truque magico",
        "segredos da natureza",
        "companheiro animal",
        "inimigo de (criatura)",
        "arcanista: conhecimento magico",
        "clerigo: conhecimento magico",
        "proficiencia",
        "treinamento em pericia",
        "especializacao em arma",
        "foco em pericia"
    ].includes(nome);
}
function montarEscolhaEspecialPoderTreinamentoPericia(opcaoBase, ficha) {
    const opcoes = getPericiasExpandidas(ficha, true).map(p => p.nome);

    return [{
        id: `poder_especial:${opcaoBase.registroId}:treinamento_pericia`,
        registro_id: String(opcaoBase.registroId || ""),
        ordem: 1,
        tipo: "pericia_treinada",
        titulo: "Escolha uma perÃ­cia",
        descricao: "Escolha uma perÃ­cia para se tornar treinado nela.",
        quantidade: 1,
        filtro: "lista",
        opcoesTexto: opcoes.join("|"),
        regrasGrupo: "",
        dependeDe: ""
    }];
}
function montarEscolhaEspecialPoderProficiencia(opcaoBase, ficha) {
    const opcoes = [
        "Armas marciais",
        "Armas de fogo",
        "Armaduras pesadas",
        "Escudos"
    ];

    if (fichaTemProficiencia(ficha, "Armas marciais")) {
        opcoes.splice(2, 0, "Armas exÃ³ticas");
    }

    return [{
        id: `poder_especial:${opcaoBase.registroId}:proficiencia`,
        registro_id: String(opcaoBase.registroId || ""),
        ordem: 1,
        tipo: "proficiencia",
        titulo: "Escolha uma proficiÃªncia",
        descricao: "Escolha uma proficiÃªncia para receber com este poder.",
        quantidade: 1,
        filtro: "lista",
        opcoesTexto: opcoes.join("|"),
        regrasGrupo: "",
        dependeDe: ""
    }];
}
function getEscolhaClasseSelecionadaQueAbriuPoder() {
    const classeEscolhas = state.screen === "criacao"
        ? (state.criacao?.classeEscolhas || {})
        : (state.evolucao?.classeEscolhas || {});

    const escolhaPoderClasseAbertaId = getEscolhaPoderClasseAbertaId();
    if (!escolhaPoderClasseAbertaId) return null;

    for (const [escolhaId, opcoes] of Object.entries(classeEscolhas)) {
        const encontrada = (opcoes || []).find(op =>
            Array.isArray(op?.escolhas) &&
            op.escolhas.some(e => String(e.id) === String(escolhaPoderClasseAbertaId))
        );

        if (encontrada) {
            return {
                tipo: "classe",
                escolhaId,
                opcao: encontrada
            };
        }
    }

    if (state.screen === "criacao") {
        const origemEscolhas = state.criacao?.origemEscolhas || {};

        for (const [escolhaId, opcoes] of Object.entries(origemEscolhas)) {
            const encontrada = (opcoes || []).find(op =>
                Array.isArray(op?.escolhas) &&
                op.escolhas.some(e => String(e.id) === String(escolhaPoderClasseAbertaId))
            );

            if (encontrada) {
                return {
                    tipo: "origem",
                    escolhaId,
                    opcao: encontrada
                };
            }
        }
    }

    return null;
}

function aplicarEscolhasDoPoderClasseNaFichaImediatamente(ficha, classe, opcaoComEscolhas) {
    if (!ficha || !classe || !opcaoComEscolhas) return;

    const nomeBase = normalizarTextoRegra(opcaoComEscolhas.nomeCurto || opcaoComEscolhas.valor || "");

    if (opcaoComEscolhas.escolhaEspecial === "golpe_pessoal") {
        const registro = criarRegistroGolpePessoalParaFicha(opcaoComEscolhas);

        adicionarHabilidadeNaFicha(
            ficha,
            {
                nome: registro.nome,
                descricao: registro.descricao || "",
                custoPm: Number(registro.custoPm) || 0,
                custoVida: 0,
                custoPmPermanente: 0,
                custoVidaPermanente: 0,
                resumoUso: registro.resumoUso || "",
                registroId: "",
                ativavel: true,
                permiteIntensificar: false,
                incrementos: [],
                escolhas: [],
                nomeCurto: registro.nomeCurto || registro.nome || "",
                tipoRegistro: "poder",
                origemBase: "classe",
                filtros: registro.filtros || "",
                escolhaEspecial: "golpe_pessoal",
                escolhaEspecialValor: registro.escolhaEspecialValor || "",
                golpePessoalConfig: registro.golpePessoalConfig || null
            },
            "Classe",
            classe.nome
        );

        const habilidadeAdicionada = ficha.habilidades?.[ficha.habilidades.length - 1];
        if (habilidadeAdicionada) {
            habilidadeAdicionada.registroId = "";
            habilidadeAdicionada.idPersonalizado = registro.id || "";
            habilidadeAdicionada.nome = registro.nome || habilidadeAdicionada.nome || "";
            habilidadeAdicionada.nomeCurto = registro.nomeCurto || registro.nome || "";
            habilidadeAdicionada.descricao = registro.descricao || habilidadeAdicionada.descricao || "";
            habilidadeAdicionada.custoPm = Number(registro.custoPm) || 0;
            habilidadeAdicionada.custoVida = 0;
            habilidadeAdicionada.custoPmPermanente = 0;
            habilidadeAdicionada.custoVidaPermanente = 0;
            habilidadeAdicionada.resumoUso = registro.resumoUso || "";
            habilidadeAdicionada.ativavel = true;
            habilidadeAdicionada.permiteIntensificar = false;
            habilidadeAdicionada.incrementos = [];
            habilidadeAdicionada.escolhas = [];
            habilidadeAdicionada.tipoRegistro = "poder";
            habilidadeAdicionada.origemBase = "classe";
            habilidadeAdicionada.filtros = registro.filtros || "";
            habilidadeAdicionada.escolhaEspecial = "golpe_pessoal";
            habilidadeAdicionada.escolhaEspecialValor = registro.escolhaEspecialValor || "";
            habilidadeAdicionada.golpePessoalConfig = registro.golpePessoalConfig || null;
        }

        return;
    }

    if (nomeBase === "foco em pericia" && opcaoComEscolhas.escolhaEspecialValor) {
        adicionarHabilidadeNaFicha(
            ficha,
            {
                nome: `Foco em PerÃ­cia: ${opcaoComEscolhas.escolhaEspecialValor}`,
                descricao: opcaoComEscolhas.descricao || "",
                custoPm: 0,
                custoVida: 0,
                custoPmPermanente: 0,
                custoVidaPermanente: 0,
                resumoUso: "",
                registroId: opcaoComEscolhas.registroId || "",
                ativavel: false,
                permiteIntensificar: false,
                incrementos: [],
                escolhas: []
            },
            "Classe",
            classe.nome
        );
    }

    const escolhasResolvidas = Array.isArray(opcaoComEscolhas.escolhasResolvidas)
        ? opcaoComEscolhas.escolhasResolvidas
        : [];

    escolhasResolvidas.forEach(bloco => {
        (bloco?.selecionadas || []).forEach(opcao => {
            if (opcao.tipoAplicacao === "magia_adicionar") {
                adicionarOuAtualizarMagiaNaFicha(
                    ficha,
                    {
                        registroId: opcao.registroId || "",
                        nome: opcao.valor || "",
                        nomeAdicionado: opcao.nomeAdicionado || "",
                        tipoMagiaInventor: opcao.tipoMagiaInventor || "",
                        origemEspecial: opcao.origemEspecial || ""
                    },
                    "Classe",
                    classe.nome
                );

                const magiaAdicionada = (ficha.magias || []).find(m =>
                    normalizarTextoRegra(m?.nome || "") === normalizarTextoRegra(opcao.valor || "")
                );

                if (magiaAdicionada && opcao.origemEspecial === "inventor_formula") {
                    magiaAdicionada.tipoMagiaInventor = "formula";
                    magiaAdicionada.prefixoExibicao = "FÃ³rmula";
                }
            }

            if (opcao.tipoAplicacao === "pericia_treinada") {
                marcarTreinoPericiaSemRegistrar(ficha, opcao.valor);
            }

            if (opcao.tipoAplicacao === "proficiencia_adicionar") {
                ficha.proficiencias = Array.isArray(ficha.proficiencias) ? ficha.proficiencias : [];

                if (!fichaTemProficiencia(ficha, opcao.valor)) {
                    ficha.proficiencias.push(opcao.valor || "");
                }
            }
        });
    });
}
function confirmarEscolhaPoderClasseModal() {
    const escolhaId = getEscolhaPoderClasseAbertaId();
    if (!escolhaId) return;

    const ficha = state.screen === "criacao" ? getFichaCriacao() : getFichaEvolucaoAtual();
    const origem = getEscolhaClasseSelecionadaQueAbriuPoder();
    const classe = state.screen === "criacao"
        ? (getClasseEvolucaoAtualCriacao() || getClasseSelecionadaCriacao())
        : getClasseEvolucaoAtualFicha?.();

    if (!ficha) return;
    if (!origem?.opcao) return;

    const poderBanco = classe ? (classe.poderes || []).find(p =>
        (p.escolhas || []).some(e => String(e.id) === String(escolhaId))
    ) : null;

    const escolha =
        (origem.opcao.escolhas || []).find(e => String(e.id) === String(escolhaId)) ||
        (poderBanco?.escolhas || []).find(e => String(e.id) === String(escolhaId));

    if (!escolha) return;

    const selecionados = getEscolhaPoderClasseValores(escolha.id);
    const quantidade = Number(escolha.quantidade) || 0;

    if (selecionados.length !== quantidade) return;

    origem.opcao.escolhasResolvidas = origem.opcao.escolhasResolvidas || [];

    const existente = origem.opcao.escolhasResolvidas.find(e =>
        String(e.escolhaId) === String(escolha.id)
    );

    const payload = {
        escolhaId: escolha.id,
        selecionadas: JSON.parse(JSON.stringify(selecionados))
    };

    if (existente) {
        existente.selecionadas = payload.selecionadas;
    } else {
        origem.opcao.escolhasResolvidas.push(payload);
    }
    const nomeBasePoder = normalizarTextoRegra(origem.opcao.nomeCurto || origem.opcao.valor || "");

    // PASSO 7: intercepta Golpe Pessoal antes do fluxo dos focos
    if (isGolpePessoalOpcao(origem.opcao)) {
        abrirGolpePessoalModal();
        return;
    }

    if (
        (nomeBasePoder === "foco em arma" ||
            nomeBasePoder === "foco em magia" ||
            nomeBasePoder === "foco em pericia") &&
        selecionados.length === 1
    ) {
        const selecionada = selecionados[0];

        origem.opcao.label = selecionada.label || origem.opcao.label;
        origem.opcao.valor = selecionada.valor || origem.opcao.valor;
        origem.opcao.nomeCurto = selecionada.nomeCurto || selecionada.valor || origem.opcao.nomeCurto;
        origem.opcao.escolhaEspecial = selecionada.escolhaEspecial || origem.opcao.escolhaEspecial;
        origem.opcao.escolhaEspecialValor = selecionada.escolhaEspecialValor || origem.opcao.escolhaEspecialValor;
        origem.opcao.itemBaseId = selecionada.itemBaseId || origem.opcao.itemBaseId || "";
        origem.opcao.magiaNome = selecionada.magiaNome || origem.opcao.magiaNome || "";
        origem.opcao.periciaNome = selecionada.periciaNome || origem.opcao.periciaNome || "";
    }

    origem.opcao.escolhasConfirmadas = true;

    if (origem.tipo !== "origem") {
        if (!classe) return;
        aplicarEscolhasDoPoderClasseNaFichaImediatamente(ficha, classe, origem.opcao);
    }

    if (state.screen === "criacao") {
        state.criacao.escolhaPoderClasseAbertaId = null;
        if (origem.tipo !== "origem") {
            state.criacao.escolhaClasseAbertaId = null;
            sincronizarFichaTemporariaClassesCriacao();
        }
    } else {
        state.evolucao.escolhaPoderClasseAbertaId = null;
        state.evolucao.escolhaClasseAbertaId = null;
    }

    saveFichas?.();
    render();
}
function fecharEscolhaPoderClasseModal() {
    const origem = getEscolhaClasseSelecionadaQueAbriuPoder();

    // PASSO 9: limpa o estado temporÃ¡rio do Golpe Pessoal
    const ctxGolpe = getGolpePessoalStateAtual();
    if (ctxGolpe) {
        ctxGolpe.golpePessoalModal = null;
    }

    if (origem?.opcao && !origem.opcao.escolhasConfirmadas) {
        const escolhaOrigemId = origem.escolhaId;
        const opcaoId = origem.opcao.id;

        const mapaClasse = origem.tipo === "origem"
            ? (state.criacao.origemEscolhas || {})
            : (state.screen === "criacao"
                ? (state.criacao.classeEscolhas || {})
                : (state.evolucao.classeEscolhas || {}));

        const lista = Array.isArray(mapaClasse[escolhaOrigemId]) ? mapaClasse[escolhaOrigemId] : [];
        const idx = lista.findIndex(item => item.id === opcaoId);

        if (idx >= 0) {
            const removida = lista[idx];
            lista.splice(idx, 1);

            const mapaPoder = state.screen === "criacao"
                ? (state.criacao.poderClasseEscolhas || {})
                : (state.evolucao.poderClasseEscolhas || {});

            (removida?.escolhas || []).forEach(escolhaInterna => {
                delete mapaPoder[String(escolhaInterna.id || "")];
            });

            removida.escolhasResolvidas = [];
            removida.escolhasConfirmadas = false;
        }
    }

    if (state.screen === "criacao") {
        state.criacao.escolhaPoderClasseAbertaId = null;
    } else {
        state.evolucao.escolhaPoderClasseAbertaId = null;
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

    if (!ficha) return "";

    if (escolhaId === "__golpe_pessoal__") {
        return renderGolpePessoalModal();
    }

    const origem = getEscolhaClasseSelecionadaQueAbriuPoder();
    if (!origem?.opcao) return "";

    if (isGolpePessoalOpcao(origem.opcao)) {
        const ctx = getGolpePessoalStateAtual();
        if (!ctx.golpePessoalModal) {
            abrirGolpePessoalModal();
        }
        return renderGolpePessoalModal();
    }

    const poderBanco = classe ? (classe.poderes || []).find(p =>
        (p.escolhas || []).some(e => String(e.id) === String(escolhaId))
    ) : null;

    const escolha =
        (origem.opcao.escolhas || []).find(e => String(e.id) === String(escolhaId)) ||
        (poderBanco?.escolhas || []).find(e => String(e.id) === String(escolhaId));

    if (!escolha) return "";

    const quantidade = Number(escolha.quantidade) || 0;
    const selecionados = getEscolhaPoderClasseValores(escolha.id);
    const opcoesBase = getOpcoesEscolha(escolha, ficha);

    const opcoes = ordenarOpcoesParaExibicao(opcoesBase, (opcao) => {
        const checked = selecionados.some(item => item.id === opcao.id) || opcaoGenericaOficioTemEspecializacaoSelecionada(selecionados, opcao);
        const bloqueada = !!opcao.escolhaBloqueada;
        return checked || (!bloqueada && (quantidade <= 0 || selecionados.length < quantidade));
    });

    setTimeout(() => {
        document.body.classList.add("modal-open");
    }, 0);

    return `
      <div class="overlay mf-add-habilidade-overlay" onclick="fecharEscolhaPoderClasseModal()">
        <div class="overlay-card mf-add-habilidade-modal mf-magia-detail-modal mf-classe-submodal" onclick="event.stopPropagation()">
          <div class="overlay-header mf-add-habilidade-header">
            <div>
              <div class="overlay-title">${escapeHtml(escolha.titulo || "Escolha")}</div>
              <div class="subtitle">
                ${escapeHtml(escolha.descricao || "")}
                ${escolha.descricao ? " &bull; " : ""}
                Selecionados: ${selecionados.length} / ${quantidade}
              </div>
            </div>

            <div class="mf-classe-submodal-actions">
              <button
                class="mf-add-habilidade-btn mf-classe-submodal-btn-ok"
                onclick="confirmarEscolhaPoderClasseModal()"
                ${selecionados.length !== quantidade ? "disabled" : ""}
              >
                Confirmar
              </button>
              <button class="mf-add-habilidade-btn mf-add-habilidade-btn-fechar" onclick="fecharEscolhaPoderClasseModal()">Fechar</button>
            </div>
          </div>

          <div class="overlay-body mf-add-habilidade-body mf-magia-detail-body">
            <div class="mf-magia-detail-scroll">
              <div class="mf-magia-detail-card">
                <div class="mf-magia-detail-card-title">Opcoes</div>
                <div class="mf-detail-choice-list">
              ${opcoes.map(opcao => {
        const checked = selecionados.some(item => item.id === opcao.id) || opcaoGenericaOficioTemEspecializacaoSelecionada(selecionados, opcao);
        const bloqueada = !!opcao.escolhaBloqueada;
        const disabled = bloqueada || (!checked && quantidade > 0 && selecionados.length >= quantidade);

        return `
                    <label class="mf-classe-submodal-row ${disabled ? "disabled" : ""}" style="cursor:${disabled ? "not-allowed" : "pointer"};">
                      <div>
                        <div class="mf-classe-submodal-row-title">${escapeHtml(opcao.label || opcao.valor || "")}</div>
                        ${opcao.preRequisitos ? `<div class="mf-classe-submodal-row-sub">${escapeHtml(opcao.preRequisitos)}</div>` : ""}
                      </div>

                      <input
                        class="mf-classe-submodal-check"
                        type="checkbox"
                        ${checked ? "checked" : ""}
                        ${disabled ? "disabled" : ""}
                        onclick="event.stopPropagation()"
                        onchange='toggleEscolhaPoderClasseValor("${escapeAttr(escolha.id)}", ${JSON.stringify(opcao).replace(/'/g, "&apos;")}, ${quantidade})'
                      >
                    </label>
                  `;
    }).join("")}
                </div>
              </div>
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
        circuloMaximo: getCirculoMaximoMagiasNaFicha(ficha),
        nivelPersonagem: getNivelTotalFicha(ficha) || 1,
        proficiencias: new Set((ficha?.proficiencias || []).map(p => normalizarTextoRegra(p))),
        podeLancarMagias: personagemPodeLancarMagiasNoContexto(ficha),
        oficios: new Set(garantirOficiosFicha(ficha).map(oficio => normalizarTextoRegra(oficio)))
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
        "bÃ¡rbaro": "barbaro",
        "arcanista": "arcanista",
        "bardo": "bardo",
        "bucaneiro": "bucaneiro",
        "cacador": "cacador",
        "caÃ§ador": "cacador",
        "cavaleiro": "cavaleiro",
        "clerigo": "clerigo",
        "clÃ©rigo": "clerigo",
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
function getCirculoPorClasseENivel(classeId, nivel) {
    const id = normalizarTextoRegra(classeId || "");
    const n = Number(nivel) || 0;

    if (id === "arcanista" || id === "clerigo" || id === "druida") {
        if (n >= 17) return 5;
        if (n >= 13) return 4;
        if (n >= 9) return 3;
        if (n >= 5) return 2;
        if (n >= 1) return 1;
        return 0;
    }

    if (id === "bardo") {
        if (n >= 14) return 4;
        if (n >= 10) return 3;
        if (n >= 6) return 2;
        if (n >= 1) return 1;
        return 0;
    }

    return 0;
}
function getCirculoMaximoPorClasseNoContexto(ficha, classeId) {
    const id = normalizarTextoRegra(classeId || "");
    if (!id) return 0;

    let max = 0;

    (ficha?.classesPersonagem || []).forEach(cp => {
        if (normalizarTextoRegra(cp?.classeId || "") !== id) return;
        max = Math.max(max, getCirculoPorClasseENivel(cp.classeId, cp.niveis));
    });

    const ctxCriacao = state?.criacao?.classeEvolucaoContexto;
    const classeCriacao = getClasseEvolucaoAtualCriacao?.() || getClasseSelecionadaCriacao?.();
    if (
        classeCriacao?.id &&
        normalizarTextoRegra(classeCriacao.id) === id &&
        ctxCriacao?.nivelAlvo
    ) {
        max = Math.max(max, getCirculoPorClasseENivel(classeCriacao.id, ctxCriacao.nivelAlvo));
    }

    const ctxEvolucao = state?.evolucao?.classeEvolucaoContexto;
    const classeEvolucao = getClasseEvolucaoAtualFicha?.();
    if (
        classeEvolucao?.id &&
        normalizarTextoRegra(classeEvolucao.id) === id &&
        ctxEvolucao?.nivelAlvo
    ) {
        max = Math.max(max, getCirculoPorClasseENivel(classeEvolucao.id, ctxEvolucao.nivelAlvo));
    }

    return max;
}

function extrairPartesPreRequisito(texto) {
    const partesBase = String(texto || "")
        .split(/\s*,\s*/g)
        .map(s => s.trim())
        .filter(Boolean);

    const partesFinais = [];

    partesBase.forEach(parte => {
        const opcoesOu = parte
            .split(/\s+ou\s+/i)
            .map(s => s.trim())
            .filter(Boolean);

        if (opcoesOu.length > 1) {
            partesFinais.push({
                tipo: "ou",
                opcoes: opcoesOu
            });
            return;
        }

        const subpartesE = parte
            .split(/\s+e\s+/i)
            .map(s => s.trim())
            .filter(Boolean);

        subpartesE.forEach(sub => {
            partesFinais.push({
                tipo: "simples",
                valor: sub
            });
        });
    });

    return partesFinais;
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
            forca: "ForÃ§a",
            destreza: "Destreza",
            constituicao: "ConstituiÃ§Ã£o",
            inteligencia: "InteligÃªncia",
            sabedoria: "Sabedoria",
            carisma: "Carisma"
        };

        return `${nomes[chave]} ${minimo}`;
    }
    // nÃ­vel de classe: "7Âº nÃ­vel de inventor"
    m = txt.match(/\b(\d+)\s*(?:o|Âº|Â°)?\s*nivel de\s+(barbaro|bÃ¡rbaro|arcanista|bardo|bucaneiro|cacador|caÃ§ador|cavaleiro|clerigo|clÃ©rigo|druida|guerreiro|inventor|ladino|lutador|nobre|paladino)\b/);
    if (m) {
        const minimo = Number(m[1]) || 0;
        const classeId = aliasClasse[m[2]];
        const atual = Number(ctx.niveisClasse?.[classeId]) || 0;
        if (atual >= minimo) return null;
        return raw.replace(/\s+/g, " ").trim();
    }
    // classe: "BÃ¡rbaro 3"
    m = txt.match(/\b(barbaro|bÃ¡rbaro|arcanista|bardo|bucaneiro|cacador|caÃ§ador|cavaleiro|clerigo|clÃ©rigo|druida|guerreiro|inventor|ladino|lutador|nobre|paladino)\s+(\d+)\b/);
    if (m) {
        const classeId = aliasClasse[m[1]];
        const minimo = Number(m[2]) || 0;
        const atual = Number(ctx.niveisClasse?.[classeId]) || 0;
        if (atual >= minimo) return null;

        const nomeFmt = raw.replace(/\s+/g, " ").trim();
        return nomeFmt;
    }

    // cÃ­rculo: "2Âº cÃ­rculo", "3 circulo"
    m = txt.match(/\b(\d+)\s*(?:o|Âº)?\s*circulo\b/);
    if (m) {
        const minimo = Number(m[1]) || 0;
        const atual = Number(ctx.circuloMaximo) || 0;
        if (atual >= minimo) return null;
        return `${minimo}Âº cÃ­rculo`;
    }

    // poderes da tormenta: "quatro outros poderes da tormenta", "1 poder da tormenta"
    const regraTormenta = analisarPreRequisitoPoderTormentaLivre(raw);
    if (regraTormenta) {
        const totalAtual = Number(ctx.poderesTormenta) || 0;

        if (totalAtual >= regraTormenta.minimo) return null;
        return raw;
    }

    // OfÃ­cio especializado: "Treinado em OfÃ­cio (alquimista)"
    m = raw.match(/(?:treinado\s+em\s+)?of[iÃ­]cio\s*\(([^)]+)\)/i);
    if (m) {
        const oficioReq = normalizarTextoRegra(m[1]);
        if (ctx.oficios?.has(oficioReq)) return null;
        return raw;
    }

    // perÃ­cia: "treinado em Fortitude", "Fortitude"
    m = txt.match(/(?:treinado em|treinado na|pericia|perÃ­cia)\s+(.+)/);
    if (m) {
        const nomeReq = normalizarTextoRegra(m[1]);

        const tem = [...ctx.periciasTreinadas].some(p => {
            const nomeAtual = normalizarTextoRegra(p);
            return nomeAtual === nomeReq || nomeAtual.startsWith(nomeReq + " (");
        });

        if (tem) return null;
        return raw;
    }

    // nÃ­vel de personagem: "6Âº nÃ­vel de personagem"
    m = txt.match(/\b(\d+)\s*(?:o|Âº)?\s*nivel de personagem\b/);
    if (m) {
        const minimo = Number(m[1]) || 0;
        const atual = Number(ctx.nivelPersonagem) || 0;
        if (atual >= minimo) return null;
        return `${minimo}Âº nÃ­vel de personagem`;
    }

    // proficiÃªncia
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

    // lanÃ§ar magias / habilidade magias
    if (txt === "lancar magias" || txt === "lanÃ§ar magias" || txt === "habilidade magias" || txt === "magias") {
        if (ctx.podeLancarMagias) return null;
        return "lanÃ§ar magias";
    }

    // poder/habilidade especÃ­fica: "Dentes Afiados", "Anatomia Insana", etc.
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
        pendencias.push(`${Number(opcao.circulo)}Âº cÃ­rculo`);
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

    const selecionadoExistente = selecionados.find(item => item.id === opcao.id);
    if (selecionadoExistente?.escolhasConfirmadas) return false;

    if (selecionados.some(item => item.id === opcao.id)) return true;
    if (!escolhaClasseDesbloqueada(escolha)) return false;

    const existeOutroConfirmado = selecionados.some(item =>
        item.id !== opcao.id && item.escolhasConfirmadas
    );
    if (existeOutroConfirmado) return false;

    if (selecionados.length >= quantidade) return false;

    if (opcaoPericiaIndisponivelPorTreinoGlobal(opcao, escolha.id, "classe")) return false;

    const ficha = getFichaCriacao();

    if (escolha.tipo === "magia" && opcao?.tipoAplicacao === "magia_adicionar") {
        return true;
    }

    if (getPreRequisitoNaoAtendidoOpcao(opcao, ficha)) return false;

    if (opcao.tipoAplicacao === "habilidade_adicionar" && !opcao.ehAumentoAtributo) {
        const nomeOpcao = opcao.valor || "";
        const podeRepetirPorExcecao = poderClassePodeSerEscolhidoMaisDeUmaVez(nomeOpcao);

        if (!podeRepetirPorExcecao) {
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
    }

    if (opcao.ehAumentoAtributo) {
        const atributo = opcao.atributoEscolhido || opcao.valor;

        if (!podeEscolherAumentoDeAtributo(ficha, atributo)) {
            return false;
        }
    }
    if (opcao.tipoAplicacao === "proficiencia_adicionar") {
        if (opcao.escolhaBloqueada) return false;
    }

    return true;
}
function podeSelecionarOpcaoClasseEvolucao(escolha, opcao) {
    const selecionados = getEscolhaClasseValoresEvolucao(escolha.id);
    const quantidade = Number(escolha.quantidade) || 0;

    const selecionadoExistente = selecionados.find(item => item.id === opcao.id);
    if (selecionadoExistente?.escolhasConfirmadas) return false;

    if (selecionados.some(item => item.id === opcao.id)) return true;
    if (!escolhaClasseDesbloqueada(escolha)) return false;

    const existeOutroConfirmado = selecionados.some(item =>
        item.id !== opcao.id && item.escolhasConfirmadas
    );
    if (existeOutroConfirmado) return false;

    if (selecionados.length >= quantidade) return false;

    if (opcaoPericiaIndisponivelPorTreinoGlobal(opcao, escolha.id, "classe")) return false;

    const ficha = getFichaEvolucaoAtual();
    if (!ficha) return false;

    if (escolha.tipo === "magia" && opcao?.tipoAplicacao === "magia_adicionar") {
        return true;
    }

    if (getPreRequisitoNaoAtendidoOpcao(opcao, ficha)) return false;

    if (opcao.tipoAplicacao === "habilidade_adicionar" && !opcao.ehAumentoAtributo) {
        const nomeOpcao = opcao.valor || "";
        const podeRepetirPorExcecao = poderClassePodeSerEscolhidoMaisDeUmaVez(nomeOpcao);

        if (!podeRepetirPorExcecao) {
            const jaTem = (ficha.habilidades || []).some(h =>
                normalizarTextoRegra(h.nome) === normalizarTextoRegra(nomeOpcao)
            );

            if (jaTem) return false;
        }
    }
    if (opcao.tipoAplicacao === "proficiencia_adicionar") {
        if (opcao.escolhaBloqueada) return false;
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

    // Magias concedidas por raÃ§a ignoram prÃ©-requisitos do prÃ³prio registro
    // (como "1Âº cÃ­rculo" ou "Habilidade Magias").
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
    ficha.modRacialAtributos = {
        forca: 0,
        destreza: 0,
        constituicao: 0,
        inteligencia: 0,
        sabedoria: 0,
        carisma: 0
    };

    ficha.habilidades = (ficha.habilidades || []).filter(h => h.origem !== "RaÃ§a");
    ficha.magias = (ficha.magias || []).filter(m => m.origem !== "RaÃ§a");
    ficha.efeitosAplicados = (ficha.efeitosAplicados || []).filter(e => e.origemTipo !== "RaÃ§a");

    ficha.pericias.forEach(p => {
        p.outrosRacial = 0;
    });

    reconstruirTreinosPericiaDaFicha(ficha);
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
        adicionarHabilidadeNaFicha(ficha, h, "RaÃ§a", raca.nome);
    });

    (raca.efeitos || []).forEach(efeito => {
        if (efeito.tipo === "atributo_racial") return;
        aplicarEfeitoNaFicha(ficha, efeito, "RaÃ§a", raca.nome);
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
        .filter(e => e.origemTipo === "RaÃ§a" && e.tipo === tipo)
        .reduce((soma, e) => soma + (Number(e.valor) || 0), 0);
}

function traduzirTipoEfeito(tipo) {
    const mapa = {
        atributo_racial: "Atributo racial",
        pericia_bonus: "BÃ´nus em perÃ­cia",
        pericia_treinada: "Treinado em",
        habilidade_adicionar: "Concede habilidade",
        magia_adicionar: "Concede magia",
        magia_escolher: "Escolha de magia",
        proficiencia_adicionar: "Concede proficiÃªncia",
        deslocamento_bonus: "BÃ´nus de deslocamento",
        deslocamento_definir: "Deslocamento",
        pv_bonus_nivel1: "PV no nÃ­vel 1",
        pv_bonus_por_nivel: "PV por nÃ­vel",
        pm_bonus_nivel1: "PM no nÃ­vel 1",
        pm_bonus_por_nivel: "PM por nÃ­vel",
        ataque_bonus: "BÃ´nus de ataque",
        dano_bonus: "BÃ´nus de dano",
        ataque_adicionar: "Concede ataque",
        defesa_bonus: "BÃ´nus de Defesa",
        tamanho_definir: "Tamanho",
        poder_tormenta_adicionar: "Poder da Tormenta",
        descricao_apenas: "DescriÃ§Ã£o"
    };

    return mapa[tipo] || tipo;
}

function efeitoDeveAparecerNaPrevia(tipoOrigem, efeito) {
    if (!efeito?.tipo) return false;

    // RaÃ§a: atributos jÃ¡ aparecem em "Atributos raciais"
    if (tipoOrigem === "raca") {
        if (efeito.tipo === "atributo_racial") return false;
    }

    // Classe: PV/PM jÃ¡ aparecem na prÃ©via da classe
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
            return e.descricao || "DescriÃ§Ã£o adicional";

        default:
            return `${tipoTraduzido}`;
    }
}

function descreverEfeitoParaCardEscolhaClasse(e) {
    switch (e?.tipo) {
        case "pericia_treinada":
        case "habilidade_adicionar":
        case "magia_adicionar":
        case "proficiencia_adicionar":
        case "ataque_adicionar":
            return e.nomeAdicionado || e.alvo || e.valorTexto || "";

        case "pericia_bonus":
            return `${e.alvo || ""} ${e.valor >= 0 ? "+" : ""}${e.valor}`;

        case "deslocamento_bonus":
            return `+${e.valor}m`;

        case "deslocamento_definir":
        case "tamanho_definir":
            return e.valorTexto || "";

        case "ataque_bonus":
        case "dano_bonus":
        case "defesa_bonus":
        case "poder_tormenta_adicionar":
            return `${e.valor >= 0 ? "+" : ""}${e.valor}`;

        default:
            return descreverEfeitoParaJogador(e);
    }
}

// --- Rascunho local da criaÃ§Ã£o de personagem (ficha em andamento) ---
// Guarda o estado completo do assistente de criaÃ§Ã£o (etapa atual e todas as
// escolhas jÃ¡ feitas) no localStorage, para o usuÃ¡rio nÃ£o perder o progresso
// se a internet cair ou a aba/tela for fechada antes de concluir a ficha.
// SÃ³ a ficha CONCLUÃDA Ã© enviada ao Supabase; o rascunho nunca Ã© sincronizado.
let _rascunhoCriacaoTimer = null;

function salvarRascunhoCriacao() {
    if (state.screen !== "criacao") return;
    if (!state.criacao?.ficha) return;

    try {
        const payload = {
            savedAt: new Date().toISOString(),
            criacao: state.criacao
        };
        localStorage.setItem(RASCUNHO_CRIACAO_KEY, JSON.stringify(payload));
    } catch (err) {
        console.error("Erro ao salvar rascunho da ficha em andamento:", err);
    }
}

function agendarSalvarRascunhoCriacao(wait = 500) {
    if (state.screen !== "criacao") return;
    clearTimeout(_rascunhoCriacaoTimer);
    _rascunhoCriacaoTimer = setTimeout(salvarRascunhoCriacao, wait);
}

function carregarRascunhoCriacaoSalvo() {
    try {
        const raw = localStorage.getItem(RASCUNHO_CRIACAO_KEY);
        if (!raw) return null;

        const parsed = JSON.parse(raw);
        if (!parsed || typeof parsed !== "object") return null;
        if (!parsed.criacao || !parsed.criacao.ficha) return null;

        return parsed;
    } catch (err) {
        console.error("Erro ao ler rascunho da ficha em andamento:", err);
        return null;
    }
}

function limparRascunhoCriacao() {
    clearTimeout(_rascunhoCriacaoTimer);
    try {
        localStorage.removeItem(RASCUNHO_CRIACAO_KEY);
    } catch (err) {
        console.error("Erro ao limpar rascunho da ficha em andamento:", err);
    }
}

function continuarRascunhoCriacao() {
    const rascunho = carregarRascunhoCriacaoSalvo();
    if (!rascunho) {
        alert("NÃ£o foi possÃ­vel carregar a ficha em andamento salva.");
        render();
        return;
    }

    state.criacao = rascunho.criacao;
    state.ui = state.ui || {};
    state.ui.resumoCriacaoAberto = false;
    state.screen = "criacao";
    render();
}

async function descartarRascunhoCriacao() {
    const ok = confirm("Descartar a ficha em andamento salva? Essa aÃ§Ã£o nÃ£o pode ser desfeita.");
    if (!ok) return;

    const rascunho = carregarRascunhoCriacaoSalvo();
    await excluirImagensPersonagemDaFicha(rascunho?.criacao?.ficha);
    limparRascunhoCriacao();
    render();
}

function cancelarCriacaoFicha() {
    salvarRascunhoCriacao();
    go("personagens");
}

async function iniciarCriacaoFicha() {
    const rascunhoExistente = carregarRascunhoCriacaoSalvo();
    if (rascunhoExistente) {
        const ok = confirm(
            "VocÃª jÃ¡ tem uma ficha em andamento salva. Iniciar uma ficha nova vai descartar esse progresso. Deseja continuar mesmo assim?"
        );
        if (!ok) return;
        await excluirImagensPersonagemDaFicha(rascunhoExistente?.criacao?.ficha);
        limparRascunhoCriacao();
    }

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
        planoClasses: [],

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
    state.ui = state.ui || {};
    state.ui.resumoCriacaoAberto = false;
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

function getEditorImagemPersonagem() {
    state.ui = state.ui || {};
    if (!state.ui.imagemPersonagemEditor) {
        state.ui.imagemPersonagemEditor = null;
    }
    return state.ui.imagemPersonagemEditor;
}

const IMAGEM_PERSONAGEM_BANNER_LARGURA = 300;
const IMAGEM_PERSONAGEM_BANNER_ALTURA = 500;
const IMAGEM_PERSONAGEM_AVATAR_TAMANHO = 160;

function abrirSeletorImagemPersonagemCriacao() {
    const input = document.getElementById("criacaoImagemPersonagemInput");
    if (input) input.click();
}

function abrirSeletorImagemPersonagemFicha() {
    const input =
        document.getElementById("fichaImagemPersonagemInput") ||
        document.getElementById("criacaoImagemPersonagemInput");
    if (input) input.click();
}

function selecionarImagemPersonagemCriacao(input) {
    const arquivo = input?.files?.[0];
    if (input) input.value = "";
    if (!arquivo) return;

    const tipo = String(arquivo.type || "").toLowerCase();
    if (!["image/png", "image/jpeg", "image/jpg"].includes(tipo)) {
        alert("Selecione uma imagem PNG ou JPG.");
        return;
    }

    const limiteMb = 5;
    if (arquivo.size > limiteMb * 1024 * 1024) {
        alert(`A imagem deve ter no maximo ${limiteMb}MB.`);
        return;
    }

    const leitor = new FileReader();
    leitor.onload = async () => {
        const dataUrl = String(leitor.result || "");
        let larguraNatural = 0;
        let alturaNatural = 0;

        try {
            const img = await carregarImagemCanvas(dataUrl);
            larguraNatural = img.naturalWidth || img.width || 0;
            alturaNatural = img.naturalHeight || img.height || 0;
        } catch (err) {
            console.error(err);
        }

        state.ui = state.ui || {};
        state.ui.imagemPersonagemEditor = {
            dataUrl,
            contentType: tipo === "image/png" ? "image/png" : "image/jpeg",
            imageWidth: larguraNatural,
            imageHeight: alturaNatural,
            banner: { zoom: 1, x: 0, y: 0 },
            avatar: { zoom: 1.25, x: 0, y: 0 },
            salvando: false
        };
        state.modal = "imagem_personagem_criacao";
        document.body.classList.add("modal-open");
        render();
    };
    leitor.onerror = () => alert("Nao foi possivel ler a imagem.");
    leitor.readAsDataURL(arquivo);
}

function atualizarEditorImagemPersonagem(alvo, campo, valor) {
    const editor = getEditorImagemPersonagem();
    if (!editor || !editor[alvo]) return;

    if (campo === "zoom") {
        editor[alvo][campo] = Math.max(1, Math.min(4, Number(valor) || 1));
    } else {
        editor[alvo][campo] = Math.max(-100, Math.min(100, Number(valor) || 0));
    }

    aplicarRecorteImagemPersonagemNoPreview(alvo);
}

function fecharModalImagemPersonagemCriacao() {
    if (state.modal !== "imagem_personagem_criacao") return;

    state.modal = null;
    state.ui = state.ui || {};
    state.ui.imagemPersonagemEditor = null;
    state.ui.imagemPersonagemGestos = null;
    document.body.classList.remove("modal-open");
    render();
}

function carregarImagemCanvas(src) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = src;
    });
}

function calcularRecorteImagemPersonagem(larguraImagem, alturaImagem, largura, altura, config) {
    const zoom = Math.max(1, Number(config?.zoom) || 1);
    const iw = Math.max(1, Number(larguraImagem) || 1);
    const ih = Math.max(1, Number(alturaImagem) || 1);
    const escalaBase = Math.max(largura / iw, altura / ih);
    const escala = escalaBase * zoom;
    const drawW = iw * escala;
    const drawH = ih * escala;
    const sobraX = Math.max(0, drawW - largura);
    const sobraY = Math.max(0, drawH - altura);
    const offsetX = (Number(config?.x) || 0) / 100;
    const offsetY = (Number(config?.y) || 0) / 100;
    const dx = (largura - drawW) / 2 - (sobraX / 2) * offsetX;
    const dy = (altura - drawH) / 2 - (sobraY / 2) * offsetY;

    return { dx, dy, drawW, drawH };
}

function limitarValorImagemPersonagem(valor, min, max) {
    return Math.max(min, Math.min(max, Number(valor) || 0));
}

function getPreviewImagemPersonagem(alvo) {
    return document.querySelector(`.imagem-personagem-preview[data-imagem-alvo="${alvo}"]`);
}

function getDimensoesPreviewImagemPersonagem(alvo) {
    if (alvo === "avatar") {
        return {
            largura: IMAGEM_PERSONAGEM_AVATAR_TAMANHO,
            altura: IMAGEM_PERSONAGEM_AVATAR_TAMANHO
        };
    }

    return {
        largura: IMAGEM_PERSONAGEM_BANNER_LARGURA,
        altura: IMAGEM_PERSONAGEM_BANNER_ALTURA
    };
}

function getEstiloRecorteImagemPersonagem(editor, alvo) {
    const { largura, altura } = getDimensoesPreviewImagemPersonagem(alvo);
    const iw = Number(editor?.imageWidth) || largura;
    const ih = Number(editor?.imageHeight) || altura;
    const recorte = calcularRecorteImagemPersonagem(iw, ih, largura, altura, editor?.[alvo] || {});

    return {
        width: `${(recorte.drawW / largura) * 100}%`,
        height: `${(recorte.drawH / altura) * 100}%`,
        left: `${(recorte.dx / largura) * 100}%`,
        top: `${(recorte.dy / altura) * 100}%`
    };
}

function aplicarRecorteImagemPersonagemNoPreview(alvo) {
    const editor = getEditorImagemPersonagem();
    const preview = getPreviewImagemPersonagem(alvo);
    const img = preview?.querySelector("img");
    if (!editor || !img) return;

    const estilo = getEstiloRecorteImagemPersonagem(editor, alvo);
    img.style.width = estilo.width;
    img.style.height = estilo.height;
    img.style.left = estilo.left;
    img.style.top = estilo.top;
}

function ajustarZoomImagemPersonagem(alvo, delta) {
    const editor = getEditorImagemPersonagem();
    if (!editor?.[alvo]) return;

    editor[alvo].zoom = limitarValorImagemPersonagem((Number(editor[alvo].zoom) || 1) + Number(delta || 0), 1, 4);
    aplicarRecorteImagemPersonagemNoPreview(alvo);
}

function ajustarZoomImagemPersonagemPorRoda(event, alvo) {
    event.preventDefault();
    event.stopPropagation();
    ajustarZoomImagemPersonagem(alvo, event.deltaY > 0 ? -0.08 : 0.08);
}

function moverRecorteImagemPersonagem(alvo, deltaX, deltaY) {
    const editor = getEditorImagemPersonagem();
    if (!editor?.[alvo]) return;

    const { largura, altura } = getDimensoesPreviewImagemPersonagem(alvo);
    const recorte = calcularRecorteImagemPersonagem(
        Number(editor.imageWidth) || largura,
        Number(editor.imageHeight) || altura,
        largura,
        altura,
        editor[alvo]
    );
    const sobraX = Math.max(0, recorte.drawW - largura);
    const sobraY = Math.max(0, recorte.drawH - altura);

    if (sobraX > 0) {
        editor[alvo].x = limitarValorImagemPersonagem((Number(editor[alvo].x) || 0) - (deltaX * 200 / sobraX), -100, 100);
    }

    if (sobraY > 0) {
        editor[alvo].y = limitarValorImagemPersonagem((Number(editor[alvo].y) || 0) - (deltaY * 200 / sobraY), -100, 100);
    }

    aplicarRecorteImagemPersonagemNoPreview(alvo);
}

function getDistanciaPonteirosImagemPersonagem(ponteiros) {
    const pontos = Object.values(ponteiros || {});
    if (pontos.length < 2) return 0;
    const [a, b] = pontos;
    return Math.hypot(a.x - b.x, a.y - b.y);
}

function iniciarAjusteImagemPersonagem(event, alvo) {
    const editor = getEditorImagemPersonagem();
    if (!editor?.[alvo]) return;

    event.preventDefault();
    event.stopPropagation();

    const preview = getPreviewImagemPersonagem(alvo);
    preview?.setPointerCapture?.(event.pointerId);

    state.ui = state.ui || {};
    state.ui.imagemPersonagemGestos = state.ui.imagemPersonagemGestos || {};
    const gesto = state.ui.imagemPersonagemGestos[alvo] || { ponteiros: {} };
    gesto.ponteiros[event.pointerId] = { x: event.clientX, y: event.clientY };
    gesto.ultimoX = event.clientX;
    gesto.ultimoY = event.clientY;

    if (Object.keys(gesto.ponteiros).length >= 2) {
        gesto.distanciaInicial = getDistanciaPonteirosImagemPersonagem(gesto.ponteiros);
        gesto.zoomInicial = Number(editor[alvo].zoom) || 1;
    }

    state.ui.imagemPersonagemGestos[alvo] = gesto;
}

function moverAjusteImagemPersonagem(event, alvo) {
    const editor = getEditorImagemPersonagem();
    const gesto = state.ui?.imagemPersonagemGestos?.[alvo];
    if (!editor?.[alvo] || !gesto?.ponteiros?.[event.pointerId]) return;

    event.preventDefault();
    event.stopPropagation();

    const anterior = gesto.ponteiros[event.pointerId];
    gesto.ponteiros[event.pointerId] = { x: event.clientX, y: event.clientY };

    if (Object.keys(gesto.ponteiros).length >= 2) {
        const distanciaAtual = getDistanciaPonteirosImagemPersonagem(gesto.ponteiros);
        if (gesto.distanciaInicial > 0) {
            editor[alvo].zoom = limitarValorImagemPersonagem((Number(gesto.zoomInicial) || 1) * (distanciaAtual / gesto.distanciaInicial), 1, 4);
            aplicarRecorteImagemPersonagemNoPreview(alvo);
        }
        return;
    }

    moverRecorteImagemPersonagem(alvo, event.clientX - anterior.x, event.clientY - anterior.y);
}

function finalizarAjusteImagemPersonagem(event, alvo) {
    const gesto = state.ui?.imagemPersonagemGestos?.[alvo];
    if (!gesto?.ponteiros) return;

    delete gesto.ponteiros[event.pointerId];
    if (Object.keys(gesto.ponteiros).length < 2) {
        gesto.distanciaInicial = 0;
        gesto.zoomInicial = 0;
    }
}

function desenharRecorteImagemPersonagem(img, largura, altura, config) {
    const canvas = document.createElement("canvas");
    canvas.width = largura;
    canvas.height = altura;

    const ctx = canvas.getContext("2d");
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    const { dx, dy, drawW, drawH } = calcularRecorteImagemPersonagem(
        img.naturalWidth || img.width,
        img.naturalHeight || img.height,
        largura,
        altura,
        config
    );

    ctx.fillStyle = "#111";
    ctx.fillRect(0, 0, largura, altura);
    ctx.drawImage(img, dx, dy, drawW, drawH);

    return canvas;
}

function canvasParaBlob(canvas, contentType) {
    return new Promise((resolve, reject) => {
        canvas.toBlob(blob => {
            if (blob) resolve(blob);
            else reject(new Error("Nao foi possivel gerar a imagem."));
        }, contentType === "image/png" ? "image/png" : "image/jpeg", 0.9);
    });
}

async function salvarImagemPersonagemCriacao() {
    const ficha = getFichaParaImagemPersonagem();
    const editor = getEditorImagemPersonagem();
    if (!ficha || !editor?.dataUrl) return;

    if (!window.T20Supabase?.uploadImagemPersonagem) {
        alert("Upload de imagem ainda nao esta disponivel.");
        return;
    }

    editor.salvando = true;
    render();

    try {
        const pathsAntigos = getPathsImagensPersonagem(ficha);
        const img = await carregarImagemCanvas(editor.dataUrl);
        const contentType = "image/jpeg";
        const bannerCanvas = desenharRecorteImagemPersonagem(img, IMAGEM_PERSONAGEM_BANNER_LARGURA, IMAGEM_PERSONAGEM_BANNER_ALTURA, editor.banner);
        const avatarCanvas = desenharRecorteImagemPersonagem(img, IMAGEM_PERSONAGEM_AVATAR_TAMANHO, IMAGEM_PERSONAGEM_AVATAR_TAMANHO, editor.avatar);
        const [bannerBlob, avatarBlob] = await Promise.all([
            canvasParaBlob(bannerCanvas, contentType),
            canvasParaBlob(avatarCanvas, contentType)
        ]);

        const [banner, avatar] = await Promise.all([
            window.T20Supabase.uploadImagemPersonagem({
                fichaId: ficha.id,
                tipo: "banner",
                blob: bannerBlob,
                contentType
            }),
            window.T20Supabase.uploadImagemPersonagem({
                fichaId: ficha.id,
                tipo: "avatar",
                blob: avatarBlob,
                contentType
            })
        ]);

        ficha.imagemPersonagemUrl = banner.url;
        ficha.imagemPersonagemPath = banner.path;
        ficha.avatarPersonagemUrl = avatar.url;
        ficha.avatarPersonagemPath = avatar.path;

        const pathsNovos = new Set(getPathsImagensPersonagem(ficha));
        const pathsParaRemover = pathsAntigos.filter(path => !pathsNovos.has(path));
        if (pathsParaRemover.length && window.T20Supabase?.excluirImagensPersonagem) {
            await window.T20Supabase.excluirImagensPersonagem(pathsParaRemover);
        }

        if (state.screen === "criacao") {
            salvarRascunhoCriacao();
        } else {
            saveFichas();
        }

        fecharModalImagemPersonagemCriacao();
    } catch (err) {
        console.error(err);
        alert(err?.message || "Nao foi possivel salvar a imagem.");
        const editorAtual = getEditorImagemPersonagem();
        if (editorAtual) editorAtual.salvando = false;
        render();
    }
}

function renderPreviewRecorteImagemPersonagem(editor, alvo, largura, altura, classe) {
    const recorte = getEstiloRecorteImagemPersonagem(editor, alvo);
    const imgStyle = [
        "position:absolute",
        "max-width:none",
        `width:${escapeAttr(recorte.width)}`,
        `height:${escapeAttr(recorte.height)}`,
        `left:${escapeAttr(recorte.left)}`,
        `top:${escapeAttr(recorte.top)}`
    ].join(";");

    return `
      <div class="${escapeAttr(classe)} imagem-personagem-preview" data-imagem-alvo="${escapeAttr(alvo)}" onpointerdown="iniciarAjusteImagemPersonagem(event, '${escapeAttr(alvo)}')" onpointermove="moverAjusteImagemPersonagem(event, '${escapeAttr(alvo)}')" onpointerup="finalizarAjusteImagemPersonagem(event, '${escapeAttr(alvo)}')" onpointercancel="finalizarAjusteImagemPersonagem(event, '${escapeAttr(alvo)}')" onwheel="ajustarZoomImagemPersonagemPorRoda(event, '${escapeAttr(alvo)}')">
        <img src="${escapeAttr(editor?.dataUrl || "")}" alt="" style="${imgStyle}">
      </div>
    `;
}

function renderModalImagemPersonagemCriacao() {
    if (state.modal !== "imagem_personagem_criacao") return "";

    const editor = getEditorImagemPersonagem();
    if (!editor?.dataUrl) return "";

    return `
      <div class="overlay imagem-personagem-overlay" onclick="fecharModalImagemPersonagemCriacao()">
        <div class="imagem-personagem-modal" onclick="event.stopPropagation()">
          <div class="imagem-personagem-header">
            <div>
              <div class="imagem-personagem-title">Imagem</div>
              <div class="imagem-personagem-subtitle">Ajuste o banner e o logo do personagem.</div>
            </div>
            <button class="personagens-btn personagens-btn-white imagem-personagem-fechar" type="button" onclick="fecharModalImagemPersonagemCriacao()">Fechar</button>
          </div>

          <div class="imagem-personagem-body">
            <div class="imagem-personagem-preview-wrap">
              <div class="imagem-personagem-label">Imagem da ficha</div>
              ${renderPreviewRecorteImagemPersonagem(editor, "banner", IMAGEM_PERSONAGEM_BANNER_LARGURA, IMAGEM_PERSONAGEM_BANNER_ALTURA, "imagem-personagem-banner-preview")}
              <div class="imagem-personagem-controls">
                <button class="imagem-personagem-zoom-btn" type="button" onclick="ajustarZoomImagemPersonagem('banner', -0.12)" aria-label="Diminuir zoom">-</button>
                <button class="imagem-personagem-zoom-btn" type="button" onclick="ajustarZoomImagemPersonagem('banner', 0.12)" aria-label="Aumentar zoom">+</button>
              </div>
            </div>

            <div class="imagem-personagem-preview-wrap">
              <div class="imagem-personagem-label">Logo / rosto</div>
              ${renderPreviewRecorteImagemPersonagem(editor, "avatar", IMAGEM_PERSONAGEM_AVATAR_TAMANHO, IMAGEM_PERSONAGEM_AVATAR_TAMANHO, "imagem-personagem-avatar-preview")}
              <div class="imagem-personagem-controls">
                <button class="imagem-personagem-zoom-btn" type="button" onclick="ajustarZoomImagemPersonagem('avatar', -0.12)" aria-label="Diminuir zoom">-</button>
                <button class="imagem-personagem-zoom-btn" type="button" onclick="ajustarZoomImagemPersonagem('avatar', 0.12)" aria-label="Aumentar zoom">+</button>
              </div>
            </div>

            <div class="imagem-personagem-actions">
              <button class="personagens-btn personagens-btn-red imagem-personagem-salvar" type="button" onclick="salvarImagemPersonagemCriacao()" ${editor.salvando ? "disabled" : ""}>
                ${editor.salvando ? "Salvando..." : "Salvar imagem"}
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
}

function getFichaParaImagemPersonagem() {
    return state.screen === "criacao" ? getFichaCriacao() : getFichaAtual();
}

function abrirModalImagemPersonagemFicha() {
    const ficha = getFichaParaImagemPersonagem();
    if (!ficha?.imagemPersonagemUrl) {
        abrirSeletorImagemPersonagemFicha();
        return;
    }

    state.modal = "imagem_personagem_visualizacao";
    document.body.classList.add("modal-open");
    render();
}

function fecharModalImagemPersonagemFicha() {
    if (state.modal !== "imagem_personagem_visualizacao") return;

    state.modal = null;
    document.body.classList.remove("modal-open");
    render();
}

function renderModalImagemPersonagemFicha() {
    if (state.modal !== "imagem_personagem_visualizacao") return "";

    const ficha = getFichaParaImagemPersonagem();
    if (!ficha?.imagemPersonagemUrl) return "";

    return `
      <div class="overlay imagem-personagem-view-overlay" onclick="fecharModalImagemPersonagemFicha()">
        <div class="imagem-personagem-view-modal" onclick="event.stopPropagation()">
          <div class="imagem-personagem-view-actions">
            <button class="personagens-btn personagens-btn-white imagem-personagem-view-fechar" type="button" onclick="fecharModalImagemPersonagemFicha()">Voltar</button>
            <button class="personagens-btn personagens-btn-red imagem-personagem-view-trocar" type="button" onclick="abrirSeletorImagemPersonagemFicha()">Trocar</button>
          </div>
          <img src="${escapeAttr(ficha.imagemPersonagemUrl)}" alt="Imagem do personagem">
        </div>
      </div>
    `;
}

function renderBotaoAvatarPersonagem(ficha, classe = "") {
    const temAvatar = !!ficha?.avatarPersonagemUrl;

    return `
      <button class="personagem-avatar-btn ${temAvatar ? "" : "personagem-avatar-btn-vazio"} ${escapeAttr(classe)}" type="button" onclick="abrirModalImagemPersonagemFicha()" title="${temAvatar ? "Ver imagem do personagem" : "Adicionar imagem"}" aria-label="${temAvatar ? "Ver imagem do personagem" : "Adicionar imagem"}">
        ${temAvatar ? `<img src="${escapeAttr(ficha.avatarPersonagemUrl)}" alt="Logo do personagem">` : `<span>+</span>`}
      </button>
    `;
}

function renderControleImagemPersonagemFicha(ficha) {
    if (state.screen === "mestre") {
        return renderBotaoAvatarPersonagem(ficha, "mf-personagem-avatar");
    }

    return `
      <input
        id="fichaImagemPersonagemInput"
        type="file"
        accept="image/png,image/jpeg"
        onchange="selecionarImagemPersonagemCriacao(this)"
        hidden
      >
      ${renderBotaoAvatarPersonagem(ficha, "mf-personagem-avatar")}
    `;
}

function getPathsImagensPersonagem(ficha) {
    return [
        ficha?.imagemPersonagemPath,
        ficha?.avatarPersonagemPath
    ]
        .map(path => String(path || "").trim())
        .filter(Boolean);
}

async function excluirImagensPersonagemDaFicha(ficha) {
    const paths = getPathsImagensPersonagem(ficha);
    if (!paths.length || !window.T20Supabase?.excluirImagensPersonagem) return;

    try {
        await window.T20Supabase.excluirImagensPersonagem(paths);
    } catch (err) {
        console.error("Erro ao excluir imagens do personagem:", err);
    }
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

    ficha.efeitosAplicados = (ficha.efeitosAplicados || []).filter(e => e.origemTipo !== "InteligÃªncia");

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
    return getPericiasExpandidas(ficha, true);
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
    const continuar = confirm("Subir mais nÃ­veis?");
    if (continuar) {
        abrirSelecaoProximoNivelClasse();
        return;
    }

    state.criacao.fluxoClasseAtivo = false;
    state.criacao.classeEvolucaoContexto = null;
    state.criacao.classeEscolhas = {};
    state.criacao.escolhaClasseAbertaId = null;
    state.criacao.poderClasseEscolhas = {};
    state.criacao.escolhaPoderClasseAbertaId = null;

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
        const aplicou = aplicarTreinoPericiaNaFicha(
            ficha,
            nomePericia,
            "InteligÃªncia",
            "InteligÃªncia"
        );

        if (!aplicou) return;

        if (!(controle.selecionadas || []).some(nome => normalizarTextoRegra(nome) === normalizarTextoRegra(nomePericia))) {
            controle.selecionadas.push(nomePericia);
        }
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

    setTimeout(() => {
        document.body.classList.add("modal-open");
    }, 0);

    return `
      <div class="overlay mf-add-habilidade-overlay">
        <div class="overlay-card mf-add-habilidade-modal mf-magia-detail-modal mf-classe-submodal" onclick="event.stopPropagation()">
          <div class="overlay-header mf-add-habilidade-header">
            <div>
              <div class="overlay-title">PerÃ­cias por InteligÃªncia</div>
              <div class="subtitle">
                Escolha ${quantidade} ${quantidade === 1 ? "perÃ­cia treinada" : "perÃ­cias treinadas"} pela sua InteligÃªncia.
                &bull; Selecionados: ${selecionadas.length} / ${quantidade}
              </div>
            </div>

            <div class="mf-classe-submodal-actions">
              <button
                class="mf-add-habilidade-btn mf-classe-submodal-btn-ok"
                onclick="confirmarPericiasInteligenciaCriacao()"
                ${selecionadas.length !== quantidade ? "disabled" : ""}
              >
                Confirmar
              </button>
            </div>
          </div>

          <div class="overlay-body mf-add-habilidade-body mf-magia-detail-body">
            <div class="mf-magia-detail-scroll">
              <div class="mf-magia-detail-card">
                <div class="mf-magia-detail-card-title">Pericias</div>
                <div class="mf-detail-choice-list">
              ${pericias.map(pericia => {
        const checked = selecionadas.some(nome =>
            normalizarTextoRegra(nome) === normalizarTextoRegra(pericia.nome)
        );
        const disabled = !checked && selecionadas.length >= quantidade;

        return `
                    <label class="mf-classe-submodal-row ${disabled ? "disabled" : ""}" style="cursor:${disabled ? "not-allowed" : "pointer"};">
                      <div>
                        <div class="mf-classe-submodal-row-title">${escapeHtml(pericia.nome)}</div>
                        <div class="mf-classe-submodal-row-sub">Atributo: ${escapeHtml(pericia.atributo || "")}</div>
                      </div>

                      <input
                        class="mf-classe-submodal-check"
                        type="checkbox"
                        ${checked ? "checked" : ""}
                        ${disabled ? "disabled" : ""}
                        onclick="event.stopPropagation()"
                        onchange="togglePericiaInteligenciaCriacao('${escapeAttr(pericia.nome)}')"
                      >
                    </label>
                  `;
    }).join("")}
                </div>
              </div>
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
    atualizarCdMagiasNaFicha(ficha, true);

    state.fichas.unshift(ficha);
    state.fichaAtualId = ficha.id;
    recalcularEquipamentosEFicha(ficha);
    saveFichas();
    limparRascunhoCriacao();

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
        planoClasses: [],

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

async function carregarFichasDoUsuario() {
    if (!window.T20Supabase?.SUPA?.state?.user) {
        state.fichas = [];
        state.fichasCarregadas = false;
        return;
    }

    state.fichasCarregando = true;
    render();

    try {
        const registros = await window.T20Supabase.listarMinhasFichas();

        state.fichas = (registros || [])
            .map(r => r.ficha_json)
            .filter(f => f && f.tipoRegistro !== "ameaca_mestre");

        // Restaura a conexÃ£o com a mesa online, se havia uma ficha ativa
        // salva no banco. Isso corrige o bug em que, apÃ³s um F5, o app
        // "esquecia" a mesa conectada e parava de sincronizar em silÃªncio.
        const registroAtivoEmMesa = (registros || []).find(r => r.mesa_id && r.is_active);
        if (registroAtivoEmMesa) {
            state.mesaOnlineId = registroAtivoEmMesa.mesa_id;
            try {
                const mesa = await window.T20Supabase.buscarMesaPorId(registroAtivoEmMesa.mesa_id);
                state.mesaOnlineNome = mesa?.nome || "";
            } catch (err) {
                console.error("NÃ£o foi possÃ­vel recuperar o nome da mesa:", err);
            }
        } else {
            state.mesaOnlineId = "";
            state.mesaOnlineNome = "";
        }

        state.fichasCarregadas = true;
    } catch (err) {
        console.error("Erro ao carregar fichas do Supabase:", err);
        alert("NÃ£o foi possÃ­vel carregar suas fichas. Verifique sua conexÃ£o e tente novamente.");
    } finally {
        state.fichasCarregando = false;
        render();
    }
}

function getMesaIdParaSync(ficha) {
    if (!ficha) return null;
    if (ficha.npcLocal === true) return ficha.npcMesaId || null;
    return ficha.onlineAtivaMesaId || null;
}

function saveFichas() {
    const selecionadaMestre = state.screen === "mestre" ? getFichaMestreSelecionada() : null;
    const bloqueadaNoMestre = state.screen === "mestre" && selecionadaMestre?.tipo !== "npc_local";

    if (bloqueadaNoMestre || state?.mestre?.renderizandoFichaRemota) {
        return;
    }

    if (!window.T20Supabase?.SUPA?.state?.user) return;

    const ficha = getFichaAtual();
    if (!ficha) return;

    window.T20Supabase.agendarSyncFichaAtiva({
        mesaId: getMesaIdParaSync(ficha),
        ficha,
        wait: 900
    });
}

async function sincronizarTodasAsFichasAgora() {
    if (!window.T20Supabase?.SUPA?.state?.user) return;

    const fichas = Array.isArray(state.fichas) ? state.fichas : [];
    for (const ficha of fichas) {
        try {
            await window.T20Supabase.syncFichaAtivaAgora({
                mesaId: getMesaIdParaSync(ficha),
                ficha
            });
        } catch (err) {
            console.error(`Erro ao sincronizar a ficha "${ficha?.nome || ficha?.id}":`, err);
        }
    }
}

function flushFichaAtualAgora() {
    if (!window.T20Supabase?.SUPA?.state?.user) return;

    // Mesma trava usada em saveFichas(): impede que, ao trocar de tela a
    // partir do painel do mestre com a ficha de UM JOGADOR selecionada
    // (nÃ£o uma NPC local), essa ficha seja enviada ao Supabase vinculada
    // Ã  conta do mestre em vez da conta original do dono.
    const selecionadaMestre = state.screen === "mestre" ? getFichaMestreSelecionada() : null;
    const bloqueadaNoMestre = state.screen === "mestre" && selecionadaMestre?.tipo !== "npc_local";

    if (bloqueadaNoMestre || state?.mestre?.renderizandoFichaRemota) {
        return;
    }

    const ficha = getFichaAtual();
    if (!ficha) return;

    window.T20Supabase.flushSyncFichaAtiva({
        mesaId: getMesaIdParaSync(ficha),
        ficha
    }).catch(err => console.error("Erro ao salvar ficha antes de sair:", err));
}

async function alterarSenhaAuth() {
    const novaSenha = String(state.auth.novaSenha || "");
    const confirmar = String(state.auth.confirmarNovaSenha || "");

    if (!novaSenha || !confirmar) {
        alert("Preencha a nova senha e a confirmaÃ§Ã£o.");
        return;
    }

    if (novaSenha !== confirmar) {
        alert("As senhas nÃ£o conferem.");
        return;
    }

    try {
        await window.T20Supabase.alterarSenha(novaSenha);
        state.auth.novaSenha = "";
        state.auth.confirmarNovaSenha = "";
        alert("Senha alterada com sucesso.");
        render();
    } catch (err) {
        console.error(err);
        alert(err?.message || "NÃ£o foi possÃ­vel alterar a senha.");
    }
}
function garantirEstadoRegrasMestre() {
    if (!state.mestre) state.mestre = {};

    const abas = Object.keys(REGRAS_DB || {});
    if (!state.mestre.regrasModal) {
        state.mestre.regrasModal = {
            abaSelecionada: abas[0] || ""
        };
    }

    if (!state.mestre.regrasModal.abaSelecionada && abas.length) {
        state.mestre.regrasModal.abaSelecionada = abas[0];
    }
}

function getAbasRegrasDisponiveis() {
    return Object.keys(REGRAS_DB || {});
}

function formatarNomeAbaRegras(chave) {
    return String(chave || "")
        .replaceAll("_", " ")
        .replace(/\b\w/g, l => l.toUpperCase());
}

function getRegistrosAbaRegrasAtual() {
    garantirEstadoRegrasMestre();

    const aba = String(state.mestre.regrasModal?.abaSelecionada || "");
    const lista = REGRAS_DB?.[aba];

    return Array.isArray(lista) ? lista : [];
}

function abaRegrasEhTabela(chave) {
    return String(chave || "").toLowerCase().includes("tabela");
}

function selecionarAbaRegrasModal(valor) {
    garantirEstadoRegrasMestre();
    state.mestre.regrasModal.abaSelecionada = String(valor || "");
    render();
}

function getRegrasPericiaPorTipo(nomePericia) {
    const alvo = normalizarTextoRegra(nomePericia);
    const pericias = Array.isArray(REGRAS_DB?.pericias) ? REGRAS_DB.pericias : [];

    return pericias.filter(item => normalizarTextoRegra(item?.tipo || "") === alvo);
}

function abrirModalRegraPericia(nomePericia) {
    state.modal = "regraPericia";
    state.modalPayload = { nome: String(nomePericia || "") };
    setTimeout(() => {
        document.body.classList.add("modal-open");
    }, 0);
    render();
}

function fecharModalRegraPericia() {
    if (state.modal !== "regraPericia") return;

    state.modal = null;
    state.modalPayload = null;
    document.body.classList.remove("modal-open");
    render();
}

function renderModalRegraPericia() {
    if (state.modal !== "regraPericia") return "";

    const nomePericia = String(state.modalPayload?.nome || "").trim();
    const regras = getRegrasPericiaPorTipo(nomePericia);

    setTimeout(() => {
        document.body.classList.add("modal-open");
    }, 0);

    return `
      <div class="overlay pericia-regra-overlay" onclick="fecharModalRegraPericia()">
        <div class="pericia-regra-modal" onclick="event.stopPropagation()">
          <button
            class="pericia-regra-fechar mf-add-habilidade-btn mf-add-habilidade-btn-fechar"
            type="button"
            onclick="fecharModalRegraPericia()"
          >
            Fechar
          </button>

          <div class="pericia-regra-tipo">${escapeHtml(nomePericia || "Pericia")}</div>

          <div class="pericia-regra-lista">
            ${regras.length
                ? regras.map(regra => `
                    <article class="pericia-regra-item">
                      <div class="pericia-regra-caixa pericia-regra-nome">${escapeHtml(regra?.nome || nomePericia || "Pericia")}</div>
                      <div class="pericia-regra-caixa pericia-regra-descricao">${escapeHtml(regra?.descricao || "")}</div>
                    </article>
                  `).join("")
                : `
                    <article class="pericia-regra-item">
                      <div class="pericia-regra-caixa pericia-regra-nome">${escapeHtml(nomePericia || "Pericia")}</div>
                      <div class="pericia-regra-caixa pericia-regra-descricao">Nenhuma regra cadastrada para esta pericia.</div>
                    </article>
                  `
            }
          </div>
        </div>
      </div>
    `;
}

function abrirModalRegras() {
    garantirEstadoRegrasMestre();
    state.modal = "regras";
    setTimeout(() => {
        document.body.classList.add("modal-open");
    }, 0);
    render();
}

function fecharModalRegras() {
    if (state.modal !== "regras") return;

    state.modal = null;
    document.body.classList.remove("modal-open");
    render();
}
function renderConteudoRegrasLista(registros) {
    if (!registros.length) {
        return `<div class="regras-empty">Nenhuma regra encontrada nesta aba.</div>`;
    }

    const grupos = new Map();

    registros.forEach(item => {
        const tipo = String(item?.tipo || "").trim() || "Outros";
        if (!grupos.has(tipo)) grupos.set(tipo, []);
        grupos.get(tipo).push(item);
    });

    return Array.from(grupos.entries()).map(([tipo, itens]) => `
        <section class="regras-grupo">
            ${tipo !== "Outros" && tipo !== "-" ? `
                <div class="regras-grupo-titulo">${escapeHtml(tipo)}</div>
            ` : ""}

            <div class="regras-lista">
                ${itens.map(item => `
                    <article class="regras-row">
                        <div class="regras-row-nome">${escapeHtml(item.nome || "Sem nome")}</div>

                        ${item.tipo && item.tipo !== "-" && (tipo === "Outros" || tipo === "-") ? `
                            <div class="regras-row-tipo">${escapeHtml(item.tipo)}</div>
                        ` : ""}

                        ${item.descricao ? `
                            <div class="regras-row-descricao">
                                ${escapeHtml(item.descricao)}
                            </div>
                        ` : ""}
                    </article>
                `).join("")}
            </div>
        </section>
    `).join("");
}
function renderConteudoRegrasTabela(registros) {
    if (!registros.length) {
        return `<div class="regras-empty">Nenhuma regra encontrada nesta aba.</div>`;
    }

    const colunas = Array.from(
        registros.reduce((set, item) => {
            Object.keys(item || {}).forEach(chave => set.add(chave));
            return set;
        }, new Set())
    );

    return `
        <div class="regras-table-wrap">
            <table class="regras-table">
                <thead>
                    <tr>
                        ${colunas.map(col => `<th>${escapeHtml(formatarNomeAbaRegras(col))}</th>`).join("")}
                    </tr>
                </thead>
                <tbody>
                    ${registros.map(item => `
                        <tr>
                            ${colunas.map(col => `<td>${escapeHtml(item?.[col] ?? "")}</td>`).join("")}
                        </tr>
                    `).join("")}
                </tbody>
            </table>
        </div>
    `;
}

function renderModalRegrasVisualHtml(abas, abaAtual, registros, ehTabela) {
    return `
      <div class="overlay regras-modal-overlay" onclick="fecharModalRegras()">
        <div class="regras-modal-card" onclick="event.stopPropagation()">
          <div class="regras-modal-header">
            <div>
              <div class="regras-modal-title">Regras</div>
              <div class="regras-modal-subtitle">
                Consulta rapida das regras cadastradas.
              </div>
            </div>

            <button class="personagens-btn personagens-btn-white regras-modal-fechar" type="button" onclick="fecharModalRegras()">Fechar</button>
          </div>

          <div class="regras-modal-body">
            <div class="regras-select-field">
              <label>Regra</label>
              <select onchange="selecionarAbaRegrasModal(this.value)">
                ${abas.map(aba => `
                  <option value="${escapeAttr(aba)}" ${aba === abaAtual ? "selected" : ""}>
                    ${escapeHtml(formatarNomeAbaRegras(aba))}
                  </option>
                `).join("")}
              </select>
            </div>

            <div class="t20-divider regras-modal-divider"></div>

            <div class="regras-content">
              ${ehTabela
                ? renderConteudoRegrasTabela(registros)
                : renderConteudoRegrasLista(registros)}
            </div>
          </div>
        </div>
      </div>
    `;
}

function renderModalRegras() {
    if (state.modal !== "regras") return "";

    garantirEstadoRegrasMestre();

    const abas = getAbasRegrasDisponiveis();
    const abaAtual = String(state.mestre.regrasModal?.abaSelecionada || "");
    const registros = getRegistrosAbaRegrasAtual();
    const ehTabela = abaRegrasEhTabela(abaAtual);

    return renderModalRegrasVisualHtml(abas, abaAtual, registros, ehTabela);

    return `
      <div class="overlay" onclick="fecharModalRegras()">
        <div class="overlay-card" onclick="event.stopPropagation()">
          <div class="overlay-header">
            <div>
              <div class="overlay-title">Regras</div>
              <div class="subtitle">
                Consulta rÃ¡pida das regras cadastradas.
              </div>
            </div>

            <div class="actions">
              <button class="btn ghost" type="button" onclick="fecharModalRegras()">Fechar</button>
            </div>
          </div>

          <div class="overlay-body">
            <div class="field" style="max-width:340px; margin-bottom:14px;">
              <label>Regra</label>
              <select onchange="selecionarAbaRegrasModal(this.value)">
                ${abas.map(aba => `
                  <option value="${escapeAttr(aba)}" ${aba === abaAtual ? "selected" : ""}>
                    ${escapeHtml(formatarNomeAbaRegras(aba))}
                  </option>
                `).join("")}
              </select>
            </div>

            ${ehTabela
            ? renderConteudoRegrasTabela(registros)
            : renderConteudoRegrasLista(registros)}
          </div>
        </div>
      </div>
    `;
}
function toggleSidebarMestre() {
    state.mestre.sidebarAberta = !state.mestre.sidebarAberta;
    render();
}

function abrirSidebarMestre() {
    state.mestre.sidebarAberta = true;
    render();
}

function fecharSidebarMestre() {
    state.mestre.sidebarAberta = false;
    render();
}
function montarHtmlFichaMestre() {
    const selecionada = getFichaMestreSelecionada();
    if (!selecionada) {
        return `<div class="empty">Selecione uma ficha.</div>`;
    }

    const screenAnterior = state.screen;
    const flagAnterior = !!state.mestre.renderizandoFichaRemota;
    const fichaAnterior = state.fichaAtualId;
    const htmlAnterior = app.innerHTML;

    try {
        state.screen = "ficha";
        state.mestre.renderizandoFichaRemota = selecionada.tipo !== "npc_local";

        if (selecionada.tipo === "npc_local") {
            state.fichaAtualId = selecionada.ficha.id;
        }

        renderFicha();
        return removerFlutuantesDaFichaNoMestre(app.innerHTML);
    } finally {
        state.screen = screenAnterior;
        state.mestre.renderizandoFichaRemota = flagAnterior;
        state.fichaAtualId = fichaAnterior;
        app.innerHTML = htmlAnterior;
    }
}

function aplicarModoSomenteLeituraMestre() {
    const selecionada = getFichaMestreSelecionada();
    if (!selecionada || selecionada.tipo === "npc_local") {
        return;
    }

    const viewer = app.querySelector(".mestre-scale-jogador");
    if (!viewer) return;

    viewer.querySelectorAll("input, select, textarea, button").forEach(el => {
        if (el.closest(".mestre-sidebar")) return;
        if (el.classList.contains("mf-tab") || el.closest(".mf-tabs")) return;
        el.disabled = true;
        el.setAttribute("tabindex", "-1");
    });

    viewer.querySelectorAll("[onclick]").forEach(el => {
        if (el.closest(".mestre-sidebar")) return;
        if (el.classList.contains("mf-tab") || el.closest(".mf-tabs")) return;
        el.removeAttribute("onclick");
    });

    viewer.querySelectorAll(".topbar .actions, .floating-actions, .btn, .choice-checkbox").forEach(el => {
        if (el.closest(".mestre-sidebar")) return;
        el.style.pointerEvents = "none";
    });

    // remove bloco lateral dos botÃµes flutuantes de Dados/Regras
    viewer.querySelectorAll(".side-buttons").forEach(el => {
        if (el.closest(".mestre-sidebar")) return;
        el.remove();
    });

    // remove botÃµes flutuantes soltos de Dados/Regras
    viewer.querySelectorAll(".btn.primary.floating").forEach(el => {
        if (el.closest(".mestre-sidebar")) return;

        const onclick = String(el.getAttribute("onclick") || "");
        const texto = String(el.textContent || "").trim().toLowerCase();

        if (
            onclick.includes("abrirModal('dados')") ||
            onclick.includes('abrirModal("dados")') ||
            onclick.includes("abrirModalRegras()") ||
            texto === "dados" ||
            texto === "regras"
        ) {
            el.remove();
        }
    });

    // remove qualquer elemento restante ligado aos modais de dados e regras
    viewer.querySelectorAll(`
        [onclick*="abrirModal('dados')"],
        [onclick*='abrirModal("dados")'],
        [onclick*="abrirModalRegras()"]
    `).forEach(el => {
        if (el.closest(".mestre-sidebar")) return;
        el.remove();
    });

    // remove widget flutuante de dinheiro por classes comuns/fallback
    viewer.querySelectorAll(`
        .widget-dinheiro-flutuante,
        .dinheiro-flutuante,
        .money-widget-floating,
        .floating-money,
        .money-floating-btn
    `).forEach(el => {
        if (el.closest(".mestre-sidebar")) return;
        el.remove();
    });

    // fallback extra para blocos de dinheiro que venham sem classe padronizada
    viewer.querySelectorAll("button, div, section, aside").forEach(el => {
        if (el.closest(".mestre-sidebar")) return;

        const texto = String(el.textContent || "").trim().toLowerCase();
        const cls = String(el.className || "").toLowerCase();

        if (
            (texto === "dinheiro" || texto.includes("tibares") || texto.includes("to")) &&
            (cls.includes("floating") || cls.includes("dinheiro") || cls.includes("money"))
        ) {
            el.remove();
        }
    });
}
function definirMesaOnlineNome(nome) {
    state.mesaOnlineNome = nome || "";
    render();
}

async function conectarMesaPorNome() {
    const nome = String(state.mesaOnlineNome || "").trim();
    if (!nome) {
        alert("Informe o nome da mesa.");
        return;
    }

    try {
        const mesa = await window.T20Supabase.buscarMesaPorNome(nome);
        if (!mesa) {
            alert("Mesa nÃ£o encontrada.");
            return;
        }

        state.mesaOnlineId = mesa.id;
        state.mesaOnlineNome = mesa.nome;
        saveFichas();
        render();
        alert(`Conectado Ã  mesa: ${mesa.nome}`);
    } catch (err) {
        console.error(err);
        alert(err?.message || "NÃ£o foi possÃ­vel localizar a mesa.");
    }
}

async function toggleFichaAtivaOnline(fichaId, checked) {
    const mesaId = state.mesaOnlineId;
    if (!mesaId) {
        alert("Conecte primeiro uma mesa pelo nome.");
        render();
        return;
    }

    if (!window.T20Supabase?.SUPA?.state?.user) {
        alert("FaÃ§a login online antes de ativar uma ficha.");
        render();
        return;
    }

    const ficha = (state.fichas || []).find(f => String(f.id) === String(fichaId));
    if (!ficha) return;

    try {
        if (checked) {
            (state.fichas || []).forEach(f => {
                if (f) f.onlineAtivaMesaId = "";
            });

            ficha.onlineAtivaMesaId = mesaId;
            saveFichas();

            await window.T20Supabase.ativarFicha({
                mesaId,
                ficha
            });
        } else {
            ficha.onlineAtivaMesaId = "";
            saveFichas();

            await window.T20Supabase.desativarFicha({
                mesaId,
                fichaLocalId: ficha.id
            });
        }

        render();
    } catch (err) {
        console.error(err);
        alert("NÃ£o foi possÃ­vel alterar a ficha ativa online.");
    }
}
function toggleJogadoresAtivosMestre() {
    garantirEstadoAmeacasMestre();
    state.mestre.jogadoresAbertos = !state.mestre.jogadoresAbertos;
    render();
}

const LIMITE_AMEACAS_POR_CRIACAO = 10;
function toggleAmeacasAtivasMestre() {
    garantirEstadoAmeacasMestre();
    state.mestre.ameacasAbertas = !state.mestre.ameacasAbertas;
    render();
}

function getFichaMestreSelecionada() {
    const lista = getListaFichasMestreComNpcs();
    const id = state.mestre?.fichaSelecionadaId || "";
    return lista.find(item => String(item.id) === String(id)) || null;
}
function getAmeacaAtivaMestreSelecionada() {
    garantirEstadoAmeacasMestre();

    const idSelecionado = String(state.mestre.ameacaSelecionadaInstanciaId || "").trim();
    if (!idSelecionado) return null;

    return (state.mestre.ameacasEmCena || []).find(
        item => String(item.instanciaId || "") === idSelecionado
    ) || null;
}

function selecionarAmeacaMestre(instanciaId) {
    garantirEstadoAmeacasMestre();

    state.mestre.ameacaSelecionadaInstanciaId = String(instanciaId || "");
    render();
}
async function excluirTodasAmeacasMestre() {
    garantirEstadoAmeacasMestre();

    const lista = state.mestre.ameacasEmCena || [];
    if (!lista.length) return;

    const ok = confirm("Excluir todas as ameaÃ§as ativas da mesa?");
    if (!ok) return;

    try {
        if (window.T20Supabase?.removerTodasAmeacasMestreDaMesa && state.mestre.mesaId) {
            await window.T20Supabase.removerTodasAmeacasMestreDaMesa(state.mestre.mesaId);
        }

        state.mestre.ameacasEmCena = [];
        state.mestre.ameacaSelecionadaInstanciaId = "";

        render();
    } catch (err) {
        console.error(err);
        alert(err?.message || "NÃ£o foi possÃ­vel excluir as ameaÃ§as.");
    }
}
async function removerAmeacaMestre(instanciaId) {
    garantirEstadoAmeacasMestre();

    const item = (state.mestre.ameacasEmCena || []).find(
        a => String(a.instanciaId || "") === String(instanciaId || "")
    );
    if (!item) return;

    const nomeAtualItem = (item.edicao && typeof item.edicao.nome === "string" && item.edicao.nome.trim() !== "")
        ? item.edicao.nome
        : (item.nome || "AmeaÃ§a");
    const ok = confirm(`Remover a ameaÃ§a "${nomeAtualItem}" da mesa?`);
    if (!ok) return;

    const removidoId = String(instanciaId || "");

    try {
        if (window.T20Supabase?.removerAmeacaMestre && state.mestre.mesaId) {
            await window.T20Supabase.removerAmeacaMestre({
                mesaId: state.mestre.mesaId,
                instanciaId: removidoId
            });
        }

        state.mestre.ameacasEmCena = (state.mestre.ameacasEmCena || []).filter(
            a => String(a.instanciaId || "") !== removidoId
        );

        if (String(state.mestre.ameacaSelecionadaInstanciaId || "") === removidoId) {
            state.mestre.ameacaSelecionadaInstanciaId = "";
        }

        render();
    } catch (err) {
        console.error(err);
        alert(err?.message || "NÃ£o foi possÃ­vel remover a ameaÃ§a.");
    }
}

function renderListaAmeacasAtivasMestre() {
    garantirEstadoAmeacasMestre();

    const lista = state.mestre.ameacasEmCena || [];
    if (!lista.length) {
        return `<div class="empty">Nenhuma ameaÃ§a ativa.</div>`;
    }

    const contadores = {};

    return lista.map(item => {
        const ativa = String(item.instanciaId || "") === String(state.mestre.ameacaSelecionadaInstanciaId || "");
        const nomeAtual = (item.edicao && typeof item.edicao.nome === "string" && item.edicao.nome.trim() !== "")
            ? item.edicao.nome
            : (item.nome || "");
        const inicial = escapeHtml((nomeAtual || "?").charAt(0).toUpperCase());

        const chave = String(item.ameacaId || item.nome || "");
        contadores[chave] = (contadores[chave] || 0) + 1;
        const indice = contadores[chave];

        const nomeExibido = nomeAtual || "AmeaÃ§a";

        return `
          <div class="mestre-player-row">
            <button
              class="mestre-player-btn ${ativa ? "ativo" : ""}"
              type="button"
              onclick="selecionarAmeacaMestre('${escapeAttr(item.instanciaId)}')"
            >
              <div class="mestre-player-avatar">${inicial}</div>
              <div style="min-width:0;">
                <div class="list-item-title">${escapeHtml(nomeExibido)}</div>
                <div class="list-item-sub">
                   #${escapeHtml(indice)} â€¢ ND ${escapeHtml(item.nd || "-")}
                </div>
              </div>
            </button>

            <button
              class="btn danger"
              type="button"
              onclick="removerAmeacaMestre('${escapeAttr(item.instanciaId)}')"
              title="Remover ameaÃ§a"
            >
              âœ•
            </button>
          </div>
        `;
    }).join("");
}

async function carregarAreaDoMestre() {
    const mesaId = String(state.mestre?.mesaId || "").trim();
    if (!mesaId) {
        alert("Informe o ID da mesa.");
        return;
    }

    if (!window.T20Supabase?.SUPA?.state?.user) {
        alert("FaÃ§a login online antes de abrir a Ãrea do Mestre.");
        return;
    }

    garantirEstadoAmeacasMestre();

    state.mestre.carregando = true;
    render();

    async function recarregarDadosMesa() {
        const registros = await window.T20Supabase.listarFichasAtivasDaMesa(mesaId);

        const fichasNormais = [];
        const ameacas = [];

        (registros || []).forEach(registro => {
            const ficha = registro?.ficha_json || {};
            const tipoRegistro = String(ficha?.tipoRegistro || "");

            if (tipoRegistro === "ameaca_mestre") {
                ameacas.push(ficha);
            } else {
                fichasNormais.push(registro);
            }
        });

        state.mestre.fichas = fichasNormais;
        state.mestre.ameacasEmCena = ameacas;

        if (
            state.mestre.fichaSelecionadaId &&
            !state.mestre.fichas.some(f => String(f.id) === String(state.mestre.fichaSelecionadaId))
        ) {
            state.mestre.fichaSelecionadaId = state.mestre.fichas[0]?.id || "";
        }

        if (
            state.mestre.ameacaSelecionadaInstanciaId &&
            !state.mestre.ameacasEmCena.some(a => String(a.instanciaId) === String(state.mestre.ameacaSelecionadaInstanciaId))
        ) {
            state.mestre.ameacaSelecionadaInstanciaId = state.mestre.ameacasEmCena[0]?.instanciaId || "";
        }

        if (!state.mestre.fichaSelecionadaId && !state.mestre.ameacaSelecionadaInstanciaId) {
            if (state.mestre.fichas.length) {
                state.mestre.fichaSelecionadaId = state.mestre.fichas[0].id;
            } else if (state.mestre.ameacasEmCena.length) {
                state.mestre.ameacaSelecionadaInstanciaId = state.mestre.ameacasEmCena[0].instanciaId;
            }
        }
    }

    try {
        await recarregarDadosMesa();

        await window.T20Supabase.assinarMesaAtiva(mesaId, async () => {
            await recarregarDadosMesa();
            render();
        });
    } catch (err) {
        console.error(err);
        alert("NÃ£o foi possÃ­vel carregar a Ãrea do Mestre.");
    } finally {
        state.mestre.carregando = false;
        render();
    }
}
function selecionarFichaMestre(id) {
    state.mestre.fichaSelecionadaId = id;
    render();
}
async function carregarMinhasMesasMestre() {
    if (!window.T20Supabase?.SUPA?.state?.user) {
        state.mestre.mesasCriadas = [];
        render();
        return;
    }

    try {
        state.mestre.mesasCriadas = await window.T20Supabase.listarMinhasMesas();
    } catch (err) {
        console.error(err);
        state.mestre.mesasCriadas = [];
    }

    render();
}

async function selecionarMesaMestre(mesaId, mesaNome) {
    state.mestre.mesaId = mesaId || "";
    state.mestre.mesaNome = mesaNome || "";
    state.mestre.fichas = [];
    state.mestre.fichaSelecionadaId = "";

    state.mestre.iniciativaOrdem = [];
    state.mestre.iniciativaAberta = false;
    state.mestre._iniciativaCarregada = false;

    await carregarAreaDoMestre();
}

async function criarMesaMestre() {
    const nome = prompt("Nome da mesa:");
    if (!nome) return;

    try {
        const mesaId = await window.T20Supabase.criarMesa(nome);
        await carregarMinhasMesasMestre();

        const mesa = (state.mestre.mesasCriadas || []).find(m => m.id === mesaId);
        if (mesa) {
            state.mestre.mesaId = mesa.id;
            state.mestre.mesaNome = mesa.nome;
        } else {
            state.mestre.mesaId = mesaId;
            state.mestre.mesaNome = nome;
        }

        await carregarAreaDoMestre();
    } catch (err) {
        console.error(err);
        alert(err?.message || "NÃ£o foi possÃ­vel criar a mesa.");
    }
}

async function excluirMesaMestre() {
    const mesaId = state.mestre.mesaId;
    if (!mesaId) {
        alert("Selecione uma mesa.");
        return;
    }

    const ok = confirm("Excluir esta mesa? Essa aÃ§Ã£o nÃ£o pode ser desfeita.");
    if (!ok) return;

    try {
        await window.T20Supabase.excluirMesa(mesaId);
        state.mestre.mesaId = "";
        state.mestre.mesaNome = "";
        state.mestre.fichas = [];
        state.mestre.fichaSelecionadaId = "";
        await carregarMinhasMesasMestre();
        render();
    } catch (err) {
        console.error(err);
        alert(err?.message || "NÃ£o foi possÃ­vel excluir a mesa.");
    }
}
function atualizarMesaMestre(valor) {
    state.mestre.mesaId = valor || "";
}
function renderAvatarJogadorMestre(fichaRemota) {
    const nome = fichaRemota?.nome || "Sem nome";
    return escapeHtml(nome.charAt(0).toUpperCase() || "?");
}

function renderListaPills(lista) {
    if (!Array.isArray(lista) || !lista.length) return `<div class="empty">Nenhum.</div>`;
    return `
      <div style="display:flex; flex-wrap:wrap; gap:8px;">
        ${lista.map(item => `
          <span style="padding:6px 10px; border-radius:999px; background:#f2f2f2; font-size:13px;">
            ${escapeHtml(item?.nome || item || "â€”")}
          </span>
        `).join("")}
      </div>
    `;
}

function renderFichaMestreDetalhe(fichaRemota) {
    const f = fichaRemota?.ficha_json || null;

    if (!f) {
        return `<div class="empty">Selecione um jogador Ã  esquerda.</div>`;
    }

    const atributos = [
        ["For", f.forca ?? f.forcaBase ?? 0],
        ["Des", f.destreza ?? f.destrezaBase ?? 0],
        ["Con", f.constituicao ?? f.constituicaoBase ?? 0],
        ["Int", f.inteligencia ?? f.inteligenciaBase ?? 0],
        ["Sab", f.sabedoria ?? f.sabedoriaBase ?? 0],
        ["Car", f.carisma ?? f.carismaBase ?? 0]
    ];

    return `
      <div class="panel">
        <div class="panel-title">Ficha do Jogador</div>
        <div class="panel-body">
          <div style="display:grid; grid-template-columns: 1fr auto; gap:12px; align-items:start;">
            <div>
              <h2 style="margin:0 0 6px 0;">${escapeHtml(f.nome || fichaRemota.nome || "Sem nome")}</h2>
              <div class="subtitle">
                ${escapeHtml(f.raca || "â€”")} â€¢
                ${escapeHtml(f.classe || "â€”")} â€¢
                NÃ­vel ${escapeHtml(f.nivelTotal || f.nivel || 1)}
              </div>
            </div>
            <div class="notice">
              Atualizado em: ${escapeHtml(new Date(fichaRemota.updated_at).toLocaleString("pt-BR"))}
            </div>
          </div>

          <div style="height:12px;"></div>

          <div style="display:grid; grid-template-columns: repeat(6, 1fr); gap:10px;">
            ${atributos.map(([rotulo, valor]) => `
              <div class="panel" style="margin:0;">
                <div class="panel-title">${rotulo}</div>
                <div class="panel-body" style="text-align:center; font-size:22px; font-weight:700;">
                  ${escapeHtml(valor)}
                </div>
              </div>
            `).join("")}
          </div>

          <div style="height:12px;"></div>

          <div style="display:grid; grid-template-columns: repeat(4, 1fr); gap:10px;">
            <div class="panel" style="margin:0;">
              <div class="panel-title">PV</div>
              <div class="panel-body">${escapeHtml(f.pvAtual ?? f.pv ?? 0)} / ${escapeHtml(f.pvMax ?? f.pvTotal ?? f.pv ?? 0)}</div>
            </div>
            <div class="panel" style="margin:0;">
              <div class="panel-title">PM</div>
              <div class="panel-body">${escapeHtml(f.pmAtual ?? f.pm ?? 0)} / ${escapeHtml(f.pmMax ?? f.pmTotal ?? f.pm ?? 0)}</div>
            </div>
            <div class="panel" style="margin:0;">
              <div class="panel-title">Defesa</div>
              <div class="panel-body">${escapeHtml(f.defesa ?? 0)}</div>
            </div>
            <div class="panel" style="margin:0;">
              <div class="panel-title">Deslocamento</div>
              <div class="panel-body">${escapeHtml(f.deslocamento || "â€”")}</div>
            </div>
          </div>

          <div style="height:12px;"></div>

          <div class="panel" style="margin:0 0 12px 0;">
            <div class="panel-title">PerÃ­cias</div>
            <div class="panel-body">
              ${(f.pericias || []).length
            ? `
                  <div style="display:grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap:8px;">
                    ${(f.pericias || []).map(p => `
                      <div class="list-item" style="margin:0;">
                        <div class="list-item-title">${escapeHtml(p.nome || "PerÃ­cia")}</div>
                        <div class="list-item-sub">
                          Total: ${escapeHtml(
                p.total ??
                p.bonusTotal ??
                ((Number(p.atributo) || 0) + (Number(p.treino) || 0) + (Number(p.outros) || 0))
            )}
                          ${p.treinada ? " â€¢ Treinada" : ""}
                        </div>
                      </div>
                    `).join("")}
                  </div>
                `
            : `<div class="empty">Nenhuma perÃ­cia.</div>`
        }
            </div>
          </div>

          <div class="panel" style="margin:0 0 12px 0;">
            <div class="panel-title">Poderes</div>
            <div class="panel-body">
              ${renderListaPills(f.poderes || f.habilidades || [])}
            </div>
          </div>

          <div class="panel" style="margin:0 0 12px 0;">
            <div class="panel-title">Magias</div>
            <div class="panel-body">
              ${renderListaPills(f.magias || [])}
            </div>
          </div>

          <div class="panel" style="margin:0;">
            <div class="panel-title">InventÃ¡rio / Equipamentos</div>
            <div class="panel-body">
              ${(f.equipamentos || f.inventario || []).length
            ? `
                  <div class="list">
                    ${(f.equipamentos || f.inventario || []).map(item => `
                      <div class="list-item">
                        <div class="list-item-title">${escapeHtml(item.nome || "Item")}</div>
                        <div class="list-item-sub">
                          Qtd: ${escapeHtml(item.quantidade || 1)}
                          ${item.descricao ? ` â€¢ ${escapeHtml(item.descricao)}` : ""}
                        </div>
                      </div>
                    `).join("")}
                  </div>
                `
            : `<div class="empty">Nenhum item.</div>`
        }
            </div>
          </div>
        </div>
      </div>
    `;
}
function getMestreScale() {
    const BASE_WIDTH = 2548;
    const MIN_SCALE = 0.38;
    const MAX_SCALE = 0.72;
    const HORIZONTAL_MARGIN = 24;

    const larguraJanela = window.innerWidth || document.documentElement.clientWidth || BASE_WIDTH;
    const escalaCalculada = (larguraJanela - HORIZONTAL_MARGIN) / BASE_WIDTH;

    return Math.max(MIN_SCALE, Math.min(MAX_SCALE, escalaCalculada));
}
function atualizarEscalaModalIniciativaMestre() {
    const modal = document.querySelector(".mestre-iniciativa-modal");
    if (!modal) return;

    const scaleBase = getMestreScale();

    const BONUS_SCALE = 0.08;
    const MIN_SCALE = 0.52;
    const MAX_SCALE = 0.82;

    const dprAtual = window.devicePixelRatio || 1;
    const fatorZoom = dprAtual / MESTRE_MODAL_BASE_DPR;

    // quanto maior o zoom, maior o fatorZoom, entÃ£o menor fica a escala final
    const scaleCompensadaZoom = (scaleBase + BONUS_SCALE) / fatorZoom;

    const scale = Math.max(
        MIN_SCALE,
        Math.min(MAX_SCALE, scaleCompensadaZoom)
    );

    modal.style.setProperty("--mestre-modal-scale", String(scale));
}
function atualizarEscalaMestre() {
    const mestreLayout = document.querySelector(".mestre-layout");
    const scale = getMestreScale();

    if (mestreLayout) {
        mestreLayout.style.setProperty("--mestre-scale", String(scale));
    }

    atualizarEscalaModalIniciativaMestre();
}

let resizeMestreRegistrado = false;

function garantirResizeMestre() {
    if (resizeMestreRegistrado) return;
    resizeMestreRegistrado = true;

    let rafId = null;

    const recalcular = () => {
        if (rafId) cancelAnimationFrame(rafId);
        rafId = requestAnimationFrame(() => {
            atualizarEscalaMestre();
        });
    };

    window.addEventListener("resize", recalcular);
    window.addEventListener("orientationchange", recalcular);

    if (window.visualViewport) {
        window.visualViewport.addEventListener("resize", recalcular);
    }
}
function getIniciativaStorageKey() {
    const mesaId = String(state?.mestre?.mesaId || "sem_mesa");
    return `${MESTRE_INICIATIVA_STORAGE_KEY}:${mesaId}`;
}

function carregarIniciativaMestreDoStorage() {
    garantirEstadoAmeacasMestre();

    try {
        const raw = localStorage.getItem(getIniciativaStorageKey());
        state.mestre.iniciativaOrdem = raw ? JSON.parse(raw) : [];
    } catch (err) {
        console.warn("NÃ£o foi possÃ­vel carregar a iniciativa do navegador:", err);
        state.mestre.iniciativaOrdem = [];
    }
}

function salvarIniciativaMestreNoStorage() {
    garantirEstadoAmeacasMestre();

    try {
        localStorage.setItem(
            getIniciativaStorageKey(),
            JSON.stringify(state.mestre.iniciativaOrdem || [])
        );
    } catch (err) {
        console.warn("NÃ£o foi possÃ­vel salvar a iniciativa no navegador:", err);
    }
}

function getItensAtivosIniciativaMestre() {
    garantirEstadoAmeacasMestre();

    const jogadores = (getListaFichasMestreComNpcs() || []).map(item => {
        const fichaBase = item.tipo === "npc_local" ? item.ficha : item.ficha_json;
        const nome = fichaBase?.nome || item?.nome || "Sem nome";
        const classe = fichaBase?.classesPersonagem?.[0]?.nome || fichaBase?.classe || "Sem classe";
        const nivel = fichaBase?.nivelTotal || fichaBase?.nivel || 1;

        return {
            uid: `jogador:${String(item.id)}`,
            origem: "jogador",
            idOriginal: String(item.id),
            nome,
            subtitulo: `${classe} â€¢ NÃ­vel ${nivel}`,
            inicial: (nome || "?").charAt(0).toUpperCase()
        };
    });

    const contadoresAmeacas = {};
    const ameacas = (state.mestre.ameacasEmCena || []).map(item => {
        const chave = String(item.ameacaId || item.nome || "");
        contadoresAmeacas[chave] = (contadoresAmeacas[chave] || 0) + 1;
        const indice = contadoresAmeacas[chave];

        const nomeBase = item.nome || "AmeaÃ§a";
        const nome = indice > 1 ? `${nomeBase} ${indice}` : nomeBase;

        return {
            uid: `ameaca:${String(item.instanciaId)}`,
            origem: "ameaca",
            idOriginal: String(item.instanciaId),
            nome,
            subtitulo: "AmeaÃ§a ativa",
            inicial: (nomeBase || "?").charAt(0).toUpperCase()
        };
    });

    return [...jogadores, ...ameacas];
}

function sincronizarIniciativaMestre() {
    garantirEstadoAmeacasMestre();

    const itensAtivos = getItensAtivosIniciativaMestre();
    const ativosMap = new Map(itensAtivos.map(item => [item.uid, item]));
    const ordemAtual = Array.isArray(state.mestre.iniciativaOrdem) ? state.mestre.iniciativaOrdem : [];

    const ordemFiltrada = ordemAtual.filter(uid => ativosMap.has(uid));
    const faltantes = itensAtivos
        .map(item => item.uid)
        .filter(uid => !ordemFiltrada.includes(uid));

    state.mestre.iniciativaOrdem = [...ordemFiltrada, ...faltantes];
    salvarIniciativaMestreNoStorage();

    return state.mestre.iniciativaOrdem
        .map(uid => ativosMap.get(uid))
        .filter(Boolean);
}

function abrirIniciativaMestre() {
    garantirEstadoAmeacasMestre();
    sincronizarIniciativaMestre();
    state.mestre.iniciativaAberta = true;
    render();
}
function toggleIniciativaMinimizadaMestre() {
    garantirEstadoAmeacasMestre();
    state.mestre.iniciativaMinimizada = !state.mestre.iniciativaMinimizada;
    render();
}
function fecharIniciativaMestre() {
    garantirEstadoAmeacasMestre();
    state.mestre.iniciativaAberta = false;
    render();
}
function moverItemIniciativaMestre(fromIndex, toIndex) {
    garantirEstadoAmeacasMestre();

    const ordem = [...(state.mestre.iniciativaOrdem || [])];
    if (
        fromIndex < 0 ||
        toIndex < 0 ||
        fromIndex >= ordem.length ||
        toIndex >= ordem.length ||
        fromIndex === toIndex
    ) {
        return;
    }

    const [item] = ordem.splice(fromIndex, 1);
    ordem.splice(toIndex, 0, item);

    state.mestre.iniciativaOrdem = ordem;
    salvarIniciativaMestreNoStorage();
    render();
}

function iniciarDragIniciativaMestre(index) {
    window.__dragIniciativaMestreIndex = index;
}

function permitirDropIniciativaMestre(event) {
    event.preventDefault();
}

function soltarItemIniciativaMestre(index) {
    const fromIndex = Number(window.__dragIniciativaMestreIndex);
    const toIndex = Number(index);

    if (Number.isNaN(fromIndex) || Number.isNaN(toIndex)) return;

    moverItemIniciativaMestre(fromIndex, toIndex);
    window.__dragIniciativaMestreIndex = null;
}

function finalizarDragIniciativaMestre() {
    window.__dragIniciativaMestreIndex = null;
}
function removerFlutuantesDaFichaNoMestre(html) {
    const wrapper = document.createElement("div");
    wrapper.innerHTML = String(html || "");

    // remove o container lateral de botÃµes
    wrapper.querySelectorAll(".side-buttons").forEach(el => el.remove());

    // remove botÃµes ligados a dados, regras e dinheiro
    wrapper.querySelectorAll("button").forEach(el => {
        const onclick = String(el.getAttribute("onclick") || "");
        const texto = String(el.textContent || "").trim().toLowerCase();
        const cls = String(el.className || "").toLowerCase();

        const ehBotaoDados =
            onclick.includes("abrirModal('dados')") ||
            onclick.includes('abrirModal("dados")') ||
            texto === "dados";

        const ehBotaoRegras =
            onclick.includes("abrirModalRegras()") ||
            texto === "regras";

        const ehBotaoDinheiro =
            onclick.includes("togglePainelDinheiro()") ||
            texto === "t$ 0" ||
            texto.startsWith("t$") ||
            texto.includes("t$");

        const ehFlutuante =
            cls.includes("floating") ||
            cls.includes("money") ||
            cls.includes("dinheiro");

        if (ehBotaoDados || ehBotaoRegras || ehBotaoDinheiro || ehFlutuante) {
            el.remove();
        }
    });

    // remove qualquer elemento ligado a dados, regras e dinheiro
    wrapper.querySelectorAll(`
        [onclick*="abrirModal('dados')"],
        [onclick*='abrirModal("dados")'],
        [onclick*="abrirModalRegras()"],
        [onclick*="togglePainelDinheiro()"],
        .widget-dinheiro-flutuante,
        .dinheiro-flutuante,
        .money-widget-floating,
        .floating-money,
        .money-floating-btn,
        .side-buttons
    `).forEach(el => el.remove());

    // remove especificamente o modal de regras da ficha do player
    wrapper.querySelectorAll(".overlay").forEach(el => {
        const titulo = el.querySelector(".overlay-title")?.textContent?.trim().toLowerCase() || "";
        const botaoFechar = el.querySelector('[onclick*="fecharModalRegras()"]');

        if (titulo === "regras" || botaoFechar) {
            el.remove();
        }
    });

    // fallback extra para blocos sem classe padronizada
    wrapper.querySelectorAll("div, section, aside").forEach(el => {
        const texto = String(el.textContent || "").trim().toLowerCase();
        const cls = String(el.className || "").toLowerCase();

        if (
            texto === "dados" ||
            texto === "regras" ||
            texto === "t$ 0" ||
            texto.startsWith("t$") ||
            texto.includes("t$")
        ) {
            el.remove();
            return;
        }

        if (
            (texto === "dinheiro" || texto.includes("tibares") || texto.includes("to")) &&
            (cls.includes("floating") || cls.includes("dinheiro") || cls.includes("money"))
        ) {
            el.remove();
        }
    });

    return wrapper.innerHTML;
}

function renderModalIniciativaMestre() {
    garantirEstadoAmeacasMestre();

    if (!state.mestre.iniciativaAberta) return "";

    const itens = sincronizarIniciativaMestre();
    const minimizada = !!state.mestre.iniciativaMinimizada;

    return `
      <div class="mestre-iniciativa-modal ${minimizada ? "is-minimizada" : ""}">
        <div class="mestre-iniciativa-header">
          <div class="mestre-iniciativa-title">Iniciativa</div>

          <div class="mestre-iniciativa-header-actions">
            <button
              class="mestre-iniciativa-minimize"
              type="button"
              onclick="toggleIniciativaMinimizadaMestre()"
              title="${minimizada ? "Expandir iniciativa" : "Minimizar iniciativa"}"
            >
              ${minimizada ? "â–¢" : "â€”"}
            </button>

            <button
              class="mestre-iniciativa-close"
              type="button"
              onclick="fecharIniciativaMestre()"
              title="Fechar iniciativa"
            >
              âœ•
            </button>
          </div>
        </div>

        ${minimizada ? "" : `
          <div class="mestre-iniciativa-body">
            ${itens.length ? `
              <div class="mestre-iniciativa-lista">
                ${itens.map((item, index) => `
                  <div
                    class="mestre-iniciativa-item"
                    draggable="true"
                    ondragstart="iniciarDragIniciativaMestre(${index})"
                    ondragover="permitirDropIniciativaMestre(event)"
                    ondrop="soltarItemIniciativaMestre(${index})"
                    ondragend="finalizarDragIniciativaMestre()"
                  >
                    <div class="mestre-iniciativa-handle">â˜°</div>
                    <div class="mestre-iniciativa-avatar">${escapeHtml(item.inicial)}</div>
                    <div class="mestre-iniciativa-info">
                      <div class="mestre-iniciativa-nome">${escapeHtml(item.nome)}</div>
                      <div class="mestre-iniciativa-sub">${escapeHtml(item.subtitulo)}</div>
                    </div>
                  </div>
                `).join("")}
              </div>
            ` : `
              <div class="empty">Nenhum participante ativo.</div>
            `}
          </div>
        `}
      </div>
    `;
}
function renderMestre() {
    garantirEstadoAmeacasMestre();
    if (!state.mestre._iniciativaCarregada) {
        carregarIniciativaMestreDoStorage();
        state.mestre._iniciativaCarregada = true;
    }

    const fichaHtml = montarHtmlViewerMestre();
    const listaFichas = getListaFichasMestreComNpcs();
    sincronizarIniciativaMestre();

    app.innerHTML = `
    <div class="screen" style="padding:0; margin:0; width:100vw; height:100vh; max-width:none; overflow:auto; position:relative;">
  <div class="mestre-viewport">
      <style>
        html, body {
          overflow: auto;
        }

        #app {
          min-height: 100vh;
          overflow: visible;
        }

         .mestre-viewport {
          width: 100%;
          min-width: 100%;
          min-height: 100vh;
          position: relative;
          overflow: visible;
        }

        .mestre-layout {
          --mestre-scale: 0.5;
          position: absolute;
          top: 0;
          right: 0;
          min-height: calc(100vh / var(--mestre-scale));
          width: 2548px;
          min-width: 2548px;
          background: transparent;
          overflow: visible;
          transform: scale(var(--mestre-scale));
          transform-origin: top right;
        }

        .mestre-sidebar {
          position: absolute;
          top: 0;
          left: auto;
          right: 0;
          width: 320px;
          min-width: 320px;
          height: 100%;
          min-height: 100vh;
          background-color: var(--metal-6);
          background-image: url("images/background-grey.jpg");
          background-position: center;
          background-size: cover;
          box-shadow:
            0 0 0 1px var(--metal-1),
            0 0 0 6px var(--metal-4),
            0 0 0 7px var(--metal-5),
            0 0 0 12px var(--metal-3),
            0 0 0 14px var(--metal-2),
            inset 0 0 30px rgba(0, 0, 0, 0.6),
            inset 0 2px 2px rgba(255, 255, 255, 0.08);
          z-index: 20;
          display: flex;
          flex-direction: column;
        }

        .mestre-sidebar-header {
          padding: 18px 16px 14px;
          border-bottom: none;
          background: transparent;
          color: var(--branco);
          text-shadow: 0 1px 2px rgba(0,0,0,.55);
        }

        .mestre-sidebar-header .subtitle {
          color: var(--preto);
          font-size: 14px;
          font-weight: 900;
          text-align: center;
        }

        .mestre-sidebar-body {
          flex: 1;
          overflow: auto;
          padding: 12px 14px 18px;
        }

        .mestre-sidebar-section {
          margin-bottom: 18px;
        }

        .mestre-ficha-viewer {
          margin-left: 0;
          margin-right: 335px;
          min-height: 100vh;
          width: 2213px;
          overflow: visible;
          box-sizing: border-box;
        }

        .mestre-ficha-viewer > .screen > .topbar {
          display: none !important;
        }

        .mestre-dual-view {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 16px;
          min-height: 100vh;
          padding: 16px;
          align-items: start;
          width: 100%;
          min-width: 0;
          box-sizing: border-box;
        }

        .mestre-view-pane {
          min-width: 0;
          background: transparent;
          display: flex;
          flex-direction: column;
        }

        .mestre-view-pane-header {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 48px;
          padding: 0 34px;
          margin-bottom: 8px;
          border: none;
          border-radius: 0;
          background: url("images/caixa-texto-2.png") center / 30% 110% no-repeat;
          color: var(--preto);
          text-align: center;
          text-transform: uppercase;
        }

        .mestre-view-pane-header .list-item-title {
          font-size: 18px;
          font-weight: 900;
          line-height: 1;
        }

        .mestre-view-pane-body {
          width: 100%;
          overflow: visible;
          flex: 1;
          background: transparent;
        }

        .mestre-scale-wrap {
          width: 100%;
          overflow: visible;
          background: transparent;
        }

        .mestre-scale-inner {
          width: 100%;
          zoom: 1;
          transform: none;
          background: transparent;
        }

        .mestre-scale-inner .screen,
        .mestre-scale-inner .sheet-wrap,
        .mestre-scale-inner .ameaca-sheet-wrap,
        .mestre-scale-inner .sheet,
        .mestre-scale-inner .ameaca-sheet {
          width: 100% !important;
          max-width: none !important;
          min-width: 0 !important;
          margin: 0 !important;
          box-sizing: border-box !important;
        }

        .mestre-scale-inner .screen {
          padding: 0 !important;
          min-height: auto !important;
          overflow: visible !important;
        }

        .mestre-scale-inner .sheet-wrap,
        .mestre-scale-inner .ameaca-sheet-wrap {
          padding: 0 !important;
          background: transparent !important;
        }

        .mestre-scale-inner .sheet-wrap {
          background-color: transparent !important;
        }

        .mestre-player-btn {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 12px;
          min-height: 70px;
          padding: 7px 14px;
          border: none;
          border-radius: 0;
          background: url("images/caixa-texto-2.png") center / 100% 100% no-repeat;
          color: var(--preto);
          cursor: pointer;
          text-align: left;
          margin-bottom: 10px;
          font-family: "Alegreya Sans", sans-serif;
          font-weight: 900;
        }

        .mestre-player-btn.ativo {
          border: 3px solid var(--vermelho-escuro);
          background-image: url("images/caixa-texto-2.png");
          color: var(--preto);
          text-transform: uppercase;
        }

        .mestre-player-avatar {
          width: 42px;
          height: 42px;
          border-radius: 999px;
          background: var(--vermelho-escuro);
          color: var(--branco);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          flex: 0 0 auto;
        }

        .mestre-view-topbar {
          position: fixed;
          top: 16px;
          left: 84px;
          right: auto;
          z-index: 899;
          display: flex;
          gap: 10px;
        }

        .mestre-layout .btn {
          min-height: 46px;
          border: none;
          border-radius: 0;
          background: url("images/caixa-texto-2.png") center / 100% 100% no-repeat;
          box-shadow: none;
          color: var(--preto);
          font-family: "Alegreya Sans", sans-serif;
          font-size: 13px;
          font-weight: 900;
          line-height: 1;
          padding: 0 16px;
          text-align: center;
          text-shadow: 0 1px 0 rgba(255,255,255,.45);
          text-transform: none;
        }

        .mestre-layout .btn.primary,
        .mestre-layout .btn.danger,
        .mestre-back-btn {
          background-image: url("images/caixa-texto-3.png");
          color: var(--branco);
          text-shadow: 0 1px 2px rgba(0,0,0,.55);
        }

        .mestre-back-btn {
          width: 112px;
          min-height: 42px;
          aspect-ratio: 791 / 291;
          border: none;
          border-radius: 0;
          background: url("images/caixa-texto-3.png") center / 100% 100% no-repeat !important;
          box-shadow: none;
          color: var(--branco) !important;
          font-family: "Alegreya Sans", sans-serif;
          font-size: 15px;
          font-weight: 900;
          line-height: 1;
          padding: 0 16px;
          text-align: center;
          text-shadow: 0 1px 2px rgba(0,0,0,.55);
          text-transform: uppercase !important;
        }

        .mestre-mesa-btn {
          width: 100%;
          min-height: 58px;
          display: flex;
          padding: 8px 18px;
          align-items: center;
          justify-content: center;
          gap: 8px;
          border: none;
          border-radius: 0;
          background: url("images/caixa-texto-2.png") center / 100% 100% no-repeat;
          color: var(--preto);
          text-align: center;
          cursor: pointer;
          margin-bottom: 8px;
          font-family: "Alegreya Sans", sans-serif;
          font-weight: 900;
        }

        .mestre-mesa-btn.ativa {
          background-image: url("images/caixa-texto-2.png");
          color: var(--preto);
          text-transform: uppercase;
        }

        .mestre-section-toggle {
          background-image: url("images/caixa-texto-2.png");
          color: var(--preto);
          text-transform: uppercase;
        }

        .mestre-sidebar-title {
          width: 100%;
          min-height: 52px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0 22px;
          background: url("images/caixa-texto-3.png") center / 100% 100% no-repeat;
          color: var(--branco);
          font-size: 20px;
          font-weight: 900;
          line-height: 1;
          text-align: center;
          text-shadow: 0 1px 2px rgba(0,0,0,.55);
          box-sizing: border-box;
        }

        .mestre-sidebar-header > div:first-child {
          width: 100%;
          min-height: 52px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0 22px;
          background: url("images/caixa-texto-3.png") center / 100% 100% no-repeat;
          color: var(--branco);
          font-size: 20px !important;
          font-weight: 900 !important;
          line-height: 1;
          text-align: center;
          text-shadow: 0 1px 2px rgba(0,0,0,.55);
          box-sizing: border-box;
        }

        .mestre-sidebar .list-item-title {
          color: inherit;
          font-size: 16px;
          font-weight: 900;
          line-height: 1.05;
        }

        .mestre-sidebar-section > .list-item-title {
          text-align: center;
        }

        .mestre-sidebar .list-item-sub {
          color: inherit;
          font-size: 12px;
          font-weight: 800;
          opacity: .82;
        }

        .mestre-sidebar .empty {
          background: rgba(195, 168, 120, .82);
          border-color: rgba(50, 34, 18, .45);
          color: var(--preto);
          font-weight: 900;
        }

        .mestre-player-row {
          display: flex;
          gap: 8px;
          align-items: center;
          margin-bottom: 10px;
        }

        .mestre-player-row .mestre-player-btn {
          margin-bottom: 0;
          flex: 1;
        }
      </style>

      <div class="mestre-view-topbar">
        <button class="btn mestre-back-btn" onclick="go('home')">VOLTAR</button>
      </div>

      <div class="mestre-layout">
        <aside class="mestre-sidebar">
          <div class="mestre-sidebar-header">
            <div style="font-size:20px; font-weight:700;">Ãrea do Mestre</div>
            <div class="subtitle" style="margin-top:4px;">
              ${state.mestre.mesaNome
            ? `Mesa: ${escapeHtml(state.mestre.mesaNome)}`
            : "Gerencie suas mesas e veja as fichas ativas"}
            </div>
          </div>

          <div class="mestre-sidebar-body">
            <div class="mestre-sidebar-section">
              <div class="list-item-title" style="margin-bottom:8px;">Minhas mesas</div>

              <div style="display:flex; gap:8px; margin-bottom:10px; flex-wrap:wrap; justify-content:center;">
                <button class="btn primary" type="button" onclick="criarMesaMestre()">Criar mesa</button>
                <button class="btn danger" type="button" onclick="excluirMesaMestre()">Excluir mesa</button>
                <button class="btn" type="button" onclick="abrirModalNpcAleatorio()">Criar NPC aleatÃ³rio</button>
                <button class="btn" type="button" onclick="abrirIniciativaMestre()">Iniciativa</button>
                <button class="btn" type="button" onclick="abrirModalAmeacas()">AmeaÃ§as</button>
                <button class="btn" type="button" onclick="abrirModalRegras()">Regras</button>
                <button class="btn" type="button" onclick="abrirModal('dados')">Dados</button>
              </div>

              ${!(state.mestre.mesasCriadas || []).length
            ? `<div class="empty">VocÃª ainda nÃ£o criou mesas.</div>`
            : `
                  <div>
                    ${(state.mestre.mesasCriadas || []).map(mesa => `
                      <button
                        class="mestre-mesa-btn ${String(mesa.id) === String(state.mestre.mesaId) ? "ativa" : ""}"
                        type="button"
                        onclick="selecionarMesaMestre('${mesa.id}', decodeURIComponent('${encodeURIComponent(mesa.nome)}'))"
                      >
                        <div class="list-item-title">${escapeHtml(mesa.nome)}</div>
                        <div class="list-item-sub">
                          Criada em ${escapeHtml(new Date(mesa.created_at).toLocaleDateString("pt-BR"))}
                        </div>
                      </button>
                    `).join("")}
                  </div>
                `}
            </div>

            <div class="mestre-sidebar-section">
              <button
                class="mestre-mesa-btn mestre-section-toggle"
                type="button"
                onclick="toggleJogadoresAtivosMestre()"
                style="display:flex; justify-content:center; align-items:center; margin-bottom:8px;"
              >
                <span class="list-item-title" style="font-size:18px;">Jogadores ativos</span>
                <span>${state.mestre.jogadoresAbertos ? "â–¾" : "â–¸"}</span>
              </button>

              ${state.mestre.jogadoresAbertos ? (
            !listaFichas.length
                ? `<div class="empty">Nenhum jogador ativo.</div>`
                : listaFichas.map(item => {
                    const ativo = String(item.id) === String(state.mestre.fichaSelecionadaId);
                    const fichaBase = item.tipo === "npc_local" ? item.ficha : item.ficha_json;
                    const nome = fichaBase?.nome || item?.nome || "Sem nome";
                    const classe = fichaBase?.classesPersonagem?.[0]?.nome || fichaBase?.classe || "Sem classe";
                    const nivel = fichaBase?.nivelTotal || fichaBase?.nivel || 1;
                    const inicial = escapeHtml((nome || "?").charAt(0).toUpperCase());

                    return `
                        <div class="mestre-player-row">
                          <button
                            class="mestre-player-btn ${ativo ? "ativo" : ""}"
                            type="button"
                            onclick="selecionarFichaMestre('${item.id}')"
                          >
                            <div class="mestre-player-avatar">${inicial}</div>
                            <div style="min-width:0;">
                              <div class="list-item-title">
                                ${escapeHtml(nome)}
                                ${item.tipo === "npc_local" ? `<span class="subtitle"> â€¢ NPC</span>` : ``}
                              </div>
                              <div class="list-item-sub">${escapeHtml(classe)} â€¢ NÃ­vel ${escapeHtml(nivel)}</div>
                            </div>
                          </button>

                          ${item.tipo === "npc_local" ? `
                            <button
                              class="btn danger"
                              type="button"
                              onclick="excluirNpcLocalMestre('${item.ficha.id}')"
                              title="Excluir NPC"
                            >
                              âœ•
                            </button>
                          ` : ""}
                        </div>
                      `;
                }).join("")
        ) : ""}
            </div>

            <div class="mestre-sidebar-section">
              <div style="display:flex; gap:8px; align-items:center; margin-bottom:8px;">
                <button
                  class="mestre-mesa-btn mestre-section-toggle"
                  type="button"
                  onclick="toggleAmeacasAtivasMestre()"
                  style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0; flex:1;"
                >
                  <span class="list-item-title" style="font-size:18px;">AmeaÃ§as ativas</span>
                  <span>${state.mestre.ameacasAbertas ? "â–¾" : "â–¸"}</span>
                </button>

                <button
                  class="btn danger"
                  type="button"
                  onclick="excluirTodasAmeacasMestre()"
                  title="Excluir todas as ameaÃ§as"
                >
                  Limpar
                </button>
              </div>

              ${state.mestre.ameacasAbertas ? renderListaAmeacasAtivasMestre() : ""}
            </div>
          </div>
        </aside>

        <div class="mestre-ficha-viewer">
          ${fichaHtml}
        </div>
          </div>
          ${renderModalIniciativaMestre()}
      </div>
    </div>
  `;
    garantirResizeMestre();
    atualizarEscalaMestre();

    aplicarModoSomenteLeituraMestre();


    const modalNpcHtml = renderNpcAleatorioModal();
    if (modalNpcHtml) {
        app.insertAdjacentHTML("beforeend", modalNpcHtml);
    }

    const modalAmeacasHtml = renderModalAmeacas();
    if (modalAmeacasHtml) {
        app.insertAdjacentHTML("beforeend", modalAmeacasHtml);
    }

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
        alert("NÃ£o foi possÃ­vel exportar as fichas.");
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
                alert("Arquivo invÃ¡lido. Selecione um JSON de fichas exportado pelo sistema.");
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

            render();
            sincronizarTodasAsFichasAgora().then(() => {
                alert("Fichas importadas e salvas com sucesso.");
            }).catch(err => {
                console.error(err);
                alert("As fichas foram importadas na tela, mas houve um erro ao salvar algumas no servidor.");
            });
        } catch (err) {
            console.error(err);
            alert("NÃ£o foi possÃ­vel ler o arquivo JSON.");
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
        imagemPersonagemUrl: "",
        imagemPersonagemPath: "",
        avatarPersonagemUrl: "",
        avatarPersonagemPath: "",
        raca: "",
        classesPersonagem: [],
        arcanistaCaminho: "",
        bardoEscolas: [],
        druidaEscolas: [],
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
        oficios: [],
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
        atributoChaveMagias: "",
        cdMagias: 0,
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
            { nome: "AtuaÃ§Ã£o", outros: 0, treinada: false, atributo: "CAR", somenteTreinada: true, penalidadeArmadura: false },
            { nome: "Cavalgar", outros: 0, treinada: false, atributo: "DES", somenteTreinada: false, penalidadeArmadura: false },
            { nome: "Conhecimento", outros: 0, treinada: false, atributo: "INT", somenteTreinada: true, penalidadeArmadura: false },
            { nome: "Cura", outros: 0, treinada: false, atributo: "SAB", somenteTreinada: false, penalidadeArmadura: false },
            { nome: "Diplomacia", outros: 0, treinada: false, atributo: "CAR", somenteTreinada: false, penalidadeArmadura: false },
            { nome: "EnganaÃ§Ã£o", outros: 0, treinada: false, atributo: "CAR", somenteTreinada: false, penalidadeArmadura: false },
            { nome: "Fortitude", outros: 0, treinada: false, atributo: "CON", somenteTreinada: false, penalidadeArmadura: false },
            { nome: "Furtividade", outros: 0, treinada: false, atributo: "DES", somenteTreinada: false, penalidadeArmadura: true },
            { nome: "Guerra", outros: 0, treinada: false, atributo: "INT", somenteTreinada: true, penalidadeArmadura: false },
            { nome: "Iniciativa", outros: 0, treinada: false, atributo: "DES", somenteTreinada: false, penalidadeArmadura: false },
            { nome: "IntimidaÃ§Ã£o", outros: 0, treinada: false, atributo: "CAR", somenteTreinada: false, penalidadeArmadura: false },
            { nome: "IntuiÃ§Ã£o", outros: 0, treinada: false, atributo: "SAB", somenteTreinada: false, penalidadeArmadura: false },
            { nome: "InvestigaÃ§Ã£o", outros: 0, treinada: false, atributo: "INT", somenteTreinada: false, penalidadeArmadura: false },
            { nome: "Jogatina", outros: 0, treinada: false, atributo: "CAR", somenteTreinada: true, penalidadeArmadura: false },
            { nome: "Ladinagem", outros: 0, treinada: false, atributo: "DES", somenteTreinada: true, penalidadeArmadura: true },
            { nome: "Luta", outros: 0, treinada: false, atributo: "FOR", somenteTreinada: false, penalidadeArmadura: false },
            { nome: "Misticismo", outros: 0, treinada: false, atributo: "INT", somenteTreinada: true, penalidadeArmadura: false },
            { nome: "Nobreza", outros: 0, treinada: false, atributo: "INT", somenteTreinada: true, penalidadeArmadura: false },
            { nome: "OfÃ­cio", outros: 0, treinada: false, atributo: "INT", somenteTreinada: true, penalidadeArmadura: false },
            { nome: "PercepÃ§Ã£o", outros: 0, treinada: false, atributo: "SAB", somenteTreinada: false, penalidadeArmadura: false },
            { nome: "Pilotagem", outros: 0, treinada: false, atributo: "DES", somenteTreinada: true, penalidadeArmadura: false },
            { nome: "Pontaria", outros: 0, treinada: false, atributo: "DES", somenteTreinada: false, penalidadeArmadura: false },
            { nome: "Reflexos", outros: 0, treinada: false, atributo: "DES", somenteTreinada: false, penalidadeArmadura: false },
            { nome: "ReligiÃ£o", outros: 0, treinada: false, atributo: "SAB", somenteTreinada: true, penalidadeArmadura: false },
            { nome: "SobrevivÃªncia", outros: 0, treinada: false, atributo: "SAB", somenteTreinada: false, penalidadeArmadura: false },
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
function escolherAleatorio(lista) {
    if (!Array.isArray(lista) || !lista.length) return null;
    return lista[Math.floor(Math.random() * lista.length)];
}

function embaralharLista(lista) {
    const copia = [...(lista || [])];
    for (let i = copia.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copia[i], copia[j]] = [copia[j], copia[i]];
    }
    return copia;
}
function abrirModalAmeacas() {
    if (!state.mestre?.mesaId) {
        alert("Selecione uma mesa antes de adicionar ameaÃ§as.");
        return;
    }

    garantirEstadoAmeacasMestre();

    state.modal = "ameacas";
    state.mestre.ameacasModal = {
        nd: "",
        busca: "",
        selecionadas: {}
    };

    document.body.classList.add("modal-open");
    render();
}

function fecharModalAmeacas() {
    if (state.modal !== "ameacas") return;

    state.modal = null;
    document.body.classList.remove("modal-open");
    render();
}
function normalizarTextoBusca(texto) {
    return String(texto || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim();
}
let filtroAmeacasTimer = null;

function setFiltroBuscaAmeacasAtual(valor) {
    garantirEstadoAmeacasMestre();
    state.mestre.ameacasModal.busca = String(valor || "");
}

function agendarFiltroModalAmeacas(valor) {
    setFiltroBuscaAmeacasAtual(valor);

    if (filtroAmeacasTimer) {
        clearTimeout(filtroAmeacasTimer);
    }

    filtroAmeacasTimer = setTimeout(() => {
        aplicarFiltroModalAmeacas(valor);
    }, 180);
}

function aplicarFiltroModalAmeacas(valor = "") {
    setFiltroBuscaAmeacasAtual(valor);

    const lista = document.getElementById("lista-ameacas-modal");
    if (!lista) return;

    const termo = normalizarTextoBusca(valor);
    let totalVisivel = 0;

    Array.from(lista.querySelectorAll("[data-ameaca-nome-normalizado]")).forEach(item => {
        const nomeNormalizado = item.getAttribute("data-ameaca-nome-normalizado") || "";
        const exibir = !termo || nomeNormalizado.includes(termo);

        item.style.display = exibir ? "" : "none";

        if (exibir) {
            totalVisivel += 1;
        }
    });

    const mensagem = document.getElementById("mensagem-sem-ameacas-modal");
    if (mensagem) {
        mensagem.style.display = totalVisivel === 0 ? "block" : "none";
        mensagem.textContent = termo
            ? "Nenhuma ameaÃ§a encontrada para essa busca."
            : "Nenhuma ameaÃ§a encontrada.";
    }
}

function limparBuscaModalAmeacas() {
    const campo = document.getElementById("busca-ameacas-modal");
    setFiltroBuscaAmeacasAtual("");

    if (!campo) {
        aplicarFiltroModalAmeacas("");
        return;
    }

    campo.value = "";
    aplicarFiltroModalAmeacas("");
    campo.focus();
}
function getNdsAmeacasDisponiveis() {
    const unicos = [...new Set(
        (AMEACAS_DB.ameacas || [])
            .map(a => String(a.nd || "").trim())
            .filter(Boolean)
    )];

    return unicos.sort((a, b) => a.localeCompare(b, "pt-BR", { numeric: true }));
}

function getAmeacasFiltradasModal() {
    garantirEstadoAmeacasMestre();

    const nd = String(state.mestre.ameacasModal?.nd || "").trim();

    return (AMEACAS_DB.ameacas || []).filter(a => {
        return !nd || String(a.nd || "").trim() === nd;
    });
}

function alterarFiltroNdAmeacas(valor) {
    garantirEstadoAmeacasMestre();
    state.mestre.ameacasModal.nd = String(valor || "");
    render();
}

function toggleSelecaoAmeaca(ameacaId, checked) {
    garantirEstadoAmeacasMestre();

    const id = String(ameacaId);
    const selecionadas = state.mestre.ameacasModal.selecionadas || {};

    if (checked) {
        const totalAtual = getTotalAmeacasSelecionadasModal();

        if (totalAtual >= LIMITE_AMEACAS_POR_CRIACAO) {
            alert("limite por criaÃ§Ã£o, adicione primeiro");

            const checkbox = document.querySelector(
                `input[type="checkbox"][onchange*="toggleSelecaoAmeaca('${id}', this.checked)"]`
            );
            if (checkbox) checkbox.checked = false;

            render();
            return;
        }

        if (!selecionadas[id]) {
            selecionadas[id] = { quantidade: 1 };
        }
    } else {
        delete selecionadas[id];
    }

    render();
}

function alterarQuantidadeAmeacaSelecionada(ameacaId, valor) {
    garantirEstadoAmeacasMestre();

    const id = String(ameacaId);
    const selecionadas = state.mestre.ameacasModal.selecionadas || {};

    if (!selecionadas[id]) {
        selecionadas[id] = { quantidade: 1 };
    }

    const quantidadeAnterior = Math.max(1, Number(selecionadas[id].quantidade) || 1);
    let novaQuantidade = Math.max(1, Number(valor) || 1);

    const totalSemEssaAmeaca = getTotalAmeacasSelecionadasModal() - quantidadeAnterior;
    const maxPermitidoParaEssaAmeaca = Math.max(1, LIMITE_AMEACAS_POR_CRIACAO - totalSemEssaAmeaca);

    if (novaQuantidade > maxPermitidoParaEssaAmeaca) {
        novaQuantidade = maxPermitidoParaEssaAmeaca;
        alert("limite por criaÃ§Ã£o, adicione primeiro");
    }

    selecionadas[id].quantidade = novaQuantidade;
    render();
}

function getTotalAmeacasSelecionadasModal() {
    garantirEstadoAmeacasMestre();

    return Object.values(state.mestre.ameacasModal.selecionadas || {})
        .reduce((acc, item) => acc + Math.max(1, Number(item.quantidade) || 0), 0);
}
async function adicionarAmeacasSelecionadas() {
    garantirEstadoAmeacasMestre();

    const selecionadas = state.mestre.ameacasModal.selecionadas || {};
    const ids = Object.keys(selecionadas);

    if (!ids.length) {
        alert("Selecione pelo menos uma ameaÃ§a.");
        return;
    }

    if (!state.mestre.mesaId) {
        alert("Selecione uma mesa antes de adicionar ameaÃ§as.");
        return;
    }

    const mapa = new Map(
        (AMEACAS_DB.ameacas || []).map(a => [String(a.id || ""), a])
    );

    let ultimaInstanciaId = "";

    try {
        for (const id of ids) {
            const base = mapa.get(String(id));
            if (!base) continue;

            const quantidade = Math.max(1, Number(selecionadas[id]?.quantidade) || 1);

            for (let i = 0; i < quantidade; i++) {
                const instanciaId = uid();
                ultimaInstanciaId = instanciaId;

                const instancia = {
                    instanciaId,
                    ameacaId: base.id,
                    nome: base.nome,
                    nd: base.nd,
                    tipo: base.tipo,
                    tamanho: base.tamanho || "",
                    deslocamento: base.deslocamento || "",
                    resumo: base.resumo || "",
                    percepcaoBase: base.percepcao || "",
                    vonBase: base.von || "",
                    pericias: base.pericias || "â€”",
                    pv: Number(base.pv ?? 0) || 0,
                    pm: base.pm === "" || base.pm == null ? "" : Number(base.pm) || 0,
                    defesa: Number(base.defesa ?? 0) || 0,
                    iniciativa: Number(base.iniciativa ?? 0) || 0,
                    fort: Number(base.fort ?? 0) || 0,
                    ref: Number(base.ref ?? 0) || 0,
                    von: Number(extrairValorEComplementoAmeaca(base.von).valor || 0) || 0,
                    percepcao: Number(extrairValorEComplementoAmeaca(base.percepcao).valor || 0) || 0,
                    for: Number(base.for ?? 0) || 0,
                    des: Number(base.des ?? 0) || 0,
                    con: Number(base.con ?? 0) || 0,
                    int: Number(base.int ?? 0) || 0,
                    sab: Number(base.sab ?? 0) || 0,
                    car: Number(base.car ?? 0) || 0,
                    edicao: {
                        pv: Number(base.pv ?? 0) || 0,
                        pm: base.pm === "" || base.pm == null ? "" : Number(base.pm) || 0,
                        defesa: Number(base.defesa ?? 0) || 0,
                        iniciativa: Number(base.iniciativa ?? 0) || 0,
                        percepcao: Number(extrairValorEComplementoAmeaca(base.percepcao).valor || 0) || 0,
                        fort: Number(base.fort ?? 0) || 0,
                        ref: Number(base.ref ?? 0) || 0,
                        von: Number(extrairValorEComplementoAmeaca(base.von).valor || 0) || 0,
                        tamanho: base.tamanho || "",
                        deslocamento: base.deslocamento || "",
                        pericias: base.pericias || "â€”",
                        for: Number(base.for ?? 0) || 0,
                        des: Number(base.des ?? 0) || 0,
                        con: Number(base.con ?? 0) || 0,
                        int: Number(base.int ?? 0) || 0,
                        sab: Number(base.sab ?? 0) || 0,
                        car: Number(base.car ?? 0) || 0
                    }
                };

                if (window.T20Supabase?.salvarAmeacaMestre) {
                    await window.T20Supabase.salvarAmeacaMestre({
                        mesaId: state.mestre.mesaId,
                        ameaca: instancia
                    });
                }

                state.mestre.ameacasEmCena.push(instancia);
            }
        }

        state.mestre.ameacaSelecionadaInstanciaId = ultimaInstanciaId;
        state.mestre.fichaSelecionadaId = "";

        fecharModalAmeacas();
    } catch (err) {
        console.error(err);
        alert(err?.message || "NÃ£o foi possÃ­vel salvar as ameaÃ§as.");
    }
}
function renderModalAmeacas() {
    if (state.modal !== "ameacas") return "";

    garantirEstadoAmeacasMestre();

    const nds = getNdsAmeacasDisponiveis();
    const lista = getAmeacasFiltradasModal();
    const totalSelecionado = getTotalAmeacasSelecionadasModal();
    const buscaAtual = state.mestre.ameacasModal.busca || "";

    setTimeout(() => {
        const campoBusca = document.getElementById("busca-ameacas-modal");
        if (campoBusca) {
            if (campoBusca.value !== buscaAtual) {
                campoBusca.value = buscaAtual;
            }

            if (document.activeElement !== campoBusca) {
                campoBusca.focus();
            }
        }

        aplicarFiltroModalAmeacas(buscaAtual);
    }, 0);

    return `
      <div class="overlay mf-add-habilidade-overlay" onclick="fecharModalAmeacas()">
        <div class="overlay-card mf-add-habilidade-modal mf-mestre-ameacas-modal" onclick="event.stopPropagation()">
          <div class="overlay-header mf-add-habilidade-header">
            <div>
              <div class="overlay-title">Adicionar ameaÃ§as</div>
              <div class="subtitle">
                Filtre por ND, busque por nome e defina a quantidade de cada inimigo.
              </div>
            </div>

            <div class="mf-mestre-modal-actions">
              <button class="mf-add-habilidade-btn mf-add-habilidade-btn-fechar" type="button" onclick="fecharModalAmeacas()">Fechar</button>
              <button class="mf-add-habilidade-btn mf-add-habilidade-btn-manual" type="button" onclick="adicionarAmeacasSelecionadas()">
                Adicionar (${totalSelecionado})
              </button>
            </div>
          </div>

          <div class="overlay-body mf-add-habilidade-body mf-mestre-ameacas-body">
            <div class="t20-divider"></div>

            <div class="mf-mestre-ameacas-filtros">
              <div class="field mf-add-habilidade-field">
                <label>ND</label>
                <select onchange="alterarFiltroNdAmeacas(this.value)">
                  <option value="">Todos</option>
                  ${nds.map(nd => `
                    <option value="${escapeAttr(nd)}" ${state.mestre.ameacasModal.nd === nd ? "selected" : ""}>
                      ${escapeHtml(nd)}
                    </option>
                  `).join("")}
                </select>
              </div>

              <div class="field mf-add-habilidade-field">
                    <label>Buscar por nome</label>
                    <input
                    id="busca-ameacas-modal"
                    type="search"
                    value="${escapeAttr(state.mestre.ameacasModal.busca || "")}"
                    placeholder="Ex.: Goblin, Lobo, DragÃ£o..."
                    oninput="agendarFiltroModalAmeacas(this.value)"
                    onkeydown="if (event.key === 'Enter') { event.preventDefault(); aplicarFiltroModalAmeacas(this.value); }"
                    />
                </div>

                <div class="mf-add-habilidade-clear">
                    <button class="mf-add-habilidade-btn mf-add-habilidade-btn-limpar" type="button" onclick="limparBuscaModalAmeacas()">
                    Limpar
                    </button>
                </div>
            </div>

            <div class="t20-divider"></div>

            <div id="mensagem-sem-ameacas-modal" class="empty" style="display:none; margin-bottom:12px;">
  Nenhuma ameaÃ§a encontrada para essa busca.
</div>

<div class="mf-add-habilidade-lista mf-mestre-ameacas-lista" id="lista-ameacas-modal">
  ${!lista.length ? `
    <div class="empty">Nenhuma ameaÃ§a encontrada.</div>
  ` : lista.map(ameaca => {
        const selecionada = state.mestre.ameacasModal.selecionadas[String(ameaca.id)];
        const quantidade = Math.max(1, Number(selecionada?.quantidade) || 1);

        return `
                      <div
                          class="mf-add-habilidade-row mf-mestre-ameaca-row ${selecionada ? "is-selected" : ""}"
                          data-ameaca-nome-normalizado="${escapeAttr(normalizarTextoBusca(ameaca.nome || ""))}"
                          style="${selecionada ? "border-color:var(--vermelho-escuro);" : ""}"
                        >
                        <label class="mf-mestre-ameaca-main">
                          <div class="mf-add-habilidade-info mf-mestre-ameaca-info">
                            <div class="mf-add-habilidade-nome">${escapeHtml(ameaca.nome)}</div>
                            <div class="mf-add-habilidade-origem">
                              ND ${escapeHtml(ameaca.nd || "-")}
                              ${ameaca.tipo ? ` â€¢ ${escapeHtml(ameaca.tipo)}` : ""}
                              ${ameaca.tamanho ? ` â€¢ ${escapeHtml(ameaca.tamanho)}` : ""}
                            </div>
                            ${ameaca.resumo ? `
                              <div class="mf-raca-escolha-descricao">
                                ${escapeHtml(ameaca.resumo)}
                              </div>
                            ` : ""}
                          </div>
                        </label>

                        <div class="field mf-add-habilidade-field mf-mestre-ameaca-qtd">
                          <label>Qtd.</label>
                          <input
                              type="number"
                              min="1"
                              value="${escapeAttr(quantidade)}"
                              onchange="alterarQuantidadeAmeacaSelecionada('${escapeAttr(ameaca.id)}', this.value)"
                            />
                        </div>

                        <div class="mf-mestre-ameaca-check-cell">
                          <input
                            class="choice-checkbox mf-mestre-ameaca-checkbox"
                            type="checkbox"
                            ${selecionada ? "checked" : ""}
                            onchange="toggleSelecaoAmeaca('${escapeAttr(ameaca.id)}', this.checked)"
                          />
                        </div>
                      </div>
                    `;
    }).join("")}
            </div>
          </div>
        </div>
      </div>
    `;
}
function renderResumoAmeacasEmCena() {
    garantirEstadoAmeacasMestre();

    if (!state.mestre.ameacasEmCena.length) {
        return `<div class="empty">Nenhuma ameaÃ§a adicionada.</div>`;
    }

    return `
      <div class="list">
        ${state.mestre.ameacasEmCena.map(item => `
          <div class="list-item">
            <div>
              <div class="list-item-title">${escapeHtml(item.nome)} Ã— ${escapeHtml(item.quantidade)}</div>
              <div class="list-item-sub">ND ${escapeHtml(item.nd || "-")}</div>
            </div>
          </div>
        `).join("")}
      </div>
    `;
}
function getAmeacaCompletaPorId(ameacaId) {
    const id = String(ameacaId || "").trim();
    if (!id) return null;

    const base = (AMEACAS_DB.ameacas || []).find(a => String(a.id || "").trim() === id);
    if (!base) return null;

    const poderes = (AMEACAS_DB.poderes || [])
        .filter(p => String(p.ameaca_id || "").trim() === id)
        .sort((a, b) => (Number(a.ordem) || 0) - (Number(b.ordem) || 0));

    const magias = (AMEACAS_DB.magias || [])
        .filter(m => String(m.ameaca_id || "").trim() === id)
        .sort((a, b) => (Number(a.ordem) || 0) - (Number(b.ordem) || 0));

    const equipamento = (AMEACAS_DB.equipamento || [])
        .filter(e => String(e.ameaca_id || "").trim() === id)
        .sort((a, b) => (Number(a.ordem) || 0) - (Number(b.ordem) || 0))
        .map(e => String(e.nome || "").trim())
        .filter(Boolean)
        .join(", ");

    const tesouro = (AMEACAS_DB.tesouro || [])
        .filter(t => String(t.ameaca_id || "").trim() === id)
        .sort((a, b) => (Number(a.ordem) || 0) - (Number(b.ordem) || 0))
        .map(t => String(t.nome || "").trim())
        .filter(Boolean)
        .join(", ");

    return {
        ...base,
        poderes,
        magias,
        equipamento,
        tesouro
    };
}
function extrairValorEComplementoAmeaca(texto) {
    const bruto = String(texto || "").trim();
    if (!bruto) {
        return { valor: "", complemento: "" };
    }

    const partes = bruto.split(",");
    const valor = String(partes.shift() || "").trim();
    const complemento = partes.join(",").trim();

    return { valor, complemento };
}
function formatarBonusAmeaca(valor) {
    const texto = String(valor ?? "").trim();
    if (!texto) return "â€”";
    if (texto.startsWith("+") || texto.startsWith("-")) return texto;
    return `+${texto}`;
}
function formatarLinhaHabilidadeAmeaca(item) {
    if (!item) return "";

    const meta = [
        item.execucao,
        item.custo_pm,
        item.duracao
    ].filter(Boolean).join(", ");

    return `
        <div class="ameaca-linha-habilidade">
            <strong>${escapeHtml(item.nome || "")}</strong>
            ${meta ? ` <span class="ameaca-meta">(${escapeHtml(meta)})</span>` : ""}
            ${item.descricao ? ` ${escapeHtml(item.descricao)}` : ""}
        </div>
    `;
}
function getAmeacaInstanciaEditavelSelecionada() {
    const item = getAmeacaAtivaMestreSelecionada();
    if (!item) return null;

    if (!item.edicao) {
        const percepcao = extrairValorEComplementoAmeaca(item.percepcao ?? item.percepcaoBase ?? "");
        const von = extrairValorEComplementoAmeaca(item.von ?? item.vonBase ?? "");

        item.edicao = {
            nome: String(item.nome || ""),
            pv: Number(item.pv ?? 0) || 0,
            pm: item.pm === "" || item.pm == null ? "" : Number(item.pm) || 0,
            defesa: Number(item.defesa ?? 0) || 0,
            iniciativa: Number(item.iniciativa ?? 0) || 0,
            percepcao: Number(percepcao.valor || 0) || 0,
            fort: Number(item.fort ?? 0) || 0,
            ref: Number(item.ref ?? 0) || 0,
            von: Number(von.valor || 0) || 0,
            poderesTexto: formatarTextoEditavelListaAmeaca(item.poderes),
            magiasTexto: formatarTextoEditavelListaAmeaca(item.magias),
            equipamentoTexto: String(item.equipamento || ""),
            tesouroTexto: String(item.tesouro || ""),
            percepcaoComplemento: String(percepcao.complemento || ""),
            vonComplemento: String(von.complemento || ""),
        };
    }

    return item;
}
function renderSecaoTextoInlineEditavelAmeaca(titulo, campo, valor, placeholder = "Clique para editar...") {
    const texto = String(valor || "").trim();
    const vazio = !texto;

    return `
        <div class="ameaca-secao">
            <div class="ameaca-secao-titulo">${escapeHtml(titulo)}</div>
            <div
                class="ameaca-texto-inline-editavel ${vazio ? "is-empty" : ""}"
                contenteditable="true"
                spellcheck="false"
                data-placeholder="${escapeAttr(placeholder)}"
                data-raw="${escapeAttr(texto)}"
                onfocus="entrarEdicaoInlineAmeaca(this)"
                onblur="salvarEdicaoInlineAmeaca(this, '${escapeAttr(campo)}')"
            >${vazio ? "" : formatarMarkupInlineAmeaca(texto)}</div>
        </div>
    `;
}
function renderTextoInlineEditavelLateralAmeaca(campo, valor, placeholder = "Clique para editar...") {
    const texto = String(valor || "").trim();
    const vazio = !texto;

    return `
        <div
            class="ameaca-side-texto-inline-editavel ${vazio ? "is-empty" : ""}"
            contenteditable="true"
            spellcheck="false"
            data-placeholder="${escapeAttr(placeholder)}"
            data-raw="${escapeAttr(texto)}"
            onfocus="entrarEdicaoInlineAmeaca(this)"
            onblur="salvarEdicaoInlineAmeaca(this, '${escapeAttr(campo)}')"
        >${vazio ? "" : formatarMarkupInlineAmeaca(texto)}</div>
    `;
}
function entrarEdicaoInlineAmeaca(el) {
    if (!el) return;

    el.classList.add("is-editing");

    const raw = String(el.dataset.raw || "");

    if (!raw.trim()) {
        el.textContent = "";
        el.classList.remove("is-empty");
        return;
    }

    el.textContent = raw;
    el.classList.remove("is-empty");
}

function salvarEdicaoInlineAmeaca(el, campo) {
    if (!el) return;

    const valor = String(el.textContent || "").trim();

    el.classList.remove("is-editing");
    el.dataset.raw = valor;

    if (!valor) {
        el.classList.add("is-empty");
        el.innerHTML = "";
    } else {
        el.classList.remove("is-empty");
        el.innerHTML = formatarMarkupInlineAmeaca(valor);
    }

    updateAmeacaSelecionadaCampo(campo, valor);
}
function formatarTextoEditavelListaAmeaca(lista) {
    if (!Array.isArray(lista) || !lista.length) return "";

    return lista
        .map(item => {
            if (!item) return "";

            const nome = String(item.nome || "").trim();

            const meta = [
                item.execucao,
                item.custo_pm,
                item.duracao
            ]
                .map(v => String(v || "").trim())
                .filter(Boolean)
                .join(", ");

            const descricao = String(item.descricao || "").trim();

            return [
                nome ? `*${nome}*` : "",
                meta ? `#(${meta})#` : "",
                descricao
            ]
                .filter(Boolean)
                .join(" ")
                .trim();
        })
        .filter(Boolean)
        .join("\n");
}
function formatarMarkupInlineAmeaca(texto) {
    const bruto = String(texto || "");
    const escapado = escapeHtml(bruto);

    return escapado
        .replace(/\*([^*\n]+)\*/g, "<strong>$1</strong>")
        .replace(/#([^#\n]+)#/g, '<span class="ameaca-inline-marrom">$1</span>')
        .replace(/\n/g, "<br>");
}
function getValorEditavelAmeaca(ameaca, campo, fallback = "") {
    const instancia = getAmeacaAtivaMestreSelecionada();
    if (instancia && instancia.ameacaId === ameaca.id && instancia.edicao && campo in instancia.edicao) {
        return instancia.edicao[campo];
    }
    return fallback;
}
function agendarSyncInstanciaAmeacaSelecionada(wait = 700) {
    const instancia = getAmeacaAtivaMestreSelecionada();
    if (!instancia) return;

    const mesaId = String(state.mestre?.mesaId || "").trim();
    if (!mesaId) return;

    if (window.T20Supabase?.agendarSyncAmeacaMestre) {
        window.T20Supabase.agendarSyncAmeacaMestre({
            mesaId,
            ameaca: instancia,
            wait
        });
    }
}
function updateAmeacaSelecionadaCampo(campo, valor) {
    const instancia = getAmeacaInstanciaEditavelSelecionada();
    if (!instancia) return;

    const camposNumero = [
        "pv", "pm", "defesa", "iniciativa", "percepcao", "fort", "ref", "von",
        "for", "des", "con", "int", "sab", "car"
    ];

    if (!instancia.edicao) instancia.edicao = {};

    if (campo === "pm" && String(valor).trim() === "") {
        instancia.edicao[campo] = "";
    } else if (camposNumero.includes(campo)) {
        instancia.edicao[campo] = Number(valor) || 0;
    } else {
        instancia.edicao[campo] = valor;
    }

    render();
    agendarSyncInstanciaAmeacaSelecionada();
}
function alterarAtributoAmeaca(campo, delta) {
    const instancia = getAmeacaInstanciaEditavelSelecionada();
    if (!instancia) return;

    if (!instancia.edicao) instancia.edicao = {};

    const atual = Number(instancia.edicao[campo] ?? instancia[campo] ?? 0) || 0;
    instancia.edicao[campo] = atual + delta;

    render();
    agendarSyncInstanciaAmeacaSelecionada();
}
function formatarPericiasAmeacaTexto(texto) {
    return escapeHtml(String(texto || "â€”")).replace(/,\s*/g, ",<br>");
}
function montarHtmlFichaAmeaca(ameaca) {
    if (!ameaca) {
        return `<div class="empty">AmeaÃ§a nÃ£o encontrada.</div>`;
    }

    const percepcao = extrairValorEComplementoAmeaca(ameaca.percepcao);
    const von = extrairValorEComplementoAmeaca(ameaca.von);

    return `
        <div class="ameaca-sheet-wrap">
            <div class="ameaca-sheet">
                <div class="ameaca-topo">
                    <div class="ameaca-titulo-wrap">
                        <input
                            class="ameaca-titulo ameaca-titulo-input"
                            type="text"
                            value="${escapeAttr(getValorEditavelAmeaca(ameaca, "nome", ameaca.nome || ""))}"
                            placeholder="Sem nome"
                            onchange="updateAmeacaSelecionadaCampo('nome', this.value)"
                        />
                    </div>
                    <div class="ameaca-nd-badge">ND ${escapeHtml(ameaca.nd || "-")}</div>
                </div>

                <div class="ameaca-subtipo">${escapeHtml(ameaca.tipo || "â€”")}</div>

                <div class="ameaca-layout">
                    <div class="ameaca-main">
                        <div class="ameaca-resumo-grid">
                            <div class="ameaca-info-pair">
                                <span class="ameaca-label">Pontos de Vida</span>
                                <input
                                    class="ameaca-box-input"
                                    type="number"
                                    value="${escapeAttr(getValorEditavelAmeaca(ameaca, "pv", Number(ameaca.pv ?? 0) || 0))}"
                                    onchange="updateAmeacaSelecionadaCampo('pv', this.value)"
                                />
                            </div>

                            ${ameaca.pm != null && String(ameaca.pm).trim() !== "" ? `
                                <div class="ameaca-info-pair">
                                    <span class="ameaca-label">Pontos de Mana</span>
                                    <input
                                        class="ameaca-box-input"
                                        type="number"
                                        value="${escapeAttr(getValorEditavelAmeaca(ameaca, "pm", ameaca.pm === "" || ameaca.pm == null ? "" : Number(ameaca.pm) || 0))}"
                                        onchange="updateAmeacaSelecionadaCampo('pm', this.value)"
                                    />
                                </div>
                            ` : ""}

                            <div class="ameaca-info-pair">
                                <span class="ameaca-label">Defesa</span>
                                <input
                                    class="ameaca-box-input"
                                    type="number"
                                    value="${escapeAttr(getValorEditavelAmeaca(ameaca, "defesa", Number(ameaca.defesa ?? 0) || 0))}"
                                    onchange="updateAmeacaSelecionadaCampo('defesa', this.value)"
                                />
                            </div>

                            <div class="ameaca-info-pair">
                                <span class="ameaca-label">Tamanho</span>
                                <input
                                    class="ameaca-box-input ameaca-box-input-text"
                                    type="text"
                                    value="${escapeAttr(getValorEditavelAmeaca(ameaca, "tamanho", ameaca.tamanho || ""))}"
                                    onchange="updateAmeacaSelecionadaCampo('tamanho', this.value)"
                                />
                            </div>

                            <div class="ameaca-info-pair ameaca-info-pair--wide">
                                <span class="ameaca-label">Deslocamento</span>
                                <input
                                    class="ameaca-box-input ameaca-box-input-text ameaca-box-input-wide"
                                    type="text"
                                    value="${escapeAttr(getValorEditavelAmeaca(ameaca, "deslocamento", ameaca.deslocamento || ""))}"
                                    onchange="updateAmeacaSelecionadaCampo('deslocamento', this.value)"
                                />
                            </div>
                        </div>

                        <div class="ameaca-atributos">
                            ${renderAtributoAmeaca("FOR", "for", ameaca.for)}
                            ${renderAtributoAmeaca("DES", "des", ameaca.des)}
                            ${renderAtributoAmeaca("CON", "con", ameaca.con)}
                            ${renderAtributoAmeaca("INT", "int", ameaca.int)}
                            ${renderAtributoAmeaca("SAB", "sab", ameaca.sab)}
                            ${renderAtributoAmeaca("CAR", "car", ameaca.car)}
                        </div>

                        ${renderSecaoTextoInlineEditavelAmeaca(
        "Poderes",
        "poderesTexto",
        getValorEditavelAmeaca(ameaca, "poderesTexto", formatarTextoEditavelListaAmeaca(ameaca.poderes)),
        "Clique para editar os poderes..."
    )}
${renderSecaoTextoInlineEditavelAmeaca(
        "Magias",
        "magiasTexto",
        getValorEditavelAmeaca(ameaca, "magiasTexto", formatarTextoEditavelListaAmeaca(ameaca.magias)),
        "Clique para editar as magias..."
    )}
${renderSecaoTextoInlineEditavelAmeaca(
        "Equipamento",
        "equipamentoTexto",
        getValorEditavelAmeaca(ameaca, "equipamentoTexto", ameaca.equipamento || ""),
        "Clique para editar o equipamento..."
    )}
${renderSecaoTextoInlineEditavelAmeaca(
        "Tesouro",
        "tesouroTexto",
        getValorEditavelAmeaca(ameaca, "tesouroTexto", ameaca.tesouro || ""),
        "Clique para editar o tesouro..."
    )}
                    </div>

                    <aside class="ameaca-side">
                        <div class="ameaca-side-linha">
                            <span class="ameaca-label">Iniciativa</span>
                            <input
                                class="ameaca-box-input ameaca-box-input-side"
                                type="number"
                                value="${escapeAttr(getValorEditavelAmeaca(ameaca, "iniciativa", Number(ameaca.iniciativa ?? 0) || 0))}"
                                onchange="updateAmeacaSelecionadaCampo('iniciativa', this.value)"
                            />
                        </div>

                        <div class="ameaca-side-linha">
                            <span class="ameaca-label">PercepÃ§Ã£o</span>
                            <input
                                class="ameaca-box-input ameaca-box-input-side"
                                type="number"
                                value="${escapeAttr(getValorEditavelAmeaca(ameaca, "percepcao", Number(percepcao.valor || 0) || 0))}"
                                onchange="updateAmeacaSelecionadaCampo('percepcao', this.value)"
                            />
                        </div>

                        <div class="ameaca-side-extra">
                        ${renderTextoInlineEditavelLateralAmeaca(
        "percepcaoComplemento",
        getValorEditavelAmeaca(ameaca, "percepcaoComplemento", percepcao.complemento || ""),
        "Clique para editar o complemento de PercepÃ§Ã£o."
    )}
                    </div>

                        <div class="ameaca-side-linha">
                            <span class="ameaca-label">Fort</span>
                            <input
                                class="ameaca-box-input ameaca-box-input-side"
                                type="number"
                                value="${escapeAttr(getValorEditavelAmeaca(ameaca, "fort", Number(ameaca.fort ?? 0) || 0))}"
                                onchange="updateAmeacaSelecionadaCampo('fort', this.value)"
                            />
                        </div>

                        <div class="ameaca-side-linha">
                            <span class="ameaca-label">Ref</span>
                            <input
                                class="ameaca-box-input ameaca-box-input-side"
                                type="number"
                                value="${escapeAttr(getValorEditavelAmeaca(ameaca, "ref", Number(ameaca.ref ?? 0) || 0))}"
                                onchange="updateAmeacaSelecionadaCampo('ref', this.value)"
                            />
                        </div>

                        <div class="ameaca-side-linha">
                            <span class="ameaca-label">Von</span>
                            <input
                                class="ameaca-box-input ameaca-box-input-side"
                                type="number"
                                value="${escapeAttr(getValorEditavelAmeaca(ameaca, "von", Number(von.valor || 0) || 0))}"
                                onchange="updateAmeacaSelecionadaCampo('von', this.value)"
                            />
                        </div>

                        <div class="ameaca-side-extra">
                        ${renderTextoInlineEditavelLateralAmeaca(
        "vonComplemento",
        getValorEditavelAmeaca(ameaca, "vonComplemento", von.complemento || ""),
        "Clique para editar o complemento de Von."
    )}
                    </div>

                      <div class="ameaca-side-bloco">
                        <div class="ameaca-label">PerÃ­cias</div>
                        <div class="ameaca-side-texto">
                            ${renderTextoInlineEditavelLateralAmeaca(
        "pericias",
        getValorEditavelAmeaca(ameaca, "pericias", ameaca.pericias || ""),
        "Clique para editar as perÃ­cias."
    )}
                        </div>
                    </div>
                    </aside>
                </div>
            </div>
        </div>
    `;
}
function renderAtributoAmeaca(sigla, campo, valor) {
    const valorAtual = getValorEditavelAmeaca(
        { id: getAmeacaAtivaMestreSelecionada()?.ameacaId || "" },
        campo,
        Number(valor ?? 0) || 0
    );

    return `
        <div class="ameaca-attr">
            <div class="ameaca-attr-top">${escapeHtml(sigla)}</div>
            <div class="ameaca-attr-controls">
                <button type="button" class="ameaca-attr-btn" onclick="alterarAtributoAmeaca('${campo}', 1)">+</button>
                <input
                    type="number"
                    class="ameaca-attr-input"
                    value="${escapeAttr(valorAtual)}"
                    onchange="updateAmeacaSelecionadaCampo('${campo}', this.value)"
                />
                <button type="button" class="ameaca-attr-btn" onclick="alterarAtributoAmeaca('${campo}', -1)">-</button>
            </div>
        </div>
    `;
}

function renderSecaoListaAmeaca(titulo, itens) {
    const lista = Array.isArray(itens) ? itens : [];

    return `
        <section class="ameaca-secao">
            <div class="ameaca-secao-titulo">${escapeHtml(titulo)}</div>
            <div class="ameaca-secao-corpo">
                ${lista.length
            ? lista.map(formatarLinhaHabilidadeAmeaca).join("")
            : `<div class="ameaca-texto-vazio">...</div>`}
            </div>
        </section>
    `;
}

function renderSecaoTextoAmeaca(titulo, texto) {
    return `
        <section class="ameaca-secao">
            <div class="ameaca-secao-titulo">${escapeHtml(titulo)}</div>
            <div class="ameaca-secao-corpo">
                ${String(texto || "").trim()
            ? escapeHtml(texto)
            : `<div class="ameaca-texto-vazio">...</div>`}
            </div>
        </section>
    `;
}
function montarHtmlViewerMestre() {
    const fichaSelecionada = getFichaMestreSelecionada();
    const ameacaSelecionada = getAmeacaAtivaMestreSelecionada();

    const htmlFichaJogador = fichaSelecionada
        ? montarHtmlFichaMestre()
        : `<div class="empty">Nenhuma ficha ativa selecionada.</div>`;

    const htmlFichaAmeaca = ameacaSelecionada
        ? montarHtmlFichaAmeaca(getAmeacaCompletaPorId(ameacaSelecionada.ameacaId))
        : `<div class="empty">Nenhuma ameaÃ§a ativa selecionada.</div>`;

    return `
      <div class="mestre-dual-view">
        <section class="mestre-view-pane">
          <div class="mestre-view-pane-header">
            <div class="list-item-title">Ficha ativa</div>
          </div>
          <div class="mestre-view-pane-body">
            <div class="mestre-scale-wrap">
              <div class="mestre-scale-inner mestre-scale-jogador">
                ${htmlFichaJogador}
              </div>
            </div>
          </div>
        </section>

        <section class="mestre-view-pane">
          <div class="mestre-view-pane-header">
            <div class="list-item-title">AmeaÃ§a ativa</div>
          </div>
          <div class="mestre-view-pane-body">
            <div class="mestre-scale-wrap">
              <div class="mestre-scale-inner mestre-scale-ameaca">
                ${htmlFichaAmeaca}
              </div>
            </div>
          </div>
        </section>
      </div>
    `;
}
function abrirModalNpcAleatorio() {
    if (!state.mestre?.mesaId) {
        alert("Selecione uma mesa antes de criar um NPC.");
        return;
    }

    state.modal = "npc_aleatorio";
    state.modalPayload = {
        racaId: "",
        classeId: "",
        nivel: 1
    };
    document.body.classList.add("modal-open");
    render();
}

function fecharModalNpcAleatorio() {
    if (state.modal === "npc_aleatorio") {
        state.modal = null;
        state.modalPayload = null;
        document.body.classList.remove("modal-open");
        render();
        return;
    }

    if (typeof fecharModal === "function") {
        fecharModal();
        return;
    }

    state.modal = null;
    state.modalPayload = null;
    document.body.classList.remove("modal-open");
    render();
}
function renderNpcAleatorioModal() {
    if (state.modal !== "npc_aleatorio") return "";

    const payload = state.modalPayload || {};
    const racas = (RACAS_DB || []).filter(r => r?.id);
    const classes = (CLASSES_DB || []).filter(c => c?.id);

    return `
      <div class="overlay mf-add-habilidade-overlay" onclick="fecharModalNpcAleatorio()">
        <div class="overlay-card mf-add-habilidade-modal mf-mestre-npc-modal" onclick="event.stopPropagation()">
          <div class="overlay-header mf-add-habilidade-header">
            <div>
              <div class="overlay-title">Criar NPC aleatÃ³rio</div>
              <div class="overlay-subtitle">Escolha raÃ§a, classe e nÃ­vel.</div>
            </div>

            <div class="mf-mestre-modal-actions">
              <button class="mf-add-habilidade-btn mf-add-habilidade-btn-fechar" type="button" onclick="fecharModalNpcAleatorio()">Cancelar</button>
              <button class="mf-add-habilidade-btn mf-add-habilidade-btn-manual" type="button" onclick="confirmarCriacaoNpcAleatorio()">Criar</button>
            </div>
          </div>

          <div class="overlay-body mf-add-habilidade-body mf-mestre-npc-body">
            <div class="t20-divider"></div>

            <div class="mf-mestre-npc-fields">
            <div class="field mf-add-habilidade-field">
              <label>RaÃ§a</label>
              <select onchange="state.modalPayload.racaId=this.value">
                <option value="">AleatÃ³ria</option>
                ${racas.map(r => `
                  <option value="${escapeAttr(r.id)}" ${payload.racaId === r.id ? "selected" : ""}>
                    ${escapeHtml(r.nome)}
                  </option>
                `).join("")}
              </select>
            </div>

            <div class="field mf-add-habilidade-field">
              <label>Classe</label>
              <select onchange="state.modalPayload.classeId=this.value">
                <option value="">AleatÃ³ria</option>
                ${classes.map(c => `
                  <option value="${escapeAttr(c.id)}" ${payload.classeId === c.id ? "selected" : ""}>
                    ${escapeHtml(c.nome)}
                  </option>
                `).join("")}
              </select>
            </div>

            <div class="field mf-add-habilidade-field">
              <label>NÃ­vel</label>
              <input
                type="number"
                min="1"
                max="20"
                value="${escapeAttr(payload.nivel || 1)}"
                onchange="state.modalPayload.nivel=Math.max(1, Math.min(20, Number(this.value)||1))"
              >
            </div>
            </div>
          </div>
        </div>
      </div>
    `;
}
function criarFichaBaseNpc() {
    const ficha = fichaVazia();
    ficha.nome = `NPC ${Math.floor(Math.random() * 900 + 100)}`;
    ficha.jogador = "Mestre";
    ficha.onlineAtivaMesaId = "";
    return ficha;
}
function distribuirAtributosNpcAleatorio(ficha, nivel) {
    const atributos = [
        "forcaBase",
        "destrezaBase",
        "constituicaoBase",
        "inteligenciaBase",
        "sabedoriaBase",
        "carismaBase"
    ];

    atributos.forEach(ch => {
        ficha[ch] = 0;
    });

    const pontos = 6 + Math.max(0, Math.floor((Number(nivel) - 1) / 2));

    for (let i = 0; i < pontos; i++) {
        const chave = escolherAleatorio(atributos);
        ficha[chave] = Number(ficha[chave] || 0) + 1;
    }
}

function aplicarBonusRaciaisNpc(ficha, raca) {
    const bonus = raca?.atributosFixos || {};

    if (!ficha.modRacialAtributos) {
        ficha.modRacialAtributos = {
            forca: 0,
            destreza: 0,
            constituicao: 0,
            inteligencia: 0,
            sabedoria: 0,
            carisma: 0
        };
    }

    Object.keys(ficha.modRacialAtributos).forEach(ch => {
        ficha.modRacialAtributos[ch] = Number(bonus[ch]) || 0;
    });
}
function aplicarRacaNpcNaFicha(ficha, raca) {
    if (!ficha || !raca) return;

    ficha.raca = raca.nome || "";
    ficha.racaId = raca.id || "";
    ficha.tamanho = raca.tamanho || "";
    ficha.deslocamento = raca.deslocamento || "";

    if (!ficha.modRacialAtributos) {
        ficha.modRacialAtributos = {
            forca: 0,
            destreza: 0,
            constituicao: 0,
            inteligencia: 0,
            sabedoria: 0,
            carisma: 0
        };
    }

    const bonus = raca.atributosFixos || {};
    Object.keys(ficha.modRacialAtributos).forEach(ch => {
        ficha.modRacialAtributos[ch] = Number(bonus[ch]) || 0;
    });

    (raca.proficiencias || []).forEach(nome => {
        adicionarProficienciaNaFicha(ficha, nome);
    });

    (raca.habilidades || []).forEach(habilidade => {
        adicionarHabilidadeNaFicha(
            ficha,
            {
                nome: habilidade.nome || "",
                descricao: habilidade.descricao || "",
                custoPm: Number(habilidade.custoPm) || 0,
                custoVida: Number(habilidade.custoVida) || 0,
                custoPmPermanente: Number(habilidade.custoPmPermanente) || 0,
                custoVidaPermanente: Number(habilidade.custoVidaPermanente) || 0,
                resumoUso: habilidade.resumoUso || "",
                incrementos: habilidade.incrementos || [],
                escolhas: habilidade.escolhas || []
            },
            "RaÃ§a",
            raca.nome || ""
        );
    });
}

function escolherOrigemAleatoriaNpc() {
    return escolherAleatorio((ORIGENS_DB || []).filter(o => o?.id));
}

function aplicarOrigemNpcNaFicha(ficha, origem) {
    if (!ficha || !origem) return;

    ficha.origem = origem.nome || "";
    ficha.origemId = origem.id || "";
    ficha.escolhasOrigemResolvidas = [];

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

    escolhas.forEach(escolha => {
        const opcoes = getOpcoesEscolhaOrigem(escolha, ficha)
            .filter(opcao => !opcaoPericiaIndisponivelNaOrigem(opcao, ficha));

        const quantidade = Math.min(getQuantidadeEscolhaOrigem(escolha), opcoes.length);
        const sorteadas = embaralharLista(opcoes).slice(0, quantidade);

        ficha.escolhasOrigemResolvidas.push({
            escolhaId: escolha.id,
            selecionadas: sorteadas
        });

        sorteadas.forEach(opcao => {
            if (opcao.tipoAplicacao === "pericia_treinada") {
                aplicarTreinoPericiaNaFicha(ficha, opcao.valor, "Origem", origem.nome);
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
                }
            }

            if (opcao.tipoAplicacao === "origem_item_banco_adicionar") {
                adicionarItemInventarioNaFicha(ficha, opcao.itemBaseId);
            }

            if (opcao.tipoAplicacao === "origem_item_custom_adicionar") {
                adicionarItemCustomNaFicha(ficha, opcao.valor, "Item escolhido da origem.");
            }

            if (opcao.tipoAplicacao === "origem_habilidade_adicionar") {
                const habilidade =
                    (origem.habilidades || []).find(h => String(h.id) === String(opcao.habilidadeOrigemId)) ||
                    (ORIGENS_HABILIDADES_DB || []).find(h => String(h.id) === String(opcao.habilidadeOrigemId));

                if (habilidade) {
                    adicionarHabilidadeOrigemNaFicha(ficha, habilidade, origem.nome);

                    (ORIGENS_EFEITOS_DB || [])
                        .filter(e => String(e.habilidade_id || "") === String(habilidade.id))
                        .forEach(efeito => aplicarEfeitoNaFicha(ficha, efeito, "Origem", origem.nome));
                }
            }
        });
    });
}

function escolherDivindadeAleatoriaNpc() {
    return escolherAleatorio((DIVINDADES_DB || []).filter(d => d?.id));
}
function getNpcsLocaisDaMesaMestre() {
    const mesaId = String(state.mestre?.mesaId || "");
    return (state.fichas || [])
        .filter(f => f?.npcLocal === true && String(f?.npcMesaId || "") === mesaId)
        .map(f => ({
            id: `npc_local:${f.id}`,
            tipo: "npc_local",
            ficha: f,
            nome: f.nome || "NPC",
            ficha_json: f
        }));
}

function getListaFichasMestreComNpcs() {
    const remotas = (state.mestre?.fichas || []).map(item => ({
        ...item,
        tipo: "remota"
    }));

    return [...remotas, ...getNpcsLocaisDaMesaMestre()];
}
function aplicarDivindadeNpcNaFicha(ficha, divindade) {
    if (!ficha || !divindade) return;

    ficha.divindade = divindade.nome || "";
    ficha.divindadeId = divindade.id || "";
    ficha.divindadeDados = divindade;
    ficha.divindadePoderEscolhido = "";
}

function gerarPericiasAleatoriasNpc(ficha, classe) {
    if (!ficha || !classe) return;

    const nomesClasse = parseListaPipe(classe.periciasClasseTexto || "");
    const quantidadeBase = Math.max(2, Number(classe.periciasBase) || 0);
    const porInteligencia = Math.max(0, Number(getAtributoFinal(ficha, "inteligencia")) || 0);
    const total = Math.min(nomesClasse.length, quantidadeBase + porInteligencia);

    const embaralhadas = embaralharLista(nomesClasse).slice(0, total);
    embaralhadas.forEach(nome => {
        aplicarTreinoPericiaNaFicha(ficha, nome, "Classe", classe.nome);
    });
}
function getPoderesAleatoriosDisponiveisParaClasse(ficha, classe) {
    const poderesClasse = (classe?.poderes || [])
        .map(montarOpcaoDeRegistroBanco)
        .filter(Boolean);

    const poderesGerais = filtrarForaPoderesConcedidos(
        buscarPoderesPorFiltroFlexivel
            ? buscarPoderesPorFiltroFlexivel("poder_geral")
            : buscarPoderesPorFiltro("poder_geral")
    )
        .map(montarOpcaoDeRegistroBanco)
        .filter(Boolean);

    const todos = [...poderesClasse, ...poderesGerais];
    const vistos = new Set();

    return todos.filter(op => {
        const chave = String(op.registroId || op.valor || op.id || "");
        if (!chave || vistos.has(chave)) return false;
        vistos.add(chave);
        return !getPreRequisitoNaoAtendidoOpcao(op, ficha);
    });
}
function adicionarPoderAleatorioNaFicha(ficha, opcao) {
    if (!ficha || !opcao) return false;

    const registroId = String(opcao.registroId || "");
    const registro = registroId ? getRegistroPoderMagiaPorId(registroId) : null;
    if (!registro) return false;

    if (!Array.isArray(ficha.habilidades)) ficha.habilidades = [];
    if (!Array.isArray(ficha.poderes)) ficha.poderes = [];

    const nome = registro.nome || opcao.nomeCurto || opcao.valor || opcao.label || "Poder";

    const jaExiste = ficha.habilidades.some(h =>
        normalizarTextoRegra(h?.nome || "") === normalizarTextoRegra(nome)
    );
    if (jaExiste) return false;

    adicionarHabilidadeNaFicha(
        ficha,
        {
            nome: registro.nome || "",
            descricao: registro.descricao || "",
            custoPm: Number(registro.custoPm) || 0,
            custoVida: Number(registro.custoVida) || 0,
            custoPmPermanente: Number(registro.custoPmPermanente) || 0,
            custoVidaPermanente: Number(registro.custoVidaPermanente) || 0,
            resumoUso: registro.resumoUso || "",
            registroId: registro.id || "",
            tipoRegistro: registro.tipoRegistro || "",
            filtros: registro.filtros || "",
            ativavel: false,
            permiteIntensificar: false,
            incrementos: getIncrementosPoderMagia(registro.id),
            escolhas: []
        },
        "Poder",
        "NPC AleatÃ³rio"
    );

    ficha.poderes.push({
        nome,
        origem: "aleatorio",
        registroId: registro.id || ""
    });

    return true;
}

function gerarPoderesAleatoriosNpc(ficha, classe, nivel) {
    const quantidade = Math.max(1, Math.floor((Number(nivel) + 1) / 2));
    let pool = getPoderesAleatoriosDisponiveisParaClasse(ficha, classe);
    pool = embaralharLista(pool);

    let adicionados = 0;

    for (const opcao of pool) {
        if (adicionados >= quantidade) break;
        if (adicionarPoderAleatorioNaFicha(ficha, opcao)) {
            adicionados++;
        }
    }
}
function getCirculoMaximoNpcPorNivel(nivel) {
    const n = Math.max(1, Number(nivel) || 1);
    if (n >= 17) return 5;
    if (n >= 13) return 4;
    if (n >= 9) return 3;
    if (n >= 5) return 2;
    return 1;
}

function getPrefixoMagiaDaClasse(classe) {
    const tipo = normalizarTextoRegra(classe?.tipoMagia || "");

    if (tipo.includes("arcana")) return "magia_arcana";
    if (tipo.includes("divina")) return "magia_divina";
    return "";
}

function adicionarMagiaAleatoriaNaFicha(ficha, opcao) {
    if (!ficha || !opcao) return false;
    if (!Array.isArray(ficha.magias)) ficha.magias = [];

    const nome = opcao.nomeCurto || opcao.valor || opcao.label || "Magia";

    if (ficha.magias.some(m => normalizarTextoRegra((m?.nome || m || "")) === normalizarTextoRegra(nome))) {
        return false;
    }

    ficha.magias.push({
        nome,
        registroId: opcao.registroId || ""
    });

    return true;
}

function gerarMagiasAleatoriasNpc(ficha, classe, nivel) {
    if (!classe || Number(classe.usaMagia) !== 1) return;

    const prefixo = getPrefixoMagiaDaClasse(classe);
    if (!prefixo) return;

    const circuloMax = getCirculoMaximoNpcPorNivel(nivel);
    const opcoes = embaralharLista(getOpcoesMagiasAteOCirculo(prefixo, circuloMax));
    const quantidade = Math.max(2, Math.min(8, Math.floor(Number(nivel) / 2) + 2));

    let adicionadas = 0;

    for (const opcao of opcoes) {
        if (adicionadas >= quantidade) break;
        if (adicionarMagiaAleatoriaNaFicha(ficha, opcao)) {
            adicionadas++;
        }
    }
}
function getItensBancoNpc() {
    return Array.isArray(ITENS_EQUIPAMENTOS_DB?.registros)
        ? ITENS_EQUIPAMENTOS_DB.registros
        : [];
}

function filtrarItensPorCategoria(textosCategoria = []) {
    const termos = textosCategoria.map(t => normalizarTextoRegra(t));

    return getItensBancoNpc().filter(item => {
        const texto = normalizarTextoRegra([
            item.nome,
            item.tipo,
            item.categoria,
            item.grupo,
            item.subtipo
        ].filter(Boolean).join(" "));

        return termos.some(t => texto.includes(t));
    });
}

function adicionarItemBancoNaFicha(ficha, itemBase, quantidade = 1) {
    if (!ficha || !itemBase) return false;

    if (!Array.isArray(ficha.inventario)) ficha.inventario = [];
    if (!Array.isArray(ficha.equipamentos)) ficha.equipamentos = [];

    const entrada = criarEntradaInventario(itemBase.id);
    if (!entrada) return false;

    entrada.quantidade = Number(quantidade) || Number(entrada.quantidade) || 1;

    const existente = encontrarItemEmpilhavelNoInventario
        ? encontrarItemEmpilhavelNoInventario(ficha, entrada)
        : null;

    if (existente) {
        existente.quantidade = (Number(existente.quantidade) || 1) + (Number(entrada.quantidade) || 1);
    } else {
        ficha.inventario.push(entrada);
    }

    return true;
}

function gerarItensAleatoriosNpc(ficha, classe, nivel) {
    const armas = filtrarItensPorCategoria(["arma"]);
    const armaduras = filtrarItensPorCategoria(["armadura", "escudo"]);
    const utilitarios = filtrarItensPorCategoria(["poÃ§Ã£o", "kit", "ferramenta", "item"]);

    const armaValida = embaralharLista(armas).find(item =>
        !item.proficienciaNecessaria || fichaTemProficiencia(ficha, item.proficienciaNecessaria)
    );
    if (armaValida) adicionarItemBancoNaFicha(ficha, armaValida, 1);

    const armaduraValida = embaralharLista(armaduras).find(item =>
        !item.proficienciaNecessaria || fichaTemProficiencia(ficha, item.proficienciaNecessaria)
    );
    if (armaduraValida && Number(nivel) >= 2) adicionarItemBancoNaFicha(ficha, armaduraValida, 1);

    const qtdUtilitarios = Math.max(1, Math.min(3, Math.floor(Number(nivel) / 4) + 1));
    const poolUtil = embaralharLista(utilitarios);

    let adicionados = 0;
    for (const item of poolUtil) {
        if (adicionados >= qtdUtilitarios) break;
        if (adicionarItemBancoNaFicha(ficha, item, 1)) {
            adicionados++;
        }
    }
}
async function confirmarCriacaoNpcAleatorio() {
    try {
        if (!state.mestre?.mesaId) {
            alert("Selecione uma mesa antes de criar um NPC.");
            return;
        }
        await carregarTodosOsBancos();

        const payload = state.modalPayload || {};
        const nivel = Math.max(1, Math.min(20, Number(payload.nivel) || 1));

        const raca = payload.racaId
            ? (RACAS_DB || []).find(r => String(r.id) === String(payload.racaId))
            : escolherAleatorio((RACAS_DB || []).filter(r => r?.id));

        const classe = payload.classeId
            ? (CLASSES_DB || []).find(c => String(c.id) === String(payload.classeId))
            : escolherAleatorio((CLASSES_DB || []).filter(c => c?.id));

        if (!raca || !classe) {
            alert("NÃ£o foi possÃ­vel determinar a raÃ§a e a classe do NPC.");
            return;
        }

        const ficha = criarFichaBaseNpc();

        ficha.npcLocal = true;
        ficha.npcMesaId = state.mestre?.mesaId || "";

        distribuirAtributosNpcAleatorio(ficha, nivel);
        aplicarRacaNpcNaFicha(ficha, raca);

        ficha.classesPersonagem = [{
            classeId: classe.id,
            nome: classe.nome || "",
            niveis: nivel,
            primeiraClasse: true
        }];

        atualizarNivelTotalFicha(ficha);
        reaplicarProgressaoClasses(ficha);

        const origem = escolherOrigemAleatoriaNpc();
        if (origem) {
            aplicarOrigemNpcNaFicha(ficha, origem);
        }

        const divindade = escolherDivindadeAleatoriaNpc();
        if (divindade) {
            aplicarDivindadeNpcNaFicha(ficha, divindade);
        }

        gerarPericiasAleatoriasNpc(ficha, classe);
        gerarPoderesAleatoriosNpc(ficha, classe, nivel);
        gerarMagiasAleatoriasNpc(ficha, classe, nivel);
        gerarItensAleatoriosNpc(ficha, classe, nivel);

        atualizarNivelTotalFicha(ficha);
        reaplicarProgressaoClasses(ficha);

        if (typeof atualizarCdMagiasNaFicha === "function") {
            atualizarCdMagiasNaFicha(ficha, true);
        }

        if (typeof recalcularEquipamentosEFicha === "function") {
            recalcularEquipamentosEFicha(ficha);
        }

        ficha.pvAtual = ficha.pvMax || ficha.pvAtual || 0;
        ficha.pmAtual = ficha.pmMax || ficha.pmAtual || 0;

        state.fichas.unshift(ficha);
        state.fichaAtualId = ficha.id;
        state.mestre.fichaSelecionadaId = `npc_local:${ficha.id}`;

        saveFichas();
        fecharModalNpcAleatorio();
        render();
    } catch (err) {
        console.error(err);
        alert(err?.message || "NÃ£o foi possÃ­vel criar o NPC aleatÃ³rio.");
    }
}
function getFichaAtual() {
    const renderizandoRemotaNoMestre = !!state?.mestre?.renderizandoFichaRemota;

    if (state.screen === "mestre" || renderizandoRemotaNoMestre) {
        const selecionada = getFichaMestreSelecionada();
        if (!selecionada) return null;

        if (selecionada.tipo === "npc_local") {
            return selecionada.ficha;
        }

        return selecionada?.ficha_json || null;
    }

    return state.fichas.find(f => f.id === state.fichaAtualId);
}
async function excluirNpcLocalMestre(fichaId) {
    const npc = (state.fichas || []).find(
        f => String(f.id) === String(fichaId) && f?.npcLocal === true
    );
    if (!npc) return;

    const ok = confirm(`Excluir o NPC "${npc.nome || "NPC"}"?`);
    if (!ok) return;

    const idRemovido = String(fichaId);

    state.fichas = (state.fichas || []).filter(f => String(f.id) !== idRemovido);

    if (String(state.fichaAtualId || "") === idRemovido) {
        state.fichaAtualId = null;
    }

    if (String(state.mestre.fichaSelecionadaId || "") === `npc_local:${idRemovido}`) {
        state.mestre.fichaSelecionadaId = "";
    }

    const listaRestante = getListaFichasMestreComNpcs();
    if (!state.mestre.fichaSelecionadaId && listaRestante.length) {
        state.mestre.fichaSelecionadaId = listaRestante[0].id;
    }

    render();

    try {
        await excluirImagensPersonagemDaFicha(npc);
        await window.T20Supabase?.excluirFichaPorLocalId(idRemovido);
    } catch (err) {
        console.error("Erro ao excluir NPC no Supabase:", err);
        alert("O NPC foi removido da tela, mas houve um erro ao excluÃ­-lo do servidor. Tente novamente.");
    }
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
    ficha.habilidades = (ficha.habilidades || []).filter(h => h.origem !== "Classe");
    ficha.magias = (ficha.magias || []).filter(m => m.origem !== "Classe");
    ficha.efeitosAplicados = (ficha.efeitosAplicados || []).filter(e => e.origemTipo !== "Classe");

    ficha.proficiencias = [];

    ficha.pericias.forEach(p => {
        p.outrosPoder = 0;
    });
    reconstruirTreinosPericiaDaFicha(ficha);
    garantirAumentosPorAtributo(ficha);
    Object.keys(ficha.aumentosPorAtributo).forEach(chave => {
        ficha.aumentosPorAtributo[chave] = 0;
    });
    ficha.arcanistaCaminho = "";
    ficha.pvMax = 0;
    ficha.pvAtual = 0;
    ficha.pmMax = 0;
    ficha.pmAtual = 0;
    ficha.atributoChaveMagias = "";
    ficha.cdMagias = 0;
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
    if (!ficha?.classesPersonagem?.length) return "â€”";

    return ficha.classesPersonagem
        .map(c => `${c.nome} ${c.niveis}`)
        .join(", ");
}

function abrirModalClassesFichaMobile() {
    state.modal = "classes_ficha_mobile";
    state.modalPayload = {};
    render();
}

function renderModalClassesFichaMobile() {
    if (state.modal !== "classes_ficha_mobile") return "";

    const ficha = getFichaAtual();
    if (!ficha) return "";

    const classes = Array.isArray(ficha.classesPersonagem) ? ficha.classesPersonagem : [];
    const nivelTotal = getNivelTotalPersonagem(ficha);

    setTimeout(() => {
        document.body.classList.add("modal-open");
    }, 0);

    return `
      <div class="overlay mf-add-habilidade-overlay" onclick="fecharModal()">
        <div class="overlay-card mf-add-habilidade-modal mf-magia-detail-modal mf-status-compact-modal mf-status-classes-modal" onclick="event.stopPropagation()">
          <div class="overlay-header mf-add-habilidade-header">
            <div>
              <div class="overlay-title">Classes</div>
              <div class="subtitle">Nivel total: ${escapeHtml(String(nivelTotal))}</div>
            </div>
            <button class="mf-add-habilidade-btn mf-add-habilidade-btn-fechar" onclick="fecharModal()">Fechar</button>
          </div>

          <div class="overlay-body mf-add-habilidade-body mf-magia-detail-body">
            <div class="t20-divider"></div>

            <div class="mf-magia-detail-scroll">
              <div class="mf-magia-detail-card">
                <div class="mf-magia-detail-card-title">Classes e niveis</div>
                ${classes.length
                    ? `<div class="mf-detail-kv">
                        ${classes.map(classe => renderLinhaDetalheMobile(
                            classe.nome || "Sem classe",
                            `Nivel ${Number(classe.niveis) || 0}`
                        )).join("")}
                      </div>`
                    : `<div class="mf-magia-detail-vazio">Nenhuma classe cadastrada.</div>`
                }
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
}

function getRegistroClasse(ficha, classeId) {
    return ficha?.classesPersonagem?.find(c => c.classeId === classeId) || null;
}
function fichaTemHabilidadeOuPoderPorNome(ficha, nome) {
    const alvo = normalizarTextoRegra(nome || "");
    if (!alvo) return false;

    const habilidades = Array.isArray(ficha?.habilidades) ? ficha.habilidades : [];

    if (habilidades.some(h => normalizarTextoRegra(h?.nome || "") === alvo)) {
        return true;
    }

    const escolhasResolvidas = Array.isArray(ficha?.escolhasClasseResolvidas) ? ficha.escolhasClasseResolvidas : [];
    return escolhasResolvidas.some(bloco =>
        Array.isArray(bloco?.selecionadas) &&
        bloco.selecionadas.some(item =>
            normalizarTextoRegra(item?.valor || item?.nomeCurto || "") === alvo
        )
    );
}

function getNivelInventorDaFicha(ficha) {
    const registro = getRegistroClasse(ficha, "inventor");
    return Number(registro?.niveis) || 0;
}

function inventorTemAlquimistaIniciado(ficha) {
    return fichaTemHabilidadeOuPoderPorNome(ficha, PODERES_INVENTOR_FORMULAS.alquimistaIniciado);
}

function inventorTemMestreAlquimista(ficha) {
    return fichaTemHabilidadeOuPoderPorNome(ficha, PODERES_INVENTOR_FORMULAS.mestreAlquimista);
}

function getCirculoMaximoFormulaInventor(ficha, nivelInventor) {
    const n = Number(nivelInventor) || 0;
    const temMestre = inventorTemMestreAlquimista(ficha);

    if (n >= 18 && temMestre) return 5;
    if (n >= 14 && temMestre) return 4;
    if (n >= 10 && temMestre) return 3;
    if (n >= 6) return 2;
    if (n >= 1) return 1;
    return 0;
}

function getQuantidadeFormulasInventorNoNivel(nivelInventor) {
    const n = Number(nivelInventor) || 0;
    if (n <= 0) return 0;
    if (n === 1) return 3;
    return 1;
}

function getOpcoesFormulasInventorAteOCirculo(circuloMaximo, ficha) {
    const max = Math.max(1, Number(circuloMaximo) || 1);
    const registros = [];
    const vistos = new Set();

    for (let c = 1; c <= max; c++) {
        [
            `magia_arcana_${c}`,
            `magia_divina_${c}`,
            `magia_universal_${c}`
        ].forEach(filtro => {
            buscarMagiasPorFiltro(filtro).forEach(registro => {
                const chave = String(registro?.id || registro?.nome || "");
                if (!chave || vistos.has(chave)) return;
                vistos.add(chave);
                registros.push(registro);
            });
        });
    }

    const filtradas = filtrarForaMagiasJaConhecidas(registros, ficha);

    return filtradas
        .sort((a, b) => String(a.nome || "").localeCompare(String(b.nome || ""), "pt-BR"))
        .map(registro => {
            const opcao = montarOpcaoDeRegistroBanco(registro);
            if (!opcao) return null;

            return {
                ...opcao,
                id: `formula_inventor:${registro.id}`,
                tipoAplicacao: "magia_adicionar",
                label: `FÃ³rmula: ${registro.nome}`,
                valor: registro.nome,
                registroId: registro.id,
                origemEspecial: "inventor_formula",
                tipoMagiaInventor: "formula"
            };
        })
        .filter(Boolean);
}

function criarEscolhaFormulasInventor(classe, nivelClasse, ficha) {
    if (normalizarTextoRegra(classe?.id || "") !== "inventor") return null;
    if (!inventorTemAlquimistaIniciado(ficha)) return null;

    const quantidade = getQuantidadeFormulasInventorNoNivel(nivelClasse);
    if (!quantidade) return null;

    const circuloMaximo = getCirculoMaximoFormulaInventor(ficha, nivelClasse);
    if (!circuloMaximo) return null;

    return {
        id: `inventor_formulas_nivel_${nivelClasse}`,
        habilidade_id: "",
        tipo: "magia",
        titulo: "FÃ³rmulas do Inventor",
        descricao: `Escolha ${quantidade} fÃ³rmula(s) de atÃ© ${circuloMaximo}Âº cÃ­rculo.`,
        quantidade,
        filtro: `inventor_formulas_${circuloMaximo}`,
        opcoesTexto: "",
        regrasGrupo: "",
        dependeDe: "",
        classeIdOrigem: classe.id,
        circuloMaximoInventor: circuloMaximo,
        origemEspecial: "inventor_formula"
    };
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
        const jaTemDivindade = !!String(fichaContexto?.divindade || "").trim();

        if (escolha.filtro === "divindade_classe" && jaTemDivindade) {
            return false;
        }
        return true;
    });

    const escolhasInternas = getEscolhasInternasDeHabilidadesClasseNoNivel(classe, nivelClasse);
    const escolhasMagias = getEscolhasMagiasPorHabilidadeClasse(classe, nivelClasse, fichaContexto);

    const extras = [];
    const escolhaFormulaInventor = criarEscolhaFormulasInventor(classe, nivelClasse, fichaContexto);
    if (escolhaFormulaInventor) {
        extras.push(escolhaFormulaInventor);
    }

    return [...escolhasDaClasse, ...escolhasInternas, ...escolhasMagias, ...extras];
}

function getEscolhasInternasDeHabilidadesClasseNoNivel(classe, nivelClasse) {
    const habilidadesDoNivel = getHabilidadesClasseDisponiveisNoNivel(classe, nivelClasse);

    const escolhasInternas = [];

    habilidadesDoNivel.forEach(h => {
        // se a prÃ³pria habilidade jÃ¡ trouxer escolhas internas
        if (Array.isArray(h.escolhas) && h.escolhas.length) {
            h.escolhas.forEach(e => {
                escolhasInternas.push({
                    ...e,
                    id: e.id || `${h.id}-escolha-${uid()}`,
                    habilidade_id: h.id
                });
            });
        }

        // se o registro da habilidade existir no banco geral, reaproveita escolhas de lÃ¡
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
            // Para Arcanista, sÃ³ a habilidade "Magias" gera a escolha.
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
            const circulo = getCirculoMaximoPorClasseNoContexto(ficha, classe.id) || 1;
            filtroMagia = `magia_arcana_${circulo}`;

            if (nivelClasse === 1) {
                quantidade = 2;
            } else if (nivelClasse % 2 === 0) {
                quantidade = 1;
            } else {
                quantidade = 0;
            }
        } else if (nomeClasse === "clerigo") {
            const circulo = getCirculoMaximoPorClasseNoContexto(ficha, classe.id) || 1;
            filtroMagia = `magia_divina_${circulo}`;
            quantidade = (nivelClasse === 1) ? 3 : 1;
        } else if (nomeClasse === "druida") {
            filtroMagia = "magia_druida_repertorio";

            if (nivelClasse === 1) {
                quantidade = 2;
            } else if (nivelClasse % 2 === 0) {
                quantidade = 1;
            } else {
                quantidade = 0;
            }
        } else if (nomeClasse === "arcanista") {
            const circulo = getCirculoMaximoPorClasseNoContexto(ficha, classe.id) || 1;
            filtroMagia = `magia_arcana_${circulo}`;

            if (nivelClasse === 1) {
                quantidade = 3;
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
                descricao: `Selecione ${quantidade} magia(s) disponÃ­veis para este nÃ­vel.`,
                quantidade,
                filtro: filtroMagia,
                usarMagiasAteCirculo: true,
                classeIdOrigem: classe.id,
                opcoesTexto: "",
                regrasGrupo: "",
                dependeDe:
                    nomeClasse === "bardo" && nivelClasse === 1
                        ? "esc_bardo_escolas"
                        : nomeClasse === "druida" && nivelClasse === 1
                            ? "esc_druida_escolas"
                            : "",
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
                aplicarTreinoPericiaNaFicha(ficha, opcao.valor, "Classe", classe.nome);
            }

            if (opcao.tipoAplicacao === "proficiencia_adicionar") {
                adicionarProficienciaNaFicha(ficha, opcao.valor);
            }

            if (opcao.tipoAplicacao === "magia_adicionar") {
                adicionarOuAtualizarMagiaNaFicha(
                    ficha,
                    {
                        registroId: opcao.registroId || "",
                        nome: opcao.valor || "",
                        nomeAdicionado: opcao.nomeAdicionado || "",
                        tipoMagiaInventor: opcao.tipoMagiaInventor || "",
                        origemEspecial: opcao.origemEspecial || ""
                    },
                    "Classe",
                    classe.nome
                );

                const magiaAdicionada = (ficha.magias || []).find(m =>
                    normalizarTextoRegra(m?.nome || "") === normalizarTextoRegra(opcao.valor || "")
                );

                if (magiaAdicionada && opcao.origemEspecial === "inventor_formula") {
                    magiaAdicionada.tipoMagiaInventor = "formula";
                    magiaAdicionada.prefixoExibicao = "FÃ³rmula";
                }

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
                if (classe.id === "bardo" && registro.escolhaId === "esc_bardo_escolas") {
                    ficha.bardoEscolas = ficha.bardoEscolas || [];

                    const nomeEscola = String(opcao.valor || "").trim();
                    if (nomeEscola && !ficha.bardoEscolas.some(e =>
                        normalizarNomeEscolaMagia(e) === normalizarNomeEscolaMagia(nomeEscola)
                    )) {
                        ficha.bardoEscolas.push(nomeEscola);
                    }

                    ficha.efeitosAplicados.push({
                        id: uid(),
                        origemTipo: "Classe",
                        origemNome: classe.nome,
                        tipo: "escola_magia",
                        alvo: opcao.valor
                    });
                }
            }

            if (opcao.tipoAplicacao === "habilidade_adicionar") {
                if (opcao.escolhaEspecial === "golpe_pessoal") {
                    const registroGolpe = criarRegistroGolpePessoalParaFicha(opcao);

                    adicionarHabilidadeNaFicha(
                        ficha,
                        {
                            nome: registroGolpe.nome,
                            descricao: registroGolpe.descricao || "",
                            custoPm: Number(registroGolpe.custoPm) || 0,
                            custoVida: 0,
                            custoPmPermanente: 0,
                            custoVidaPermanente: 0,
                            resumoUso: registroGolpe.resumoUso || "",
                            registroId: "",
                            ativavel: true,
                            permiteIntensificar: false,
                            incrementos: [],
                            escolhas: [],
                            nomeCurto: registroGolpe.nomeCurto || registroGolpe.nome || "",
                            tipoRegistro: "poder",
                            origemBase: "classe",
                            filtros: registroGolpe.filtros || "",
                            escolhaEspecial: "golpe_pessoal",
                            escolhaEspecialValor: registroGolpe.escolhaEspecialValor || "",
                            golpePessoalConfig: registroGolpe.golpePessoalConfig || null
                        },
                        "Classe",
                        classe.nome
                    );

                    const habilidadeAdicionada = ficha.habilidades?.[ficha.habilidades.length - 1];
                    if (habilidadeAdicionada) {
                        habilidadeAdicionada.registroId = "";
                        habilidadeAdicionada.idPersonalizado = registroGolpe.id || "";
                        habilidadeAdicionada.nome = registroGolpe.nome || habilidadeAdicionada.nome || "";
                        habilidadeAdicionada.nomeCurto = registroGolpe.nomeCurto || registroGolpe.nome || "";
                        habilidadeAdicionada.descricao = registroGolpe.descricao || habilidadeAdicionada.descricao || "";
                        habilidadeAdicionada.custoPm = Number(registroGolpe.custoPm) || 0;
                        habilidadeAdicionada.custoVida = 0;
                        habilidadeAdicionada.custoPmPermanente = 0;
                        habilidadeAdicionada.custoVidaPermanente = 0;
                        habilidadeAdicionada.resumoUso = registroGolpe.resumoUso || "";
                        habilidadeAdicionada.ativavel = true;
                        habilidadeAdicionada.permiteIntensificar = false;
                        habilidadeAdicionada.incrementos = [];
                        habilidadeAdicionada.escolhas = [];
                        habilidadeAdicionada.tipoRegistro = "poder";
                        habilidadeAdicionada.origemBase = "classe";
                        habilidadeAdicionada.filtros = registroGolpe.filtros || "";
                        habilidadeAdicionada.escolhaEspecial = "golpe_pessoal";
                        habilidadeAdicionada.escolhaEspecialValor = registroGolpe.escolhaEspecialValor || "";
                        habilidadeAdicionada.golpePessoalConfig = registroGolpe.golpePessoalConfig || null;
                    }

                    ficha.efeitosAplicados.push({
                        id: uid(),
                        origemTipo: "Classe",
                        origemNome: classe.nome,
                        tipo: "habilidade_adicionar",
                        alvo: registroGolpe.nome || "Golpe Pessoal"
                    });

                    return;
                }

                let registroHabilidade = null;

                if (normalizarTextoRegra(opcao.origemBanco || "") === "geral") {
                    if (opcao.registroId) {
                        registroHabilidade = getRegistroPoderMagiaPorId(opcao.registroId);
                    }

                    if (!registroHabilidade && opcao.valor) {
                        registroHabilidade = getRegistroPoderPorNome(opcao.valor);
                    }
                } else {
                    if (opcao.registroId) {
                        registroHabilidade = getPoderClassePorId(classe.id, opcao.registroId);
                    }

                    if (!registroHabilidade && opcao.valor) {
                        registroHabilidade = getPoderClassePorNome(classe.id, opcao.valor);
                    }
                }

                const nomeHabilidade =
                    opcao.nomeCurto ||
                    registroHabilidade?.nome ||
                    opcao.valor ||
                    "";

                const ehEmpatiaSelvagem = normalizarNomeHabilidade(nomeHabilidade) === "empatia selvagem";
                const temEmpatiaRacial = fichaTemHabilidadeComOrigem(ficha, "Empatia Selvagem", "RaÃ§a");

                if (ehEmpatiaSelvagem && temEmpatiaRacial) {
                    aplicarBonusEmpatiaSelvagemDahllan(ficha, "Classe", classe.nome);
                } else {
                    adicionarHabilidadeNaFicha(
                        ficha,
                        {
                            nome: nomeHabilidade,
                            descricao: registroHabilidade?.descricao || `Escolhido na evoluÃ§Ã£o da classe ${classe.nome}.`,
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

                if (Array.isArray(opcao.escolhasResolvidas)) {
                    opcao.escolhasResolvidas.forEach(bloco => {
                        (bloco?.selecionadas || []).forEach(subopcao => {
                            const nomeBaseOpcao = normalizarTextoRegra(opcao.nomeCurto || opcao.valor || "");

                            if (nomeBaseOpcao === "foco em pericia" && opcao.escolhaEspecialValor) {
                                adicionarHabilidadeNaFicha(
                                    ficha,
                                    {
                                        nome: `Foco em PerÃ­cia: ${opcao.escolhaEspecialValor}`,
                                        descricao: opcao.descricao || "",
                                        custoPm: 0,
                                        custoVida: 0,
                                        custoPmPermanente: 0,
                                        custoVidaPermanente: 0,
                                        resumoUso: "",
                                        registroId: opcao.registroId || "",
                                        ativavel: false,
                                        permiteIntensificar: false,
                                        incrementos: [],
                                        escolhas: []
                                    },
                                    "Classe",
                                    classe.nome
                                );

                                ficha.efeitosAplicados.push({
                                    id: uid(),
                                    origemTipo: "Classe",
                                    origemNome: classe.nome,
                                    tipo: "habilidade_adicionar",
                                    alvo: `Foco em PerÃ­cia: ${opcao.escolhaEspecialValor}`
                                });
                            }

                            if (subopcao.tipoAplicacao === "magia_adicionar") {
                                adicionarOuAtualizarMagiaNaFicha(
                                    ficha,
                                    {
                                        registroId: subopcao.registroId || "",
                                        nome: subopcao.valor || "",
                                        nomeAdicionado: subopcao.nomeAdicionado || "",
                                        tipoMagiaInventor: subopcao.tipoMagiaInventor || "",
                                        origemEspecial: subopcao.origemEspecial || ""
                                    },
                                    "Classe",
                                    classe.nome
                                );

                                const magiaAdicionada = (ficha.magias || []).find(m =>
                                    normalizarTextoRegra(m?.nome || "") === normalizarTextoRegra(subopcao.valor || "")
                                );

                                if (magiaAdicionada && subopcao.origemEspecial === "inventor_formula") {
                                    magiaAdicionada.tipoMagiaInventor = "formula";
                                    magiaAdicionada.prefixoExibicao = "FÃ³rmula";
                                }

                                ficha.efeitosAplicados.push({
                                    id: uid(),
                                    origemTipo: "Classe",
                                    origemNome: classe.nome,
                                    tipo: "magia_adicionar",
                                    alvo: subopcao.valor
                                });
                            }

                            if (subopcao.tipoAplicacao === "pericia_treinada") {
                                aplicarTreinoPericiaNaFicha(ficha, subopcao.valor, "Classe", classe.nome);
                            }
                        });
                    });
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

            if (opcao.tipoAplicacao === "proficiencia_adicionar") {
                adicionarProficienciaNaFicha(ficha, opcao.valor);
            }
        });
    });

    return true;
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
    atualizarCdMagiasNaFicha(ficha, true);

    ficha.pvAtual = ficha.pvMax;
    ficha.pmAtual = ficha.pmMax;
}

function iniciarFluxoClasseCriacao() {
    if (!planoClassesCriacaoValido()) return;

    aplicarPlanoClassesNaFichaCriacao();
    sincronizarFichaTemporariaClassesCriacao();
    state.criacao.fluxoClasseAtivo = true;
    state.criacao.classeEvolucaoContexto = null;
    state.criacao.escolhaClasseAbertaId = null;
    render();
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
    state.criacao.poderClasseEscolhas = {};
    state.criacao.escolhaPoderClasseAbertaId = null;
    state.criacao.classeSelecaoEvolucaoId = classe.id;

    render();
}

function abrirSelecaoProximoNivelClasse() {
    state.criacao.classeEvolucaoContexto = null;
    state.criacao.classeEscolhas = {};
    state.criacao.escolhaClasseAbertaId = null;
    state.criacao.poderClasseEscolhas = {};
    state.criacao.escolhaPoderClasseAbertaId = null;
    render();
}

function getClasseEvolucaoAtualCriacao() {
    const ctx = state.criacao.classeEvolucaoContexto;
    if (!ctx) return null;
    return getClasseDoBanco(ctx.classeId);
}

function escolhaClasseNivelPreenchida(escolha) {
    const valores = getEscolhaClasseValores(escolha.id);
    const quantidade = Number(escolha.quantidade) || 0;

    if (valores.length !== quantidade) return false;

    return valores.every(item => {
        const precisaConfirmar =
            isGolpePessoalOpcao?.(item) ||
            (Array.isArray(item?.escolhas) && item.escolhas.length > 0);

        return !precisaConfirmar || !!item?.escolhasConfirmadas;
    });
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
        if (!escolhaClasseDesbloqueada(escolha, classe)) return false;
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
    state.evolucao.poderClasseEscolhas = {};
    state.evolucao.escolhaPoderClasseAbertaId = null;
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
        const removida = lista[idx];
        lista.splice(idx, 1);

        if (Array.isArray(removida?.escolhas)) {
            state.evolucao.poderClasseEscolhas = state.evolucao.poderClasseEscolhas || {};
            removida.escolhas.forEach(escolhaInterna => {
                delete state.evolucao.poderClasseEscolhas[String(escolhaInterna.id || "")];
            });

            if (removida.escolhas.some(e => String(e.id || "") === String(state.evolucao.escolhaPoderClasseAbertaId || ""))) {
                state.evolucao.escolhaPoderClasseAbertaId = null;
            }
        }

        const ctxGolpe = getGolpePessoalStateAtual();
        if (ctxGolpe?.golpePessoalModal && String(ctxGolpe.golpePessoalModal.opcaoId || "") === String(opcao.id || "")) {
            ctxGolpe.golpePessoalModal = null;
        }
    } else {
        if (!podeSelecionarOpcaoClasseEvolucao(escolha, opcao)) return;
        if (ehOpcaoPericiaOficioGenerico(opcao)) {
            const restante = Math.max(0, limite - lista.length);
            if (restante <= 0) return;
            abrirModalEspecializacoesOficioEscolha({
                targetState: "evolucao",
                escolhaKey: "classeEscolhas",
                escolhaId,
                opcaoBase: opcao,
                maximo: restante,
                titulo: "Escolha as especializaÃ§Ãµes de OfÃ­cio"
            });
            return;
        }
        if (limite > 0 && lista.length >= limite) return;

        lista.push(opcao);

        if (isGolpePessoalOpcao(opcao)) {
            state.evolucao.escolhaClasseAbertaId = escolhaId;
            state.evolucao.escolhaPoderClasseAbertaId = "__golpe_pessoal__";

            state.evolucao.golpePessoalModal = {
                escolhaClasseId: escolhaId,
                opcaoId: opcao?.id || "",
                config: JSON.parse(JSON.stringify(opcao?.golpePessoalConfig || criarConfigInicialGolpePessoal()))
            };

            render();
            return;
        }

        if (!opcao.ehAumentoAtributo && Array.isArray(opcao.escolhas) && opcao.escolhas.length > 0) {
            state.evolucao.poderClasseEscolhas = state.evolucao.poderClasseEscolhas || {};
            state.evolucao.escolhaPoderClasseAbertaId = String(opcao.escolhas[0].id || "");
        }
    }

    render();
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
        if (!escolhaClasseDesbloqueada(escolha, classe)) return false;
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

    const continuar = confirm("Subir mais nÃ­veis?");
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

const TELAS_QUE_EXIGEM_LOGIN = new Set(["personagens", "criacao", "evolucao", "ficha", "mestre"]);
const TELAS_COM_EDICAO_DE_FICHA = new Set(["ficha", "criacao", "evolucao", "mestre"]);

function usuarioLogado() {
    return !!window.T20Supabase?.SUPA?.state?.user;
}

function sessaoAuthVerificada() {
    return !!state.auth?.sessaoVerificada && !state.auth?.carregandoSessao;
}

function enviarParaAuth(modo = "login") {
    state.auth.modo = modo || "login";
    state.screen = "auth";
    render();
}

function go(screen) {
    if (TELAS_COM_EDICAO_DE_FICHA.has(state.screen)) {
        flushFichaAtualAgora();
    }

    if (state.screen === "criacao" && screen !== "criacao") {
        salvarRascunhoCriacao();
    }

    if (TELAS_QUE_EXIGEM_LOGIN.has(screen) && !usuarioLogado()) {
        enviarParaAuth("login");
        return;
    }

    state.screen = screen;

    if (screen === "mestre" && usuarioLogado()) {
        carregarMinhasMesasMestre();
    }

    if (
        (screen === "personagens" || screen === "ficha" || screen === "mestre") &&
        usuarioLogado() &&
        !state.fichasCarregadas &&
        !state.fichasCarregando
    ) {
        carregarFichasDoUsuario();
        return;
    }

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

async function excluirFicha(id) {
    const ok = confirm("Excluir esta ficha?");
    if (!ok) return;

    const fichaRemovida = state.fichas.find(f => String(f.id) === String(id)) || null;
    state.fichas = state.fichas.filter(f => f.id !== id);
    if (state.fichaAtualId === id) state.fichaAtualId = null;
    render();

    try {
        await excluirImagensPersonagemDaFicha(fichaRemovida);
        await window.T20Supabase?.excluirFichaPorLocalId(id);
    } catch (err) {
        console.error("Erro ao excluir ficha no Supabase:", err);
        alert("A ficha foi removida da tela, mas houve um erro ao excluÃ­-la do servidor. Tente novamente.");
    }
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
    if (valorAtual < 2) return 1;
    return valorAtual;
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
    const origemTipoNormalizada = normalizarTextoRegra(origemTipo || "RaÃ§a");

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
        origem: origemTipo || "RaÃ§a",
        origemDetalhe: origemNome || "",
        registroId: habilidade.registroId || "",
        tipoRegistro: habilidade.tipoRegistro || "",
        filtros: habilidade.filtros || "",
        origemBase: habilidade.origemBase || "",
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
    const jaTemFoco = new Set(
        (ficha?.habilidades || [])
            .map(h => String(h?.nome || ""))
            .filter(nome => normalizarTextoRegra(nome).startsWith("foco em arma:"))
            .map(nome => normalizarTextoRegra(nome.split(":").slice(1).join(":").trim()))
    );

    return (ITENS_EQUIPAMENTOS_DB.registros || [])
        .filter(item => String(item.categoria || "").toLowerCase() === "arma")
        .filter(item => String(item.nome || "").trim())
        .filter(item => {
            const prof = String(item.proficienciaNecessaria || "").trim();
            return !prof || fichaTemProficiencia(ficha, prof);
        })
        .filter(item => !jaTemFoco.has(normalizarTextoRegra(item.nome || "")))
        .sort((a, b) => String(a.nome || "").localeCompare(String(b.nome || ""), "pt-BR"));
}

function getMagiasElegiveisParaFoco(ficha) {
    const jaTemFoco = new Set(
        (ficha?.habilidades || [])
            .map(h => String(h?.nome || ""))
            .filter(nome => normalizarTextoRegra(nome).startsWith("foco em magia:"))
            .map(nome => normalizarTextoRegra(nome.split(":").slice(1).join(":").trim()))
    );

    return (ficha?.magias || [])
        .filter(m => String(m?.nome || "").trim())
        .reduce((acc, magia) => {
            const chave = normalizarTextoRegra(magia.nome);
            if (!acc.some(m => normalizarTextoRegra(m.nome) === chave)) {
                acc.push(magia);
            }
            return acc;
        }, [])
        .filter(magia => !jaTemFoco.has(normalizarTextoRegra(magia.nome || "")))
        .sort((a, b) => String(a.nome || "").localeCompare(String(b.nome || ""), "pt-BR"));
}
function getArmasElegiveisParaEspecializacao(ficha) {
    const jaTemEspecializacao = new Set(
        (ficha?.habilidades || [])
            .map(h => String(h?.nome || ""))
            .filter(nome => normalizarTextoRegra(nome).startsWith("especializacao em arma:"))
            .map(nome => normalizarTextoRegra(nome.split(":").slice(1).join(":").trim()))
    );

    return (ITENS_EQUIPAMENTOS_DB.registros || [])
        .filter(item => String(item.categoria || "").toLowerCase() === "arma")
        .filter(item => String(item.nome || "").trim())
        .filter(item => {
            const prof = String(item.proficienciaNecessaria || "").trim();
            return !prof || fichaTemProficiencia(ficha, prof);
        })
        .filter(item => !jaTemEspecializacao.has(normalizarTextoRegra(item.nome || "")))
        .sort((a, b) => String(a.nome || "").localeCompare(String(b.nome || ""), "pt-BR"));
}
function montarOpcoesEspecializacaoEmArma(opcaoBase, ficha) {
    return getArmasElegiveisParaEspecializacao(ficha).map(item => ({
        ...opcaoBase,
        id: `habilidade:${opcaoBase.registroId}:especializacao_arma:${item.id}`,
        label: `EspecializaÃ§Ã£o em Arma: ${item.nome}`,
        valor: `EspecializaÃ§Ã£o em Arma: ${item.nome}`,
        nomeCurto: `EspecializaÃ§Ã£o em Arma: ${item.nome}`,
        escolhaEspecial: "especializacao_em_arma",
        escolhaEspecialValor: item.nome,
        itemBaseId: item.id,
        preRequisitos: ""
    }));
}
function montarEscolhaEspecialPoderFocoEmArma(opcaoBase) {
    return [{
        id: `poder_especial:${opcaoBase.registroId}:foco_em_arma`,
        registro_id: String(opcaoBase.registroId || ""),
        ordem: 1,
        tipo: "foco_em_arma",
        titulo: "Escolha uma arma",
        descricao: "Escolha a arma para o poder Foco em Arma.",
        quantidade: 1,
        filtro: "especial",
        opcoesTexto: "",
        regrasGrupo: "",
        dependeDe: ""
    }];
}

function montarEscolhaEspecialPoderFocoEmMagia(opcaoBase) {
    return [{
        id: `poder_especial:${opcaoBase.registroId}:foco_em_magia`,
        registro_id: String(opcaoBase.registroId || ""),
        ordem: 1,
        tipo: "foco_em_magia",
        titulo: "Escolha uma magia",
        descricao: "Escolha a magia para o poder Foco em Magia.",
        quantidade: 1,
        filtro: "especial",
        opcoesTexto: "",
        regrasGrupo: "",
        dependeDe: ""
    }];
}
function getPericiasElegiveisParaFoco(ficha) {
    const jaTemFoco = new Set(
        (ficha?.habilidades || [])
            .map(h => String(h?.nome || ""))
            .filter(nome => normalizarTextoRegra(nome).startsWith("foco em pericia:"))
            .map(nome => normalizarTextoRegra(nome.split(":").slice(1).join(":").trim()))
    );

    const proibidas = new Set([
        "luta",
        "pontaria"
    ]);

    return (ficha?.pericias || [])
        .filter(p => String(p?.nome || "").trim())
        .filter(p => p?.treinada === true)
        .filter(p => !proibidas.has(normalizarTextoRegra(p.nome || "")))
        .filter(p => !jaTemFoco.has(normalizarTextoRegra(p.nome || "")))
        .sort((a, b) => String(a.nome || "").localeCompare(String(b.nome || ""), "pt-BR"));
}
function montarEscolhaEspecialPoderFocoEmPericia(opcaoBase) {
    return [{
        id: `poder_especial:${opcaoBase.registroId}:foco_em_pericia`,
        registro_id: String(opcaoBase.registroId || ""),
        ordem: 1,
        tipo: "foco_em_pericia",
        titulo: "Escolha uma perÃ­cia",
        descricao: "Escolha a perÃ­cia para o poder Foco em PerÃ­cia.",
        quantidade: 1,
        filtro: "especial",
        opcoesTexto: "",
        regrasGrupo: "",
        dependeDe: ""
    }];
}
function expandirOpcoesEspeciaisDePoder(opcoesBase, ficha) {
    const resultado = [];

    (opcoesBase || []).forEach(opcao => {
        const nome = normalizarTextoRegra(opcao?.nomeCurto || opcao?.valor || "");

        if (nome === "foco em arma") {
            resultado.push({
                ...opcao,
                preRequisitos: "",
                escolhas: montarEscolhaEspecialPoderFocoEmArma(opcao)
            });
            return;
        }

        if (nome === "especializacao em arma") {
            resultado.push(...montarOpcoesEspecializacaoEmArma(opcao, ficha));
            return;
        }

        if (nome === "foco em magia") {
            if (!getMagiasElegiveisParaFoco(ficha).length) {
                return;
            }

            resultado.push({
                ...opcao,
                preRequisitos: "",
                escolhas: montarEscolhaEspecialPoderFocoEmMagia(opcao)
            });
            return;
        }

        if (nome === "foco em pericia") {
            if (!getPericiasElegiveisParaFoco(ficha).length) {
                return;
            }

            resultado.push({
                ...opcao,
                preRequisitos: "",
                escolhas: montarEscolhaEspecialPoderFocoEmPericia(opcao)
            });
            return;
        }

        if (nome === "proficiencia") {
            resultado.push({
                ...opcao,
                escolhas: montarEscolhaEspecialPoderProficiencia(opcao, ficha)
            });
            return;
        }

        if (nome === "aumento de atributo") {
            const escolhaAtributo = (opcao.escolhas || []).find(e =>
                normalizarTextoRegra(e?.filtro || "") === "atributo_aumento"
            );

            if (escolhaAtributo) {
                [
                    "ForÃ§a",
                    "Destreza",
                    "ConstituiÃ§Ã£o",
                    "InteligÃªncia",
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
                        escolhas: [],
                        descricao: `${opcao.descricao || ""}\n\nAtributo escolhido: ${nomeAtributo}`.trim()
                    });
                });
                return;
            }
        }

        if (nome === "treinamento em pericia") {
            resultado.push({
                ...opcao,
                escolhas: montarEscolhaEspecialPoderTreinamentoPericia(opcao, ficha)
            });
            return;
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
function getOpcoesMagiasAteOCirculo(prefixo, circuloMaximo) {
    const max = Math.max(1, Number(circuloMaximo) || 1);
    const registros = [];

    for (let c = 1; c <= max; c++) {
        registros.push(...buscarMagiasPorFiltro(`${prefixo}_${c}`));

        if (prefixo === "magia_arcana" || prefixo === "magia_divina") {
            registros.push(...buscarMagiasPorFiltro(`magia_universal_${c}`));
        }
    }

    const vistos = new Set();

    return registros
        .filter(registro => {
            const chave = String(registro?.id || registro?.nome || "");
            if (!chave || vistos.has(chave)) return false;
            vistos.add(chave);
            return true;
        })
        .map(montarOpcaoDeRegistroBanco)
        .filter(Boolean);
}
function montarOpcaoPericiaBonus(nomePericia, valor = 2) {
    return {
        id: `pericia:${nomePericia}:bonus`,
        tipoAplicacao: "pericia_bonus",
        label: `BÃ´nus em perÃ­cia: ${nomePericia} (+${valor})`,
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
            return a.indexOriginal - b.indexOriginal; // mantÃ©m ordem original dentro do grupo
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
                    return getPericiasExpandidas(ficha, false).map(p => ({
                        id: `pericia:${p.nome}`,
                        tipoAplicacao: "pericia_treinada",
                        label: `PerÃ­cia: ${p.nome}`,
                        valor: p.nome
                    }));
                }

                return [{
                    id: `pericia:${nome}`,
                    tipoAplicacao: "pericia_treinada",
                    label: `PerÃ­cia: ${nome}`,
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

        // EXCEÃ‡ÃƒO: AmnÃ©sico
        if (escolha.filtro === "origem_amnesico_mestre") {
            const pericias = getPericiasExpandidas(ficha, false).map(pericia => ({
                id: `pericia:${pericia.nome}`,
                tipoAplicacao: "pericia_treinada",
                label: `PerÃ­cia: ${pericia.nome}`,
                valor: pericia.nome
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
                label: "Poder Ãºnico: Criar novo",
                valor: "Poder Ãºnico personalizado",
                nomeCurto: "Criar novo",
                descricao: "NÃ£o aplica efeitos na ficha, use-os na hora de jogar."
            };

            return [...pericias, ...finalizarOpcoesPoderesOrigem(poderes, ficha), ...poderesUnicos, criarNovo];
        }

        // Origem custom
        if (escolha.filtro === "origem_custom_misto") {
            const pericias = getPericiasExpandidas(ficha, false).map(pericia => ({
                id: `pericia:${pericia.nome}`,
                tipoAplicacao: "pericia_treinada",
                label: `PerÃ­cia: ${pericia.nome}`,
                valor: pericia.nome
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
                        label: "Poder Ãºnico: Criar novo",
                        valor: "Poder Ãºnico personalizado",
                        nomeCurto: "Criar novo",
                        descricao: "NÃ£o aplica efeitos na ficha, use-os na hora de jogar."
                    }];
                }

                const habilidade = (ORIGENS_HABILIDADES_DB || []).find(h =>
                    normalizarTextoRegra(h.nome || "") === normalizarTextoRegra(nome)
                );

                if (!habilidade) return [];
                return [montarOpcaoPoderUnicoOrigem(habilidade)];
            });

            return [...pericias, ...finalizarOpcoesPoderesOrigem(poderes, ficha), ...poderesUnicos];
        }
    }

    return [];
}
function getOpcoesEscolha(escolha, ficha) {
    if (!escolha) return [];

    if (escolha.tipo === "pericia_treinada") {
        let opcoes = [];

        if (escolha.filtro === "todas") {
            opcoes = getPericiasExpandidas(ficha, false).map(p => p.nome);
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

        return opcoes.map(nome => {
            const opcao = {
                id: `pericia:${nome}`,
                tipoAplicacao: "pericia_treinada",
                label: `PerÃ­cia: ${nome}`,
                valor: nome
            };

            const bloqueada = opcaoPericiaIndisponivelPorTreinoGlobal(opcao, escolha.id, "classe");

            return {
                ...opcao,
                preRequisitos: bloqueada ? "PerÃ­cia jÃ¡ treinada" : "",
                escolhaBloqueada: bloqueada
            };
        });
    }

    if (escolha.tipo === "proficiencia") {
        const opcoes = (escolha.opcoesTexto || "")
            .split("|")
            .map(v => v.trim())
            .filter(Boolean);

        return opcoes.map(nome => {
            const jaPossui = fichaTemProficiencia(ficha, nome);

            return {
                id: `proficiencia:${nome}`,
                tipoAplicacao: "proficiencia_adicionar",
                label: `ProficiÃªncia: ${nome}`,
                valor: nome,
                preRequisitos: jaPossui ? "ProficiÃªncia jÃ¡ conhecida" : "",
                escolhaBloqueada: jaPossui
            };
        });
    }
    if (escolha.tipo === "foco_em_arma") {
        return getArmasElegiveisParaFoco(ficha).map(item => ({
            id: `foco_arma:${item.id}`,
            tipoAplicacao: "foco_em_arma_definir",
            label: `Foco em Arma: ${item.nome}`,
            valor: `Foco em Arma: ${item.nome}`,
            nomeCurto: `Foco em Arma: ${item.nome}`,
            escolhaEspecial: "foco_em_arma",
            escolhaEspecialValor: item.nome,
            itemBaseId: item.id,
            preRequisitos: ""
        }));
    }

    if (escolha.tipo === "foco_em_magia") {
        return getMagiasElegiveisParaFoco(ficha).map(magia => ({
            id: `foco_magia:${normalizarTextoRegra(magia.nome)}`,
            tipoAplicacao: "foco_em_magia_definir",
            label: `Foco em Magia: ${magia.nome}`,
            valor: `Foco em Magia: ${magia.nome}`,
            nomeCurto: `Foco em Magia: ${magia.nome}`,
            escolhaEspecial: "foco_em_magia",
            escolhaEspecialValor: magia.nome,
            magiaNome: magia.nome,
            preRequisitos: ""
        }));
    }
    if (escolha.tipo === "foco_em_pericia") {
        return getPericiasElegiveisParaFoco(ficha).map(pericia => ({
            id: `foco_pericia:${normalizarTextoRegra(pericia.nome)}`,
            tipoAplicacao: "foco_em_pericia_definir",
            label: `Foco em PerÃ­cia: ${pericia.nome}`,
            valor: `Foco em PerÃ­cia: ${pericia.nome}`,
            nomeCurto: `Foco em PerÃ­cia: ${pericia.nome}`,
            escolhaEspecial: "foco_em_pericia",
            escolhaEspecialValor: pericia.nome,
            periciaNome: pericia.nome,
            preRequisitos: ""
        }));
    }
    if (escolha.tipo === "magia") {
        if (escolha.filtro === "magia_bardo_repertorio") {
            return getMagiasBardoAumentarRepertorio(ficha);
        }
        if (escolha.filtro === "magia_druida_repertorio") {
            return getMagiasDruidaNoContexto(ficha);
        }
        if (escolha.filtro === "magia_druida_segredos") {
            return getMagiasDruidaSegredosNatureza(ficha);
        }
        if (escolha.filtro === "magia_arcanista_conhecimento") {
            return getMagiasArcanistaConhecimentoMagico(ficha);
        }
        if (escolha.filtro === "magia_clerigo_conhecimento") {
            return getMagiasClerigoConhecimentoMagico(ficha);
        }
        if (/^inventor_formulas_\d+$/.test(String(escolha.filtro || ""))) {
            const circulo = Number(String(escolha.filtro || "").match(/\d+$/)?.[0]) || 1;
            return getOpcoesFormulasInventorAteOCirculo(circulo, ficha);
        }
        if (escolha.filtro && escolha.filtro !== "lista") {
            const filtros = normalizarListaFiltros(escolha.filtro);
            let registros = [];

            if (escolha.usarMagiasAteCirculo) {
                const circuloMaximo = getCirculoMaximoPorClasseNoContexto(ficha, escolha.classeIdOrigem) || 1;

                filtros.forEach(filtroBase => {
                    const filtro = String(filtroBase || "").trim();

                    if (filtro.startsWith("magia_divina_")) {
                        registros.push(...getOpcoesMagiasAteOCirculo("magia_divina", circuloMaximo)
                            .map(op => getRegistroPoderMagiaPorId(op.registroId))
                            .filter(Boolean));
                        return;
                    }

                    if (filtro.startsWith("magia_arcana_")) {
                        registros.push(...getOpcoesMagiasAteOCirculo("magia_arcana", circuloMaximo)
                            .map(op => getRegistroPoderMagiaPorId(op.registroId))
                            .filter(Boolean));
                        return;
                    }

                    if (filtro.startsWith("magia_universal_")) {
                        registros.push(...getOpcoesMagiasAteOCirculo("magia_universal", circuloMaximo)
                            .map(op => getRegistroPoderMagiaPorId(op.registroId))
                            .filter(Boolean));
                        return;
                    }

                    registros.push(...buscarMagiasPorFiltro(filtro));
                });
            } else {
                const filtrosExpandidos = [];

                filtros.forEach(filtroBase => {
                    const filtro = String(filtroBase || "").trim();

                    filtrosExpandidos.push(filtro);

                    if (filtro.startsWith("magia_arcana_")) {
                        filtrosExpandidos.push(filtro.replace(/^magia_arcana_/, "magia_universal_"));
                    }

                    if (filtro.startsWith("magia_divina_")) {
                        filtrosExpandidos.push(filtro.replace(/^magia_divina_/, "magia_universal_"));
                    }
                });

                registros = filtrosExpandidos.flatMap(filtro => buscarMagiasPorFiltro(filtro));
            }

            const unicos = registros.reduce((acc, registro) => {
                if (!acc.some(r => String(r.id) === String(registro.id))) {
                    acc.push(registro);
                }
                return acc;
            }, []);

            let registrosFiltrados = filtrarForaMagiasJaConhecidas(unicos, ficha);

            if (normalizarTextoRegra(escolha.classeIdOrigem || "") === "bardo") {
                registrosFiltrados = filtrarMagiasPorEscolasDoBardo(registrosFiltrados, ficha);
            }

            return registrosFiltrados
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

            const poderesClasseExpandido = expandirOpcoesEspeciaisDePoder(poderesClasseBase, ficha);
            const poderesClasse = poderesClasseExpandido.length ? poderesClasseExpandido : poderesClasseBase;

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
            const pericias = getPericiasExpandidas(ficha, false).map(pericia => ({
                id: `pericia:${pericia.nome}`,
                tipoAplicacao: "pericia_treinada",
                label: `PerÃ­cia: ${pericia.nome}`,
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

            return [...pericias, ...poderes];
        }

        if (escolha.filtro === "pericia_ou_poder_ou_habilidade_racial") {
            const pericias = getPericiasExpandidas(ficha, false).map(pericia => ({
                id: `pericia:${pericia.nome}`,
                tipoAplicacao: "pericia_treinada",
                label: `PerÃ­cia: ${pericia.nome}`,
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
                "ForÃ§a",
                "Destreza",
                "ConstituiÃ§Ã£o",
                "InteligÃªncia",
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
    const listaEscolha = document.querySelector(".overlay .mf-raca-escolha-lista, .overlay .mf-classe-escolha-lista, .overlay .mf-origem-escolha-lista");
    const listaEscolhaScrollTop = listaEscolha ? listaEscolha.scrollTop : 0;
    const windowScrollY = window.scrollY;

    render();

    requestAnimationFrame(() => {
        const novoOverlayBody = document.querySelector(".overlay .overlay-body");
        if (novoOverlayBody) {
            novoOverlayBody.scrollTop = overlayScrollTop;
        }

        const novaListaEscolha = document.querySelector(".overlay .mf-raca-escolha-lista, .overlay .mf-classe-escolha-lista, .overlay .mf-origem-escolha-lista");
        if (novaListaEscolha) {
            novaListaEscolha.scrollTop = listaEscolhaScrollTop;
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
        if (ehOpcaoPericiaOficioGenerico(opcao)) {
            const restante = Math.max(0, (Number(quantidadeMaxima) || 0) - lista.length);
            if (restante <= 0) return;
            abrirModalEspecializacoesOficioEscolha({
                targetState: "criacao",
                escolhaKey: "racaEscolhas",
                escolhaId,
                opcaoBase: opcao,
                maximo: restante,
                titulo: "Escolha as especializaÃ§Ãµes de OfÃ­cio"
            });
            return;
        }
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
        const removida = lista[idx];
        lista.splice(idx, 1);

        if (Array.isArray(removida?.escolhas)) {
            state.criacao.poderClasseEscolhas = state.criacao.poderClasseEscolhas || {};
            removida.escolhas.forEach(escolhaInterna => {
                delete state.criacao.poderClasseEscolhas[String(escolhaInterna.id || "")];
            });

            if (removida.escolhas.some(e => String(e.id || "") === String(state.criacao.escolhaPoderClasseAbertaId || ""))) {
                state.criacao.escolhaPoderClasseAbertaId = null;
            }
        }
    } else {
        if (opcaoPericiaIndisponivelNaOrigem(opcao, ficha)) return;
        if (ehOpcaoPericiaOficioGenerico(opcao)) {
            const restante = Math.max(0, limite - lista.length);
            if (restante <= 0) return;
            abrirModalEspecializacoesOficioEscolha({
                targetState: "criacao",
                escolhaKey: "origemEscolhas",
                escolhaId,
                opcaoBase: opcao,
                maximo: restante,
                titulo: "Escolha as especializaÃ§Ãµes de OfÃ­cio"
            });
            return;
        }
        if (limite > 0 && lista.length >= limite) return;
        lista.push(opcao);

        if (!opcao.ehAumentoAtributo && Array.isArray(opcao.escolhas) && opcao.escolhas.length > 0) {
            state.criacao.poderClasseEscolhas = state.criacao.poderClasseEscolhas || {};
            state.criacao.escolhaPoderClasseAbertaId = String(opcao.escolhas[0].id || "");
        }
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
        const checked = selecionados.some(item => item.id === opcao.id) || opcaoGenericaOficioTemEspecializacaoSelecionada(selecionados, opcao);
        return checked || podeSelecionarOpcaoRacial(escolha, opcao);
    });

    setTimeout(() => {
        document.body.classList.add("modal-open");
    }, 0);

    return `
    <div class="overlay mf-add-habilidade-overlay" onclick="fecharEscolhaCriacao()">
      <div class="overlay-card mf-add-habilidade-modal mf-raca-escolha-modal" onclick="event.stopPropagation()">
        <div class="overlay-header mf-add-habilidade-header">
          <div>
            <div class="overlay-title">${escapeHtml(escolha.titulo || "Escolha")}</div>
            <div class="subtitle">
              ${escapeHtml(escolha.descricao || "")}
              ${escolha.descricao ? " &bull; " : ""}
              Selecionados: ${selecionados.length} / ${quantidade}
            </div>
          </div>
          <button class="mf-add-habilidade-btn mf-add-habilidade-btn-fechar" onclick="fecharEscolhaCriacao()">Fechar</button>
        </div>

        <div class="overlay-body mf-add-habilidade-body mf-raca-escolha-body">
          <div class="t20-divider"></div>

          <div class="mf-add-habilidade-lista mf-raca-escolha-lista">
            <div class="mf-add-habilidade-lista-head mf-raca-escolha-lista-head">
              <div>Op&ccedil;&atilde;o</div>
              <div>Escolha</div>
            </div>

            ${opcoes.map(opcao => {
        const checked = selecionados.some(item => item.id === opcao.id) || opcaoGenericaOficioTemEspecializacaoSelecionada(selecionados, opcao);
        const disabled = !checked && !podeSelecionarOpcaoRacial(escolha, opcao);
        const expandida = opcaoEscolhaEstaExpandida("raca", escolha.id, opcao.id);
        const titulo = getTituloOpcaoEscolha(opcao);
        const descricao = String(opcao.descricao || "").trim();
        const preReqFaltando =
            escolha.tipo === "magia" && opcao?.tipoAplicacao === "magia_adicionar"
                ? ""
                : getPreRequisitoNaoAtendidoOpcao(opcao, f);

        return `
              <div class="mf-add-habilidade-row mf-raca-escolha-row ${disabled ? "disabled" : ""}">
                <button
                  type="button"
                  class="mf-raca-escolha-main"
                  onclick="toggleExpansaoOpcaoEscolha('raca', '${escapeAttr(escolha.id)}', '${escapeAttr(opcao.id)}')"
                >
                  <div class="mf-raca-escolha-info">
                    <div>
                      <div class="mf-add-habilidade-nome">${escapeHtml(titulo)}</div>
                      ${preReqFaltando ? `<div class="mf-add-habilidade-origem">Pr&eacute;-requisito: ${escapeHtml(preReqFaltando)}</div>` : ``}
                    </div>
                    <div class="mf-raca-escolha-toggle">${expandida ? "&#9650;" : "&#9660;"}</div>
                  </div>

                  ${expandida && descricao ? `<div class="mf-raca-escolha-descricao">${escapeHtml(descricao)}</div>` : ``}
                </button>

                <div class="mf-raca-escolha-check-cell">
                  <input
                    class="choice-checkbox mf-raca-escolha-checkbox"
                    type="checkbox"
                    ${checked ? "checked" : ""}
                    ${disabled ? "disabled" : ""}
                    onclick="event.stopPropagation()"
                    onchange='toggleEscolhaRacialValor("${escapeAttr(escolha.id)}", ${JSON.stringify(opcao).replace(/'/g, "&apos;")}, ${quantidade})'
                  >
                </div>
              </div>
            `;
    }).join("")}
          </div>
        </div>
      </div>
      ${renderModalEspecializacoesOficioFicha()}
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
        .replace(/^(PerÃ­cia|Magia|Poder de classe|Poder da Tormenta|Poder|Habilidade|ProficiÃªncia|Substituir por|BÃ´nus em perÃ­cia):\s*/i, "")
        .trim();
}

function getChaveComparacaoOpcaoEscolha(opcao) {
    return String(opcao?.id || opcao?.registroId || opcao?.valor || opcao?.nomeCurto || opcao?.label || "");
}

function preservarSelecionadosEmOpcoesEscolha(opcoes, selecionados) {
    const lista = Array.isArray(opcoes) ? [...opcoes] : [];
    const vistos = new Set(lista.map(getChaveComparacaoOpcaoEscolha).filter(Boolean));

    (selecionados || []).forEach(opcao => {
        const chave = getChaveComparacaoOpcaoEscolha(opcao);
        if (!chave || vistos.has(chave)) return;
        lista.unshift(opcao);
        vistos.add(chave);
    });

    return lista;
}

function escolhaRacialPreenchida(escolha) {
    const valores = getEscolhaRacialValores(escolha.id);
    const quantidade = Number(escolha.quantidade) || 0;

    if (valores.length !== quantidade) return false;

    return valores.every(item => {
        const precisaConfirmar =
            Array.isArray(item?.escolhas) && item.escolhas.length > 0;

        return !precisaConfirmar || !!item?.escolhasConfirmadas;
    });
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

        const todasConfirmadas = selecionadas.every(opcao => {
            const precisaConfirmar =
                Array.isArray(opcao?.escolhas) && opcao.escolhas.length > 0;

            return !precisaConfirmar || !!opcao?.escolhasConfirmadas;
        });

        if (!todasConfirmadas) {
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
                    origemTipo: "RaÃ§a",
                    origemNome: raca.nome,
                    tipo: "pericia_bonus",
                    alvo: opcao.valor,
                    valor: Number(opcao.bonus) || 2
                });
            }

            if (opcao.tipoAplicacao === "pericia_treinada") {
                aplicarTreinoPericiaNaFicha(ficha, opcao.valor, "RaÃ§a", raca.nome);
            }

            if (opcao.tipoAplicacao === "proficiencia_adicionar") {
                adicionarProficienciaNaFicha(ficha, opcao.valor);

                ficha.efeitosAplicados.push({
                    id: uid(),
                    origemTipo: "RaÃ§a",
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
                    "RaÃ§a",
                    raca.nome
                );

                ficha.efeitosAplicados.push({
                    id: uid(),
                    origemTipo: "RaÃ§a",
                    origemNome: raca.nome,
                    tipo: "magia_adicionar",
                    alvo: opcao.valor
                });
            }

            if (opcao.tipoAplicacao === "habilidade_adicionar") {
                adicionarHabilidadeNaFicha(
                    ficha,
                    {
                        nome: opcao.nomeCurto || opcao.valor || "",
                        descricao: opcao.descricao || "",
                        custoPm: Number(opcao.custoPm) || 0,
                        custoVida: Number(opcao.custoVida) || 0,
                        custoPmPermanente: Number(opcao.custoPmPermanente) || 0,
                        custoVidaPermanente: Number(opcao.custoVidaPermanente) || 0,
                        resumoUso: opcao.resumoUso || "",
                        registroId: opcao.registroId || "",
                        ativavel: !!opcao.ativavel,
                        permiteIntensificar: !!opcao.permiteIntensificar,
                        incrementos: Array.isArray(opcao.incrementos) ? opcao.incrementos : [],
                        escolhas: Array.isArray(opcao.escolhas) ? opcao.escolhas : []
                    },
                    "RaÃ§a",
                    raca.nome
                );

                ficha.efeitosAplicados.push({
                    id: uid(),
                    origemTipo: "RaÃ§a",
                    origemNome: raca.nome,
                    tipo: "habilidade_adicionar",
                    alvo: opcao.nomeCurto || opcao.valor || ""
                });
            }

            if (Array.isArray(opcao.escolhasResolvidas)) {
                opcao.escolhasResolvidas.forEach(bloco => {
                    (bloco?.selecionadas || []).forEach(subopcao => {
                        if (subopcao.tipoAplicacao === "pericia_treinada") {
                            aplicarTreinoPericiaNaFicha(ficha, subopcao.valor, "RaÃ§a", raca.nome);
                        }

                        if (subopcao.tipoAplicacao === "magia_adicionar") {
                            adicionarOuAtualizarMagiaNaFicha(
                                ficha,
                                {
                                    registroId: subopcao.registroId || "",
                                    nome: subopcao.valor || "",
                                    nomeAdicionado: subopcao.nomeAdicionado || ""
                                },
                                "RaÃ§a",
                                raca.nome
                            );

                            ficha.efeitosAplicados.push({
                                id: uid(),
                                origemTipo: "RaÃ§a",
                                origemNome: raca.nome,
                                tipo: "magia_adicionar",
                                alvo: subopcao.valor
                            });
                        }

                        if (subopcao.tipoAplicacao === "proficiencia_adicionar") {
                            adicionarProficienciaNaFicha(ficha, subopcao.valor);

                            ficha.efeitosAplicados.push({
                                id: uid(),
                                origemTipo: "RaÃ§a",
                                origemNome: raca.nome,
                                tipo: "proficiencia_adicionar",
                                alvo: subopcao.valor
                            });
                        }
                    });
                });
            }
        });
    }

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
            "RaÃ§a",
            `MemÃ³ria PÃ³stuma (${racaOrigem.nome})`
        );
    }

    const efeitos = (racaOrigem.efeitos || [])
        .filter(efeito => String(efeito.habilidade_id) === String(habilidade.id));

    efeitos.forEach(efeito => {
        aplicarEfeitoNaFicha(
            ficha,
            efeito,
            "RaÃ§a",
            `MemÃ³ria PÃ³stuma (${racaOrigem.nome})`
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
        origemTipo: origemTipo || "RaÃ§a",
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
            marcarTreinoPericiaSemRegistrar(ficha, efeito.alvo);
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
                        origemTipo || "RaÃ§a",
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

    state.modal = "habilidade_adicionar";
    state.modalPayload = {};
    document.body.classList.add("modal-open");
    render();
}

function adicionarHabilidadeManualNaFicha() {
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

function getPoderesDisponiveisParaAdicionarNaFicha() {
    const ficha = getFichaAtual();
    if (!ficha) return [];

    const chavesJaNaFicha = new Set(
        (ficha.habilidades || [])
            .map(h => String(h.chaveOrigemPoder || "").trim())
            .filter(Boolean)
    );

    const idsGeraisJaNaFicha = new Set(
        (ficha.habilidades || [])
            .map(h => String(h.registroId || "").trim())
            .filter(Boolean)
    );

    const poderesGerais = (PODERES_MAGIAS_DB.registros || [])
        .filter(registro => normalizarTextoRegra(registro?.tipoRegistro || "") === "poder")
        .map(registro => ({
            ...registro,
            origemBanco: "geral",
            chaveOrigemPoder: `geral:${registro.id}`,
            origemBase: registro.origemBase || "Poder geral"
        }))
        .filter(registro =>
            !chavesJaNaFicha.has(registro.chaveOrigemPoder) &&
            !idsGeraisJaNaFicha.has(String(registro.id))
        );

    const poderesClasse = (CLASSES_DB || []).flatMap(classe =>
        (classe.poderes || [])
            .filter(registro => normalizarTextoRegra(registro?.tipoRegistro || "poder") === "poder")
            .map(registro => ({
                ...registro,
                origemBanco: "classe",
                classeId: classe.id,
                classeNome: classe.nome,
                chaveOrigemPoder: `classe:${classe.id}:${registro.id}`,
                origemBase: `Poder de classe: ${classe.nome}`
            }))
            .filter(registro => !chavesJaNaFicha.has(registro.chaveOrigemPoder))
    );

    return [...poderesGerais, ...poderesClasse]
        .sort((a, b) => String(a?.nome || "").localeCompare(String(b?.nome || ""), "pt-BR"));
}

function adicionarPoderDoBancoNaFicha(chaveOuRegistroId) {
    const ficha = getFichaAtual();
    if (!ficha) return;

    const chave = String(chaveOuRegistroId || "").trim();
    if (!chave) return;

    let registro = null;
    let origemTipo = "Poder";
    let origemNome = "Banco";
    let chaveOrigemPoder = "";
    let incrementos = [];
    let escolhas = [];

    if (chave.startsWith("classe:")) {
        const [, classeId, poderId] = chave.split(":");
        const classe = getClasseDoBanco(classeId);
        if (!classe) return;

        registro = getPoderClassePorId(classeId, poderId);
        if (!registro) return;

        origemTipo = "Classe";
        origemNome = classe.nome || "Classe";
        chaveOrigemPoder = `classe:${classeId}:${registro.id}`;

        incrementos = (registro.incrementos || []).map(inc => ({
            id: uid(),
            custoPm: Number(inc.custoPm) || 0,
            custoVida: Number(inc.custoVida) || 0,
            custoPmPermanente: Number(inc.custoPmPermanente) || 0,
            custoVidaPermanente: Number(inc.custoVidaPermanente) || 0,
            descricao: inc.descricao || "",
            efeitoResumo: inc.efeitoResumo || "",
            selecionado: false
        }));

        escolhas = (registro.escolhas || []).map(e => ({
            ...e,
            id: uid(),
            selecionadas: []
        }));
    } else {
        const registroId = chave.startsWith("geral:") ? chave.split(":")[1] : chave;

        registro = getRegistroPoderMagiaPorId(registroId);
        if (!registro) return;

        origemTipo = "Poder";
        origemNome = "Banco geral";
        chaveOrigemPoder = `geral:${registro.id}`;

        incrementos = getIncrementosPoderMagia(registro.id).map(inc => ({
            id: uid(),
            custoPm: Number(inc.custoPm) || 0,
            custoVida: Number(inc.custoVida) || 0,
            custoPmPermanente: Number(inc.custoPmPermanente) || 0,
            custoVidaPermanente: Number(inc.custoVidaPermanente) || 0,
            descricao: inc.descricao || "",
            efeitoResumo: inc.efeitoResumo || "",
            selecionado: false
        }));

        escolhas = (PODERES_MAGIAS_DB.escolhas || [])
            .filter(e => String(e.registro_id) === String(registro.id))
            .sort((a, b) => (Number(a.ordem) || 0) - (Number(b.ordem) || 0))
            .map(e => ({
                ...e,
                id: uid(),
                selecionadas: []
            }));
    }

    adicionarHabilidadeNaFicha(
        ficha,
        {
            nome: registro.nome || "",
            descricao: registro.descricao || "",
            custoPm: Number(registro.custoPm) || 0,
            custoVida: Number(registro.custoVida) || 0,
            custoPmPermanente: Number(registro.custoPmPermanente) || 0,
            custoVidaPermanente: Number(registro.custoVidaPermanente) || 0,
            resumoUso: registro.resumoUso || "",
            registroId: String(registro.id || ""),
            chaveOrigemPoder,
            ativavel: Number(registro.custoPm) > 0 || Number(registro.custoVida) > 0,
            permiteIntensificar: incrementos.length > 0,
            incrementos,
            escolhas,
            tipoRegistro: "poder",
            origemBase: registro.origemBase || origemNome,
            filtros: registro.filtros || "",
            preRequisitos: registro.preRequisitos || ""
        },
        origemTipo,
        origemNome
    );

    saveFichas();
    fecharModal();
    render();
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

    if (tipoRegistro === "poder") return true;

    // Tudo que vem de classe, origem ou divindade vai para Poderes
    if (origem === "classe" || origem === "origem" || origem === "divindade") {
        return true;
    }

    return false;
}

function getHabilidadesRaciaisVisiveis(ficha) {
    return (ficha?.habilidades || [])
        .filter(habilidadeDeveAparecerNaFicha)
        .filter(h => {
            const origem = normalizarTextoRegra(h.origem || "");
            return (origem === "raca" || origem === "raÃ§a") && !habilidadeFichaEhPoder(h);
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

    // ClÃ©rigo
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

    // SÃ³ rerenderiza quando precisa atualizar a lista/resumo da ficha
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

    state.modal = "magia_adicionar";
    state.modalPayload = {};
    document.body.classList.add("modal-open");
    render();
}
function podeAdicionarMagiasArcanasNaFicha(ficha) {
    if (!ficha) return false;

    const temClasseArcana = (ficha.classesPersonagem || []).some(cp =>
        ["arcanista", "bardo"].includes(normalizarTextoRegra(cp?.classeId || ""))
    );

    const temFormulasInventor = inventorTemAlquimistaIniciado?.(ficha);

    return temClasseArcana || temFormulasInventor;
}

function podeAdicionarMagiasDivinasNaFicha(ficha) {
    if (!ficha) return false;

    return (ficha.classesPersonagem || []).some(cp =>
        ["clerigo", "druida"].includes(normalizarTextoRegra(cp?.classeId || ""))
    ) || inventorTemAlquimistaIniciado?.(ficha);
}

function getCirculoMaximoMagiasNaFicha(ficha) {
    if (!ficha) return 0;

    const classes = ["arcanista", "bardo", "clerigo", "druida"];
    let max = 0;

    classes.forEach(classeId => {
        max = Math.max(max, getCirculoMaximoPorClasseNoContexto(ficha, classeId) || 0);
    });

    max = Math.max(max, getCirculoMaximoFormulaInventor?.(ficha, getNivelInventorDaFicha?.(ficha) || 0) || 0);

    return max;
}

function getMagiasDisponiveisParaAdicionarNaFicha(ficha) {
    if (!ficha) return [];

    const circuloMaximo = getCirculoMaximoMagiasNaFicha(ficha);
    if (!circuloMaximo) return [];

    const registros = (PODERES_MAGIAS_DB.registros || []).filter(registro => {
        if (normalizarTextoRegra(registro?.tipoRegistro || "") !== "magia") return false;

        const circulo = Number(registro?.circulo) || 0;
        if (circulo < 1 || circulo > circuloMaximo) return false;

        const jaTem = (ficha.magias || []).some(m =>
            normalizarTextoRegra(m?.nome || "") === normalizarTextoRegra(registro?.nome || "")
        );
        if (jaTem) return false;

        return true;
    });

    return registros
        .sort((a, b) => {
            const circA = Number(a.circulo) || 0;
            const circB = Number(b.circulo) || 0;
            if (circA !== circB) return circA - circB;
            return String(a.nome || "").localeCompare(String(b.nome || ""), "pt-BR");
        });
}

function adicionarMagiaDoBancoNaFicha(registroId) {
    const ficha = getFichaAtual();
    if (!ficha) return;

    const registro = getRegistroPoderMagiaPorId(registroId);
    if (!registro) return;

    adicionarOuAtualizarMagiaNaFicha(
        ficha,
        {
            registroId: registro.id,
            nome: registro.nome
        },
        "Manual",
        "Banco de magias"
    );

    saveFichas();
    fecharModal();
}

function adicionarMagiaManualNaFicha() {
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
function getValorAtributoChaveMagias(ficha, chave) {
    if (!ficha) return 0;

    switch (normalizarTextoRegra(chave || "")) {
        case "inteligencia":
            return getAtributoFinal(ficha, "inteligencia");
        case "sabedoria":
            return getAtributoFinal(ficha, "sabedoria");
        case "carisma":
            return getAtributoFinal(ficha, "carisma");
        default:
            return 0;
    }
}

function getAtributoChaveMagiasDaFicha(ficha) {
    if (!ficha) return "";

    const classes = ficha.classesPersonagem || [];
    const temClasse = (id) => classes.some(c => normalizarTextoRegra(c?.classeId || "") === id);

    if (temClasse("clerigo")) return "sabedoria";
    if (temClasse("druida")) return "sabedoria";
    if (temClasse("bardo")) return "carisma";
    if (temClasse("paladino")) return "carisma";

    if (temClasse("arcanista")) {
        const caminho = normalizarTextoRegra(ficha.arcanistaCaminho || "");

        if (caminho === "bruxo") return "inteligencia";
        if (caminho === "mago") return "inteligencia";
        if (caminho === "feiticeiro") return "carisma";
    }

    return "";
}

function calcularCdMagiasBase(ficha) {
    if (!ficha) return 0;

    const chave = getAtributoChaveMagiasDaFicha(ficha);
    if (!chave) return 0;

    const metadeNivel = getMetadeNivel(ficha);
    const atributo = getValorAtributoChaveMagias(ficha, chave);

    return 10 + metadeNivel + atributo;
}

function atualizarCdMagiasNaFicha(ficha, forcarSobrescrever = false) {
    if (!ficha) return;

    const chave = getAtributoChaveMagiasDaFicha(ficha);
    ficha.atributoChaveMagias = chave || "";

    const cdBase = calcularCdMagiasBase(ficha);

    if (forcarSobrescrever || !Number.isFinite(Number(ficha.cdMagias)) || Number(ficha.cdMagias) <= 0) {
        ficha.cdMagias = cdBase;
    }
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
        h.origem !== "RaÃ§a"
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


function abrirModalEspecializacoesOficioFicha(index) {
    const ficha = getFichaAtual();
    if (!ficha) return;

    const atuais = garantirOficiosFicha(ficha);
    state.modal = "oficios_ficha";
    state.modalPayload = {
        index,
        selecoes: [...atuais]
    };
    document.body.classList.add("modal-open");
    render();
}

function toggleEspecializacaoOficioFicha(nome) {
    if (state.modal !== "oficios_ficha") return;

    state.modalPayload = state.modalPayload || {};
    state.modalPayload.selecoes = Array.isArray(state.modalPayload.selecoes)
        ? state.modalPayload.selecoes
        : [];

    const lista = state.modalPayload.selecoes;
    const idx = lista.findIndex(item =>
        normalizarTextoRegra(item) === normalizarTextoRegra(nome)
    );

    if (idx >= 0) {
        lista.splice(idx, 1);
    } else {
        lista.push(nome);
    }

    render();
}

function confirmarModalEspecializacoesOficioFicha() {
    const ficha = getFichaAtual();
    if (!ficha || state.modal !== "oficios_ficha") return;

    const selecoes = Array.isArray(state.modalPayload?.selecoes)
        ? state.modalPayload.selecoes.map(v => String(v || "").trim()).filter(Boolean)
        : [];

    ficha.oficios = [...selecoes];

    const periciaOficio = (ficha.pericias || []).find(p =>
        normalizarTextoRegra(p.nome || "") === normalizarTextoRegra("OfÃ­cio")
    );

    if (periciaOficio) {
        periciaOficio.treinada = selecoes.length > 0;
    }

    saveFichas();
    fecharModal();
    render();
}

function renderModalEspecializacoesOficioFichaMobile(selecoes) {
    return `
      <div class="overlay mf-add-habilidade-overlay" onclick="fecharModal()">
        <div class="overlay-card mf-add-habilidade-modal mf-magia-detail-modal" onclick="event.stopPropagation()">
          <div class="overlay-header mf-add-habilidade-header">
            <div>
              <div class="overlay-title">Oficios</div>
              <div class="subtitle">Escolha um ou mais oficios para esta pericia.</div>
            </div>
            <div class="mf-detail-modal-actions">
              <button class="mf-add-habilidade-btn mf-add-habilidade-btn-fechar" onclick="fecharModal()">Cancelar</button>
              <button class="mf-add-habilidade-btn mf-add-habilidade-btn-manual mf-detail-ok-btn" onclick="confirmarModalEspecializacoesOficioFicha()">OK</button>
            </div>
          </div>

          <div class="overlay-body mf-add-habilidade-body mf-magia-detail-body">
            <div class="t20-divider"></div>

            <div class="mf-magia-detail-scroll">
              <div class="mf-magia-detail-card">
                <div class="mf-magia-detail-card-title">Especializacoes</div>
                <div class="mf-detail-choice-list">
                  ${ESPECIALIZACOES_OFICIO.map(nome => {
        const checked = selecoes.some(item => normalizarTextoRegra(item) === normalizarTextoRegra(nome));
        return `
                    <label class="mf-detail-choice-row">
                      <span class="mf-detail-choice-main">${escapeHtml(nome)}</span>
                      <input
                        type="checkbox"
                        ${checked ? "checked" : ""}
                        onchange="toggleEspecializacaoOficioFicha('${escapeAttr(nome)}')"
                      >
                    </label>
                  `;
    }).join("")}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
}

function renderModalEspecializacoesOficioFicha() {
    if (state.modal !== "oficios_ficha") return "";

    state.modalPayload = state.modalPayload || {};
    const selecoes = Array.isArray(state.modalPayload.selecoes)
        ? state.modalPayload.selecoes
        : [];

    document.body.classList.add("modal-open");

    const mobile = state.screen === "ficha";

    if (mobile) {
        return renderModalEspecializacoesOficioFichaMobile(selecoes);
    }

    return `
      <div class="overlay" onclick="fecharModal()">
        <div class="overlay-card" onclick="event.stopPropagation()">
          <div class="overlay-header">
            <div>
              <div class="overlay-title">EspecializaÃ§Ãµes de OfÃ­cio</div>
              <div class="overlay-subtitle">Escolha um ou mais ofÃ­cios para esta perÃ­cia.</div>
            </div>
            <div class="actions" style="justify-content:flex-end; align-items:center;">
              <button class="btn ghost" onclick="fecharModal()">Cancelar</button>
              <button class="btn primary" onclick="confirmarModalEspecializacoesOficioFicha()">Confirmar</button>
            </div>
          </div>

          <div class="overlay-body">
            <div class="list">
              ${ESPECIALIZACOES_OFICIO.map(nome => {
        const checked = selecoes.some(item => normalizarTextoRegra(item) === normalizarTextoRegra(nome));
        return `
                    <div class="list-item" style="align-items:flex-start; gap:12px;">
                      <div class="choice-main">
                        <div class="list-item-title">${escapeHtml(nome)}</div>
                      </div>
                      <input
                        class="choice-checkbox"
                        type="checkbox"
                        ${checked ? "checked" : ""}
                        onclick="event.stopPropagation()"
                        onchange="toggleEspecializacaoOficioFicha('${escapeAttr(nome)}')"
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

function updatePericia(index, field, value) {
    const ficha = getFichaAtual();
    if (!ficha || !ficha.pericias?.[index]) return;

    const pericia = ficha.pericias[index];
    const ehOficio = normalizarTextoRegra(pericia.nome || "") === normalizarTextoRegra("OfÃ­cio");

    if (ehOficio && field === "treinada") {
        abrirModalEspecializacoesOficioFicha(index);
        return;
    }

    if (field === "treinada") {
        pericia[field] = !!value;
    } else if (field === "outros") {
        pericia[field] = Number(value) || 0;
    } else {
        pericia[field] = value;
    }

    saveFichas();
    render();
}

function renderHome() {
    app.innerHTML = `
    <div class="screen">
      <div class="topbar home-topbar">
        <div style="width:100%; text-align:center;">
          <img src="images/tormenta.png" alt="Tormenta" class="logo-image" />
          <div class="subtitle">Gerenciador de ficha e dados</div>
        </div>
      </div>

      <div class="t20-divider"></div>

      <div class="menu-grid">
        <button class="menu-card" onclick="go('personagens')">
          <h3>Personagem</h3>
        </button>

        <button class="menu-card" onclick="go('mestre')">
          <h3>Area do Mestre<span>(somente Desktop)</span></h3>
        </button>
        <button class="menu-card" onclick="go('dados')">
          <h3>Dados</h3>
        </button>
      </div>


    </div>
  `;
}

function atualizarCampoAuth(campo, valor) {
    state.auth[campo] = valor;
}

function alternarModoAuth(modo) {
    state.auth.modo = modo;
    render();
}

async function enviarAuth() {
    const email = String(state.auth.email || "").trim();
    const senha = String(state.auth.senha || "");
    const nome = String(state.auth.nomeExibicao || "").trim();

    if (!email || !senha) {
        alert("Preencha email e senha.");
        return;
    }

    try {
        if (state.auth.modo === "cadastro") {
            await window.T20Supabase.signUp(email, senha, nome || email.split("@")[0]);
            alert("Cadastro realizado com sucesso.");
        } else {
            await window.T20Supabase.signIn(email, senha);
            alert("Login realizado com sucesso.");
        }

        state.screen = "home";
        state.fichasCarregadas = false;
        if (usuarioLogado()) {
            await carregarFichasDoUsuario();
        }
        render();
    } catch (err) {
        console.error(err);
        alert(err?.message || "NÃ£o foi possÃ­vel autenticar.");
    }
}

async function sairAuth() {
    try {
        await window.T20Supabase.signOut();
        state.fichas = [];
        state.fichasCarregadas = false;
        state.fichaAtualId = null;
        state.mesaOnlineId = "";
        state.mesaOnlineNome = "";
        state.menuUsuario = {
            aberto: false,
            tema: state.menuUsuario?.tema || "dia",
            modal: null,
            nome: "",
            novaSenha: "",
            confirmarSenha: ""
        };
        document.body.classList.remove("modal-open");
        state.screen = "auth";
        alert("Logout realizado.");
        render();
    } catch (err) {
        console.error(err);
        alert("NÃ£o foi possÃ­vel sair.");
    }
}

function renderAuth() {
    const usuario = window.T20Supabase?.SUPA?.state?.user || null;
    const modoCadastro = state.auth.modo === "cadastro";

    app.innerHTML = `
    <div class="screen auth-screen">
      <div class="auth-logo" aria-label="Tormenta"></div>
      <div class="panel${usuario ? "" : " auth-modal"}">
        <div class="panel-body">
          ${usuario ? `
            <div class="notice" style="margin-bottom:16px;">
              Logado como: ${escapeHtml(usuario.email || "UsuÃ¡rio")}
            </div>

            <button class="btn danger" onclick="sairAuth()">Sair</button>
          ` : `
            <div class="auth-modo-switch">
              <button class="auth-btn auth-btn-login ${!modoCadastro ? "is-ativo" : ""}" onclick="alternarModoAuth('login')">Login</button>
              <button class="auth-btn auth-btn-cadastro ${modoCadastro ? "is-ativo" : ""}" onclick="alternarModoAuth('cadastro')">Cadastro</button>
            </div>

            ${modoCadastro ? `
              <div class="field auth-field">
                <label>Nome de exibiÃ§Ã£o</label>
                <input
                  type="text"
                  value="${escapeAttr(state.auth.nomeExibicao || "")}"
                  onchange="atualizarCampoAuth('nomeExibicao', this.value)"
                >
              </div>
            ` : ""}

            <div class="field auth-field">
              <label>Email</label>
              <input
                type="email"
                value="${escapeAttr(state.auth.email || "")}"
                onchange="atualizarCampoAuth('email', this.value)"
              >
            </div>

            <div class="field auth-field">
              <label>Senha</label>
              <input
                type="password"
                value="${escapeAttr(state.auth.senha || "")}"
                onchange="atualizarCampoAuth('senha', this.value)"
              >
            </div>

            <div class="auth-submit">
              <button class="auth-btn auth-btn-entrar" onclick="enviarAuth()">
                ${modoCadastro ? "Criar conta" : "Entrar"}
              </button>
            </div>
          `}
        </div>
      </div>

      ${usuario ? `
        <div class="panel" style="margin-top:16px;">
          <div class="panel-title">Alterar senha</div>
          <div class="panel-body">
            <div class="field">
              <label>Nova senha</label>
              <input
                type="password"
                value="${escapeAttr(state.auth.novaSenha || "")}"
                onchange="atualizarCampoAuth('novaSenha', this.value)"
              >
            </div>

            <div class="field">
              <label>Confirmar nova senha</label>
              <input
                type="password"
                value="${escapeAttr(state.auth.confirmarNovaSenha || "")}"
                onchange="atualizarCampoAuth('confirmarNovaSenha', this.value)"
              >
            </div>

            <div style="margin-top:16px; display:flex; gap:8px; flex-wrap:wrap;">
              <button class="btn primary" onclick="alterarSenhaAuth()">Salvar nova senha</button>
              <button class="btn ghost" onclick="atualizarCampoAuth('novaSenha', ''); atualizarCampoAuth('confirmarNovaSenha', ''); render();">
                Limpar
              </button>
            </div>
          </div>
        </div>
      ` : ""}
    </div>
  `;
}


function renderPersonagens() {
    if (state.fichasCarregando) {
        app.innerHTML = `
      <div class="personagens-page">
        <div class="personagens-topbar">
          <div class="personagens-top-spacer"></div>
          <div class="personagens-logo" aria-label="Tormenta"></div>
          <button class="mf-banner mf-clickable mf-banner-back" onclick="go('home')">Voltar</button>
        </div>
        <p class="personagens-subtitle">Carregando suas fichas...</p>
      </div>
    `;
        return;
    }

    const fichasPersonagem = state.fichas.filter(f => f?.npcLocal !== true);
    const rascunho = carregarRascunhoCriacaoSalvo();
    const blocoRascunho = (() => {
        if (!rascunho) return "";

        const nomeRascunho = rascunho.criacao?.ficha?.nome || "Sem nome";
        let dataRascunho = "";
        try {
            dataRascunho = rascunho.savedAt ? new Date(rascunho.savedAt).toLocaleString("pt-BR") : "";
        } catch (err) {
            dataRascunho = "";
        }

        return `
          <div class="personagens-draft">
            <p>
              Voce tem uma criacao de personagem nao finalizada${nomeRascunho ? ` ("${escapeHtml(nomeRascunho)}")` : ""}${dataRascunho ? ` salva em ${escapeHtml(dataRascunho)}.` : "."}
            </p>
            <div class="personagens-draft-actions">
              <button class="personagens-btn personagens-btn-white" onclick="continuarRascunhoCriacao()">Continuar Ficha</button>
              <button class="personagens-btn personagens-btn-red personagens-btn-small" onclick="descartarRascunhoCriacao()">Descartar</button>
            </div>
          </div>
        `;
    })();

    app.innerHTML = `
    <div class="personagens-page">
      <div class="personagens-topbar">
        <div class="personagens-top-spacer"></div>
        <div class="personagens-logo" aria-label="Tormenta"></div>
        <button class="mf-banner mf-clickable mf-banner-back" onclick="go('home')">Voltar</button>
      </div>

      <p class="personagens-subtitle">Crie uma ficha nova ou abra uma ficha ja existente.</p>
      <div class="t20-divider"></div>

      <input
        id="inputImportarFichas"
        type="file"
        accept=".json,application/json"
        style="display:none"
        onchange="handleInputImportarFichas(this)"
      >

      <section class="personagens-create">
        <button class="personagens-btn personagens-btn-red personagens-btn-create" onclick="iniciarCriacaoFicha()">Criar Ficha</button>
        ${blocoRascunho}
      </section>

      <div class="t20-divider"></div>

      <section class="personagens-open">
        <h2>Abrir Ficha Existente</h2>
        ${fichasPersonagem.length === 0
        ? `<div class="personagens-empty">Nenhuma ficha salva ainda.</div>`
        : `
          <div class="personagens-grid">
            ${fichasPersonagem.map(f => {
            const ativaOnline = !!(state.mesaOnlineId && f.onlineAtivaMesaId === state.mesaOnlineId);
            return `
              <article class="personagem-card">
                <div class="personagem-card-fields">
                  <div class="personagem-card-row">
                    <span>Nome</span>
                    <strong>${escapeHtml(f.nome || "Sem nome")}</strong>
                  </div>
                  <div class="personagem-card-row">
                    <span>Classe</span>
                    <strong>${escapeHtml(getResumoClasseCurtoFicha(f))}</strong>
                  </div>
                  <div class="personagem-card-row">
                    <span>Raca</span>
                    <strong>${escapeHtml(f.raca || "-")}</strong>
                  </div>
                  <div class="personagem-card-row">
                    <span>Nivel</span>
                    <strong>${escapeHtml(getNivelTotalPersonagem(f))}</strong>
                  </div>
                </div>

                <div class="personagem-card-actions">
                  <button class="personagens-btn personagens-btn-red personagens-btn-card" onclick="abrirFicha('${escapeAttr(f.id)}')">Abrir</button>
                  <button class="personagens-btn personagens-btn-white personagens-btn-card" onclick="excluirFicha('${escapeAttr(f.id)}')">Excluir</button>
                </div>

                <label class="personagem-online">
                  <input
                    type="checkbox"
                    ${ativaOnline ? "checked" : ""}
                    onchange="toggleFichaAtivaOnline('${escapeAttr(f.id)}', this.checked)"
                  >
                  <span class="personagem-online-check" aria-hidden="true"></span>
                  <span>Ficha ativa<br>online</span>
                </label>
              </article>
            `;
        }).join("")}
          </div>
        `}
      </section>

      <div class="personagens-bottom">
        <div class="t20-divider"></div>
        <label class="personagens-mesa-label" for="personagensMesaNome">Nome da mesa</label>
        <input
          id="personagensMesaNome"
          class="personagens-mesa-input"
          type="text"
          value="${escapeAttr(state.mesaOnlineNome || "")}"
          placeholder="Digite o nome da mesa"
          onchange="definirMesaOnlineNome(this.value)"
        >
        <button class="personagens-btn personagens-btn-red personagens-btn-connect" type="button" onclick="conectarMesaPorNome()">Conectar a mesa</button>
        ${state.mesaOnlineId ? `<div class="personagens-connected">Conectado</div>` : ""}
      </div>
    </div>
  `;
}

function renderBarraCriacao() {
    return "";
}


function toggleResumoCriacao() {
    state.ui = state.ui || {};
    state.ui.resumoCriacaoAberto = state.ui.resumoCriacaoAberto !== true;
    render();
}

function renderResumoCriacao(f) {
    const aberto = state.ui?.resumoCriacaoAberto === true;
    const atributosResumo = [
        ["FOR", "forca"],
        ["DES", "destreza"],
        ["CON", "constituicao"],
        ["INT", "inteligencia"],
        ["SAB", "sabedoria"],
        ["CAR", "carisma"]
    ].map(([rotulo, campo]) => `${rotulo} ${getAtributoFinalCriacaoPreview(f, campo)}`).join("   ");

    return `
    <section class="criacao-resumo ${aberto ? "is-open" : "is-collapsed"}">
      <button class="criacao-resumo-toggle" type="button" onclick="toggleResumoCriacao()">
        <span>Resumo</span>
        <span aria-hidden="true">${aberto ? "&#9650;" : "&#9660;"}</span>
      </button>

      ${aberto ? `
        <div class="criacao-resumo-card">
          <div class="criacao-resumo-cell criacao-resumo-nome">
            <strong>Nome</strong>
            <span>${escapeHtml(f.nome || "-")}</span>
          </div>
          <div class="criacao-resumo-cell criacao-resumo-raca">
            <strong>Ra&ccedil;a</strong>
            <span>${escapeHtml(f.raca || "-")}</span>
          </div>
          <div class="criacao-resumo-cell criacao-resumo-origem">
            <strong>Origem</strong>
            <span>${escapeHtml(f.origem || "-")}</span>
          </div>
          <div class="criacao-resumo-cell criacao-resumo-nivel">
            <strong>N&iacute;vel Total</strong>
            <span>${escapeHtml(String(getNivelTotalPersonagem(f)))}</span>
          </div>
          <div class="criacao-resumo-cell criacao-resumo-atributos">
            <strong>Atributos</strong>
            <span>${escapeHtml(atributosResumo)}</span>
          </div>
          <div class="criacao-resumo-cell criacao-resumo-classes">
            <strong>Classes</strong>
            <span>${escapeHtml(formatarClassesPersonagem(f))}</span>
          </div>
          <div class="criacao-resumo-cell criacao-resumo-pv">
            <strong>PV</strong>
            <span>${escapeHtml(String(getPVMaxCriacaoPreview(f)))}</span>
          </div>
          <div class="criacao-resumo-cell criacao-resumo-pm">
            <strong>PM</strong>
            <span>${escapeHtml(String(getPMMaxCriacaoPreview(f)))}</span>
          </div>
          <div class="criacao-resumo-cell criacao-resumo-tamanho">
            <strong>Tamanho</strong>
            <span>${escapeHtml(f.tamanho || "-")}</span>
          </div>
          <div class="criacao-resumo-cell criacao-resumo-deslocamento">
            <strong>Deslocamento</strong>
            <span>${escapeHtml(f.deslocamento || "-")}</span>
          </div>
          <div class="criacao-resumo-cell criacao-resumo-divindade">
            <strong>Divindade</strong>
            <span>${escapeHtml(f.divindade || "-")}</span>
          </div>
        </div>
      ` : ""}
    </section>
  `;
}

function selecionarClasseCriacao(id) {
    state.criacao.classeSelecionadaId = id;
    state.criacao.classeEscolhas = {};
    state.criacao.planoClasses = [];
    render();
}

const NIVEL_MAXIMO_PLANO_CLASSES_CRIACAO = 20;

function getIdItemPlanoClasseCriacao() {
    return uid();
}

function criarItemPlanoClasseCriacao(classeId = "", niveis = 1) {
    const classe = getClasseDoBanco(classeId);
    return {
        id: getIdItemPlanoClasseCriacao(),
        classeId: classe?.id || classeId || "",
        nome: classe?.nome || "",
        niveis: Math.max(1, Number(niveis) || 1)
    };
}

function getPlanoClassesCriacao() {
    if (!Array.isArray(state.criacao.planoClasses)) {
        state.criacao.planoClasses = [];
    }

    if (!state.criacao.planoClasses.length) {
        const classeInicial = getClasseSelecionadaCriacao();

        if (classeInicial) {
            state.criacao.planoClasses.push(criarItemPlanoClasseCriacao(classeInicial.id, 1));
        } else {
            state.criacao.planoClasses.push(criarItemPlanoClasseCriacao("", 1));
        }
    }

    return state.criacao.planoClasses;
}

function limparEscolhasClassesPlanejadasCriacao() {
    state.criacao.classeEscolhas = {};
    state.criacao.escolhaClasseAbertaId = null;
    state.criacao.poderClasseEscolhas = {};
    state.criacao.escolhaPoderClasseAbertaId = null;
    state.criacao.classeEvolucaoContexto = null;

    const ficha = getFichaCriacao();
    if (ficha) {
        ficha.escolhasClasseResolvidas = [];
    }
}

function normalizarPlanoClassesCriacao() {
    const vistos = new Set();
    const plano = getPlanoClassesCriacao()
        .map(item => {
            const classe = getClasseDoBanco(item?.classeId);
            return {
                id: item?.id || getIdItemPlanoClasseCriacao(),
                classeId: classe?.id || "",
                nome: classe?.nome || "",
                niveis: Math.max(1, Math.min(NIVEL_MAXIMO_PLANO_CLASSES_CRIACAO, Number(item?.niveis) || 1))
            };
        })
        .filter(item => {
            if (!item.classeId) return true;
            if (vistos.has(item.classeId)) return false;
            vistos.add(item.classeId);
            return true;
        });

    state.criacao.planoClasses = plano.length ? plano : [criarItemPlanoClasseCriacao("", 1)];
    state.criacao.classeSelecionadaId = state.criacao.planoClasses[0]?.classeId || "";
    return state.criacao.planoClasses;
}

function getTotalNiveisPlanoClassesCriacao() {
    return getPlanoClassesCriacao()
        .filter(item => item.classeId)
        .reduce((total, item) => total + (Number(item.niveis) || 0), 0);
}

function planoClassesCriacaoValido() {
    const plano = getPlanoClassesCriacao();
    const validos = plano.filter(item => item.classeId);

    if (!validos.length) return false;
    if (validos.length !== plano.length) return false;

    const ids = new Set(validos.map(item => item.classeId));
    if (ids.size !== validos.length) return false;

    const total = getTotalNiveisPlanoClassesCriacao();
    return total >= 1 && total <= NIVEL_MAXIMO_PLANO_CLASSES_CRIACAO;
}

function selecionarClassePlanoCriacao(index, classeId) {
    const plano = getPlanoClassesCriacao();
    const classe = getClasseDoBanco(classeId);

    if (!plano[index]) return;

    plano[index].classeId = classe?.id || "";
    plano[index].nome = classe?.nome || "";

    if (index === 0) {
        state.criacao.classeSelecionadaId = plano[index].classeId;
    }

    normalizarPlanoClassesCriacao();
    limparEscolhasClassesPlanejadasCriacao();
    aplicarPlanoClassesNaFichaCriacao();
    render();
}

function alterarNivelPlanoClasseCriacao(index, valor) {
    const plano = getPlanoClassesCriacao();
    if (!plano[index]) return;

    const atual = Math.max(1, Number(plano[index].niveis) || 1);
    const novoValor = typeof valor === "number"
        ? valor
        : parseInt(String(valor || atual), 10);

    plano[index].niveis = Math.max(1, Math.min(NIVEL_MAXIMO_PLANO_CLASSES_CRIACAO, Number(novoValor) || 1));

    const total = getTotalNiveisPlanoClassesCriacao();
    if (total > NIVEL_MAXIMO_PLANO_CLASSES_CRIACAO) {
        plano[index].niveis = Math.max(1, plano[index].niveis - (total - NIVEL_MAXIMO_PLANO_CLASSES_CRIACAO));
    }

    limparEscolhasClassesPlanejadasCriacao();
    aplicarPlanoClassesNaFichaCriacao();
    render();
}

function ajustarNivelPlanoClasseCriacao(index, delta) {
    const plano = getPlanoClassesCriacao();
    if (!plano[index]) return;
    alterarNivelPlanoClasseCriacao(index, (Number(plano[index].niveis) || 1) + (Number(delta) || 0));
}

function adicionarMulticlasseCriacao() {
    const plano = getPlanoClassesCriacao();
    if (plano.length >= CLASSES_DB.length) return;
    if (getTotalNiveisPlanoClassesCriacao() >= NIVEL_MAXIMO_PLANO_CLASSES_CRIACAO) return;

    plano.push(criarItemPlanoClasseCriacao("", 1));
    limparEscolhasClassesPlanejadasCriacao();
    render();
}

function removerClassePlanoCriacao(index) {
    const plano = getPlanoClassesCriacao();
    if (plano.length <= 1 || index < 0 || index >= plano.length) return;

    plano.splice(index, 1);
    normalizarPlanoClassesCriacao();
    limparEscolhasClassesPlanejadasCriacao();
    aplicarPlanoClassesNaFichaCriacao();
    render();
}

function getClassesEscolhidasPlanoCriacao(excetoIndex = -1) {
    return new Set(
        getPlanoClassesCriacao()
            .filter((_, index) => index !== excetoIndex)
            .map(item => item.classeId)
            .filter(Boolean)
    );
}

function aplicarPlanoClassesNaFichaCriacao() {
    const ficha = getFichaCriacao();
    if (!ficha) return false;

    const plano = normalizarPlanoClassesCriacao().filter(item => item.classeId);

    ficha.classesPersonagem = plano.map((item, index) => {
        const classe = getClasseDoBanco(item.classeId);
        return {
            classeId: item.classeId,
            nome: classe?.nome || item.nome || "",
            niveis: Math.max(1, Number(item.niveis) || 1),
            primeiraClasse: index === 0
        };
    });

    atualizarNivelTotalFicha(ficha);
    reaplicarProgressaoClasses(ficha);
    recalcularEquipamentosEFicha(ficha);
    return true;
}

function getNiveisPlanejadosClassesCriacao() {
    const ficha = getFichaCriacao();
    if (!ficha) return [];

    return (ficha.classesPersonagem || [])
        .flatMap((registro, classeIndex) => {
            const classe = getClasseDoBanco(registro.classeId);
            if (!classe) return [];

            const total = Math.max(1, Number(registro.niveis) || 1);
            return Array.from({ length: total }, (_, i) => ({
                classe,
                classeIndex,
                nivelClasse: i + 1,
                primeiraClasse: classeIndex === 0
            }));
        });
}

function criarRegistroEscolhaClasseResolvida(classe, nivelClasse, escolha, selecionadas) {
    return {
        id: uid(),
        classeId: classe.id,
        classeNome: classe.nome,
        nivelClasse,
        escolhaId: escolha.id,
        selecionadas: JSON.parse(JSON.stringify(selecionadas))
    };
}

function coletarEscolhasClasseResolvidasPlanejadasCriacao(apenasCompletas = true) {
    const ficha = getFichaCriacao();
    if (!ficha) return [];

    const registros = [];

    getNiveisPlanejadosClassesCriacao().forEach(item => {
        const escolhas = getEscolhasClasseDisponiveisNoNivel(
            item.classe,
            item.nivelClasse,
            item.primeiraClasse,
            ficha
        );

        escolhas.forEach(escolha => {
            const selecionadas = getEscolhaClasseValores(escolha.id);
            const quantidade = Number(escolha.quantidade) || 0;

            if (apenasCompletas && selecionadas.length !== quantidade) return;
            if (apenasCompletas && !escolhaClassePreenchida(escolha)) return;
            if (!selecionadas.length && quantidade > 0) return;

            registros.push(criarRegistroEscolhaClasseResolvida(
                item.classe,
                item.nivelClasse,
                escolha,
                selecionadas
            ));
        });
    });

    return registros;
}

function sincronizarFichaTemporariaClassesCriacao() {
    const ficha = getFichaCriacao();
    if (!ficha) return;

    ficha.escolhasClasseResolvidas = coletarEscolhasClasseResolvidasPlanejadasCriacao(true);
    reaplicarProgressaoClasses(ficha);
    recalcularEquipamentosEFicha(ficha);
}

function escolhaClasseNivelPlanejadoPreenchida(escolha, classe = null) {
    if (!escolhaClasseDesbloqueada(escolha, classe)) return false;
    return escolhaClassePreenchida(escolha);
}

function getIndiceNivelPlanejadoClassesCriacao(classeId, nivelClasse) {
    return getNiveisPlanejadosClassesCriacao().findIndex(item =>
        String(item.classe?.id || "") === String(classeId || "") &&
        Number(item.nivelClasse) === Number(nivelClasse)
    );
}

function getEscolhasNivelPlanejadoClassesCriacao(item) {
    const ficha = getFichaCriacao();
    if (!ficha || !item?.classe) return [];

    return getEscolhasClasseDisponiveisNoNivel(
        item.classe,
        item.nivelClasse,
        item.primeiraClasse,
        ficha
    );
}

function nivelPlanejadoClassesCriacaoPreenchido(item) {
    return getEscolhasNivelPlanejadoClassesCriacao(item)
        .every(escolha => escolhaClasseNivelPlanejadoPreenchida(escolha, item.classe));
}

function nivelPlanejadoClassesCriacaoLiberado(indiceNivel) {
    const niveis = getNiveisPlanejadosClassesCriacao();
    const indice = Math.max(0, Number(indiceNivel) || 0);
    return niveis.slice(0, indice).every(item => nivelPlanejadoClassesCriacaoPreenchido(item));
}

function nivelPlanejadoClassesCriacaoTemEscolhas(item) {
    return getEscolhasNivelPlanejadoClassesCriacao(item)
        .some(escolha => getEscolhaClasseValores(escolha.id).length > 0);
}

function existemEscolhasClasseDepoisDoIndiceCriacao(indiceNivel) {
    const niveis = getNiveisPlanejadosClassesCriacao();
    const indice = Math.max(0, Number(indiceNivel) || 0);
    return niveis.slice(indice + 1).some(item => nivelPlanejadoClassesCriacaoTemEscolhas(item));
}

function limparEstadoOpcaoClasseCriacao(opcao) {
    if (Array.isArray(opcao?.escolhas)) {
        state.criacao.poderClasseEscolhas = state.criacao.poderClasseEscolhas || {};
        opcao.escolhas.forEach(escolhaInterna => {
            delete state.criacao.poderClasseEscolhas[String(escolhaInterna.id || "")];
        });

        if (opcao.escolhas.some(e => String(e.id || "") === String(state.criacao.escolhaPoderClasseAbertaId || ""))) {
            state.criacao.escolhaPoderClasseAbertaId = null;
        }
    }

    const ctxGolpe = getGolpePessoalStateAtual();
    if (ctxGolpe?.golpePessoalModal && String(ctxGolpe.golpePessoalModal.opcaoId || "") === String(opcao?.id || "")) {
        ctxGolpe.golpePessoalModal = null;
    }
}

function limparEscolhasClasseDepoisDoIndiceCriacao(indiceNivel) {
    const niveis = getNiveisPlanejadosClassesCriacao();
    const indice = Math.max(0, Number(indiceNivel) || 0);

    niveis.slice(indice + 1).forEach(item => {
        getEscolhasNivelPlanejadoClassesCriacao(item).forEach(escolha => {
            const selecionadas = getEscolhaClasseValores(escolha.id);
            selecionadas.forEach(opcao => limparEstadoOpcaoClasseCriacao(opcao));
            delete state.criacao.classeEscolhas?.[escolha.id];
        });
    });

    state.criacao.escolhaPoderClasseAbertaId = null;
    state.criacao.golpePessoalModal = null;
}

function getIndiceNivelContextoClasseCriacao() {
    const ctx = state.criacao.classeEvolucaoContexto;
    if (!ctx?.classeId) return -1;
    return getIndiceNivelPlanejadoClassesCriacao(ctx.classeId, ctx.nivelAlvo || 1);
}

function confirmarResetNiveisPosterioresAoAlterarClasseCriacao() {
    const indiceNivel = getIndiceNivelContextoClasseCriacao();
    if (indiceNivel < 0 || !existemEscolhasClasseDepoisDoIndiceCriacao(indiceNivel)) return true;

    const confirmar = typeof confirm === "function"
        ? confirm("Alterar escolhas deste nivel apagara as escolhas dos niveis seguintes. Deseja continuar?")
        : true;

    if (!confirmar) {
        renderMantendoScrollEscolha();
        return false;
    }

    limparEscolhasClasseDepoisDoIndiceCriacao(indiceNivel);
    sincronizarFichaTemporariaClassesCriacao();
    return true;
}

function getPendenciasClassesPlanejadasCriacao() {
    const ficha = getFichaCriacao();
    if (!ficha) return ["Ficha de criacao indisponivel"];

    const pendencias = [];

    getNiveisPlanejadosClassesCriacao().forEach(item => {
        const escolhas = getEscolhasClasseDisponiveisNoNivel(
            item.classe,
            item.nivelClasse,
            item.primeiraClasse,
            ficha
        );

        escolhas.forEach(escolha => {
            if (escolhaClasseNivelPlanejadoPreenchida(escolha, item.classe)) return;
            pendencias.push(`${item.classe.nome} ${item.nivelClasse}: ${escolha.titulo || escolha.tipo || "escolha"}`);
        });
    });

    return pendencias;
}

function classesPlanejadasCriacaoValidas() {
    if (!planoClassesCriacaoValido()) return false;
    aplicarPlanoClassesNaFichaCriacao();
    sincronizarFichaTemporariaClassesCriacao();
    return getPendenciasClassesPlanejadasCriacao().length === 0;
}

function abrirEscolhaClassePlanejadaCriacao(classeId, nivelClasse, escolhaId) {
    const ficha = getFichaCriacao();
    const classe = getClasseDoBanco(classeId);
    if (!ficha || !classe) return;

    const indiceNivel = getIndiceNivelPlanejadoClassesCriacao(classeId, nivelClasse);
    if (!nivelPlanejadoClassesCriacaoLiberado(indiceNivel)) return;

    const registro = getRegistroClasse(ficha, classeId);

    state.criacao.classeEvolucaoContexto = {
        classeId: classe.id,
        nome: classe.nome,
        nivelAlvo: Number(nivelClasse) || 1,
        primeiraClasse: !!registro?.primeiraClasse
    };

    abrirEscolhaClasseCriacao(escolhaId);
}

function concluirPlanejamentoClassesCriacao() {
    if (!classesPlanejadasCriacaoValidas()) {
        alert("Ainda existem escolhas pendentes nas classes.");
        render();
        return;
    }

    const ficha = getFichaCriacao();
    if (!ficha) return;

    ficha.escolhasClasseResolvidas = coletarEscolhasClasseResolvidasPlanejadasCriacao(true);
    reaplicarProgressaoClasses(ficha);
    recalcularEquipamentosEFicha(ficha);

    state.criacao.fluxoClasseAtivo = false;
    state.criacao.classeEvolucaoContexto = null;
    state.criacao.escolhaClasseAbertaId = null;
    state.criacao.escolhaPoderClasseAbertaId = null;
    state.criacao.etapa = 4;

    salvarRascunhoCriacao();
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
        if (!confirmarResetNiveisPosterioresAoAlterarClasseCriacao()) return;

        const removida = lista[idx];
        lista.splice(idx, 1);

        if (Array.isArray(removida?.escolhas)) {
            state.criacao.poderClasseEscolhas = state.criacao.poderClasseEscolhas || {};
            removida.escolhas.forEach(escolhaInterna => {
                delete state.criacao.poderClasseEscolhas[String(escolhaInterna.id || "")];
            });

            if (removida.escolhas.some(e => String(e.id || "") === String(state.criacao.escolhaPoderClasseAbertaId || ""))) {
                state.criacao.escolhaPoderClasseAbertaId = null;
            }
        }

        const ctxGolpe = getGolpePessoalStateAtual();
        if (ctxGolpe?.golpePessoalModal && String(ctxGolpe.golpePessoalModal.opcaoId || "") === String(opcao.id || "")) {
            ctxGolpe.golpePessoalModal = null;
        }
    } else {
        if (!podeSelecionarOpcaoClasse(escolha, opcao)) return;
        if (ehOpcaoPericiaOficioGenerico(opcao)) {
            const restante = Math.max(0, limite - lista.length);
            if (restante <= 0) return;
            if (!confirmarResetNiveisPosterioresAoAlterarClasseCriacao()) return;

            abrirModalEspecializacoesOficioEscolha({
                targetState: "criacao",
                escolhaKey: "classeEscolhas",
                escolhaId,
                opcaoBase: opcao,
                maximo: restante,
                titulo: "Escolha as especializaÃ§Ãµes de OfÃ­cio"
            });
            return;
        }
        if (limite > 0 && lista.length >= limite) return;
        if (!confirmarResetNiveisPosterioresAoAlterarClasseCriacao()) return;

        lista.push(opcao);

        if (isGolpePessoalOpcao(opcao)) {
            state.criacao.escolhaClasseAbertaId = escolhaId;
            state.criacao.escolhaPoderClasseAbertaId = "__golpe_pessoal__";

            state.criacao.golpePessoalModal = {
                escolhaClasseId: escolhaId,
                opcaoId: opcao?.id || "",
                config: JSON.parse(JSON.stringify(opcao?.golpePessoalConfig || criarConfigInicialGolpePessoal()))
            };

            renderMantendoScrollEscolha();
            return;
        }

        if (!opcao.ehAumentoAtributo && Array.isArray(opcao.escolhas) && opcao.escolhas.length > 0) {
            state.criacao.poderClasseEscolhas = state.criacao.poderClasseEscolhas || {};
            state.criacao.escolhaPoderClasseAbertaId = String(opcao.escolhas[0].id || "");
        }
    }

    sincronizarFichaTemporariaClassesCriacao();
    renderMantendoScrollEscolha();
}
function escolhaClasseTemOpcaoConfirmada(escolhaId) {
    const lista = state.criacao?.classeEscolhas?.[escolhaId] || [];
    return lista.some(item => item?.escolhasConfirmadas);
}

function escolhaClasseTemOpcaoConfirmadaEvolucao(escolhaId) {
    const lista = state.evolucao?.classeEscolhas?.[escolhaId] || [];
    return lista.some(item => item?.escolhasConfirmadas);
}
function escolhaClassePreenchida(escolha) {
    const valores = getEscolhaClasseValores(escolha.id);
    const quantidade = Number(escolha.quantidade) || 0;

    if (valores.length !== quantidade) return false;

    return valores.every(item => {
        const precisaConfirmar =
            isGolpePessoalOpcao?.(item) ||
            (Array.isArray(item?.escolhas) && item.escolhas.length > 0);

        return !precisaConfirmar || !!item?.escolhasConfirmadas;
    });
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
    state.criacao.filtroEscolhaClasse = "";
    state.criacao.deveFocarBuscaEscolhaClasse = true;
    render();
}

function fecharEscolhaClasseCriacao() {
    state.criacao.escolhaClasseAbertaId = null;
    state.criacao.filtroEscolhaClasse = "";
    document.body.classList.remove("modal-open");
    render();
}
function abrirEscolhaClasseEvolucao(escolhaId) {
    state.evolucao.escolhaClasseAbertaId = escolhaId;
    state.evolucao.filtroEscolhaClasse = "";
    render();
}

function fecharEscolhaClasseEvolucao() {
    state.evolucao.escolhaClasseAbertaId = null;
    state.evolucao.filtroEscolhaClasse = "";
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

function divindadeEhNenhum(divindade) {
    return normalizarTextoRegra(divindade?.id || "") === "nenhum" ||
        normalizarTextoRegra(divindade?.nome || "") === "nenhum";
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

function aplicarNenhumaDivindadeNaFicha(ficha) {
    if (!ficha) return false;

    limparDivindadeNaFicha(ficha);
    ficha.divindade = "Nenhum";
    ficha.divindadeId = "nenhum";
    ficha.divindadeDados = null;
    ficha.divindadePoderEscolhido = "";
    return true;
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
    const scrollAtual = document.querySelector(".mf-evolucao-divindade-body")?.scrollTop || 0;
    state.evolucao.divindadePoderSelecionadoNome = String(nome || "").trim();
    render();

    requestAnimationFrame(() => {
        const corpo = document.querySelector(".mf-evolucao-divindade-body");
        if (corpo) corpo.scrollTop = scrollAtual;
    });
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

    const divindade = getDivindadePorId(id);
    if (divindadeEhNenhum(divindade)) {
        aplicarNenhumaDivindadeNaFicha(getFichaCriacao());
        state.criacao.divindadeSelecionadaId = divindade?.id || "nenhum";
    } else if (id) {
        limparDivindadeNaFichaCriacao(getFichaCriacao());
    }

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
function renderDivindadeModalMobile(ficha, d) {
    const camposHtml = [
        renderLinhaDetalheMobile("Energia", d.energia),
        renderLinhaDetalheMobile("Arma preferida", d.arma_preferida)
    ].join("");

    return `
      <div class="overlay mf-add-habilidade-overlay" onclick="fecharModal()">
        <div class="overlay-card mf-add-habilidade-modal mf-magia-detail-modal mf-status-compact-modal mf-status-classes-modal" onclick="event.stopPropagation()">
          <div class="overlay-header mf-add-habilidade-header">
            <div>
              <div class="overlay-title">Divindade</div>
              <div class="subtitle">${escapeHtml(ficha.divindade || d.nome || "")}</div>
            </div>
            <button class="mf-add-habilidade-btn mf-add-habilidade-btn-fechar" onclick="fecharModal()">Fechar</button>
          </div>

          <div class="overlay-body mf-add-habilidade-body mf-magia-detail-body">
            <div class="t20-divider"></div>

            <div class="mf-magia-detail-scroll">
              <div class="mf-magia-detail-card">
                <div class="mf-magia-detail-card-title">Detalhes</div>
                <div class="mf-detail-kv">
                  ${camposHtml || `<div class="mf-magia-detail-vazio">Nenhum detalhe cadastrado.</div>`}
                </div>
              </div>

              ${d.obrigacoes_restricoes ? `
                <div class="mf-magia-detail-card">
                  <div class="mf-magia-detail-card-title">Obrigacoes e restricoes</div>
                  <div class="mf-detail-text">${escapeHtml(d.obrigacoes_restricoes)}</div>
                </div>
              ` : ""}
            </div>
          </div>
        </div>
      </div>
    `;
}

function renderDivindadeModal() {
    if (state.modal !== "divindade") return "";

    const ficha = getFichaAtual();
    const d = ficha?.divindadeDados;

    if (!ficha || !d) return "";

    setTimeout(() => {
        document.body.classList.add("modal-open");
    }, 0);

    const mobile = state.screen === "ficha";

    if (mobile) {
        return renderDivindadeModalMobile(ficha, d);
    }

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
                    <div class="list-item-sub">${escapeHtml(d.energia || "â€”")}</div>
                  </div>
                </div>

                <div class="list-item">
                  <div>
                    <div class="list-item-title">Arma preferida</div>
                    <div class="list-item-sub">${escapeHtml(d.arma_preferida || "â€”")}</div>
                  </div>
                </div>

                <div class="list-item">
                  <div>
                    <div class="list-item-title">ObrigaÃ§Ãµes e restriÃ§Ãµes</div>
                    <div class="list-item-sub" style="white-space:pre-wrap;">${escapeHtml(d.obrigacoes_restricoes || "â€”")}</div>
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
      <div class="overlay mf-add-habilidade-overlay" onclick="fecharEscolhaDivindadeEvolucao()">
        <div class="overlay-card mf-add-habilidade-modal mf-magia-detail-modal mf-evolucao-divindade-modal" onclick="event.stopPropagation()">
          <div class="overlay-header mf-add-habilidade-header">
            <div class="mf-evolucao-divindade-heading">
              <div class="overlay-title mf-evolucao-divindade-title">Divindade</div>
              <div class="overlay-subtitle">Seu personagem n&atilde;o possui divindade. Escolha uma agora.</div>
              <div class="t20-divider"></div>
            </div>
            <button class="mf-add-habilidade-btn mf-add-habilidade-btn-fechar" onclick="fecharEscolhaDivindadeEvolucao()">Fechar</button>
          </div>

          <div class="overlay-body mf-add-habilidade-body mf-magia-detail-body mf-evolucao-divindade-body">
            <div class="field">
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
              <div class="t20-divider"></div>

              <div class="notice">
                ${escapeHtml(divindade.descricao || "")}
              </div>

              <div class="t20-divider"></div>

              <div class="panel">
                <div class="panel-title">Informa&ccedil;&otilde;es da divindade</div>
                <div class="panel-body">
                  <div class="field">
                    <label>Cren&ccedil;as e objetivos</label>
                    <textarea rows="4" disabled>${escapeHtml(divindade.crencas_e_objetivos || "")}</textarea>
                  </div>

                  <div class="t20-divider"></div>

                  <div class="row-3">
                    <div class="field">
                      <label>S&iacute;mbolo</label>
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

                  <div class="t20-divider"></div>

                  <div class="field">
                    <label>Obriga&ccedil;&otilde;es e restri&ccedil;&otilde;es</label>
                    <textarea rows="4" disabled>${escapeHtml(divindade.obrigacoes_restricoes || "")}</textarea>
                  </div>
                </div>
              </div>

              <div class="t20-divider"></div>

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

            <div class="t20-divider"></div>

            <div class="actions mf-evolucao-divindade-actions">
              <button
                class="mf-add-habilidade-btn mf-classe-submodal-btn-ok"
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
    if (divindadeEhNenhum(divindade)) return true;

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
    if (divindadeEhNenhum(divindade)) {
        state.criacao.divindadePoderSelecionadoNome = "";
        return aplicarNenhumaDivindadeNaFicha(ficha);
    }

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

    // Custom e AmnÃ©sico usam o modal de inventÃ¡rio para itens definidos pelo mestre.
    // NÃ£o geram escolhas automÃ¡ticas de item para nÃ£o travar a etapa.
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
    return fichaTemPericiaTreinadaOuOficio(ficha, opcao.valor || "");
}
function aplicarOrigemNaFichaCriacao() {
    const ficha = getFichaCriacao();
    const origem = getOrigemSelecionadaCriacao();
    if (!ficha || !origem) return false;

    ficha.origem = origem.nome || "";
    ficha.origemId = origem.id || "";

    // AmnÃ©sico sempre recebe o poder Ãºnico automaticamente
    if (origem.id === "amnesico") {
        (origem.habilidades || [])
            .filter(h =>
                normalizarTextoRegra(h.nome || "") === normalizarTextoRegra("LembranÃ§as Graduais"))
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
        const opcoes = getOpcoesEscolhaOrigem(escolha, ficha);
        const habilitadas = opcoes.filter(opcao => !opcaoPericiaIndisponivelNaOrigem(opcao, ficha)).length;
        const necessario = Math.min(quantidade, habilitadas);

        if (selecionadas.length !== necessario) return false;

        const todasConfirmadas = selecionadas.every(opcao => {
            const precisaConfirmar =
                Array.isArray(opcao?.escolhas) && opcao.escolhas.length > 0;

            return !precisaConfirmar || !!opcao?.escolhasConfirmadas;
        });

        if (!todasConfirmadas) return false;

        selecionadas.forEach(opcao => {
            if (opcao.tipoAplicacao === "pericia_treinada") {
                aplicarTreinoPericiaNaFicha(ficha, opcao.valor, "Origem", origem.nome);
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
                        nome: "Poder Ãºnico personalizado",
                        descricao: "NÃ£o aplica efeitos na ficha, use-os na hora de jogar.",
                        custoPm: 0
                    },
                    "Origem",
                    origem.nome
                );
            }

            if (Array.isArray(opcao.escolhasResolvidas)) {
                opcao.escolhasResolvidas.forEach(bloco => {
                    (bloco?.selecionadas || []).forEach(subopcao => {
                        if (subopcao.tipoAplicacao === "pericia_treinada") {
                            aplicarTreinoPericiaNaFicha(ficha, subopcao.valor, "Origem", origem.nome);
                        }

                        if (subopcao.tipoAplicacao === "proficiencia_adicionar") {
                            adicionarProficienciaNaFicha(ficha, subopcao.valor);

                            ficha.efeitosAplicados.push({
                                id: uid(),
                                origemTipo: "Origem",
                                origemNome: origem.nome,
                                tipo: "proficiencia_adicionar",
                                alvo: subopcao.valor
                            });
                        }

                        if (subopcao.tipoAplicacao === "magia_adicionar") {
                            adicionarOuAtualizarMagiaNaFicha(
                                ficha,
                                {
                                    registroId: subopcao.registroId || "",
                                    nome: subopcao.valor || "",
                                    nomeAdicionado: subopcao.nomeAdicionado || "",
                                    tipoMagiaInventor: subopcao.tipoMagiaInventor || "",
                                    origemEspecial: subopcao.origemEspecial || ""
                                },
                                "Origem",
                                origem.nome
                            );
                        }
                    });
                });
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

    const ficha = getFichaCriacao();
    if (!ficha) return false;

    const escolhas = getEscolhasOrigemDisponiveis(origem);

    return escolhas.every(escolha => {
        const valores = getEscolhaOrigemValores(escolha.id);
        const quantidade = getQuantidadeEscolhaOrigem(escolha);
        const opcoes = getOpcoesEscolhaOrigem(escolha, ficha);

        const habilitadas = opcoes.filter(opcao => !opcaoPericiaIndisponivelNaOrigem(opcao, ficha)).length;
        const necessario = Math.min(quantidade, habilitadas);

        if (valores.length !== necessario) return false;

        return valores.every(opcao => {
            const precisaConfirmar =
                Array.isArray(opcao?.escolhas) && opcao.escolhas.length > 0;

            return !precisaConfirmar || !!opcao?.escolhasConfirmadas;
        });
    });
}
function renderEscolhaOrigemCriacaoModal() {
    const f = getFichaCriacao();
    const origem = getOrigemSelecionadaCriacao();
    const escolhaId = state.criacao.escolhaOrigemAbertaId;

    if (!f || !origem || !escolhaId) return "";

    const escolha = getEscolhasOrigemDisponiveis(origem).find(e => e.id === escolhaId);
    if (!escolha) return "";

    const opcoesBase = getOpcoesEscolhaOrigem(escolha, f);
    const selecionados = getEscolhaOrigemValores(escolha.id);
    const quantidade = getQuantidadeEscolhaOrigem(escolha);
    const habilitadas = opcoesBase.filter(opcao => !opcaoPericiaIndisponivelNaOrigem(opcao, f)).length;
    const necessario = Math.min(quantidade, habilitadas);

    const opcoes = ordenarOpcoesParaExibicao(opcoesBase, (opcao) => {
        const checked = selecionados.some(item => item.id === opcao.id) || opcaoGenericaOficioTemEspecializacaoSelecionada(selecionados, opcao);
        const indisponivel = opcaoPericiaIndisponivelNaOrigem(opcao, f);
        return checked || (!indisponivel && (necessario <= 0 || selecionados.length < necessario));
    });

    setTimeout(() => {
        document.body.classList.add("modal-open");
    }, 0);

    return `
      <div class="overlay mf-add-habilidade-overlay" onclick="fecharEscolhaOrigemCriacao()">
        <div class="overlay-card mf-add-habilidade-modal mf-raca-escolha-modal mf-origem-escolha-modal" onclick="event.stopPropagation()">
          <div class="overlay-header mf-add-habilidade-header">
            <div>
              <div class="overlay-title">${escapeHtml(escolha.titulo || "Escolha de origem")}</div>
              <div class="subtitle">
                ${escapeHtml(escolha.descricao || "")}
                ${escolha.descricao ? " &bull; " : ""}
                Selecionados: ${selecionados.length} / ${necessario}
              </div>
            </div>
            <button class="mf-add-habilidade-btn mf-add-habilidade-btn-fechar" onclick="fecharEscolhaOrigemCriacao()">Fechar</button>
          </div>

          <div class="overlay-body mf-add-habilidade-body mf-raca-escolha-body mf-origem-escolha-body">
            <div class="t20-divider"></div>

            <div class="mf-add-habilidade-lista mf-raca-escolha-lista mf-origem-escolha-lista">
              <div class="mf-add-habilidade-lista-head mf-raca-escolha-lista-head">
                <div>Op&ccedil;&atilde;o</div>
                <div>Escolha</div>
              </div>
              ${opcoes.map(opcao => {
        const checked = selecionados.some(item => item.id === opcao.id) || opcaoGenericaOficioTemEspecializacaoSelecionada(selecionados, opcao);
        const indisponivel = opcaoPericiaIndisponivelNaOrigem(opcao, f);
        const disabled = indisponivel || (!checked && necessario > 0 && selecionados.length >= necessario);
        const expandida = opcaoEscolhaEstaExpandida("origem", escolha.id, opcao.id);
        const titulo = getTituloOpcaoEscolha(opcao);
        const descricao = String(opcao.descricao || "").trim();

        return `
                    <div class="mf-add-habilidade-row mf-raca-escolha-row ${disabled ? "disabled" : ""}">
                      <button
                        type="button"
                        class="mf-raca-escolha-main"
                        onclick="toggleExpansaoOpcaoEscolha('origem', '${escapeAttr(escolha.id)}', '${escapeAttr(opcao.id)}')"
                        ${disabled ? "disabled" : ""}
                      >
                        <div class="mf-raca-escolha-info">
                          <div>
                            <div class="mf-add-habilidade-nome">${escapeHtml(titulo)}</div>
                            ${indisponivel ? `<div class="mf-add-habilidade-origem">Voc&ecirc; j&aacute; possui este benef&iacute;cio.</div>` : ""}
                          </div>
                          <div class="mf-raca-escolha-toggle">${expandida ? "&#9650;" : "&#9660;"}</div>
                        </div>

                        ${expandida && descricao ? `<div class="mf-raca-escolha-descricao">${escapeHtml(descricao)}</div>` : ""}
                      </button>

                      <div class="mf-raca-escolha-check-cell">
                        <input
                          class="choice-checkbox mf-raca-escolha-checkbox"
                          type="checkbox"
                          ${checked ? "checked" : ""}
                          ${disabled ? "disabled" : ""}
                          onclick="event.stopPropagation()"
                          onchange='toggleEscolhaOrigemValor("${escapeAttr(escolha.id)}", ${JSON.stringify(opcao).replace(/'/g, "&apos;")}, ${necessario})'
                        >
                      </div>
                    </div>
                  `;
    }).join("")}
            </div>
          </div>
        </div>
      </div>
    `;
}
function getFiltroEscolhaClasseAtual(modo) {
    return modo === "evolucao"
        ? String(state.evolucao?.filtroEscolhaClasse || "")
        : String(state.criacao?.filtroEscolhaClasse || "");
}

function setFiltroEscolhaClasseAtual(modo, valor) {
    if (modo === "evolucao") {
        state.evolucao.filtroEscolhaClasse = String(valor || "");
        return;
    }

    state.criacao.filtroEscolhaClasse = String(valor || "");
}

function agendarFiltroModalEscolhaClasse(modo, valor) {
    setFiltroEscolhaClasseAtual(modo, valor);

    if (filtroEscolhaClasseTimer) {
        clearTimeout(filtroEscolhaClasseTimer);
    }

    filtroEscolhaClasseTimer = setTimeout(() => {
        aplicarFiltroModalEscolhaClasse(modo, valor);
    }, 180);
}

function aplicarFiltroModalEscolhaClasse(modo, valor = "") {
    setFiltroEscolhaClasseAtual(modo, valor);

    const lista = document.getElementById(`lista-escolha-classe-${modo}`);
    if (!lista) return;

    const termo = normalizarTextoRegra(valor);
    let totalVisivel = 0;

    Array.from(lista.querySelectorAll("[data-escolha-classe-nome-normalizado]")).forEach(item => {
        const nomeNormalizado = item.getAttribute("data-escolha-classe-nome-normalizado") || "";
        const exibir = !termo || nomeNormalizado.includes(termo);

        item.style.display = exibir ? "" : "none";

        if (exibir) {
            totalVisivel += 1;
        }
    });

    const mensagem = document.getElementById(`mensagem-sem-opcoes-classe-${modo}`);
    if (mensagem) {
        mensagem.style.display = totalVisivel === 0 ? "block" : "none";
        mensagem.textContent = termo
            ? "Nenhuma opÃ§Ã£o encontrada para essa busca."
            : "Nenhuma opÃ§Ã£o disponÃ­vel para esta escolha.";
    }
}

function limparBuscaModalEscolhaClasse(modo) {
    const campo = document.getElementById(`busca-escolha-classe-${modo}`);
    setFiltroEscolhaClasseAtual(modo, "");

    if (!campo) {
        aplicarFiltroModalEscolhaClasse(modo, "");
        return;
    }

    campo.value = "";
    aplicarFiltroModalEscolhaClasse(modo, "");
    campo.focus();
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
    const opcoesBase = preservarSelecionadosEmOpcoesEscolha(getOpcoesEscolha(escolha, f), selecionados);
    const buscaAtual = getFiltroEscolhaClasseAtual("criacao");

    const opcoes = ordenarOpcoesParaExibicao(opcoesBase, (opcao) => {
        const checked = selecionados.some(item => item.id === opcao.id) || opcaoGenericaOficioTemEspecializacaoSelecionada(selecionados, opcao);
        const desbloqueada = escolhaClasseDesbloqueada(escolha, classe);
        return checked || (desbloqueada && podeSelecionarOpcaoClasse(escolha, opcao));
    });

    setTimeout(() => {
        document.body.classList.add("modal-open");

        const campoBusca = document.getElementById("busca-escolha-classe-criacao");
        if (campoBusca) {
            if (campoBusca.value !== buscaAtual) {
                campoBusca.value = buscaAtual;
            }

            if (state.criacao.deveFocarBuscaEscolhaClasse && document.activeElement !== campoBusca) {
                campoBusca.focus({ preventScroll: true });
            }
            state.criacao.deveFocarBuscaEscolhaClasse = false;
        }

        aplicarFiltroModalEscolhaClasse("criacao", buscaAtual);
    }, 0);

    return `
    <div class="overlay mf-add-habilidade-overlay" onclick="fecharEscolhaClasseCriacao()">
      <div class="overlay-card mf-add-habilidade-modal mf-raca-escolha-modal mf-classe-escolha-modal" onclick="event.stopPropagation()">
        <div class="overlay-header mf-add-habilidade-header">
          <div>
            <div class="overlay-title">${escapeHtml(escolha.titulo || "Escolha")}</div>
            <div class="subtitle">
              ${escapeHtml(escolha.descricao || "")}
              ${escolha.descricao ? " &bull; " : ""}
              Selecionados: ${selecionados.length} / ${quantidade}
            </div>
          </div>
          <button class="mf-add-habilidade-btn mf-add-habilidade-btn-fechar" onclick="fecharEscolhaClasseCriacao()">Fechar</button>
        </div>

        <div class="overlay-body mf-add-habilidade-body mf-raca-escolha-body mf-classe-escolha-body">
          <div class="t20-divider"></div>

          <div class="mf-add-habilidade-search mf-classe-escolha-search">
            <div class="field mf-add-habilidade-field" style="margin:0;">
              <label>Buscar por nome</label>
              <input
                id="busca-escolha-classe-criacao"
                type="search"
                value="${escapeAttr(buscaAtual)}"
                placeholder="Digite o nome do poder ou magia"
                oninput="agendarFiltroModalEscolhaClasse('criacao', this.value)"
                onkeydown="if (event.key === 'Enter') { event.preventDefault(); aplicarFiltroModalEscolhaClasse('criacao', this.value); }"
              >
            </div>

            <div class="mf-add-habilidade-clear">
              <button class="mf-add-habilidade-btn mf-add-habilidade-btn-limpar" type="button" onclick="limparBuscaModalEscolhaClasse('criacao')">
                Limpar
              </button>
            </div>
          </div>

          <div class="t20-divider"></div>

          ${opcoes.length === 0
            ? `<div class="empty">Nenhuma op&ccedil;&atilde;o dispon&iacute;vel para esta escolha.</div>`
            : `
              <div id="mensagem-sem-opcoes-classe-criacao" class="empty" style="display:none; margin-bottom:12px;">Nenhuma op&ccedil;&atilde;o encontrada para essa busca.</div>

              <div class="mf-add-habilidade-lista mf-raca-escolha-lista mf-classe-escolha-lista" id="lista-escolha-classe-criacao">
                <div class="mf-add-habilidade-lista-head mf-raca-escolha-lista-head">
                  <div>Op&ccedil;&atilde;o</div>
                  <div>Escolha</div>
                </div>

                ${opcoes.map(opcao => {
        const checked = selecionados.some(item => item.id === opcao.id) || opcaoGenericaOficioTemEspecializacaoSelecionada(selecionados, opcao);
        const desbloqueada = escolhaClasseDesbloqueada(escolha, classe);
        const disabled = !checked && (!desbloqueada || !podeSelecionarOpcaoClasse(escolha, opcao));
        const expandida = opcaoEscolhaEstaExpandida("classe", escolha.id, opcao.id);
        const titulo = getTituloOpcaoEscolha(opcao);
        const descricao = String(opcao.descricao || "").trim();
        const preReqFaltando = getPreRequisitoNaoAtendidoOpcao(opcao, f);
        const textoBusca = normalizarTextoRegra(titulo || opcao.valor || opcao.label || "");

        return `
                  <div
                    class="mf-add-habilidade-row mf-raca-escolha-row ${disabled ? "disabled" : ""}"
                    data-escolha-classe-nome-normalizado="${escapeAttr(textoBusca)}"
                  >
                    <button
                      type="button"
                      class="mf-raca-escolha-main"
                      onclick="toggleExpansaoOpcaoEscolha('classe', '${escapeAttr(escolha.id)}', '${escapeAttr(opcao.id)}')"
                    >
                      <div class="mf-raca-escolha-info">
                        <div>
                          <div class="mf-add-habilidade-nome">${escapeHtml(titulo)}</div>
                          ${preReqFaltando ? `<div class="mf-add-habilidade-origem">Pr&eacute;-requisito: ${escapeHtml(preReqFaltando)}</div>` : ``}
                        </div>
                        <div class="mf-raca-escolha-toggle">${expandida ? "&#9650;" : "&#9660;"}</div>
                      </div>

                      ${expandida && descricao ? `<div class="mf-raca-escolha-descricao">${escapeHtml(descricao)}</div>` : ``}
                    </button>

                    <div class="mf-raca-escolha-check-cell">
                      <input
                        class="choice-checkbox mf-raca-escolha-checkbox"
                        type="checkbox"
                        ${checked ? "checked" : ""}
                        ${disabled ? "disabled" : ""}
                        onclick="event.stopPropagation()"
                        onchange='toggleEscolhaClasseValor("${escapeAttr(escolha.id)}", ${JSON.stringify(opcao).replace(/'/g, "&apos;")}, ${quantidade})'
                      >
                    </div>
                  </div>
                `;
    }).join("")}
              </div>
            `
        }
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
    const opcoesBase = preservarSelecionadosEmOpcoesEscolha(getOpcoesEscolha(escolha, f), selecionados);
    const buscaAtual = getFiltroEscolhaClasseAtual("evolucao");

    const opcoes = ordenarOpcoesParaExibicao(opcoesBase, (opcao) => {
        const checked = selecionados.some(item => item.id === opcao.id) || opcaoGenericaOficioTemEspecializacaoSelecionada(selecionados, opcao);
        const desbloqueada = escolhaClasseDesbloqueada(escolha, classe);
        return checked || (desbloqueada && podeSelecionarOpcaoClasseEvolucao(escolha, opcao));
    });

    setTimeout(() => {
        document.body.classList.add("modal-open");

        const campoBusca = document.getElementById("busca-escolha-classe-evolucao");
        if (campoBusca) {
            if (campoBusca.value !== buscaAtual) {
                campoBusca.value = buscaAtual;
            }

            if (state.criacao.deveFocarBuscaEscolhaClasse && document.activeElement !== campoBusca) {
                campoBusca.focus({ preventScroll: true });
            }
            state.criacao.deveFocarBuscaEscolhaClasse = false;
        }

        aplicarFiltroModalEscolhaClasse("evolucao", buscaAtual);
    }, 0);

    return `
    <div class="overlay mf-add-habilidade-overlay" onclick="fecharEscolhaClasseEvolucao()">
      <div class="overlay-card mf-add-habilidade-modal mf-raca-escolha-modal mf-classe-escolha-modal" onclick="event.stopPropagation()">
        <div class="overlay-header mf-add-habilidade-header">
          <div>
            <div class="overlay-title">${escapeHtml(escolha.titulo || "Escolha")}</div>
            <div class="subtitle">
              ${escapeHtml(escolha.descricao || "")}
              ${escolha.descricao ? " &bull; " : ""}
              Selecionados: ${selecionados.length} / ${quantidade}
            </div>
          </div>
          <button class="mf-add-habilidade-btn mf-add-habilidade-btn-fechar" onclick="fecharEscolhaClasseEvolucao()">Fechar</button>
        </div>

        <div class="overlay-body mf-add-habilidade-body mf-raca-escolha-body mf-classe-escolha-body">
          <div class="t20-divider"></div>

          <div class="mf-add-habilidade-search mf-classe-escolha-search">
            <div class="field mf-add-habilidade-field" style="margin:0;">
              <label>Buscar por nome</label>
              <input
                id="busca-escolha-classe-evolucao"
                type="search"
                value="${escapeAttr(buscaAtual)}"
                placeholder="Digite o nome do poder ou magia"
                oninput="agendarFiltroModalEscolhaClasse('evolucao', this.value)"
                onkeydown="if (event.key === 'Enter') { event.preventDefault(); aplicarFiltroModalEscolhaClasse('evolucao', this.value); }"
              >
            </div>

            <div class="mf-add-habilidade-clear">
              <button class="mf-add-habilidade-btn mf-add-habilidade-btn-limpar" type="button" onclick="limparBuscaModalEscolhaClasse('evolucao')">
                Limpar
              </button>
            </div>
          </div>

          <div class="t20-divider"></div>

          ${opcoes.length === 0
            ? `<div class="empty">Nenhuma op&ccedil;&atilde;o dispon&iacute;vel para esta escolha.</div>`
            : `
              <div id="mensagem-sem-opcoes-classe-evolucao" class="empty" style="display:none; margin-bottom:12px;">Nenhuma op&ccedil;&atilde;o encontrada para essa busca.</div>

              <div class="mf-add-habilidade-lista mf-raca-escolha-lista mf-classe-escolha-lista" id="lista-escolha-classe-evolucao">
                <div class="mf-add-habilidade-lista-head mf-raca-escolha-lista-head">
                  <div>Op&ccedil;&atilde;o</div>
                  <div>Escolha</div>
                </div>
                ${opcoes.map(opcao => {
                const checked = selecionados.some(item => item.id === opcao.id) || opcaoGenericaOficioTemEspecializacaoSelecionada(selecionados, opcao);
                const desbloqueada = escolhaClasseDesbloqueada(escolha, classe);
                const disabled = !checked && (!desbloqueada || !podeSelecionarOpcaoClasseEvolucao(escolha, opcao));
                const expandida = opcaoEscolhaEstaExpandida("classe", escolha.id, opcao.id);
                const titulo = getTituloOpcaoEscolha(opcao);
                const descricao = String(opcao.descricao || "").trim();
                const preReqFaltando = getPreRequisitoNaoAtendidoOpcao(opcao, f);
                const textoBusca = normalizarTextoRegra(titulo || opcao.valor || opcao.label || "");

                return `
                    <div
                        class="list-item"
                        style="align-items:flex-start; gap:12px; ${disabled ? "opacity:.65;" : ""}"
                        data-escolha-classe-nome-normalizado="${escapeAttr(textoBusca)}"
                    >
                        <button
                            type="button"
                            class="btn ghost"
                            style="flex:1; text-align:left; justify-content:flex-start; padding:0; background:none; border:none;"
                            onclick="toggleExpansaoOpcaoEscolha('classe', '${escolha.id}', '${opcao.id}')"
                        >
                            <div style="display:flex; align-items:flex-start; justify-content:space-between; gap:10px; width:100%;">
                                <div style="flex:1;">
                                    <div class="list-item-title">${escapeHtml(titulo)}</div>
                                    ${preReqFaltando ? `<div class="list-item-sub">Pr&eacute;-requisito: ${escapeHtml(preReqFaltando)}</div>` : ``}
                                    ${expandida && descricao ? `<div class="muted" style="margin-top:8px; white-space:normal; line-height:1.45;">${escapeHtml(descricao)}</div>` : ``}
                                </div>
                                <div class="muted" style="font-size:12px; padding-top:2px;">${expandida ? "&#9650;" : "&#9660;"}</div>
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
            `
        }
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
                aplicarTreinoPericiaNaFicha(ficha, opcao.valor, "Classe", classe.nome);
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
                if (classe.id === "bardo" && escolha.id === "esc_bardo_escolas") {
                    ficha.bardoEscolas = ficha.bardoEscolas || [];

                    const nomeEscola = String(opcao.valor || "").trim();
                    if (nomeEscola && !ficha.bardoEscolas.some(e =>
                        normalizarNomeEscolaMagia(e) === normalizarNomeEscolaMagia(nomeEscola)
                    )) {
                        ficha.bardoEscolas.push(nomeEscola);
                    }

                    ficha.efeitosAplicados.push({
                        id: uid(),
                        origemTipo: "Classe",
                        origemNome: classe.nome,
                        tipo: "escola_magia",
                        alvo: opcao.valor
                    });
                }
            }

            if (opcao.tipoAplicacao === "habilidade_adicionar") {
                if (opcao.escolhaEspecial === "golpe_pessoal") {
                    const registroGolpe = criarRegistroGolpePessoalParaFicha(opcao);

                    adicionarHabilidadeNaFicha(
                        ficha,
                        {
                            nome: registroGolpe.nome,
                            descricao: registroGolpe.descricao || "",
                            custoPm: Number(registroGolpe.custoPm) || 0,
                            custoVida: 0,
                            custoPmPermanente: 0,
                            custoVidaPermanente: 0,
                            resumoUso: registroGolpe.resumoUso || "",
                            registroId: "",
                            ativavel: true,
                            permiteIntensificar: false,
                            incrementos: [],
                            escolhas: [],
                            nomeCurto: registroGolpe.nomeCurto || registroGolpe.nome || "",
                            tipoRegistro: "poder",
                            origemBase: "classe",
                            filtros: registroGolpe.filtros || "",
                            escolhaEspecial: "golpe_pessoal",
                            escolhaEspecialValor: registroGolpe.escolhaEspecialValor || "",
                            golpePessoalConfig: registroGolpe.golpePessoalConfig || null
                        },
                        "Classe",
                        classe.nome
                    );

                    const habilidadeAdicionada = ficha.habilidades?.[ficha.habilidades.length - 1];
                    if (habilidadeAdicionada) {
                        habilidadeAdicionada.registroId = "";
                        habilidadeAdicionada.idPersonalizado = registroGolpe.id || "";
                        habilidadeAdicionada.nome = registroGolpe.nome || habilidadeAdicionada.nome || "";
                        habilidadeAdicionada.nomeCurto = registroGolpe.nomeCurto || registroGolpe.nome || "";
                        habilidadeAdicionada.descricao = registroGolpe.descricao || habilidadeAdicionada.descricao || "";
                        habilidadeAdicionada.custoPm = Number(registroGolpe.custoPm) || 0;
                        habilidadeAdicionada.custoVida = 0;
                        habilidadeAdicionada.custoPmPermanente = 0;
                        habilidadeAdicionada.custoVidaPermanente = 0;
                        habilidadeAdicionada.resumoUso = registroGolpe.resumoUso || "";
                        habilidadeAdicionada.ativavel = true;
                        habilidadeAdicionada.permiteIntensificar = false;
                        habilidadeAdicionada.incrementos = [];
                        habilidadeAdicionada.escolhas = [];
                        habilidadeAdicionada.tipoRegistro = "poder";
                        habilidadeAdicionada.origemBase = "classe";
                        habilidadeAdicionada.filtros = registroGolpe.filtros || "";
                        habilidadeAdicionada.escolhaEspecial = "golpe_pessoal";
                        habilidadeAdicionada.escolhaEspecialValor = registroGolpe.escolhaEspecialValor || "";
                        habilidadeAdicionada.golpePessoalConfig = registroGolpe.golpePessoalConfig || null;
                    }

                    ficha.efeitosAplicados.push({
                        id: uid(),
                        origemTipo: "Classe",
                        origemNome: classe.nome,
                        tipo: "habilidade_adicionar",
                        alvo: registroGolpe.nome || "Golpe Pessoal"
                    });

                    return;
                }

                let registroHabilidade = null;

                if (normalizarTextoRegra(opcao.origemBanco || "") === "geral") {
                    if (opcao.registroId) {
                        registroHabilidade = getRegistroPoderMagiaPorId(opcao.registroId);
                    }

                    if (!registroHabilidade && opcao.valor) {
                        registroHabilidade = getRegistroPoderPorNome(opcao.valor);
                    }
                } else {
                    if (opcao.registroId) {
                        registroHabilidade = getPoderClassePorId(classe.id, opcao.registroId);
                    }

                    if (!registroHabilidade && opcao.valor) {
                        registroHabilidade = getPoderClassePorNome(classe.id, opcao.valor);
                    }
                }

                const nomeHabilidade =
                    opcao.nomeCurto ||
                    registroHabilidade?.nome ||
                    opcao.valor ||
                    "";

                const ehEmpatiaSelvagem = normalizarNomeHabilidade(nomeHabilidade) === "empatia selvagem";
                const temEmpatiaRacial = fichaTemHabilidadeComOrigem(ficha, "Empatia Selvagem", "RaÃ§a");

                if (ehEmpatiaSelvagem && temEmpatiaRacial) {
                    aplicarBonusEmpatiaSelvagemDahllan(ficha, "Classe", classe.nome);
                } else {
                    adicionarHabilidadeNaFicha(
                        ficha,
                        {
                            nome: nomeHabilidade,
                            descricao: registroHabilidade?.descricao || `Escolhido na evoluÃ§Ã£o da classe ${classe.nome}.`,
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

                if (Array.isArray(opcao.escolhasResolvidas)) {
                    opcao.escolhasResolvidas.forEach(bloco => {
                        (bloco?.selecionadas || []).forEach(subopcao => {
                            const nomeBaseOpcao = normalizarTextoRegra(opcao.nomeCurto || opcao.valor || "");

                            if (nomeBaseOpcao === "foco em pericia" && opcao.escolhaEspecialValor) {
                                adicionarHabilidadeNaFicha(
                                    ficha,
                                    {
                                        nome: `Foco em PerÃ­cia: ${opcao.escolhaEspecialValor}`,
                                        descricao: opcao.descricao || "",
                                        custoPm: 0,
                                        custoVida: 0,
                                        custoPmPermanente: 0,
                                        custoVidaPermanente: 0,
                                        resumoUso: "",
                                        registroId: opcao.registroId || "",
                                        ativavel: false,
                                        permiteIntensificar: false,
                                        incrementos: [],
                                        escolhas: []
                                    },
                                    "Classe",
                                    classe.nome
                                );

                                ficha.efeitosAplicados.push({
                                    id: uid(),
                                    origemTipo: "Classe",
                                    origemNome: classe.nome,
                                    tipo: "habilidade_adicionar",
                                    alvo: `Foco em PerÃ­cia: ${opcao.escolhaEspecialValor}`
                                });
                            }

                            if (subopcao.tipoAplicacao === "magia_adicionar") {
                                adicionarOuAtualizarMagiaNaFicha(
                                    ficha,
                                    {
                                        registroId: subopcao.registroId || "",
                                        nome: subopcao.valor || "",
                                        nomeAdicionado: subopcao.nomeAdicionado || "",
                                        tipoMagiaInventor: subopcao.tipoMagiaInventor || "",
                                        origemEspecial: subopcao.origemEspecial || ""
                                    },
                                    "Classe",
                                    classe.nome
                                );

                                const magiaAdicionada = (ficha.magias || []).find(m =>
                                    normalizarTextoRegra(m?.nome || "") === normalizarTextoRegra(subopcao.valor || "")
                                );

                                if (magiaAdicionada && subopcao.origemEspecial === "inventor_formula") {
                                    magiaAdicionada.tipoMagiaInventor = "formula";
                                    magiaAdicionada.prefixoExibicao = "FÃ³rmula";
                                }

                                ficha.efeitosAplicados.push({
                                    id: uid(),
                                    origemTipo: "Classe",
                                    origemNome: classe.nome,
                                    tipo: "magia_adicionar",
                                    alvo: subopcao.valor
                                });
                            }

                            if (subopcao.tipoAplicacao === "pericia_treinada") {
                                aplicarTreinoPericiaNaFicha(ficha, subopcao.valor, "Classe", classe.nome);
                            }
                        });
                    });
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

function getEfeitosExatosClasseNoNivel(classe, nivelClasse, primeiraClasse) {
    return (classe?.efeitos || []).filter(efeito => {
        const nivelMinimo = Number(efeito.nivelMinimo) || 1;
        if (nivelMinimo !== nivelClasse) return false;
        if (efeito.somentePrimeiraClasse && !primeiraClasse) return false;
        return efeitoDeveAparecerNaPrevia("classe", efeito);
    });
}

function getHabilidadesExatasClasseNoNivel(classe, nivelClasse) {
    return (classe?.habilidades || []).filter(h => {
        const nivelMinimo = Number(h.nivelMinimo) || 1;
        return nivelMinimo === nivelClasse;
    });
}

function getEscolhasPlanejadasDoNivelCriacao(item) {
    const ficha = getFichaCriacao();
    if (!ficha || !item?.classe) return [];

    return getEscolhasClasseDisponiveisNoNivel(
        item.classe,
        item.nivelClasse,
        item.primeiraClasse,
        ficha
    );
}

function renderBotaoEscolhaClassePlanejada(item, escolha, nivelLiberado = true) {
    const selecionados = getEscolhaClasseValores(escolha.id);
    const quantidade = Number(escolha.quantidade) || 0;
    const preenchida = escolhaClassePreenchida(escolha);
    const desbloqueada = escolhaClasseDesbloqueada(escolha, item.classe);
    const textoStatus = !nivelLiberado
        ? "Bloqueado"
        : !desbloqueada
        ? "Pendente"
        : preenchida
            ? "Completo"
            : `${selecionados.length}/${quantidade}`;

    return `
      <button
        class="personagens-btn ${preenchida ? "personagens-btn-red" : "personagens-btn-white"} class-choice-btn"
        type="button"
        onclick="abrirEscolhaClassePlanejadaCriacao('${escapeAttr(item.classe.id)}', ${item.nivelClasse}, '${escapeAttr(escolha.id)}')"
        ${(!nivelLiberado || !desbloqueada) ? "disabled" : ""}
        title="${!nivelLiberado ? "Complete os niveis anteriores primeiro." : !desbloqueada ? "Esta escolha depende de outra pendencia." : ""}"
      >
        <span>${escapeHtml(escolha.titulo || escolha.tipo || "Escolha")}</span>
        <small>${escapeHtml(textoStatus)}</small>
      </button>
    `;
}

function renderPlanejamentoClassesCriacao(ficha) {
    const plano = getPlanoClassesCriacao();
    const total = getTotalNiveisPlanoClassesCriacao();

    return `
      <div class="panel criacao-classe-panel">
        <div class="panel-title criacao-etapa-title">Classes</div>
        <div class="panel-body criacao-classe-body">
          <div class="class-plan-list">
            ${plano.map((item, index) => {
                const classe = getClasseDoBanco(item.classeId);
                const escolhidas = getClassesEscolhidasPlanoCriacao(index);
                const legenda = index === 0 ? "Primeira classe" : "Multiclasse";

                return `
                  <div class="class-plan-item">
                    <div class="class-plan-label">${escapeHtml(legenda)}</div>

                    <div class="class-plan-controls">
                      <div class="field class-plan-class-field">
                        <label>Classe</label>
                        <select onchange="selecionarClassePlanoCriacao(${index}, this.value)">
                          <option value="">Selecione...</option>
                          ${CLASSES_DB.map(c => `
                            <option
                              value="${c.id}"
                              ${item.classeId === c.id ? "selected" : ""}
                              ${escolhidas.has(c.id) ? "disabled" : ""}
                            >
                              ${escapeHtml(c.nome)}
                            </option>
                          `).join("")}
                        </select>
                      </div>

                      <div class="field class-level-field">
                        <label>N&iacute;veis</label>
                        <div class="level-stepper">
                          <button class="btn ghost class-level-btn" type="button" onclick="ajustarNivelPlanoClasseCriacao(${index}, -1)" ${Number(item.niveis) <= 1 ? "disabled" : ""}>-</button>
                          <input
                            type="number"
                            min="1"
                            max="${NIVEL_MAXIMO_PLANO_CLASSES_CRIACAO}"
                            value="${escapeAttr(String(item.niveis || 1))}"
                            onchange="alterarNivelPlanoClasseCriacao(${index}, this.value)"
                          >
                          <button class="btn ghost class-level-btn" type="button" onclick="ajustarNivelPlanoClasseCriacao(${index}, 1)" ${total >= NIVEL_MAXIMO_PLANO_CLASSES_CRIACAO ? "disabled" : ""}>+</button>
                        </div>
                      </div>
                    </div>

                    <div class="class-plan-preview">
                      ${classe
                        ? `
                          <strong>${escapeHtml(classe.nome || "")}</strong>
                          <span>PV inicial ${escapeHtml(String(classe.pvNivel1 || 0))} | PV n&iacute;vel ${escapeHtml(String(classe.pvPorNivel || 0))} | PM n&iacute;vel ${escapeHtml(String(classe.pmPorNivel || 0))}</span>
                        `
                        : `<span class="empty">Escolha uma classe.</span>`
                    }
                    </div>

                    <div class="actions class-plan-actions">
                      ${index === 0
                        ? ``
                        : `<button class="personagens-btn personagens-btn-white class-plan-remove" type="button" onclick="removerClassePlanoCriacao(${index})">Remover</button>`
                    }
                    </div>
                  </div>
                `;
            }).join("")}
          </div>

          <div class="actions criacao-classe-actions">
            <button
              class="personagens-btn personagens-btn-red class-plan-add"
              type="button"
              onclick="adicionarMulticlasseCriacao()"
              ${plano.length >= CLASSES_DB.length || total >= NIVEL_MAXIMO_PLANO_CLASSES_CRIACAO ? "disabled" : ""}
            >
              + Multiclasse
            </button>

            <div class="criacao-classe-next-group">
              <button class="personagens-btn personagens-btn-white class-plan-start" type="button" onclick="iniciarFluxoClasseCriacao()" ${!planoClassesCriacaoValido() ? "disabled" : ""}>
              Escolher poderes e magias
              </button>
              <div class="class-plan-total">N&iacute;vel total planejado: ${escapeHtml(String(total || 0))}/${NIVEL_MAXIMO_PLANO_CLASSES_CRIACAO}</div>
            </div>
          </div>

          <div class="t20-divider class-plan-total-divider"></div>
        </div>
      </div>
    `;
}

function renderResolucaoClassesCriacao(ficha) {
    aplicarPlanoClassesNaFichaCriacao();
    sincronizarFichaTemporariaClassesCriacao();

    const niveis = getNiveisPlanejadosClassesCriacao();
    const pendencias = getPendenciasClassesPlanejadasCriacao();

    return `
      <div class="panel criacao-classe-panel criacao-classe-escolhas-panel">
        <div class="panel-title criacao-etapa-title">Escolhas</div>
        <div class="panel-body criacao-classe-body">
          <div class="class-choice-warning">
            Alterar escolhas de um n&iacute;vel j&aacute; conclu&iacute;do apagar&aacute; as escolhas dos n&iacute;veis seguintes.
          </div>

          <div class="class-choice-grid">
            ${niveis.map((item, index) => {
                const nivelLiberado = nivelPlanejadoClassesCriacaoLiberado(index);
                const nivelCompleto = nivelPlanejadoClassesCriacaoPreenchido(item);
                const habilidades = getHabilidadesExatasClasseNoNivel(item.classe, item.nivelClasse);
                const efeitos = getEfeitosExatosClasseNoNivel(item.classe, item.nivelClasse, item.primeiraClasse);
                const escolhas = getEscolhasPlanejadasDoNivelCriacao(item);
                const escolhasMagias = escolhas.filter(e => normalizarTextoRegra(e.tipo || "") === "magia");
                const escolhasPoderes = escolhas.filter(e => normalizarTextoRegra(e.tipo || "") !== "magia");

                return `
                  <div class="class-choice-row ${!nivelLiberado ? "is-locked" : ""} ${nivelCompleto ? "is-complete" : ""}">
                    <div class="class-choice-info">
                      <div class="class-choice-heading">
                        <strong>${escapeHtml(item.classe.nome || "")}</strong>
                        <span>${!nivelLiberado ? "Bloqueado | " : ""}Nivel ${escapeHtml(String(item.nivelClasse))}${item.primeiraClasse && item.nivelClasse === 1 ? " | principal" : ""}</span>
                      </div>

                      <div class="class-auto-list">
                        ${item.nivelClasse === 1 && item.primeiraClasse
                            ? `<div><strong>PV inicial:</strong> ${escapeHtml(String(item.classe.pvNivel1 || 0))}</div>`
                            : ""
                        }
                        <div><strong>PV:</strong> +${escapeHtml(String(item.classe.pvPorNivel || 0))}</div>
                        <div><strong>PM:</strong> +${escapeHtml(String(item.classe.pmPorNivel || 0))}</div>

                        ${habilidades.map(h => `
                          <div>
                            <strong>${escapeHtml(h.nome || "Habilidade")}</strong>
                            ${h.descricao ? `<span>${escapeHtml(h.descricao)}</span>` : ""}
                          </div>
                        `).join("")}

                        ${efeitos.map(e => `
                          <div>
                            <strong>${escapeHtml(traduzirTipoEfeito(e.tipo || "efeito"))}</strong>
                            <span>${escapeHtml(descreverEfeitoParaCardEscolhaClasse(e))}</span>
                          </div>
                        `).join("")}
                      </div>
                    </div>

                    <div class="class-choice-actions">
                      <div>
                        <div class="class-choice-column-title">Poderes e escolhas</div>
                        ${!escolhasPoderes.length
                            ? `<div class="empty">Sem escolhas.</div>`
                            : escolhasPoderes.map(escolha => renderBotaoEscolhaClassePlanejada(item, escolha, nivelLiberado)).join("")
                        }
                      </div>

                      <div>
                        <div class="class-choice-column-title">Magias</div>
                        ${!escolhasMagias.length
                            ? `<div class="empty">Sem magias.</div>`
                            : escolhasMagias.map(escolha => renderBotaoEscolhaClassePlanejada(item, escolha, nivelLiberado)).join("")
                        }
                      </div>
                    </div>
                  </div>
                `;
            }).join("")}
          </div>

          ${pendencias.length
            ? `
              <div class="notice class-choice-pendencias">
                Pendencias: ${escapeHtml(pendencias.slice(0, 6).join("; "))}
                ${pendencias.length > 6 ? ` e mais ${pendencias.length - 6}.` : ""}
              </div>
            `
            : ""
        }

          <div class="actions criacao-classe-actions class-choice-footer">
            <button class="personagens-btn personagens-btn-white class-choice-back" type="button" onclick="state.criacao.fluxoClasseAtivo = false; state.criacao.classeEvolucaoContexto = null; render()">Voltar classes</button>
            <button class="personagens-btn personagens-btn-red class-choice-confirm" type="button" onclick="concluirPlanejamentoClassesCriacao()" ${pendencias.length ? "disabled" : ""}>
              Confirmar classes
            </button>
          </div>
        </div>
      </div>
    `;
}

function renderConteudoEtapaClassesCriacao(ficha) {
    if (!state.criacao.fluxoClasseAtivo) {
        return renderPlanejamentoClassesCriacao(ficha);
    }

    return renderResolucaoClassesCriacao(ficha);
}

function renderAtributosRaciaisCriacao(raca) {
    const atributos = [
        ["forca", "FOR"],
        ["destreza", "DES"],
        ["constituicao", "CON"],
        ["inteligencia", "INT"],
        ["sabedoria", "SAB"],
        ["carisma", "CAR"]
    ];

    if (!raca) {
        return `<div class="empty">Nenhuma ra&ccedil;a selecionada.</div>`;
    }

    if (raca.tipoAtributo === "fixo") {
        return `
          <div class="criacao-raca-attrs-line">
            ${atributos.map(([attr, nome]) => `
              <div class="criacao-raca-attr-box">
                <strong>${nome}</strong>
                <span>${Number(raca.atributosFixos?.[attr]) || 0}</span>
              </div>
            `).join("")}
          </div>
        `;
    }

    if (racaUsaDistribuicaoLivre(raca)) {
        const bloqueados = getAtributosBloqueadosDistribuicaoRacial(raca);
        return `
          <div class="criacao-raca-notice">
            Escolha 3 atributos diferentes para receber +1.
            ${bloqueados.length
                ? `<br>Atributos bloqueados: <strong>${bloqueados.map(attr => ({
                    forca: "For&ccedil;a",
                    destreza: "Destreza",
                    constituicao: "Constitui&ccedil;&atilde;o",
                    inteligencia: "Intelig&ecirc;ncia",
                    sabedoria: "Sabedoria",
                    carisma: "Carisma"
                }[attr] || attr)).join(", ")}</strong>`
                : ""
            }
            <br>Selecionados: <strong>${state.criacao.racaDistribuicao.length} / 3</strong>
          </div>

          <div class="criacao-raca-attrs-line criacao-raca-attrs-escolha">
            ${atributos.map(([attr, nome]) => {
                const bloqueado = !atributoPermitidoNaDistribuicaoRacial(raca, attr);
                const selecionado = state.criacao.racaDistribuicao.includes(attr);
                const limiteAtingido = !selecionado && state.criacao.racaDistribuicao.length >= 3;

                return `
                  <label class="criacao-raca-attr-box criacao-raca-attr-choice ${selecionado ? "is-selected" : ""} ${(bloqueado || limiteAtingido) ? "is-disabled" : ""}">
                    <strong>${nome}</strong>
                    <span>${selecionado ? "+1" : "0"}</span>
                    <input
                      class="criacao-raca-attr-check-input"
                      type="checkbox"
                      ${selecionado ? "checked" : ""}
                      ${(bloqueado || limiteAtingido) ? "disabled" : ""}
                      onchange="toggleAtributoDistribuicaoRacial('${attr}')"
                    >
                    <span class="criacao-raca-attr-check" aria-hidden="true"></span>
                  </label>
                `;
            }).join("")}
          </div>
        `;
    }

    return `
      <div class="criacao-raca-attrs-line criacao-raca-attrs-custom">
        ${atributos.map(([attr, nome]) => `
          <label class="criacao-raca-attr-box">
            <strong>${nome}</strong>
            <input
              type="number"
              value="${escapeAttr(raca.atributosFixos?.[attr] || 0)}"
              oninput="updateRacaCustomAtributo('${attr}', this.value)"
            >
          </label>
        `).join("")}
      </div>
    `;
}

function renderHabilidadesRaciaisCriacao(raca) {
    if (!raca) {
        return `<div class="empty">Nenhuma ra&ccedil;a selecionada.</div>`;
    }

    if (raca.id === "custom") {
        return `
          <div class="field criacao-raca-textarea-field">
            <label>Habilidades (uma por linha)</label>
            <textarea oninput="updateRacaCustom('habilidadesTexto', this.value)">${escapeHtml(state.criacao.racaCustom.habilidadesTexto || "")}</textarea>
          </div>
        `;
    }

    if (!(raca.habilidades || []).length) {
        return `<div class="empty">Sem habilidades cadastradas.</div>`;
    }

    return `
      <div class="criacao-raca-list">
        ${(raca.habilidades || []).map(h => `
          <div class="criacao-raca-list-item">
            <strong>${escapeHtml(h.nome || "Habilidade")}</strong>
            <span>${escapeHtml(h.descricao || "")}</span>
          </div>
        `).join("")}
      </div>
    `;
}

function renderEscolhasRaciaisCriacao(escolhasRaciaisDisponiveis) {
    if (!escolhasRaciaisDisponiveis.length) {
        return `<div class="empty">Sem escolhas cadastradas.</div>`;
    }

    return `
      <div class="criacao-raca-list">
        ${escolhasRaciaisDisponiveis.map(escolha => {
            const selecionados = getEscolhaRacialValores(escolha.id);
            const quantidade = Number(escolha.quantidade) || 0;
            const preenchida = escolhaRacialPreenchida(escolha);
            const desbloqueada = escolhaRacialDesbloqueada(escolha);

            return `
              <div class="criacao-raca-list-item criacao-raca-escolha-item">
                <div>
                  <strong>${escapeHtml(escolha.titulo || escolha.tipo || "Escolha")}</strong>
                  <span>
                    ${escapeHtml(escolha.descricao || "")}
                    ${escolha.descricao ? "<br>" : ""}
                    Selecionados: ${selecionados.length} / ${quantidade}
                  </span>
                </div>
                <div class="criacao-raca-escolha-actions">
                  <button class="criacao-raca-escolher-btn" type="button" onclick="abrirEscolhaCriacao('${escolha.id}')" ${!desbloqueada ? "disabled" : ""}>
                    Escolher
                  </button>
                  <span class="${!desbloqueada ? "is-pending" : preenchida ? "is-complete" : "is-pending"}">
                    ${!desbloqueada ? "Pendente" : preenchida ? "Completo" : "Pendente"}
                  </span>
                </div>
              </div>
            `;
        }).join("")}
      </div>
    `;
}

function renderConteudoEtapaCriacao() {
    const f = getFichaCriacao();
    if (!f) return "";

    const etapa = state.criacao.etapa;

    if (etapa === 0) {
        return `
      <div class="panel criacao-identidade-panel">
        <div class="panel-title criacao-etapa-title">Identidade</div>
        <div class="panel-body criacao-identidade-body">
          <div class="criacao-identidade-container">
            <div class="row-2 criacao-identidade-grid">
              <div class="field criacao-identidade-field">
                <label>Nome do personagem</label>
                <input value="${escapeAttr(f.nome)}" onchange="updateFichaCriacao('nome', this.value)">
              </div>

              <div class="field criacao-identidade-field">
                <label>Nome do jogador</label>
                <input value="${escapeAttr(f.jogador)}" onchange="updateFichaCriacao('jogador', this.value)">
              </div>
            </div>

            <div class="criacao-imagem-personagem">
              <input
                id="criacaoImagemPersonagemInput"
                type="file"
                accept="image/png,image/jpeg"
                onchange="selecionarImagemPersonagemCriacao(this)"
                hidden
              >
              ${renderBotaoAvatarPersonagem(f, "criacao-imagem-preview-btn")}
            </div>
          </div>
        </div>
      </div>
    `;
    }

    if (etapa === 1) {
        return `
      <div class="panel criacao-atributos-panel">
        <div class="panel-title criacao-etapa-title">Atributos</div>
        <div class="panel-body criacao-atributos-body">
          <div class="criacao-identidade-container criacao-atributos-container">
          <div class="criacao-atributos-pontos">
            Pontos disponÃ­veis: <strong>${f.pontosAtributoAtuais}</strong>
            <button class="criacao-add-ponto-btn" type="button" onclick="adicionarPontoAtributoCriacao()" aria-label="Adicionar 1 ponto">+1</button>
          </div>

          <div class="criacao-atributos-grid">
  ${renderAtributoCriacao("For", "forca", getAtributoBase(f, "forca"))}
  ${renderAtributoCriacao("Des", "destreza", getAtributoBase(f, "destreza"))}
  ${renderAtributoCriacao("Con", "constituicao", getAtributoBase(f, "constituicao"))}
  ${renderAtributoCriacao("Int", "inteligencia", getAtributoBase(f, "inteligencia"))}
  ${renderAtributoCriacao("Sab", "sabedoria", getAtributoBase(f, "sabedoria"))}
  ${renderAtributoCriacao("Car", "carisma", getAtributoBase(f, "carisma"))}
            </div>
          </div>
        </div>
      </div>
    `;
    }

    if (etapa === 2) {
        const raca = getRacaSelecionadaCriacao();
        const escolhasRaciaisDisponiveis = getEscolhasRaciaisDisponiveis(raca, f);

        return `
          <div class="panel criacao-raca-panel">
            <div class="panel-title criacao-etapa-title">Ra&ccedil;a</div>
            <div class="panel-body criacao-raca-body">
              <div class="criacao-raca-top">
                <div class="criacao-identidade-container criacao-raca-container criacao-raca-select-card">
                  <div class="field criacao-raca-field">
                    <label>Escolha a ra&ccedil;a</label>
                    <select onchange="selecionarRacaCriacao(this.value)">
                      <option value="">Selecione...</option>
                      ${RACAS_DB.map(r => `
                        <option value="${r.id}" ${state.criacao.racaSelecionadaId === r.id ? "selected" : ""}>
                          ${escapeHtml(r.nome)}
                        </option>
                      `).join("")}
                      <option value="custom" ${state.criacao.racaSelecionadaId === "custom" ? "selected" : ""}>Custom</option>
                    </select>
                  </div>
                </div>

                <div class="criacao-identidade-container criacao-raca-container criacao-raca-preview-card">
                  <div class="criacao-raca-container-title">Pr&eacute;via</div>
                  <div class="criacao-raca-preview-grid">
                    <div>
                      <strong>Ra&ccedil;a</strong>
                      <span>${escapeHtml(raca?.nome || "-")}</span>
                    </div>
                    <div>
                      <strong>Tamanho</strong>
                      ${raca?.id === "custom"
                        ? `<input value="${escapeAttr(raca.tamanho || "")}" oninput="updateRacaCustom('tamanho', this.value)">`
                        : `<span>${escapeHtml(raca?.tamanho || "-")}</span>`
                    }
                    </div>
                    <div>
                      <strong>Desloc</strong>
                      ${raca?.id === "custom"
                        ? `<input value="${escapeAttr(raca.deslocamento || "")}" oninput="updateRacaCustom('deslocamento', this.value)">`
                        : `<span>${escapeHtml(raca?.deslocamento || "-")}</span>`
                    }
                    </div>
                  </div>
                </div>
              </div>

              <div class="criacao-identidade-container criacao-raca-container criacao-raca-atributos-card">
                <div class="criacao-raca-container-title">Atributos Raciais</div>
                ${renderAtributosRaciaisCriacao(raca)}
              </div>

              <div class="criacao-identidade-container criacao-raca-container criacao-raca-habilidades-card">
                <div class="criacao-raca-container-title">Habilidades Raciais</div>
                ${renderHabilidadesRaciaisCriacao(raca)}
              </div>

              <div class="criacao-identidade-container criacao-raca-container criacao-raca-escolhas-card">
                <div class="criacao-raca-container-title">Escolhas</div>
                ${renderEscolhasRaciaisCriacao(escolhasRaciaisDisponiveis)}
              </div>
            </div>
          </div>
        `;

        return `
    <div class="panel">
      <div class="panel-title">RaÃ§a</div>
      <div class="panel-body">
        <div class="field">
          <label>Escolha a raÃ§a</label>
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
                ? `<div style="margin-top:14px;" class="panel"><div class="panel-body"><div class="empty">Nenhuma raÃ§a selecionada.</div></div></div>`
                : `
          <div style="height:14px"></div>

          <div class="panel">
            <div class="panel-title">PrÃ©via da raÃ§a</div>
            <div class="panel-body">
              <div class="row-3">
                <div class="field">
                  <label>RaÃ§a</label>
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
                        ["forca", "ForÃ§a"],
                        ["destreza", "Destreza"],
                        ["constituicao", "ConstituiÃ§Ã£o"],
                        ["inteligencia", "InteligÃªncia"],
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
                                    forca: "ForÃ§a",
                                    destreza: "Destreza",
                                    constituicao: "ConstituiÃ§Ã£o",
                                    inteligencia: "InteligÃªncia",
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
                            ["forca", "ForÃ§a"],
                            ["destreza", "Destreza"],
                            ["constituicao", "ConstituiÃ§Ã£o"],
                            ["inteligencia", "InteligÃªncia"],
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
                  ${bloqueado ? `<div class="muted" style="font-size:12px;">IndisponÃ­vel para esta raÃ§a</div>` : ``}
                </div>
                <input
  class="choice-checkbox"
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
                            ["forca", "ForÃ§a"],
                            ["destreza", "Destreza"],
                            ["constituicao", "ConstituiÃ§Ã£o"],
                            ["inteligencia", "InteligÃªncia"],
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
                        const preenchida = escolhaRacialPreenchida(escolha);
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
    <span style="font-weight:bold; color:${!desbloqueada ? "var(--status-bloqueado)" : preenchida ? "var(--status-preenchido)" : "var(--status-vazio)"};">
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
        return renderConteudoEtapaClassesCriacao(f);

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
                  <div class="panel-title">PrÃ©via da classe</div>
                  <div class="panel-body">
                    <div class="row-3">
                      <div class="field">
                        <label>Classe</label>
                        <input value="${escapeAttr(classeSelecionada.nome || "")}" disabled>
                      </div>
                      <div class="field">
                        <label>PV no nÃ­vel 1</label>
                        <input value="${escapeAttr(classeSelecionada.pvNivel1 || 0)}" disabled>
                      </div>
                      <div class="field">
                        <label>PM por nÃ­vel</label>
                        <input value="${escapeAttr(classeSelecionada.pmPorNivel || 0)}" disabled>
                      </div>
                    </div>

                    <div style="height:14px"></div>

                    <div class="panel">
                      <div class="panel-title">DescriÃ§Ã£o</div>
                      <div class="panel-body">
                        ${classeSelecionada.descricao ? escapeHtml(classeSelecionada.descricao) : `<span class="empty">Sem descriÃ§Ã£o.</span>`}
                      </div>
                    </div>
                  </div>
                </div>

                <div style="height:14px"></div>

                <div class="actions">
                  <button class="btn primary" onclick="iniciarFluxoClasseCriacao()">Prosseguir para evoluÃ§Ã£o</button>
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
        <div class="panel-title">EvoluÃ§Ã£o de classes</div>
        <div class="panel-body">
          <div class="notice">
            Classes atuais: <strong>${escapeHtml(formatarClassesPersonagem(ficha))}</strong><br>
            NÃ­vel total: <strong>${getNivelTotalPersonagem(ficha)}</strong>
          </div>

          <div style="height:14px"></div>

          <div class="field">
            <label>Escolha a classe para o prÃ³ximo nÃ­vel</label>
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
              Abrir prÃ³ximo nÃ­vel
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
      <div class="panel-title">EvoluÃ§Ã£o de classe</div>
      <div class="panel-body">
        <div class="notice">
          Resumo atual: <strong>${escapeHtml(formatarClassesPersonagem(ficha))}</strong><br>
          NÃ­vel total atual: <strong>${getNivelTotalPersonagem(ficha)}</strong>
        </div>

        <div style="height:14px"></div>

        <div class="row-3">
          <div class="field">
            <label>Classe</label>
            <input value="${escapeAttr(classeEmResolucao.nome)}" disabled>
          </div>
          <div class="field">
            <label>NÃ­vel da classe que serÃ¡ alcanÃ§ado</label>
            <input value="${escapeAttr(ctx.nivelAlvo)}" disabled>
          </div>
          <div class="field">
            <label>Primeira classe?</label>
            <input value="${ctx.primeiraClasse ? "Sim" : "NÃ£o"}" disabled>
          </div>
        </div>
      </div>
    </div>

    <div style="height:14px"></div>

    <div class="panel">
      <div class="panel-title">Ganho automÃ¡tico deste nÃ­vel</div>
      <div class="panel-body">
        <div class="list">
          ${ctx.nivelAlvo === 1 && ctx.primeiraClasse
                ? `<div class="list-item"><div class="list-item-title">PV no nÃ­vel 1</div><div>${classeEmResolucao.pvNivel1 || 0}</div></div>`
                : ""
            }
          <div class="list-item"><div class="list-item-title">PV por nÃ­vel</div><div>${classeEmResolucao.pvPorNivel || 0}</div></div>
          <div class="list-item"><div class="list-item-title">PM por nÃ­vel</div><div>${classeEmResolucao.pmPorNivel || 0}</div></div>
        </div>
      </div>
    </div>

    <div style="height:14px"></div>

    <div class="panel">
      <div class="panel-title">Habilidades deste nÃ­vel</div>
      <div class="panel-body">
        ${!habilidadesDoNivel.length
                ? `<div class="empty">Sem habilidades novas neste nÃ­vel.</div>`
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
      <div class="panel-title">Efeitos automÃ¡ticos deste nÃ­vel</div>
      <div class="panel-body">
        ${!efeitosDoNivel.filter(e => efeitoDeveAparecerNaPrevia("classe", e)).length
                ? `<div class="empty">Sem efeitos automÃ¡ticos visÃ­veis neste nÃ­vel.</div>`
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
      <div class="panel-title">Escolhas deste nÃ­vel</div>
      <div class="panel-body">
        ${!escolhasDoNivel.length
                ? `<div class="empty">Sem escolhas obrigatÃ³rias neste nÃ­vel.</div>`
                : `
              <div class="list">
                ${escolhasDoNivel.map(escolha => {
                    const selecionados = getEscolhaClasseValores(escolha.id);
                    const quantidade = Number(escolha.quantidade) || 0;
                    const preenchida = selecionados.length === quantidade;
                    const desbloqueada = escolhaClasseDesbloqueada(escolha, classe);
                    const travada = escolhaClasseTemOpcaoConfirmada(escolha.id);

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
                        <button class="btn" onclick="abrirEscolhaClasseCriacao('${escolha.id}')" ${(!desbloqueada || travada) ? "disabled" : ""}>
                          ${travada ? "Completo" : "Escolher"}
                        </button>
                        <span style="font-weight:bold; color:${(!desbloqueada || travada) ? "var(--status-preenchido)" : preenchida ? "var(--status-preenchido)" : "var(--status-vazio)"};">
                          ${(!desbloqueada || travada) ? "Completo" : preenchida ? "Completo" : "Pendente"}
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
      <button class="btn" onclick="abrirSelecaoProximoNivelClasse()">Voltar para seleÃ§Ã£o de classe</button>
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
                normalizarTextoRegra(h.nome || "") === normalizarTextoRegra("LembranÃ§as Graduais")
            )
            : [];
        const origemUsaItensLivres = origem?.id === "custom" || origem?.id === "amnesico";
        const itensBanco = parseListaPipe(origem?.itensBancoFixos);
        const itensCustom = parseListaPipe(origem?.itensCustomFixos);
        const itensEscolhaBanco = parseListaPipe(origem?.itensBancoEscolha);
        const itensEscolhaCustom = parseListaPipe(origem?.itensCustomEscolha);
        const itensJaAdicionadosNaOrigem = origemUsaItensLivres ? (f.inventario || []) : [];

        return `
      <div class="panel criacao-origem-panel">
        <div class="panel-title criacao-etapa-title">Origem</div>
        <div class="panel-body criacao-origem-body">
          <div class="criacao-identidade-container criacao-origem-container">
          <div class="field criacao-identidade-field criacao-origem-field">
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
        Use o botÃ£o abaixo para adicionar os itens da origem ao inventÃ¡rio sem limite de preÃ§o.
        ${origem.id === "amnesico"
                        ? " O limite de T$ e a escolha dos itens ficam a critÃ©rio do mestre."
                        : " Os itens da origem custom sÃ£o definidos com o mestre."
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
    <div class="panel-title">Itens jÃ¡ adicionados</div>
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
                          <span style="font-weight:bold; color:var(--status-preenchido);">AutomÃ¡tico</span>
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
                        const opcoes = getOpcoesEscolhaOrigem(escolha, f);
                        const habilitadas = opcoes.filter(opcao => !opcaoPericiaIndisponivelNaOrigem(opcao, f)).length;
                        const necessario = Math.min(quantidade, habilitadas);
                        const preenchida = selecionados.length === necessario && selecionados.every(opcao => {
                            const precisaConfirmar =
                                Array.isArray(opcao?.escolhas) && opcao.escolhas.length > 0;
                            return !precisaConfirmar || !!opcao?.escolhasConfirmadas;
                        });

                        return `
                                  <div class="list-item">
                                    <div>
                                      <div class="list-item-title">${escapeHtml(escolha.titulo || "Escolha")}</div>
                                      <div class="list-item-sub">
                                        ${escapeHtml(escolha.descricao || "")}
                                        ${escolha.descricao ? "<br>" : ""}
                                        Selecionados: ${selecionados.length} / ${necessario}
                                      </div>
                                    </div>

                                    <div class="actions">
                                      <button class="btn" onclick="abrirEscolhaOrigemCriacao('${escolha.id}')">Escolher</button>
                                      <span style="font-weight:bold; color:${preenchida ? "var(--status-preenchido)" : "var(--status-vazio)"};">
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
        const divindadeNenhuma = divindadeEhNenhum(divindade);

        return `
  <div class="panel criacao-divindade-panel">
    <div class="panel-title criacao-etapa-title">Divindade</div>
    <div class="panel-body criacao-divindade-body">
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
        ${divindade ? `
          <div class="notice criacao-divindade-descricao">
            ${escapeHtml(divindade.descricao || "")}
          </div>
        ` : ``}
        ${divindadeTravada ? `<div class="hint">Esta divindade foi definida pela sua classe e n&atilde;o pode ser alterada aqui.</div>` : ``}
      </div>

      ${divindadeTravada && !divindadeNenhuma ? `
        <div style="height:12px"></div>
        <div class="notice">
          Sua divindade j&aacute; foi definida pela classe. Falta apenas escolher o poder concedido.
        </div>
      ` : ``}

      ${!divindadesDisponiveis.length
                ? `
          <div style="height:12px"></div>
          <div class="notice">Nenhuma divindade dispon&iacute;vel para a combina&ccedil;&atilde;o atual de ra&ccedil;a/classe.</div>
        `
                : !divindade
                    ? `
            <div style="height:12px"></div>
            <div class="notice">Escolha uma divindade para ver suas informa&ccedil;&otilde;es e selecionar um poder concedido.</div>
          `
                    : divindadeNenhuma
                        ? ``
                    : `
            <div style="height:12px"></div>

            <div class="panel">
              <div class="panel-title">Informa&ccedil;&otilde;es da divindade</div>
              <div class="panel-body">
                <div class="field">
                  <label>Cren&ccedil;as e objetivos</label>
                  <textarea rows="4" disabled>${escapeHtml(divindade.crencas_e_objetivos || "")}</textarea>
                </div>

                <div style="height:12px"></div>

                <div class="row-3">
                  <div class="field">
                    <label>S&iacute;mbolo</label>
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
                  <label>Obriga&ccedil;&otilde;es e restri&ccedil;&otilde;es</label>
                  <textarea rows="5" disabled>${escapeHtml(divindade.obrigacoes_restricoes || "")}</textarea>
                </div>
              </div>
            </div>

            <div style="height:12px"></div>

            <div class="panel">
              <div class="panel-title">Poderes concedidos poss&iacute;veis</div>
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
      <div class="panel criacao-equipamentos-panel">
        <div class="panel-title criacao-etapa-title">Equipamentos</div>
        <div class="panel-body criacao-equipamentos-body">
          <div class="criacao-equipamentos-container">
            <div class="panel criacao-equipamentos-money-panel">
              <div class="panel-title">Dinheiro inicial</div>
              <div class="panel-body">
                <div class="field criacao-equipamentos-field">
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

            ${renderInventarioSimples(f)}
          </div>
        </div>
      </div>
    `;
    }

    return `
    <div class="panel">
      <div class="panel-title">RevisÃ£o</div>
      <div class="panel-body">
        <div class="notice">
          Revise os dados do personagem. Ao concluir, a ficha serÃ¡ salva e aberta na tela de jogo.
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
    <div class="screen criacao-screen">
      <div class="topbar criacao-topbar">
        <div class="criacao-top-spacer" aria-hidden="true"></div>
        <img src="images/tormenta.png" alt="Tormenta" class="criacao-logo-image">
        <button class="personagens-btn personagens-btn-red personagens-btn-back criacao-voltar-btn" onclick="cancelarCriacaoFicha()">VOLTAR</button>
      </div>

      <div class="t20-divider criacao-main-divider"></div>

      <div class="criacao-layout">
  <div class="criacao-main">
    ${renderConteudoEtapaCriacao()}

    <div style="height:14px"></div>

    <div class="criacao-bottom-actions ${state.criacao.etapa === 3 ? "criacao-bottom-actions-classe" : ""}">
      <div class="actions criacao-nav-actions">
        <button class="btn criacao-nav-btn criacao-nav-voltar" onclick="voltarEtapaCriacao()" ${state.criacao.etapa === 0 ? "disabled" : ""}>
          VOLTAR
        </button>

        ${state.criacao.etapa === 3
            ? ``
            : state.criacao.etapa === 6 || state.criacao.etapa === ETAPAS_CRIACAO.length - 1
                ? `<button class="btn primary criacao-nav-btn criacao-nav-proximo" onclick="concluirCriacaoFicha()">CONCLUIR PERSONAGEM</button>`
                : `
        <button
          class="btn primary criacao-nav-btn criacao-nav-proximo"
          onclick="proximaEtapaCriacao()"
          ${state.criacao.etapa === 2 && !racaCriacaoValida()
                    ? "disabled"
                    : state.criacao.etapa === 5 && !divindadeCriacaoValida()
                        ? "disabled"
                        : ""
                }
        >
          PR&Oacute;XIMO
        </button>
      `
        }
      </div>

      ${renderResumoCriacao(f)}
    </div>
  </div>
</div>

${renderEscolhaCriacaoModal()}
${renderEscolhaClasseCriacaoModal()}
${renderModalPericiasInteligenciaCriacao()}
${renderModalAdicionarItemInventario()}
${renderModalDetalhesItemInventario()}
${renderEscolhaOrigemCriacaoModal()}
${renderEscolhaPoderClasseModal()}
${renderModalEspecializacoesOficioEscolha()}
    </div>
  `;
}
function renderEvolucaoTopoHtml() {
    return `
      <div class="topbar criacao-topbar">
        <div class="criacao-top-spacer" aria-hidden="true"></div>
        <img src="images/tormenta.png" alt="Tormenta" class="criacao-logo-image">
        <button class="personagens-btn personagens-btn-red personagens-btn-back criacao-voltar-btn" onclick="state.screen='ficha'; render()">VOLTAR</button>
      </div>

      <div class="t20-divider criacao-main-divider"></div>
    `;
}

function renderEvolucaoDivindadeAvisoHtml(ficha) {
    if (normalizarTextoRegra(ficha?.divindadeId || "") !== "nenhum") return "";

    return `
      <div class="class-choice-grid evolucao-extra-grid">
        <div class="class-choice-row evolucao-info-row">
          <div class="class-choice-info">
            <div class="class-choice-heading">
              <strong>Divindade</strong>
              <span>Opcional</span>
            </div>
            <div class="class-auto-list">
              <div>Este personagem n&atilde;o possui divindade. Voc&ecirc; pode escolher uma agora antes de continuar a evolu&ccedil;&atilde;o.</div>
            </div>
          </div>

          <div class="class-choice-actions evolucao-choice-actions">
            <button class="personagens-btn personagens-btn-white class-choice-back" type="button" onclick="abrirEscolhaDivindadeEvolucao()">Escolher divindade</button>
          </div>
        </div>
      </div>
    `;
}

function renderEvolucaoSelecaoClasseHtml(ficha) {
    return `
      <div class="screen criacao-screen evolucao-screen">
        ${renderEvolucaoTopoHtml()}

        <div class="panel criacao-classe-panel evolucao-classe-panel">
          <div class="panel-title criacao-etapa-title">Evolu&ccedil;&atilde;o</div>
          <div class="panel-body criacao-classe-body evolucao-classe-body">
            <div class="class-plan-list">
              <div class="class-plan-item evolucao-plan-item">
                <div class="class-plan-label">Pr&oacute;ximo n&iacute;vel</div>

                <div class="class-plan-controls evolucao-plan-controls">
                  <div class="field class-plan-class-field">
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
                </div>

                <div class="class-plan-preview">
                  <strong>Classes atuais</strong>
                  <span>${escapeHtml(formatarClassesPersonagem(ficha))}</span>
                </div>

                <div class="actions class-plan-actions">
                  <button
                    class="personagens-btn personagens-btn-white class-plan-start"
                    type="button"
                    onclick="prepararNivelClasseEvolucao(state.evolucao.classeSelecaoEvolucaoId)"
                    ${!state.evolucao.classeSelecaoEvolucaoId ? "disabled" : ""}
                  >
                    Abrir n&iacute;vel
                  </button>
                </div>
              </div>
            </div>

            ${renderEvolucaoDivindadeAvisoHtml(ficha)}
          </div>
        </div>

        ${renderEscolhaDivindadeEvolucaoModal()}
      </div>
    `;
}

function renderEvolucaoAutoListHtml(itens, vazioTexto, renderItem) {
    if (!itens.length) {
        return `<div class="class-auto-list"><div>${vazioTexto}</div></div>`;
    }

    return `
      <div class="class-auto-list">
        ${itens.map(renderItem).join("")}
      </div>
    `;
}

function renderEvolucaoNivelClasseHtml(ficha, classe, ctx, escolhasDoNivel, efeitosDoNivel, habilidadesDoNivel) {
    const efeitosVisiveis = efeitosDoNivel.filter(e => efeitoDeveAparecerNaPrevia("classe", e));

    return `
      <div class="screen criacao-screen evolucao-screen">
        ${renderEvolucaoTopoHtml()}

        <div class="panel criacao-classe-panel evolucao-classe-panel">
          <div class="panel-title criacao-etapa-title">Evolu&ccedil;&atilde;o</div>
          <div class="panel-body criacao-classe-body evolucao-classe-body">
            ${renderEvolucaoDivindadeAvisoHtml(ficha)}

            <div class="class-plan-list">
              <div class="class-plan-item evolucao-plan-item evolucao-level-card">
                <div class="class-plan-label">Pr&oacute;ximo n&iacute;vel</div>

                <div class="class-plan-controls evolucao-level-controls">
                  <div class="field class-plan-class-field">
                    <label>Classe</label>
                    <input value="${escapeAttr(classe.nome)}" disabled>
                  </div>
                  <div class="field class-level-field">
                    <label>N&iacute;vel alvo</label>
                    <input value="${escapeAttr(ctx.nivelAlvo)}" disabled>
                  </div>
                  <div class="field class-level-field">
                    <label>Primeira?</label>
                    <input value="${ctx.primeiraClasse ? "Sim" : "N&atilde;o"}" disabled>
                  </div>
                </div>

                <div class="class-plan-preview">
                  <strong>${escapeHtml(formatarClassesPersonagem(ficha))}</strong>
                  <span>N&iacute;vel total ${getNivelTotalPersonagem(ficha)}</span>
                </div>
              </div>
            </div>

            <div class="class-choice-grid evolucao-choice-grid">
              <div class="class-choice-row evolucao-info-row">
                <div class="class-choice-info">
                  <div class="class-choice-heading">
                    <strong>Habilidades deste n&iacute;vel</strong>
                    <span>Autom&aacute;tico</span>
                  </div>
                  ${renderEvolucaoAutoListHtml(
                    habilidadesDoNivel,
                    "Sem habilidades novas neste n&iacute;vel.",
                    h => `
                      <div>
                        <strong>${escapeHtml(h.nome || "Habilidade")}</strong>
                        ${h.descricao ? `<span>${escapeHtml(h.descricao)}</span>` : ""}
                      </div>
                    `
                )}
                </div>
              </div>

              <div class="class-choice-row evolucao-info-row">
                <div class="class-choice-info">
                  <div class="class-choice-heading">
                    <strong>Efeitos autom&aacute;ticos</strong>
                    <span>Autom&aacute;tico</span>
                  </div>
                  ${renderEvolucaoAutoListHtml(
                    efeitosVisiveis,
                    "Sem efeitos autom&aacute;ticos vis&iacute;veis neste n&iacute;vel.",
                    e => `
                      <div>
                        <strong>${escapeHtml(traduzirTipoEfeito(e.tipo || "efeito"))}</strong>
                        <span>${escapeHtml(descreverEfeitoParaJogador(e))}</span>
                      </div>
                    `
                )}
                </div>
              </div>

              ${!escolhasDoNivel.length ? `
                <div class="class-choice-row evolucao-info-row">
                  <div class="class-choice-info">
                    <div class="class-choice-heading">
                      <strong>Escolhas deste n&iacute;vel</strong>
                      <span>Completo</span>
                    </div>
                    <div class="class-auto-list">
                      <div>Sem escolhas obrigat&oacute;rias neste n&iacute;vel.</div>
                    </div>
                  </div>
                </div>
              ` : escolhasDoNivel.map(escolha => {
                    const selecionados = getEscolhaClasseValoresEvolucao(escolha.id);
                    const quantidade = Number(escolha.quantidade) || 0;
                    const preenchida = selecionados.length === quantidade;
                    const desbloqueada = escolhaClasseDesbloqueada(escolha, classe);
                    const travada = escolhaClasseTemOpcaoConfirmadaEvolucao(escolha.id);

                    return `
                      <div class="class-choice-row">
                        <div class="class-choice-info">
                          <div class="class-choice-heading">
                            <strong>${escapeHtml(escolha.titulo || escolha.tipo || "Escolha")}</strong>
                            <span>Selecionados: ${selecionados.length} / ${quantidade}</span>
                          </div>
                          <div class="class-auto-list">
                            <div>${escapeHtml(escolha.descricao || "Escolha uma das opcoes disponiveis.")}</div>
                          </div>
                        </div>

                        <div class="class-choice-actions evolucao-choice-actions">
                          <button
                            class="personagens-btn ${preenchida || travada ? "personagens-btn-white" : "personagens-btn-red"} class-choice-confirm"
                            type="button"
                            onclick="abrirEscolhaClasseEvolucao('${escolha.id}')"
                            ${(!desbloqueada || travada) ? "disabled" : ""}
                          >
                            ${travada ? "Completo" : (preenchida ? "Escolhido" : "Escolher")}
                          </button>
                          <div class="class-choice-status ${preenchida ? "is-complete" : "is-pending"}">
                            ${preenchida ? "Completo" : "Pendente"}
                          </div>
                        </div>
                      </div>
                    `;
                }).join("")}
            </div>

            <div class="actions class-choice-footer evolucao-footer-actions">
              <button class="personagens-btn personagens-btn-white class-choice-back" type="button" onclick="abrirSelecaoProximoNivelEvolucao()">Voltar</button>
              <button class="personagens-btn personagens-btn-red class-choice-confirm" type="button" onclick="concluirNivelClasseEvolucao()" ${!classeNivelAtualValidoEvolucao() ? "disabled" : ""}>
                Concluir n&iacute;vel
              </button>
            </div>
          </div>
        </div>

        ${renderEscolhaClasseEvolucaoModal()}
        ${renderEscolhaDivindadeEvolucaoModal()}
        ${renderEscolhaPoderClasseModal()}
        ${renderModalEspecializacoesOficioEscolha()}
        ${renderModalEspecializacoesOficioFicha()}
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
        app.innerHTML = renderEvolucaoSelecaoClasseHtml(ficha);
        return;

        app.innerHTML = `
      <div class="screen">
        <div class="topbar">        
          <div>
            <h2>EvoluÃ§Ã£o</h2>
            <div class="subtitle">Classes atuais: ${escapeHtml(formatarClassesPersonagem(ficha))}</div>
          </div>

          <div class="actions">
            <button class="btn ghost" onclick="state.screen='ficha'; render()">Fechar</button>
          </div>
        </div>

        <div class="panel">
          <div class="panel-title">Escolha a classe para o prÃ³ximo nÃ­vel</div>
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
                Abrir prÃ³ximo nÃ­vel
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
                Este personagem nÃ£o possui divindade. VocÃª pode escolher uma agora antes de continuar a evoluÃ§Ã£o.
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

    app.innerHTML = renderEvolucaoNivelClasseHtml(ficha, classe, ctx, escolhasDoNivel, efeitosDoNivel, habilidadesDoNivel);
    return;

    app.innerHTML = `
    <div class="screen">
      <div class="topbar">
        <div>
          <h2>EvoluÃ§Ã£o</h2>
          <div class="subtitle">${escapeHtml(formatarClassesPersonagem(ficha))} â€¢ NÃ­vel total ${getNivelTotalPersonagem(ficha)}</div>
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
              Este personagem nÃ£o possui divindade. VocÃª pode escolher uma agora antes de continuar a evoluÃ§Ã£o.
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
        <div class="panel-title">PrÃ³ximo nÃ­vel</div>
        <div class="panel-body">
          <div class="row-3">
            <div class="field">
              <label>Classe</label>
              <input value="${escapeAttr(classe.nome)}" disabled>
            </div>
            <div class="field">
              <label>NÃ­vel alvo</label>
              <input value="${escapeAttr(ctx.nivelAlvo)}" disabled>
            </div>
            <div class="field">
              <label>Primeira classe?</label>
              <input value="${ctx.primeiraClasse ? "Sim" : "NÃ£o"}" disabled>
            </div>
          </div>
        </div>
      </div>

      <div style="height:14px"></div>

      <div class="panel">
        <div class="panel-title">Habilidades deste nÃ­vel</div>
        <div class="panel-body">
          ${!habilidadesDoNivel.length
            ? `<div class="empty">Sem habilidades novas neste nÃ­vel.</div>`
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
        <div class="panel-title">Efeitos automÃ¡ticos deste nÃ­vel</div>
        <div class="panel-body">
          ${!efeitosDoNivel.filter(e => efeitoDeveAparecerNaPrevia("classe", e)).length
            ? `<div class="empty">Sem efeitos automÃ¡ticos visÃ­veis neste nÃ­vel.</div>`
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
        <div class="panel-title">Escolhas deste nÃ­vel</div>
        <div class="panel-body">
          ${!escolhasDoNivel.length
            ? `<div class="empty">Sem escolhas obrigatÃ³rias neste nÃ­vel.</div>`
            : `
                <div class="list">
                  ${escolhasDoNivel.map(escolha => {
                const selecionados = getEscolhaClasseValoresEvolucao(escolha.id);
                const quantidade = Number(escolha.quantidade) || 0;
                const preenchida = selecionados.length === quantidade;
                const desbloqueada = escolhaClasseDesbloqueada(escolha, classe);
                const travada = escolhaClasseTemOpcaoConfirmadaEvolucao(escolha.id);

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
                              ${(!desbloqueada || travada) ? "disabled" : ""}
                            >
                              ${travada ? "Completo" : (preenchida ? "Escolhido" : "Escolher")}
                            </button>

                            <span style="font-weight:bold; color:${preenchida ? "var(--status-preenchido)" : "var(--status-vazio)"};">
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
          Concluir nÃ­vel
        </button>
      </div>

      ${renderEscolhaClasseEvolucaoModal()}
      ${renderEscolhaDivindadeEvolucaoModal()}
      ${renderEscolhaPoderClasseModal()}
      ${renderModalEspecializacoesOficioEscolha()}
    ${renderModalEspecializacoesOficioFicha()}
    </div>
  `;
}

function renderDados() {
    app.innerHTML = `
    <div class="screen dados-screen">
      <div class="topbar">
        <div>
          <img src="images/tormenta.png" alt="Tormenta" class="dados-logo-image">
          <div class="subtitle">Monte rolagens compostas como d4 + 2d6 + d20.</div>
          <div class="t20-divider dados-main-divider"></div>
        </div>
        <div class="actions">
          <button class="personagens-btn personagens-btn-red personagens-btn-back dados-voltar-btn" onclick="go('home')">Voltar</button>
          <button class="dados-topo-btn dados-topo-btn-adicionar" onclick="addGrupoDado()">Adicionar dado</button>
          <button class="dados-topo-btn dados-topo-btn-rolar" onclick="rolarTodosDados()">Rolar tudo</button>
        </div>
      </div>

      <div class="sheet dados-sheet">
        <div class="sheet-grid dados-grid">
          <div class="dados-card dados-rolagem-panel">
            <div class="panel-title">Montagem da rolagem</div>
            <div class="panel-body">
              <div class="dados-rolagem-lista">
                ${state.dados.grupos.map(g => `
                  <div class="dados-rolagem-item">
                    <div class="dados-rolagem-campos">
                      <div class="dados-rolagem-campo">
                        <label>Quantidade</label>
                        <input
                          type="number"
                          min="1"
                          value="${g.quantidade}"
                          onchange="updateGrupoDado('${g.id}', 'quantidade', this.value)"
                        >
                      </div>

                      <div class="dados-rolagem-campo">
                        <label>Tipo</label>
                        <select onchange="updateGrupoDado('${g.id}', 'tipo', this.value)">
                          ${["d4", "d6", "d8", "d10", "d12", "d20", "d100"].map(tipo => `
                            <option value="${tipo}" ${g.tipo === tipo ? "selected" : ""}>${tipo}</option>
                          `).join("")}
                        </select>
                      </div>
                    </div>

                    <button class="dados-remover-btn" onclick="removeGrupoDado('${g.id}')">Remover</button>
                  </div>
                `).join("")}
              </div>

              <div class="dados-rolagem-footer">
              FÃ³rmula atual: <strong>${state.dados.grupos.map(g => `${g.quantidade}${g.tipo}`).join(" + ")}</strong><br>
              Total de dados: <strong>${getTotalDadosSelecionados()}/50</strong>
            </div>
            </div>
          </div>

          <div class="dados-historico-actions">
            <button class="btn danger dados-limpar-historico-btn" onclick="limparHistoricoDados()">Limpar histÃ³rico</button>
          </div>

          <div class="dados-results-grid">
            <div class="dados-card dados-resultado-panel">
              <div class="panel-title">Ãšltimo resultado</div>
              <div class="panel-body">
                ${!state.dados.ultimoResultado
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

            <div class="dados-card dados-historico-panel">
              <div class="panel-title">HistÃ³rico</div>
              <div class="panel-body">
                <div class="actions" style="margin-bottom:12px;">
                  <button class="btn danger" onclick="limparHistoricoDados()">Limpar histÃ³rico</button>
                </div>

                ${state.dados.historico.length === 0
            ? `<div class="empty">Sem histÃ³rico.</div>`
            : `
                      <div class="list">
                        ${state.dados.historico.map(item => `
                          <div class="list-item">
                            <div>
                              <div class="list-item-title">${escapeHtml(item.formula)}</div>
                              <div class="list-item-sub">
                                ${item.grupos.map(g => `${g.quantidade}${g.tipo}: ${g.resultados.join(" + ")}`).join(" â€¢ ")}
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

const MOBILE_FICHA_BREAKPOINT = 820;

function isMobileFicha() {
    return window.matchMedia(`(max-width: ${MOBILE_FICHA_BREAKPOINT}px)`).matches;
}

let _mobileFichaEraMobile = isMobileFicha();
window.addEventListener("resize", () => {
    const agoraMobile = isMobileFicha();
    if (agoraMobile !== _mobileFichaEraMobile) {
        _mobileFichaEraMobile = agoraMobile;
        if (state.screen === "ficha") render();
    }
});

function ajustarPv(delta) {
    const f = getFichaAtual();
    if (!f) return;
    const max = Number(f.pvMax) || 0;
    const atual = Number(f.pvAtual) || 0;
    updateFicha("pvAtual", Math.max(0, Math.min(max, atual + delta)));
}

function ajustarPm(delta) {
    const f = getFichaAtual();
    if (!f) return;
    const max = Number(f.pmMax) || 0;
    const atual = Number(f.pmAtual) || 0;
    updateFicha("pmAtual", Math.max(0, Math.min(max, atual + delta)));
}

function tamanhoFonteValorCirculo(valor) {
    const digitos = String(valor ?? "").replace(/[^0-9-]/g, "").length;
    if (digitos <= 4) return 22;
    if (digitos === 5) return 17;
    if (digitos === 6) return 14;
    return 12;
}

const MF_TABS_EM_BREVE = ["PerÃ­cias", "Ataques", "Poderes", "Magias", "Equipamento"];

const MF_TABS = [
    { id: "status", nome: "Status", ativo: true },
    { id: "pericias", nome: "PerÃ­cias", ativo: true },
    { id: "ataques", nome: "Ataques", ativo: true },
    { id: "poderes", nome: "Poderes", ativo: true },
    { id: "magias", nome: "Magias", ativo: true },
    { id: "equipamento", nome: "Equipamento", ativo: true }
];

function getFichaMobileTab() {
    return state.ui?.fichaMobileTab || "status";
}

function setFichaMobileTab(tab) {
    state.ui = state.ui || {};
    state.ui.fichaMobileTab = tab || "status";
    render();
}

function renderFichaMobileTabs() {
    const tabAtual = getFichaMobileTab();

    return `
    <div class="mf-tabs">
      ${MF_TABS.map(tab => `
        <button
          class="mf-tab ${tabAtual === tab.id ? "is-active" : ""}"
          type="button"
          ${tab.ativo ? `onclick="setFichaMobileTab('${escapeAttr(tab.id)}')"` : `disabled title="Em breve"`}
        >
          ${escapeHtml(tab.id === "pericias" ? "Pericias" : tab.nome)}
        </button>
      `).join("")}
    </div>
  `;
}

function renderCampoModalFichaMobile(campo, label, valor, tipo = "number", extra = "") {
    return `
      <div class="mf-magia-detail-field">
        <label>${escapeHtml(label)}</label>
        <input
          data-mf-mobile-field="${escapeAttr(campo)}"
          type="${escapeAttr(tipo)}"
          value="${escapeAttr(valor ?? "")}"
          onkeydown="if (event.key === 'Enter') salvarEFecharModalEdicaoFichaMobile()"
          ${extra}
        >
      </div>
    `;
}

function renderModalEdicaoFichaMobile() {
    if (state.modal !== "ficha_mobile_edicao") return "";

    const f = getFichaAtual();
    if (!f) return "";

    const tipo = state.modalPayload?.tipo;
    const siglaMagia = { inteligencia: "INT", sabedoria: "SAB", carisma: "CAR" }[f.atributoChaveMagias] || "";
    let titulo = "Editar";
    let campos = "";

    if (tipo === "pv") {
        titulo = "Editar PV";
        campos = `
          ${renderCampoModalFichaMobile("pvAtual", "PV atual", f.pvAtual)}
          ${renderCampoModalFichaMobile("pvMax", "PV maximo", f.pvMax)}
        `;
    } else if (tipo === "pm") {
        titulo = "Editar PM";
        campos = `
          ${renderCampoModalFichaMobile("pmAtual", "PM atual", f.pmAtual)}
          ${renderCampoModalFichaMobile("pmMax", "PM maximo", f.pmMax)}
        `;
    } else if (tipo === "defesa") {
        titulo = "Editar CA";
        campos = `
          ${renderCampoModalFichaMobile("defesa", "Total", f.defesa, "number", "disabled")}
          ${renderCampoModalFichaMobile("defesaOutros", "Outros", f.defesaOutros || 0)}
        `;
    } else if (tipo === "xp") {
        titulo = "Editar XP";
        campos = renderCampoModalFichaMobile("xp", "XP", f.xp);
    } else if (tipo === "tamanho") {
        titulo = "Editar tamanho";
        campos = renderCampoModalFichaMobile("tamanho", "Tamanho", f.tamanho || "", "text");
    } else if (tipo === "deslocamento") {
        titulo = "Editar deslocamento";
        campos = renderCampoModalFichaMobile("deslocamento", "Deslocamento", f.deslocamento || "", "text");
    } else if (tipo === "cdMagias") {
        titulo = `Editar CD Magias${siglaMagia ? ` (${siglaMagia})` : ""}`;
        campos = renderCampoModalFichaMobile("cdMagias", "CD Magias", f.cdMagias);
    } else {
        return "";
    }

    setTimeout(() => {
        document.body.classList.add("modal-open");
    }, 0);

    return `
      <div class="overlay mf-add-habilidade-overlay" onclick="salvarEFecharModalEdicaoFichaMobile()">
        <div class="overlay-card mf-add-habilidade-modal mf-magia-detail-modal mf-mobile-edit-modal mf-status-compact-modal" onclick="event.stopPropagation()">
          <div class="overlay-header mf-add-habilidade-header">
            <div>
              <div class="overlay-title">${escapeHtml(titulo)}</div>
              <div class="subtitle">Toque fora ou em OK para salvar.</div>
            </div>
            <button
              class="mf-add-habilidade-btn mf-add-habilidade-btn-manual mf-mobile-edit-ok"
              type="button"
              onclick="salvarEFecharModalEdicaoFichaMobile()"
            >
              OK
            </button>
          </div>

          <div class="overlay-body mf-add-habilidade-body mf-magia-detail-body">
            <div class="t20-divider"></div>

            <div class="mf-magia-detail-scroll">
              <div class="mf-magia-detail-card">
                <div class="mf-mobile-edit-grid">
                  ${campos}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
}

function renderFichaMobilePericias(f) {
    const pericias = Array.isArray(f.pericias) ? f.pericias : [];

    return `
      <div class="mf-pericias">
        <div class="mf-pericias-resumo">
          <div class="mf-pericias-legenda">${iconePericiaSomenteTreinada()}<span>So Treinada</span></div>
          <div class="mf-pericias-legenda">${iconePericiaPenalidadeArmadura()}<span>Penalidade de Armadura</span></div>
          <div class="mf-pericias-metrica"><strong>1/2 Nivel:</strong> ${escapeHtml(getMetadeNivel(f))}</div>
          <div class="mf-pericias-metrica"><strong>Treino:</strong> ${escapeHtml(getBonusTreino(f))}</div>
        </div>

        <div class="mf-pericias-tabela">
          <div class="mf-pericias-head">
            <div>Total</div>
            <div>Pericias</div>
            <div>Racial</div>
            <div>Outros</div>
            <div>Treino</div>
          </div>

          ${pericias.length
            ? pericias.map((p, i) => {
                const bonusRacial = (Number(p?.outrosRacial) || 0) + (Number(p?.outrosPoder) || 0);
                const treinada = !!p?.treinada;
                const ehOficio = normalizarTextoRegra(p?.nome || "") === "oficio";

                return `
                  <div class="mf-pericia-row ${treinada ? "is-trained" : ""}">
                    <div class="mf-pericia-total">${escapeHtml(calcularTotalPericia(f, p))}</div>
                    <button
                      class="mf-pericia-nome mf-pericia-nome-btn"
                      type="button"
                      onclick="abrirModalRegraPericia(${escapeAttr(JSON.stringify(p.nome || ""))})"
                    >
                      <span class="mf-pericia-nome-text">${escapeHtml(p.nome || "")}</span>
                      ${p.atributo ? `<span class="mf-pericia-atributo">(${escapeHtml(p.atributo)})</span>` : ""}
                      ${p.penalidadeArmadura ? iconePericiaPenalidadeArmadura() : ""}
                      ${p.somenteTreinada ? iconePericiaSomenteTreinada() : ""}
                    </button>
                    <div class="mf-pericia-numero">${escapeHtml(bonusRacial)}</div>
                    <div class="mf-pericia-numero">
                      <input
                        class="mf-pericia-outros"
                        type="number"
                        value="${escapeAttr(Number(p?.outros) || 0)}"
                        onchange="updatePericia(${i}, 'outros', this.value)"
                      >
                    </div>
                    <div class="mf-pericia-treino">
                      ${ehOficio
                        ? `
                          <button
                            class="mf-oficio-btn"
                            type="button"
                            title="Editar oficios"
                            aria-label="Editar oficios"
                            onclick="abrirModalEspecializacoesOficioFicha(${i})"
                          >
                            <span class="mf-oficio-icon" aria-hidden="true"></span>
                          </button>
                        `
                        : `
                          <input
                            type="checkbox"
                            ${treinada ? "checked" : ""}
                            onclick="event.stopPropagation()"
                            onchange="updatePericia(${i}, 'treinada', this.checked)"
                          >
                        `
                    }
                    </div>
                  </div>
                `;
            }).join("")
            : `<div class="mf-pericias-vazio">Nenhuma pericia cadastrada.</div>`
        }
        </div>
      </div>
    `;
}

function renderFichaMobileAtaques(f) {
    const ataques = Array.isArray(f.ataques) ? f.ataques : [];

    return `
      <div class="mf-ataques">
        <div class="mf-ataques-toolbar">
          <button class="mf-ataques-add" type="button" onclick="addAtaque()">+ ataque</button>
        </div>

        <div class="mf-ataques-lista">
          ${ataques.length
            ? ataques.map((a, i) => {
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
                  <div class="mf-ataque-card ${auto ? "is-auto" : ""}">
                    <div class="mf-ataque-card-head">
                      <input class="mf-ataque-nome-input" aria-label="Nome do ataque" value="${escapeAttr(nomeValor)}" onchange="updateAtaque(${i}, 'nome', this.value)">
                      ${auto
                        ? `<span class="mf-ataque-backpack" title="Arma equipada" aria-label="Arma equipada"><span aria-hidden="true"></span></span>`
                        : `<button class="mf-ataque-remove" type="button" onclick="removeAtaque(${i})" title="Remover ataque" aria-label="Remover ataque">X</button>`
                    }
                    </div>
                    <div class="mf-ataque-card-row">
                      <div>Teste</div>
                      <div><input value="${escapeAttr(bonusValor)}" onchange="updateAtaque(${i}, 'bonus', this.value)"></div>
                    </div>
                    <div class="mf-ataque-card-row">
                      <div>Dano</div>
                      <div><input value="${escapeAttr(danoValor)}" onchange="updateAtaque(${i}, 'dano', this.value)"></div>
                    </div>
                    <div class="mf-ataque-card-row">
                      <div>Critico</div>
                      <div><input value="${escapeAttr(criticoValor)}" onchange="updateAtaque(${i}, 'critico', this.value)"></div>
                    </div>
                    <div class="mf-ataque-card-row">
                      <div>Tipo</div>
                      <div><input value="${escapeAttr(tipoValor)}" onchange="updateAtaque(${i}, 'tipo', this.value)"></div>
                    </div>
                    <div class="mf-ataque-card-row">
                      <div>Alcance</div>
                      <div><input value="${escapeAttr(alcanceValor)}" onchange="updateAtaque(${i}, 'alcance', this.value)"></div>
                    </div>
                  </div>
                `;
            }).join("")
            : `<div class="mf-ataques-vazio">Nenhum ataque cadastrado.</div>`
        }
        </div>
      </div>
    `;
}

function renderFichaMobilePoderesTabela(titulo, chave, itens, textoVazio) {
    const aberta = secaoFichaEstaAberta(chave);

    return `
      <div class="mf-poderes-tabela">
        <button class="mf-poderes-section-head" type="button" onclick="toggleSecaoFicha('${escapeAttr(chave)}')">
          <span>${escapeHtml(titulo)}</span>
          <span>${aberta ? "â–²" : "â–¼"}</span>
        </button>

        ${aberta ? `
          <div class="mf-poderes-head">
            <div>Nome</div>
            <div>PM</div>
          </div>

          ${itens.length
            ? itens.map(h => `
              <div class="mf-poder-row">
                <div>
                  <button class="mf-poder-name" type="button" onclick="abrirDetalheHabilidade('${escapeAttr(h.id)}')">
                    ${escapeHtml(h.nome || "Sem nome")}
                  </button>
                </div>
                <div class="mf-poder-pm">
                  <span>${escapeHtml(Number(h.custoPm) || 0)} PM</span>
                  <input
                    type="checkbox"
                    ${h.selecionada ? "checked" : ""}
                    onchange="updateHabilidade('${escapeAttr(h.id)}', 'selecionada', this.checked)"
                  >
                </div>
              </div>
            `).join("")
            : `<div class="mf-poderes-vazio">${escapeHtml(textoVazio)}</div>`
        }
        ` : ""}
      </div>
    `;
}

function renderFichaMobilePoderes(f) {
    const habilidadesRaciaisVisiveis = getHabilidadesRaciaisVisiveis(f);
    const poderesVisiveis = getPoderesVisiveis(f);
    const totalPm = getCustoTotalHabilidadesSelecionadas();
    const pmAtual = Number(f.pmAtual) || 0;
    const excedeu = totalPm > pmAtual;

    return `
      <div class="mf-poderes">
        <div class="mf-poderes-top">
          <div class="mf-poderes-resumo ${excedeu ? "is-danger" : ""}">
            <div>PM total selecionado: <strong>${escapeHtml(totalPm)}</strong></div>
            <div>PM total personagem: <strong>${escapeHtml(pmAtual)}</strong></div>
          </div>

          <div class="mf-poderes-actions">
            <button class="mf-poderes-add" type="button" onclick="addHabilidade()">+ habilidade</button>
            <button
              class="mf-poderes-use"
              type="button"
              onclick="usarHabilidadesSelecionadas()"
              ${excedeu ? "disabled" : ""}
            >
              Usar
            </button>
          </div>
        </div>

        ${renderFichaMobilePoderesTabela(
            "Habilidades de raca",
            "habilidadesRaciais",
            habilidadesRaciaisVisiveis,
            "Nenhuma habilidade racial cadastrada."
        )}

        ${renderFichaMobilePoderesTabela(
            "Poderes",
            "poderes",
            poderesVisiveis,
            "Nenhum poder cadastrado."
        )}
      </div>
    `;
}

function renderFichaMobileMagias(f) {
    const magias = Array.isArray(f.magias) ? f.magias : [];
    const pmAtual = Number(f.pmAtual) || 0;

    return `
      <div class="mf-magias">
        <div class="mf-poderes-top">
          <div class="mf-poderes-resumo">
            <div>PM total personagem: <strong>${escapeHtml(pmAtual)}</strong></div>
          </div>

          <div class="mf-poderes-actions">
            <button class="mf-poderes-add" type="button" onclick="addMagia()">+ magia</button>
          </div>
        </div>

        <div class="mf-poderes-tabela">
          <div class="mf-poderes-section-head mf-poderes-section-head--fixa">
            <span>Magias</span>
          </div>

          <div class="mf-magias-head">
            <div>Nome</div>
            <div>Circulo</div>
            <div>PM</div>
            <div>Usar</div>
          </div>

          ${magias.length
              ? magias.map(m => {
                  const custoBase = Number(m.custoPm) || 0;
                  const semPm = custoBase > pmAtual;
                  const nome = m.prefixoExibicao ? `${m.prefixoExibicao}: ${m.nome}` : (m.nome || "Sem nome");

                  return `
                    <div class="mf-magia-row">
                      <div>
                        <button class="mf-poder-name" type="button" onclick="abrirDetalheMagia('${escapeAttr(m.id)}')">
                          ${escapeHtml(nome)}
                        </button>
                      </div>
                      <div>${escapeHtml(m.circulo || "â€”")}</div>
                      <div>${escapeHtml(custoBase)} PM</div>
                      <div>
                        <button
                          class="mf-magias-use"
                          type="button"
                          onclick="abrirDetalheMagia('${escapeAttr(m.id)}')"
                          ${semPm ? "disabled" : ""}
                        >
                          Usar
                        </button>
                      </div>
                    </div>
                  `;
              }).join("")
              : `<div class="mf-poderes-vazio">Nenhuma magia cadastrada.</div>`
          }
        </div>
      </div>
    `;
}

function renderFichaMobileDinheiro(f) {
    const aberto = !!state.ui?.painelDinheiroAberto;
    const valor = getDinheiroFicha(f);

    return `
      <div class="mf-equip-money">
        <button class="mf-equip-money-toggle" type="button" onclick="togglePainelDinheiro()">
          T$ ${escapeHtml(String(valor))}
        </button>

        ${aberto ? `
          <div class="mf-equip-money-panel">
            <input
              type="number"
              min="0"
              step="1"
              value="${escapeAttr(String(state.ui?.edicaoDinheiroRapida || valor))}"
              oninput="updateEdicaoDinheiroRapida(this.value)"
            >
            <button type="button" onclick="confirmarEdicaoDinheiroRapida()">OK</button>
          </div>
        ` : ""}
      </div>
    `;
}

function renderFichaMobileEquipamento(f) {
    const itens = Array.isArray(f.inventario) ? f.inventario : [];

    return `
      <div class="mf-equipamento">
        <div class="mf-equipamento-top">
          <div class="mf-equipamento-actions">
            ${renderFichaMobileDinheiro(f)}
            <button class="mf-equip-add" type="button" onclick="abrirModalAdicionarItemInventario()">+ item</button>
          </div>
        </div>

        <div class="mf-poderes-tabela">
          <div class="mf-poderes-section-head mf-poderes-section-head--fixa">
            <span>Inventario</span>
          </div>

          <div class="mf-equip-head">
            <div>Item</div>
            <div>Qtd</div>
            <div>Eq.</div>
            <div></div>
          </div>

          ${itens.length
              ? itens.map(item => {
                  const base = getBaseItemDaEntrada(item);
                  const nome = base?.nome || item.nomeManual || "Item";
                  const qtd = Math.max(1, Number(item.quantidade) || 1);

                  return `
                    <div class="mf-equip-row">
                      <div>
                        <button class="mf-poder-name" type="button" onclick="abrirDetalhesItemInventario('${escapeAttr(item.id)}')">
                          ${escapeHtml(nome)}
                        </button>
                      </div>
                      <div>${escapeHtml(qtd)}</div>
                      <div>
                        <input
                          type="checkbox"
                          ${item.equipado ? "checked" : ""}
                          onchange="alternarEquipadoInventario('${escapeAttr(item.id)}', this.checked)"
                        >
                      </div>
                      <div>
                        <button class="mf-equip-remove" type="button" onclick="removerItemInventario('${escapeAttr(item.id)}')" title="Remover item" aria-label="Remover item">X</button>
                      </div>
                    </div>
                  `;
              }).join("")
              : `<div class="mf-poderes-vazio">Nenhum item no inventario.</div>`
          }
        </div>
      </div>
    `;
}

function renderFichaMobile(f) {
    const siglaMagia = { inteligencia: "INT", sabedoria: "SAB", carisma: "CAR" }[f.atributoChaveMagias] || "";

    app.innerHTML = `
    <div class="mobile-ficha">
      <div class="mf-topbar">
        <div class="mf-topbar-spacer" aria-hidden="true"></div>
        <div class="mf-logo"></div>
        <button class="mf-banner mf-clickable mf-banner-back" onclick="go('personagens')">Voltar</button>
      </div>

      <div class="mf-personagem-row">
        <div class="mf-label">Personagem</div>
        <div class="mf-box-wide">
          <input value="${escapeAttr(f.nome)}" onchange="updateFicha('nome', this.value)">
        </div>
      </div>

      <div class="mf-grid-4">
        <div class="mf-field">
          <div class="mf-label">RaÃ§a</div>
          <div class="mf-box-med"><div class="mf-static mf-static-claro">${escapeHtml(f.raca || "")}</div></div>
        </div>
        <div class="mf-field">
          <div class="mf-label">Origem</div>
          <div class="mf-box-med"><div class="mf-static mf-static-claro">${escapeHtml(f.origem || "")}</div></div>
        </div>
        <div class="mf-field">
          <div class="mf-label">Classe e NÃ­vel</div>
          <button class="mf-box-med mf-box-button mf-class-summary" type="button" onclick="abrirModalClassesFichaMobile()">
            <span class="mf-static">${escapeHtml(formatarClassesPersonagem(f))} Â· Nv ${escapeHtml(getNivelTotalPersonagem(f))}</span>
          </button>
        </div>
        <div class="mf-field">
          <div class="mf-label">Divindade</div>
          <div class="mf-box-med"><div class="mf-static mf-static-claro">${escapeHtml(f.divindade || "â€”")}</div></div>
        </div>
      </div>

      <div class="mf-section-gap"></div>
      <div class="t20-divider"></div>
      <div class="mf-section-gap"></div>
      <div class="mf-atributos-title-row">
        <div class="mf-banner">Atributos</div>
        ${renderControleImagemPersonagemFicha(f)}
      </div>
      <div class="mf-attr-pontos-row">
        <span class="mf-attr-pontos-label">Pontos disponÃ­veis:</span>
        <span class="mf-attr-pontos-badge">
          <span class="mf-attr-pontos-badge-text">${escapeHtml(String(Number(f.pontosAtributoAtuais) || 0))}</span>
        </span>
        <button class="mf-attr-pontos-btn" type="button" onclick="adicionarPontoAtributo()" aria-label="Adicionar ponto de atributo">+1</button>
      </div>
      <div class="mf-section-gap"></div>

      <div class="mf-attrs">
        ${["forca", "destreza", "constituicao", "inteligencia", "sabedoria", "carisma"].map((campo) => {
        const siglas = { forca: "FOR", destreza: "DES", constituicao: "CON", inteligencia: "INT", sabedoria: "SAB", carisma: "CAR" };
        return `
            <div class="mf-attr">
              <button class="mf-pill" onclick="subirAtributo('${campo}')">+</button>
              <div class="mf-attr-nome">${siglas[campo]}</div>
              <div class="mf-attr-valor">${escapeHtml(getAtributoFinal(f, campo))}</div>
              <button class="mf-pill" onclick="descerAtributo('${campo}')">-</button>
            </div>
          `;
    }).join("")}
      </div>

      <div class="mf-section-gap"></div>
      ${renderFichaMobileTabs()}

      ${getFichaMobileTab() === "pericias"
        ? renderFichaMobilePericias(f)
        : getFichaMobileTab() === "ataques"
            ? renderFichaMobileAtaques(f)
            : getFichaMobileTab() === "poderes"
                ? renderFichaMobilePoderes(f)
                : getFichaMobileTab() === "magias"
                    ? renderFichaMobileMagias(f)
                    : getFichaMobileTab() === "equipamento"
                        ? renderFichaMobileEquipamento(f)
                        : `
      <div class="mf-stat-row">
        <div class="mf-stat">
          <div class="mf-stat-circle-wrap">
            <div class="mf-pill-grey-wrap"><button class="mf-pill-grey" onclick="ajustarPv(-1)">-</button></div>
            <div class="mf-circle mf-circle-pv"><div class="mf-circle-valor">${escapeAttr(f.pvAtual)}</div></div>
            <div class="mf-pill-grey-wrap"><button class="mf-pill-grey" onclick="ajustarPv(1)">+</button></div>
          </div>
          <button class="mf-box-med mf-box-stat mf-box-button" type="button" onclick="abrirModalEdicaoFichaMobile('pv')">
            <span class="mf-static">PV ${escapeAttr(f.pvAtual)}/${escapeAttr(f.pvMax)}</span>
          </button>
        </div>

        <div class="mf-stat">
          <div class="mf-stat-circle-wrap">
            <div class="mf-pill-grey-wrap"><button class="mf-pill-grey" onclick="ajustarPm(-1)">-</button></div>
            <div class="mf-circle mf-circle-pm"><div class="mf-circle-valor">${escapeAttr(f.pmAtual)}</div></div>
            <div class="mf-pill-grey-wrap"><button class="mf-pill-grey" onclick="ajustarPm(1)">+</button></div>
          </div>
          <button class="mf-box-med mf-box-stat mf-box-button" type="button" onclick="abrirModalEdicaoFichaMobile('pm')">
            <span class="mf-static">PM ${escapeAttr(f.pmAtual)}/${escapeAttr(f.pmMax)}</span>
          </button>
        </div>
      </div>

      <div class="mf-stat-row">
        <div class="mf-stat">
          <div class="mf-circle mf-circle-ca"><div class="mf-circle-valor">${escapeAttr(f.defesa)}</div></div>
          <button class="mf-box-med mf-box-stat mf-box-button" type="button" onclick="abrirModalEdicaoFichaMobile('defesa')">
            <span class="mf-static">Total ${escapeAttr(f.defesa)} outros ${escapeAttr(f.defesaOutros || 0)}</span>
          </button>
        </div>

        <div class="mf-stat">
          <div class="mf-circle mf-circle-xp"><div class="mf-circle-valor" style="font-size:${tamanhoFonteValorCirculo(f.xp)}px;">${escapeAttr(f.xp)}</div></div>
          <button class="mf-box-med mf-box-stat mf-box-button" type="button" onclick="abrirModalEdicaoFichaMobile('xp')">
            <span class="mf-static">XP ${escapeAttr(f.xp)}</span>
          </button>
        </div>
      </div>

      <div class="mf-section-gap"></div>

      <div class="mf-grid-3">
        <div class="mf-field">
          <div class="mf-box-med"><div class="mf-static">${escapeAttr(f.penalidadeArmadura || 0)}</div></div>
          <div class="mf-label">Penalidade de Armadura</div>
        </div>
        <div class="mf-field">
          <button class="mf-box-med mf-box-button" type="button" onclick="abrirModalEdicaoFichaMobile('tamanho')">
            <span class="mf-static">${escapeHtml(f.tamanho || "")}</span>
          </button>
          <div class="mf-label">Tamanho</div>
        </div>
        <div class="mf-field">
          <button class="mf-box-med mf-box-button" type="button" onclick="abrirModalEdicaoFichaMobile('deslocamento')">
            <span class="mf-static">${escapeHtml(f.deslocamento || "")}</span>
          </button>
          <div class="mf-label">Deslocamento</div>
        </div>
      </div>

      <div class="mf-grid-2">
        <div class="mf-field">
          <div class="mf-box-med"><button class="btn" onclick="abrirModalProficiencias()">ProficiÃªncias</button></div>
          <div class="mf-label">&nbsp;</div>
        </div>
        <div class="mf-field">
          <button class="mf-box-med mf-box-button" type="button" onclick="abrirModalEdicaoFichaMobile('cdMagias')">
            <span class="mf-static">${escapeAttr(f.cdMagias)}${siglaMagia ? ` (${siglaMagia})` : ""}</span>
          </button>
          <div class="mf-label">CD Magias</div>
        </div>
      </div>

      <div class="mf-section-gap"></div>
      <button class="mf-banner mf-clickable" onclick="iniciarEvolucaoFicha()">Subir NÃ­vel</button>
      `}
    </div>
  `;

    const botaoProficienciasMobile = app.querySelector(".mobile-ficha .mf-box-med > button[onclick=\"abrirModalProficiencias()\"]");
    if (botaoProficienciasMobile?.parentElement) {
        const caixaProficienciasMobile = botaoProficienciasMobile.parentElement;
        caixaProficienciasMobile.classList.add("mf-box-button");
        caixaProficienciasMobile.setAttribute("role", "button");
        caixaProficienciasMobile.setAttribute("tabindex", "0");
        caixaProficienciasMobile.addEventListener("click", abrirModalProficiencias);
        caixaProficienciasMobile.addEventListener("keydown", (event) => {
            if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                abrirModalProficiencias();
            }
        });
        botaoProficienciasMobile.onclick = (event) => {
            event.stopPropagation();
            abrirModalProficiencias();
        };
    }

    if (f.divindade) {
        const campoDivindadeMobile = Array.from(app.querySelectorAll(".mobile-ficha .mf-field"))
            .find(campo => campo.querySelector(".mf-label")?.textContent?.trim() === "Divindade");
        const caixaDivindadeMobile = campoDivindadeMobile?.querySelector(".mf-box-med");

        if (caixaDivindadeMobile) {
            caixaDivindadeMobile.classList.add("mf-box-button");
            caixaDivindadeMobile.setAttribute("role", "button");
            caixaDivindadeMobile.setAttribute("tabindex", "0");
            caixaDivindadeMobile.addEventListener("click", abrirModalDetalhesDivindade);
            caixaDivindadeMobile.addEventListener("keydown", (event) => {
                if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    abrirModalDetalhesDivindade();
                }
            });
        }
    }

    app.insertAdjacentHTML("beforeend", renderModalEdicaoFichaMobile());
    app.insertAdjacentHTML("beforeend", renderModalClassesFichaMobile());
    app.insertAdjacentHTML("beforeend", renderProficienciasModal());
    app.insertAdjacentHTML("beforeend", renderModalEspecializacoesOficioFicha());
    app.insertAdjacentHTML("beforeend", renderDivindadeModal());
    app.insertAdjacentHTML("beforeend", renderHabilidadeModal());
    app.insertAdjacentHTML("beforeend", renderModalAdicionarHabilidade());
    app.insertAdjacentHTML("beforeend", renderMagiaModal());
    app.insertAdjacentHTML("beforeend", renderModalAdicionarMagia());
    app.insertAdjacentHTML("beforeend", renderModalAdicionarItemInventario());
    app.insertAdjacentHTML("beforeend", renderModalDetalhesItemInventario());
    app.insertAdjacentHTML("beforeend", renderModalRegraPericia());
}

function renderFicha() {
    const f = getFichaAtual();
    if (!f) {
        go("personagens");
        return;
    }

    // A ficha agora sempre usa o layout "mobile" (ilustrado), tambem no desktop.
    // O bloco de layout antigo do desktop foi mantido abaixo, mas ficou inalcancavel
    // de proposito, caso seja necessario reverter no futuro.
    renderFichaMobile(f);
    return;

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
              <div class="panel-title">RaÃ§a</div>
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
    <div class="row-4">
      <div class="panel">
        <div class="panel-title">XP</div>
        <div class="panel-body-centro">
          <input style="text-align:center;width:100px;type="number" value="${escapeAttr(f.xp)}" onchange="updateFicha('xp', Number(this.value))">
        </div>
      </div>

      <div class="panel">
  <div class="panel-title" style="font-size: 0.8rem;">
  CD Magias${f.atributoChaveMagias ? ` (${escapeHtml(({ inteligencia: "INT", sabedoria: "SAB", carisma: "CAR" }[f.atributoChaveMagias] || f.atributoChaveMagias))})` : ""}
</div>
<div class="panel-body" style="display:flex;  align-items:center; justify-content:center; gap:8px;">
  <input style="text-align:center; width:50px;" type="number" value="${escapeAttr(f.cdMagias)}" onchange="updateFicha('cdMagias', Number(this.value))">
  <button class="btn ghost" onclick="recalcularCdMagiasFichaAtual()">Rc</button>
</div>
</div>

      <div class="panel">
        <div class="panel-title">NÃ­vel total</div>
        <div class="panel-body">
          <div style="display:flex; align-items:center; justify-content:center; min-height:38px;">
            <div style="min-width:48px; text-align:center; font-size:24px; font-weight:bold;">
              ${escapeAttr(getNivelTotalPersonagem(f))}
            </div>
          </div>
        </div>
      </div>

      <div class="panel">
        <div class="panel-title">EvoluÃ§Ã£o</div>
        <div class="panel-body">
          <button class="btn" style="width:100%;" onclick="iniciarEvolucaoFicha()">
            Subir NÃ­vel
          </button>
        </div>
      </div>
       </div>  
       
          <div style="height:14px"></div>
           <div class="notice" style="display:flex; align-items:center; justify-content:center; gap:10px;">
  <span>Pontos disponÃ­veis: <strong>${f.pontosAtributoAtuais}</strong></span>

  <button class="btn small" onclick="adicionarPontoAtributo()">
    +1 ponto
  </button>
</div>
<div style="height:14px"></div>
              <div class="ficha-atributos-title-row">
                <div class="ficha-atributos-title">Atributos</div>
                ${renderBotaoAvatarPersonagem(f, "ficha-personagem-avatar")}
              </div>
              <div style="height:10px"></div>
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
                      <label>MÃ¡ximos</label>
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
                      <label>MÃ¡ximos</label>
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
                          <th>CrÃ­tico</th>
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
    <div class="panel-title">ProficiÃªncias</div>
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
                    <input style="text-align:center;width:100px;"value="${escapeAttr(f.tamanho)}"onchange="updateFicha('tamanho', this.value)">
                  </div>
                </div>

                <div class="panel">
                  <div class="panel-title">Deslocamento</div>
                  <div class="panel-body-centro">
                    <input style="text-align:center;width:100px;"value="${escapeAttr(f.deslocamento)}" onchange="updateFicha('deslocamento', this.value)">
                  </div>
                </div>
              </div>

                          <div style="height:14px"></div>

<div class="panel">
  <div class="panel-title">Habilidades de raÃ§a</div>
  <div class="panel-body">
    ${habilidadesRaciaisVisiveis.length === 0
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
  <div
    class="panel-title"
    style="cursor:pointer; display:flex; justify-content:space-between; align-items:center;"
    onclick="toggleSecaoFicha('poderes')"
  >
    <span>Poderes</span>
    <span>${secaoFichaEstaAberta('poderes') ? "â–²" : "â–¼"}</span>
  </div>

  ${secaoFichaEstaAberta('poderes') ? `
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
            <strong style="${excedeu ? "color:var(--vermelho-escuro);" : ""}">
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
  ` : ""}
</div>

<div style="height:14px"></div>

<div class="panel">
  <div
    class="panel-title"
    style="cursor:pointer; display:flex; justify-content:space-between; align-items:center;"
    onclick="toggleSecaoFicha('magias')"
  >
    <span>Magias</span>
    <span>${secaoFichaEstaAberta('magias') ? "â–²" : "â–¼"}</span>
  </div>

  ${secaoFichaEstaAberta('magias') ? `
    <div class="panel-body">
      ${f.magias.length === 0
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
                        <div class="list-item-title">${escapeHtml(m.prefixoExibicao ? `${m.prefixoExibicao}: ${m.nome}` : (m.nome || "Sem nome"))}</div>
                      </button>

                      <div class="list-item-sub">
                        CÃ­rculo: ${escapeHtml(m.circulo || "â€”")} â€¢ Custo: ${custoBase} PM
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
  ` : ""}
</div>

<div style="height:14px"></div>
${renderInventarioSimples(f)}

<div style="height:14px"></div>

               <div class="panel">
                  <div class="panel-title">AnotaÃ§Ãµes</div>
                  <div class="panel-body">
                    <textarea
  style="min-width:600px; min-height:100px;"
  onchange="updateFicha('anotacoes', this.value)"
>${escapeHtml(f.anotacoes)}</textarea>
                  </div>
                </div>
              </div>
                       
                        <div>
              <div class="panel">
                <div class="panel-title">PerÃ­cias</div>
                <div class="panel-body">
                  <div class="pericias-tabela">
                    <div class="pericias-head">
                      <div class="pericias-head-nome"></div>
                      <div class="pericias-head-col">TOTAL</div>
                      <div class="pericias-head-col">RACIAL</div>
                      <div class="pericias-head-col">OUTROS</div>
                      <div class="pericias-head-col pericias-head-treino">TREINO</div>
                    </div>

                    ${f.pericias.map((p, i) => `
                      <div class="pericia-linha">
                        <button
                          class="pericia-col pericia-col-nome pericia-nome-btn"
                          type="button"
                          onclick="abrirModalRegraPericia(${escapeAttr(JSON.stringify(p.nome || ""))})"
                        >
                          <div class="pericia-nome">${escapeHtml(p.nome)}</div>
                          <div class="pericia-attr-linha">
                            <span class="pericia-attr">${escapeHtml(p.atributo)}</span>
                            ${p.somenteTreinada ? ` ${iconePericiaSomenteTreinada()}` : ""}
                            ${p.penalidadeArmadura ? ` ${iconePericiaPenalidadeArmadura()}` : ""}
                          </div>
                        </button>

                        <div class="pericia-col pericia-col-total">
                          <span class="pericia-total-coluna">${calcularTotalPericia(f, p)}</span>
                        </div>

                        <div class="pericia-col pericia-col-racial">
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

                        <div class="pericia-col pericia-col-outros">
                          <input
                            class="campo-pericia-centro"
                            type="number"
                            value="${escapeAttr(Number(p?.outros) || 0)}"
                            onchange="updatePericia(${i}, 'outros', this.value)"
                          >
                        </div>

                        <div class="pericia-col pericia-col-treino">
                          ${normalizarTextoRegra(p.nome) === normalizarTextoRegra("OfÃ­cio")
                    ? `
                              <button
                                class="btn ghost btn-oficios-pericia"
                                type="button"
                                style="margin-left: 10px;"
                                onclick="abrirModalEspecializacoesOficioFicha(${i})"
                              >
                                OfÃ­cios
                              </button>
                            `
                    : `
                              <input
                              type="checkbox"
                              style="margin-left: 10px;"
                              ${p.treinada ? "checked" : ""}
                              onchange="updatePericia(${i}, 'treinada', this.checked)"
                            />
                            `
                }
                        </div>
                      </div>
                    `).join("")}
                  </div>

                  <div style="margin-top:14px" class="notice">
                    Metade do nÃ­vel: <strong>${getMetadeNivel(f)}</strong><br>
                    BÃ´nus de treino atual: <strong>+${getBonusTreino(f)}</strong>
                  </div>
                </div>
              </div>

${renderEquipamentoModal()}
${renderHabilidadeModal()}
${renderMagiaModal()}
${renderModalAdicionarHabilidade()}
${renderModalAdicionarMagia()}
${renderModalAdicionarItemInventario()}
${renderWidgetDinheiroFlutuante()}
${renderModalDetalhesItemInventario()}
${renderEscolhaDivindadeEvolucaoModal()}
${renderProficienciasModal()}
${renderModalEspecializacoesOficioFicha()}
${renderModalRegraPericia()}
</div>
`;
}

function renderDadosModalFichaHtml() {
    return `
    <div class="overlay dados-modal-overlay" onclick="fecharModal()">
      <div class="dados-modal-card" onclick="event.stopPropagation()">
        <div class="dados-modal-header">
          <div>
            <div class="dados-modal-title">Dados</div>
            <div class="subtitle">Rolagem rapida sem sair da ficha.</div>
          </div>
          <button class="personagens-btn personagens-btn-white dados-modal-fechar" onclick="fecharModal()">Fechar</button>
        </div>

        <div class="dados-modal-body">
          <div class="dados-modal-actions">
            <button class="dados-topo-btn dados-topo-btn-adicionar" onclick="addGrupoDado()">Adicionar dado</button>
            <button class="dados-topo-btn dados-topo-btn-rolar" onclick="rolarTodosDados()">Rolar tudo</button>
          </div>

          <div class="dados-card dados-rolagem-panel dados-modal-rolagem">
            <div class="panel-title">Montagem da rolagem</div>
            <div class="panel-body">
              <div class="dados-rolagem-lista">
                ${state.dados.grupos.map(g => `
                  <div class="dados-rolagem-item">
                    <div class="dados-rolagem-campos">
                      <div class="dados-rolagem-campo">
                        <label>Quantidade</label>
                        <input
                          type="number"
                          min="1"
                          value="${g.quantidade}"
                          onchange="updateGrupoDado('${g.id}', 'quantidade', this.value)"
                        >
                      </div>

                      <div class="dados-rolagem-campo">
                        <label>Tipo</label>
                        <select onchange="updateGrupoDado('${g.id}', 'tipo', this.value)">
                          ${["d4", "d6", "d8", "d10", "d12", "d20", "d100"].map(tipo => `
                            <option value="${tipo}" ${g.tipo === tipo ? "selected" : ""}>${tipo}</option>
                          `).join("")}
                        </select>
                      </div>
                    </div>

                    <button class="dados-remover-btn" onclick="removeGrupoDado('${g.id}')">Remover</button>
                  </div>
                `).join("")}
              </div>

              <div class="dados-rolagem-footer">
                Formula atual: <strong>${state.dados.grupos.map(g => `${g.quantidade}${g.tipo}`).join(" + ")}</strong><br>
                Total de dados: <strong>${getTotalDadosSelecionados()}/50</strong>
              </div>
            </div>
          </div>

          <div class="dados-historico-actions dados-modal-historico-actions">
            <button class="btn danger dados-limpar-historico-btn" onclick="limparHistoricoDados()">Limpar historico</button>
          </div>

          <div class="dados-results-grid dados-modal-results">
            <div class="dados-card dados-resultado-panel">
              <div class="panel-title">Ultimo resultado</div>
              <div class="panel-body">
                ${!state.dados.ultimoResultado
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

            <div class="dados-card dados-historico-panel">
              <div class="panel-title">Historico</div>
              <div class="panel-body">
                <div class="actions" style="margin-bottom:12px;">
                  <button class="btn danger" onclick="limparHistoricoDados()">Limpar historico</button>
                </div>

                ${state.dados.historico.length === 0
            ? `<div class="empty">Sem historico.</div>`
            : `
                    <div class="list">
                      ${state.dados.historico.map(item => `
                        <div class="list-item">
                          <div>
                            <div class="list-item-title">${escapeHtml(item.formula)}</div>
                            <div class="list-item-sub">
                              ${item.grupos.map(g => `${g.quantidade}${g.tipo}: ${g.resultados.join(" + ")}`).join(" | ")}
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

function renderDadosModal() {
    if (state.modal !== "dados") return "";

    setTimeout(() => {
        document.body.classList.add("modal-open");
    }, 0);

    return renderDadosModalFichaHtml();

    return `
    <div class="overlay" onclick="fecharModal()">
      <div class="overlay-card" onclick="event.stopPropagation()">
        <div class="overlay-header">
          <div>
            <div class="overlay-title">Dados</div>
            <div class="subtitle">Rolagem rÃ¡pida sem sair da ficha.</div>
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
                  FÃ³rmula atual: <strong>${state.dados.grupos.map(g => `${g.quantidade}${g.tipo}`).join(" + ")}</strong>
                </div>
              </div>
            </div>

            <div class="row-2">
              <div class="panel">
                <div class="panel-title">Ãšltimo resultado</div>
                <div class="panel-body">
                  ${!state.dados.ultimoResultado
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
                <div class="panel-title">HistÃ³rico</div>
                <div class="panel-body">
                  <div class="actions" style="margin-bottom:12px;">
                    <button class="btn danger" onclick="limparHistoricoDados()">Limpar histÃ³rico</button>
                  </div>

                  ${state.dados.historico.length === 0
            ? `<div class="empty">Sem histÃ³rico.</div>`
            : `
                        <div class="list">
                          ${state.dados.historico.map(item => `
                            <div class="list-item">
                              <div>
                                <div class="list-item-title">${escapeHtml(item.formula)}</div>
                                <div class="list-item-sub">
                                  ${item.grupos.map(g => `${g.quantidade}${g.tipo}: ${g.resultados.join(" + ")}`).join(" â€¢ ")}
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
              <div class="panel-title">InformaÃ§Ãµes bÃ¡sicas</div>
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
                  <label>PreÃ§o</label>
                  <input
                    value="${escapeAttr(equip.preco)}"
                    oninput="updateEquipamento('${equip.id}', 'preco', this.value)"
                  >
                </div>
              </div>
            </div>

            <div class="panel">
              <div class="panel-title">DescriÃ§Ã£o</div>
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

    const mobile = state.screen === "ficha";

    if (mobile) {
        return renderHabilidadeModalMobile(habilidade);
    }

    return `
    <div class="overlay" onclick="fecharModal()">
      <div class="overlay-card" onclick="event.stopPropagation()">
        <div class="overlay-header">
          <div>
            <div class="overlay-title">Habilidade</div>
            <div class="subtitle">DescriÃ§Ã£o e ediÃ§Ã£o</div>
          </div>
          <button class="btn ghost" onclick="fecharModal()">Fechar</button>
        </div>

        <div class="overlay-body">
          <div class="sheet-grid">
            <div class="panel">
              <div class="panel-title">InformaÃ§Ãµes bÃ¡sicas</div>
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
              <div class="panel-title">DescriÃ§Ã£o</div>
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

function renderHabilidadeModalMobile(habilidade) {
    const origemDetalhe = [habilidade.origem, habilidade.origemDetalhe]
        .filter(Boolean)
        .join(" - ");
    const custoVida = Number(habilidade.custoVida) || 0;
    const custoPmPermanente = Number(habilidade.custoPmPermanente) || 0;
    const custoVidaPermanente = Number(habilidade.custoVidaPermanente) || 0;
    const incrementos = Array.isArray(habilidade.incrementos) ? habilidade.incrementos : [];
    const escolhas = Array.isArray(habilidade.escolhas) ? habilidade.escolhas : [];
    const custosHtml = [
        renderLinhaDetalheMobile("Custo de PM", `${Number(habilidade.custoPm) || 0} PM`),
        custoVida ? renderLinhaDetalheMobile("Custo de vida", custoVida) : "",
        custoPmPermanente ? renderLinhaDetalheMobile("PM permanente", custoPmPermanente) : "",
        custoVidaPermanente ? renderLinhaDetalheMobile("Vida permanente", custoVidaPermanente) : ""
    ].join("");
    const extrasHtml = [
        origemDetalhe ? renderLinhaDetalheMobile("Origem", origemDetalhe) : "",
        habilidade.origemBase ? renderLinhaDetalheMobile("Base", habilidade.origemBase) : "",
        habilidade.preRequisitos ? renderLinhaDetalheMobile("Pre-requisitos", habilidade.preRequisitos) : "",
        habilidade.filtros ? renderLinhaDetalheMobile("Filtros", habilidade.filtros) : ""
    ].join("");
    const incrementosHtml = !incrementos.length
        ? ""
        : incrementos.map((inc, idx) => `
          <div class="mf-magia-detail-inc-item">
            <div class="mf-magia-detail-inc-header">
              <div class="mf-magia-detail-inc-check">Incremento ${idx + 1}</div>
            </div>
            <div class="mf-detail-kv">
              ${renderLinhaDetalheMobile("Custo de PM", Number(inc.custoPm) || 0)}
              ${Number(inc.custoVida) ? renderLinhaDetalheMobile("Custo de vida", inc.custoVida) : ""}
              ${Number(inc.custoPmPermanente) ? renderLinhaDetalheMobile("PM permanente", inc.custoPmPermanente) : ""}
              ${Number(inc.custoVidaPermanente) ? renderLinhaDetalheMobile("Vida permanente", inc.custoVidaPermanente) : ""}
            </div>
            ${inc.descricao ? `<div class="mf-detail-text mf-detail-text-spaced">${escapeHtml(inc.descricao)}</div>` : ""}
          </div>
        `).join("");
    const escolhasHtml = !escolhas.length
        ? ""
        : escolhas.map((escolha, idx) => `
          <div class="mf-magia-detail-inc-item">
            <div class="mf-magia-detail-inc-header">
              <div class="mf-magia-detail-inc-check">Escolha ${idx + 1}</div>
            </div>
            <div class="mf-detail-text">${escapeHtml(escolha.descricao || escolha.titulo || escolha.nome || escolha.label || "")}</div>
          </div>
        `).join("");

    return `
      <div class="overlay mf-add-habilidade-overlay" onclick="fecharModal()">
        <div class="overlay-card mf-add-habilidade-modal mf-magia-detail-modal" onclick="event.stopPropagation()">
          <div class="overlay-header mf-add-habilidade-header">
            <div>
              <div class="overlay-title">${escapeHtml(habilidade.nome || "Habilidade")}</div>
              <div class="subtitle">${escapeHtml(origemDetalhe || "Detalhes e edicao")}</div>
            </div>
            <button class="mf-add-habilidade-btn mf-add-habilidade-btn-fechar" onclick="fecharModal()">Fechar</button>
          </div>

          <div class="overlay-body mf-add-habilidade-body mf-magia-detail-body">
            <div class="t20-divider"></div>

            <div class="mf-magia-detail-scroll">
              <div class="mf-magia-detail-card">
                <div class="mf-magia-detail-card-title">Informacoes basicas</div>

                <div class="mf-magia-detail-field">
                  <label>Nome</label>
                  <input value="${escapeAttr(habilidade.nome)}" oninput="updateHabilidade('${habilidade.id}', 'nome', this.value)">
                </div>

                <div class="mf-magia-detail-row2">
                  <div class="mf-magia-detail-field">
                    <label>Custo de PM</label>
                    <input type="number" min="0" value="${escapeAttr(habilidade.custoPm)}" oninput="updateHabilidade('${habilidade.id}', 'custoPm', this.value)">
                  </div>
                  <div class="mf-magia-detail-field">
                    <label>Selecionada</label>
                    <label class="mf-detail-check">
                      <input
                        type="checkbox"
                        ${habilidade.selecionada ? "checked" : ""}
                        onchange="updateHabilidade('${habilidade.id}', 'selecionada', this.checked)"
                      >
                      Usar
                    </label>
                  </div>
                </div>
              </div>

              <div class="mf-magia-detail-card">
                <div class="mf-magia-detail-card-title">Descricao</div>
                <textarea
                  class="mf-magia-detail-textarea"
                  oninput="updateHabilidade('${habilidade.id}', 'descricao', this.value)"
                >${escapeHtml(habilidade.descricao)}</textarea>
              </div>

              ${habilidade.resumoUso ? `
                <div class="mf-magia-detail-card">
                  <div class="mf-magia-detail-card-title">Uso</div>
                  <textarea
                    class="mf-magia-detail-textarea mf-magia-detail-textarea-sm"
                    oninput="updateHabilidade('${habilidade.id}', 'resumoUso', this.value)"
                  >${escapeHtml(habilidade.resumoUso || "")}</textarea>
                </div>
              ` : ""}

              <div class="mf-magia-detail-card">
                <div class="mf-magia-detail-card-title">Custos</div>
                <div class="mf-detail-kv">${custosHtml}</div>
              </div>

              ${extrasHtml ? `
                <div class="mf-magia-detail-card">
                  <div class="mf-magia-detail-card-title">Detalhes</div>
                  <div class="mf-detail-kv">${extrasHtml}</div>
                </div>
              ` : ""}

              ${incrementosHtml ? `
                <div class="mf-magia-detail-card">
                  <div class="mf-magia-detail-card-title">Incrementos</div>
                  ${incrementosHtml}
                </div>
              ` : ""}

              ${escolhasHtml ? `
                <div class="mf-magia-detail-card">
                  <div class="mf-magia-detail-card-title">Escolhas</div>
                  ${escolhasHtml}
                </div>
              ` : ""}

              <button type="button" class="mf-magia-detail-btn-excluir" onclick="excluirHabilidade('${habilidade.id}')">
                Excluir habilidade
              </button>
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

function renderMagiaModalMobile(magia, ficha, resumo) {
    const { pmAtual, custoBase, custoTotal, semPmParaBase, excedeu } = resumo;
    const alerta = excedeu || semPmParaBase;

    const incrementos = Array.isArray(magia.incrementos) ? magia.incrementos : [];

    const incrementosHtml = !incrementos.length
        ? `<div class="mf-magia-detail-vazio">Nenhum incremento cadastrado.</div>`
        : incrementos.map((inc, idx) => {
            const disabled = !inc.selecionado && !podeSelecionarIncremento(magia, inc.id);

            return `
              <div class="mf-magia-detail-inc-item">
                <div class="mf-magia-detail-inc-header">
                  <label class="mf-magia-detail-inc-check">
                    <input
                      type="checkbox"
                      ${inc.selecionado ? "checked" : ""}
                      ${disabled ? "disabled" : ""}
                      onchange="updateIncrementoMagia('${magia.id}', '${inc.id}', 'selecionado', this.checked)"
                    >
                    Incremento ${idx + 1}
                  </label>
                  <button type="button" class="mf-magia-detail-inc-del" onclick="excluirIncrementoMagia('${magia.id}', '${inc.id}')">Excluir</button>
                </div>

                <div class="mf-magia-detail-field mf-magia-detail-field-sm">
                  <label>Custo do incremento (PM)</label>
                  <input
                    type="number"
                    min="0"
                    value="${escapeAttr(inc.custoPm)}"
                    oninput="updateIncrementoMagia('${magia.id}', '${inc.id}', 'custoPm', this.value)"
                  >
                </div>

                <div class="mf-magia-detail-field">
                  <label>DescriÃ§Ã£o do incremento</label>
                  <textarea
                    class="mf-magia-detail-textarea mf-magia-detail-textarea-sm"
                    oninput="updateIncrementoMagia('${magia.id}', '${inc.id}', 'descricao', this.value)"
                  >${escapeHtml(inc.descricao || "")}</textarea>
                </div>
              </div>
            `;
        }).join("");

    return `
    <div class="overlay mf-add-habilidade-overlay" onclick="fecharModal()">
      <div class="overlay-card mf-add-habilidade-modal mf-magia-detail-modal" onclick="event.stopPropagation()">
        <div class="overlay-header mf-add-habilidade-header">
          <div>
            <div class="overlay-title">${escapeHtml(magia.nome || "Magia")}</div>
            <div class="subtitle">CÃ­rculo ${escapeHtml(String(magia.circulo || "â€”"))} â€¢ Detalhes, incrementos e uso</div>
          </div>
          <button class="mf-add-habilidade-btn mf-add-habilidade-btn-fechar" onclick="fecharModal()">Fechar</button>
        </div>

        <div class="overlay-body mf-add-habilidade-body mf-magia-detail-body">
          <div class="t20-divider"></div>

          <div class="mf-magia-detail-scroll">

            <div class="mf-magia-detail-resumo ${alerta ? "is-danger" : ""}">
              PM atual: <strong>${pmAtual}</strong>
              &nbsp;â€¢&nbsp; Custo base: <strong>${custoBase}</strong>
              &nbsp;â€¢&nbsp; Custo total: <strong>${custoTotal}</strong>
            </div>

            <div class="mf-magia-detail-actions">
              <button
                type="button"
                class="mf-add-habilidade-btn mf-add-habilidade-btn-manual mf-magia-detail-btn-usar"
                onclick="usarMagiaAtual()"
                ${alerta ? "disabled" : ""}
              >
                Usar magia
              </button>
            </div>

            <div class="mf-magia-detail-card">
              <div class="mf-magia-detail-card-title">InformaÃ§Ãµes bÃ¡sicas</div>

              <div class="mf-magia-detail-field">
                <label>Nome</label>
                <input value="${escapeAttr(magia.nome)}" oninput="updateMagia('${magia.id}', 'nome', this.value)">
              </div>

              <div class="mf-magia-detail-row2">
                <div class="mf-magia-detail-field">
                  <label>CÃ­rculo</label>
                  <input value="${escapeAttr(magia.circulo)}" oninput="updateMagia('${magia.id}', 'circulo', this.value)">
                </div>
                <div class="mf-magia-detail-field">
                  <label>Custo base (PM)</label>
                  <input type="number" min="0" value="${escapeAttr(magia.custoPm)}" oninput="updateMagia('${magia.id}', 'custoPm', this.value)">
                </div>
              </div>

              <div class="mf-magia-detail-row2">
                <div class="mf-magia-detail-field">
                  <label>ExecuÃ§Ã£o</label>
                  <input value="${escapeAttr(magia.execucao)}" oninput="updateMagia('${magia.id}', 'execucao', this.value)">
                </div>
                <div class="mf-magia-detail-field">
                  <label>Alcance</label>
                  <input value="${escapeAttr(magia.alcance)}" oninput="updateMagia('${magia.id}', 'alcance', this.value)">
                </div>
              </div>

              <div class="mf-magia-detail-row2">
                <div class="mf-magia-detail-field">
                  <label>Ãrea</label>
                  <input value="${escapeAttr(magia.area)}" oninput="updateMagia('${magia.id}', 'area', this.value)">
                </div>
                <div class="mf-magia-detail-field">
                  <label>DuraÃ§Ã£o</label>
                  <input value="${escapeAttr(magia.duracao)}" oninput="updateMagia('${magia.id}', 'duracao', this.value)">
                </div>
              </div>

              <div class="mf-magia-detail-field">
                <label>ResistÃªncia</label>
                <input value="${escapeAttr(magia.resistencia)}" oninput="updateMagia('${magia.id}', 'resistencia', this.value)">
              </div>
            </div>

            <div class="mf-magia-detail-card">
              <div class="mf-magia-detail-card-title">DescriÃ§Ã£o</div>
              <textarea
                class="mf-magia-detail-textarea"
                oninput="updateMagia('${magia.id}', 'descricao', this.value)"
              >${escapeHtml(magia.descricao)}</textarea>
            </div>

            <div class="mf-magia-detail-card">
              <div class="mf-magia-detail-card-title">Incrementos</div>
              ${incrementosHtml}
              <button
                type="button"
                class="mf-add-habilidade-btn mf-add-habilidade-btn-manual mf-magia-detail-btn-add-inc"
                onclick="addIncrementoMagia('${magia.id}')"
              >
                + incremento
              </button>
            </div>

            <button type="button" class="mf-magia-detail-btn-excluir" onclick="excluirMagia('${magia.id}')">
              Excluir magia
            </button>

          </div>
        </div>
      </div>
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

    const mobile = state.screen === "ficha";

    if (mobile) {
        return renderMagiaModalMobile(magia, ficha, {
            pmAtual, custoBase, custoTotal, semPmParaBase, excedeu
        });
    }

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
              <div class="panel-title">InformaÃ§Ãµes bÃ¡sicas</div>
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
                    <label>CÃ­rculo</label>
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
                    <label>ExecuÃ§Ã£o</label>
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
                    <label>Ãrea</label>
                    <input
                      value="${escapeAttr(magia.area)}"
                      oninput="updateMagia('${magia.id}', 'area', this.value)"
                    >
                  </div>
                </div>

                <div style="height:14px"></div>

                <div class="row-2">
                  <div class="field">
                    <label>DuraÃ§Ã£o</label>
                    <input
                      value="${escapeAttr(magia.duracao)}"
                      oninput="updateMagia('${magia.id}', 'duracao', this.value)"
                    >
                  </div>

                  <div class="field">
                    <label>ResistÃªncia</label>
                    <input
                      value="${escapeAttr(magia.resistencia)}"
                      oninput="updateMagia('${magia.id}', 'resistencia', this.value)"
                    >
                  </div>
                </div>
              </div>
            </div>

            <div class="panel">
              <div class="panel-title">DescriÃ§Ã£o</div>
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
                ${!magia.incrementos.length
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
                    <label>DescriÃ§Ã£o do incremento</label>
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
                  Custo total: <strong style="${excedeu || semPmParaBase ? "color:var(--vermelho-escuro);" : ""}">${custoTotal}</strong>
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

function agendarFiltroModalAdicionarHabilidade(valor) {
    if (filtroAdicionarHabilidadeTimer) {
        clearTimeout(filtroAdicionarHabilidadeTimer);
    }

    filtroAdicionarHabilidadeTimer = setTimeout(() => {
        aplicarFiltroModalAdicionarHabilidade(valor);
    }, 180);
}

function aplicarFiltroModalAdicionarHabilidade(valor = "") {
    const lista = document.getElementById("lista-adicionar-habilidade");
    if (!lista) return;

    const termo = normalizarTextoRegra(valor);
    let totalVisivel = 0;

    Array.from(lista.querySelectorAll("[data-habilidade-nome-normalizado]")).forEach(item => {
        const nomeNormalizado = item.getAttribute("data-habilidade-nome-normalizado") || "";
        const exibir = !termo || nomeNormalizado.includes(termo);

        item.style.display = exibir ? "" : "none";

        if (exibir) {
            totalVisivel += 1;
        }
    });

    const mensagem = document.getElementById("mensagem-sem-habilidades-banco");
    if (mensagem) {
        mensagem.style.display = totalVisivel === 0 ? "block" : "none";
        mensagem.textContent = termo
            ? "Nenhum poder encontrado para essa busca."
            : "Nenhum poder disponÃ­vel no banco.";
    }
}

function limparBuscaModalAdicionarHabilidade() {
    const campo = document.getElementById("busca-adicionar-habilidade");
    if (!campo) return;

    campo.value = "";
    aplicarFiltroModalAdicionarHabilidade("");
    campo.focus();
}

function renderModalAdicionarHabilidade() {
    if (state.modal !== "habilidade_adicionar") return "";

    const ficha = getFichaAtual();
    if (!ficha) return "";

    const registros = getPoderesDisponiveisParaAdicionarNaFicha();
    const mobile = state.screen === "ficha";

    setTimeout(() => {
        document.body.classList.add("modal-open");

        const campoBusca = document.getElementById("busca-adicionar-habilidade");
        if (campoBusca && document.activeElement !== campoBusca) {
            campoBusca.focus();
        }
    }, 0);

    return `
    <div class="overlay ${mobile ? "mf-add-habilidade-overlay" : ""}" onclick="fecharModal()">
      <div class="overlay-card ${mobile ? "mf-add-habilidade-modal" : ""}" onclick="event.stopPropagation()">
        <div class="overlay-header ${mobile ? "mf-add-habilidade-header" : ""}">
          <div>
            <div class="overlay-title">Adicionar habilidade</div>
            <div class="subtitle">VocÃª pode cadastrar manualmente ou escolher poderes gerais e de classe.</div>
          </div>
          <button class="${mobile ? "mf-add-habilidade-btn mf-add-habilidade-btn-fechar" : "btn ghost"}" onclick="fecharModal()">Fechar</button>
        </div>

        <div class="overlay-body ${mobile ? "mf-add-habilidade-body" : ""}">
          ${mobile ? `<div class="t20-divider"></div>` : ""}
          <div class="${mobile ? "mf-add-habilidade-manual" : "actions"}" ${mobile ? "" : `style="margin-bottom:12px; gap:10px;"`}>
            <button class="${mobile ? "mf-add-habilidade-btn mf-add-habilidade-btn-manual" : "btn"}" onclick="adicionarHabilidadeManualNaFicha()">
              ${mobile ? "add manual" : "Adicionar manualmente"}
            </button>
          </div>

          <div class="${mobile ? "mf-add-habilidade-search" : "row-2"}" ${mobile ? "" : `style="margin-bottom:12px; align-items:end;"`}>
            <div class="field ${mobile ? "mf-add-habilidade-field" : ""}" style="margin:0;">
              <label>Buscar por nome</label>
              <input
                id="busca-adicionar-habilidade"
                type="search"
                placeholder="Digite o nome do poder"
                oninput="agendarFiltroModalAdicionarHabilidade(this.value)"
                onkeydown="if (event.key === 'Enter') { event.preventDefault(); aplicarFiltroModalAdicionarHabilidade(this.value); }"
              >
            </div>

            <div class="${mobile ? "mf-add-habilidade-clear" : "actions"}" ${mobile ? "" : `style="justify-content:flex-end; align-items:end;"`}>
              <button class="${mobile ? "mf-add-habilidade-btn mf-add-habilidade-btn-limpar" : "btn ghost"}" type="button" onclick="limparBuscaModalAdicionarHabilidade()">
                Limpar
              </button>
            </div>
          </div>

          ${mobile ? `<div class="t20-divider"></div>` : ""}

          ${registros.length === 0
            ? `<div class="empty">Nenhum poder disponÃ­vel no banco.</div>`
            : `
              <div id="mensagem-sem-habilidades-banco" class="empty" style="display:none; margin-bottom:12px;">Nenhum poder encontrado para essa busca.</div>

              <div class="${mobile ? "mf-add-habilidade-lista" : "list"}" id="lista-adicionar-habilidade">
                ${mobile ? `
                  <div class="mf-add-habilidade-lista-head">
                    <div>Poder</div>
                    <div>Acao</div>
                  </div>
                ` : ""}
                ${registros.map(registro => `
                  <div
                    class="${mobile ? "mf-add-habilidade-row" : "list-item"}"
                    data-habilidade-nome-normalizado="${escapeAttr(normalizarTextoRegra(registro.nome || ""))}"
                  >
                    <div class="${mobile ? "mf-add-habilidade-info" : ""}" ${mobile ? "" : `style="flex:1;"`}>
                      <div class="${mobile ? "mf-add-habilidade-nome" : "list-item-title"}">${escapeHtml(registro.nome || "Sem nome")}</div>
                      <div class="${mobile ? "mf-add-habilidade-origem" : "list-item-sub"}">
                        ${registro.origemBase ? escapeHtml(registro.origemBase) : "Poder"}
                      </div>
                    </div>

                    <div class="${mobile ? "mf-add-habilidade-add-cell" : "actions"}">
                      <button class="${mobile ? "mf-add-habilidade-btn mf-add-habilidade-btn-add" : "btn primary"}" onclick="adicionarPoderDoBancoNaFicha('${escapeAttr(String(registro.chaveOrigemPoder || registro.id))}')">
                      Adicionar
                    </button>
                    </div>
                  </div>
                `).join("")}
              </div>
            `
        }
        </div>
      </div>
    </div>
  `;
}

function agendarFiltroModalAdicionarMagia(valor) {
    if (filtroAdicionarMagiaTimer) {
        clearTimeout(filtroAdicionarMagiaTimer);
    }

    filtroAdicionarMagiaTimer = setTimeout(() => {
        aplicarFiltroModalAdicionarMagia(valor);
    }, 180);
}

function aplicarFiltroModalAdicionarMagia(valor = "") {
    const lista = document.getElementById("lista-adicionar-magia");
    if (!lista) return;

    const termo = normalizarTextoRegra(valor);
    let totalVisivel = 0;

    Array.from(lista.querySelectorAll("[data-magia-nome-normalizado]")).forEach(item => {
        const nomeNormalizado = item.getAttribute("data-magia-nome-normalizado") || "";
        const exibir = !termo || nomeNormalizado.includes(termo);

        item.style.display = exibir ? "" : "none";

        if (exibir) {
            totalVisivel += 1;
        }
    });

    const mensagem = document.getElementById("mensagem-sem-magias-banco");
    if (mensagem) {
        mensagem.style.display = totalVisivel === 0 ? "block" : "none";
        mensagem.textContent = termo
            ? "Nenhuma magia encontrada para essa busca."
            : "Nenhuma magia disponÃ­vel para este personagem.";
    }
}

function limparBuscaModalAdicionarMagia() {
    const campo = document.getElementById("busca-adicionar-magia");
    if (!campo) return;

    campo.value = "";
    aplicarFiltroModalAdicionarMagia("");
    campo.focus();
}

function renderModalAdicionarMagia() {
    if (state.modal !== "magia_adicionar") return "";

    const ficha = getFichaAtual();
    if (!ficha) return "";

    const registros = getMagiasDisponiveisParaAdicionarNaFicha(ficha);
    const mobile = state.screen === "ficha";

    setTimeout(() => {
        document.body.classList.add("modal-open");

        const campoBusca = document.getElementById("busca-adicionar-magia");
        if (campoBusca && document.activeElement !== campoBusca) {
            campoBusca.focus();
        }
    }, 0);

    return `
    <div class="overlay ${mobile ? "mf-add-habilidade-overlay" : ""}" onclick="fecharModal()">
      <div class="overlay-card ${mobile ? "mf-add-habilidade-modal" : ""}" onclick="event.stopPropagation()">
        <div class="overlay-header ${mobile ? "mf-add-habilidade-header" : ""}">
          <div>
            <div class="overlay-title">Adicionar magia</div>
            <div class="subtitle">Lista de magias disponÃ­veis para o personagem por cÃ­rculo.</div>
          </div>
          <button class="${mobile ? "mf-add-habilidade-btn mf-add-habilidade-btn-fechar" : "btn ghost"}" onclick="fecharModal()">Fechar</button>
        </div>

        <div class="overlay-body ${mobile ? "mf-add-habilidade-body" : ""}">
          ${mobile ? `<div class="t20-divider"></div>` : ""}
          <div class="${mobile ? "mf-add-habilidade-manual" : "actions"}" ${mobile ? "" : `style="margin-bottom:12px; gap:10px;"`}>
            <button class="${mobile ? "mf-add-habilidade-btn mf-add-habilidade-btn-manual" : "btn"}" onclick="adicionarMagiaManualNaFicha()">
              ${mobile ? "add manual" : "Adicionar manualmente"}
            </button>
          </div>

          <div class="${mobile ? "mf-add-habilidade-search" : "row-2"}" ${mobile ? "" : `style="margin-bottom:12px; align-items:end;"`}>
            <div class="field ${mobile ? "mf-add-habilidade-field" : ""}" style="margin:0;">
              <label>Buscar por nome</label>
              <input
                id="busca-adicionar-magia"
                type="search"
                placeholder="Digite o nome da magia"
                oninput="agendarFiltroModalAdicionarMagia(this.value)"
                onkeydown="if (event.key === 'Enter') { event.preventDefault(); aplicarFiltroModalAdicionarMagia(this.value); }"
              >
            </div>

            <div class="${mobile ? "mf-add-habilidade-clear" : "actions"}" ${mobile ? "" : `style="justify-content:flex-end; align-items:end;"`}>
              <button class="${mobile ? "mf-add-habilidade-btn mf-add-habilidade-btn-limpar" : "btn ghost"}" type="button" onclick="limparBuscaModalAdicionarMagia()">
                Limpar
              </button>
            </div>
          </div>

          ${mobile ? `<div class="t20-divider"></div>` : ""}

          ${registros.length === 0
            ? `<div class="empty">Nenhuma magia disponÃ­vel para este personagem.</div>`
            : `
              <div id="mensagem-sem-magias-banco" class="empty" style="display:none; margin-bottom:12px;">Nenhuma magia encontrada para essa busca.</div>

              <div class="${mobile ? "mf-add-habilidade-lista" : "list"}" id="lista-adicionar-magia">
                ${mobile ? `
                  <div class="mf-add-habilidade-lista-head">
                    <div>Magia</div>
                    <div>Acao</div>
                  </div>
                ` : ""}
                ${registros.map(registro => `
                  <div
                    class="${mobile ? "mf-add-habilidade-row" : "list-item"}"
                    data-magia-nome-normalizado="${escapeAttr(normalizarTextoRegra(registro.nome || ""))}"
                  >
                    <div class="${mobile ? "mf-add-habilidade-info" : ""}" ${mobile ? "" : `style="flex:1;"`}>
                      <div class="${mobile ? "mf-add-habilidade-nome" : "list-item-title"}">${escapeHtml(registro.nome || "Sem nome")}</div>
                      <div class="${mobile ? "mf-add-habilidade-origem" : "list-item-sub"}">
                        CÃ­rculo ${escapeHtml(String(registro.circulo || "â€”"))}
                        ${registro.tradicao ? ` â€¢ ${escapeHtml(registro.tradicao)}` : ""}
                        ${registro.escola ? ` â€¢ ${escapeHtml(registro.escola)}` : ""}
                      </div>
                    </div>

                    <div class="${mobile ? "mf-add-habilidade-add-cell" : "actions"}">
                      <button
                        class="${mobile ? "mf-add-habilidade-btn mf-add-habilidade-btn-add" : "btn primary"}"
                        onclick="adicionarMagiaDoBancoNaFicha('${escapeAttr(String(registro.id))}')"
                      >
                        Adicionar
                      </button>
                    </div>
                  </div>
                `).join("")}
              </div>
            `
        }
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

function getTotalDadosSelecionados() {
    return state.dados.grupos.reduce((total, grupo) => {
        return total + (Number(grupo.quantidade) || 0);
    }, 0);
}

function updateGrupoDado(id, field, value) {
    const grupo = state.dados.grupos.find(g => g.id === id);
    if (!grupo) return;

    if (field === "quantidade") {
        const novaQuantidade = Math.max(1, Number(value) || 1);

        const totalSemGrupo = state.dados.grupos.reduce((total, g) => {
            if (g.id === id) return total;
            return total + (Number(g.quantidade) || 0);
        }, 0);

        grupo.quantidade = Math.min(novaQuantidade, Math.max(1, 50 - totalSemGrupo));
        render();
        return;
    }

    grupo[field] = value;
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
    const totalDados = getTotalDadosSelecionados();

    if (totalDados > 50) {
        alert(`VocÃª sÃ³ pode rolar no mÃ¡ximo 50 dados no total. Atual: ${totalDados}.`);
        return;
    }

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
    const ok = confirm("Limpar histÃ³rico de rolagens?");
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
function secaoFichaEstaAberta(chave) {
    if (!state.secoesFicha) {
        state.secoesFicha = {
            habilidadesRaciais: true,
            poderes: true,
            magias: true,
            inventario: true
        };
    }

    if (!(chave in state.secoesFicha)) {
        state.secoesFicha[chave] = true;
    }

    return !!state?.secoesFicha?.[chave];
}

function toggleSecaoFicha(chave) {
    if (!state.secoesFicha) {
        state.secoesFicha = {
            habilidadesRaciais: true,
            poderes: true,
            magias: true,
            inventario: true
        };
    }

    state.secoesFicha[chave] = !state.secoesFicha[chave];
    render();
}
function escapeAttr(value) {
    return escapeHtml(value);
}

function garantirEstadoMenuUsuario() {
    if (!state.menuUsuario) {
        state.menuUsuario = {
            aberto: false,
            tema: getTemaMenuUsuarioSalvo(),
            modal: null,
            nome: "",
            novaSenha: "",
            confirmarSenha: ""
        };
    }

    if (state.menuUsuario.tema !== "noite" && state.menuUsuario.tema !== "dia") {
        state.menuUsuario.tema = getTemaMenuUsuarioSalvo();
    }

    return state.menuUsuario;
}

function getUsuarioAtual() {
    return window.T20Supabase?.SUPA?.state?.user || null;
}

function getNomeUsuarioAtual() {
    const usuario = getUsuarioAtual();
    if (!usuario) return "";

    const meta = usuario.user_metadata || {};
    const nome =
        String(meta.display_name || "").trim() ||
        String(meta.full_name || "").trim() ||
        String(meta.name || "").trim();

    if (nome) return nome;

    const email = String(usuario.email || "").trim();
    return email ? email.split("@")[0] : "Usuario";
}

function getIniciaisUsuarioAtual() {
    const nome = getNomeUsuarioAtual();
    const partes = nome
        .split(/\s+/)
        .map(p => p.trim())
        .filter(Boolean);

    if (!partes.length) return "U";

    const letras = partes.length === 1
        ? partes[0].slice(0, 2)
        : `${partes[0][0] || ""}${partes[partes.length - 1][0] || ""}`;

    return letras.toUpperCase();
}

function toggleMenuUsuario() {
    const menu = garantirEstadoMenuUsuario();
    menu.aberto = !menu.aberto;
    render();
}

function alternarTemaMenuUsuario() {
    const menu = garantirEstadoMenuUsuario();
    menu.tema = menu.tema === "dia" ? "noite" : "dia";
    salvarTemaMenuUsuario(menu.tema);
    aplicarTemaMenuUsuario(menu.tema);
    render();
}

function abrirModalDadosMenuUsuario() {
    const menu = garantirEstadoMenuUsuario();
    menu.aberto = false;
    state.modal = "dados";
    render();
}

function abrirModalRegrasMenuUsuario() {
    const menu = garantirEstadoMenuUsuario();
    menu.aberto = false;
    abrirModalRegras();
}

function abrirModalAlterarNomeUsuario() {
    const menu = garantirEstadoMenuUsuario();
    menu.aberto = true;
    menu.modal = "nome";
    menu.nome = getNomeUsuarioAtual();
    render();
}

function abrirModalAlterarSenhaUsuario() {
    const menu = garantirEstadoMenuUsuario();
    menu.aberto = true;
    menu.modal = "senha";
    menu.novaSenha = "";
    menu.confirmarSenha = "";
    render();
}

function fecharModalMenuUsuario() {
    const menu = garantirEstadoMenuUsuario();
    menu.modal = null;
    menu.nome = "";
    menu.novaSenha = "";
    menu.confirmarSenha = "";
    document.body.classList.remove("modal-open");
    render();
}

function atualizarCampoMenuUsuario(campo, valor) {
    const menu = garantirEstadoMenuUsuario();
    menu[campo] = valor;
}

async function confirmarAlterarNomeUsuario() {
    const menu = garantirEstadoMenuUsuario();
    const nome = String(menu.nome || "").trim();

    if (!nome) {
        alert("Informe o nome de usuario.");
        return;
    }

    try {
        await window.T20Supabase.alterarNomeUsuario(nome);
        menu.modal = null;
        menu.nome = "";
        document.body.classList.remove("modal-open");
        alert("Nome alterado com sucesso.");
        render();
    } catch (err) {
        console.error(err);
        alert(err?.message || "Nao foi possivel alterar o nome.");
    }
}

async function confirmarAlterarSenhaMenuUsuario() {
    const menu = garantirEstadoMenuUsuario();
    const novaSenha = String(menu.novaSenha || "");
    const confirmar = String(menu.confirmarSenha || "");

    if (!novaSenha || !confirmar) {
        alert("Preencha a nova senha e a confirmacao.");
        return;
    }

    if (novaSenha !== confirmar) {
        alert("As senhas nao conferem.");
        return;
    }

    try {
        await window.T20Supabase.alterarSenha(novaSenha);
        menu.modal = null;
        menu.novaSenha = "";
        menu.confirmarSenha = "";
        document.body.classList.remove("modal-open");
        alert("Senha alterada com sucesso.");
        render();
    } catch (err) {
        console.error(err);
        alert(err?.message || "Nao foi possivel alterar a senha.");
    }
}

function renderModalMenuUsuario() {
    const menu = garantirEstadoMenuUsuario();
    if (!menu.modal) return "";

    document.body.classList.add("modal-open");

    if (menu.modal === "nome") {
        return `
          <div class="overlay" onclick="fecharModalMenuUsuario()">
            <div class="overlay-card user-menu-modal" onclick="event.stopPropagation()">
              <div class="overlay-header">
                <div>
                  <div class="overlay-title">Alterar nome de usuario</div>
                </div>
                <button class="btn ghost" onclick="fecharModalMenuUsuario()">Fechar</button>
              </div>

              <div class="overlay-body">
                <div class="field">
                  <label>Nome de usuario</label>
                  <input
                    type="text"
                    value="${escapeAttr(menu.nome || "")}"
                    oninput="atualizarCampoMenuUsuario('nome', this.value)"
                  >
                </div>

                <div class="actions user-menu-modal-actions">
                  <button class="btn primary" onclick="confirmarAlterarNomeUsuario()">Salvar</button>
                </div>
              </div>
            </div>
          </div>
        `;
    }

    if (menu.modal === "senha") {
        return `
          <div class="overlay" onclick="fecharModalMenuUsuario()">
            <div class="overlay-card user-menu-modal" onclick="event.stopPropagation()">
              <div class="overlay-header">
                <div>
                  <div class="overlay-title">Mudar senha</div>
                </div>
                <button class="btn ghost" onclick="fecharModalMenuUsuario()">Fechar</button>
              </div>

              <div class="overlay-body">
                <div class="field">
                  <label>Nova senha</label>
                  <input
                    type="password"
                    value="${escapeAttr(menu.novaSenha || "")}"
                    oninput="atualizarCampoMenuUsuario('novaSenha', this.value)"
                  >
                </div>

                <div style="height:12px"></div>

                <div class="field">
                  <label>Confirmar nova senha</label>
                  <input
                    type="password"
                    value="${escapeAttr(menu.confirmarSenha || "")}"
                    oninput="atualizarCampoMenuUsuario('confirmarSenha', this.value)"
                  >
                </div>

                <div class="actions user-menu-modal-actions">
                  <button class="btn primary" onclick="confirmarAlterarSenhaMenuUsuario()">Salvar senha</button>
                </div>
              </div>
            </div>
          </div>
        `;
    }

    return "";
}

function renderMenuUsuarioGlobal() {
    if (!usuarioLogado()) return;

    const menu = garantirEstadoMenuUsuario();
    const nome = getNomeUsuarioAtual();
    const iniciais = getIniciaisUsuarioAtual();
    const expandido = !!menu.aberto;
    const temaDia = menu.tema !== "noite";
    const menuFichaMobile = state.screen === "ficha";

    app.insertAdjacentHTML("beforeend", `
      <aside class="user-menu ${expandido ? "is-open" : ""} ${menuFichaMobile ? "is-ficha-mobile" : ""}" aria-label="Menu do usuario">
        <button class="user-menu-toggle" type="button" onclick="toggleMenuUsuario()" title="${expandido ? "Recolher menu" : "Abrir menu"}">
          ${expandido
            ? `<span class="user-menu-name">${escapeHtml(nome)}</span>`
            : `<span class="user-menu-initials">${escapeHtml(iniciais)}</span>`
        }
        </button>

        ${expandido ? `
          <div class="user-menu-actions">
            <div class="user-menu-icon-row">
              <button
                class="user-menu-icon-btn"
                type="button"
                onclick="alternarTemaMenuUsuario()"
                title="${temaDia ? "Modo diurno" : "Modo noturno"}"
                aria-label="${temaDia ? "Modo diurno" : "Modo noturno"}"
              >
                ${temaDia ? "&#9728;" : "&#9790;"}
              </button>

              <button
                class="user-menu-icon-btn user-menu-dice-btn"
                type="button"
                onclick="abrirModalDadosMenuUsuario()"
                title="Rolar dados"
                aria-label="Rolar dados"
              >
                <span class="user-menu-dice-icon" aria-hidden="true"></span>
              </button>

              <button
                class="user-menu-icon-btn user-menu-book-btn"
                type="button"
                onclick="abrirModalRegrasMenuUsuario()"
                title="Abrir regras"
                aria-label="Abrir regras"
              >
                <span class="user-menu-book-icon" aria-hidden="true"></span>
              </button>
            </div>

            <button class="btn user-menu-action" type="button" onclick="abrirModalAlterarNomeUsuario()">Alterar nome de usuario</button>
            <button class="btn user-menu-action" type="button" onclick="abrirModalAlterarSenhaUsuario()">Mudar senha</button>
            <button class="btn danger user-menu-action" type="button" onclick="sairAuth()">Sair</button>
          </div>
        ` : ""}
      </aside>
      ${renderModalMenuUsuario()}
      ${renderDadosModal()}
      ${renderModalRegras()}
      ${renderModalImagemPersonagemCriacao()}
      ${renderModalImagemPersonagemFicha()}
    `);
}

function renderCarregandoSessao() {
    app.innerHTML = `
    <div class="loading-screen" aria-label="Carregando">
      <div class="loading-spinner" aria-hidden="true">
        ${Array.from({ length: 8 }, (_, i) => `<span style="--i:${i}"></span>`).join("")}
      </div>
    </div>
  `;
}

function render() {
    aplicarTemaMenuUsuario(garantirEstadoMenuUsuario().tema);

    if (!sessaoAuthVerificada()) {
        return renderCarregandoSessao();
    }

    if (TELAS_QUE_EXIGEM_LOGIN.has(state.screen) && !usuarioLogado()) {
        state.screen = "auth";
    }

    if (state.screen === "home" && !usuarioLogado()) {
        state.screen = "auth";
    }

    document.body.dataset.screen = state.screen;

    if (state.screen === "home") {
        renderHome();
    } else if (state.screen === "personagens") {
        renderPersonagens();
    } else if (state.screen === "criacao") {
        agendarSalvarRascunhoCriacao();
        renderCriacao();
    } else if (state.screen === "evolucao") {
        renderEvolucao();
    } else if (state.screen === "dados") {
        renderDados();
    } else if (state.screen === "ficha") {
        renderFicha();
    } else if (state.screen === "mestre") {
        renderMestre();
    } else if (state.screen === "auth") {
        renderAuth();
    }

    renderMenuUsuarioGlobal();
}

async function iniciarApp() {
    render();

    if (window.T20Supabase?.onAuthChange) {
        window.T20Supabase.onAuthChange(async (usuario) => {
            state.auth.carregandoSessao = false;
            state.auth.sessaoVerificada = true;

            if (usuario) {
                if (state.screen === "auth") {
                    state.screen = "home";
                }
                await carregarFichasDoUsuario();
            } else {
                state.fichas = [];
                state.fichasCarregadas = false;
                if (TELAS_QUE_EXIGEM_LOGIN.has(state.screen) || state.screen === "home") {
                    state.screen = "auth";
                }
                render();
            }
        });
    }

    const usuario = await window.T20Supabase?.ready;
    state.auth.carregandoSessao = false;
    state.auth.sessaoVerificada = true;

    if (usuario) {
        state.screen = "home";
        await carregarFichasDoUsuario();
        return;
    }

    state.screen = "auth";
    render();
}

iniciarApp();

window.addEventListener("beforeunload", () => {
    flushFichaAtualAgora();
    if (state.screen === "criacao") {
        salvarRascunhoCriacao();
    }
});

setTimeout(() => {
    carregarTodosOsBancos();
}, 0);
