const express = require('express');
const axios = require('axios');
const { buildBabDocx } = require('./lib/docxBuilder');
const { kirimBabKeGAS } = require('./lib/gasCallback');

const app = express();
app.use(express.json({ limit: '50mb' }));

const PORT = process.env.PORT || 8080;
const GAS_CALLBACK_URL = process.env.GAS_CALLBACK_URL || '';

// Job tracking
const jobStatus = {};

// ==========================================
// FUNGSI 1: Callback Laporan ke Google Apps Script
// ==========================================
async function callGASCallback(url, payload) {
  try {
    console.log(`📤 [CALLBACK] Sending to: ${url.substring(0, 80)}...`);
    
    const response = await axios.post(url, payload, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });
    
    console.log(`✅ [CALLBACK] Status ${response.status}: Berhasil!`);
    return true;
  } catch (error) {
    console.error(`❌ [CALLBACK] GAGAL: ${error.message}`);
    return false;
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
    const claudeModel = (modelType === 'sonnet') 
      ? 'claude-sonnet-4-20250514' 
      : 'claude-3-5-haiku-20241022';
    
    console.log(`[API] Mencoba Claude Utama: ${claudeModel}...`);
    
    const claudeResponse = await axios.post(
      'https://api.anthropic.com/v1/messages',
      {
        model: claudeModel,
        max_tokens: 4000,
        temperature: 0.3,
        messages: [{ role: "user", content: prompt }]
      },
      {
        headers: {
          'x-api-key': process.env.CLAUDE_API_KEY,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json'
        }
      }
    );

    if (claudeResponse.data && claudeResponse.data.content && claudeResponse.data.content.length > 0) {
      console.log(`✅ Claude berhasil generate (${estimateTokens(claudeResponse.data.content[0].text)} tokens)`);
      return claudeResponse.data.content[0].text;
    } else {
      throw new Error("Respons Claude kosong");
    }

  } catch (claudeError) {
    console.warn(`⚠️ Claude gagal (${claudeError.message}). Mengalihkan ke Gemini...`);
    
    // 🥈 OPSI CADANGAN: GEMINI
    try {
      const geminiModel = (modelType === 'sonnet') 
        ? 'gemini-2.5-pro' 
        : 'gemini-2.5-flash';
      
      console.log(`[API] Menggunakan Gemini Cadangan: ${geminiModel}...`);
      
      const geminiResponse = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${process.env.GEMINI_API_KEY}`,
        {
          contents: [
            {
              parts: [
                {
                  text: prompt
                }
              ]
            }
          ]
        },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      const geminiText = geminiResponse.data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
      
      if (geminiText) {
        console.log(`✅ Gemini berhasil generate (${estimateTokens(geminiText)} tokens)`);
        return geminiText;
      } else {
        throw new Error("Respons Gemini kosong");
      }
      
    } catch (geminiError) {
      console.error(`❌ Claude DAN Gemini sama-sama gagal!`);
      throw new Error(`Sistem Failover Gagal: ${geminiError.message}`);
    }
  }
}

// ==========================================
// FUNGSI 3: Pembentuk Prompt 10 Bab
// ==========================================
function buildAllPrompts(kak, details, kakExtraction) {
  return [
    `Buat Eksekutif Summary (Bab 0) berdasarkan poin utama KAK ini:\n${kak}`,
    
    `Generate Bab 1.1 Pemahaman Atas Pekerjaan untuk:\nPekerjaan: ${details?.namaPaket || 'Konsultasi'}\nInstansi: ${details?.instansi || 'Pemerintah'}\nLokasi: ${details?.lokasi || 'Unspecified'}\nKAK:\n${kak}`,
    
    `Generate Bab 1.2 Metodologi & Quality Control yang detail (10-15 halaman) berdasarkan ekstraksi KAK berikut:\n${kakExtraction}\n\nSertakan: Tahapan pelaksanaan, Metodologi kerja, QC process, Risk mitigation, Timeline Gantt.`,
    
    `Generate Bab 2 Rencana Kerja (2-3 halaman). Buat langkah-langkah sistematis dan terstruktur.`,
    
    `Generate Bab 3 Jadwal Pelaksanaan Pekerjaan (2 halaman). Sertakan tabel rincian tahapan dengan durasi.`,
    
    `Generate Bab 4 Komposisi Tim dan Penugasan (2 halaman). Jelaskan role masing-masing tenaga ahli.`,
    
    `Generate Bab 5 Jadwal Penugasan Personil (2 halaman). Buat dalam format narasi tabel waktu (mandays per bulan).`,
    
    `Generate Bab 6 Kepatuhan Perpres Pengadaan Barang/Jasa (2 halaman). Fokus pada compliance & regulatory.`,
    
    `Generate Bab 7 Asumsi dan Mitigasi Risiko (2 halaman) untuk kelancaran proyek. Identifikasi risiko utama & solusi.`,
    
    `Generate Bab 8 Kriteria Sukses, KPI, dan Penutup (2 halaman). Bagaimana mengukur kesuksesan proyek.`
  ];
}

// ==========================================
// HEALTH CHECK ENDPOINT
// ==========================================
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '2.2.0',
    ai_primary: 'Claude',
    ai_fallback: 'Gemini',
    gas_callback: GAS_CALLBACK_URL ? 'configured' : 'NOT configured'
  });
});

// ==========================================
// STATUS ENDPOINT
// ==========================================
app.get('/api/status/:jobID', (req, res) => {
  const status = jobStatus[req.params.jobID];
  if (!status) {
    return res.json({
      jobID: req.params.jobID,
      status: 'not_found',
      message: 'Job tidak ditemukan'
    });
  }
  res.json(status);
});

// ==========================================
// ENDPOINT UTAMA: POST /api/generate
// ==========================================
app.post('/api/generate', async (req, res) => {
  const { jobID, kak, details, callbackURL } = req.body;

  if (!jobID || !kak || !callbackURL) {
    return res.status(400).json({ 
      error: 'Data tidak lengkap. Pastikan jobID, kak, dan callbackURL terisi.' 
    });
  }

  // 1. LANGSUNG KIRIM STATUS 200 OK
  res.status(200).json({
    success: true,
    jobID: jobID,
    message: "Generation started in background"
  });

  console.log(`\n[${jobID}] 🚀 Memulai tugas pembuatan dokumen...`);

  // Initialize status
  jobStatus[jobID] = {
    jobID: jobID,
    status: 'processing',
    progress: 0,
    bahs: []
  };

  // 2. PROSES LATAR BELAKANG (Tidak menunggu response)
  (async () => {
    try {
      // Ekstrak KAK terlebih dahulu
      console.log(`[${jobID}] 📖 Mengekstrak struktur KAK...`);
      const extractPrompt = `Ekstrak poin-poin paling krusial, tujuan, ruang lingkup, dan deliverables dari KAK berikut:\n${kak}`;
      const kakExtraction = await callAIWithFallback('haiku', extractPrompt);

      jobStatus[jobID].progress = 5;
      jobStatus[jobID].status = 'extracting';

      // Kirim callback progress awal
      await callGASCallback(callbackURL, {
        jobID: jobID,
        status: 'progress',
        progress: 5,
        message: 'Ekstraksi KAK selesai, mulai generate 10 bab...'
      });

      const prompts = buildAllPrompts(kak, details, kakExtraction);
      let progress = 10;

      // Looping Eksekusi Bab 0 sampai 9
      for (const [index, prompt] of prompts.entries()) {
        // Bab 0, 1, 2, dan 8 butuh analisis mendalam (Gunakan Sonnet/Pro)
        const modelType = [0, 1, 2, 8].includes(index) ? 'sonnet' : 'haiku';
        
        try {
          console.log(`[${jobID}] 📝 Memproses Bab ${index} (${modelType})...`);
          jobStatus[jobID].status = 'generating';
          jobStatus[jobID].currentBab = index;

          const content = await callAIWithFallback(modelType, prompt);
          
          // Build DOCX
          console.log(`[${jobID}] 🔨 Building DOCX for Bab ${index}...`);
          const docxBuffer = await buildBabDocx(
            { num: index, nama: `Bab ${index}` },
            content,
            details
          );
          const docxBase64 = docxBuffer.toString('base64');

          // Kirim ke GAS
          await callGASCallback(callbackURL, {
            jobID: jobID,
            status: 'progress',
            progress: progress,
            message: `Bab ${index} berhasil di-generate`,
            babNum: index,
            babNama: `Bab ${index}`,
            docxBase64: docxBase64
          });

          jobStatus[jobID].bahs.push({
            num: index,
            status: 'done',
            tokens: estimateTokens(content)
          });

          progress += 8;
          console.log(`[${jobID}] ✅ Bab ${index} selesai (${estimateTokens(content)} tokens).`);

        } catch (sectionError) {
          console.error(`[${jobID}] ❌ Gagal di Bab ${index}: ${sectionError.message}`);
          jobStatus[jobID].bahs.push({
            num: index,
            status: 'error',
            error: sectionError.message
          });
          
          // Kirim error callback tapi continue ke bab berikutnya
          await callGASCallback(callbackURL, {
            jobID: jobID,
            status: 'progress',
            progress: progress,
            message: `⚠️ Bab ${index} error, lanjut ke bab berikutnya`
          });
        }
      }

      // 3. FINAL CALLBACK
      console.log(`[${jobID}] ✨ Seluruh dokumen selesai!`);
      
      jobStatus[jobID].status = 'completed';
      jobStatus[jobID].progress = 100;

      await callGASCallback(callbackURL, {
        jobID: jobID,
        status: 'completed',
        progress: 100,
        message: 'Semua 10 bab berhasil di-generate!',
        completedAt: new Date().toISOString()
      });

      console.log(`[${jobID}] 🎉 SELESAI! Document generation completed successfully.\n`);

    } catch (globalError) {
      console.error(`[${jobID}] 💥 Terjadi Kesalahan Fatal: ${globalError.message}`);
      
      jobStatus[jobID].status = 'error';
      jobStatus[jobID].error = globalError.message;

      await callGASCallback(callbackURL, {
        jobID: jobID,
        status: 'error',
        progress: -1,
        message: `Proses terhenti: ${globalError.message}`
      });
    }
  })();
});

// ==========================================
// ERROR HANDLING
// ==========================================
app.use((err, req, res, next) => {
  console.error('❌ Unhandled error:', err);
  res.status(500).json({
    error: err.message,
    timestamp: new Date().toISOString()
  });
});

// ==========================================
// START SERVER
// ==========================================
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════╗
║     USTEKPRO Backend v2.2.0            ║
║     Running on port ${PORT}              ║
║     AI: Claude (Primary)              ║
║     Fallback: Gemini                   ║
║     DOCX Builder: Enabled              ║
║     Status: ✅ Ready                   ║
╚════════════════════════════════════════╝
  `);
});

module.exports = app;
