// Get API base URL - works for both server-side and client-side requests
const getApiBaseUrl = () => {
    // In client-side (browser), use NEXT_PUBLIC_EXPRESS_API_URL or /api
    if (typeof window !== 'undefined') {
        const publicUrl = process.env.NEXT_PUBLIC_EXPRESS_API_URL;
        // In production, Render provides /api through Next.js rewrites
        if (publicUrl === '/api' || !publicUrl || publicUrl.includes('localhost')) {
            return ''; // Use relative /api path (default)
        }
        return publicUrl; // Use custom external URL if provided
    }
    
    // Server-side: use localhost:3001 for internal communication
    return 'http://localhost:3001';
};

// Fetch species with optional filters and pagination
export async function getSpecies({ 
    page = 1, 
    limit = 15, 
    status = null, 
    search = null, 
    estado = null, 
    reino = null, 
    filo = null, 
    clase = null, 
    orden = null, 
    familia = null 
} = {}) {
    try {
        // Build query parameters for API request
        const params = new URLSearchParams({
            page,
            limit,
            ...(status && { status }),
            ...(search && { search }),
            ...(estado && { estado }),
            ...(reino && { reino }),
            ...(filo && { filo }),
            ...(clase && { clase }),
            ...(orden && { orden }),
            ...(familia && { familia })
        });

        // Make API request to Express server
        const baseUrl = getApiBaseUrl();
        const response = await fetch(`${baseUrl}/api/species?${params.toString()}`, {
            cache: 'no-store'
        });

        if (!response.ok) {
            throw new Error('Failed to fetch species');
        }

        const data = await response.json();
        return {
            species: data.species,
            pagination: data.pagination
        };
    } catch (error) {
        if (process.env.NODE_ENV !== 'production') {
            console.error('Error fetching species:', error);
        }
        return {
            species: [],
            pagination: {
                page: 1,
                totalPages: 0,
                limit,
                totalItems: 0
            }
        };
    }
}

// Fetch available filter options
export async function getFilterOptions() {
    try {
        if (typeof window !== 'undefined') {
            // Client-side: Use the /filters-data endpoint which is NOT in /api path
            // This avoids rewrite interception in Render
            console.log('[getFilterOptions] Client-side: fetching from /filters-data');
            
            const response = await fetch('/filters-data', {
                cache: 'no-store'
            });
            
            if (!response.ok) {
                console.error(`[getFilterOptions] Error: ${response.status}`);
                throw new Error(`Failed to fetch filter options: ${response.status}`);
            }
            
            const data = await response.json();
            console.log(`[getFilterOptions] Got ${(data.status || []).length} statuses`);
            return data;
        } else {
            // Server-side: use internal connection to Express directly
            console.log('[getFilterOptions] Server-side: fetching from Express');
            const expressPort = process.env.EXPRESS_PORT || 3001;
            const baseUrl = `http://localhost:${expressPort}`;
            
            const response = await fetch(`${baseUrl}/api/species/filters`, {
                cache: 'no-store'
            });

            if (!response.ok) {
                throw new Error('Failed to fetch filter options');
            }

            const data = await response.json();
            console.log(`[getFilterOptions] Server-side got ${(data.status || []).length} statuses`);
            return data;
        }
    } catch (error) {
        console.error('[getFilterOptions] Error:', error);
        return {
            status: [],
            estados: [],
            reino: [],
            filo: [],
            clase: [],
            orden: [],
            familia: []
        };
    }
}
