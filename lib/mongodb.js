// lib/mongodb.js
import { MongoClient } from "mongodb"

const uri = process.env.MONGO_CLUSTER_URL

let clientPromise

if (!global._mongoClientPromise) {
    const client = new MongoClient(uri)
    global._mongoClientPromise = client.connect()
}
clientPromise = global._mongoClientPromise

export default clientPromise