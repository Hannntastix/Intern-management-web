import Intern from "../../../models/internInfo";
import connectMongoDB from "../../../lib/mongodb";
import { NextResponse } from "next/server";

export async function GET(request) {
    try {
        await connectMongoDB();

        const { searchParams } = new URL(request.url);
        const nik = searchParams.get('nik');

        if (!nik) {
            return NextResponse.json({ error: 'NIK is required' }, { status: 400 });
        }

        const existingIntern = await Intern.findOne({ nik });

        return NextResponse.json({ exists: !!existingIntern });
    } catch (error) {
        console.error('Error checking NIK:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}