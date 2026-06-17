    export const config = { api: { bodyParser: { sizeLimit: '10mb' } } };

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { pdfBase64 } = req.body;
  if (!pdfBase64) return res.status(400).json({ error: 'PDF não enviado' });

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'anthropic-beta': 'pdfs-2024-09-25',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 1000,
        messages: [{
          role: 'user',
          content: [
            {
              type: 'document',
              source: { type: 'base64', media_type: 'application/pdf', data: pdfBase64 }
            },
            {
              type: 'text',
              text: `Leia este relatório de manutenção da Grupo MOV e extraia SOMENTE JSON puro (sem markdown, sem backticks, sem explicação):
{
  "relatorio": "número do relatório (ex: 030680)",
  "dataAtendimento": "data no formato YYYY-MM-DD",
  "tipoAtendimento": "preventivo SE for Relatório de Manutenção Preventiva, corretivo SE tiver Descrição do Defeito ou Chamado",
  "tecnico": "nome completo do executante",
  "empresa": "nome da empresa cliente",
  "cidade": "cidade do atendimento",
  "patrimonio": "número PAT (só os números antes da barra /)",
  "horimetro": "valor do horímetro",
  "chamado": "número do chamado se existir, senão vazio",
  "horaEntrada": "hora início no formato HH:MM",
  "horaSaida": "hora fim no formato HH:MM",
  "horasTrabalhadas": "tempo trabalhado no formato HH:MM",
  "solicitouPecas": "sim se Resultado de Peças for Sim, senão nao",
  "statusFinal": "Concluído se resultado positivo sim, senão Pendente",
  "observacoes": "texto da observação ou pendência se houver"
}`
            }
          ]
        }]
      })
    });

    const data = await response.json();
    if (!response.ok) return res.status(500).json({ error: data.error?.message || 'Erro na API Claude' });

    const txt = data.content?.[0]?.text || '{}';
    const clean = txt.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(clean);
    return res.status(200).json(parsed);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
}

    
