export const onRequest: PagesFunction<{ BACKEND_URL: string }> = async (context) => {
    const url = new URL(context.request.url);
    const backendUrlBase = context.env.BACKEND_URL || 'http://201.23.78.147';

    // Constrói a URL do backend: troca o prefixo /proxy por /api
    const targetPath = url.pathname.replace(/^\/proxy/, '/api');
    const backendUrl = `${backendUrlBase}${targetPath}${url.search}`;

    console.log(`Proxying request to: ${backendUrl}`);

    const newRequest = new Request(backendUrl, {
        method: context.request.method,
        headers: context.request.headers,
        body: context.request.body,
        redirect: 'follow'
    });

    try {
        const response = await fetch(newRequest);

        // Cria uma nova resposta para garantir que os headers de CORS do backend sejam mantidos
        const newResponse = new Response(response.body, response);
        newResponse.headers.set('X-Proxied-By', 'Cloudflare-Pages-Functions');

        return newResponse;
    } catch (err) {
        return new Response(`Proxy Error: ${err.message}`, { status: 502 });
    }
};
