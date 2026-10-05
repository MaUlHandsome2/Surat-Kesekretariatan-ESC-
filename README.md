# Generator Surat Undangan Organisasi

Aplikasi web statis untuk membuat dan mencetak banyak surat undangan dengan isi yang sama secara otomatis dan cepat. Semua proses berjalan secara aman di dalam browser (client-side) tanpa perlu server (tanpa backend) atau database, sehingga cocok untuk di-hosting secara gratis di GitHub Pages.

## Fitur Utama

- **Detail Surat Interaktif**: Form untuk mengatur Kop Surat (termasuk unggah logo), identitas surat, rincian acara, dan kolom tanda tangan (termasuk unggah gambar tanda tangan dan stempel).
- **Pratinjau Langsung (Live Preview)**: Melihat perubahan surat secara seketika saat Anda mengetik.
- **Manajemen Penerima Massal**: 
  - Tambahkan nama secara manual.
  - *Paste* daftar nama sekaligus (satu baris satu nama).
  - Unggah file Excel/CSV (membutuhkan kolom bernama "nama").
- **Ekspor & Cetak Fleksibel**:
  - Cetak langsung dari browser (*Direct Print*).
  - Unduh satu file PDF gabungan untuk seluruh penerima.
  - Unduh arsip ZIP berisi file PDF terpisah untuk tiap penerima.
  - Unduh format Word (.docx) (Fitur dasar).
- **Penyimpanan Lokal**: Data form, logo, tanda tangan, dan daftar penerima otomatis disimpan di *localStorage* browser agar Anda tidak perlu mengetik ulang saat membuka kembali aplikasi.

## Cara Penggunaan

1. Buka file `index.html` di browser modern (Chrome, Firefox, Edge, Safari).
2. **Langkah 1**: Isi detail surat dan unggah gambar logo serta tanda tangan/stempel jika diperlukan. Klik tombol "Selanjutnya".
3. **Langkah 2**: Masukkan daftar nama penerima surat (baik dengan mengetik, *paste* massal, atau unggah Excel). Pastikan tidak ada duplikat.
4. **Langkah 3**: Periksa *pratinjau akhir*. Pilih salah satu tombol ekspor (Cetak, Unduh PDF Gabungan, Unduh ZIP, atau Unduh Word).

## Format Excel/CSV yang Didukung

Untuk mengimpor daftar nama dari file Excel atau CSV, pastikan file Anda memiliki *header* (baris pertama) dengan nama **"nama"** atau **"Nama"**. 
Kolom opsional: **"sapaan"** (untuk panggilan seperti Kanda, Bapak, Ibu, Saudara).

Contoh format:
| sapaan  | nama                                   |
|---------|----------------------------------------|
| Kanda   | L. Wahyu Andi Purnama, S.Pd., M.Hum.   |
| Bapak   | Dr. Budi Santoso, M.Si.                |
| Saudari | Nisa Putri                             |

## Deployment (Hosting di GitHub Pages)

Karena aplikasi ini 100% statis (HTML, CSS, JS murni), Anda dapat mempublikasikannya secara gratis di GitHub Pages:

1. Buat *repository* baru di GitHub Anda.
2. Unggah seluruh file dan folder dari aplikasi ini (pastikan `index.html` berada di folder utama *root*).
3. Buka tab **Settings** di repository tersebut.
4. Pilih menu **Pages** di sebelah kiri.
5. Pada bagian "Build and deployment", pastikan *Source* diatur ke **Deploy from a branch**.
6. Pilih *branch* **main** atau **master** (dan folder `/ (root)`), lalu klik **Save**.
7. Tunggu beberapa menit, lalu kunjungi URL yang diberikan oleh GitHub (biasanya `https://<username>.github.io/<nama-repo>`).

## Teknologi (Pihak Ketiga)
Aplikasi ini menggunakan beberapa pustaka (Library) pihak ketiga melalui CDN:
- [SheetJS (xlsx)](https://sheetjs.com/) - Untuk memproses file Excel/CSV.
- [html2pdf.js](https://ekoopmans.github.io/html2pdf.js/) - Untuk mengonversi elemen HTML menjadi PDF.
- [JSZip](https://stuk.github.io/jszip/) - Untuk membuat file arsip ZIP.
- [docx](https://docx.js.org/) - Untuk menghasilkan dokumen Word.
- [FileSaver.js](https://github.com/eligrey/FileSaver.js) - Untuk memicu dialog pengunduhan file.
