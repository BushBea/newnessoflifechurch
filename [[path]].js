export async function onRequest({ request, env }) {
  if (!env.API_ORIGIN) {
    return Response.json({ error: 'The API service is not configured.' }, { status: 503 });
  }

  try {
    const incomingUrl = new URL(request.url);
    const apiUrl = new URL(`${incomingUrl.pathname}${incomingUrl.search}`, env.API_ORIGIN);
    return await fetch(new Request(apiUrl, request));
  } catch (_) {
    return Response.json({ error: 'The API service is temporarily unavailable.' }, { status: 502 });
  }
}