/**
 * Node.js Server for Railway - index.js
 */

const express = require('express');
const axios = require('axios');
const Anthropic = require('@anthropic-ai/sdk');
require('dotenv').config();

const app = express();
app.use(express.json());

const anthropic = new Anthropic({ apiKey: process.env.CLAUDE_API_KEY });
const GAS_CALLBACK_URL = process.env.GAS_CALLBACK_URL;

app.post('/generate', async (req, res) => {
  const payload = req.body;
  res.status(200).json({ status: "accepted" });

  try {
    console.log(`[${payload.paketId}] Memproses KAK...`);
    
    // Call 0: Extract
    const msg = await anthropic.messages.create({
      model: "claude-3-haiku-20240307",
      max_tokens: 1000,
      messages: [{ role: "user", content: `Analisis KAK berikut: ${payload.kakText}` }],
    });

    // Simulasi pengerjaan 10 Bab
    console.log(`[${payload.paketId}] Menghasilkan narasi Bab 1-10...`);
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Callback ke GAS
    await axios.post(GAS_CALLBACK_URL + "?action=railwayCallback", {
      paketId: payload.paketId,
      userEmail: payload.userEmail,
      status: "SELESAI"
    });
    console.log(`[${payload.paketId}] Selesai.`);

  } catch (error) {
    console.error("Error AI:", error.message);
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`UstekPro Service on port ${PORT}`));
