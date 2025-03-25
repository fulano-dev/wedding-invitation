const express = require('express');
const cors = require('cors');
const db = require('./db/connection'); // Importação do banco

const app = express();
app.use(cors());

// Código adicionado para criar a tabela 'confirmados'
const createTableQuery = `
  CREATE TABLE IF NOT EXISTS confirmados (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255),
    email VARCHAR(255),
    pessoas INT,
    nomes_individuais TEXT,
    confirmado ENUM('Sim', 'Não'),
    pago BOOLEAN DEFAULT false,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`;

db.query(createTableQuery, (err) => {
  if (err) {
    console.error("Erro ao criar tabela:", err);
  } else {
    console.log("Tabela 'confirmados' verificada/criada com sucesso.");
  }
});

// Configuração de rotas e outras configurações do Express
app.use(express.json());

app.post('/confirmar', (req, res) => {
  const { nome, email, pessoas, nomes_individuais, confirmado, pago } = req.body;

  if (!Array.isArray(nomes_individuais) || nomes_individuais.length === 0) {
    return res.status(400).json({ erro: 'Lista de nomes individuais inválida' });
  }

  const query = `
    INSERT INTO confirmados (nome, email, pessoas, nomes_individuais, confirmado, pago)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  const valuesList = nomes_individuais.map(n =>
    [n, email, pessoas, JSON.stringify(nomes_individuais), confirmado, pago]
  );

  let errors = [];
  let inserted = 0;

  valuesList.forEach((values, index) => {
    db.query(query, values, (err) => {
      if (err) {
        errors.push({ nome: values[0], erro: err });
      }
      inserted++;

      if (inserted === valuesList.length) {
        if (errors.length > 0) {
          console.error('Erros ao inserir alguns nomes:', errors);
          return res.status(500).json({ erro: 'Alguns nomes não foram salvos', detalhes: errors });
        }

        res.status(201).json({ mensagem: 'Todos os convidados salvos com sucesso' });
      }
    });
  });
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
// ...