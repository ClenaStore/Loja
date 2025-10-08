import mercadopago from "mercadopago";
import { request as undiciRequest } from "undici";


const MP_ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN!;
const APPS_SCRIPT_URL = process.env.APPS_SCRIPT_URL!; // seu /exec
const MP_WEBHOOK_SECRET = process.env.MP_WEBHOOK_SECRET || ""; // opcional


mercadopago.configure({ access_token: MP_ACCESS_TOKEN });


async function postToAppsScript(payload: any) {
const { statusCode, body } = await undiciRequest(APPS_SCRIPT_URL, {
method: "POST",
headers: { "Content-Type": "application/json" },
body: JSON.stringify({ action: "confirm_payment", ...payload })
});
const txt = await body.text();
if (statusCode >= 400) throw new Error(`Apps Script erro ${statusCode}: ${txt}`);
return txt;
}


export const config = { runtime: "edge" };


export default async function handler(req: Request) {
if (req.method !== "POST") return new Response("Method Not Allowed", { status: 405 });


// (Opcional) Validação simples de segredo em header
const secret = req.headers.get("x-webhook-secret") || "";
if (MP_WEBHOOK_SECRET && secret !== MP_WEBHOOK_SECRET) {
return new Response("Unauthorized", { status: 401 });
}


try {
const payload = await req.json().catch(() => ({}));


// Mercado Pago pode enviar diferentes formatos: topic + id, type, data.id etc.
// Vamos cobrir o comum: {type: 'payment', data: { id: 'PAYMENT_ID' }}
const type = payload.type || payload.topic;
let paymentId: string | null = null;


if (type === "payment") {
paymentId = payload.data?.id || payload["data.id"] || payload["resource"]?.split("/")?.pop() || null;
}


if (!paymentId) {
// Em alguns casos o MP manda "action" + query param. Tente querystring
const url = new URL(req.url);
const qsPaymentId = url.searchParams.get("id") || url.searchParams.get("data.id");
if (qsPaymentId) paymentId = qsPaymentId;
}


if (!paymentId) {
// Nada a processar
return new Response("ok", { status: 200 });
}


// Busca detalhes do pagamento
const { body: payment } = await mercadopago.payment.findById(Number(paymentId));


const status = payment.status; // approved, pending, rejected
const email = payment.payer?.email;
const metadata = payment.metadata || {};
}
