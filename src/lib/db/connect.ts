import mongoose, { type Connection } from "mongoose"

const MONGODB_URI_ENV = "MONGODB_URI"

type MongooseCache = {
  connection: Connection | null
  promise: Promise<Connection> | null
}

const globalForMongoose = globalThis as typeof globalThis & {
  mongoose?: MongooseCache
}

const getCache = (): MongooseCache => {
  globalForMongoose.mongoose ??= { connection: null, promise: null }
  return globalForMongoose.mongoose
}

export const getMongoUri = (): string => {
  const uri = process.env[MONGODB_URI_ENV]
  if (!uri) {
    throw new Error(`Missing required environment variable: ${MONGODB_URI_ENV}`)
  }
  return uri
}

export const connectToDatabase = async (): Promise<Connection> => {
  const cache = getCache()
  if (cache.connection) return cache.connection

  cache.promise ??= mongoose
    .connect(getMongoUri(), {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 10_000,
    })
    .then((instance) => instance.connection)

  try {
    cache.connection = await cache.promise
  } catch (error) {
    cache.promise = null
    throw error
  }

  return cache.connection
}

export const disconnectFromDatabase = async (): Promise<void> => {
  const cache = getCache()
  cache.connection = null
  cache.promise = null
  await mongoose.disconnect()
}
