const mysql = require('mysql2/promise');
const nodemailer = require('nodemailer');
const PDFDocument = require('pdfkit');
const stream = require('stream');
const { createStaticPix } = require('pix-utils');
const QRCode = require('qrcode');

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
        
        // Geração do Pix com valor ajustado
        const valorNumerico = pessoas * 200;

        const staticPix = createStaticPix({
          merchantName: 'CAROLINE FARIAS MENESES',
          merchantCity: 'CANOAS',
          pixKey: '64b0967a-bc0d-4cd5-bc24-ca76fdb10e21',
          txid: 'CASAMENTO2025',
          transactionAmount: valorNumerico,
          infoAdicional: 'Casamento Caroline e Marcelo'
        });

        const codigoPix = staticPix.toBRCode();
        console.log('Código Pix:', codigoPix);

        const qrCodeBuffer = await QRCode.toBuffer(codigoPix);

        const mailOptionsGuest = {
          from: process.env.EMAIL_USER,
          to: email,
          subject: 'Informações Importantes - Confirmação de Presença no Casamento de Caroline & Marcelo',
          html: `
            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #4b3b0d; background-color: #fff8e1; padding: 30px; border-radius: 10px;">
              <h2 style="color: #e0a100; text-align: center;">🌻 Confirmação de Presença no Casamento 🌻</h2>
              <p>Olá <strong>${nome}</strong>, você confirmou sua presença e de mais ${pessoas - 1} pessoa(s) em nosso casamento 💛</p>
              <p style="margin-top: 15px;">Nossa celebração será intimista, com as pessoas que mais amamos — e você é uma delas!<br/>
              Abrimos mão de presentes 🎁, mas contamos com uma “ajudinha” para tornar tudo possível 💛</p>
              
              <p style="margin-top: 20px;"><strong>👗 Traje:</strong> Esporte Fino<br/>
              <em>Se você for um padrinho, receberá as instruções sobre a cor do traje.</em></p>

              <p style="margin-top: 20px;">Dúvidas? Fale com os noivos no WhatsApp:<br/>
                👉 <a href="https://wa.me/5551982133389" target="_blank" style="color: #e0a100;">Carol no WhatsApp</a>
              </p>

              <h4 style="margin-top: 25px; color: #4b3b0d;">👥 Lista de Pessoas que você enviou:</h4>
              <ul style="padding-left: 20px;">
                ${nomes_individuais.map(p => `<li>${p}</li>`).join('')}
              </ul>

              <p style="margin-top: 20px;"><strong>💰 Valor Total:</strong> R$ ${valorNumerico.toFixed(2)}</p>

              <p><strong>✨ Utilize o código Pix Copia e Cola abaixo para realizar o pagamento até <u>07/10/2025</u>:</strong></p>

              <pre style="white-space: pre-wrap; word-break: break-word; background: #f9d976; padding: 15px; border-radius: 8px; font-size: 14px; color: #4b3b0d;">${codigoPix}</pre>

              <p style="margin-top: 20px;"><strong>📷 QRCode do Pix:</strong></p>
              <div style="text-align: center; margin-top: 10px;">
                <img src="cid:qrcodepix" alt="QR Code Pix" style="width: 220px; height: 220px; border: 4px solid #f2c14e; border-radius: 10px;" />
              </div>

              <p style="margin-top: 30px; font-size: 12px; color: #777; text-align: center;">
                Desenvolvido com 💛 por João Pedro Vargas e Guilherme Mocelin.<br/>
                © 2025 Vargas & Silva Engenharia de Software LTDA — CNPJ: 59.458.798/0001-62
              </p>
            </div>
          `,
          attachments: [{
            filename: 'qrcode.png',
            content: qrCodeBuffer,
            cid: 'qrcodepix'
          }]
        };

        await transporter.sendMail(mailOptionsGuest);
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
}