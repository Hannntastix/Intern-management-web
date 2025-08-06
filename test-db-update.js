import connectMongoDB from './lib/mongodb.js';
import Intern from './models/internInfo.js';
import dotenv from 'dotenv';

dotenv.config();

async function testDatabaseUpdate() {
  try {
    console.log('🔍 Testing database connection...');
    await connectMongoDB();
    
    console.log('🔍 Testing find intern...');
    const intern = await Intern.findOne();
    console.log('Found intern:', intern ? {
      id: intern._id,
      nama: intern.nama,
      nomorSertifikat: intern.nomorSertifikat
    } : 'No intern found');
    
    if (intern) {
      console.log('🔍 Testing update nomor sertifikat...');
      const testNomor = 'BPS-2024-TEST-' + Date.now();
      
      const updatedIntern = await Intern.findByIdAndUpdate(
        intern._id,
        { nomorSertifikat: testNomor },
        { new: true }
      );
      
      console.log('Updated intern:', {
        id: updatedIntern._id,
        nama: updatedIntern.nama,
        nomorSertifikat: updatedIntern.nomorSertifikat
      });
      
      console.log('✅ Database update test successful!');
    }
    
  } catch (error) {
    console.error('❌ Database test failed:', error);
  }
}

testDatabaseUpdate(); 