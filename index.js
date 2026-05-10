const express = require('express');
const Anthropic = require('@anthropic-ai/sdk');
const axios = require('axios');
const app = express();

app.use(express.json());

const anthropic = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY, // Disimpan di Variables Railway
});

// Endpoint yang dipanggil oleh GAS
app.post('/generate-ustek', async (req, res) => {
  const { paketId, folderId, data } = req.body;

  // 1. Kirim respon cepat ke GAS agar tidak timeout
  res.status(200).json({ message: "Proses dimulai di background" });

  try {
    // 2. Jalankan proses berantai (11 kali panggil Claude sesuai dokumen MD)
    console.log(`Memulai pengerjaan Paket: ${paketId}`);
    
    // Contoh Call 1: Ekstrak KAK
    const kakSummary = await callClaude("Haiku", `Ekstrak poin penting dari KAK ini: ${data.kakText}`);
    
    // Contoh Call 2: Generate Bab 1.1 (Pemahaman KAK) - Gunakan Sonnet
    const bab1_1 = await callClaude("Sonnet", `Buat narasi Bab Pemahaman KAK untuk paket ${data.namaPaket}...`);

    // 3. Setelah semua bab selesai, kirim data kembali ke GAS 
    // atau simpan langsung ke Google Drive melalui API
    await notifyGASComplete(paketId, "Selesai");

  } catch (error) {
    console.error("Error:", error);
  }
});

// Fungsi pembantu untuk memanggil Claude
async function callClaude(modelType, prompt) {
  const model = modelType === "Sonnet" ? "claude-3-sonnet-20240229" : "claude-3-haiku-20240307";
  const response = await anthropic.messages.create({
    model: model,
    max_tokens: 4000,
    messages: [{ role: "user", content: prompt }],
  });
  return response.content[0].text;
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server UstekPro running on port ${PORT}`));
