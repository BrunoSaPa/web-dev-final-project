// Proxy to Express API to get filter options
// This ensures we use the same filter logic as the backend
async function fetchWithRetry(url, options = {}, maxRetries = 15) {
    let lastError;
    let lastStatus = null;
    let lastData = null;
    
    for (let i = 0; i < maxRetries; i++) {
        try {
            const controller = new AbortController();
            // Increase timeout for each retry
            const timeout = 2000 + (i * 300); // 2s, 2.3s, 2.6s, etc.
            const timeoutId = setTimeout(() => controller.abort(), timeout);
            
            console.log(`[Filters API] Attempt ${i + 1}/${maxRetries} to ${url.replace('http://', '').substring(0, 40)}... (timeout: ${timeout}ms)`);
            
            const response = await fetch(url, {
                ...options,
                signal: controller.signal,
            });
            
            clearTimeout(timeoutId);
            lastStatus = response.status;
            
            if (response.ok) {
                lastData = await response.json();
                console.log(`[Filters API] ✓ SUCCESS on attempt ${i + 1}: Got data with ${(lastData.status || []).length} statuses`);
                return lastData; // Return the parsed data, not the response
            } else {
                console.log(`[Filters API] Attempt ${i + 1}: Got HTTP ${response.status}, will retry...`);
                lastError = new Error(`HTTP ${response.status}`);
                
                // Don't throw immediately - some errors might be temporary
                if (i < maxRetries - 1) {
                    const waitTime = 300 + (i * 100); // 300ms, 400ms, 500ms, etc.
                    console.log(`[Filters API] Waiting ${waitTime}ms before next retry...`);
                    await new Promise(resolve => setTimeout(resolve, waitTime));
                }
            }
        } catch (error) {
            lastError = error;
            console.log(`[Filters API] Attempt ${i + 1}/${maxRetries} network error: ${error.message}`);
            
            // Wait before retrying
            if (i < maxRetries - 1) {
                const waitTime = 300 + (i * 100);
                console.log(`[Filters API] Waiting ${waitTime}ms before retry attempt ${i + 2}...`);
                await new Promise(resolve => setTimeout(resolve, waitTime));
            }
        }
    }
    
    console.error(`[Filters API] FAILED after ${maxRetries} attempts. Last error: ${lastError?.message}, Last status: ${lastStatus}`);
    throw lastError;
}

export async function GET(request) {
    const startTime = Date.now();
    console.log(`\n[Filters API] ===== REQUEST START ===== (${new Date().toISOString()})`);
    
    try {
        // Determine the Express API URL based on environment
        let apiUrl;
        const expressPort = process.env.EXPRESS_PORT || 3001;
        const nodeEnv = process.env.NODE_ENV || 'development';
        
        if (nodeEnv === 'production') {
            // In production (Render), Express runs on port 3001 in the same container
            apiUrl = `http://127.0.0.1:${expressPort}/api/species/filters`;
        } else {
            // In development, use localhost:3001
            apiUrl = `http://localhost:${expressPort}/api/species/filters`;
        }
        
        console.log(`[Filters API] Configuration:`);
        console.log(`  - NODE_ENV: ${nodeEnv}`);
        console.log(`  - EXPRESS_PORT: ${expressPort}`);
        console.log(`  - Target URL: ${apiUrl}`);
        console.log(`[Filters API] Starting fetch with retry logic...`);
        
        // fetchWithRetry returns the parsed JSON data directly
        const data = await fetchWithRetry(apiUrl, {
            headers: {
                'Accept': 'application/json',
                ...Object.fromEntries(
                    Array.from(request.headers.entries()).filter(
                        ([key]) => ['user-agent', 'accept-encoding'].includes(key.toLowerCase())
                    )
                ),
            },
        });

        const elapsed = Date.now() - startTime;
        
        console.log(`[Filters API] ✓ SUCCESS in ${elapsed}ms`);
        console.log(`[Filters API] Response data:`);
        console.log(`  - status: ${(data.status || []).length} items`);
        console.log(`  - estados: ${(data.estados || []).length} items`);
        console.log(`  - reino: ${(data.reino || []).length} items`);
        console.log(`  - filo: ${(data.filo || []).length} items`);
        console.log(`[Filters API] ===== REQUEST END =====\n`);
        
        return Response.json(data);
        
    } catch (error) {
        const elapsed = Date.now() - startTime;
        console.error(`[Filters API] ✗ FAILED after ${elapsed}ms`);
        console.error(`[Filters API] Error: ${error.message}`);
        console.error(`[Filters API] Stack: ${error.stack}`);
        console.error(`[Filters API] ===== REQUEST END (ERROR) =====\n`);
        
        // Return empty filters instead of error to allow page to load
        return Response.json({
            status: [],
            estados: [],
            reino: [],
            filo: [],
            clase: [],
            orden: [],
            familia: []
        });
    }
}
