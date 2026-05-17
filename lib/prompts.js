/**
 * PROMPT LIBRARY - Proposal Teknis Jasa Konsultansi Konstruksi
 * Structure: 6 BAB x 2 JENIS LAYANAN (DED & Pengawasan)
 * Total: 28 prompts (14 DED + 14 Pengawasan)
 * 
 * USAGE:
 * const prompt = promptLibrary[jenisLayanan][babNo];
 * const finalPrompt = prompt.template
 *   .replace("[KAK_TEXT]", kakContent)
 *   .replace("[PERSONEL_LIST]", personelString)
 *   .replace("[DURASI]", duration);
 */

const promptLibrary = {
  
  DED: {
    
    // =============== BAB 1: PEMAHAMAN ATAS JASA LAYANAN DALAM KAK ===============
    
    "1.1": {
      model: "claude-sonnet-4-6",
      wordCount: "150-200 kata",
      instructions: `Buatkan narasi profesional "Pemahaman terhadap Sasaran dan Tujuan" 
untuk Jasa Konsultansi PERENCANAAN/PERANCANGAN (Detail Engineering Design / DED).

KAK TEXT:
[KAK_TEXT]

PERSONEL YANG TERSEDIA:
[PERSONEL_LIST]

STRUKTUR NARASI (3-4 paragraf):
1. Pengertian proyek (dari KAK: scope, target end-user, kapasitas, lokasi)
2. Target utama: Menghasilkan DED lengkap yang siap untuk tender konstruksi
3. Scope deliverable (survei, design konsep, detail design, finalisasi dokumen)
4. Standar dan regulasi yang diacu (SNI, Perpres 16/2018, SMKK)

TONE: Konsultan berpengalaman, professional, detail-oriented
FORMAT: Paragraf narasi (justify alignment)
JANGAN: Placeholder, generic language, copy-paste, bullet points
OUTPUT: Hanya narasi tanpa nomor urut, siap copy-paste ke dokumen`
    },

    "1.2": {
      model: "claude-sonnet-4-6",
      wordCount: "200-250 kata",
      instructions: `Buatkan narasi profesional "Pemahaman terhadap Lingkup Jasa Konsultansi" 
untuk DED dengan detail setiap komponen.

KAK TEXT:
[KAK_TEXT]

PERSONEL YANG TERSEDIA:
[PERSONEL_LIST]

STRUKTUR NARASI (2-3 paragraf):
1. Definisi lingkup jasa DED (dari KAK extract)
2. Lima komponen utama:
   - Survei lapangan (topografi, geoteknik, utilitas)
   - Perencanaan arsitektur (layout, ruang, material)
   - Perencanaan struktur (analisis, desain beton/baja)
   - Perencanaan MEP (mekanis, elektrikal, plumbing)
   - Penyusunan dokumen tender (RKS, BoQ, spesifikasi)
3. Integrasi lintas-disiplin dan koordinasi tim

TONE: Technical, comprehensive, clear hierarchical flow
FORMAT: Paragraf narasi
JANGAN: Bullet points, excessive technical jargon tanpa penjelasan
OUTPUT: Narasi siap pakai`
    },

    "1.3": {
      model: "claude-haiku-4-5",
      wordCount: "150-200 kata",
      instructions: `Buatkan narasi "Pengenalan Lapangan" untuk DED berdasarkan data KAK.

KAK TEXT:
[KAK_TEXT]

FOKUS EKSTRAKSI DARI KAK:
1. Lokasi proyek (alamat, kota, provinsi) - HARUS KONSISTEN
2. Kondisi topografi (datar, miring, ketinggian)
3. Utilitas existing (air, listrik, drainase, komunikasi)
4. Kondisi geoteknik (jenis tanah, kemiringan)
5. Aksesibilitas (akses jalan, mobilisasi)
6. Lingkungan sekitar (dampak terhadap area, noise, traffic)

STRUKTUR: 2-3 paragraf
TONE: Observasi lapangan, factual, professional
OUTPUT: Deskriptif tanpa spekulasi, data dari KAK saja`
    },

    "1.4": {
      model: "claude-haiku-4-5",
      wordCount: "100-150 kata",
      instructions: `Buatkan narasi "Saran terhadap KAK" untuk meningkatkan kualitas DED.

KAK TEXT:
[KAK_TEXT]

PERSONEL YANG TERSEDIA:
[PERSONEL_LIST]

FOKUS:
1. Identifikasi gap atau opportunity dalam KAK
2. Saran perbaikan (efisiensi, inovasi, compliance)
3. Contoh: Green Building, energy efficiency, sustainable design, accessibility
4. Modifikasi scope yang menguntungkan pihak pemberi kerja

STRUKTUR: 1-2 paragraf
TONE: Konstruktif, value-added, professional recommendation
OUTPUT: Saran konkret, bukan generic advice`
    },

    // =============== BAB 2: PENDEKATAN DAN METODOLOGI ===============

    "2.1": {
      model: "claude-sonnet-4-6",
      wordCount: "300-400 kata",
      instructions: `Buatkan narasi "Pendekatan Teknis dan Filosofi Desain" untuk DED.

KAK TEXT:
[KAK_TEXT]

PERSONEL YANG TERSEDIA:
[PERSONEL_LIST]

PILAR UTAMA:
1. Akurasi Data (survei presisi, investigasi geoteknik, analisis utilitas)
2. Integrasi Multidisiplin (koordinasi arsitek-struktur-MEP real-time)
3. Clash Detection (mencegah konflik teknis sejak design, bukan saat konstruksi)
4. Optimasi Cost-Benefit (efisiensi biaya konstruksi vs durabilitas)
5. Compliance Regulasi (SNI, Perpres, standar internasional)

TEKNOLOGI/TOOLS YANG DISEBUTKAN:
- Total Station untuk survei topografi presisi
- Boring Test untuk investigasi geoteknik
- BIM (jika di bab 6 ada inovasi BIM)
- SNI 1726:2019 (kegempaan), SNI 2847:2019 (struktur beton)

STRUKTUR: 4-5 paragraf
TONE: Technical expert, methodical, confidence-building
FORMAT: Paragraf narasi justify
OUTPUT: Siap copy-paste, tanpa placeholder`
    },

    "2.2": {
      model: "claude-sonnet-4-6",
      wordCount: "400-500 kata",
      instructions: `Buatkan narasi "Metodologi Pelaksanaan" untuk DED step-by-step.

KAK TEXT:
[KAK_TEXT]

PERSONEL YANG TERSEDIA:
[PERSONEL_LIST]

STRUKTUR METODOLOGI (5-7 paragraf):
1. Fase Persiapan (mobilisasi, setup lapangan, koordinasi, studi literatur)
2. Fase Survei (topografi, geoteknik, utilitas, dokumentasi)
3. Fase Design Konsep (brainstorming, preliminary design, zoning)
4. Fase Detail Design (analisis mendalam, design refinement, integrasi MEP)
5. Fase Finalisasi (QC/QA, dokumentasi lengkap, penyusunan tender doc)
6. Quality Control (review per tahap, approval dari pemberi kerja)

TOOLS & TEKNIK:
- AutoCAD/Revit untuk design
- SAP2000/ETABS untuk analisis struktur
- Koordinasi meeting (weekly/bi-weekly)
- Review checkpoint setiap fase

TONE: Detailed, systematic, quality-assured
FORMAT: Paragraf narasi dengan flow yang jelas
OUTPUT: Komprehensif dan terukur`
    },

    "2.3": {
      model: "claude-haiku-4-5",
      wordCount: "200-300 kata",
      instructions: `Buatkan narasi "Analisis Masalah dan Langkah Pemecahan" untuk DED.

KAK TEXT:
[KAK_TEXT]

IDENTIFIKASI TANTANGAN TEKNIS (dari KAK):
1. Analisis beban gempa (SNI 1726:2019)
2. Analisis tanah/geoteknik (dari Boring Test)
3. Integrasi MEP kompleks (ruang terbatas, efisiensi energi)
4. Compliance dengan regulasi (K3, accessibility, environmental)
5. Optimasi biaya (value engineering tanpa compromise kualitas)

SOLUSI YANG DITAWARKAN:
- Metodologi yang proven dan teruji
- Tim ahli multidisiplin yang berpengalaman
- Tools modern (BIM, simulation software)
- Regular coordination dan quality checkpoint

STRUKTUR: 2-3 paragraf
TONE: Problem-solver, confident, solution-focused
OUTPUT: Jelas masalah dan jelas solusinya`
    },

    // =============== BAB 3: PROGRAM KERJA ===============

    "3.1": {
      model: "claude-haiku-4-5",
      wordCount: "250-350 kata",
      instructions: `Buatkan narasi "Tahapan Pelaksanaan (Pentahapan)" untuk DED durasi 6 bulan.

DURASI PROYEK: [DURASI] bulan (biasanya 6)

STRUKTUR FASE:
- Bulan 1: Persiapan & Survei (topografi, geoteknik, utilitas existing)
- Bulan 2-3: Design Konsep & Detail Design (arsitek, struktur, MEP)
- Bulan 4: Finalisasi Design & Spesifikasi Teknis
- Bulan 5: Penyusunan RKS & BoQ (Bill of Quantity)
- Bulan 6: Finalisasi dokumen tender & serah-terima

MILESTONE UTAMA:
- Laporan survei (akhir Bulan 1)
- Design konsep approval (akhir Bulan 2)
- Detail design approval (akhir Bulan 3)
- Spesifikasi teknis final (akhir Bulan 4)
- Dokumen tender ready (akhir Bulan 6)

STRUKTUR: 2-3 paragraf
TONE: Clear timeline, measurable milestones
OUTPUT: Jelas fase, jelas milestone`
    },

    "3.3": {
      model: "claude-haiku-4-5",
      wordCount: "300-400 kata",
      instructions: `Buatkan narasi "Rencana Keselamatan Konstruksi (RKK)" untuk fase PERENCANAAN/DESAIN.

KAK TEXT:
[KAK_TEXT]

PERSONEL YANG TERSEDIA:
[PERSONEL_LIST]

FOKUS RKK DI FASE DESIGN (bukan eksekusi):
1. Identifikasi zona risiko pada design (work at height, excavation, lifting, confined space)
2. Integrasi K3 dalam design decisions:
   - Akses aman untuk pekerja selama konstruksi
   - Material storage yang terpisah dan aman
   - Jalur mobilisasi alat berat tanpa konflik
   - Sistem penahan beban dan scaffolding yang optimal
   - Komunikasi dan coordination point yang jelas
3. SMKK (Sistem Manajemen Keselamatan Konstruksi) - reference dalam design
4. Komunikasi RKK dengan kontraktor di fase detail design
5. Dokumentasi RKK sebagai bagian dari tender document

REGULASI:
- Perpres 16/2018 tentang SMKK
- Peraturan Menteri Pekerjaan Umum tentang K3 Konstruksi
- SNI-related standards

STRUKTUR: 3-4 paragraf
TONE: Proactive, safety-first, construction-aware
OUTPUT: RKK yang terintegrasi dalam design, bukan afterthought`
    },

    // =============== BAB 4: ORGANISASI DAN PERSONEL ===============

    "4.2": {
      model: "claude-haiku-4-5",
      wordCount: "300-400 kata",
      instructions: `Buatkan narasi "Uraian Tugas dan Tanggung Jawab" untuk masing-masing posisi.

PERSONEL YANG TERSEDIA:
[PERSONEL_LIST]

UNTUK SETIAP PERSONEL, JELASKAN:
1. Peran utama dalam proyek
2. Tanggung jawab teknis spesifik
3. Deliverable yang dihasilkan
4. Koordinasi dengan posisi lain
5. Kualifikasi yang diharapkan

CONTOH STRUKTUR PER POSISI:
- Ketua Tim: Kepemimpinan, koordinasi keseluruhan, quality assurance
- Ahli Struktur: Design struktur, analisis, quality control struktur
- Arsitek: Design arsitektur, koordinasi dengan MEP, aesthetic & functionality
- Ahli MEP: Design mekanis, elektrikal, plumbing, integrasi dengan arsitektur
- Ahli K3: Rencana keselamatan konstruksi, review design dari perspektif K3
- Surveyor: Survei topografi, geoteknik, data akurat untuk design
- Drafter: Gambar teknis, dokumentasi, CAD drawing, koordinasi
- Admin: Dokumentasi, koordinasi meeting, administrative support

TONE: Clear role definition, accountability, team integration
STRUKTUR: Paragraf per posisi (atau grouped)
OUTPUT: Masing-masing personel jelas role-nya`
    },

    "4.3": {
      model: "claude-haiku-4-5",
      wordCount: "150-200 kata",
      instructions: `Buatkan narasi "Jadwal Penugasan Personel" dengan alokasi Orang-Bulan.

PERSONEL DENGAN DURASI:
[PERSONEL_LIST]

TOTAL DURASI PROYEK: [DURASI] bulan

STRUKTUR NARASI:
1. Overview total alokasi jam/orang per personel
2. Distribusi intensitas sepanjang 6 bulan (intensitas tinggi saat design, berkurang saat finalisasi)
3. Fleksibilitas dan backup untuk keperluan urgent
4. Koordinasi dengan timeline proyek (Bab 3.1)

CONTOH ALOKASI (untuk DED 6 bulan):
- Ketua Tim: Full-time (6.0 OB)
- Ahli Struktur: Full-time (5.0 OB)
- Arsitek: Full-time (5.0 OB)
- Ahli MEP: Part-time 3 bulan (2.5 OB)
- Ahli K3: Part-time 2 bulan (1.5 OB)
- Surveyor: Part-time 1 bulan (0.8 OB)
- Drafter: Full-time 2 orang (4.5 OB)
- Admin: Full-time (3.0 OB)

TONE: Efficient, realistic, aligned dengan timeline
OUTPUT: Jelas alokasi per personel dan keseluruhannya`
    },

    // =============== BAB 5: PENYAJIAN HASIL KERJA (DELIVERABLES) ===============

    "5.0": {
      model: "claude-haiku-4-5",
      wordCount: "300-400 kata",
      instructions: `Buatkan narasi lengkap untuk BAB 5: PENYAJIAN HASIL KERJA (DELIVERABLES).

KAK TEXT:
[KAK_TEXT]

DELIVERABLE UNTUK DED (gabung 5.1 + 5.2):

5.1 JENIS LAPORAN:
- Laporan Pendahuluan (survei, analisis awal, konsep awal)
- Laporan Antara (design konsep, hasil review)
- Laporan Akhir (design final, dokumentasi lengkap)
- Laporan Survei Geoteknik (detailed boring test result, soil analysis)
- Laporan Analisis Struktur (perhitungan, diagram, verifikasi)
- Laporan K3 & RKK (Rencana Keselamatan Konstruksi)

5.2 DOKUMEN TEKNIS:
- Gambar kerja format A1 (minimal 25 lembar) mencakup: denah, potongan, detail, rencana struktur, rencana MEP, rencana K3
- Spesifikasi Teknis (RKS - Rincian Spesifikasi Teknis)
- Bill of Quantity (BoQ) - daftar barang/material dengan satuan
- Rencana Anggaran Biaya (RAB)
- Rencana Teknis (metodologi konstruksi)
- Gambar Detail (1:50, 1:20 untuk detail kompleks)

FORMAT OUTPUT:
- Semua laporan: Softcopy (.pdf) + Hardcopy (diprint A4)
- Gambar: A1 print + Digital (.dwg, .pdf)
- Dokumen: Microsoft Word format, siap edit

STRUKTUR: 3-4 paragraf, jelas dan terukur
TONE: Professional deliverable list
OUTPUT: Komprehensif coverage deliverable`
    },

    // =============== BAB 6: GAGASAN BARU DAN INOVASI ===============

    "6.1": {
      model: "claude-haiku-4-5",
      wordCount: "200-300 kata",
      instructions: `Buatkan narasi "Inovasi Teknologi/Metode" untuk DED.

KAK TEXT:
[KAK_TEXT]

PILIH SALAH SATU (atau kombinasi):

OPSI 1: BIM (Building Information Modeling)
- Teknologi: Revit Architecture untuk integrasi 3D
- Keuntungan: Clash detection otomatis, visualisasi stakeholder, estimasi cost akurat
- Impact: Mengurangi change order di lapangan hingga 15-20%
- Deliverable: 3D model, clash detection report, quantity take-off otomatis

OPSI 2: Green Building
- Teknologi: Design untuk GREENSHIP atau LEED certification
- Fokus: Efisiensi energi (HVAC optimization), water conservation, material sustainability
- Impact: Reduce operational cost gedung 20-30%, environmental compliance
- Deliverable: Green building strategy, energy simulation report, material sustainability plan

OPSI 3: Advanced Analysis Software
- Teknologi: SAP2000/ETABS untuk analisis struktur gempa
- Fokus: Precision dalam analisis gempa (SNI 1726:2019), optimization
- Impact: Design yang lebih optimal, aman, efficient
- Deliverable: Analisis detail, design optimization report

STRUKTUR: 2-3 paragraf
TONE: Innovative, value-added, measurable benefit
OUTPUT: Satu inovasi yang jelas dengan benefit konkret`
    }

  },

  // ===============================================================================
  // PENGAWASAN (Pengawasan Konstruksi)
  // ===============================================================================

  Pengawasan: {

    "1.1": {
      model: "claude-sonnet-4-6",
      wordCount: "150-200 kata",
      instructions: `Buatkan narasi profesional "Pemahaman terhadap Sasaran dan Tujuan" 
untuk Jasa Konsultansi PENGAWASAN KONSTRUKSI.

KAK TEXT:
[KAK_TEXT]

PERSONEL YANG TERSEDIA:
[PERSONEL_LIST]

STRUKTUR NARASI (3-4 paragraf):
1. Pengertian pekerjaan pengawasan (durasi konstruksi, scope dari design)
2. Target utama: Memastikan konstruksi sesuai dengan design, standar K3, dan mutu
3. Scope pengawasan (inspeksi lapangan, testing material, quality verification, dokumentasi)
4. Standar dan regulasi (SNI, Perpres 16/2018 jo 12/2021, spesifikasi teknis, kontrak)

TONE: Pengawas berpengalaman, detail-oriented, compliance-focused
FORMAT: Paragraf narasi (justify alignment)
JANGAN: Placeholder, generic language
OUTPUT: Hanya narasi tanpa nomor urut, siap copy-paste ke dokumen`
    },

    "1.2": {
      model: "claude-sonnet-4-6",
      wordCount: "200-250 kata",
      instructions: `Buatkan narasi profesional "Pemahaman terhadap Lingkup Jasa Konsultansi" 
untuk PENGAWASAN KONSTRUKSI.

KAK TEXT:
[KAK_TEXT]

PERSONEL YANG TERSEDIA:
[PERSONEL_LIST]

STRUKTUR NARASI (2-3 paragraf):
1. Definisi lingkup pengawasan (pra-konstruksi, eksekusi, finishing, serah-terima)
2. Komponen pengawasan utama:
   - Quality Control/Quality Assurance (QC/QA) material dan pekerjaan
   - Inspeksi Lapangan (visual inspection, dimensional check, method verification)
   - Testing & Sampling (concrete test, steel test, soil compaction, dll)
   - Dokumentasi & Reporting (daily report, weekly report, defect list)
   - K3 Supervision (keselamatan kerja, SMKK implementation, incident prevention)
   - Koordinasi (dengan kontraktor, design consultant, pemberi kerja)
3. Hubungan dengan tim lain (kontraktor, design engineer, stakeholder)

TONE: Supervisor expert, comprehensive oversight, quality-assured
FORMAT: Paragraf narasi
OUTPUT: Jelas lingkup dan coverage pengawasan`
    },

    "1.3": {
      model: "claude-haiku-4-5",
      wordCount: "150-200 kata",
      instructions: `Buatkan narasi "Pengenalan Lapangan" untuk PENGAWASAN KONSTRUKSI.

KAK TEXT:
[KAK_TEXT]

FOKUS EKSTRAKSI DARI KAK:
1. Lokasi proyek (alamat, kota, provinsi) - HARUS KONSISTEN
2. Kondisi lapangan existing (tanah, utilitas, akses)
3. Potensi hambatan konstruksi (traffic, noise limitation, neighbor impact)
4. Accessibility untuk mobilisasi alat dan material
5. Temporary facility needs (site office, storage, waste disposal)
6. Koordinasi dengan area sekitar (impact assessment, mitigation plan)

STRUKTUR: 2-3 paragraf
TONE: Site-aware, practical, risk-minded
OUTPUT: Deskriptif kondisi lapangan untuk pengawasan`
    },

    "1.4": {
      model: "claude-haiku-4-5",
      wordCount: "100-150 kata",
      instructions: `Buatkan narasi "Saran terhadap KAK" untuk meningkatkan kualitas PENGAWASAN.

KAK TEXT:
[KAK_TEXT]

PERSONEL YANG TERSEDIA:
[PERSONEL_LIST]

FOKUS:
1. Identifikasi gap dalam KAK pengawasan (checkpoint yang kurang, schedule yang tight)
2. Saran untuk improve QC/QA process
3. Saran K3 & risk management yang lebih baik
4. Optimasi testing schedule tanpa menunda konstruksi
5. Improvement dalam dokumentasi & reporting

STRUKTUR: 1-2 paragraf
TONE: Konstruktif, practical, win-win recommendation
OUTPUT: Saran konkret untuk pengawasan lebih efektif`
    },

    "2.1": {
      model: "claude-sonnet-4-6",
      wordCount: "300-400 kata",
      instructions: `Buatkan narasi "Pendekatan Teknis dan Filosofi Desain PENGAWASAN" untuk konstruksi.

KAK TEXT:
[KAK_TEXT]

PERSONEL YANG TERSEDIA:
[PERSONEL_LIST]

PILAR UTAMA PENGAWASAN:
1. Quality Assurance/Control (QA/QC) - standar ISO 9000 mindset
2. Compliance Verification (desain matching, standar compliance, kontrak fulfillment)
3. Safety Management (SMKK implementation, incident prevention, K3 supervision)
4. Material & Workmanship Testing (concrete, steel, soil, mechanical, electrical testing)
5. Documentation & Record Keeping (daily report, photo documentation, testing cert)
6. Coordination & Communication (dengan semua stakeholder, transparent reporting)

METODOLOGI PENGAWASAN:
- Daily site inspection schedule (pagi, siang, atau per phase)
- Weekly quality meeting dengan kontraktor
- Monthly progress report dan photo documentation
- Material testing per standard (sebelum dipakai, after application)
- Dimensional verification (sesuai design drawing)
- Defect list & correction procedure

TOOLS/TEKNOLOGI:
- Inspection checklist & form
- Photo/video documentation
- Testing equipment (concrete tester, steel tester, theodolite)
- Digital reporting system (optional: AI-based site monitoring)

STRUKTUR: 4-5 paragraf
TONE: Technical supervisor, systematic, evidence-based
FORMAT: Paragraf narasi justify
OUTPUT: Comprehensive QC/QA approach`
    },

    "2.2": {
      model: "claude-sonnet-4-6",
      wordCount: "400-500 kata",
      instructions: `Buatkan narasi "Metodologi Pelaksanaan Pengawasan" step-by-step.

KAK TEXT:
[KAK_TEXT]

PERSONEL YANG TERSEDIA:
[PERSONEL_LIST]

STRUKTUR FASE PENGAWASAN (5-7 paragraf):
1. Fase Pra-Konstruksi (kick-off meeting, mobilisasi, setup QC system, training)
2. Fase Persiapan Lapangan (site setup, material sourcing inspection, method statement review)
3. Fase Pengawasan Eksekusi - Per Tahap Konstruksi:
   - Pondasi (pile driving, concrete pour, testing, documentation)
   - Struktur (formwork, rebar, concrete, deformasi checking)
   - Dinding & Plafon (material quality, workmanship, dimensional check)
   - MEP Installation (electrical, plumbing, HVAC, testing per standard)
4. Fase Finishing (paint, flooring, doors, final touch-up)
5. Fase Final Inspection & Testing (FAT, SAT, functional test, punchlist)
6. Fase Serah-Terima (handover, warranty period supervision, closeout)

QUALITY CONTROL DETAIL:
- Daily inspection report (checklist untuk setiap kegiatan)
- Material testing (certificate, sampling, acceptance criteria)
- Dimensional verification (laser theodolite, measuring, as-built marking)
- Photo documentation (progress, defect, before-after)
- Weekly QC meeting (discussion issue, corrective action)

KOMUNIKASI & KOORDINASI:
- Daily standup dengan kontraktor
- Weekly meeting dengan design consultant (issue resolution)
- Bi-weekly report ke pemberi kerja
- Monthly comprehensive report (progress, issue, risk, forecast)

TONE: Systematic oversight, proactive problem-solving, documentation-heavy
STRUKTUR: Fase-based, logical flow, detail per tahap
OUTPUT: Jelas proses pengawasan dari awal hingga serah-terima`
    },

    "2.3": {
      model: "claude-haiku-4-5",
      wordCount: "200-300 kata",
      instructions: `Buatkan narasi "Analisis Masalah dan Langkah Pemecahan" untuk PENGAWASAN.

KAK TEXT:
[KAK_TEXT]

IDENTIFIKASI TANTANGAN PENGAWASAN (dari KAK):
1. Risk kontraktor tidak sesuai design (common issue di lapangan)
2. Risk kualitas material di bawah standar (quality variation, fake cert)
3. Risk K3 lapangan tidak terimplementasi (accident prevention)
4. Risk schedule delay (impact ke quality, cost, risk)
5. Risk coordination dengan design consultant (update, clarification)
6. Risk dokumentasi incomplete (as-built documentation, testing cert)

SOLUSI YANG DITAWARKAN:
- QC system yang ketat dengan checklist per tahap
- Material testing mandatory sebelum penggunaan
- K3 supervision proaktif dengan incident prevention
- Weekly coordination meeting dengan semua pihak
- Photo & video documentation untuk traceability
- Digital reporting system untuk transparency
- Tim ahli multidisiplin untuk problem-solving cepat

STRUKTUR: 2-3 paragraf
TONE: Realistic problem-spotter, solution-provider
OUTPUT: Jelas masalah, jelas solusi, implementable`
    },

    "3.1": {
      model: "claude-haiku-4-5",
      wordCount: "250-350 kata",
      instructions: `Buatkan narasi "Tahapan Pelaksanaan (Pentahapan)" untuk PENGAWASAN KONSTRUKSI.

KAK TEXT:
[KAK_TEXT]

DURASI PROYEK KONSTRUKSI: [DURASI] bulan (biasanya 18+ untuk bangunan)

STRUKTUR FASE PENGAWASAN:
- Bulan 1-2: Pra-Konstruksi & Mobilisasi (setup, training, QC system, mobilisasi)
- Bulan 3-X: Konstruksi Pondasi & Struktur (intensive inspection, testing, documentation)
- Bulan X+1-Y: Instalasi MEP & Interior (coordination, testing, documentation)
- Bulan Y+1-Z: Finishing & Final Testing (FAT, SAT, punchlist)
- Bulan Z+1: Serah-Terima & Closeout (handover, warranty period)

MILESTONE UTAMA:
- Setup QC system & team mobilisasi (akhir Bulan 1)
- Pondasi complete & tested (milestone Bulan)
- Struktur complete & deformasi check (milestone Bulan)
- MEP complete & functional test (milestone Bulan)
- Finishing complete & punchlist (milestone Bulan)
- FAT/SAT passed (milestone akhir)
- Serah-terima resmi (Bulan terakhir)

CHECKPOINT BULANAN:
- Inspeksi lapangan mingguan
- Report progress mingguan
- Koordinasi meeting dengan kontraktor & design consultant
- Material testing schedule per phase

STRUKTUR: 2-3 paragraf
TONE: Clear timeline, measurable checkpoint
OUTPUT: Jelas fase pengawasan sepanjang konstruksi`
    },

    "3.3": {
      model: "claude-haiku-4-5",
      wordCount: "300-400 kata",
      instructions: `Buatkan narasi "Rencana Keselamatan Konstruksi (RKK)" untuk fase PENGAWASAN/EKSEKUSI.

KAK TEXT:
[KAK_TEXT]

PERSONEL YANG TERSEDIA:
[PERSONEL_LIST]

FOKUS RKK DI FASE KONSTRUKSI (implementasi SMKK):
1. Implementasi SMKK (Sistem Manajemen Keselamatan Konstruksi) di lapangan
   - Safety briefing & training untuk semua pekerja
   - PPE enforcement (helmet, safety vest, safety shoe, dll)
   - Work method & procedure yang aman sesuai K3 standard

2. Inspeksi K3 Lapangan (daily/weekly)
   - Scaffolding inspection & certification
   - Equipment safety (crane, lifting, electrical)
   - Work at height procedure (harness, anchor point)
   - Hazard identification & correction

3. Incident Prevention & Near-Miss Reporting
   - Root cause analysis untuk setiap incident
   - Corrective action & preventive measure
   - K3 performance tracking & KPI monitoring

4. Coordination dengan Safety Officer & Pekerja
   - Weekly K3 meeting dengan kontraktor
   - Safety induction untuk pekerja baru
   - Motivasi & awareness program

5. Documentation & Record
   - Incident report & investigation
   - Training certificate & attendance
   - Testing certificate (equipment, PPE)
   - K3 performance report

REGULASI:
- Peraturan Pemerintah (PP) Nomor 14 Tahun 2021 tetang Jasa Konstruksi
- Permen PUPR No. 10 Tahun 2021 tentang Regulasi SMKK
- SNI 6773:2019 Sistem Manajemen K3 Konstruksi

STRUKTUR: 3-4 paragraf
TONE: Proactive K3 supervisor, compliance-driven, worker-protective
OUTPUT: RKK implementasi yang jelas untuk fase eksekusi`
    },

    "4.2": {
      model: "claude-haiku-4-5",
      wordCount: "300-400 kata",
      instructions: `Buatkan narasi "Uraian Tugas dan Tanggung Jawab" untuk tim PENGAWASAN.

PERSONEL YANG TERSEDIA:
[PERSONEL_LIST]

UNTUK SETIAP PERSONEL, JELASKAN:
1. Peran utama dalam pengawasan
2. Tanggung jawab inspeksi spesifik
3. Testing & sampling authority
4. Reporting & documentation
5. Koordinasi dengan pihak lain
6. Kualifikasi yang diharapkan

CONTOH STRUKTUR PER POSISI (PENGAWASAN):
- Ketua Pengawas/Site Manager: Leadership, daily coordination, QC decision, reporting ke pemberi kerja
- Ahli Struktur: Inspeksi struktur, dimensional checking, concrete testing, deformasi analysis
- Ahli MEP: Inspeksi MEP installation, electrical testing, HVAC commissioning, plumbing flushing
- Ahli Arsitektur: Inspeksi finishing, material quality, architectural compliance, aesthetic checking
- Ahli K3: K3 supervision, safety inspection, incident investigation, SMKK implementation
- Surveyor/Drafter: As-built documentation, dimensional measurement, photo recording
- Admin: Documentation, meeting minutes, reporting, data management

TONE: Clear operational role, accountability, coordination focus
STRUKTUR: Paragraf per posisi atau grouped
OUTPUT: Masing-masing personel jelas responsibility-nya`
    },

    "4.3": {
      model: "claude-haiku-4-5",
      wordCount: "150-200 kata",
      instructions: `Buatkan narasi "Jadwal Penugasan Personel" untuk tim PENGAWASAN.

PERSONEL DENGAN DURASI:
[PERSONEL_LIST]

TOTAL DURASI PROYEK KONSTRUKSI: [DURASI] bulan

STRUKTUR NARASI:
1. Overview total alokasi jam/orang per personel sepanjang konstruksi
2. Distribusi intensitas per tahap (intensitas tinggi saat struktur, berkurang saat finishing)
3. On-site presence vs back-office support (full-time vs part-time)
4. Backup & flexibility untuk urgent issue
5. Alignment dengan timeline konstruksi (Bab 3.1)

CONTOH ALOKASI (untuk PENGAWASAN 18 bulan):
- Site Manager/Ketua Pengawas: Full-time on-site (18 OB)
- Ahli Struktur: Full-time on-site (16 OB, start dari bulan 1)
- Ahli MEP: Part-time on-site 8 bulan (8 OB, mulai bulan 8)
- Ahli Arsitektur: Part-time on-site (10 OB)
- Ahli K3: Full-time on-site (15 OB)
- Surveyor: Full-time on-site (12 OB)
- Admin: On-site (12 OB)

TONE: Realistic allocation, on-site presence emphasis, timeline-aligned
OUTPUT: Jelas alokasi per tahap konstruksi`
    },

    "5.0": {
      model: "claude-haiku-4-5",
      wordCount: "300-400 kata",
      instructions: `Buatkan narasi lengkap untuk BAB 5: PENYAJIAN HASIL KERJA (DELIVERABLES) PENGAWASAN.

KAK TEXT:
[KAK_TEXT]

DELIVERABLE UNTUK PENGAWASAN KONSTRUKSI (gabung 5.1 + 5.2):

5.1 JENIS LAPORAN:
- Laporan Harian (Daily Report) - progress, issue, weather, material arrival
- Laporan Mingguan (Weekly Report) - progress summary, QC finding, corrective action
- Laporan Bulanan (Monthly Report) - comprehensive progress, financial, risk status
- Laporan Testing (Testing Report) - concrete test, steel test, material cert collection
- Laporan K3 (K3 Monthly Report) - incident, near-miss, K3 performance, training
- Laporan Finishing Inspection (Final QC Report) - punchlist, defect correction, acceptance
- Laporan As-Built Documentation (As-Built Report) - final dimension, actual installation

5.2 DOKUMEN/DATA TEKNIS:
- As-Built Drawings (A1 format) - actual condition saat serah-terima
- Testing Certificate Collection (concrete, steel, soil, mechanical, electrical test result)
- Photo Documentation (digital album, progress photos, defect photos before-after)
- Material Certificate (quality cert, origin, test result)
- Equipment Testing Certificate (crane, scaffolding, lifting equipment)
- K3 Documentation (training attendance, PPE cert, incident report)
- Progress Schedule & Actuals (Gantt chart with actual vs planned)
- Defect List & Correction Record (punch list tracking, completion status)
- Warranty Record (warranty items, coverage, duration)

FORMAT OUTPUT:
- Laporan: Hardcopy (A4 bound) + Softcopy (.pdf)
- As-Built Drawing: A1 print + Digital (.dwg, .pdf)
- Testing Certificate: Hardcopy (asli) + Digital scan (.pdf)
- Photo: Digital album + selected print (A4)
- Progress Data: Digital spreadsheet (.xlsx) + printed summary

STRUKTUR: 3-4 paragraf, jelas dan terukur
TONE: Comprehensive documentation
OUTPUT: Complete deliverable set untuk closeout`
    },

    "6.1": {
      model: "claude-haiku-4-5",
      wordCount: "200-300 kata",
      instructions: `Buatkan narasi "Inovasi Teknologi/Metode" untuk PENGAWASAN KONSTRUKSI.

KAK TEXT:
[KAK_TEXT]

PILIH SALAH SATU (atau kombinasi):

OPSI 1: AI-Based Site Monitoring & Defect Detection
- Teknologi: Drone survey, AI image analysis untuk defect detection
- Keuntungan: Automated defect detection, faster inspection, consistent QC, photographic evidence
- Impact: Reduce inspection time 30-40%, fewer hidden defects, better documentation
- Deliverable: AI defect report, drone survey imagery, defect tracking dashboard

OPSI 2: Digital Quality Management System
- Teknologi: Mobile app untuk daily inspection, cloud-based data collection
- Keuntungan: Real-time data, centralized documentation, instant reporting, analytics
- Impact: Faster corrective action, better communication, traceability
- Deliverable: QC database, digital checklist, real-time dashboard, automated alert

OPSI 3: BIM-Based Progress Tracking & Clash Detection
- Teknologi: 4D BIM (3D model + time dimension) untuk progress visualization
- Keuntungan: Visual progress tracking, early clash detection, coordination improvement
- Impact: Schedule compliance, reduced rework, better coordination
- Deliverable: 4D progress model, weekly progress update, clash report

OPSI 4: Advanced Testing & Sensor Technology
- Teknologi: Real-time concrete strength monitoring, structural deformation sensors
- Keuntungan: Early defect detection, data-driven decision, scientific validation
- Impact: Higher confidence in quality, faster decisions, reduced risk
- Deliverable: Sensor data, analysis report, certification support

STRUKTUR: 2-3 paragraf
TONE: Tech-savvy supervisor, data-driven, innovative approach
OUTPUT: Satu inovasi yang jelas dengan benefit konkret untuk pengawasan`
    }
  }

};

module.exports = promptLibrary;
