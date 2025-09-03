export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  try {
    // Em projetos Vercel "vanilla", req.body vem como string
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;

    const r = await fetch("https://api.mercadopago.com/checkout/preferences", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        items: [
          {
            title: body?.title || "Produto",
            quantity: 1,
            currency_id: "BRL",
            unit_price: Number(body?.price || 1)
          }
        ],
        back_urls: {
          success: "https://SEU-PROJETO.vercel.app/sucesso",
          failure: "https://SEU-PROJETO.vercel.app/falha",
          pending: "https://SEU-PROJETO.vercel.app/pendente"
        },
        auto_return: "approved"
      })
    });

    const data = await r.json();

    // Se criou, retorna o id
    if (data && data.id) return res.status(200).json({ id: data.id });

    // Caso contrário, retorna o erro completo pra você ver no console
    return res.status(r.status).json({
      error: "Erro do Mercado Pago",
      mpStatus: r.status,
      details: data
    });
  } catch (err) {
    return res.status(500).json({ error: "Erro interno", details: err.message });
  }
}
