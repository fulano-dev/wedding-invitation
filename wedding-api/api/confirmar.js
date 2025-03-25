const mysql = require('mysql2/promise');
const nodemailer = require('nodemailer');
const PDFDocument = require('pdfkit');
const stream = require('stream');

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*'); // Ou especifique: 'https://seufrontend.com'
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).send('Método não permitido');
  }

  const { nome, email, pessoas, nomes_individuais, confirmado, pago } = req.body;

  try {
    const db = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
    });

    const values = nomes_individuais.map(n =>
      db.execute(
        `INSERT INTO confirmados (nome, email, pessoas, nomes_individuais, confirmado, pago)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [n, email, pessoas, JSON.stringify(nomes_individuais), confirmado, pago]
      )
    );

    await Promise.all(values);

    // Após salvar, buscar todos confirmados
    const [rows] = await db.execute('SELECT nome FROM confirmados');

    const doc = new PDFDocument();
    const bufferStream = new stream.PassThrough();
    let buffers = [];
    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', async () => {
      const pdfData = Buffer.concat(buffers);

      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      });

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: 'carolinefariasadv@gmail.com',
        subject: `${nome} confirmou presença no seu casamento`,
        text: `${nome} acabou de confirmar presença! Lista atualizada em anexo.`,
        attachments: [{
          filename: 'convidados.pdf',
          content: pdfData
        }]
      };

      try {
        await transporter.sendMail(mailOptions);
        res.status(201).json({ mensagem: 'Confirmação salva e email enviado com sucesso' });
      } catch (error) {
        console.error('Erro ao enviar email:', error);
        res.status(500).json({ erro: 'Confirmação salva, mas falha ao enviar e-mail' });
      }
    });

    doc.fontSize(18).text('Lista de Confirmados', { align: 'center' });
    doc.moveDown();
    rows.forEach((r, i) => doc.text(`${i + 1}. ${r.nome}`));
    doc.end();
  } catch (err) {
    console.error('Erro no banco:', err);
    res.status(500).json({ erro: 'Erro ao salvar confirmação' });
  }
};