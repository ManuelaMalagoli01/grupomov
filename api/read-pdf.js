export default async function handler(req, res) {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { pdfBase64 } = req.body;
    if (!pdfBase64) return res.status(400).json({ error: "pdfBase64 is required" });

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) return res.status(500).json({ error: "ANTHROPIC_API_KEY not configured" });

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 2048,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "document",
                source: {
                  type: "base64",
                  media_type: "application/pdf",
                  data: pdfBase64,
                },
              },
              {
                type: "text",
                text: `Analise este relatório de assistência técnica e extraia as seguintes informações em JSON:
{
  "numeroRelatorio": "número do relatório",
  "data": "data do relatório",
  "cliente": "nome do cliente",
  "patrimonio": "número de patrimônio ou série do equipamento",
  "equipamento": "modelo/tipo do equipamento",
  "tecnico": "nome do técnico",
  "servico": "tipo de serviço realizado",
  "descricao": "descrição do serviço",
  "pecasUsadas": ["lista de peças utilizadas"],
  "horasTrabalhadas": "horas trabalhadas",
  "statusFinal": "status final do serviço"
}
Retorne APENAS o JSON, sem texto adicional.`,
              },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      return res.status(response.status).json({ error: errText });
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
