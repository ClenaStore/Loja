// /api/create_preference.js
import fetch from "node-fetch";

export default async function handler(req, res) {
  if (req.method === "POST") {
    const body = JSON.parse(req.body);

    const response = await fetch("https://api.mercadopago.com/checkout/preferences", {
      method: "POST",
      headers: {
        "Authorization": `Bearer SEU_ACCESS_TOKEN`,
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
  } else {
    res.status(405).json({ error: "Método não permitido" });
  }
}
