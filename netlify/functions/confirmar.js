const mysql = require('mysql2/promise');
const nodemailer = require('nodemailer');
const PDFDocument = require('pdfkit');
const stream = require('stream');
const { createStaticPix } = require('pix-utils');
const QRCode = require('qrcode');

export async function handler(event, context) {
  const method = event.httpMethod;

  const corsHeaders = {
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,OPTIONS,PATCH,DELETE,POST,PUT',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization'
  };

  console.log('[DEBUG] Função chamada - método:', method);
  console.log('[DEBUG] função confirmar.js foi chamada');

  if (method === 'OPTIONS') {
    console.log('[DEBUG] Passou do OPTIONS');
    return {
      statusCode: 200,
      headers: corsHeaders
    };
  }

  const req = {
    method,
    body: JSON.parse(event.body)
  };

  console.log('[DEBUG] Body recebido:', req.body);

  const res = {
    setHeader: () => {}
  };

  if (req.method !== 'POST') {
    return {
      statusCode: 405,
      body: 'Método não permitido',
      headers: corsHeaders
    };
  }

  const { nome, email, pessoas, nomes_individuais, confirmado, pago } = req.body;

  try {
    console.log('[DEBUG] Conectando ao banco...');
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
    console.log('[DEBUG] Dados inseridos no banco.');

    // Após salvar, buscar todos confirmados
    const [rows] = await db.execute('SELECT nome FROM confirmados');
    console.log('[DEBUG] Confirmados buscados:', rows.length);

    const doc = new PDFDocument();
    const bufferStream = new stream.PassThrough();
    let buffers = [];
    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', async () => {
      console.log('[DEBUG] PDF gerado. Enviando emails...');
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
        console.log('[DEBUG] Enviando email para noiva...');
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

        const qrCodeDataUrl = await QRCode.toDataURL(codigoPix);

        const mailOptionsGuest = {
          from: process.env.EMAIL_USER,
          to: email,
          subject: 'Informações Importantes - Confirmação de Presença no Casamento de Caroline & Marcelo',
          html: `
            <div style="font-family: Arial, sans-serif; color: #333;">
              <h2 style="color: #444;">Informações Importantes - Confirmação de Presença no Casamento de Caroline & Marcelo</h2>
              <p>Olá <strong>${nome}</strong>, você confirmou sua presença e de mais ${pessoas - 1} pessoa(s) em nosso casamento 💕</p>
              <p>Nossa celebração será intimista, com as pessoas que mais amamos e você é uma delas!<br/>
              A sua presença é muito importante para nós. Abrimos mão de presentes, porém contamos com uma “ajudinha”, para tornar tudo possível. 😊</p>
              <p><strong>Traje:</strong> Esporte Fino<br/>
              <em>Se você for um padrinho, receberá informações sobre as cores do traje.</em></p>

              <p>Dúvidas? Fale com os noivos pelo WhatsApp:<br/>
                <a href="https://wa.me/5551982133389" target="_blank">Carol</a>
              </p>

              <h4>Lista de Pessoas que você enviou:</h4>
              <ul>
                ${nomes_individuais.map(p => `<li>${p}</li>`).join('')}
              </ul>

              <p><strong>Valor Total:</strong> R$ ${valorNumerico.toFixed(2)}</p>
              <p><strong>Utilize o código Pix Copia e Cola abaixo para realizar o pagamento até 07/10/2025:</strong></p>

              <pre style="white-space: pre-wrap; word-break: break-word; background: #f0f0f0; padding: 10px; border-radius: 5px;">${codigoPix}</pre>

              <p style="margin-top: 20px;"><strong>QRCode do Pix:</strong></p>
              <img src="${qrCodeDataUrl}" alt="QR Code Pix" style="width: 200px; height: 200px;" />
            </div>
          `
        };

        console.log('[DEBUG] Enviando email para convidado:', email);
        await transporter.sendMail(mailOptionsGuest);
        return {
          statusCode: 201,
          body: JSON.stringify({ mensagem: 'Confirmação salva e email enviado com sucesso' }),
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        };
      } catch (error) {
        console.error('[ERROR] Erro ao salvar confirmação ou enviar email:', error);
        return {
          statusCode: 500,
          body: JSON.stringify({ erro: 'Confirmação salva, mas falha ao enviar e-mail' }),
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        };
      }
    });

    doc.fontSize(18).text('Lista de Confirmados', { align: 'center' });
    doc.moveDown();
    rows.forEach((r, i) => doc.text(`${i + 1}. ${r.nome}`));
    doc.end();
  } catch (err) {
    console.error('[ERROR] Erro ao salvar confirmação ou enviar email:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ erro: 'Erro ao salvar confirmação' }),
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    };
  }
};