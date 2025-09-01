import { createConnection } from 'mysql2/promise';

function basicAuth(req, res) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Basic ')) return false;
  const [user, pass] = Buffer.from(auth.split(' ')[1], 'base64').toString().split(':');
  return user === 'admin' && pass === 'admin';
}

export default async function handler(req, res) {
  if (!basicAuth(req, res)) {
    res.status(401).setHeader('WWW-Authenticate', 'Basic realm="Admin"').end('Acesso negado');
    return;
  }

  const connection = await createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
  });

  if (req.method === 'GET') {
    // Lista todos os confirmados
    const [rows] = await connection.execute('SELECT * FROM confirmados');
    await connection.end();
    res.status(200).json(rows);
    return;
  }

  if (req.method === 'POST') {
    const { id, acao } = req.body;
    if (!id || !acao) {
      res.status(400).json({ erro: 'Dados insuficientes' });
      return;
    }
    let query = '';
    if (acao === 'marcar-pago') {
      query = 'UPDATE confirmados SET pago = TRUE WHERE id = ?';
    } else if (acao === 'restaurar-pago') {
      query = 'UPDATE confirmados SET pago = FALSE WHERE id = ?';
    } else {
      res.status(400).json({ erro: 'Ação inválida' });
      return;
    }
    await connection.execute(query, [id]);
    await connection.end();
    res.status(200).json({ ok: true });
    return;
  }

  res.status(405).send('Método não permitido');
}
