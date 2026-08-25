/**
 * =============================================================================
 * ADAPTADOR DE BANCO DE DADOS - SUPABASE (PostgreSQL) - lib/db.js
 * =============================================================================
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY || process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

let supabase = null;

if (supabaseUrl && supabaseKey && !supabaseUrl.includes('seu-projeto')) {
  supabase = createClient(supabaseUrl, supabaseKey);
} else {
  console.warn('\x1b[33m%s\x1b[0m', '⚠️  Aviso: Variáveis SUPABASE_URL e SUPABASE_KEY não configuradas no .env. Usando armazenamento em memória temporário.');
}

// ── FALLBACK EM MEMÓRIA (caso ainda não tenha preenchido o .env) ──────────────
let _nextModeloId = 4;
let _nextMovId    = 11;
let _mockModelos = [
  { id: 1, nome: 'HP CF217A',        descricao: 'HP LaserJet Pro M102/M130', estoqueMin: 5, cor: '#4f46e5' },
  { id: 2, nome: 'HP CE285A',        descricao: 'HP LaserJet P1102/M1132',   estoqueMin: 3, cor: '#10b981' },
  { id: 3, nome: 'Samsung MLT-D101', descricao: 'Samsung ML-2160/SCX-3405',  estoqueMin: 4, cor: '#8b5cf6' },
];
let _mockMovs = [
  { id:1,  modeloId:1, tipo:'entrada', qty:20, setor:'Almoxarifado',     resp:'Carlos Silva',   data:'2026-08-01', obs:'Compra Lote NF-4021' },
  { id:2,  modeloId:1, tipo:'saida',   qty:2,  setor:'Recursos Humanos', resp:'Ana Souza',      data:'2026-08-05', obs:'Impressora RH 02' },
  { id:3,  modeloId:1, tipo:'saida',   qty:3,  setor:'Financeiro',       resp:'Pedro Lima',     data:'2026-08-10', obs:'' },
  { id:4,  modeloId:1, tipo:'entrada', qty:5,  setor:'Almoxarifado',     resp:'Carlos Silva',   data:'2026-08-14', obs:'Devolução' },
  { id:5,  modeloId:1, tipo:'saida',   qty:4,  setor:'TI',               resp:'Lucia Matos',    data:'2026-08-18', obs:'Laboratório' },
  { id:6,  modeloId:2, tipo:'entrada', qty:10, setor:'Almoxarifado',     resp:'Carlos Silva',   data:'2026-07-15', obs:'' },
  { id:7,  modeloId:2, tipo:'saida',   qty:3,  setor:'Compras',          resp:'Fernanda Costa', data:'2026-07-20', obs:'' },
  { id:8,  modeloId:2, tipo:'saida',   qty:2,  setor:'TI',               resp:'Lucia Matos',    data:'2026-08-02', obs:'' },
  { id:9,  modeloId:3, tipo:'entrada', qty:15, setor:'Almoxarifado',     resp:'Carlos Silva',   data:'2026-08-01', obs:'' },
  { id:10, modeloId:3, tipo:'saida',   qty:4,  setor:'Operacional',      resp:'Marcos Dias',    data:'2026-08-06', obs:'' },
];

function _calcMockEstoque(modeloId) {
  return _mockMovs
    .filter(m => m.modeloId === modeloId)
    .reduce((s, m) => s + (m.tipo === 'entrada' ? m.qty : -m.qty), 0);
}

// ── MODELOS ───────────────────────────────────────────────────────────────────

/**
 * Retorna todos os modelos cadastrados com seus saldos atuais de estoque.
 */
async function getAllModelos() {
  if (!supabase) {
    return _mockModelos.map(m => ({ ...m, estoque: _calcMockEstoque(m.id) }));
  }

  // 1. Busca todos os modelos
  const { data: modelos, error: errModelos } = await supabase
    .from('modelos')
    .select('*')
    .order('nome', { ascending: true });

  if (errModelos) throw new Error('Erro ao buscar modelos no Supabase: ' + errModelos.message);

  // 2. Busca todas as movimentações para calcular o saldo de cada modelo
  const { data: movs, error: errMovs } = await supabase
    .from('movimentacoes')
    .select('modelo_id, tipo, qty');

  if (errMovs) throw new Error('Erro ao buscar movimentações no Supabase: ' + errMovs.message);

  // 3. Mapeia e calcula o estoque
  return modelos.map(m => {
    const estoque = (movs || [])
      .filter(mv => mv.modelo_id === m.id)
      .reduce((acc, curr) => acc + (curr.tipo === 'entrada' ? curr.qty : -curr.qty), 0);

    return {
      id: m.id,
      nome: m.nome,
      descricao: m.descricao || '',
      estoqueMin: m.estoque_min || 5,
      cor: m.cor || '#4f46e5',
      estoque
    };
  });
}

/**
 * Cria um novo modelo de toner no banco de dados.
 */
async function createModelo({ nome, descricao, estoqueMin, cor }) {
  if (!supabase) {
    const modelo = { id: _nextModeloId++, nome, descricao: descricao || '', estoqueMin: Number(estoqueMin) || 5, cor: cor || '#4f46e5' };
    _mockModelos.push(modelo);
    return { ...modelo, estoque: 0 };
  }

  const { data, error } = await supabase
    .from('modelos')
    .insert([
      {
        nome,
        descricao: descricao || '',
        estoque_min: Number(estoqueMin) || 5,
        cor: cor || '#4f46e5'
      }
    ])
    .select()
    .single();

  if (error) throw new Error('Erro ao criar modelo no Supabase: ' + error.message);

  return {
    id: data.id,
    nome: data.nome,
    descricao: data.descricao,
    estoqueMin: data.estoque_min,
    cor: data.cor,
    estoque: 0
  };
}

/**
 * Exclui um modelo pelo ID (com exclusão em cascata das movimentações).
 */
async function deleteModelo(id) {
  if (!supabase) {
    const idx = _mockModelos.findIndex(m => m.id === id);
    if (idx === -1) return false;
    _mockModelos.splice(idx, 1);
    _mockMovs = _mockMovs.filter(m => m.modeloId !== id);
    return true;
  }

  const { error } = await supabase
    .from('modelos')
    .delete()
    .eq('id', id);

  if (error) throw new Error('Erro ao excluir modelo no Supabase: ' + error.message);
  return true;
}

// ── MOVIMENTAÇÕES ─────────────────────────────────────────────────────────────

/**
 * Retorna as movimentações (opcionalmente filtradas por modeloId).
 */
async function getMovimentacoes(modeloId) {
  if (!supabase) {
    const list = modeloId
      ? _mockMovs.filter(m => m.modeloId === Number(modeloId))
      : _mockMovs;
    return list.slice().sort((a, b) => new Date(b.data) - new Date(a.data));
  }

  let query = supabase
    .from('movimentacoes')
    .select('*')
    .order('data', { ascending: false })
    .order('id', { ascending: false });

  if (modeloId) {
    query = query.eq('modelo_id', Number(modeloId));
  }

  const { data, error } = await query;
  if (error) throw new Error('Erro ao buscar movimentações no Supabase: ' + error.message);

  return (data || []).map(m => ({
    id: m.id,
    modeloId: m.modelo_id,
    tipo: m.tipo,
    qty: m.qty,
    setor: m.setor,
    resp: m.resp,
    data: m.data,
    obs: m.obs || ''
  }));
}

/**
 * Registra uma nova movimentação (entrada ou saída).
 */
async function createMovimentacao({ modeloId, tipo, qty, setor, resp, data, obs }) {
  if (!supabase) {
    const mov = { 
      id: _nextMovId++, 
      modeloId: Number(modeloId), 
      tipo, 
      qty: Number(qty), 
      setor, 
      resp, 
      data: data || new Date().toISOString().split('T')[0], 
      obs: obs || '' 
    };
    _mockMovs.push(mov);
    return mov;
  }

  const { data: result, error } = await supabase
    .from('movimentacoes')
    .insert([
      {
        modelo_id: Number(modeloId),
        tipo,
        qty: Number(qty),
        setor,
        resp,
        data: data || new Date().toISOString().split('T')[0],
        obs: obs || ''
      }
    ])
    .select()
    .single();

  if (error) throw new Error('Erro ao registrar movimentação no Supabase: ' + error.message);

  return {
    id: result.id,
    modeloId: result.modelo_id,
    tipo: result.tipo,
    qty: result.qty,
    setor: result.setor,
    resp: result.resp,
    data: result.data,
    obs: result.obs
  };
}

/**
 * Exclui uma movimentação pelo ID.
 */
async function deleteMovimentacao(id) {
  if (!supabase) {
    const idx = _mockMovs.findIndex(m => m.id === id);
    if (idx === -1) return false;
    _mockMovs.splice(idx, 1);
    return true;
  }

  const { error } = await supabase
    .from('movimentacoes')
    .delete()
    .eq('id', id);

  if (error) throw new Error('Erro ao excluir movimentação no Supabase: ' + error.message);
  return true;
}

module.exports = { 
  getAllModelos, 
  createModelo, 
  deleteModelo, 
  getMovimentacoes, 
  createMovimentacao, 
  deleteMovimentacao 
};