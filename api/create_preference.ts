import mercadopago from "mercadopago";


const MP_ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN!; // SECRET KEY (server)
const APPS_SCRIPT_URL = process.env.APPS_SCRIPT_URL!; // ex: https://script.google.com/.../exec


mercadopago.configure({ access_token: MP_ACCESS_TOKEN });


export default async function handler(req: Request) {
if (req.method !== "POST") {
return new Response("Method Not Allowed", { status: 405 });
}


try {
const { name, email, qty, unitPrice, total, guess, pendingId, redirect } = await req.json();


const preference = {
items: [
{
title: "Cotas do Bolão",
quantity: Number(qty || 1),
unit_price: Number(unitPrice || 10),
currency_id: "BRL"
}
],
payer: { email, name },
metadata: { name, email, qty, unitPrice, total, guess, pendingId },
back_urls: {
success: "https://SEU-DOMINIO-OU-VERCEL.app/", // ajuste
pending: "https://SEU-DOMINIO-OU-VERCEL.app/",
failure: "https://SEU-DOMINIO-OU-VERCEL.app/"
},
auto_return: "approved",
notification_url: "https://SEU-PROJ.vercel.app/api/mp_webhook"
} as any;


const { body } = await mercadopago.preferences.create(preference);


// Retorna init_point (checkout) OU preference_id para usar o SDK do front
return Response.json({ init_point: body.init_point, preference_id: body.id });
} catch (err: any) {
return new Response(JSON.stringify({ error: err?.message || String(err) }), { status: 500 });
}
}
