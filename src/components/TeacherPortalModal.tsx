import React, { useState, useEffect } from 'react';
import { TeacherTokenPackage, StudentSubmission, Question } from '../types/game';
import { 
  getTeacherTokens, 
  saveTeacherTokens, 
  generateTokenCode, 
  fetchQuestionsFromGoogleSheets,
  getStudentSubmissions,
  exportSubmissionsToCsv
} from '../utils/teacherStorage';
import { parseSpreadsheetData } from '../utils/spreadsheetParser';
import { copyToClipboard } from '../utils/clipboard';
import { 
  X, 
  GraduationCap, 
  Link as LinkIcon, 
  Copy, 
  Check, 
  FileSpreadsheet, 
  Users, 
  Trophy, 
  Download, 
  Trash2, 
  Lock, 
  AlertCircle, 
  CheckCircle2, 
  Sparkles,
  ExternalLink,
  Plus,
  Share2
} from 'lucide-react';

// ============================================================
// TEMPLATE SPREADSHEET — SUDAH DIISI DENGAN ID ANDA ✅
// ============================================================
const TEMPLATE_SPREADSHEET_ID = '10YdkL93c9iIFD8QxY4o1wkyEBy8aVcPSvzvCAFXeFzs';
const TEMPLATE_SPREADSHEET_COPY_URL = `https://docs.google.com/spreadsheets/d/${TEMPLATE_SPREADSHEET_ID}/copy`;
const TEMPLATE_SPREADSHEET_VIEW_URL = `https://docs.google.com/spreadsheets/d/${TEMPLATE_SPREADSHEET_ID}/edit`;

interface TeacherPortalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTokenForPlay?: (pkg: TeacherTokenPackage) => void;
}

export const TeacherPortalModal: React.FC<TeacherPortalModalProps> = ({
  isOpen,
  onClose,
  onSelectTokenForPlay
}) => {
  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [authError, setAuthError] = useState<string | null>(null);

  // Portal tabs
  const [activeTab, setActiveTab] = useState<'create_token' | 'manage_tokens' | 'submissions'>('create_token');

  // Create Token Form state
  const [sheetUrl, setSheetUrl] = useState<string>('');
  const [quizTitle, setQuizTitle] = useState<string>('');
  const [isFetching, setIsFetching] = useState<boolean>(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [previewQuestions, setPreviewQuestions] = useState<Question[] | null>(null);
  const [createdTokenPkg, setCreatedTokenPkg] = useState<TeacherTokenPackage | null>(null);
  const [copiedTokenCode, setCopiedTokenCode] = useState<boolean>(false);
  const [copiedTokenMsg, setCopiedTokenMsg] = useState<boolean>(false);
  const [copiedRowToken, setCopiedRowToken] = useState<string | null>(null);

  // Direct paste fallback mode
  const [showDirectPaste, setShowDirectPaste] = useState<boolean>(false);
  const [directPasteText, setDirectPasteText] = useState<string>('');

  // Data lists
  const [tokens, setTokens] = useState<TeacherTokenPackage[]>([]);
  const [submissions, setSubmissions] = useState<StudentSubmission[]>([]);

  useEffect(() => {
    if (isOpen) {
      setTokens(getTeacherTokens());
      setSubmissions(getStudentSubmissions());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Handler: buka template spreadsheet (mode "make a copy") di tab baru
  // Teknik anchor-click: tidak bisa diblokir popup blocker
  const handleOpenTemplateSpreadsheet = () => {
    const link = document.createElement('a');
    link.href = TEMPLATE_SPREADSHEET_COPY_URL;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim() === 'guru' && password.trim() === 'guruhebat') {
      setIsAuthenticated(true);
      setAuthError(null);
    } else {
      setAuthError('Username atau Password salah! (hubungi 085722228896)');
    }
  };

  const handleFetchSpreadsheet = async () => {
    if (!sheetUrl.trim()) {
      setFetchError('Harap masukkan URL Google Spreadsheet terlebih dahulu.');
      return;
    }

    setIsFetching(true);
    setFetchError(null);
    setPreviewQuestions(null);

    const result = await fetchQuestionsFromGoogleSheets(sheetUrl);
    setIsFetching(false);

    if (result.error) {
      setFetchError(result.error);
    } else {
      setPreviewQuestions(result.questions);
      if (!quizTitle.trim()) {
        setQuizTitle(`Kuis Spreadsheet (${result.questions.length} Soal)`);
      }
    }
  };

  const handleApplyDirectPaste = () => {
    const res = parseSpreadsheetData(directPasteText, true);
    if (res.questions.length > 0) {
      setPreviewQuestions(res.questions);
      setFetchError(null);
      if (!quizTitle.trim()) {
        setQuizTitle(`Kuis Spreadsheet (${res.questions.length} Soal)`);
      }
    } else {
      setFetchError('Data tempel tidak memiliki format valid (Kolom A-E).');
    }
  };

  const handleSaveAndGenerateToken = () => {
    if (!previewQuestions || previewQuestions.length === 0) {
      setFetchError('Belum ada soal yang berhasil dimuat.');
      return;
    }

    const tokenCode = generateTokenCode('GURU');
    const newPkg: TeacherTokenPackage = {
      token: tokenCode,
      title: quizTitle.trim() || `Kuis ${tokenCode}`,
      spreadsheetUrl: sheetUrl.trim() || 'Tempel Manual',
      questions: previewQuestions,
      createdAt: Date.now()
    };

    const updatedTokens = [newPkg, ...tokens];
    setTokens(updatedTokens);
    saveTeacherTokens(updatedTokens);
    setCreatedTokenPkg(newPkg);
  };

  const handleCopyTokenCode = async (tokenCode: string, rowTokenId?: string) => {
    const success = await copyToClipboard(tokenCode);
    if (success) {
      if (rowTokenId) {
        setCopiedRowToken(rowTokenId);
        setTimeout(() => setCopiedRowToken(null), 2500);
      } else {
        setCopiedTokenCode(true);
        setTimeout(() => setCopiedTokenCode(false), 2500);
      }
    }
  };

  const handleCopyTokenMessage = async (pkg: TeacherTokenPackage) => {
    const msg = `Assalamualaikum Anak anak! Silakan buka game Plants vs Zombies Kuis dan masukkan Token Kuis ini:\n\n👉 TOKEN: ${pkg.token}\nJudul: ${pkg.title}\nJumlah Soal: ${pkg.questions.length} Soal\n\nSelamat bermain dan pertahankan kebunmu!`;
    const success = await copyToClipboard(msg);
    if (success) {
      setCopiedTokenMsg(true);
      setTimeout(() => setCopiedTokenMsg(false), 2500);
    }
  };

  const handleDeleteToken = (tokenCode: string) => {
    if (tokens.length <= 1) {
      alert('Minimal harus tersisa 1 token di sistem.');
      return;
    }
    const updated = tokens.filter(t => t.token !== tokenCode);
    setTokens(updated);
    saveTeacherTokens(updated);
  };

  const handleExportSubmissions = () => {
    const csv = exportSubmissionsToCsv(submissions);
    const blob = new Blob([csv], { type: 'text/tab-separated-values;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `rekap_nilai_siswa_${new Date().toISOString().slice(0, 10)}.tsv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-150">
      <div className="relative w-full max-w-4xl max-h-[92vh] bg-stone-900 border-2 border-emerald-600/70 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-stone-100">

        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-800 bg-stone-950/80">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-950 border border-emerald-500/50 text-emerald-400">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-black text-emerald-300 tracking-wide">
                Portal Guru: Manajemen Soal & Token
              </h2>
              <p className="text-xs text-stone-400">
                Masukkan link Google Spreadsheet dan bagikan Token kepada siswa
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-100 hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 1. LOGIN SCREEN */}
        {!isAuthenticated ? (
          <div className="p-8 flex flex-col items-center justify-center text-center space-y-6 my-auto">
            <div className="w-16 h-16 rounded-2xl bg-stone-950 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-inner">
              <Lock className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h3 className="text-xl font-bold text-stone-100">
                Masuk ke Portal Guru
              </h3>
              <p className="text-xs text-stone-400">
                Gunakan kredensial pengajar untuk membuat kuis dan melihat nilai siswa.
              </p>
            </div>

            <form onSubmit={handleLogin} className="w-full max-w-sm space-y-4 text-left">
              <div>
                <label className="text-xs font-semibold text-stone-300">Username Guru:</label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Masukkan Username"
                  className="w-full p-2.5 mt-1 text-sm bg-stone-950 border border-stone-700 rounded-xl text-stone-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-stone-300">Password Guru:</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan Password"
                  className="w-full p-2.5 mt-1 text-sm bg-stone-950 border border-stone-700 rounded-xl text-stone-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              {authError && (
                <div className="p-3 rounded-xl bg-red-950/60 border border-red-800 text-xs text-red-300 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{authError}</span>
                </div>
              )}

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 text-sm font-bold bg-emerald-600 hover:bg-emerald-500 text-stone-950 rounded-xl transition-transform active:scale-95 shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Lock className="w-4 h-4" />
                  Masuk Portal Guru
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* 2. AUTHENTICATED TEACHER DASHBOARD */
          <div className="flex-1 flex flex-col overflow-hidden">
            
            {/* Tabs */}
            <div className="flex items-center gap-2 px-6 pt-3 border-b border-stone-800 bg-stone-950/40">
              <button
                onClick={() => setActiveTab('create_token')}
                className={`pb-3 px-3 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${
                  activeTab === 'create_token'
                    ? 'border-emerald-500 text-emerald-400'
                    : 'border-transparent text-stone-400 hover:text-stone-200'
                }`}
              >
                <Plus className="w-4 h-4" />
                Buat Kuis Baru
              </button>
              <button
                onClick={() => setActiveTab('manage_tokens')}
                className={`pb-3 px-3 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${
                  activeTab === 'manage_tokens'
                    ? 'border-emerald-500 text-emerald-400'
                    : 'border-transparent text-stone-400 hover:text-stone-200'
                }`}
              >
                <FileSpreadsheet className="w-4 h-4" />
                Daftar Kuis ({tokens.length})
              </button>
              <button
                onClick={() => setActiveTab('submissions')}
                className={`pb-3 px-3 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${
                  activeTab === 'submissions'
                    ? 'border-emerald-500 text-emerald-400'
                    : 'border-transparent text-stone-400 hover:text-stone-200'
                }`}
              >
                <Users className="w-4 h-4" />
                Rekap Nilai Siswa ({submissions.length})
              </button>
            </div>

            {/* Tab Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">

              {/* TAB 1: CREATE TOKEN FROM SPREADSHEET LINK */}
              {activeTab === 'create_token' && (
                <div className="space-y-6">

                  {/* Token Generated Success Hero */}
                  {createdTokenPkg && (
                    <div className="p-5 rounded-2xl border-2 border-emerald-500 bg-emerald-950/50 shadow-xl space-y-3 animate-in zoom-in-95 duration-200">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-emerald-300 flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          Token Kuis Berhasil Dibuat & Siap Diberikan ke Siswa!
                        </span>
                        <button
                          onClick={() => setCreatedTokenPkg(null)}
                          className="text-xs text-stone-400 hover:text-stone-200"
                        >
                          Tutup Pesan
                        </button>
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-stone-950/80 rounded-xl border border-emerald-600/40">
                        <div>
                          <span className="text-xs text-stone-400">Kode Token Siswa:</span>
                          <div 
                            onClick={() => handleCopyTokenCode(createdTokenPkg.token)}
                            className="text-3xl font-black font-mono tracking-widest text-amber-300 hover:text-amber-200 cursor-pointer flex items-center gap-2 group"
                            title="Klik untuk salin kode token"
                          >
                            <span>{createdTokenPkg.token}</span>
                            <span className="text-[10px] font-sans font-normal text-stone-400 group-hover:text-amber-300">
                              (Klik salin)
                            </span>
                          </div>
                          <span className="text-xs text-stone-300 font-semibold">
                            {createdTokenPkg.title} · {createdTokenPkg.questions.length} Soal
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleCopyTokenCode(createdTokenPkg.token)}
                            className="px-3.5 py-2.5 text-xs font-bold bg-amber-500 hover:bg-amber-400 text-stone-950 rounded-xl flex items-center gap-1.5 transition-transform active:scale-95 shadow-md cursor-pointer"
                            title="Salin kode token saja (misal: GURU-101)"
                          >
                            {copiedTokenCode ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                            <span>{copiedTokenCode ? 'Kode Tersalin!' : 'Salin Kode Token'}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleCopyTokenMessage(createdTokenPkg)}
                            className="px-3.5 py-2.5 text-xs font-semibold bg-stone-800 hover:bg-stone-700 text-stone-100 rounded-xl flex items-center gap-1.5 transition-colors border border-stone-700 cursor-pointer"
                            title="Salin pesan lengkap untuk dibagikan ke grup WA / kelas siswa"
                          >
                            {copiedTokenMsg ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4 text-amber-400" />}
                            <span>{copiedTokenMsg ? 'Pesan Tersalin!' : 'Salin Pesan Siswa'}</span>
                          </button>

                          {onSelectTokenForPlay && (
                            <button
                              type="button"
                              onClick={() => {
                                onSelectTokenForPlay(createdTokenPkg);
                                onClose();
                              }}
                              className="px-4 py-2.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-stone-950 rounded-xl transition-colors cursor-pointer"
                            >
                              Coba Mainkan Kuis Ini
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Template Spreadsheet Action Banner */}
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/80 via-teal-950/60 to-stone-950 border border-emerald-500/70 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 shrink-0">
                        <FileSpreadsheet className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5">
                          <span>Template Spreadsheet Siap Pakai</span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-mono">
                            Kolom A - E
                          </span>
                        </h4>
                        <p className="text-xs text-stone-300 leading-snug">
                          Klik untuk membuka template di Google Sheets, lalu klik <b>"Make a copy"</b> — file otomatis masuk ke Drive Anda.
                        </p>
                      </div>
                    </div>

                    {/* FIX: Tombol diubah menjadi <a> agar PASTI terbuka, tidak bisa diblokir popup blocker */}
                    <a
                      href={TEMPLATE_SPREADSHEET_COPY_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full sm:w-auto px-4 py-2.5 text-xs font-black bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-stone-950 rounded-xl flex items-center justify-center gap-2 shadow-md transition-transform active:scale-95 cursor-pointer shrink-0"
                    >
                      <FileSpreadsheet className="w-4 h-4" />
                      <span>Buka Template Spreadsheet</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>

                  {/* Instructions */}
                  <div className="p-4 rounded-2xl border border-stone-800 bg-stone-950/60 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-amber-300">
                        Cara Menggunakan Link Google Spreadsheet:
                      </span>
                      {/* FIX: Link kecil juga diubah ke <a> */}
                      <a
                        href={TEMPLATE_SPREADSHEET_COPY_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-emerald-400 hover:underline flex items-center gap-1 font-semibold"
                      >
                        <FileSpreadsheet className="w-3.5 h-3.5" />
                        <span>Lihat Template Soal</span>
                      </a>
                    </div>
                    <ol className="text-xs text-stone-300 space-y-1 list-decimal list-inside">
                      <li>Klik tombol <b>Buka Template Spreadsheet</b> di atas → di Google Sheets klik <b>File → Make a copy</b> untuk menyimpan ke Drive Anda.</li>
                      <li>Isi soal di file salinan tersebut (<b>Kolom A</b>: Soal, <b>Kolom B</b>: Jawaban Benar, <b>Kolom C, D, E</b>: Pengecoh).</li>
                      <li>Klik tombol <b>Bagikan (Share)</b> di kanan atas Google Sheets → ubah Akses Umum menjadi <b>"Siapa saja yang memiliki link (Anyone with the link)"</b>.</li>
                      <li>Salin link Google Sheets tersebut dan tempel di bawah ini, lalu klik <b>Periksa & Ambil Soal</b>!</li>
                    </ol>
                  </div>

                  {/* Form */}
                  <div className="p-5 rounded-2xl border border-stone-800 bg-stone-950/40 space-y-4">
                    <div>
                      <label className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                        <LinkIcon className="w-4 h-4" />
                        Tempel Link Google Spreadsheet:
                      </label>
                      <div className="flex items-center gap-2 mt-1">
                        <input
                          type="url"
                          value={sheetUrl}
                          onChange={(e) => setSheetUrl(e.target.value)}
                          placeholder="https://docs.google.com/spreadsheets/d/.../edit"
                          className="flex-1 p-3 text-xs font-mono bg-stone-950 border border-stone-700 rounded-xl text-stone-100 focus:outline-none focus:border-emerald-500"
                        />
                        <button
                          type="button"
                          onClick={handleFetchSpreadsheet}
                          disabled={isFetching || !sheetUrl.trim()}
                          className="px-5 py-3 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-stone-950 rounded-xl flex items-center gap-1.5 transition-colors shrink-0 shadow-md"
                        >
                          {isFetching ? 'Mengunduh...' : 'Periksa & Ambil Soal'}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-stone-300">Judul Kuis / Topik Materi:</label>
                      <input
                        type="text"
                        value={quizTitle}
                        onChange={(e) => setQuizTitle(e.target.value)}
                        placeholder="Contoh: Kuis IPA Fotosintesis Kelas 5A"
                        className="w-full p-2.5 mt-1 text-xs bg-stone-950 border border-stone-700 rounded-xl text-stone-100 focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    {/* Toggle direct paste fallback */}
                    <div className="pt-1">
                      <button
                        type="button"
                        onClick={() => setShowDirectPaste(!showDirectPaste)}
                        className="text-xs text-amber-400 hover:underline flex items-center gap-1"
                      >
                        {showDirectPaste ? '▲ Sembunyikan Kotak Tempel Manual' : '▼ Atau tempel langsung teks dari spreadsheet (tanpa link)'}
                      </button>

                      {showDirectPaste && (
                        <div className="mt-3 p-3 rounded-xl bg-stone-950 border border-stone-800 space-y-2">
                          <textarea
                            rows={4}
                            value={directPasteText}
                            onChange={(e) => setDirectPasteText(e.target.value)}
                            placeholder="Tempel baris spreadsheet (Kolom A-E) di sini..."
                            className="w-full p-2.5 text-xs font-mono bg-stone-900 border border-stone-700 rounded-lg text-stone-200"
                          />
                          <button
                            type="button"
                            onClick={handleApplyDirectPaste}
                            className="px-4 py-1.5 text-xs font-bold bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-lg"
                          >
                            Terapkan Teks Tempel
                          </button>
                        </div>
                      )}
                    </div>

                    {fetchError && (
                      <div className="p-3.5 rounded-xl bg-red-950/60 border border-red-800/80 text-xs text-red-200 flex items-start gap-2.5">
                        <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                        <div>{fetchError}</div>
                      </div>
                    )}

                    {/* Preview Questions */}
                    {previewQuestions && previewQuestions.length > 0 && (
                      <div className="p-4 rounded-xl border border-emerald-600/40 bg-emerald-950/20 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            {previewQuestions.length} Soal Berhasil Divalidasi!
                          </span>
                          <span className="text-[11px] text-stone-400">
                            Kolom A (Soal) · Kolom B (Kunci) · Kolom C-E (Pengecoh)
                          </span>
                        </div>

                        <div className="max-h-48 overflow-y-auto rounded-lg border border-stone-800 bg-stone-950">
                          <table className="w-full text-xs text-left border-collapse">
                            <thead className="bg-stone-800 text-stone-300">
                              <tr>
                                <th className="p-2 w-8 text-center">#</th>
                                <th className="p-2">Pertanyaan</th>
                                <th className="p-2 text-emerald-400">Jawaban Benar</th>
                                <th className="p-2 text-amber-300">Pengecoh</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-stone-800">
                              {previewQuestions.slice(0, 5).map((q, idx) => (
                                <tr key={idx} className="hover:bg-stone-900">
                                  <td className="p-2 text-center text-stone-500">{idx + 1}</td>
                                  <td className="p-2 text-stone-200 font-medium">{q.question}</td>
                                  <td className="p-2 text-emerald-400 font-bold">{q.correctAnswer}</td>
                                  <td className="p-2 text-stone-400">{q.distractor1}, {q.distractor2}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                          {previewQuestions.length > 5 && (
                            <div className="p-2 text-center text-[11px] text-stone-400 bg-stone-900 border-t border-stone-800">
                              dan {previewQuestions.length - 5} soal lainnya...
                            </div>
                          )}
                        </div>

                        <div className="pt-2 flex justify-end">
                          <button
                            type="button"
                            onClick={handleSaveAndGenerateToken}
                            className="px-6 py-3 text-sm font-black bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-stone-950 rounded-xl shadow-lg shadow-amber-500/20 flex items-center gap-2 transition-transform active:scale-95 cursor-pointer"
                          >
                            <Sparkles className="w-4 h-4 fill-stone-950" />
                            Simpan & Buat Token Siswa
                          </button>
                        </div>
                      </div>
                    )}

                  </div>
                </div>
              )}

              {/* TAB 2: MANAGE CREATED TOKENS */}
              {activeTab === 'manage_tokens' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-stone-100">Daftar Paket Token Kuis</h4>
                      <p className="text-xs text-stone-400">Token dapat langsung diberikan kepada siswa untuk mulai kuis.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {tokens.map((pkg) => {
                      const tokenSubmissions = submissions.filter(s => s.token.toUpperCase() === pkg.token.toUpperCase());
                      return (
                        <div
                          key={pkg.token}
                          className="p-4 rounded-2xl border border-stone-800 bg-stone-950/60 flex flex-col justify-between space-y-3 hover:border-emerald-500/40 transition-colors"
                        >
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-2xl font-black font-mono tracking-wider text-amber-300">
                                {pkg.token}
                              </span>
                              <span className="text-[11px] text-stone-400 bg-stone-900 px-2.5 py-0.5 rounded-full border border-stone-800">
                                {pkg.questions.length} Soal
                              </span>
                            </div>

                            <h5 className="text-sm font-bold text-stone-100">{pkg.title}</h5>
                            <p className="text-xs text-stone-400">
                              Dibuat: {new Date(pkg.createdAt).toLocaleDateString('id-ID')} · {tokenSubmissions.length} Siswa Mengerjakan
                            </p>
                          </div>

                          <div className="flex items-center justify-between pt-2 border-t border-stone-800/80">
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => handleCopyTokenMessage(pkg)}
                                className="px-3 py-1.5 text-xs font-semibold bg-stone-800 hover:bg-stone-700 text-amber-300 rounded-lg flex items-center gap-1.5 transition-colors"
                              >
                                <Copy className="w-3.5 h-3.5" />
                                Salin Token
                              </button>
                              {onSelectTokenForPlay && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    onSelectTokenForPlay(pkg);
                                    onClose();
                                  }}
                                  className="px-3 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-stone-950 rounded-lg transition-colors"
                                >
                                  Mainkan
                                </button>
                              )}
                            </div>

                            <button
                              type="button"
                              onClick={() => handleDeleteToken(pkg.token)}
                              title="Hapus token ini"
                              className="p-1.5 text-stone-500 hover:text-red-400 hover:bg-red-950/40 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* TAB 3: SUBMISSIONS */}
              {activeTab === 'submissions' && (
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h4 className="text-sm font-bold text-stone-100">Rekap Nilai & Hasil Siswa</h4>
                      <p className="text-xs text-stone-400">Total {submissions.length} siswa telah mengirimkan hasil permainan.</p>
                    </div>

                    {submissions.length > 0 && (
                      <button
                        type="button"
                        onClick={handleExportSubmissions}
                        className="px-4 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-stone-950 rounded-xl flex items-center gap-2 shadow-md transition-colors"
                      >
                        <Download className="w-4 h-4" />
                        Unduh Rekap Nilai (Excel / TSV)
                      </button>
                    )}
                  </div>

                  {submissions.length === 0 ? (
                    <div className="p-8 text-center rounded-2xl border border-stone-800 bg-stone-950/40 space-y-2">
                      <Users className="w-8 h-8 text-stone-600 mx-auto" />
                      <p className="text-sm font-semibold text-stone-300">Belum Ada Hasil Siswa</p>
                      <p className="text-xs text-stone-500 max-w-sm mx-auto">
                        Setelah siswa menyelesaikan permainan kuis menggunakan Token Guru, mereka dapat menekan tombol "Kirim Hasil ke Guru" di akhir permainan.
                      </p>
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-stone-800 overflow-hidden bg-stone-950/60">
                      <div className="max-h-80 overflow-y-auto">
                        <table className="w-full text-xs text-left border-collapse">
                          <thead className="sticky top-0 bg-stone-800 text-stone-300 font-semibold border-b border-stone-700">
                            <tr>
                              <th className="p-3">Nama Siswa</th>
                              <th className="p-3">Token Kuis</th>
                              <th className="p-3 text-emerald-400">Benar / Dikerjakan</th>
                              <th className="p-3 text-emerald-400">Akurasi</th>
                              <th className="p-3 text-amber-300">Zombi Ditumpas</th>
                              <th className="p-3 text-yellow-300">Matahari</th>
                              <th className="p-3">Hasil</th>
                              <th className="p-3">Waktu</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-stone-800">
                            {submissions.map((sub) => (
                              <tr key={sub.id} className="hover:bg-stone-800/40 transition-colors">
                                <td className="p-3 font-bold text-stone-100">{sub.studentName}</td>
                                <td className="p-3 font-mono text-amber-300 font-semibold">{sub.token}</td>
                                <td className="p-3 font-mono text-emerald-400 font-bold">
                                  {sub.questionsCorrect} / {sub.questionsAnswered}
                                </td>
                                <td className="p-3 font-mono font-bold text-emerald-300">{sub.accuracy}%</td>
                                <td className="p-3 font-mono text-stone-300">{sub.zombiesKilled}</td>
                                <td className="p-3 font-mono text-yellow-300">{sub.sunsCollected}</td>
                                <td className="p-3">
                                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                    sub.gameOutcome === 'victory' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-red-950 text-red-400 border border-red-800'
                                  }`}>
                                    {sub.gameOutcome === 'victory' ? 'Menang' : 'Kalah'}
                                  </span>
                                </td>
                                <td className="p-3 text-stone-500 font-mono text-[11px]">
                                  {new Date(sub.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                </div>
              )}

            </div>

          </div>
        )}

      </div>
    </div>
  );
};