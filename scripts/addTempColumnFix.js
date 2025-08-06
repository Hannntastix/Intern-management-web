import dotenv from 'dotenv';
import { sequelize } from '../libs/postgresql.js';
import { DataTypes } from 'sequelize';

dotenv.config();

async function addTemporaryColumnFix() {
  try {
    console.log('Connecting to PostgreSQL...');
    await sequelize.authenticate();
    console.log('Connection established successfully.');

    // Cek apakah kolom is_temporary sudah ada di tabel Users
    try {
      console.log('Checking if is_temporary column exists in Users table...');
      await sequelize.query(`SELECT is_temporary FROM "Users" LIMIT 1`);
      console.log('Column is_temporary already exists in Users table.');
    } catch (error) {
      // Kolom belum ada, tambahkan
      console.log('Adding is_temporary column to Users table...');
      await sequelize.query(`ALTER TABLE "Users" ADD COLUMN is_temporary BOOLEAN DEFAULT false NOT NULL`);
      console.log('Successfully added is_temporary column to Users table.');
    }

    // Cek apakah kolom is_temporary sudah ada di tabel Interns
    try {
      console.log('Checking if is_temporary column exists in Interns table...');
      await sequelize.query(`SELECT is_temporary FROM "Interns" LIMIT 1`);
      console.log('Column is_temporary already exists in Interns table.');
    } catch (error) {
      // Kolom belum ada, tambahkan
      console.log('Adding is_temporary column to Interns table...');
      await sequelize.query(`ALTER TABLE "Interns" ADD COLUMN is_temporary BOOLEAN DEFAULT false NOT NULL`);
      console.log('Successfully added is_temporary column to Interns table.');
    }

    console.log('Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error during migration:', error);
    process.exit(1);
  }
}

addTemporaryColumnFix();