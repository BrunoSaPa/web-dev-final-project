import { getSpecies } from '@/lib/controllers/speciesController';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const params = Object.fromEntries(searchParams);

        const result = await getSpecies(params);

        return Response.json(result);
    } catch (error) {
        console.error('Error in species API route:', error);
        return Response.json(
            { error: 'Failed to fetch species' },
            { status: 500 }
        );
    }
}
