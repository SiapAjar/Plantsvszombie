import React, { useState } from 'react';
import { 
  X, 
  ExternalLink, 
  Copy, 
  Check, 
  Download, 
  FileSpreadsheet, 
  CheckCircle2, 
  HelpCircle,
  Sparkles,
  Share2
} from 'lucide-react';
import { copyToClipboard } from '../utils/clipboard';

interface SpreadsheetTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Sample pre-formatted rows following Column A-E requirements
const SAMPLE_TEMPLATE_ROWS = [
  {
    colA: 'Di bagian sel tumbuhan manakah proses fotosintesis berlangsung?',
    colB: 'Kloroplas',
    colC: 'Mitokondria',
    colD: 'Ribosom',
    colE: 'Badan Golgi'
  },
  {
    colA: 'Pigmen hijau daun yang berfungsi menangkap energi cahaya matahari disebut...',
    colB: 'Klorofil',
    colC: 'Karotenoid',
    colD: 'Antosianin',
    colE: 'Melanin'
  },
  {
    colA: 'Gas apakah yang dihasilkan oleh tumbuhan sebagai produk fotosintesis?',
    colB: 'Oksigen (O2)',
    colC: 'Karbon Dioksida (CO2)',
    colD: 'Nitrogen (N2)',
    colE: 'Metana (CH4)'
  },
  {
    colA: 'Jaringan pengangkut air dan mineral dari akar ke daun adalah...',
    colB: 'Xilem',
    colC: 'Floem',
    colD: 'Kambium',
    colE: 'Epidermis'
  },
  {
    colA: 'Bagian daun yang berfungsi sebagai mulut daun tempat pertukaran gas adalah...',
    colB: 'Stomata',
    colC: 'Lentisel',
    colD: 'Kutikula',
    colE: 'Trikoma'
  },
  {
    colA: 'Hewan pemakan tumbuhan dalam rantai makanan disebut konsumen...',
    colB: 'Herbivora',
    colC: 'Karnivora',
    colD: 'Omnivora',
    colE: 'Insektivora'
  },
  {
    colA: 'Planet terdekat dari Matahari dalam tata surya kita adalah...',
    colB: 'Merkurius',
    colC: 'Venus',
    colD: 'Mars',
    colE: 'Bumi'
  }
];

export const SpreadsheetTemplateModal: React.FC<SpreadsheetTemplateModalProps> = ({
  isOpen,
  onClose
}) => {
  const [copiedTable, setCopiedTable] = useState(false);

  if (!isOpen) return null;

  // Google Sheets copy link: opens Google's "Make a copy / Buat salinan" page
  // Forces duplicate creation into user's own Google Drive
  const GOOGLE_SHEETS_COPY_URL = 'https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/copy';

  const handleCopyTableFormat = async () => {
    // Generate TSV format (Tab Separated Values) that pastes cleanly into Google Sheets cell A1
    const header = ['Pertanyaan (Soal)', 'Jawaban Benar', 'Pilihan Pengecoh 1', 'Pilihan Pengecoh 2', 'Pilihan Pengecoh 3'].join('\t');
    const rows = SAMPLE_TEMPLATE_ROWS.map(r => 
      [r.colA, r.colB, r.colC, r.colD, r.colE].join('\t')
    ).join('\n');
    
    const tsvContent = `${header}\n${rows}`;
    const success = await copyToClipboard(tsvContent);
    if (success) {
      setCopiedTable(true);
      setTimeout(() => setCopiedTable(false), 2500);
    }
  };

  const handleDownloadCsv = () => {
    const header = ['"Pertanyaan (Soal)"', '"Jawaban Benar"', '"Pilihan Pengecoh 1"', '"Pilihan Pengecoh 2"', '"Pilihan Pengecoh 3"'].join(',');
    const rows = SAMPLE_TEMPLATE_ROWS.map(r => 
      [`"${r.colA.replace(/"/g, '""')}"`, `"${r.colB.replace(/"/g, '""')}"`, `"${r.colC.replace(/"/g, '""')}"`, `"${r.colD.replace(/"/g, '""')}"`, `"${r.colE.replace(/"/g, '""')}"`].join(',')
    ).join('\n');
    
    const csvContent = `${header}\n${rows}`;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'template_soal_pvz_edukasi.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-150 overflow-y-auto">
      <div className="relative w-full max-w-4xl max-h-[94vh] bg-stone-900 border-2 border-emerald-500 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-stone-100 my-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-stone-800 bg-stone-950/80 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-emerald-300 flex items-center gap-2">
                <span>Template Google Spreadsheet Siap Pakai</span>
                <Sparkles className="w-4 h-4 text-amber-400" />
              </h3>
              <p className="text-xs text-stone-400">
                Format resmi Kolom A s/d E untuk Kuis Plants vs Zombies
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-100 hover:bg-stone-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          
          {/* Main Action Banner: Buka & Salin ke Google Drive */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-950/80 via-teal-950/70 to-stone-950 border-2 border-emerald-500/80 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center md:text-left">
              <span className="text-xs font-mono font-bold text-amber-300 uppercase tracking-wider">
                ⚡ Salin Otomatis ke Akun Google
              </span>
              <h4 className="text-base sm:text-lg font-black text-white">
                Buka Template di Google Sheets & Klik "Buat Salinan"
              </h4>
              <p className="text-xs text-stone-300 max-w-xl leading-relaxed">
                Ketika tautan diklik, Google Docs/Sheets akan menampilkan tombol konfirmasi <b>"Buat salinan" (Make a copy)</b>. Klik tombol tersebut agar template langsung tersimpan ke Google Drive akun Google masing-masing.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-2 shrink-0 w-full md:w-auto">
              <a
                href={GOOGLE_SHEETS_COPY_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-5 py-3 text-xs sm:text-sm font-black bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-stone-950 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-transform active:scale-95 cursor-pointer ring-2 ring-amber-400/40"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Buka & Buat Salinan di Google Sheets</span>
              </a>
            </div>
          </div>

          {/* Quick Step Guide */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-xl bg-stone-950/70 border border-stone-800 space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-amber-500/20 border border-amber-500 text-[11px] font-bold text-amber-300 flex items-center justify-center">1</span>
                <span className="text-xs font-bold text-stone-200">Klik "Buat Salinan"</span>
              </div>
              <p className="text-[11px] text-stone-400 leading-snug">
                File template akan otomatis menjadi milik Anda dan tersimpan di Google Drive pribadi Anda.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-stone-950/70 border border-stone-800 space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-500 text-[11px] font-bold text-emerald-300 flex items-center justify-center">2</span>
                <span className="text-xs font-bold text-stone-200">Isi Soal & Pengecoh</span>
              </div>
              <p className="text-[11px] text-stone-400 leading-snug">
                Tulis pertanyaan di Kolom A, jawaban benar di Kolom B, dan 3 pengecoh di Kolom C, D, E.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-stone-950/70 border border-stone-800 space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-blue-500/20 border border-blue-500 text-[11px] font-bold text-blue-300 flex items-center justify-center">3</span>
                <span className="text-xs font-bold text-stone-200">Bagikan & Tempel Link</span>
              </div>
              <p className="text-[11px] text-stone-400 leading-snug">
                Klik Bagikan → Siapa saja yang memiliki link → Salin Link & tempel di Portal Guru untuk membuat Token.
              </p>
            </div>
          </div>

          {/* Interactive Spreadsheet Preview Table */}
          <div className="space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 text-amber-400" />
                Tampilan Pratinjau Format Spreadsheet (Kolom A s/d E):
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyTableFormat}
                  className="px-3 py-1.5 text-xs font-semibold bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer border border-stone-700"
                >
                  {copiedTable ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedTable ? 'Format Tabel Tersalin!' : 'Salin Format Tabel'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleDownloadCsv}
                  className="px-3 py-1.5 text-xs font-semibold bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-600/50 text-emerald-300 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Unduh file .CSV untuk dibuka di Excel atau di-upload ke Drive"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Unduh CSV / Excel</span>
                </button>
              </div>
            </div>

            {/* Table simulation */}
            <div className="rounded-2xl border-2 border-stone-800 bg-stone-950 overflow-hidden shadow-inner">
              <div className="max-h-64 overflow-x-auto overflow-y-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead className="sticky top-0 bg-emerald-950/90 text-emerald-200 font-bold border-b border-emerald-700/60 z-10">
                    <tr>
                      <th className="p-2.5 border-r border-emerald-800/60 w-12 text-center font-mono text-[11px] text-emerald-400">#</th>
                      <th className="p-2.5 border-r border-emerald-800/60 min-w-[220px]">
                        <span className="px-1.5 py-0.5 rounded bg-emerald-800 text-white font-mono text-[10px] mr-1.5">A</span>
                        Pertanyaan (Soal)
                      </th>
                      <th className="p-2.5 border-r border-emerald-800/60 min-w-[150px] text-amber-300">
                        <span className="px-1.5 py-0.5 rounded bg-amber-600 text-stone-950 font-mono text-[10px] mr-1.5">B</span>
                        Jawaban Benar
                      </th>
                      <th className="p-2.5 border-r border-emerald-800/60 min-w-[140px] text-stone-300">
                        <span className="px-1.5 py-0.5 rounded bg-stone-700 text-stone-200 font-mono text-[10px] mr-1.5">C</span>
                        Pilihan Pengecoh 1
                      </th>
                      <th className="p-2.5 border-r border-emerald-800/60 min-w-[140px] text-stone-300">
                        <span className="px-1.5 py-0.5 rounded bg-stone-700 text-stone-200 font-mono text-[10px] mr-1.5">D</span>
                        Pilihan Pengecoh 2
                      </th>
                      <th className="p-2.5 min-w-[140px] text-stone-300">
                        <span className="px-1.5 py-0.5 rounded bg-stone-700 text-stone-200 font-mono text-[10px] mr-1.5">E</span>
                        Pilihan Pengecoh 3
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-800 font-sans">
                    {SAMPLE_TEMPLATE_ROWS.map((row, idx) => (
                      <tr key={idx} className="hover:bg-stone-900/60 transition-colors">
                        <td className="p-2.5 border-r border-stone-800 text-center font-mono text-stone-500 text-[11px]">{idx + 1}</td>
                        <td className="p-2.5 border-r border-stone-800 font-medium text-stone-100">{row.colA}</td>
                        <td className="p-2.5 border-r border-stone-800 font-bold text-amber-300 bg-amber-950/20">{row.colB}</td>
                        <td className="p-2.5 border-r border-stone-800 text-stone-400">{row.colC}</td>
                        <td className="p-2.5 border-r border-stone-800 text-stone-400">{row.colD}</td>
                        <td className="p-2.5 text-stone-400">{row.colE}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-3.5 border-t border-stone-800 bg-stone-950/80 shrink-0">
          <span className="text-[11px] text-stone-400">
            Setelah membuat salinan dan mengisi soal, tempel link Google Sheets di menu Portal Guru.
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-xl border border-stone-700 transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>

      </div>
    </div>
  );
};
