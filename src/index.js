import { config } from 'dotenv';
import connectDB from './db/index.js';
import { app } from './app.js';

config({ path: './env' });

// Function to start the server
const startServer = async () => {
  try {
    // Connect to the database
    await connectDB();

    app.on('error', error => {
      console.log('ERR:', error);
      throw error;
    });

    // Set the port from environment variables or default to 8000
    const port = process.env.PORT || 8000;

    // Start the server
    app.listen(port, () => {
      console.log(`App listening on port ${port}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1); // Exit the process with an error code
  }
};

// Start the server
startServer();
