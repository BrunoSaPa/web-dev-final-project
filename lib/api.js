// Get API base URL from environment or use localhost
const getApiBaseUrl = () => {
    // Always use Express server for species API calls
    return process.env.NEXT_PUBLIC_EXPRESS_API_URL || 'http://localhost:3001';
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
        const baseUrl = getApiBaseUrl();
        const params = new URLSearchParams({
            page,
            limit,
            // Only add filter parameters if they have values
            ...(status && { status }),
            ...(search && { search }),
            ...(estado && { estado }),
            ...(reino && { reino }),
            ...(filo && { filo }),
            ...(clase && { clase }),
            ...(orden && { orden }),
            ...(familia && { familia })
        });

        // Make API request with cache disabled
        const response = await fetch(`${baseUrl}/api/species?${params.toString()}`, {
            cache: 'no-store'
        });

        if (!response.ok) {
            throw new Error('Failed to fetch species from MongoDB');
        }

        // Extract and return species data with pagination info
        const data = await response.json();
        return {
            species: data.species,
            pagination: data.pagination
        };
    } catch (error) {
        console.error('Error fetching species from MongoDB:', error);
        // Return empty result if API is unavailable - prevents page crash
        return {
            species: [],
            pagination: {
                page: 1,
                totalPages: 0,
                limit,
                status,
                totalItems: 0
            }
        };
    }
}

// Fetch available filter options from API
export async function getFilterOptions() {
    try {
        const baseUrl = getApiBaseUrl();
        // Request all available taxonomy and status filter values
        const response = await fetch(`${baseUrl}/api/species/filters`, {
            cache: 'no-store'
        });

        if (!response.ok) {
            throw new Error('Failed to fetch filter options');
        }

        return await response.json();
    } catch (error) {
        console.error('Error fetching filter options:', error);
        // Return empty arrays as fallback
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
}
