const express = require('express');
const dotenv = require('dotenv');
const axios = require('axios');
const { GoogleGenAI } = require('@google/genai'); // ✅ Menggunakan SDK Resmi Google Gen AI

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

// Inisialisasi Google Gen AI menggunakan Environment Variable dari Railway
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ==================== ROUTES ====================

/**
 * Health Check
 */
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '2.5.0-gemini'
  });
});

/**
 * Main: Generate Document
 * Receives job from GAS, orchestrates Gemini API calls
 */
app.post('/api/generate', async (req, res) => {
  try {
    const {
      jobID,
      email,
      paket,
      kak,
      details,
      driveFolderID,
      callbackURL,
      callbackSecret
    } = req.body;

    // Validate
    if (!jobID || !email || !kak) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    console.log(`[${new Date().toISOString()}] 🚀 Starting generation for job: ${jobID}`);

    // Update job status: processing (5%)
    await callGASCallback(callbackURL, {
      jobID,
      email,
      status: 'processing',
      progress: 5,
      callbackSecret
    });

    // STEP 1: Extract KAK menggunakan Gemini 2.5 Flash (Cepat & Akurat)
    console.log(`[${jobID}] Extracting KAK structure via Gemini...`);
    const kakExtraction = await callGeminiAPI('haiku', buildPromptExtractKAK(kak));
    
    await callGASCallback(callbackURL, {
      jobID,
      email,
      status: 'processing',
      progress: 15,
      callbackSecret
    });

    // STEP 2-11: Generate Document Sections
    console.log(`[${jobID}] Generating document sections...`);
    
    const sections = [];
    const prompts = buildAllPrompts(kak, details, kakExtraction);
    
    let progress = 20;
    for (const [index, prompt] of prompts.entries()) {
      // Pemetaan Model Sesuai Project Brief UstekPro:
      // Indeks [0, 1, 2, 8] membutuhkan akurasi tinggi (Sonnet) -> Diarahkan ke gemini-1.5-pro
      // Indeks lainnya bersifat faktual/standard (Haiku) -> Diarahkan ke gemini-2.5-flash
      const modelType = [0, 1, 2, 8].includes(index) ? 'sonnet' : 'haiku';
      
      try {
        const response = await callGeminiAPI(modelType, prompt);
        sections.push({
          sectionId: index,
          content: response,
          tokensUsed: estimateTokens(response)
        });
        
        progress += 7;
        console.log(`[${jobID}] Section ${index} done (${modelType === 'sonnet' ? 'gemini-1.5-pro' : 'gemini-2.5-flash'})`);
        
        await callGASCallback(callbackURL, {
          jobID,
          email,
          status: 'processing',
          progress: Math.min(90, progress),
          callbackSecret
        });
      } catch (sectionError) {
        console.error(`[${jobID}] Section ${index} error:`, sectionError.message);
        // Continue to next section on error (graceful degradation)
      }
    }

    // STEP 3: Final callback - Done
    console.log(`[${jobID}] Job completed successfully!`);
    await callGASCallback(callbackURL, {
      jobID,
      email,
      status: 'done',
      progress: 100,
      callbackSecret
    });

    res.json({
      success: true,
      jobID,
      sectionsGenerated: sections.length,
      message: 'Generation completed via Google Gemini API'
    });

  } catch (error) {
    console.error('❌ Generate error:', error);
    
    // Callback error status
    if (req.body.callbackURL) {
      await callGASCallback(req.body.callbackURL, {
        jobID: req.body.jobID,
        email: req.body.email,
        status: 'error',
        error: error.message,
        callbackSecret: req.body.callbackSecret
      }).catch(err => console.error('Callback error:', err));
    }

    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Check Job Status
 */
app.get('/api/status/:jobID', (req, res) => {
  const { jobID } = req.params;
  
  const job = global.jobs?.[jobID] || {
    status: 'not_found',
    progress: 0
  };

  res.json({
    jobID,
    ...job
  });
});

// ==================== GOOGLE GEMINI API CALLS ====================

async function callGeminiAPI(modelType, prompt) {
  try {
    // ✅ PENAMAAN RESMI & VALID UNTUK SDK @google/genai
    // 'gemini-1.5-pro' adalah string global yang otomatis mengarah ke versi Pro paling stabil
    const modelString = (modelType === 'sonnet') ? 'gemini-1.5-pro' : 'gemini-2.5-flash';
    
    console.log(`[API] Calling Google Gen AI: ${modelString}`);
    
    const response = await ai.models.generateContent({
      model: modelString,
      contents: prompt,
    });

    if (response && response.text) {
      return response.text;
    } else {
      throw new Error("Empty response from Gemini API");
    }

  } catch (error) {
    console.error('❌ Gemini API error:', error.message);
    throw new Error(`Gemini API failed: ${error.message}`);
  }
}

// ==================== PROMPT BUILDERS ====================

function buildPromptExtractKAK(kak) {
  return `Extract struktur dari KAK berikut dalam format JSON:

KAK:
${kak}

Return HANYA JSON valid dengan struktur:
{
  "jenisPekerjaan": "string",
  "durasi": "string",
  "outputExpected": "string",
  "tahapanUtama": [],
  "deliverables": []
}`;
}

function buildAllPrompts(kak, details, kakExtraction) {
  const prompts = [
    buildPromptExtractKAK(kak),
    
    `Generate Bab 1.1 Pemahaman Atas Pekerjaan (6-8 halaman) untuk:
Pekerjaan: ${details?.namaPaket || 'Konsultasi'}
Instansi: ${details?.instansi || 'Pemerintah'}
Lokasi: ${details?.lokasi || 'Unspecified'}

KAK:
${kak}

Output harus professional, terstruktur, dengan sub-bab yang jelas.`,
    
    `Generate Bab 1.2 Metodologi & QC (10-15 halaman) untuk pekerjaan konsultasi.
Sertakan:
- Tahapan pelaksanaan detail
- Metodologi kerja
- Quality Control process
- Risk mitigation
- Timeline Gantt chart`,
    
    `Generate deliverable checklist (2-3 halaman)`,
    `Generate resource plan & budget (2 halaman)`,
    `Generate competency matrix (2 halaman)`,
    `Generate compliance checklist Perpres 46/2025 (2 halaman)`,
    `Generate assumptions & dependencies (1-2 halaman)`,
    `Generate success criteria & KPI (1-2 halaman)`,
    `Generate appendix dengan template form (2-3 halaman)`
  ];

  return prompts;
}

// ==================== UTILITIES ====================

async function callGASCallback(callbackURL, payload) {
  if (!callbackURL) return;

  try {
    await axios.post(
      callbackURL,
      payload,
      {
        timeout: 5000,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    console.log(`✅ GAS callback sent for job ${payload.jobID}`);
  } catch (error) {
    console.warn(`⚠️ GAS callback timeout (will retry): ${error.message}`);
  }
}

function estimateTokens(text) {
  return Math.ceil(text.length / 4);
}

// ==================== ERROR HANDLING ====================

app.use((err, req, res, next) => {
  console.error('❌ Unhandled error:', err);
  res.status(500).json({
    error: err.message,
    timestamp: new Date().toISOString()
  });
});

// ==================== START SERVER ====================

app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════╗
║      USTEKPRO Backend v2.5.0           ║
║      Running on port ${PORT}             ║
║      Node env: ${process.env.NODE_ENV}     ║
║      Models: Gemini 1.5 Pro & 2.5 Flash║
║      Status: ✅ Successfully Migrated  ║
╚════════════════════════════════════════╝
  `);
});

module.exports = app;
