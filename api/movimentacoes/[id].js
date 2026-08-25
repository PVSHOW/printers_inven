const db = require('../../lib/db');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    if (req.method === 'DELETE') {
      const id = Number(req.query.id || req.body?.id || (req.url && req.url.split('/').pop().split('?')[0]));
      if (!id) return res.status(400).json({ error: 'ID invalido' });
      await db.deleteMovimentacao(id);
      return res.status(200).json({ success: true });
    }

    res.status(405).json({ error: 'Metodo nao permitido' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || 'Erro interno do servidor' });
  }
};