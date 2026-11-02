const express = require('express');
const path = require('path');
const { MongoClient, ObjectId } = require('mongodb');

const app = express();
const PORT = process.env.PORT || 3000;
const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost:27017/taskdb';

let tasks; // MongoDB collection
let dbReady = false;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Mongo start hone mein time leta hai, isliye retry karte hain
async function connectDB(retries = 15) {
  for (let i = 1; i <= retries; i++) {
    try {
      const client = new MongoClient(MONGO_URL, { serverSelectionTimeoutMS: 3000 });
      await client.connect();
      tasks = client.db().collection('tasks');
      dbReady = true;
      console.log('MongoDB connected');
      return;
    } catch (err) {
      console.log(`MongoDB connection failed (${i}/${retries}), retrying in 3s...`);
      await new Promise(r => setTimeout(r, 3000));
    }
  }
  console.error('Could not connect to MongoDB. Exiting.');
  process.exit(1);
}

// Health check
app.get('/health', (req, res) => {
  res.status(dbReady ? 200 : 503).json({
    status: dbReady ? 'ok' : 'starting',
    hostname: require('os').hostname(), // container ID
    env: process.env.NODE_ENV || 'development'
  });
});

app.get('/api/tasks', async (req, res) => {
  const list = await tasks.find().sort({ _id: -1 }).toArray();
  res.json(list);
});

app.post('/api/tasks', async (req, res) => {
  const title = (req.body.title || '').trim();
  if (!title) return res.status(400).json({ error: 'Title required' });
  const result = await tasks.insertOne({ title, done: false, createdAt: new Date() });
  res.status(201).json({ _id: result.insertedId, title, done: false });
});

app.patch('/api/tasks/:id', async (req, res) => {
  const task = await tasks.findOne({ _id: new ObjectId(req.params.id) });
  if (!task) return res.status(404).json({ error: 'Not found' });
  await tasks.updateOne({ _id: task._id }, { $set: { done: !task.done } });
  res.json({ ok: true });
});

app.delete('/api/tasks/:id', async (req, res) => {
  await tasks.deleteOne({ _id: new ObjectId(req.params.id) });
  res.json({ ok: true });
});

connectDB().then(() => {
  // 0.0.0.0 zaroori hai, warna container ke bahar se access nahi hoga
  app.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));
});
