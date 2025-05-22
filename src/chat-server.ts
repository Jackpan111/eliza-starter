import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

// Serwowanie statycznych plików (np. index.html)
app.use(express.static(path.join(__dirname, '..')));

// Endpoint GET / – zwraca index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'index.html'));
});

// Endpoint POST /chat – odbiera wiadomość i odsyła odpowiedź
app.post('/chat', async (req, res) => {
  const userMessage = req.body.message;

  // Tymczasowa odpowiedź (tu w przyszłości pojawi się Eliza)
  const response = `You said: "${userMessage}", I heard you!`;

  res.json({ response });
});

// Start serwera
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`💬 Chat server is running at http://localhost:${PORT}`);
});
