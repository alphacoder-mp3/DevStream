import { config } from 'dotenv';
import connectDB from './db/index';
import { app } from './app';

// Load environment variables from .env file
config({ path: './env' });

// Function to start the server
const startServer = async (): Promise<void> => {
  try {
    // Connect to the database
    await connectDB();

    app.on('error', (error: unknown) => {
      if (error instanceof Error) {
        console.log('ERR:', error);
      } else {
        console.log('ERR:', error);
      }
    });

    // Set the port from environment variables or default to 8000
    const port: number = Number(process.env.PORT) || 8000;

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
