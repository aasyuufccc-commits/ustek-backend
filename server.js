const express = require('express');
const axios = require('axios');
const { GoogleGenAI } = require('@google/genai');

const app = express();
// Mengizinkan payload besar (sampai 50MB) karena teks KAK bisa sangat panjang
app.use(express.json({ limit: '50mb' }));

const PORT = process.env.PORT || 3000;
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// ==========================================
// FUNGSI 1: Callback Laporan ke Google Apps Script
// ==========================================
async function callGASCallback(url, payload) {
  try {
    await axios.post(url, payload, {
      headers: {
        'x-api-key': process.env.GAS_CALLBACK_SECRET || 'PPKPRO_WEBHOOK_SECRET_2026',
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error(`❌ Gagal mengirim callback ke GAS: ${error.message}`);
  }
}

function estimateTokens(text) {
  return Math.ceil(text.length / 4);
}

// ==========================================
// FUNGSI 2: Eksekusi AI (Claude Utama -> Gemini Cadangan)
// ==========================================
async function callAIWithFallback(modelType, prompt) {
  try {
    // 🥇 OPSI UTAMA: CLAUDE
    // Sonnet untuk bab analisa berat, Haiku untuk bab ringan/jadwal
    const claudeModel = (modelType === 'sonnet') ? 'claude-3-5-sonnet-20241022' : 'claude-3-haiku-20240307';
    console.log(`[API] Mencoba Claude Utama: ${claudeModel}...`);
    
    const claudeResponse = await axios.post('https://api.anthropic.com/v1/messages', {
      model: claudeModel,
      max_tokens: 4000,
      temperature: 0.3,
      messages: [{ role: "user", content: prompt }]
    }, {
      headers: {
        'x-api-key': process.env.CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json'
      }
    });

    if (claudeResponse.data && claudeResponse.data.content) {
      return claudeResponse.data.content[0].text;
    } else {
      throw new Error("Respons Claude kosong");
    }

  } catch (claudeError) {
    console.warn(`⚠️ [API Warning] Claude gagal (${claudeError.message}). Mengalihkan ke Gemini (Fallback)...`);
    
    // 🥈 OPSI CADANGAN: GEMINI 
    try {
      const geminiModel = (modelType === 'sonnet') ? 'gemini-1.5-pro' : 'gemini-1.5-flash';
      console.log(`[API] Menggunakan Gemini Cadangan: ${geminiModel}...`);
      
      const geminiResponse = await ai.models.generateContent({
        model: geminiModel,
        contents: prompt,
      });

      // ⏱️ JEDA 5 DETIK: Penahan agar terhindar dari Error 429 Too Many Requests Google
      await new Promise(resolve => setTimeout(resolve, 5000));

      if (geminiResponse && geminiResponse.text) {
        return geminiResponse.text;
      } else {
        throw new Error("Respons Gemini kosong");
      }
      
    } catch (geminiError) {
      console.error(`❌ [Fatal Error] Claude DAN Gemini sama-sama gagal!`);
      throw new Error(`Sistem Failover Gagal. Error Akhir: ${geminiError.message}`);
    }
  }
}

// ==========================================
// FUNGSI 3: Pembentuk Prompt 10 Bab (Array Murni)
// ==========================================
function buildAllPrompts(kak, details, kakExtraction) {
  return [
    `Buat Eksekutif Summary (Bab 0) berdasarkan poin utama KAK ini:\n${kak}`,
    
    `Generate Bab 1.1 Pemahaman Atas Pekerjaan untuk:\nPekerjaan: ${details?.namaPaket || 'Konsultasi'}\nInstansi: ${details?.instansi || 'Pemerintah'}\nKAK:\n${kak}`,
    
    `Generate Bab 1.2 Metodologi & Quality Control yang detail berdasarkan ekstraksi KAK berikut:\n${kakExtraction}`,
    
    `Generate Bab 2 Rencana Kerja (2-3 halaman). Buat langkah-langkah sistematis.`,
    
    `Generate Bab 3 Jadwal Pelaksanaan Pekerjaan (2 halaman). Sertakan tabel rincian tahapan.`,
    
    `Generate Bab 4 Komposisi Tim dan Penugasan (2 halaman). Jelaskan role masing-masing tenaga ahli.`,
    
    `Generate Bab 5 Jadwal Penugasan Personil (2 halaman). Buat dalam format narasi tabel waktu (mandays).`,
    
    `Generate Bab 6 Kepatuhan Perpres Pengadaan Barang/Jasa (2 halaman).`,
    
    `Generate Bab 7 Asumsi dan Mitigasi Risiko (2 halaman) untuk kelancaran proyek.`,
    
    `Generate Bab 8 Kriteria Sukses dan Penutup (2 halaman).`
  ];
}

// ==========================================
// ENDPOINT UTAMA: POST /api/generate
// ==========================================
app.post('/api/generate', async (req, res) => {
  const { kak, details, callbackURL, jobID } = req.body;

  if (!kak || !callbackURL || !jobID) {
    return res.status(400).json({ error: 'Data tidak lengkap. Pastikan kak, callbackURL, dan jobID terisi.' });
  }

  // 1. LANGSUNG KIRIM STATUS 200 OK ke GAS agar tidak Timeout
  res.status(200).json({
    success: true,
    jobID: jobID,
    message: "Generation started in background via Claude/Gemini Fallback"
  });

  console.log(`[${jobID}] Memulai tugas pembuatan dokumen...`);

  // 2. PROSES LATAR BELAKANG DIMULAI
  try {
    // Ekstrak KAK terlebih dahulu
    console.log(`[${jobID}] Mengekstrak struktur KAK...`);
    const extractPrompt = `Ekstrak poin-poin paling krusial, tujuan, dan ruang lingkup dari KAK berikut:\n${kak}`;
    const kakExtraction = await callAIWithFallback('haiku', extractPrompt); // Gunakan Haiku/Flash agar cepat

    const prompts = buildAllPrompts(kak, details, kakExtraction);
    const sections = [];
    let progress = 10;

    // Looping Eksekusi Bab 0 sampai 9
    for (const [index, prompt] of prompts.entries()) {
      // Bab 0, 1, 2, dan 8 butuh analisis mendalam (Gunakan Sonnet/Pro)
      const modelType = [0, 1, 2, 8].includes(index) ? 'sonnet' : 'haiku';
      
      try {
        console.log(`[${jobID}] Memproses Bab ${index}...`);
        const content = await callAIWithFallback(modelType, prompt);
        
        sections.push({
          sectionId: index,
          content: content,
          tokensUsed: estimateTokens(content)
        });
        
        // Naikkan persentase & laporkan ke GAS
        progress += 8;
        console.log(`[${jobID}] Bab ${index} selesai.`);
        await callGASCallback(callbackURL, {
          jobID: jobID,
          status: 'progress',
          progress: progress,
          message: `Bab ${index} berhasil diselesaikan.`
        });

      } catch (sectionError) {
        console.error(`[${jobID}] Gagal di Bab ${index}:`, sectionError.message);
        // Tetap lanjut ke bab berikutnya walaupun ada yang error (Graceful Degradation)
      }
    }

    // 3. FINAL CALLBACK (Semua Bab Selesai, Kirim Hasil ke GAS)
    console.log(`[${jobID}] Seluruh dokumen selesai! Mengirim data ke Google Drive...`);
    await callGASCallback(callbackURL, {
      jobID: jobID,
      status: 'completed',
      progress: 100,
      result: { sections: sections }
    });

  } catch (globalError) {
    console.error(`[${jobID}] Terjadi Kesalahan Fatal:`, globalError.message);
    await callGASCallback(callbackURL, {
      jobID: jobID,
      status: 'error',
      message: `Proses terhenti: ${globalError.message}`
    });
  }
});

// ==========================================
// START SERVER
// ==========================================
app.listen(PORT, () => {
  console.log(`🚀 Server UstekPro berjalan di Port ${PORT}`);
});
