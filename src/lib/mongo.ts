import { MongoClient, Db } from "mongodb";

const uri = process.env.MONGO_URI as string;
const options = {};

let client: MongoClient;
let db: Db;

export async function getMongoDb() {
  if (!client) {
    client = new MongoClient(uri, options);
    await client.connect();
    db = client.db("rls_guard_dog");
  }
  return db;
}
