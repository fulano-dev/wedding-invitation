import React, { useState, useEffect } from 'react';

function valorPorIdade(idade) {
  if (idade < 6) return 0;
  if (idade < 12) return 100;
  return 200;
}

function calcularTotal(convidados) {
  let total = 0;
  convidados.forEach(c => {
    if (c.detalhes_pessoas) {
      try {
        const detalhes = typeof c.detalhes_pessoas === 'string' ? JSON.parse(c.detalhes_pessoas) : c.detalhes_pessoas;
        detalhes.forEach(p => {
          total += valorPorIdade(p.idade);
        });
      } catch {}
    }
  });
  return total;
}

export default function Admin() {
  const [auth, setAuth] = useState(false);
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const [convidados, setConvidados] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (auth) {
      fetch('/api/admin', {
        headers: {
          Authorization: 'Basic ' + btoa(user + ':' + pass)
        }
      })
        .then(r => r.json())
        .then(setConvidados);
    }
  }, [auth, user, pass]);

  const handleLogin = e => {
    e.preventDefault();
    setAuth(true);
  };

  const marcarPago = async (id, acao) => {
    setLoading(true);
    await fetch('/api/admin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Basic ' + btoa(user + ':' + pass)
      },
      body: JSON.stringify({ id, acao })
    });
    // Atualiza lista
    const res = await fetch('/api/admin', {
      headers: {
        Authorization: 'Basic ' + btoa(user + ':' + pass)
      }
    });
    setConvidados(await res.json());
    setLoading(false);
  };

  if (!auth) {
    return (
      <form onSubmit={handleLogin} style={{ maxWidth: 300, margin: '80px auto', background: '#111', color: '#FFD700', padding: 32, borderRadius: 12 }}>
        <h2 style={{ color: '#FFD700', marginBottom: 16 }}>Painel Admin</h2>
        <input placeholder="Usuário" value={user} onChange={e => setUser(e.target.value)} style={{ width: '100%', marginBottom: 8, padding: 8 }} />
        <input type="password" placeholder="Senha" value={pass} onChange={e => setPass(e.target.value)} style={{ width: '100%', marginBottom: 16, padding: 8 }} />
        <button type="submit" style={{ background: '#FFD700', color: '#111', padding: 10, border: 'none', borderRadius: 6, width: '100%' }}>Entrar</button>
      </form>
    );
  }

  const totalConfirmados = convidados.filter(c => c.confirmado !== 'Não').length;
  const totalPagos = convidados.filter(c => c.pago && c.confirmado !== 'Não').length;
  const totalNaoPagos = convidados.filter(c => !c.pago && c.confirmado !== 'Não').length;
  const totalArrecadado = calcularTotal(convidados.filter(c => c.pago && c.confirmado !== 'Não'));
  const totalPotencial = calcularTotal(convidados.filter(c => c.confirmado !== 'Não'));

  return (
    <div style={{ background: '#111', color: '#fff', minHeight: '100vh', padding: 32 }}>
      <h1 style={{ color: '#FFD700' }}>Painel Administrativo</h1>
      <div style={{ marginBottom: 32 }}>
        <strong>Confirmados:</strong> {totalConfirmados} | <strong>Pagos:</strong> {totalPagos} | <strong>Não pagos:</strong> {totalNaoPagos}<br />
        <strong>Arrecadado:</strong> R$ {totalArrecadado.toFixed(2)}<br />
        <strong>Potencial:</strong> R$ {totalPotencial.toFixed(2)}
        <div style={{ marginTop: 16, display: 'flex', gap: 16 }}>
          <div style={{ background: '#222', borderRadius: 8, padding: 16, color: '#FFD700', flex: 1 }}>
            <div>Pagos</div>
            <div style={{ height: 24, background: '#FFD700', width: `${(totalPagos / totalConfirmados) * 100 || 0}%`, borderRadius: 4 }}></div>
          </div>
          <div style={{ background: '#222', borderRadius: 8, padding: 16, color: '#FFD700', flex: 1 }}>
            <div>Não pagos</div>
            <div style={{ height: 24, background: '#fff', width: `${(totalNaoPagos / totalConfirmados) * 100 || 0}%`, borderRadius: 4 }}></div>
          </div>
        </div>
      </div>
      <table style={{ width: '100%', background: '#222', borderRadius: 8, color: '#FFD700', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ padding: 8 }}>Nome</th>
            <th style={{ padding: 8 }}>Email</th>
            <th style={{ padding: 8 }}>Confirmado</th>
            <th style={{ padding: 8 }}>Pago</th>
            <th style={{ padding: 8 }}>Valor</th>
            <th style={{ padding: 8 }}>Ações</th>
          </tr>
        </thead>
        <tbody>
          {convidados.filter(c => c.confirmado !== 'Não').map(c => {
            let valor = 0;
            if (c.detalhes_pessoas) {
              try {
                const detalhes = typeof c.detalhes_pessoas === 'string' ? JSON.parse(c.detalhes_pessoas) : c.detalhes_pessoas;
                detalhes.forEach(p => {
                  valor += valorPorIdade(p.idade);
                });
              } catch {}
            }
            return (
              <tr key={c.id} style={{ background: c.pago ? '#FFD70022' : 'transparent' }}>
                <td style={{ padding: 8, color: '#fff' }}>{c.nome}</td>
                <td style={{ padding: 8, color: '#fff' }}>{c.email}</td>
                <td style={{ padding: 8 }}>{c.confirmado}</td>
                <td style={{ padding: 8 }}>{c.pago ? 'Sim' : 'Não'}</td>
                <td style={{ padding: 8 }}>R$ {valor.toFixed(2)}</td>
                <td style={{ padding: 8 }}>
                  {c.pago ? (
                    <button disabled={loading} onClick={() => marcarPago(c.id, 'restaurar-pago')} style={{ background: '#fff', color: '#111', border: 'none', borderRadius: 6, padding: '6px 12px' }}>Restaurar</button>
                  ) : (
                    <button disabled={loading} onClick={() => marcarPago(c.id, 'marcar-pago')} style={{ background: '#FFD700', color: '#111', border: 'none', borderRadius: 6, padding: '6px 12px' }}>Confirmar Pagamento</button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
