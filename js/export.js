// File: js/export.js

const ExportManager = {
    currentPreviewIndex: 0,
    validRecipients: [],

    initPreview: function() {
        this.validRecipients = RecipientsManager.getValidRecipients();
        this.currentPreviewIndex = 0;
        this.updatePreviewCount();
        this.renderFinalPreview();
        this.setupListeners();
    },

    updatePreviewCount: function() {
        const count = RecipientsManager.getValidRecipients().length;
        document.getElementById('finalCount').textContent = count;
        this.updatePreviewIndicator();
    },

    updatePreviewIndicator: function() {
        const total = this.validRecipients.length;
        const text = total > 0 ? `Surat ${this.currentPreviewIndex + 1} dari ${total}` : 'Surat 0 dari 0';
        document.getElementById('previewIndicator').textContent = text;
    },

    renderFinalPreview: function() {
        const container = document.getElementById('finalPreviewContainer');
        if (this.validRecipients.length === 0) {
            container.innerHTML = "<div style='text-align:center; padding: 50px;'>Tidak ada penerima.</div>";
            return;
        }
        
        const recipient = this.validRecipients[this.currentPreviewIndex];
        const data = App.getFormData();
        container.innerHTML = App.generateLetterHTML(recipient, data);
    },

    setupListeners: function() {
        // Prev/Next Preview
        document.getElementById('prevPreviewBtn').onclick = () => {
            if (this.currentPreviewIndex > 0) {
                this.currentPreviewIndex--;
                this.updatePreviewIndicator();
                this.renderFinalPreview();
            }
        };

        document.getElementById('nextPreviewBtn').onclick = () => {
            if (this.currentPreviewIndex < this.validRecipients.length - 1) {
                this.currentPreviewIndex++;
                this.updatePreviewIndicator();
                this.renderFinalPreview();
            }
        };

        // Search
        document.getElementById('searchPreviewInput').oninput = (e) => {
            const query = e.target.value.toLowerCase();
            if (!query) return;
            const index = this.validRecipients.findIndex(r => r.nama.toLowerCase().includes(query));
            if (index !== -1) {
                this.currentPreviewIndex = index;
                this.updatePreviewIndicator();
                this.renderFinalPreview();
            }
        };

        // Export Buttons
        document.getElementById('printBrowserBtn').onclick = () => this.printBrowser();
        document.getElementById('downloadPdfCombinedBtn').onclick = () => this.generatePDFCombined();
        document.getElementById('downloadZipBtn').onclick = () => this.generateZipPDFs();
        document.getElementById('downloadWordBtn').onclick = () => this.generateWord();
    },

    showProgress: function(text, percent) {
        const container = document.getElementById('exportProgress');
        const textEl = document.getElementById('progressText');
        const fillEl = document.getElementById('progressFill');
        
        container.style.display = 'block';
        textEl.textContent = text;
        fillEl.style.width = percent + '%';
        
        if (percent >= 100) {
            setTimeout(() => { container.style.display = 'none'; }, 2000);
        }
    },

    // 1. Cetak Langsung (Print)
    printBrowser: function() {
        if (this.validRecipients.length === 0) {
            alert("Tidak ada penerima valid."); return;
        }

        const printArea = document.getElementById('printArea');
        printArea.innerHTML = '';
        const data = App.getFormData();

        this.validRecipients.forEach(rec => {
            const page = document.createElement('div');
            page.className = 'print-page';
            page.innerHTML = App.generateLetterHTML(rec, data);
            printArea.appendChild(page);
        });

        window.print();
        
        // Cleanup memory after print
        setTimeout(() => { printArea.innerHTML = ''; }, 1000);
    },

    // 2. Generate PDF Gabungan (html2pdf)
    generatePDFCombined: async function() {
        if (this.validRecipients.length === 0) return;
        
        this.showProgress("Menyiapkan PDF Gabungan...", 10);
        
        // Buat container tersembunyi
        const container = document.createElement('div');
        const data = App.getFormData();
        
        this.validRecipients.forEach((rec, idx) => {
            const page = document.createElement('div');
            // Ukuran tepat A4 pixel pada 96 DPI adalah sekitar 794x1123, 
            // html2pdf menangani penskalaan
            page.innerHTML = App.generateLetterHTML(rec, data);
            page.style.padding = '2.5cm 2.5cm 2.5cm 3cm';
            page.style.boxSizing = 'border-box';
            page.style.width = '210mm';
            page.style.height = '297mm';
            page.style.fontFamily = "'Times New Roman', Times, serif";
            page.style.fontSize = "12pt";
            page.style.position = "relative";
            page.style.backgroundColor = "white";
            
            // Add pagebreak except for last element
            if (idx < this.validRecipients.length - 1) {
                page.style.pageBreakAfter = 'always';
            }
            container.appendChild(page);
        });

        const opt = {
            margin:       0,
            filename:     'Undangan_Gabungan.pdf',
            image:        { type: 'jpeg', quality: 0.98 },
            html2canvas:  { scale: 2, useCORS: true },
            jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };

        this.showProgress("Memproses dokumen...", 50);
        try {
            await html2pdf().set(opt).from(container).save();
            this.showProgress("Selesai!", 100);
        } catch (e) {
            console.error(e);
            alert("Terjadi kesalahan saat membuat PDF.");
            this.showProgress("Gagal", 0);
        }
    },

    // Helper: bersihkan nama file
    sanitizeFileName: function(name) {
        return name.replace(/[\\/:"*?<>|]+/g, '').trim();
    },

    // 3. Generate ZIP berisi PDF terpisah
    generateZipPDFs: async function() {
        if (this.validRecipients.length === 0) return;
        
        this.showProgress("Memulai proses ZIP...", 5);
        const zip = new JSZip();
        const data = App.getFormData();
        const total = this.validRecipients.length;

        const opt = {
            margin:       0,
            image:        { type: 'jpeg', quality: 0.98 },
            html2canvas:  { scale: 2, useCORS: true },
            jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };

        for (let i = 0; i < total; i++) {
            const rec = this.validRecipients[i];
            
            // Create hidden page element
            const page = document.createElement('div');
            page.innerHTML = App.generateLetterHTML(rec, data);
            page.style.padding = '2.5cm 2.5cm 2.5cm 3cm';
            page.style.boxSizing = 'border-box';
            page.style.width = '210mm';
            page.style.height = '297mm';
            page.style.fontFamily = "'Times New Roman', Times, serif";
            page.style.fontSize = "12pt";
            page.style.position = "relative";
            page.style.backgroundColor = "white";

            try {
                // Generate PDF as blob
                const pdfBlob = await html2pdf().set(opt).from(page).output('blob');
                const safeName = this.sanitizeFileName(rec.nama);
                zip.file(`Undangan_${safeName}.pdf`, pdfBlob);
                
                this.showProgress(`Memproses file ${i+1}/${total}...`, 10 + Math.round((i/total)*70));
            } catch(e) {
                console.error("Gagal buat PDF untuk " + rec.nama, e);
            }
        }

        this.showProgress("Mengompresi file ZIP...", 85);
        zip.generateAsync({type:"blob"}).then((content) => {
            saveAs(content, "Undangan_Terpisah.zip");
            this.showProgress("Selesai!", 100);
        });
    },

    // 4. Generate Word (.docx)
    generateWord: async function() {
        if (this.validRecipients.length === 0) return;
        this.showProgress("Menyiapkan file Word...", 50);
        
        alert("Peringatan: Pembuatan file Word pada browser mungkin tidak 100% mempertahankan format visual kompleks (seperti posisi gambar stempel yang menimpa tanda tangan). Disarankan menggunakan PDF untuk hasil terbaik.");
        
        // Catatan: Implementasi penuh docx.js membutuhkan pembuatan node terstruktur, 
        // yang cukup panjang jika harus persis dengan HTML layout tabel.
        // Di sini kita memberi tahu pengguna dan menyediakan teks dasarnya, atau opsi PDF lebih baik.
        // Untuk melengkapi, ini adalah implementasi minimalnya.
        
        const { Document, Packer, Paragraph, TextRun, AlignmentType } = window.docx;
        const data = App.getFormData();
        
        const sections = [];

        this.validRecipients.forEach(rec => {
            sections.push({
                properties: {
                    page: {
                        margin: {
                            top: 1417, // 2.5cm dalam Twip
                            right: 1417,
                            bottom: 1417,
                            left: 1701  // 3cm
                        }
                    }
                },
                children: [
                    new Paragraph({
                        children: [
                            new TextRun({ text: data.kop1, bold: true, size: 28 }),
                        ],
                        alignment: AlignmentType.CENTER
                    }),
                    new Paragraph({
                        children: [
                            new TextRun({ text: data.kop2, bold: true, size: 32 }),
                        ],
                        alignment: AlignmentType.CENTER
                    }),
                    new Paragraph({
                        children: [
                            new TextRun({ text: "==========================================================", size: 24 }),
                        ],
                        alignment: AlignmentType.CENTER
                    }),
                    new Paragraph({
                        children: [
                            new TextRun({ text: `Nomor    : ${data.nomorSurat}` }),
                        ]
                    }),
                    new Paragraph({
                        children: [
                            new TextRun({ text: `Lampiran : ${data.lampiranSurat}` }),
                        ]
                    }),
                    new Paragraph({
                        children: [
                            new TextRun({ text: `Hal      : ${data.halSurat}` }),
                        ]
                    }),
                    new Paragraph({ text: "" }),
                    new Paragraph({
                        children: [
                            new TextRun({ text: "Kepada Yth. " }),
                            new TextRun({ text: rec.nama, bold: true }),
                        ]
                    }),
                    new Paragraph({
                        children: [
                            new TextRun({ text: `di- ${data.tempatTujuan}` }),
                        ]
                    }),
                    new Paragraph({ text: "" }),
                    new Paragraph({
                        children: [
                            new TextRun({ text: "Bismillahiwabihamdihi", italics: true, bold: true }),
                        ]
                    }),
                    new Paragraph({
                        children: [
                            new TextRun({ text: "Assalamu'alaikum Warahmatullahi Wabarakatuh", italics: true, bold: true }),
                        ]
                    }),
                    new Paragraph({ text: "" }),
                    new Paragraph({
                        text: `Sehubungan dengan akan dilaksanakannya acara ${data.namaKegiatan} dengan tema "${data.temaKegiatan}" sebagai langkah awal untuk mencapai masa depan bersama yang lebih cerah. Maka kami selaku pelaksana bermaksud untuk mengundang Kanda/Bapak/Ibu dalam acara tersebut, yang Insya Allah akan dilaksanakan pada:`,
                        alignment: AlignmentType.JUSTIFIED
                    }),
                    new Paragraph({ text: "" }),
                    new Paragraph({ text: `    hari/tanggal  : ${data.waktuHariTanggal}` }),
                    new Paragraph({ text: `    waktu         : ${data.waktuJam}` }),
                    new Paragraph({ text: `    tempat        : ${data.waktuTempat}` }),
                    new Paragraph({ text: "" }),
                    new Paragraph({
                        text: "Demikian surat ini kami buat, atas perhatian dan kerja sama yang baik di ucapkan terima kasih.",
                        alignment: AlignmentType.JUSTIFIED
                    }),
                    new Paragraph({ text: "" }),
                    new Paragraph({
                        children: [
                            new TextRun({ text: "Wallahumuwaffiqu Walhadi Ila sabilirrasyad", italics: true, bold: true }),
                        ]
                    }),
                    new Paragraph({
                        children: [
                            new TextRun({ text: "Wassalamu'alaikum Warahmatullahi Wabarakatuh", italics: true, bold: true }),
                        ]
                    }),
                    new Paragraph({ text: "" }),
                    new Paragraph({
                        text: data.tglSuratDibuat,
                        alignment: AlignmentType.RIGHT
                    })
                    // Menghindari tabel ttd kompleks di browser-side docx, 
                    // cukup memberi peringatan seperti di alert awal.
                ]
            });
        });

        const doc = new Document({ sections });

        Packer.toBlob(doc).then(blob => {
            saveAs(blob, "Undangan.docx");
            this.showProgress("Selesai!", 100);
        });
    }
};
