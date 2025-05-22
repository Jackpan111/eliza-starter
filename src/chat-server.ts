import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { character } from './character.js';
import { DirectClient } from '@elizaos/client-direct';
import { AgentRuntime, elizaLogger, stringToUuid, type Character } from '@elizaos/core';
import { bootstrapPlugin } from '@elizaos/plugin-bootstrap';
import { createNodePlugin } from '@elizaos/plugin-node';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, '..')));

let runtime: AgentRuntime;

async function setupEliza() {
  const client = new DirectClient();
  character.id = stringToUuid(character.name);
  runtime = new AgentRuntime({
    databaseAdapter: undefined,
    token: process.env.OPENAI_API_KEY || '',
    modelProvider: character.modelProvider,
    character,
    plugins: [bootstrapPlugin, createNodePlugin()],
    providers: [],
    actions: [],
    services: [],
    managers: [],
    cacheManager: undefined,
  });

  await runtime.initialize();
  client.registerAgent(runtime);
}

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'index.html'));
});

app.post('/chat', async (req, res) => {
  const userMessage = req.body.message;

  if (!runtime) {
    res.status(500).send('Agent not ready');
    return;
  }

  const reply = await runtime.runOnce({ input: userMessage });
  res.json({ response: reply });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, async () => {
  await setupEliza();
  console.log(`💬 Eliza Chat is live at http://localhost:${PORT}`);
});
