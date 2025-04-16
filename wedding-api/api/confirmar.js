const mysql = require('mysql2/promise');
const nodemailer = require('nodemailer');
const PDFDocument = require('pdfkit');
const stream = require('stream');
const { createStaticPix } = require('pix-utils');
const QRCode = require('qrcode');

export default async function handler(req, res) {
  const prefixoAssunto = process.env.AMBIENTE === 'HML' ? 'AMBIENTE DE HOMOLOGAÇÃO - ' : '';
  // CORS headers
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
        [p.nome, email, pessoas, JSON.stringify(nomes_individuais), confirmado, pago, p.idade]
      )
    );

    await Promise.all(values);

    // Após salvar, buscar todos confirmados
    const [rows] = await db.execute('SELECT nome, confirmado, detalhes_pessoas FROM confirmados');
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
          <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #4b3b0d; background-color: #fff8e1; padding: 30px; border-radius: 10px;">
            <div style="text-align: center;">
              <img src="https://i.imgur.com/cxsTmRY.jpeg" alt="Caroline e Marcelo" style="max-width: 100%; max-height: 300px; object-fit: cover; border-radius: 12px; margin-bottom: 20px;" />
            </div>
            <h2 style="color: #e0a100; text-align: center;">🌻 Novo Convidado Confirmado 🌻</h2>
            <p><strong>${nome}</strong> confirmou presença no casamento!</p>
            <p><strong>Quantidade de pessoas:</strong> ${pessoas}</p>

            <h4 style="margin-top: 20px;">👥 Lista de Convidados Confirmados:</h4>
            <ul style="padding-left: 20px;">
              ${detalhesPessoas.map(p => `<li>${p.nome} (${p.idade}) — ${p.valor}</li>`).join('')}
            </ul>

            <p style="margin-top: 25px;">📎 A lista de convidados atualizada está em anexo (PDF).</p>

            <p style="margin-top: 30px; font-size: 6px; color: #777; text-align: center;">
              Desenvolvido com 💛 por 
              <a href="https://linkedin.com/in/joaopedrovsilva" target="_blank" style="color: #4b3b0d; text-decoration: none;">João Pedro Vargas</a> 
              e 
              <a href="https://www.linkedin.com/in/guilherme-mocelin-5a6ba3320/" target="_blank" style="color: #4b3b0d; text-decoration: none;">Guilherme Mocelin</a>.<br/>
              Exclusivamente para nossos amigos e afilhados Carol & Marcelo.<br/>
              © 2025 Purple Labs - Engenharia de Software I.S — CNPJ: 60.272.060/0001-95
            </p>
          </div>
        `,
        attachments: [{
          filename: 'convidados.pdf',
          content: pdfData
        }]
      };

      try {
        await transporter.sendMail(mailOptions);
        
        if (confirmado !== 'Não') {
          const valorNumerico = detalhesPessoas.reduce((total, pessoa) => {
            if (pessoa.valor === 'Isento') return total;
            if (pessoa.valor.includes('100')) return total + 100;
            return total + 200;
          }, 0);

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
            from: '"Caroline & Marcelo" <' + process.env.EMAIL_USER + '>',
            to: email,
            subject: `${prefixoAssunto}Informações Importantes - Confirmação de Presença no Casamento de Caroline & Marcelo`,
            html: `
              <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #4b3b0d; background-color: #fff8e1; padding: 30px; border-radius: 10px;">
                <div style="text-align: center;">
                  <img src="https://i.imgur.com/cxsTmRY.jpeg" alt="Caroline e Marcelo" style="max-width: 100%; max-height: 300px; object-fit: cover; border-radius: 12px; margin-bottom: 20px;" />
                </div>
                <h2 style="color: #e0a100; text-align: center;">🌻 Confirmação de Presença no Casamento 🌻</h2>
                <p>Olá <strong>${nome}</strong>, ${
                  pessoas > 1
                    ? `você confirmou sua presença e de mais ${pessoas - 1} pessoa(s)`
                    : 'você confirmou sua presença'
                } em nosso casamento 💛</p>
                <p style="margin-top: 15px;">Nossa celebração será intimista, com as pessoas que mais amamos — e você é uma delas!<br/>
                Abrimos mão de presentes 🎁, mas contamos com uma “ajudinha” para tornar tudo possível 💛</p>
                
                <p style="margin-top: 20px;"><strong>👗 Traje:</strong> Esporte Fino<br/>
                <em>Se você for um padrinho, receberá as instruções sobre a cor do traje.</em></p>

                <p style="margin-top: 20px;">Dúvidas? Fale com os noivos no WhatsApp:<br/>
                  👉 <a href="https://wa.me/5551982133389" target="_blank" style="color: #e0a100;">Carol no WhatsApp</a>
                </p>

                <h4 style="margin-top: 25px; color: #4b3b0d;">👥 Lista de Pessoas que você enviou:</h4>
                <ul style="padding-left: 20px;">
                  ${detalhesPessoas.map(p => `<li>${p.nome} (${p.idade}) — ${p.valor}</li>`).join('')}
                </ul>

                <p style="margin-top: 20px;"><strong>💰 Valor Total:</strong> R$ ${valorNumerico.toFixed(2)}</p>

                <p><strong>✨ Utilize o código Pix Copia e Cola abaixo para realizar o pagamento até <u>07/10/2025</u>:</strong></p>

                <pre onclick="navigator.clipboard.writeText('${codigoPix}')" title="Clique para copiar" style="cursor: pointer; white-space: pre-wrap; word-break: break-word; background: #f9d976; padding: 15px; border-radius: 8px; font-size: 14px; color: #4b3b0d;">
                  ${codigoPix}
                </pre>

                <p style="margin-top: 20px;"><strong>📷 QRCode do Pix:</strong></p>
                <div style="text-align: center; margin-top: 10px;">
                  <img src="cid:qrcodepix" alt="QR Code Pix" style="width: 220px; height: 220px; border: 4px solid #f2c14e; border-radius: 10px;" />
                </div>

                <p style="margin-top: 30px; font-size: 6px; color: #777; text-align: center;">
                  Desenvolvido com 💛 por 
                  <a href="https://linkedin.com/in/joaopedrovsilva" target="_blank" style="color: #4b3b0d; text-decoration: none;">João Pedro Vargas</a> 
                  e 
                  <a href="https://www.linkedin.com/in/guilherme-mocelin-5a6ba3320/" target="_blank" style="color: #4b3b0d; text-decoration: none;">Guilherme Mocelin</a>.<br/>
                  Exclusivamente para nossos amigos e afilhados Carol & Marcelo.<br/>
                  © 2025 Purple Labs - Engenharia de Software I.S — CNPJ: 60.272.060/0001-95
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
        }
        
        if (confirmado === 'Não') {
          const mailOptionsNaoVai = {
            from: '"Caroline & Marcelo" <' + process.env.EMAIL_USER + '>',
            to: email,
            subject: `${prefixoAssunto}Sentiremos sua falta - Casamento Caroline & Marcelo`,
            html: `
              <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #4b3b0d; background-color: #fff8e1; padding: 30px; border-radius: 10px;">
                <div style="text-align: center;">
                  <img src="https://i.imgur.com/cxsTmRY.jpeg" alt="Caroline e Marcelo" style="max-width: 100%; max-height: 300px; object-fit: cover; border-radius: 12px; margin-bottom: 20px;" />
                </div>
                <h2 style="color: #e0a100; text-align: center;">🌻 Uma pequena mensagem com carinho 🌻</h2>
                <p>Olá <strong>${nome}</strong>, recebemos sua resposta informando que infelizmente não poderá comparecer ao nosso casamento 😢</p>
                <p style="margin-top: 15px;">Nossa celebração será intimista, com as pessoas que mais amamos — e você é uma delas!<br/>
                Sua presença fará muita falta, mas entendemos totalmente e agradecemos de coração 💛</p>

                <p style="margin-top: 20px;">Se mudar de ideia, você ainda pode confirmar presença até <u>07/10/2025</u> 😄</p>

                <p style="margin-top: 30px; font-size: 6px; color: #777; text-align: center;">
                  Desenvolvido com 💛 por 
                  <a href="https://linkedin.com/in/joaopedrovsilva" target="_blank" style="color: #4b3b0d; text-decoration: none;">João Pedro Vargas</a> 
                  e 
                  <a href="https://www.linkedin.com/in/guilherme-mocelin-5a6ba3320/" target="_blank" style="color: #4b3b0d; text-decoration: none;">Guilherme Mocelin</a>.<br/>
                  Exclusivamente para nossos amigos e afilhados Carol & Marcelo.<br/>
                  © 2025 Purple Labs - Engenharia de Software I.S — CNPJ: 60.272.060/0001-95
                </p>
              </div>
            `
          };
          await transporter.sendMail(mailOptionsNaoVai);
          const mailOptionsCarolNaoVai = {
            from: '"Caroline & Marcelo" <' + process.env.EMAIL_USER + '>',
            to: 'carolinefariasadv@gmail.com',
            subject: `${prefixoAssunto}${nome} não poderá comparecer ao casamento`,
            html: `
              <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #4b3b0d; background-color: #fff8e1; padding: 30px; border-radius: 10px;">
                <div style="text-align: center;">
                  <img src="https://i.imgur.com/cxsTmRY.jpeg" alt="Caroline e Marcelo" style="max-width: 100%; max-height: 300px; object-fit: cover; border-radius: 12px; margin-bottom: 20px;" />
                </div>
                <h2 style="color: #e0a100; text-align: center;">🌻 Confirmação de Ausência 🌻</h2>
                <p><strong>${nome}</strong> informou que <strong>não poderá comparecer</strong> ao casamento.</p>

                <h4 style="margin-top: 20px;">👥 Lista de Nomes Incluídos:</h4>
                <ul style="padding-left: 20px;">
                  ${nomes_individuais.map(p => `<li>${p}</li>`).join('')}
                </ul>

                <p style="margin-top: 25px;">📎 A lista de convidados atualizada está em anexo (PDF).</p>

                <p style="margin-top: 30px; font-size: 6px; color: #777; text-align: center;">
                  Desenvolvido com 💛 por 
                  <a href="https://linkedin.com/in/joaopedrovsilva" target="_blank" style="color: #4b3b0d; text-decoration: none;">João Pedro Vargas</a> 
                  e 
                  <a href="https://www.linkedin.com/in/guilherme-mocelin-5a6ba3320/" target="_blank" style="color: #4b3b0d; text-decoration: none;">Guilherme Mocelin</a>.<br/>
                  Exclusivamente para nossos amigos e afilhados Carol & Marcelo.<br/>
                  © 2025 Purple Labs - Engenharia de Software I.S — CNPJ: 60.272.060/0001-95
                </p>
              </div>
            `,
            attachments: [{
              filename: 'convidados.pdf',
              content: pdfData
            }]
          };
          await transporter.sendMail(mailOptionsCarolNaoVai);
        }

        res.status(201).json({ mensagem: 'Confirmação salva e email enviado com sucesso' });
      } catch (error) {
        console.error('Erro ao enviar email:', error);
        res.status(500).json({ erro: 'Confirmação salva, mas falha ao enviar e-mail' });
      }
    });

    const confirmados = rows.filter(r => r.confirmado === 'Sim');
    const recusados = rows.filter(r => r.confirmado === 'Não');

    // Página de Confirmados
    confirmados.forEach((r) => {
      const idadeNumerica = parseInt(r.idade);
      const idadeTexto = (!r.idade && r.idade !== 0) || isNaN(idadeNumerica) || idadeNumerica === 0 || idadeNumerica >= 13 ? 'Adulto' : `${idadeNumerica} anos`;
      doc.text(`${contadorGlobal}. ${r.nome}, ${idadeTexto}`);
      totalConfirmados++;
      if (!r.idade || idadeNumerica === 0 || idadeNumerica >= 13) {
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

    // Página de Recusados
    doc.addPage();
    doc.fontSize(18).text('Lista de Recusados', { align: 'center' });
    doc.moveDown();
    recusados.forEach((r, i) => {
      doc.text(`${i + 1}. ${r.nome} - NÃO COMPARECERÁ`);
    });

    doc.end();
  } catch (err) {
    console.error('Erro no banco:', err);
    res.status(500).json({ erro: 'Erro ao salvar confirmação' });
  }
}