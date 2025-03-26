import { createConnection } from 'mysql2/promise';
import PDFDocument from 'pdfkit';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).send('Método não permitido');
  }

  try {
    const connection = await createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
    });

    const [rows] = await connection.execute('SELECT * FROM confirmados ORDER BY id DESC');
    await connection.end();

    // Gera PDF
    const doc = new PDFDocument();
    let buffers = [];

    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => {
      const pdfData = Buffer.concat(buffers);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename="lista_convidados.pdf"');
      res.status(200).send(pdfData);
    });

    const confirmados = rows.filter(r => r.confirmado !== 'Não');
    const recusados = rows.filter(r => r.confirmado === 'Não');

    // Página 1: Confirmados
    doc.fontSize(18).text('Lista de Confirmados', { align: 'center' }).moveDown();
    confirmados.forEach((r, i) => {
      doc.fontSize(12).text(`${i + 1}. ${r.nome}`);
    });

    // Página 2: Recusaram
    doc.addPage();
    doc.fontSize(18).text('Lista de Recusados', { align: 'center' }).moveDown();
    recusados.forEach((r, i) => {
      doc.fontSize(12).text(`${i + 1}. ${r.nome} - NÃO COMPARECERÁ`);
    });

    doc.end();
  } catch (err) {
    console.error('Erro ao gerar PDF:', err);
    res.status(500).send('Erro interno do servidor');
  }
}