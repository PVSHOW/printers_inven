const db = require('../lib/db');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    if (req.method === 'GET') {
      const { modeloId } = req.query;
      const movs = await db.getMovimentacoes(modeloId ? Number(modeloId) : null);
      return res.status(200).json(movs);
    }

    if (req.method === 'POST') {
      const { modeloId, tipo, qty, setor, resp, obs } = req.body;
      if (!modeloId)                        return res.status(400).json({ error: 'modeloId e obrigatorio' });
      if (!['entrada','saida'].includes(tipo)) return res.status(400).json({ error: 'tipo deve ser entrada ou saida' });
      if (!qty || Number(qty) < 1)          return res.status(400).json({ error: 'Quantidade invalida' });
      if (!setor || !setor.trim())          return res.status(400).json({ error: 'Setor e obrigatorio' });
      if (!resp  || !resp.trim())           return res.status(400).json({ error: 'Responsavel e obrigatorio' });

      // Valida estoque disponivel para saidas
      if (tipo === 'saida') {
        const modelos = await db.getAllModelos();
        const modelo  = modelos.find(m => m.id === Number(modeloId));
        if (!modelo)             return res.status(404).json({ error: 'Modelo nao encontrado' });
        if (Number(qty) > modelo.estoque) return res.status(400).json({ error: `Estoque insuficiente. Disponivel: ${modelo.estoque}` });
      }

      const data = new Date().toISOString().split('T')[0];
      const mov  = await db.createMovimentacao({ modeloId, tipo, qty: Number(qty), setor: setor.trim(), resp: resp.trim(), data, obs: obs || '' });
      return res.status(201).json(mov);
    }

    res.status(405).json({ error: 'Metodo nao permitido' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};