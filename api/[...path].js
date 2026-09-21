import { MongoClient, ObjectId } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = 'monline';

// Cache connection for serverless warm starts
let cachedClient = null;
let cachedDb = null;

async function connectToDatabase() {
  if (cachedDb) return cachedDb;
  if (!MONGODB_URI) throw new Error('MONGODB_URI environment variable is not set');
  const client = new MongoClient(MONGODB_URI, { serverSelectionTimeoutMS: 8000 });
  await client.connect();
  cachedClient = client;
  cachedDb = client.db(DB_NAME);
  return cachedDb;
}

// Safely convert string to ObjectId if valid 24-char hex
function tryObjectId(id) {
  try {
    if (id && id.length === 24 && /^[a-fA-F0-9]{24}$/.test(id)) {
      return new ObjectId(id);
    }
  } catch {}
  return null;
}

// Build a flexible query that matches by _id OR custom id field OR username
function buildIdQuery(id) {
  const objId = tryObjectId(id);
  if (objId) {
    return { $or: [{ _id: objId }, { id: id }] };
  }
  return { $or: [{ id: id }, { username: id }, { national_id: id }] };
}

export default async function handler(req, res) {
  // CORS headers — allow all origins for Vercel deployment
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const db = await connectToDatabase();

    // req.query.path is the catch-all: ['users', '123'] or ['users', 'bulk-import'] etc.
    const pathArr = Array.isArray(req.query.path)
      ? req.query.path
      : req.query.path ? [req.query.path] : [];

    const collectionName = pathArr[0];
    const segment2 = pathArr[1]; // could be 'bulk-import', 'all', or an id

    if (!collectionName) {
      return res.status(400).json({ message: 'Collection name is required' });
    }

    const col = db.collection(collectionName);

    // ── POST /api/:collection/bulk-import ──────────────────────────────────────
    if (req.method === 'POST' && segment2 === 'bulk-import') {
      const body = req.body || {};
      // Accept data under any common key
      const data =
        body.items || body.users || body.managers || body.coordinators ||
        body.mohfezs || body.students || body.branches || body.sessions ||
        body.rowaqs || body.applicants || body.reports || body.data || [];

      if (!Array.isArray(data) || data.length === 0) {
        return res.status(200).json({ inserted: 0 });
      }
      const result = await col.insertMany(data);
      return res.status(201).json({ inserted: result.insertedCount });
    }

    // ── DELETE /api/:collection/all ────────────────────────────────────────────
    if (req.method === 'DELETE' && segment2 === 'all') {
      const result = await col.deleteMany({});
      return res.status(200).json({ deleted: result.deletedCount });
    }

    // ── GET /api/:collection ───────────────────────────────────────────────────
    if (req.method === 'GET' && !segment2) {
      const docs = await col.find({}).toArray();
      return res.status(200).json(docs);
    }

    // ── POST /api/:collection ──────────────────────────────────────────────────
    if (req.method === 'POST' && !segment2) {
      const doc = req.body || {};
      const result = await col.insertOne(doc);
      return res.status(201).json({ ...doc, _id: result.insertedId });
    }

    // ── GET /api/:collection/:id ───────────────────────────────────────────────
    if (req.method === 'GET' && segment2) {
      const doc = await col.findOne(buildIdQuery(segment2));
      if (!doc) return res.status(404).json({ message: 'Not found' });
      return res.status(200).json(doc);
    }

    // ── PUT /api/:collection/:id ───────────────────────────────────────────────
    if (req.method === 'PUT' && segment2) {
      const updateData = req.body || {};
      // Remove _id from update data to avoid immutable field error
      const { _id, ...safeUpdate } = updateData;
      const result = await col.updateOne(buildIdQuery(segment2), { $set: safeUpdate });
      if (result.matchedCount === 0) {
        return res.status(404).json({ message: 'Document not found', matchedCount: 0 });
      }
      return res.status(200).json({ message: 'Updated successfully', modifiedCount: result.modifiedCount });
    }

    // ── DELETE /api/:collection/:id ────────────────────────────────────────────
    if (req.method === 'DELETE' && segment2) {
      const result = await col.deleteOne(buildIdQuery(segment2));
      if (result.deletedCount === 0) {
        return res.status(404).json({ message: 'Not found' });
      }
      return res.status(200).json({ message: 'Deleted successfully' });
    }

    return res.status(405).json({ message: 'Method not allowed' });

  } catch (error) {
    console.error('API Handler Error:', error);
    return res.status(500).json({ message: error.message || 'Internal server error' });
  }
}
