import { Question, StudentSubmission, TeacherTokenPackage } from '../types/game';
import { parseSpreadsheetData, PRESET_BIOLOGI } from './spreadsheetParser';

const TEACHER_TOKENS_KEY = 'pvz_teacher_tokens';
const SUBMISSIONS_KEY = 'pvz_student_submissions';

/**
 * Generate a clean, student-friendly 4-6 char token like GURU-4821 or PVZ-319
 */
export function generateTokenCode(prefix = 'GURU'): string {
  const num = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${num}`;
}

/**
 * Extract Google Sheets ID from URL and build CSV export URL
 */
export function convertGoogleSheetsUrlToCsv(rawUrl: string): string {
  const trimmed = rawUrl.trim();
  
  // If already a direct CSV/export URL
  if (trimmed.includes('output=csv') || trimmed.includes('format=csv') || trimmed.includes('tqx=out:csv')) {
    return trimmed;
  }

  // Extract Sheet ID from standard Google Sheets URL:
  // e.g. https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit...
  const match = trimmed.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (match && match[1]) {
    const sheetId = match[1];
    // Google Visualization API CSV export endpoint (works reliably on public sheets)
    return `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv`;
  }

  return trimmed;
}

/**
 * Fetch and parse spreadsheet from public Google Sheets URL
 */
export async function fetchQuestionsFromGoogleSheets(url: string): Promise<{ questions: Question[]; error?: string }> {
  try {
    const csvUrl = convertGoogleSheetsUrlToCsv(url);
    const response = await fetch(csvUrl);
    
    if (!response.ok) {
      return {
        questions: [],
        error: `Gagal mengunduh spreadsheet (Status: ${response.status}). Pastikan izin spreadsheet disetel ke: "Siapa saja yang memiliki link dapat melihat".`
      };
    }

    const csvText = await response.text();
    const parsed = parseSpreadsheetData(csvText, true);

    if (parsed.questions.length === 0) {
      return {
        questions: [],
        error: parsed.errors.length > 0 
          ? parsed.errors.join(' ') 
          : 'Spreadsheet berhasil diunduh namun tidak ditemukan baris soal yang valid (Kolom A: Pertanyaan, Kolom B: Jawaban Benar, Kolom C, D, E: Pengecoh).'
      };
    }

    return { questions: parsed.questions };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      questions: [],
      error: `Koneksi gagal (${message}). Pastikan link benar dan spreadsheet dapat diakses publik, atau gunakan fitur tempel langsung.`
    };
  }
}

/**
 * Get all teacher token packages
 */
export function getTeacherTokens(): TeacherTokenPackage[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(TEACHER_TOKENS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to load teacher tokens:', e);
  }

  // Create default starter token if none exists
  const defaultPackage: TeacherTokenPackage = {
    token: 'GURU-101',
    title: 'Kuis Biologi Tumbuhan (Kelas 5)',
    spreadsheetUrl: 'Preset Bawaan',
    questions: PRESET_BIOLOGI,
    createdAt: Date.now() - 3600000
  };
  saveTeacherTokens([defaultPackage]);
  return [defaultPackage];
}

/**
 * Save teacher token packages
 */
export function saveTeacherTokens(tokens: TeacherTokenPackage[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(TEACHER_TOKENS_KEY, JSON.stringify(tokens));
  } catch (e) {
    console.error('Failed to save teacher tokens:', e);
  }
}

/**
 * Find teacher package by token (case insensitive)
 */
export function findTokenPackage(tokenInput: string): TeacherTokenPackage | null {
  const tokens = getTeacherTokens();
  const cleanInput = tokenInput.trim().toUpperCase();
  return tokens.find(t => t.token.toUpperCase() === cleanInput) || null;
}

/**
 * Get all student submissions
 */
export function getStudentSubmissions(): StudentSubmission[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(SUBMISSIONS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to load student submissions:', e);
  }
  return [];
}

/**
 * Save student submission
 */
export function saveStudentSubmission(submission: StudentSubmission): void {
  if (typeof window === 'undefined') return;
  try {
    const current = getStudentSubmissions();
    const updated = [submission, ...current];
    localStorage.setItem(SUBMISSIONS_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save student submission:', e);
  }
}

/**
 * Export student submissions to CSV table for teacher download
 */
export function exportSubmissionsToCsv(submissions: StudentSubmission[]): string {
  const header = 'Tanggal\tNama Siswa\tToken Kuis\tJudul Kuis\tLevel\tHasil Game\tSoal Benar\tTotal Soal\tAkurasi (%)\tZombi Dikalahkan\tMatahari Terkumpul';
  const rows = submissions.map(s => {
    const dateStr = new Date(s.timestamp).toLocaleString('id-ID');
    const outcomeStr = s.gameOutcome === 'victory' ? 'Menang' : `Kalah (Gelombang ${s.waveReached})`;
    const levelStr = `Level ${s.level || 1}`;
    return `"${dateStr}"\t"${s.studentName}"\t"${s.token}"\t"${s.quizTitle}"\t"${levelStr}"\t"${outcomeStr}"\t${s.questionsCorrect}\t${s.questionsAnswered}\t${s.accuracy}%\t${s.zombiesKilled}\t${s.sunsCollected}`;
  });
  return [header, ...rows].join('\n');
}
