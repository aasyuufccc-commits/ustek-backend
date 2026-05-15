const { Document, Packer, Paragraph, HeadingLevel, AlignmentType } = require('docx');

/**
 * Build Bab .docx file dari text content
 * @param {object} call - Call object {num, nama, model, max_tokens}
 * @param {string} content - Text content dari AI
 * @param {object} data - Data paket {namaPaket, namaPerusahaan, dll}
 * @returns {Promise<Buffer>} - DOCX file as buffer
 */
async function buildBabDocx(call, content, data) {
  try {
    console.log(`📝 Building DOCX for Bab ${call.num}: ${call.nama}...`);

    // Split content into paragraphs
    const paragraphs = content.split('\n\n').map(para => para.trim()).filter(p => p.length > 0);

    // Build document sections
    const sections = [
      // Header: Bab number & nama
      new Paragraph({
        text: `BAB ${call.num}: ${call.nama}`,
        heading: HeadingLevel.HEADING_1,
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 }
      }),
      
      // Metadata (optional)
      new Paragraph({
        text: `Paket: ${data.namaPaket}`,
        heading: HeadingLevel.HEADING_3,
        spacing: { after: 100 }
      }),
      
      new Paragraph({
        text: `Perusahaan: ${data.namaPerusahaan}`,
        heading: HeadingLevel.HEADING_3,
        spacing: { after: 300 }
      })
    ];

    // Add content paragraphs
    paragraphs.forEach((para, idx) => {
      sections.push(
        new Paragraph({
          text: para,
          alignment: AlignmentType.LEFT,
          spacing: { 
            line: 360,      // 1.5 line spacing
            after: 200,
            before: idx === 0 ? 0 : 100
          }
        })
      );
    });

    // Create document
    const doc = new Document({
      sections: [{
        properties: {},
        children: sections
      }]
    });

    // Convert to buffer
    const buffer = await Packer.toBuffer(doc);
    console.log(`✅ DOCX built successfully (${buffer.length} bytes)`);
    
    return buffer;

  } catch (error) {
    console.error(`❌ buildBabDocx error for Bab ${call.num}:`, error.message);
    throw new Error(`Failed to build DOCX: ${error.message}`);
  }
}

module.exports = { buildBabDocx };
