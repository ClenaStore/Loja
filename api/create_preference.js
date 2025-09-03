export default async function handler(req, res) {
  if (req.method === "POST") {
    try {
      const body = JSON.parse(req.body);

      const response = await fetch("https://api.mercadopago.com/checkout/preferences", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.MP_ACCESS_TOKEN}`, // configurado na Vercel
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          items: [
            {
              title: body.title,
              quantity: 1,
              currency_id: "BRL",
              unit_price: body.price
            }
          ],
          back_urls: {
            success: "https://seusite.com/sucesso",
            failure: "https://seusite.com/falha",
            pending: "https://seusite.com/pendente"
          },
          auto_return: "approved"
        })
      });

      const data = await response.json();
      res.status(200).json({ id: data.id });
    } catch (error) {
      res.status(500).json({ error: "Erro interno", details: error.message });
    }
  } else {
    res.status(405).json({ error: "Método não permitido" });
  }
}
