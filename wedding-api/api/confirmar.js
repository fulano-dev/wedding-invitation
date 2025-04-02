const mysql = require('mysql2/promise');
const nodemailer = require('nodemailer');
const PDFDocument = require('pdfkit');
const stream = require('stream');
const { createStaticPix } = require('pix-utils');
const QRCode = require('qrcode');

export default async function handler(req, res) {
  const prefixoAssunto = process.env.AMBIENTE === 'HML' ? 'AMBIENTE DE HOMOLOGAÇÃO - ' : '';
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', '*');
  res.setHeader('Access-Control-Allow-Headers', '*');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).send('Método não permitido');
  }

  const { nome, email, pessoas, nomes_individuais, confirmado, pago, detalhesPessoas } = req.body;

  try {
    const db = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
    });

    const values = detalhesPessoas.map(p =>
      db.execute(
        `INSERT INTO confirmados (nome, email, pessoas, nomes_individuais, confirmado, pago, idade)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [p.nome, email, pessoas, JSON.stringify(nomes_individuais), confirmado, pago, parseInt(p.idade)]
      )
    );
    await Promise.all(values);

    const [rows] = await db.execute('SELECT nome, confirmado, idade FROM confirmados');
    let totalConfirmados = 0;
    let totalAdultos = 0;
    let totalCriancasMeia = 0;
    let totalCriancasIsentas = 0;
    let valorTotal = 0;
    let contadorGlobal = 1;

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
        from: '"Caroline & Marcelo" <' + process.env.EMAIL_USER + '>',
        to: 'carolinefariasadv@gmail.com',
        subject: `${prefixoAssunto}${nome} confirmou presença no seu casamento`,
        html: `
          <h4>👥 Lista de Convidados Confirmados:</h4>
          <ul>
            ${detalhesPessoas.map((p) => {
              const idadeTexto = !p.idade || parseInt(p.idade) >= 13 ? 'Adulto' : `${p.idade} anos`;
              return `<li>${p.nome} (${idadeTexto})</li>`;
            }).join('')}
          </ul>
          <p>📎 A lista de convidados atualizada está em anexo (PDF).</p>
        `,
        attachments: [{ filename: 'convidados.pdf', content: pdfData }]
      };
      
      await transporter.sendMail(mailOptions);

      doc.fontSize(18).text('Lista de Confirmados', { align: 'center' });
      doc.moveDown();
      rows
        .filter(r => r.confirmado === 'Sim')
        .forEach((r) => {
          const idade = parseInt(r.idade);
          const idadeTexto = isNaN(idade) || idade >= 13 ? 'Adulto' : `${idade} anos`;
          doc.text(`${contadorGlobal}. ${r.nome}, ${idadeTexto}`);
          totalConfirmados++;
          const idadeNumerica = idade;
          if (isNaN(idade) || idadeNumerica >= 13) {
            totalAdultos++;
            valorTotal += 200;
          } else if (idadeNumerica >= 7) {
            totalCriancasMeia++;
            valorTotal += 100;
          } else {
            totalCriancasIsentas++;
          }
          contadorGlobal++;
        });

      doc.moveDown();
      doc.fontSize(12).text(`Total de Convidados Confirmados: ${totalConfirmados}`);
      doc.text(`• Adultos: ${totalAdultos}`);
      doc.text(`• Crianças até 12 anos (50%): ${totalCriancasMeia}`);
      doc.text(`• Crianças até 6 anos (Isento): ${totalCriancasIsentas}`);
      doc.text(`• Valor Total Estimado: R$ ${valorTotal.toFixed(2)}`);

      doc.end();
      res.status(201).json({ mensagem: 'Confirmação salva e e-mail enviado com sucesso' });
    });
  } catch (err) {
    console.error('Erro no banco:', err);
    res.status(500).json({ erro: 'Erro ao salvar confirmação' });
  }
}