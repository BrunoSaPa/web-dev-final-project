import { connectToDatabase } from '@/lib/mongodb';
import Species from '@/lib/models/Species';

export async function GET(request) {
    try {
        await connectToDatabase();
        
        const count = await Species.countDocuments();
        const sample = await Species.find().limit(2);
        
        return Response.json({
            success: true,
            count,
            sample: sample.map(s => ({
                id: s._id,
                nombre_cientifico: s.nombre_cientifico,
                nombre_comun: s.nombre_comun
            }))
        });
    } catch (error) {
        return Response.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}