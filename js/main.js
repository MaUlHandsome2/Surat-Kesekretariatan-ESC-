// File: js/main.js

const App = {
    currentStep: 1,
    formData: {},
    images: {
        logo: null,
        ttd1: null,
        ttd2: null,
        stempel: null
    },

    init: function() {
        this.setupNavigation();
        this.setupFormListeners();
        this.loadSavedData();
        RecipientsManager.init();
        
        // Initial render
        this.updatePreview();
    },

    setupNavigation: function() {
        const goToStep = (step) => {
            if (step < 1 || step > 3) return;
            
            // Hide all steps
            document.querySelectorAll('.step-content').forEach(el => el.classList.remove('active'));
            // Show target step
            document.getElementById(`step${step}`).classList.add('active');
            
            // Update Stepper UI
            document.querySelectorAll('.step').forEach((el, index) => {
                el.classList.remove('active', 'completed');
                if (index + 1 === step) {
                    el.classList.add('active');
                } else if (index + 1 < step) {
                    el.classList.add('completed');
                }
            });

            this.currentStep = step;
            
            // Step specific logic
            if (step === 3) {
                if (typeof ExportManager !== 'undefined') {
                    ExportManager.initPreview();
                }
            }
        };

        document.getElementById('nextToStep2').addEventListener('click', () => goToStep(2));
        document.getElementById('nextToStep3').addEventListener('click', () => goToStep(3));
        document.getElementById('backToStep1').addEventListener('click', () => goToStep(1));
        document.getElementById('backToStep2').addEventListener('click', () => goToStep(2));
        
        // Clicks on step navigation
        document.getElementById('step1-nav').addEventListener('click', () => goToStep(1));
        document.getElementById('step2-nav').addEventListener('click', () => goToStep(2));
        document.getElementById('step3-nav').addEventListener('click', () => {
            if (RecipientsManager.getValidRecipients().length > 0) goToStep(3);
            else alert("Mohon tambahkan minimal 1 penerima terlebih dahulu.");
        });
    },

    setupFormListeners: function() {
        const textInputs = [
            'kop1', 'kop2', 'kop3', 'kop4', 'kop5',
            'nomorSurat', 'lampiranSurat', 'halSurat', 'tempatTujuan',
            'namaKegiatan', 'temaKegiatan', 'waktuHariTanggal', 'waktuJam', 'waktuTempat',
            'tglSuratDibuat', 'ttd1Jabatan', 'ttd1Nama', 'ttd1Npm',
            'ttd2Jabatan', 'ttd2Nama', 'ttd2Npm'
        ];

        textInputs.forEach(id => {
            document.getElementById(id).addEventListener('input', () => {
                this.updatePreview();
                this.saveData();
            });
        });

        // Image uploads
        const handleImageUpload = async (inputId, key) => {
            const input = document.getElementById(inputId);
            input.addEventListener('change', async (e) => {
                const file = e.target.files[0];
                if (file) {
                    try {
                        const base64 = await StorageManager.fileToBase64(file);
                        this.images[key] = base64;
                        this.updatePreview();
                        this.saveData();
                    } catch (err) {
                        console.error("Gagal membaca gambar", err);
                        alert("Gagal membaca gambar.");
                    }
                }
            });
        };

        handleImageUpload('logoInput', 'logo');
        handleImageUpload('ttd1ImgInput', 'ttd1');
        handleImageUpload('ttd2ImgInput', 'ttd2');
        handleImageUpload('stempelImgInput', 'stempel');

        document.getElementById('resetFormBtn').addEventListener('click', () => {
            if (confirm("Reset semua isian form?")) {
                StorageManager.clearAll();
                window.location.reload();
            }
        });
    },

    loadSavedData: function() {
        const data = StorageManager.loadFormData();
        if (data) {
            // Restore text inputs
            if (data.textFields) {
                Object.keys(data.textFields).forEach(id => {
                    const el = document.getElementById(id);
                    if (el) el.value = data.textFields[id];
                });
            }
            // Restore images
            if (data.images) {
                this.images = data.images;
            }
        }
    },

    saveData: function() {
        const textInputs = [
            'kop1', 'kop2', 'kop3', 'kop4', 'kop5',
            'nomorSurat', 'lampiranSurat', 'halSurat', 'tempatTujuan',
            'namaKegiatan', 'temaKegiatan', 'waktuHariTanggal', 'waktuJam', 'waktuTempat',
            'tglSuratDibuat', 'ttd1Jabatan', 'ttd1Nama', 'ttd1Npm',
            'ttd2Jabatan', 'ttd2Nama', 'ttd2Npm'
        ];
        
        const textFields = {};
        textInputs.forEach(id => {
            textFields[id] = document.getElementById(id).value;
        });

        StorageManager.saveFormData({
            textFields: textFields,
            images: this.images
        });
    },

    getFormData: function() {
        return {
            kop1: document.getElementById('kop1').value,
            kop2: document.getElementById('kop2').value,
            kop3: document.getElementById('kop3').value,
            kop4: document.getElementById('kop4').value,
            kop5: document.getElementById('kop5').value,
            nomorSurat: document.getElementById('nomorSurat').value,
            lampiranSurat: document.getElementById('lampiranSurat').value,
            halSurat: document.getElementById('halSurat').value,
            tempatTujuan: document.getElementById('tempatTujuan').value,
            namaKegiatan: document.getElementById('namaKegiatan').value,
            temaKegiatan: document.getElementById('temaKegiatan').value,
            waktuHariTanggal: document.getElementById('waktuHariTanggal').value,
            waktuJam: document.getElementById('waktuJam').value,
            waktuTempat: document.getElementById('waktuTempat').value,
            tglSuratDibuat: document.getElementById('tglSuratDibuat').value,
            ttd1Jabatan: document.getElementById('ttd1Jabatan').value,
            ttd1Nama: document.getElementById('ttd1Nama').value,
            ttd1Npm: document.getElementById('ttd1Npm').value,
            ttd2Jabatan: document.getElementById('ttd2Jabatan').value,
            ttd2Nama: document.getElementById('ttd2Nama').value,
            ttd2Npm: document.getElementById('ttd2Npm').value,
            images: this.images
        };
    },

    generateLetterHTML: function(recipient, data) {
        // Fallbacks
        const nama = recipient.nama || 'NAMA PENERIMA';
        let sapaanTeks = '';
        if (recipient.sapaan && recipient.sapaan.trim() !== '') {
            sapaanTeks = recipient.sapaan;
        }

        const logoHtml = data.images.logo ? `<img src="${data.images.logo}" class="kop-logo" alt="Logo">` : '<div class="kop-logo" style="background:#eee; display:flex; align-items:center; justify-content:center; font-size:10px; color:#999; border:1px solid #ccc;">(Logo)</div>';
        const ttd1Html = data.images.ttd1 ? `<img src="${data.images.ttd1}" class="ttd-img">` : '';
        const ttd2Html = data.images.ttd2 ? `<img src="${data.images.ttd2}" class="ttd-img">` : '';
        const stempelHtml = data.images.stempel ? `<img src="${data.images.stempel}" class="stempel-img">` : '';

        // Teks Undangan Menggunakan Sapaan jika ada
        const sapaanPanggilan = sapaanTeks ? sapaanTeks : "Kanda";
        
        return `
            <div class="kop-surat">
                ${logoHtml}
                <div class="kop-text">
                    <div class="kop-1">${data.kop1}</div>
                    <div class="kop-2">${data.kop2}</div>
                    <div class="kop-3">${data.kop3}</div>
                    <div class="kop-4">${data.kop4}</div>
                    <div class="kop-5">${data.kop5}</div>
                </div>
            </div>
            <div class="garis-kop"></div>
            
            <div class="identitas-surat">
                <table>
                    <tr>
                        <td class="id-col-1">Nomor</td>
                        <td class="id-col-2">:</td>
                        <td class="id-col-3">${data.nomorSurat}</td>
                        <td class="id-col-4">Kepada</td>
                    </tr>
                    <tr>
                        <td>Lampiran</td>
                        <td>:</td>
                        <td>${data.lampiranSurat}</td>
                        <td>
                            <div class="kepada-block">
                                Yth. <b>${nama}</b><br>
                                di-<br>
                                <div class="tempat-block">${data.tempatTujuan}</div>
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td>Hal</td>
                        <td>:</td>
                        <td>${data.halSurat}</td>
                        <td></td>
                    </tr>
                </table>
            </div>
            
            <div class="pembuka">
                Bismillahiwabihamdihi<br>
                Assalamu'alaikum Warahmatullahi Wabarakatuh
            </div>
            
            <div class="isi-surat">
                <div class="paragraf">
                    Sehubungan dengan akan dilaksanakannya acara <b>${data.namaKegiatan}</b> dengan tema <i><b>"${data.temaKegiatan}"</b></i> sebagai langkah awal untuk mencapai masa depan bersama yang lebih cerah. Maka kami selaku pelaksana bermaksud untuk mengundang ${sapaanPanggilan} dalam acara tersebut, yang Insya Allah akan dilaksanakan pada:
                </div>
                
                <div class="rincian-acara">
                    <table>
                        <tr>
                            <td class="ra-col-1">hari/tanggal</td>
                            <td class="ra-col-2">:</td>
                            <td class="ra-col-3">${data.waktuHariTanggal}</td>
                        </tr>
                        <tr>
                            <td>waktu</td>
                            <td>:</td>
                            <td class="ra-col-3">${data.waktuJam}</td>
                        </tr>
                        <tr>
                            <td>tempat</td>
                            <td>:</td>
                            <td class="ra-col-3">${data.waktuTempat}</td>
                        </tr>
                    </table>
                </div>
                
                <div class="paragraf">
                    Demikian surat ini kami buat, atas perhatian dan kerja sama yang baik di ucapkan terima kasih.
                </div>
            </div>
            
            <div class="penutup">
                Wallahumuwaffiqu Walhadi Ila sabilirrasyad<br>
                Wassalamu'alaikum Warahmatullahi Wabarakatuh
            </div>
            
            <div class="tanda-tangan-section">
                <div class="tgl-ttd">${data.tglSuratDibuat}</div>
                <div class="mengetahui">Mengetahui,</div>
                <div class="ttd-grid">
                    <div class="ttd-kiri">
                        <div class="jabatan">${data.ttd1Jabatan}</div>
                        <div class="ttd-box">
                            ${ttd1Html}
                        </div>
                        <div class="nama-ttd">${data.ttd1Nama}</div>
                        <div>${data.ttd1Npm}</div>
                    </div>
                    <div class="ttd-kanan">
                        <div class="jabatan">${data.ttd2Jabatan}</div>
                        <div class="ttd-box">
                            ${ttd2Html}
                            ${stempelHtml}
                        </div>
                        <div class="nama-ttd">${data.ttd2Nama}</div>
                        <div>${data.ttd2Npm}</div>
                    </div>
                </div>
            </div>
        `;
    },

    updatePreview: function() {
        const container = document.getElementById('livePreviewContainer');
        if (container) {
            const data = this.getFormData();
            container.innerHTML = this.generateLetterHTML({ nama: "NAMA PENERIMA" }, data);
        }
    }
};

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});
