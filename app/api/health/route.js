// Health check endpoints for debugging
export async function GET(request) {
    const expressPort = process.env.EXPRESS_PORT || 3001;
    const isDev = process.env.NODE_ENV !== 'production';
    const host = isDev ? 'localhost' : '127.0.0.1';
    
    try {
        // Try to connect to Express
        const expressResponse = await fetch(`http://${host}:${expressPort}/api/test`, {
            signal: AbortSignal.timeout(3000)
        });
        
        const expressStatus = expressResponse.ok ? 'UP' : 'ERROR';
        
        return Response.json({
            nextjs: 'UP',
            express: expressStatus,
            env: process.env.NODE_ENV,
            expressUrl: `http://${host}:${expressPort}`,
            expressPort,
            mongodb: process.env.MONGODB_URI ? 'CONFIGURED' : 'NOT_CONFIGURED'
        });
    } catch (error) {
        return Response.json({
            nextjs: 'UP',
            express: 'DOWN',
            error: error.message,
            env: process.env.NODE_ENV,
            expressUrl: `http://${host}:${expressPort}`,
            expressPort,
            mongodb: process.env.MONGODB_URI ? 'CONFIGURED' : 'NOT_CONFIGURED'
        }, { status: 503 });
    }
}
