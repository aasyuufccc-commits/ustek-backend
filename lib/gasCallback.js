const axios = require('axios');

/**
 * Kirim Bab (base64 docx) ke GAS untuk disimpan ke Google Drive
 * @param {string} gasUrl - GAS Web App URL
 * @param {string} paketId - Job/Paket ID
 * @param {number} babNum - Nomor bab (0-10)
 * @param {string} babNama - Nama bab (e.g., "Pemahaman Pekerjaan")
 * @param {string} docxBase64 - DOCX file as base64 string
 * @returns {Promise<boolean>} - Success or failure
 */
async function kirimBabKeGAS(gasUrl, paketId, babNum, babNama, docxBase64) {
  if (!gasUrl) {
    console.warn(`⚠️ GAS_CALLBACK_URL not set, skipping send for Bab ${babNum}`);
    return false;
  }

  const payload = {
    jobID: paketId,
    status: 'progress',
    progress: Math.min(10 + (babNum * 8), 95),
    message: `Bab ${babNum} generated: ${babNama}`,
    babNum: babNum,
    babNama: babNama,
    docxBase64: docxBase64
  };

  let retries = 0;
  const maxRetries = 3;

  while (retries < maxRetries) {
    try {
      console.log(`📤 [Bab ${babNum}] Sending to GAS (attempt ${retries + 1}/${maxRetries})...`);

      const response = await axios.post(gasUrl, payload, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 10000
      });

      if (response.status === 200) {
        console.log(`✅ [Bab ${babNum}] Berhasil dikirim ke GAS`);
        return true;
      }

    } catch (error) {
      retries++;
      console.error(`❌ [Bab ${babNum}] Attempt ${retries} failed: ${error.message}`);
      
      if (retries < maxRetries) {
        console.log(`⏳ Retry in 3 seconds...`);
        await new Promise(r => setTimeout(r, 3000));
      }
    }
  }

  console.error(`❌ [Bab ${babNum}] GAGAL setelah ${maxRetries} attempts`);
  return false;
}

module.exports = { kirimBabKeGAS };
