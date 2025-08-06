import GeofenceLocation from '@/models/geoFencingInfo';
import connectMongoDB from "@/libs/mongodb";
import { NextResponse } from 'next/server';

export async function GET(request) {
    try {
        await connectMongoDB();
        
        // Ambil pengaturan geofencing terbaru
        const geofenceSetting = await GeofenceLocation.findOne().sort({ createdAt: -1 });
        
        if (!geofenceSetting) {
            return NextResponse.json({ 
                latitude: null, 
                longitude: null, 
                radius: null,
                changeByUser: null,
                updatedAt: null
            });
        }
        
        return NextResponse.json({
            latitude: geofenceSetting.latitude,
            longitude: geofenceSetting.longitude,
            radius: geofenceSetting.radius,
            changeByUser: geofenceSetting.changeByUser,
            updatedAt: geofenceSetting.updatedAt
        });
    } catch (error) {
        console.error("Error fetching geofencing settings:", error);
        return NextResponse.json(
            { error: "Gagal mengambil pengaturan geofencing" }, 
            { status: 500 }
        );
    }
}

export async function POST(request) {
    try {
        await connectMongoDB();
        
        const { centerLatitude, centerLongitude, radius, changeByUser } = await request.json();
        
        // Validasi input
        if (!centerLatitude || !centerLongitude) {
            return NextResponse.json(
                { error: "Latitude dan longitude harus diisi" }, 
                { status: 400 }
            );
        }

        if (!changeByUser) {
            return NextResponse.json(
                { error: "User yang mengganti pengaturan harus diisi" }, 
                { status: 400 }
            );
        }
        
        // Buat pengaturan geofencing baru (menimpa yang lama)
        const newGeofenceSetting = new GeofenceLocation({
            latitude: centerLatitude,
            longitude: centerLongitude,
            radius: radius || 100, // default 100 meter
            changeByUser: changeByUser
        });
        
        await newGeofenceSetting.save();
        
        return NextResponse.json({
            message: "Pengaturan geofencing berhasil disimpan",
            data: {
                latitude: newGeofenceSetting.latitude,
                longitude: newGeofenceSetting.longitude,
                radius: newGeofenceSetting.radius,
                changeByUser: newGeofenceSetting.changeByUser,
                updatedAt: newGeofenceSetting.updatedAt
            }
        });
    } catch (error) {
        console.error("Error saving geofencing settings:", error);
        return NextResponse.json(
            { error: "Gagal menyimpan pengaturan geofencing" }, 
            { status: 500 }
        );
    }
}

export async function PUT(request) {
    try {
        await connectMongoDB();
        
        const { centerLatitude, centerLongitude, radius, changeByUser } = await request.json();
        
        // Validasi input
        if (!centerLatitude || !centerLongitude) {
            return NextResponse.json(
                { error: "Latitude dan longitude harus diisi" }, 
                { status: 400 }
            );
        }

        if (!changeByUser) {
            return NextResponse.json(
                { error: "User yang mengganti pengaturan harus diisi" }, 
                { status: 400 }
            );
        }
        
        // Cari pengaturan geofencing yang sudah ada
        const existingGeofence = await GeofenceLocation.findOne().sort({ createdAt: -1 });
        
        if (existingGeofence) {
            // Update pengaturan yang sudah ada
            existingGeofence.latitude = centerLatitude;
            existingGeofence.longitude = centerLongitude;
            existingGeofence.radius = radius || 100;
            existingGeofence.changeByUser = changeByUser;
            existingGeofence.updatedAt = new Date();
            
            await existingGeofence.save();
            
            return NextResponse.json({
                message: "Pengaturan geofencing berhasil diperbarui",
                data: {
                    latitude: existingGeofence.latitude,
                    longitude: existingGeofence.longitude,
                    radius: existingGeofence.radius,
                    changeByUser: existingGeofence.changeByUser,
                    updatedAt: existingGeofence.updatedAt
                }
            });
        } else {
            // Jika belum ada pengaturan, buat baru
            const newGeofenceSetting = new GeofenceLocation({
                latitude: centerLatitude,
                longitude: centerLongitude,
                radius: radius || 100,
                changeByUser: changeByUser
            });
            
            await newGeofenceSetting.save();
            
            return NextResponse.json({
                message: "Pengaturan geofencing baru berhasil dibuat",
                data: {
                    latitude: newGeofenceSetting.latitude,
                    longitude: newGeofenceSetting.longitude,
                    radius: newGeofenceSetting.radius,
                    changeByUser: newGeofenceSetting.changeByUser,
                    updatedAt: newGeofenceSetting.updatedAt
                }
            });
        }
    } catch (error) {
        console.error("Error updating geofencing settings:", error);
        return NextResponse.json(
            { error: "Gagal memperbarui pengaturan geofencing" }, 
            { status: 500 }
        );
    }
}