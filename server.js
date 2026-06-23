/**
 * SERVER.JS v3.0
 * UstekPro/PPKPro Backend - Proposal Teknis Generator
 * Structure: 6 BAB (DED & Pengawasan Konstruksi)
 * Total: 14 API calls per jenis layanan
 * 
 * CHANGELOG v3.0:
 * - Rebuild clean untuk 6 bab struktur (bukan 10 bab)
 * - Conditional logic DED vs Pengawasan
 * - Import prompts.js untuk template management
 * - Accept personel array dari frontend
 * - Pass folderID ke callback (fix file location issue)
 * - 14 API calls optimized (3 Sonnet, 11 Haiku)
 */

const express = require('express');
const axios = require('axios');
const Anthropic = require('@anthropic-ai/sdk').default;
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { buildProposalTeknis } = require('./lib/docxBuilder');
const promptLibrary = require('./lib/prompts');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '50mb' }));

const CONFIG = {
  CLAUDE_API_KEY: process.env.CLAUDE_API_KEY,
  GEMINI_API_KEY: process.env.GEMINI_API_KEY,
};

const anthropic = new Anthropic({ apiKey: CONFIG.CLAUDE_API_KEY });

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Generate final prompt by replacing placeholders
 */
function generateFinalPrompt(templatePrompt, kakText, personel, durasi) {
  const personelString = personel
    .map((p) => `- ${p.nama} (${p.posisi}, ${p.durasi} OB${p.sertifikasi ? ', ' + p.sertifikasi : ''})`)
    .join('\n');

  let finalPrompt = templatePrompt
    .replace('[KAK_TEXT]', kakText)
    .replace('[PERSONEL_LIST]', personelString)
    .replace('[DURASI]', durasi);

  return finalPrompt;
}

/**
 * Call Claude API dengan fallback ke Gemini
 */
async function callClaudeAPI(prompt, model = 'claude-sonnet-4-6') {
  try {
    console.log(`[API] Calling ${model}...`);
    const message = await anthropic.messages.create({
      model: model,
      max_tokens: model === 'claude-sonnet-4-6' ? 2000 : 1500,
      messages: [{ role: 'user', content: prompt }],
    });

    const responseText = message.content[0]?.text || '';
    const tokens = message.usage.input_tokens + message.usage.output_tokens;
    console.log(`[API] ✓ ${model} (${tokens} tokens)`);
    return responseText;
  } catch (error) {
    console.error(`[API] Claude error: ${error.message}, fallback to Gemini...`);
    return await callGeminiAPI(prompt);
  }
}

/**
 * Fallback ke Gemini API
 */
async function callGeminiAPI(prompt) {
  try {
    console.log('[API] Calling Gemini 2.5 Pro (fallback)...');
    const genAI = new GoogleGenerativeAI(CONFIG.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-pro' });
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    console.log('[API] ✓ Gemini fallback success');
    return responseText;
  } catch (error) {
    console.error(`[API] Gemini fallback error: ${error.message}`);
    throw new Error('All AI providers failed');
  }
}

/**
 * Call GAS callback untuk save file ke Drive
 */
async function callGASCallback(callbackURL, data) {
  try {
    const response = await axios.post(callbackURL, data, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 30000,
    });
    console.log(`[CALLBACK] ✓ Status ${response.status}: File saved to Drive`);
    return response.data;
  } catch (error) {
    console.error(`[CALLBACK] ✗ Error: ${error.message}`);
    throw error;
  }
}

// ============================================================================
// MAIN GENERATION FUNCTION
// ============================================================================

async function generateProposalTeknis(jobData) {
  const { jobID, jenisLayanan, kak, details, personel, callbackURL, driveFolderID } = jobData;

  console.log(`\n${'='.repeat(80)}`);
  console.log(`[JOB ${jobID}] GENERATE ${jenisLayanan.toUpperCase()} PROPOSAL`);
  console.log(`${'='.repeat(80)}\n`);

  const babResponses = {};
  const durasi = details.durasi || 6;

  try {
    // ========== BAB 1: PEMAHAMAN ATAS JASA LAYANAN DALAM KAK ==========
    console.log('[BAB 1] Pemahaman Atas Jasa Layanan...');

    const prompt1_1 = generateFinalPrompt(
      promptLibrary[jenisLayanan]['1.1'].instructions,
      kak,
      personel,
      durasi
    );
    babResponses['1.1'] = await callClaudeAPI(prompt1_1, 'claude-sonnet-4-6');

    const prompt1_2 = generateFinalPrompt(
      promptLibrary[jenisLayanan]['1.2'].instructions,
      kak,
      personel,
      durasi
    );
    babResponses['1.2'] = await callClaudeAPI(prompt1_2, 'claude-sonnet-4-6');

    const prompt1_3 = generateFinalPrompt(
      promptLibrary[jenisLayanan]['1.3'].instructions,
      kak,
      personel,
      durasi
    );
    babResponses['1.3'] = await callClaudeAPI(prompt1_3, 'claude-haiku-4-5');

    const prompt1_4 = generateFinalPrompt(
      promptLibrary[jenisLayanan]['1.4'].instructions,
      kak,
      personel,
      durasi
    );
    babResponses['1.4'] = await callClaudeAPI(prompt1_4, 'claude-haiku-4-5');

    // ========== BAB 2: PENDEKATAN DAN METODOLOGI ==========
    console.log('[BAB 2] Pendekatan dan Metodologi...');

    const prompt2_1 = generateFinalPrompt(
      promptLibrary[jenisLayanan]['2.1'].instructions,
      kak,
      personel,
      durasi
    );
    babResponses['2.1'] = await callClaudeAPI(prompt2_1, 'claude-sonnet-4-6');

    const prompt2_2 = generateFinalPrompt(
      promptLibrary[jenisLayanan]['2.2'].instructions,
      kak,
      personel,
      durasi
    );
    babResponses['2.2'] = await callClaudeAPI(prompt2_2, 'claude-sonnet-4-6');

    const prompt2_3 = generateFinalPrompt(
      promptLibrary[jenisLayanan]['2.3'].instructions,
      kak,
      personel,
      durasi
    );
    babResponses['2.3'] = await callClaudeAPI(prompt2_3, 'claude-haiku-4-5');

    // ========== BAB 3: PROGRAM KERJA ==========
    console.log('[BAB 3] Program Kerja...');

    const prompt3_1 = generateFinalPrompt(
      promptLibrary[jenisLayanan]['3.1'].instructions,
      kak,
      personel,
      durasi
    );
    babResponses['3.1'] = await callClaudeAPI(prompt3_1, 'claude-haiku-4-5');

    // 3.2 Gantt Chart - placeholder (no API call)
    babResponses['3.2'] = `
[GANTT CHART PLACEHOLDER]

Masukkan Gantt Chart jadwal ${durasi} bulan dengan milestone di sini.

Format: Tabel atau diagram batang
Struktur: Bulan 1-${durasi}, Fase utama, Kegiatan kunci, Milestone

Contoh format:
| KEGIATAN          | M1 | M2 | M3 | M4 | M5 | M6 |
|---|---|---|---|---|---|---|
| Persiapan         | === |    |    |    |    |    |
| Design Konsep     |    | ========== |    |    |    |
| Detail Design     |    |    | ========== |    |    |
| Finalisasi        |    |    |    | === |    |    |
| Serah-Terima      |    |    |    |    | === |    |
`;

    const prompt3_3 = generateFinalPrompt(
      promptLibrary[jenisLayanan]['3.3'].instructions,
      kak,
      personel,
      durasi
    );
    babResponses['3.3'] = await callClaudeAPI(prompt3_3, 'claude-haiku-4-5');

    // ========== BAB 4: ORGANISASI DAN PERSONEL ==========
    console.log('[BAB 4] Organisasi dan Personel...');

    // 4.1 Bagan Organisasi - placeholder
    babResponses['4.1'] = `
[BAGAN ORGANISASI PLACEHOLDER]

Masukkan bagan struktur organisasi tim di sini.

Format: Diagram hierarki dengan kotak dan garis penghubung

Contoh struktur:

                    TEAM LEADER
           /            |            \\
        AHLI          AHLI          AHLI        AHLI K3
      STRUKTUR      ARSITEK         MEP

Personel dalam tim:
${personel.map((p) => `- ${p.nama} (${p.posisi})`).join('\n')}
`;

    const prompt4_2 = generateFinalPrompt(
      promptLibrary[jenisLayanan]['4.2'].instructions,
      kak,
      personel,
      durasi
    );
    babResponses['4.2'] = await callClaudeAPI(prompt4_2, 'claude-haiku-4-5');

    const prompt4_3 = generateFinalPrompt(
      promptLibrary[jenisLayanan]['4.3'].instructions,
      kak,
      personel,
      durasi
    );
    babResponses['4.3'] = await callClaudeAPI(prompt4_3, 'claude-haiku-4-5');

    // ========== BAB 5: PENYAJIAN HASIL KERJA ==========
    console.log('[BAB 5] Penyajian Hasil Kerja...');

    const prompt5_0 = generateFinalPrompt(
      promptLibrary[jenisLayanan]['5.0'].instructions,
      kak,
      personel,
      durasi
    );
    babResponses['5.0'] = await callClaudeAPI(prompt5_0, 'claude-haiku-4-5');

    // ========== BAB 6: GAGASAN BARU DAN INOVASI ==========
    console.log('[BAB 6] Gagasan Baru dan Inovasi...');

    const prompt6_1 = generateFinalPrompt(
      promptLibrary[jenisLayanan]['6.1'].instructions,
      kak,
      personel,
      durasi
    );
    babResponses['6.1'] = await callClaudeAPI(prompt6_1, 'claude-haiku-4-5');

    // ========== BUILD DOCX ==========
    console.log('[DOCX] Building proposal document...');

    const docxBuffer = await buildProposalTeknis({
      jenisLayanan,
      details,
      personel,
      babResponses,
    });

    const docxBase64 = docxBuffer.toString('base64');

    // ========== CALLBACK KE GAS ==========
    console.log('[CALLBACK] Sending to GAS for Drive save...');

    await callGASCallback(callbackURL, {
      jobID,
      docxBase64,
      folderID: driveFolderID || '',
      filename: `Proposal_Teknis_${jenisLayanan}_${jobID}.docx`,
    });

    console.log(`\n[JOB ${jobID}] ✅ COMPLETE\n`);

    return {
      success: true,
      jobID,
      message: `Proposal Teknis ${jenisLayanan} berhasil dibuat`,
      fileSize: docxBase64.length,
    };
  } catch (error) {
    console.error(`\n[JOB ${jobID}] ✗ ERROR: ${error.message}\n`);

    return {
      success: false,
      jobID,
      error: error.message,
    };
  }
}

// ============================================================================
// API ENDPOINTS
// ============================================================================

app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    version: '3.0',
    timestamp: new Date().toISOString(),
  });
});

/**
 * Main generate endpoint
 * Body:
 * {
 *   jobID: string,
 *   jenisLayanan: "DED" | "Pengawasan",
 *   kak: string,
 *   details: { durasi, ... },
 *   personel: [{nama, posisi, durasi, sertifikasi}, ...],
 *   callbackURL: string,
 *   driveFolderID: string
 * }
 */
app.post('/api/generate', async (req, res) => {
  const jobData = req.body;
  const { jobID, jenisLayanan } = jobData;

  console.log(`[${jobID}] Request received for ${jenisLayanan}`);

  if (!jobID || !jenisLayanan || !jobData.kak || !jobData.personel) {
    return res.status(400).json({
      error: 'Missing required fields',
    });
  }

  if (!['DED', 'Pengawasan'].includes(jenisLayanan)) {
    return res.status(400).json({
      error: 'jenisLayanan must be "DED" or "Pengawasan"',
    });
  }

  res.status(200).json({
    success: true,
    jobID,
    message: 'Generation started in background',
  });

  // Process async
  (async () => {
    await generateProposalTeknis(jobData);
  })();
});

app.get('/api/status/:jobID', (req, res) => {
  const { jobID } = req.params;
  res.status(200).json({
    jobID,
    status: 'generating',
    progress: 50,
  });
});

// ============================================================================
// START SERVER
// ============================================================================

// Memastikan port dan host terkonfigurasi dengan benar untuk cloud environment
app.listen(PORT, '0.0.0.0', () => {
  console.log(`
╔════════════════════════════════════════════════════════════════╗
║      UstekPro Backend v3.0 - Proposal Teknis Generator         ║
║  Jasa Konsultansi Konstruksi: DED & Pengawasan                 ║
╚════════════════════════════════════════════════════════════════╝

📍 Server: http://0.0.0.0:${PORT}
🔐 API Key: ${CONFIG.CLAUDE_API_KEY ? '✅' : '❌'}
📚 Structure: 6 BAB (14 API calls)
📊 Total prompts: 28 (14 DED + 14 Pengawasan)

Endpoints:
  POST /api/generate
  GET  /api/health
  GET  /api/status/:jobID

${new Date().toISOString()}
  `);
});

module.exports = app;
