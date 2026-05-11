/**
 * PPKPRO - Railway Backend (Node.js)
 * 
 * SETUP:
 * 1. npm init -y
 * 2. npm install express dotenv axios
 * 3. Create .env dengan variables di bawah
 * 4. Push ke GitHub
 * 5. Connect ke Railway via dashboard
 * 6. Set environment variables di Railway
 * 7. Deploy
 */

// ==================== PACKAGE.JSON ====================
/**
{
  "name": "ppkpro-backend",
  "version": "1.0.0",
  "description": "PPKPro Railway Backend",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "node server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "dotenv": "^16.0.3",
    "axios": "^1.4.0"
  }
}
*/

// ==================== .ENV EXAMPLE ====================
/**
PORT=3000
NODE_ENV=production

# Claude API
CLAUDE_API_KEY=sk-ant-xxx

# Midtrans (Sandbox first, then production)
MIDTRANS_SERVER_KEY=Mid-server-xxx
MIDTRANS_CLIENT_KEY=Mid-client-xxx

# GAS Callback
GAS_CALLBACK_URL=https://script.google.com/macros/d/[SCRIPT_ID]/userweb
GAS_CALLBACK_SECRET=PPKPRO_WEBHOOK_SECRET_2026

# Google Drive API (optional, if saving directly from backend)
GOOGLE_SERVICE_ACCOUNT_KEY={}

# Logging
LOG_LEVEL=info
*/

// ==================== SERVER.JS ====================
const express = require('express');
const dotenv = require('dotenv');
const axios = require('axios');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

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
    version: '1.0.0'
  });
});

/**
 * Main: Generate Document
 * Receives job from GAS, orchestrates Claude API calls
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

    // Update job status: processing (0%)
    await callGASCallback(callbackURL, {
      jobID,
      email,
      status: 'processing',
      progress: 5,
      callbackSecret
    });

    // STEP 1: Extract KAK menggunakan Claude
    console.log(`[${jobID}] Extracting KAK structure...`);
    const kakExtraction = await callClaudeAPI('haiku', buildPromptExtractKAK(kak), 4000);
    await callGASCallback(callbackURL, {
      jobID,
      email,
      status: 'processing',
      progress: 15,
      callbackSecret
    });

    // STEP 2-11: Generate Document Sections
    console.log(`[${jobID}] Generating document sections (11 calls)...`);
    
    const sections = [];
    const prompts = buildAllPrompts(kak, details, kakExtraction);
    
    // Call 0: Haiku (extract)
    // Calls 1-2: Sonnet (complex sections)
    // Calls 3-10: Haiku (simpler sections)
    
    let progress = 20;
    for (const [index, prompt] of prompts.entries()) {
      const model = [0, 1, 2, 8].includes(index) ? 'sonnet' : 'haiku';
      const maxTokens = [0, 1, 2, 8].includes(index) ? 16000 : 8000;
      
      try {
        const response = await callClaudeAPI(model, prompt, maxTokens);
        sections.push({
          sectionId: index,
          content: response,
          tokensUsed: estimateTokens(response)
        });
        
        progress += 7;
        console.log(`[${jobID}] Section ${index} done (${model})`);
        
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

    // STEP 3: Convert to DOCX
    console.log(`[${jobID}] Converting to DOCX format...`);
    // TODO: Implement DOCX generation from Claude sections
    // For now, just create placeholder
    const docxBuffer = Buffer.from('Placeholder DOCX content');
    const driveLink = 'https://drive.google.com/file/d/placeholder/view'; // Will be replaced with actual upload

    // STEP 4: Final callback - Done
    console.log(`[${jobID}] Job completed successfully!`);
    await callGASCallback(callbackURL, {
      jobID,
      email,
      status: 'done',
      progress: 100,
      driveLink,
      callbackSecret
    });

    res.json({
      success: true,
      jobID,
      sectionsGenerated: sections.length,
      message: 'Generation started'
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
  
  // TODO: Query job status from database (in-memory for now)
  const job = global.jobs?.[jobID] || {
    status: 'not_found',
    progress: 0
  };

  res.json({
    jobID,
    ...job
  });
});

/**
 * Midtrans Payment Webhook (optional, implement if needed)
 */
app.post('/webhook/midtrans', (req, res) => {
  try {
    const {
      order_id,
      status_code,
      gross_amount,
      payment_type,
      transaction_status
    } = req.body;

    console.log(`[Midtrans] Order ${order_id}: ${transaction_status}`);

    // TODO: Verify signature
    // const hash = crypto.createHash('sha512')
    //   .update(order_id + status_code + gross_amount + MIDTRANS_KEY)
    //   .digest('hex');
    // if (hash !== req.query.signature) throw new Error('Invalid signature');

    // Update order status
    if (transaction_status === 'settlement') {
      // Call GAS to confirm payment
      console.log(`[Midtrans] Payment confirmed for ${order_id}`);
      // TODO: POST to GAS confirmPayment endpoint
    }

    res.json({ ok: true });

  } catch (error) {
    console.error('❌ Midtrans webhook error:', error);
    res.status(400).json({ error: error.message });
  }
});

// ==================== CLAUDE API CALLS ====================

async function callClaudeAPI(model, prompt, maxTokens) {
  try {
    const modelString = `claude-3-${model}-20240229`;
    
    const response = await axios.post(
      'https://api.anthropic.com/v1/messages',
      {
        model: modelString,
        max_tokens: maxTokens,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      },
      {
        headers: {
          'x-api-key': process.env.CLAUDE_API_KEY,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json'
        }
      }
    );

    return response.data.content[0]?.text || '';

  } catch (error) {
    console.error('❌ Claude API error:', error.response?.data || error.message);
    throw new Error(`Claude API failed: ${error.message}`);
  }
}

// ==================== PROMPT BUILDERS ====================

function buildPromptExtractKAK(kak) {
  return `
Extract struktur dari KAK berikut dalam format JSON:

KAK:
${kak}

Return HANYA JSON valid dengan struktur:
{
  "jenisPekerjaan": "string (DED/Pengawasan/Lainnya)",
  "durasi": "string (timeline pelaksanaan)",
  "outputExpected": "string (hasil yang diharapkan)",
  "tahapanUtama": ["array of main phases"],
  "deliverables": ["array of specific outputs"]
}
`;
}

function buildAllPrompts(kak, details, kakExtraction) {
  /**
   * Build 11 prompts untuk 11 Claude calls
   * Ini adalah template dasar - customize sesuai kebutuhan
   */
  
  const prompts = [
    // Call 0: Extract KAK (already done, return cached)
    buildPromptExtractKAK(kak),
    
    // Call 1: Bab 1.1 Pemahaman (Sonnet)
    `Generate Bab 1.1 Pemahaman Atas Pekerjaan (6-8 halaman) untuk:
     
Pekerjaan: ${details.namaPaket}
Instansi: ${details.instansi}
Lokasi: ${details.lokasi}

KAK:
${kak}

Output harus professional, terstruktur, dengan sub-bab yang jelas. Format: Markdown atau plain text dengan heading yang jelas.`,
    
    // Call 2: Bab 1.2 Metodologi (Sonnet)
    `Generate Bab 1.2 Metodologi & QC (10-15 halaman) untuk pekerjaan konsultasi dengan KAK di atas.
    
Sertakan:
- Tahapan pelaksanaan detail
- Metodologi kerja
- Quality Control process
- Risk mitigation
- Timeline Gantt chart
`,
    
    // Calls 3-10: Simpler sections (Haiku)
    `Generate ringkas deliverable checklist untuk pekerjaan ini (2-3 halaman)`,
    `Generate resource plan & budget allocation (2 halaman)`,
    `Generate team competency matrix (2 halaman)`,
    `Generate compliance checklist dengan Perpres 46/2025 (2 halaman)`,
    `Generate assumptions & dependencies (1-2 halaman)`,
    `Generate success criteria & KPI (1-2 halaman)`,
    `Generate appendix dengan template form yang diperlukan (2-3 halaman)`,
  ];

  return prompts;
}

// ==================== UTILITIES ====================

async function callGASCallback(callbackURL, payload) {
  /**
   * Call GAS webhook untuk update job status
   */
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
    // Log but don't fail - GAS will retry via polling
    console.warn(`⚠️ GAS callback timeout (will retry): ${error.message}`);
  }
}

function estimateTokens(text) {
  // Rough estimate: 1 token ≈ 4 characters
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
║     PPKPRO Backend v1.0.0              ║
║     Running on port ${PORT}              ║
║     Node env: ${process.env.NODE_ENV}     ║
╚════════════════════════════════════════╝
  `);
});

module.exports = app;
