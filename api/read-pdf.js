export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }
  
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { pdfBase64 } = req.body || {};
    
    if (!pdfBase64) {
      return res.status(400).json({ error: "pdfBase64 is required" });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "ANTHROPIC_API_KEY not configured in Vercel" });
    }

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 1024,
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
                text: `Analise este relatório de assistência técnica da Grupo MOV e retorne APENAS um JSON válido (sem markdown, sem texto extra) com esta estrutura exata:
{"reportNum":"","dataAtendimento":"YYYY-MM-DD","empresa":"","cidade":"","patrimonio":"","horimetro":"","tecnico":"","tipoAtendimento":"corretivo ou preventivo","servico":"","numChamado":"","statusFinal":"Pendente Peças ou Concluído","obs":"","pecasUsadas":[{"peca":"","cod":"","quantidade":""}]}

Regras:
- dataAtendimento: formato YYYY-MM-DD, extraia do relatório
- tipoAtendimento: use exatamente "corretivo" ou "preventivo"
- statusFinal: use "Concluído" se o serviço foi finalizado, "Pendente Peças" se há peças pendentes
- reportNum: número do relatório/OS se houver
- patrimonio: número de patrimônio do equipamento
- horimetro: leitura do horímetro se houver
- pecasUsadas: lista de peças utilizadas no serviço
- Se um campo não existir no documento, deixe como string vazia ""`,
              },
            ],
          },
        ],
      }),
    });

    const responseText = await response.text();
    
    if (!response.ok) {
      return res.status(response.status).json({ error: responseText });
    }

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      return res.status(500).json({ error: "Resposta inválida da API Anthropic: " + responseText.slice(0, 200) });
    }

    return res.status(200).json(data);
    
  } catch (error) {
    return res.status(500).json({ error: error.message || "Erro interno" });
  }
}
