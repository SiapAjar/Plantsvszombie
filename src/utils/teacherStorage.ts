import { Question, TeacherTokenPackage, StudentSubmission } from '../types/game';

const TOKENS_KEY = 'pvs_teacher_tokens';
const SUBMISSIONS_KEY = 'pvs_student_submissions';

// ==========================================
// 1. FUNGSI UNTUK PORTAL GURU (TOKEN & SOAL)
// ==========================================
export const getTeacherTokens = (): TeacherTokenPackage[] => {
  try {
    const data = localStorage.getItem(TOKENS_KEY);
    return data ? JSON.parse(data) : [];
  } catch { return []; }
};

export const saveTeacherTokens = (tokens: TeacherTokenPackage[]) => {
  localStorage.setItem(TOKENS_KEY, JSON.stringify(tokens));
};

export const generateTokenCode = (prefix: string = 'GURU'): string => {
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${randomNum}`;
};

export const findTokenPackage = (tokenCode: string): TeacherTokenPackage | null => {
  const tokens = getTeacherTokens();
  return tokens.find(t => t.token.toUpperCase() === tokenCode.trim().toUpperCase()) || null;
};

export const fetchQuestionsFromGoogleSheets = async (url: string): Promise<{ questions: Question[], error?: string }> => {
  try {
    const match = url.match(/\/d\/([a-zA-Z0-9-_]+)/);
    if (!match) return { questions: [], error: 'URL Google Spreadsheet tidak valid.' };
    const sheetId = match[1];
    const csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv`;
    const response = await fetch(csvUrl);
    
    if (!response.ok) return { questions: [], error: 'Gagal mengunduh. Pastikan spreadsheet di-share "Anyone with the link".' };

    const csvText = await response.text();
    const lines = csvText.split('\n').filter(line => line.trim() !== '');
    const questions: Question[] = [];
    
    // Lewati baris pertama (header)
    for (let i = 1; i < lines.length; i++) {
      const row = lines[i].split(/[,\t]/).map(cell => cell.replace(/^"|"$/g, '').trim());
      if (row.length >= 2 && row[0] && row[1]) {
        questions.push({
          question: row[0],
          correctAnswer: row[1],
          distractor1: row[2] || '',
          distractor2: row[3] || '',
          distractor3: row[4] || ''
        });
      }
    }
    
    if (questions.length === 0) return { questions: [], error: 'Tidak ada soal valid yang ditemukan.' };
    return { questions };
  } catch (err) {
    return { questions: [], error: 'Terjadi kesalahan jaringan.' };
  }
};

// ==========================================
// 2. FUNGSI UNTUK NILAI SISWA (SUBMISSIONS)
// ==========================================
export const getStudentSubmissions = (): StudentSubmission[] => {
  try {
    const data = localStorage.getItem(SUBMISSIONS_KEY);
    return data ? JSON.parse(data) : [];
  } catch { return []; }
};

// Fungsi ini persis seperti yang dipanggil oleh SubmitResultModal.tsx Anda
export const saveStudentSubmission = (submission: StudentSubmission) => {
  const subs = getStudentSubmissions();
  
  // Cek apakah siswa ini sudah punya data dengan skor yang persis sama dalam 10 detik terakhir
  // (Mencegah duplikat jika tersimpan otomatis lalu siswa klik "Kirim" lagi)
  const existingIndex = subs.findIndex(
    s => s.studentName === submission.studentName && 
         s.token === submission.token &&
         s.accuracy === submission.accuracy &&
         s.zombiesKilled === submission.zombiesKilled &&
         Math.abs(s.timestamp - submission.timestamp) < 10000 // toleransi 10 detik
  );
  
  if (existingIndex >= 0) {
    // Jika sudah ada, perbarui datanya (bukan ditambah baru)
    subs[existingIndex] = submission;
  } else {
    // Jika belum ada, tambahkan sebagai data baru
    subs.push(submission);
  }
  
  localStorage.setItem(SUBMISSIONS_KEY, JSON.stringify(subs));
};

export const exportSubmissionsToCsv = (subs: StudentSubmission[]): string => {
  const headers = ['Nama Siswa', 'Token', 'Benar', 'Total Soal', 'Akurasi (%)', 'Zombi', 'Matahari', 'Hasil', 'Waktu'];
  const rows = subs.map(s => [
    s.studentName, s.token, s.questionsCorrect, s.questionsAnswered,
    s.accuracy, s.zombiesKilled, s.sunsCollected,
    s.gameOutcome === 'victory' ? 'Menang' : 'Kalah',
    new Date(s.timestamp).toLocaleString('id-ID')
  ]);
  return [headers.join('\t'), ...rows.map(r => r.join('\t'))].join('\n');
};

// ==========================================
// 3. FUNGSI UNTUK SPREADSHEET PARSER MANUAL
// ==========================================
export const parseSpreadsheetData = (text: string, isDirectPaste: boolean = false): Question[] => {
  const lines = text.split('\n').filter(line => line.trim() !== '');
  const questions: Question[] = [];
  const startIndex = isDirectPaste ? 0 : 1; 

  for (let i = startIndex; i < lines.length; i++) {
    const row = lines[i].split(/[,\t]/).map(cell => cell.replace(/^"|"$/g, '').trim());
    if (row.length >= 2 && row[0] && row[1]) {
      questions.push({
        question: row[0],
        correctAnswer: row[1],
        distractor1: row[2] || '',
        distractor2: row[3] || '',
        distractor3: row[4] || ''
      });
    }
  }
  return questions;
};