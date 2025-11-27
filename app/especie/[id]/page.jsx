import { connectToDatabase } from '../../../lib/mongodb';
import Species from '../../../lib/models/Species';
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
    await connectToDatabase();
    const decodedName = decodeURIComponent(id);

    // Case insensitive search
    const species = await Species.findOne({
        nombre_cientifico: { $regex: new RegExp(`^${decodedName}$`, 'i') }
    }).lean();

    if (!species) return null;

    // Serialize MongoDB object (convert _id and dates to strings)
    return {
        ...species,
        _id: species._id.toString(),
        createdAt: species.createdAt?.toISOString(),
        updatedAt: species.updatedAt?.toISOString(),
    };
}

export default async function SpeciesPage({ params }) {
    const { id } = await params;
    const species = await getSpecies(id);

    if (!species) {
        notFound();
    }

    return <SpeciesDetailClient species={species} />;
}
