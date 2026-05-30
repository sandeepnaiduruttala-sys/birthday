require('dotenv').config();

const path = require('path');
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const Birthday = require('./models/Birthday');

const app = express();

const PORT = process.env.PORT || 8080;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/birthday_app';

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Serve existing front-end
app.use(express.static(path.join(__dirname, '.')));

app.get('/api/health', (req, res) => {
  res.json({ ok: true });
});

// Fetch config (default doc)
app.get('/api/config/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const doc = await Birthday.findOne({ configId: id }).lean();
    if (!doc) {
      return res.json({
        configId: id,
        name: '',
        age: 0,
        photos: Array.from({ length: 6 }, () => ({ dataUrl: null, caption: '' }))
      });
    }

    res.json({
      configId: doc.configId,
      name: doc.name,
      age: doc.age,
      photos: (doc.photos || []).slice(0, 6).map(p => ({
        dataUrl: p.dataUrl ?? null,
        caption: p.caption ?? ''
      }))
    });
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch config' });
  }
});

// Upsert config
app.post('/api/config/:id', async (req, res) => {
  const { id } = req.params;
  const { name, age, photos } = req.body || {};

  try {
    const safeName = typeof name === 'string' ? name : '';
    const safeAge = Number.isFinite(Number(age)) ? Math.max(0, Math.floor(Number(age))) : 0;

    let safePhotos = Array.from({ length: 6 }, () => ({ dataUrl: null, caption: '' }));
    if (Array.isArray(photos)) {
      safePhotos = Array.from({ length: 6 }, (_, idx) => {
        const p = photos[idx] || {};
        return {
          dataUrl: typeof p.dataUrl === 'string' ? p.dataUrl : null,
          caption: typeof p.caption === 'string' ? p.caption : ''
        };
      });
    }

    const updated = await Birthday.findOneAndUpdate(
      { configId: id },
      { $set: { name: safeName, age: safeAge, photos: safePhotos } },
      { upsert: true, new: true }
    ).lean();

    res.json({
      ok: true,
      configId: updated.configId,
      name: updated.name,
      age: updated.age,
      photos: updated.photos
    });
  } catch (e) {
    res.status(500).json({ error: 'Failed to save config' });
  }
});

async function main() {
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB');

const host = process.env.HOST || '0.0.0.0';

app.listen(PORT, host, () => {
    console.log(`Server listening on http://${host}:${PORT}`);
    console.log(`PORT env: ${process.env.PORT || '(not set)'}`);
    console.log(`HOST env: ${process.env.HOST || '(not set)'}`);
    console.log(`Connected to MongoDB (uri set: ${MONGODB_URI ? 'yes' : 'no'})`);
  });
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});

