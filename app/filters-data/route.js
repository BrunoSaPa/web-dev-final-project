// Fast filter endpoint NOT in /api path to avoid rewrite interception
async function fetchFiltersWithRetry(url, maxRetries = 12) {
    for (let i = 0; i < maxRetries; i++) {
        try {
            // Start with shorter timeout, increase if Express is slow
            const timeoutMs = 3000 + (i * 300);
            
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
            
            const response = await fetch(url, {
                signal: controller.signal,
                cache: 'no-store'
            });
            
            clearTimeout(timeoutId);
            
            if (response.ok) {
                const data = await response.json();
                return data;
            }
        } catch (error) {
            clearTimeout(timeoutId);
            if (i < maxRetries - 1) {
                // Wait progressively longer between retries
                const delayMs = 200 + (i * 100);
                await new Promise(resolve => setTimeout(resolve, delayMs));
            }
        }
    }
    
    // Return empty filters if all retries fail
    return {
        estados: [],
        reino: [],
        filo: [],
        clase: [],
        orden: [],
        familia: [],
        status: []
    };
}

export async function GET(request) {
    try {
        const expressPort = process.env.EXPRESS_PORT || 3001;
        const nodeEnv = process.env.NODE_ENV || 'development';
        
        // Use 127.0.0.1 in production (Render), localhost in dev
        const host = nodeEnv === 'production' ? '127.0.0.1' : 'localhost';
        const apiUrl = `http://${host}:${expressPort}/api/species/filters`;
        
        const data = await fetchFiltersWithRetry(apiUrl);
        return Response.json(data);
        
    } catch (error) {
        console.error('[Filters] Error:', error.message);
        return Response.json({
            estados: [],
            reino: [],
            filo: [],
            clase: [],
            orden: [],
            familia: [],
            status: []
        });
    }
}
