const mongoose = require('mongoose');
require('dotenv').config();

async function dropIndexes() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;
    
    // Specifically target the userprofiles collection
    const collectionName = 'userprofiles';
    console.log(`Checking indexes for collection: ${collectionName}`);
    
    try {
      const indexes = await db.collection(collectionName).indexes();
      console.log('Current indexes:', indexes);
      
      // Drop userId index if it exists
      if (indexes.some(index => index.name === 'userId_1')) {
        console.log(`Dropping userId index from ${collectionName}`);
        await db.collection(collectionName).dropIndex('userId_1');
        console.log('Index dropped successfully');
      } else {
        console.log('userId_1 index not found');
      }

      // Create new index on phone field
      console.log('Creating new index on phone field');
      await db.collection(collectionName).createIndex({ phone: 1 }, { unique: true });
      console.log('Phone index created successfully');

    } catch (collectionError) {
      console.error('Error accessing collection:', collectionError);
    }

    console.log('Index cleanup completed');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
  }
}

dropIndexes(); 