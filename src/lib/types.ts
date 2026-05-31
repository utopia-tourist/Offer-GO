export type SectionType = "personal" | "education" | "experience" | "project" | "skills" | "resume";

export type PersonalInfo = {
  name: string;
  phone: string;
  email: string;
  city: string;
  targetRole: string;
  link: string;
};

export type Education = {
  id: string;
  school: string;
  degree: string;
  major: string;
  startDate: string;
  endDate: string;
  gpa: string;
  courses: string;
  honors: string;
};

export type Experience = {
  id: string;
  company: string;
  role: string;
  startDate: string;
  endDate: string;
  responsibilities: string;
  achievements: string;
};

export type Project = {
  id: string;
  name: string;
  role: string;
  startDate: string;
  endDate: string;
  background: string;
  responsibilities: string;
  results: string;
};

export type Skills = {
  keywords: string;
  languages: string;
  tools: string;
  certificates: string;
};

export type ResumeStyle = {
  fontFamily: "system" | "serif" | "sans";
  fontSize: number;
  lineHeight: number;
  paragraphSpacing: number;
};

export type ResumeData = {
  personalInfo: PersonalInfo;
  education: Education[];
  experiences: Experience[];
  projects: Project[];
  skills: Skills;
  style?: ResumeStyle;
};

export type ImportMarkdownSections = {
  personal: string;
  education: string;
  experiences: string;
  projects: string;
  skills: string;
};

export type OptimizeSectionRequest = {
  sectionType: SectionType;
  content: string;
  targetJob?: string;
};

export type OptimizeSectionResult = {
  optimizedText: string;
  explanation: string;
};

export type OptimizeResumeRequest = {
  resume: ResumeData;
  targetJob?: string;
  jobDescription?: string;
  jdMatchReport?: JdMatchReport;
};

export type OptimizeResumeResult = {
  optimizedResumeMarkdown: string;
  updatedAt: string;
};

export type DiagnoseRequest = {
  resume: ResumeData;
  jobDescription: string;
};

export type DiagnoseResult = {
  score: number;
  coveredSkills: string[];
  missingSkills: string[];
  weakSections: string[];
  keywords: string[];
  suggestions: string[] | AiSuggestion[];
};

export type JdMatchDimensionScores = {
  skillMatch: number;
  experienceMatch: number;
  projectFit: number;
  contentQuality: number;
};

export type JdTargetAnalysis = {
  targetRole: string;
  industry: string;
  seniority: string;
  jobFamily: string;
  coreResponsibilities: string[];
  requiredSkills: string[];
  preferredSkills: string[];
  toolsAndMethods: string[];
  businessScenarios: string[];
  hiddenRequirements: string[];
};

export type JdMatchReport = {
  targetAnalysis?: JdTargetAnalysis;
  totalScore: number;
  candidateSummary: string;
  dimensions: JdMatchDimensionScores;
  scoreRationale?: Partial<Record<keyof JdMatchDimensionScores, string>>;
  highlights: string[];
  gaps: string[];
  structureAdvice: string[];
  atsKeywords: string[];
  optimizedResumeMarkdown: string;
  suggestions: AiSuggestion[];
};

export type ResumeOptimizationState = {
  originalResumeMarkdown: string;
  jdMatchReport: JdMatchReport;
  optimizedResumeMarkdown: string;
  updatedAt: string;
};

export type ResumeVersion = {
  id: string;
  name: string;
  createdAt: string;
  resume: ResumeData;
};

export type ResumeChange = {
  id: string;
  label: string;
  path: string;
  before: string;
  after: string;
};

export type CanvasBlockSection = "personal" | "education" | "experience" | "project" | "skills";

export type CanvasBlock = {
  id: string;
  section: CanvasBlockSection;
  label: string;
  path: string;
  value: string;
  itemId?: string;
  multiline?: boolean;
};

export type ImportQualityReport = {
  personalInfo: "recognized" | "missing";
  educationCount: number;
  experienceCount: number;
  projectCount: number;
  skillsRecognized: boolean;
  warnings: string[];
  confidence: "high" | "medium" | "low";
};

export type ResumeHealthReport = {
  completenessScore: number;
  professionalScore: number;
  quantificationScore: number;
  jdMatchScore?: number;
  majorIssues: string[];
  prioritySections: string[];
};

export type AiSuggestionType = "expression" | "jd_keyword" | "quantification" | "structure";
export type AiSuggestionStatus = "pending" | "accepted" | "ignored" | "edited";

export type AiSuggestion = {
  id: string;
  type: AiSuggestionType;
  targetPath: string;
  targetBlockId: string;
  locationLabel: string;
  originalText: string;
  suggestedText: string;
  reason: string;
  risk: string;
  status: AiSuggestionStatus;
};

export type CanvasHighlight = {
  blockId: string;
  kind: "suggested" | "applied";
  expiresAt?: number;
};

export type AnalyzeResumeRequest = {
  resume: ResumeData;
  targetJob?: string;
  jobDescription?: string;
};

export type AnalyzeResumeResult = {
  healthReport: ResumeHealthReport;
  suggestions: AiSuggestion[];
};

export type GenerateSuggestionsRequest = AnalyzeResumeRequest & {
  scope?: SectionType | "all";
};

export type AiResult =
  | { kind: "section"; title: string; result: OptimizeSectionResult; apply: () => void }
  | { kind: "resume"; title: string; result: OptimizeResumeResult; changes: ResumeChange[] }
  | { kind: "diagnosis"; title: string; result: DiagnoseResult };
