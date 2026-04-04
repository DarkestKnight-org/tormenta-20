/* Tormenta 20 - cliente mínimo Supabase para ficha ativa online
   Ajuste só URL e anonKey. Mantive o nome anonKey para combinar com seu código.
*/
(function (global) {
  const SUPA = {
    client: null,
    config: {
      url: 'https://vjfpaondnebqbypcjfrw.supabase.co',
      anonKey: 'sb_publishable_UJ1kbOfPaaWOx-R84GFwwQ_zh9Q9Ew5'
    },
    state: {
      user: null,
      currentMesaId: null,
      syncTimer: null,
      channel: null,
      isSaving: false,
      lastSyncedAt: null,
      onRemoteCharacterChange: null
    }
  };

  function ensureClient() {
    if (!window.supabase) throw new Error('Biblioteca do Supabase não carregada.');
    if (!SUPA.client) {
      SUPA.client = window.supabase.createClient(SUPA.config.url, SUPA.config.anonKey);
    }
    return SUPA.client;
  }

  async function init() {
    const client = ensureClient();
    const { data } = await client.auth.getUser();
    SUPA.state.user = data?.user || null;

    client.auth.onAuthStateChange((_event, session) => {
      SUPA.state.user = session?.user || null;
    });

    return SUPA.state.user;
  }

  async function signUp(email, password, displayName) {
    const client = ensureClient();
    const { data, error } = await client.auth.signUp({
      email,
      password,
      options: {
        data: { display_name: displayName || email.split('@')[0] }
      }
    });
    if (error) throw error;
    SUPA.state.user = data?.user || null;
    return data;
  }
    async function alterarSenha(novaSenha) {
        const client = ensureClient();

        if (!SUPA.state.user) {
            throw new Error("Usuário não autenticado.");
        }

        const senha = String(novaSenha || "");
        if (!senha) {
            throw new Error("Informe a nova senha.");
        }

        const { data, error } = await client.auth.updateUser({
            password: senha
        });

        if (error) throw error;
        return data;
    }

  async function signIn(email, password) {
    const client = ensureClient();
    const { data, error } = await client.auth.signInWithPassword({ email, password });
    if (error) throw error;
    SUPA.state.user = data?.user || null;
    return data;
  }

  async function signOut() {
    const client = ensureClient();
    if (SUPA.state.channel) {
      await client.removeChannel(SUPA.state.channel);
      SUPA.state.channel = null;
    }
    const { error } = await client.auth.signOut();
    if (error) throw error;
    SUPA.state.user = null;
  }

  async function listarMesas() {
    const client = ensureClient();
    const { data, error } = await client
      .from('mesas')
      .select('id, nome, codigo_convite, master_user_id, created_at')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  }

  async function criarMesa(nome) {
  const client = ensureClient();
  const nomeLimpo = String(nome || "").trim();
  if (!nomeLimpo) throw new Error("Informe o nome da mesa.");

  const { data, error } = await client.rpc("criar_mesa", { _nome: nomeLimpo });

  if (error) {
    if (
      error.code === "23505" ||
      String(error.message || "").toLowerCase().includes("duplicate") ||
      String(error.message || "").toLowerCase().includes("unique")
    ) {
      throw new Error("Já existe uma mesa com esse nome. Escolha outro.");
    }
    throw error;
  }

  SUPA.state.currentMesaId = data;
  return data;
}
    async function listarMinhasMesas() {
        const client = ensureClient();
        if (!SUPA.state.user) throw new Error("Usuário não autenticado.");

        const { data, error } = await client
            .from("mesas")
            .select("id, nome, codigo_convite, master_user_id, created_at")
            .eq("master_user_id", SUPA.state.user.id)
            .order("created_at", { ascending: false });

        if (error) throw error;
        return data || [];
    }

    async function buscarMesaPorNome(nome) {
        const client = ensureClient();
        const { data, error } = await client.rpc("buscar_mesa_por_nome", { _nome: nome });

        if (error) throw error;
        return Array.isArray(data) ? (data[0] || null) : data || null;
    }

    async function excluirMesa(mesaId) {
        const client = ensureClient();
        const { error } = await client.rpc("excluir_mesa", { _mesa_id: mesaId });
        if (error) throw error;
        return true;
    }

  async function entrarNaMesaPorCodigo(codigo) {
    const client = ensureClient();
    const { data, error } = await client.rpc('entrar_na_mesa_por_codigo', { _codigo: codigo });
    if (error) throw error;
    SUPA.state.currentMesaId = data;
    return data;
  }

  async function listarFichasAtivasDaMesa(mesaId) {
    const client = ensureClient();
    const { data, error } = await client
      .from('characters')
      .select('id, owner_user_id, mesa_id, nome, ficha_local_id, ficha_json, is_active, updated_at')
      .eq('mesa_id', mesaId)
      .eq('is_active', true)
      .order('updated_at', { ascending: false });
    if (error) throw error;
    return data || [];
  }

  async function ativarFicha({ mesaId, ficha }) {
    const client = ensureClient();
    if (!SUPA.state.user) throw new Error('Usuário não autenticado.');

    const { error: errorDeactivate } = await client
      .from('characters')
      .update({ is_active: false })
      .eq('owner_user_id', SUPA.state.user.id)
      .eq('mesa_id', mesaId);
    if (errorDeactivate) throw errorDeactivate;

    const payload = {
      owner_user_id: SUPA.state.user.id,
      mesa_id: mesaId,
      nome: ficha.nome || 'Sem nome',
      ficha_local_id: String(ficha.id),
      ficha_json: ficha,
      is_active: true
    };

    const { data, error } = await client
      .from('characters')
      .upsert(payload, { onConflict: 'owner_user_id,ficha_local_id' })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async function desativarFicha({ mesaId, fichaLocalId }) {
    const client = ensureClient();
    if (!SUPA.state.user) throw new Error('Usuário não autenticado.');

    const { error } = await client
      .from('characters')
      .update({ is_active: false })
      .eq('owner_user_id', SUPA.state.user.id)
      .eq('mesa_id', mesaId)
      .eq('ficha_local_id', String(fichaLocalId));

    if (error) throw error;
    return true;
  }

  async function syncFichaAtivaAgora({ mesaId, ficha }) {
    const client = ensureClient();
    if (!SUPA.state.user) throw new Error('Usuário não autenticado.');

    SUPA.state.isSaving = true;
    try {
      const payload = {
        owner_user_id: SUPA.state.user.id,
        mesa_id: mesaId,
        nome: ficha.nome || 'Sem nome',
        ficha_local_id: String(ficha.id),
        ficha_json: ficha,
        is_active: true
      };

      const { data, error } = await client
        .from('characters')
        .upsert(payload, { onConflict: 'owner_user_id,ficha_local_id' })
        .select()
        .single();

      if (error) throw error;

      SUPA.state.lastSyncedAt = new Date().toISOString();
      return data;
    } finally {
      SUPA.state.isSaving = false;
    }
  }

  function agendarSyncFichaAtiva({ mesaId, ficha, wait = 900 }) {
    clearTimeout(SUPA.state.syncTimer);
    SUPA.state.syncTimer = setTimeout(async () => {
      try {
        await syncFichaAtivaAgora({ mesaId, ficha });
      } catch (err) {
        console.error('Erro ao sincronizar ficha ativa:', err);
      }
    }, wait);
  }

  async function assinarMesaAtiva(mesaId, onChange) {
    const client = ensureClient();

    if (SUPA.state.channel) {
      await client.removeChannel(SUPA.state.channel);
      SUPA.state.channel = null;
    }

    SUPA.state.onRemoteCharacterChange = onChange || null;
    SUPA.state.currentMesaId = mesaId;

    const channel = client
      .channel(`mesa-${mesaId}-characters`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'characters',
          filter: `mesa_id=eq.${mesaId}`
        },
        (payload) => {
          if (typeof SUPA.state.onRemoteCharacterChange === 'function') {
            SUPA.state.onRemoteCharacterChange(payload);
          }
        }
      )
      .subscribe();

    SUPA.state.channel = channel;
    return channel;
  }

  global.T20Supabase = {
    SUPA,
    init,
    signUp,
    signIn,
    signOut,
    listarMesas,
    criarMesa,
    entrarNaMesaPorCodigo,
    listarFichasAtivasDaMesa,
    ativarFicha,
    desativarFicha,
    syncFichaAtivaAgora,
    agendarSyncFichaAtiva,
    assinarMesaAtiva,
    listarMinhasMesas,
    buscarMesaPorNome,
    excluirMesa,
    alterarSenha,
  };

  init().catch((err) => {
    console.error('Erro ao inicializar Supabase:', err);
  });
})(window);

console.log('Supabase lib:', !!window.supabase);
console.log('T20Supabase:', !!window.T20Supabase);
console.log('Supabase client:', !!window.T20Supabase?.SUPA?.client);
