import SpeciesDetailClient from '../../components/SpeciesDetailClient';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
    const { id } = await params;
    const decodedName = decodeURIComponent(id);

    return {
        title: `${decodedName} | Mexican Wildlife`,
        description: `Learn more about ${decodedName}, an endangered species in Mexico.`,
    };
}

async function getSpecies(id) {
    try {
        const decodedName = decodeURIComponent(id);
        
        // Determine API base URL
        let baseUrl;
        
        if (process.env.NODE_ENV === 'production') {
            // In production, Express runs on same server with /api prefix or on separate port
            baseUrl = 'http://localhost:3001';
        } else {
            // In development, Express runs on port 3001
            baseUrl = 'http://localhost:3001';
        }
        
        const response = await fetch(`${baseUrl}/api/species?search=${encodeURIComponent(decodedName)}&limit=100`, {
            cache: 'no-store'
        });
        
        if (!response.ok) {
            console.error('API response error:', response.status);
            return null;
        }
        
        const data = await response.json();
        
        if (!data.species || data.species.length === 0) {
            console.log('No species found for:', decodedName);
            return null;
        }
        
        const species = data.species.find(s => 
            s.nombre_cientifico.toLowerCase() === decodedName.toLowerCase()
        );
        
        if (!species) {
            console.log('Exact match not found, returning first result');
            return data.species[0];
        }
        
        return species;
    } catch (error) {
        console.error('Error fetching species:', error);
        return null;
    }
}

export default async function SpeciesPage({ params }) {
    const { id } = await params;
    const species = await getSpecies(id);

    if (!species) {
        notFound();
    }

    return <SpeciesDetailClient species={species} />;
}
