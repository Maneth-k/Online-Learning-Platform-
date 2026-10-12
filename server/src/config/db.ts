import dns from 'node:dns';
import mongoose from 'mongoose';

// Configure DNS fallback for SRV record lookups on Windows / local environments
if (typeof dns.setServers === 'function') {
  try {
    dns.setServers(['8.8.8.8', '1.1.1.1']);
  } catch (err) {
    console.warn('[DB] Could not configure custom DNS servers, using system defaults:', err);
  }
}

export type DbConnectionState = 'connected' | 'connecting' | 'disconnected' | 'disconnecting' | 'unhealthy';

export interface DatabaseHealth {
  status: DbConnectionState;
  readyState: number;
  host?: string;
  name?: string;
  latencyMs?: number;
  error?: string;
}

const READY_STATE_MAP: Record<number, DbConnectionState> = {
  0: 'disconnected',
  1: 'connected',
  2: 'connecting',
  3: 'disconnecting',
};

/**
 * Establishes connection to the MongoDB Atlas cluster.
 */
export async function connectDB(customUri?: string): Promise<typeof mongoose> {
  const uri = customUri || process.env.MONGODB_URI;

  if (!uri) {
    throw new Error('MONGODB_URI environment variable is missing.');
  }

  const dbName = process.env.DB_NAME || 'lms';

  // Event handlers for database lifecycle
  mongoose.connection.on('connected', () => {
    console.log(`[DB] MongoDB connected successfully to database: ${mongoose.connection.name}`);
  });

  mongoose.connection.on('error', (err) => {
    console.error('[DB] MongoDB connection error:', err);
  });

  mongoose.connection.on('disconnected', () => {
    console.warn('[DB] MongoDB disconnected');
  });

  try {
    await mongoose.connect(uri, {
      dbName,
      serverSelectionTimeoutMS: 10000,
    });
    return mongoose;
  } catch (error) {
    console.error('[DB] Failed to connect to MongoDB:', error);
    throw error;
  }
}

/**
 * Disconnects from MongoDB gracefully.
 */
export async function disconnectDB(): Promise<void> {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
    console.log('[DB] MongoDB connection closed gracefully.');
  }
}

/**
 * Checks database connectivity and latency via ping command.
 */
export async function checkDatabaseHealth(): Promise<DatabaseHealth> {
  const readyState = mongoose.connection.readyState;
  const stateString = READY_STATE_MAP[readyState] || 'disconnected';

  if (readyState !== 1 || !mongoose.connection.db) {
    return {
      status: stateString,
      readyState,
      host: mongoose.connection.host || undefined,
      name: mongoose.connection.name || undefined,
      error: readyState === 0 ? 'Database is disconnected' : `Database connection state is ${stateString}`,
    };
  }

  const startTime = Date.now();
  try {
    // Run MongoDB ping command
    await mongoose.connection.db.command({ ping: 1 });
    const latencyMs = Date.now() - startTime;

    return {
      status: 'connected',
      readyState,
      host: mongoose.connection.host,
      name: mongoose.connection.name,
      latencyMs,
    };
  } catch (err) {
    return {
      status: 'unhealthy',
      readyState,
      host: mongoose.connection.host,
      name: mongoose.connection.name,
      error: err instanceof Error ? err.message : 'Database ping failed',
    };
  }
}
