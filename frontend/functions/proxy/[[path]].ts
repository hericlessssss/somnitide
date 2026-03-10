export const onRequest: PagesFunction<{ BACKEND_URL: string }> = async (context) => {
    const url = new URL(context.request.url);
    const backendUrlBase = (context.env.BACKEND_URL || 'http://201.23.78.147').replace(/\/$/, '');

    // Se o caminho começa com /proxy/api, apenas removemos o /proxy
    // Se for apenas /proxy, vira /api
    let targetPath = url.pathname.replace(/^\/proxy/, '');
    if (targetPath === '') targetPath = '/api';

    const backendUrl = `${backendUrlBase}${targetPath}${url.search}`;

    // Filtramos headers que podem causar problemas (como Host e Origin)
    const newHeaders = new Headers(context.request.headers);
    newHeaders.delete('host');
    newHeaders.delete('origin');
    newHeaders.delete('referer');

    const newRequest = new Request(backendUrl, {
        method: context.request.method,
        headers: newHeaders,
        body: context.request.body,
        redirect: 'follow'
    });

    try {
        const response = await fetch(newRequest);
        const newResponse = new Response(response.body, response);
        newResponse.headers.set('X-Proxied-By', 'Cloudflare-Pages-Functions');
        return newResponse;
    } catch (err) {
        return new Response(`Proxy Error: Could not reach backend at ${backendUrl}. Details: ${err.message}`, { status: 502 });
    }
};
