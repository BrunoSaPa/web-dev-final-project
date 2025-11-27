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
        const baseUrl = process.env.NEXT_PUBLIC_EXPRESS_API_URL || 'http://localhost:3001';
        const decodedName = decodeURIComponent(id);
        
        // Search for species by scientific name
        const response = await fetch(`${baseUrl}/api/species?search=${encodeURIComponent(decodedName)}&limit=100`, {
            cache: 'no-store'
        });
        
        if (!response.ok) return null;
        
        const data = await response.json();
        const species = data.species?.find(s => 
            s.nombre_cientifico.toLowerCase() === decodedName.toLowerCase()
        );
        
        return species || null;
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
