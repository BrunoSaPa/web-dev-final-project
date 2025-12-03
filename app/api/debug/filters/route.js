// Debug endpoint to diagnose filter issues
export async function GET(request) {
    const diagnostics = {
        timestamp: new Date().toISOString(),
        environment: {
            NODE_ENV: process.env.NODE_ENV,
            EXPRESS_PORT: process.env.EXPRESS_PORT || '3001',
            NEXT_PUBLIC_EXPRESS_API_URL: process.env.NEXT_PUBLIC_EXPRESS_API_URL || 'not-set'
        },
        tests: {}
    };

    // Test 1: Try localhost:3001
    try {
        console.log('[Debug] Testing localhost:3001...');
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);
        
        const response = await fetch('http://localhost:3001/api/species/filters', {
            signal: controller.signal
        });
        clearTimeout(timeoutId);
        
        diagnostics.tests.localhost_3001 = {
            status: response.status,
            ok: response.ok,
            success: response.ok,
            timestamp: new Date().toISOString()
        };
        
        if (response.ok) {
            const data = await response.json();
            diagnostics.tests.localhost_3001.dataCount = {
                status: (data.status || []).length,
                estados: (data.estados || []).length,
                reino: (data.reino || []).length
            };
        }
    } catch (error) {
        diagnostics.tests.localhost_3001 = {
            status: 'error',
            error: error.message,
            timestamp: new Date().toISOString()
        };
    }

    // Test 2: Try 127.0.0.1:3001
    try {
        console.log('[Debug] Testing 127.0.0.1:3001...');
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);
        
        const response = await fetch('http://127.0.0.1:3001/api/species/filters', {
            signal: controller.signal
        });
        clearTimeout(timeoutId);
        
        diagnostics.tests.localhost_3001_ip = {
            status: response.status,
            ok: response.ok,
            success: response.ok,
            timestamp: new Date().toISOString()
        };
        
        if (response.ok) {
            const data = await response.json();
            diagnostics.tests.localhost_3001_ip.dataCount = {
                status: (data.status || []).length,
                estados: (data.estados || []).length,
                reino: (data.reino || []).length
            };
        }
    } catch (error) {
        diagnostics.tests.localhost_3001_ip = {
            status: 'error',
            error: error.message,
            timestamp: new Date().toISOString()
        };
    }

    // Test 3: Try the Express API directly from this endpoint
    try {
        console.log('[Debug] Testing via this endpoint...');
        const expressPort = process.env.EXPRESS_PORT || 3001;
        const apiUrl = `http://127.0.0.1:${expressPort}/api/species/filters`;
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);
        
        const response = await fetch(apiUrl, {
            signal: controller.signal
        });
        clearTimeout(timeoutId);
        
        diagnostics.tests.endpoint_proxy = {
            url: apiUrl,
            status: response.status,
            ok: response.ok,
            success: response.ok,
            timestamp: new Date().toISOString()
        };
        
        if (response.ok) {
            const data = await response.json();
            diagnostics.tests.endpoint_proxy.dataCount = {
                status: (data.status || []).length,
                estados: (data.estados || []).length,
                reino: (data.reino || []).length
            };
        }
    } catch (error) {
        diagnostics.tests.endpoint_proxy = {
            status: 'error',
            error: error.message,
            timestamp: new Date().toISOString()
        };
    }

    console.log('[Debug] Diagnostics:', JSON.stringify(diagnostics, null, 2));
    return Response.json(diagnostics);
}
