export async function getSpecies({ page = 1, limit = 15, status = null, search = null, estado = null, reino = null, filo = null, clase = null, orden = null, familia = null } = {}) {
    try {
        // Fetch from API endpoint (MongoDB)
        const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
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

        const response = await fetch(`${baseUrl}/api/species?${params.toString()}`, {
            cache: 'no-store'
        });

        if (!response.ok) {
            throw new Error('Failed to fetch species from MongoDB');
        }

        const data = await response.json();
        return {
            species: data.species,
            pagination: data.pagination
        };
    } catch (error) {
        console.error('Error fetching species from MongoDB:', error);
        // Return empty result if MongoDB is unavailable
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

export async function getFilterOptions() {
    try {
        const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
        const response = await fetch(`${baseUrl}/api/species/filters`, {
            cache: 'no-store'
        });

        if (!response.ok) {
            throw new Error('Failed to fetch filter options');
        }

        return await response.json();
    } catch (error) {
        console.error('Error fetching filter options:', error);
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
