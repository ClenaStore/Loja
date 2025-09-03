export default async function handler(req, res) {
  try {
    const token = process.env.MP_ACCESS_TOKEN || "";
    const masked =
      token ? token.slice(0, 8) + "...(" + token.length + " chars)" : "EMPTY";

    // Chama a API /users/me para validar o token
    const r = await fetch("https://api.mercadopago.com/users/me", {
      headers: { Authorization: `Bearer ${token}` }
    });

    const data = await r.json();

    res.status(200).json({
      envTokenPresent: !!token,
      envTokenMasked: masked,
      mpStatus: r.status,
      mpResponse: data
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
