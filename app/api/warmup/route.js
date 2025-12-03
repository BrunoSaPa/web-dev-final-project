// Warmup endpoint to ensure Express is ready
// Called during Next.js initialization to wake up the Express server

export async function GET(request) {
    console.log('[Warmup] Starting Express warmup...');
    
    try {
        const expressPort = process.env.EXPRESS_PORT || 3001;
        const nodeEnv = process.env.NODE_ENV || 'development';
        
        let apiUrl;
        if (nodeEnv === 'production') {
            apiUrl = `http://127.0.0.1:${expressPort}/api/species`;
        } else {
            apiUrl = `http://localhost:${expressPort}/api/species`;
        }
        
        console.log(`[Warmup] Pinging Express at: ${apiUrl}`);
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        
        const response = await fetch(apiUrl, {
            signal: controller.signal,
            headers: { 'X-Warmup': 'true' }
        });
        
        clearTimeout(timeoutId);
        
        if (response.ok) {
            console.log('[Warmup] ✓ Express is ready!');
            return Response.json({ status: 'express_ready', timestamp: new Date().toISOString() });
        } else {
            console.log(`[Warmup] Express returned ${response.status}, will retry on next request`);
            return Response.json({ status: 'warming_up', statusCode: response.status });
        }
    } catch (error) {
        console.log(`[Warmup] Express not ready yet: ${error.message}`);
        return Response.json({ status: 'warming_up', error: error.message });
    }
}
