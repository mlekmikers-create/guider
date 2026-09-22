export type Language = 'hy' | 'en';

export type UserRole = 'teacher' | 'inspector' | 'principal';

export type MarzName =
  | 'Երևան'
  | 'Շիրակ'
  | 'Լոռի'
  | 'Կոտայք'
  | 'Արմավիր'
  | 'Արարատ'
  | 'Գեղարքունիք'
  | 'Սյունիք'
  | 'Տավուշ'
  | 'Արագածոտն'
  | 'Վայոց ձոր';

export interface SubjectItem {
  id: string;
  nameHy: string;
  nameEn: string;
  code: string;
  iconName: string;
  weeklyHours: number;
}

export type AttendanceType = 'present' | 'absent_excused' | 'absent_unexcused' | 'late';

export type GradeType = 'thematic' | 'formative' | 'practical' | 'oral' | 'summative';

export interface StudentRecord {
  id: string;
  rollNo: number;
  fullNameHy: string;
  fullNameEn: string;
  gender: 'M' | 'F';
  classGrade: string; // e.g., "9-րդ Ա"
  parentName: string;
  parentPhone: string;
  parentTelegram?: string;
  parentLanguage: 'hy' | 'en';
  attendance: {
    [dateKey: string]: AttendanceType;
  };
  grades: {
    [dateKey: string]: {
      score: number; // 1 to 10
      type: GradeType;
      topic?: string;
      notes?: string;
    };
  };
  notes?: string;
}

export interface LessonPlan {
  id: string;
  title: string;
  subjectId: string;
  gradeLevel: string;
  durationMinutes: number;
  date: string;
  curriculumCode: string; // e.g., "ՀՊՉ-Մ9.3"
  competencies: string[]; // State standard key competencies
  learningOutcomes: string[];
  phases: {
    evocation: {
      durationMinutes: number;
      method: string;
      description: string;
      teacherAction: string;
      studentAction: string;
    };
    realization: {
      durationMinutes: number;
      method: string;
      description: string;
      teacherAction: string;
      studentAction: string;
    };
    reflection: {
      durationMinutes: number;
      method: string;
      description: string;
      teacherAction: string;
      studentAction: string;
    };
  };
  differentiation: {
    basic: string;
    advanced: string;
    supportNeed: string;
  };
  assessmentCriteria: string;
  materials: string[];
  homework: string;
  status: 'draft' | 'approved' | 'submitted_emis';
  aiProviderUsed?: string;
}

export interface ParentCommunicationMessage {
  id: string;
  studentId: string;
  studentName: string;
  parentName: string;
  parentPhone: string;
  category: 'progress' | 'attendance_alert' | 'thematic_notice' | 'commendation' | 'meeting_invite';
  channel: 'viber' | 'telegram' | 'sms' | 'emis_notification';
  title: string;
  bodyArmenian: string;
  bodyEnglish: string;
  sentAt: string;
  status: 'sent' | 'draft' | 'queued';
}

export interface TeacherMetric {
  id: string;
  fullName: string;
  schoolName: string;
  marz: MarzName;
  subject: string;
  experienceYears: number;
  qualificationCategory: 'Որակավորման 1-ին տարակարգ' | 'Որակավորման 2-րդ տարակարգ' | 'Կամավոր ատեստավորված (80%+)' | 'Հիմնական մասնագետ';
  activeClassCount: number;
  syllabusCompletionPct: number; // e.g. 96%
  averageClassGrade: number; // e.g. 7.4
  gradeInflationRisk: 'low' | 'moderate' | 'high';
  electronicJournalRegularity: number; // e.g. 98%
  stateInspectionStatus: 'compliant' | 'distinguished' | 'needs_audit';
  lastInspectionDate: string;
  inspectorNotes?: string;
}

export interface NationalEducationStats {
  totalSchools: number;
  totalTeachers: number;
  totalStudents: number;
  nationalAverageGrade: number;
  syllabusProgressPct: number;
  stateStandardImplementationPct: number;
  marzPerformance: {
    marz: MarzName;
    schoolsCount: number;
    teachersCount: number;
    avgGrade: number;
    syllabusPct: number;
    inspectionPassRate: number;
  }[];
}

export type AIProviderId = 'gemini' | 'openai' | 'firebird' | 'custom';

export interface AIProviderConfig {
  activeProvider: AIProviderId;
  openaiKey?: string;
  openaiModel?: string;
  firebirdKey?: string;
  firebirdBaseUrl?: string;
  firebirdModel?: string;
  customBaseUrl?: string;
  customApiKey?: string;
  customModel?: string;
}
