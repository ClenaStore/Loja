export default async function handler(req, res) {
  if (req.method === "POST") {
    try {
      const body = JSON.parse(req.body);

      const response = await fetch("https://api.mercadopago.com/checkout/preferences", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.MP_ACCESS_TOKEN}`, // 👉 precisa ser o TEST_ACCESS_TOKEN
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
            success: "https://loja-rosy-six.vercel.app/sucesso",
            failure: "https://loja-rosy-six.vercel.app/falha",
            pending: "https://loja-rosy-six.vercel.app/pendente"
          },
          auto_return: "approved"
        })
      });

      const data = await response.json();
      console.log("📌 Resposta Mercado Pago:", data);

      if (data.id) {
        res.status(200).json({ id: data.id });
      } else {
        res.status(response.status).json({ error: "Erro do Mercado Pago", details: data });
      }
    } catch (error) {
      res.status(500).json({ error: "Erro interno", details: error.message });
    }
  } else {
    res.status(405).json({ error: "Método não permitido" });
  }
}
