// File: js/recipients.js

const RecipientsManager = {
    recipients: [],

    init: function() {
        this.recipients = StorageManager.loadRecipients() || [];
        
        // Load default if empty
        if (this.recipients.length === 0) {
            this.recipients = [
                { sapaan: "Kanda", nama: "L. Wahyu Andi Purnama, S.Pd., M.Hum." },
                { sapaan: "Bapak", nama: "Dr. Budi Santoso, M.Si." },
                { sapaan: "Ibu", nama: "Siti Aminah, S.E." },
                { sapaan: "Saudara", nama: "Ahmad Dahlan" },
                { sapaan: "Saudari", nama: "Nisa Putri" }
            ];
            this.save();
        }
        
        this.renderTable();
        this.setupEventListeners();
    },

    setupEventListeners: function() {
        document.getElementById('addSingleRowBtn').addEventListener('click', () => {
            this.recipients.push({ sapaan: "", nama: "" });
            this.renderTable();
            this.save();
        });

        document.getElementById('clearAllRowsBtn').addEventListener('click', () => {
            if (confirm("Apakah Anda yakin ingin menghapus semua nama?")) {
                this.recipients = [];
                this.renderTable();
                this.save();
            }
        });

        document.getElementById('addBulkTextBtn').addEventListener('click', () => {
            this.processBulkText();
        });

        document.getElementById('importExcelBtn').addEventListener('click', () => {
            this.processExcel();
        });

        document.getElementById('downloadExcelSample').addEventListener('click', (e) => {
            e.preventDefault();
            this.downloadExcelSample();
        });

        // Event delegation for dynamically created inputs/buttons in table
        document.getElementById('recipientTbody').addEventListener('input', (e) => {
            if (e.target.classList.contains('input-sapaan') || e.target.classList.contains('input-nama')) {
                const index = parseInt(e.target.dataset.index);
                if (e.target.classList.contains('input-sapaan')) {
                    this.recipients[index].sapaan = e.target.value;
                } else {
                    this.recipients[index].nama = e.target.value;
                }
                this.save();
            }
        });

        document.getElementById('recipientTbody').addEventListener('click', (e) => {
            if (e.target.classList.contains('btn-delete-row')) {
                const index = parseInt(e.target.dataset.index);
                this.recipients.splice(index, 1);
                this.renderTable();
                this.save();
            }
        });
    },

    renderTable: function() {
        const tbody = document.getElementById('recipientTbody');
        tbody.innerHTML = '';

        this.recipients.forEach((rec, index) => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td class="col-no">${index + 1}</td>
                <td>
                    <input type="text" class="input-cell input-sapaan" data-index="${index}" value="${rec.sapaan || ''}" placeholder="Kanda/Bpk/Ibu">
                </td>
                <td>
                    <input type="text" class="input-cell input-nama" data-index="${index}" value="${rec.nama || ''}" placeholder="Nama Penerima">
                </td>
                <td class="col-action">
                    <button class="btn btn-sm btn-danger btn-delete-row" data-index="${index}">Hapus</button>
                </td>
            `;
            tbody.appendChild(tr);
        });

        document.getElementById('totalRecipients').textContent = this.recipients.length;
        
        // Update export summary if we are on step 3
        const finalCountEl = document.getElementById('finalCount');
        if (finalCountEl) {
            finalCountEl.textContent = this.recipients.filter(r => r.nama.trim() !== '').length;
        }
        
        if (typeof ExportManager !== 'undefined') {
            ExportManager.updatePreviewCount();
        }
    },

    save: function() {
        StorageManager.saveRecipients(this.recipients);
    },

    cleanDataAndCheckDuplicates: function(newNames) {
        let addedCount = 0;
        let dupCount = 0;
        
        // Buat Set dari nama yang sudah ada (lowercase untuk case-insensitive comparison)
        const existingNames = new Set(this.recipients.map(r => r.nama.toLowerCase().trim()).filter(n => n));

        newNames.forEach(item => {
            const nama = (item.nama || '').trim();
            if (!nama) return; // Skip empty
            
            const lowerNama = nama.toLowerCase();
            if (existingNames.has(lowerNama)) {
                dupCount++;
            } else {
                existingNames.add(lowerNama);
                this.recipients.push({
                    sapaan: item.sapaan || '',
                    nama: nama
                });
                addedCount++;
            }
        });

        const warningEl = document.getElementById('duplicateWarning');
        if (dupCount > 0) {
            warningEl.textContent = `Ditemukan ${dupCount} nama duplikat yang otomatis diabaikan. Berhasil menambah ${addedCount} nama baru.`;
            warningEl.style.display = 'block';
            setTimeout(() => { warningEl.style.display = 'none'; }, 5000);
        } else {
            warningEl.style.display = 'none';
        }

        this.renderTable();
        this.save();
    },

    processBulkText: function() {
        const text = document.getElementById('bulkTextInput').value;
        const lines = text.split('\n');
        
        const newNames = lines.map(line => ({ nama: line.trim() })).filter(item => item.nama !== '');
        
        if (newNames.length > 0) {
            this.cleanDataAndCheckDuplicates(newNames);
            document.getElementById('bulkTextInput').value = ''; // clear input
        }
    },

    processExcel: function() {
        const fileInput = document.getElementById('excelFileInput');
        const file = fileInput.files[0];
        
        if (!file) {
            alert("Pilih file Excel atau CSV terlebih dahulu.");
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const data = new Uint8Array(e.target.result);
            try {
                const workbook = XLSX.read(data, {type: 'array'});
                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];
                
                // Convert to JSON
                const json = XLSX.utils.sheet_to_json(worksheet, { defval: "" });
                
                const newNames = [];
                json.forEach(row => {
                    // Cari kolom dengan nama "nama", "Nama", "NAMA", dll
                    let namaKey = Object.keys(row).find(k => k.toLowerCase().trim() === 'nama');
                    // Cari kolom "sapaan"
                    let sapaanKey = Object.keys(row).find(k => k.toLowerCase().trim() === 'sapaan');
                    
                    if (namaKey || row[Object.keys(row)[0]]) {
                        const namaVal = namaKey ? row[namaKey] : row[Object.keys(row)[0]]; // Fallback to first column
                        const sapaanVal = sapaanKey ? row[sapaanKey] : '';
                        
                        if (namaVal && String(namaVal).trim() !== '') {
                            newNames.push({
                                sapaan: String(sapaanVal).trim(),
                                nama: String(namaVal).trim()
                            });
                        }
                    }
                });
                
                if (newNames.length > 0) {
                    this.cleanDataAndCheckDuplicates(newNames);
                    fileInput.value = ''; // reset file input
                } else {
                    alert("Tidak ditemukan data nama. Pastikan ada kolom berjudul 'nama' atau isi kolom pertama.");
                }
                
            } catch (err) {
                console.error(err);
                alert("Gagal membaca file. Pastikan formatnya benar (.xlsx, .xls, .csv).");
            }
        };
        reader.readAsArrayBuffer(file);
    },

    downloadExcelSample: function() {
        const ws_data = [
            ["sapaan", "nama"],
            ["Kanda", "L. Wahyu Andi Purnama, S.Pd., M.Hum."],
            ["Bapak", "Dr. Budi Santoso"],
            ["", "Siti Aminah"]
        ];
        const ws = XLSX.utils.aoa_to_sheet(ws_data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Daftar_Penerima");
        XLSX.writeFile(wb, "Template_Penerima.xlsx");
    },
    
    getValidRecipients: function() {
        return this.recipients.filter(r => r.nama && r.nama.trim() !== '');
    }
};
