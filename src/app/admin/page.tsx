"use client";

import Link from "next/link";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  Users,
  UserPlus,
  Shield,
  BarChart3,
  BookOpen,
  Flame,
  ChevronRight,
  X,
  Check,
  AlertCircle,
} from "lucide-react";
import { USERS } from "@/types/user";
import {
  getUserProgress,
  fetchErrorBook,
  initializeUserWithData,
  getAllSmartScores,
  getCurrentUser,
  setCurrentUser,
} from "@/lib/dataService";
import type { ErrorBookEntry } from "@/lib/dataService";

interface StudentRow {
  id: string;
  name: string;
  avatar: string;
  streak: number;
  dailyMinutes: number;
  dailyGoalMinutes: number;
  errorBookCount: number;
  totalPoints: number;
  smartScores: Record<string, number>;
}

interface NewStudentForm {
  nickname: string;
  gradeLevel: string;
  achievements: string;
  targetSubjects: string[];
  adaptiveLevel: "A" | "B";
  streak: number;
}

const subjectOptions = ["math", "english", "science", "logic", "physics", "chemistry"];

function AdminContent() {
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [showForm, setShowForm] = useState(false);
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get("action") === "add") {
      setShowForm(true);
    }
  }, [searchParams]);
  const [formData, setFormData] = useState<NewStudentForm>({
    nickname: "",
    gradeLevel: "",
    achievements: "",
    targetSubjects: [],
    adaptiveLevel: "A",
    streak: 0,
  });
  const [formError, setFormError] = useState(" ");
  const [formSuccess, setFormSuccess] = useState(false);

  const [selectedUser, setSelectedUser] = useState<StudentRow | null>(null);
  const [selectedUserErrorBook, setSelectedUserErrorBook] = useState<ErrorBookEntry[]>([]);
  const [selectedUserBySubject, setSelectedUserBySubject] = useState<Record<string, ErrorBookEntry[]>>({});
  const [loadingErrorBook, setLoadingErrorBook] = useState(false);
  const [activeErrorSubject, setActiveErrorSubject] = useState<string>("all");

  useEffect(() => { loadStudents(); }, []);

  async function loadStudents() {
    const rows: StudentRow[] = await Promise.all(
      USERS.map(async (user) => {
        const progress = getUserProgress(user.id);
        const errorBook = await fetchErrorBook(user.id);
        let smartScores: Record<string, number> = { math: 50, english: 50, science: 50, logic: 50, physics: 50, chemistry: 50 };
        try {
          smartScores = await getAllSmartScores(user.id);
        } catch { /* use defaults */ }
        return {
          id: user.id,
          name: user.name,
          avatar: user.avatar,
          streak: progress.streak || user.streak,
          dailyMinutes: progress.dailyMinutes || user.dailyMinutes,
          dailyGoalMinutes: user.dailyGoalMinutes,
          errorBookCount: errorBook.length,
          totalPoints: progress.totalPoints || 0,
          smartScores,
        };
      })
    );
    setStudents(rows);
  }

  const handleSubjectToggle = (subject: string) => {
    setFormData((prev) => ({
      ...prev,
      targetSubjects: prev.targetSubjects.includes(subject)
        ? prev.targetSubjects.filter((s) => s !== subject)
        : [...prev.targetSubjects, subject],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(" ");
    if (!formData.nickname.trim()) { setFormError("Nickname is required"); return; }
    if (!formData.gradeLevel.trim()) { setFormError("Grade level is required"); return; }
    if (formData.targetSubjects.length === 0) { setFormError("Select at least one subject"); return; }
    const userId = formData.nickname.toLowerCase().replace(/ /g, "-");
    try {
      await initializeUserWithData(userId, {
        nickname: formData.nickname,
        gradeLevel: formData.gradeLevel,
        achievements: formData.achievements,
        targetSubjects: formData.targetSubjects,
        adaptiveLevel: formData.adaptiveLevel,
        streak: formData.streak,
      });
      setFormSuccess(true);
      setShowForm(false);
      setFormData({ nickname: "", gradeLevel: "", achievements: "", targetSubjects: [], adaptiveLevel: "A", streak: 0 });
      loadStudents();
      setTimeout(() => setFormSuccess(false), 3000);
    } catch { setFormError("Failed to create student"); }
  };

  const openUserModal = async (student: StudentRow) => {
    setSelectedUser(student);
    setLoadingErrorBook(true);
    setActiveErrorSubject("all");
    try {
      const book = await fetchErrorBook(student.id);
      setSelectedUserErrorBook(book);
      const bySubject: Record<string, ErrorBookEntry[]> = {};
      book.forEach((entry) => {
        const sub = entry.question.subject;
        if (!bySubject[sub]) bySubject[sub] = [];
        bySubject[sub].push(entry);
      });
      setSelectedUserBySubject(bySubject);
    } catch {
      setSelectedUserErrorBook([]);
      setSelectedUserBySubject({});
    } finally {
      setLoadingErrorBook(false);
    }
  };

  const closeModal = () => {
    setSelectedUser(null);
    setSelectedUserErrorBook([]);
    setSelectedUserBySubject({});
  };

  const handleViewStudent = (studentId: string) => {
    setCurrentUser(studentId);
    window.location.href = `/${studentId}`;
  };

  const displayedErrorBook = activeErrorSubject === "all"
    ? selectedUserErrorBook
    : (selectedUserBySubject[activeErrorSubject] || []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-10">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight">Parent Dashboard</h1>
            <p className="text-slate-500 mt-1 font-medium text-sm sm:text-base">Manage students and monitor progress</p>
          </div>
          <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 border-2 border-cyan-400 rounded-xl text-white font-bold shadow-lg hover:shadow-xl transition-all text-sm w-fit">
            <UserPlus className="w-4 h-4" />
            Add Student
          </button>
        </header>

        {formSuccess && (
          <div className="mb-6 flex items-center gap-3 px-5 py-4 bg-green-50 border border-green-200 rounded-xl">
            <Check className="w-5 h-5 text-green-500" />
            <span className="font-semibold text-green-700">Student added successfully</span>
          </div>
        )}

        {showForm && (
          <div className="mb-10 bg-white rounded-2xl p-6 shadow-lg border border-slate-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-slate-800">Add New Student</h2>
              <button onClick={() => setShowForm(false)} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Nickname</label>
                  <input type="text" value={formData.nickname} onChange={(e) => setFormData({ ...formData, nickname: e.target.value })} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all" placeholder="e.g. Lily" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Grade Level</label>
                  <input type="text" value={formData.gradeLevel} onChange={(e) => setFormData({ ...formData, gradeLevel: e.target.value })} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all" placeholder="e.g. Junior Cycle" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Adaptive Level</label>
                  <select value={formData.adaptiveLevel} onChange={(e) => setFormData({ ...formData, adaptiveLevel: e.target.value as "A" | "B" })} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all">
                    <option value="A">Level A - Junior Cycle</option>
                    <option value="B">Level B - Senior Cycle</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Starting Streak</label>
                  <input type="number" min="0" value={formData.streak} onChange={(e) => setFormData({ ...formData, streak: parseInt(e.target.value) || 0 })} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Achievements (optional)</label>
                <input type="text" value={formData.achievements} onChange={(e) => setFormData({ ...formData, achievements: e.target.value })} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all" placeholder="e.g. IMTA Master, Bebras Brain" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Target Subjects</label>
                <div className="flex flex-wrap gap-2">
                  {subjectOptions.map((subject) => (
                    <button key={subject} type="button" onClick={() => handleSubjectToggle(subject)} className={"px-4 py-2 rounded-xl font-medium text-sm transition-all " + (formData.targetSubjects.includes(subject) ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200")}>
                      {subject.charAt(0).toUpperCase() + subject.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              {formError.trim() && <p className="text-sm text-red-500 font-medium">{formError}</p>}
              <div className="flex flex-col sm:flex-row justify-end gap-3">
                <button type="submit" className="px-6 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all text-sm w-full sm:w-auto">Create Student</button>
              </div>
            </form>
          </div>
        )}

        <section className="mb-10">
          <h2 className="text-lg font-semibold text-slate-700 mb-4 flex items-center gap-2"><BarChart3 className="w-5 h-5 text-purple-500" />Student Analytics</h2>
          <div className="bg-white rounded-2xl shadow-md border border-slate-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Student</th>
                    {subjectOptions.map((sub) => (
                      <th key={sub} className="text-center px-3 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden lg:table-cell">{sub.charAt(0).toUpperCase() + sub.slice(1)}</th>
                    ))}
                    <th className="text-center px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Streak</th>
                    <th className="text-center px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Today</th>
                    <th className="text-center px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Reviews</th>
                    <th className="text-right px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student) => (
                    <tr key={student.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                      <td className="px-5 py-4"><div className="flex items-center gap-3"><span className="text-2xl">{student.avatar}</span><span className="font-semibold text-slate-800">{student.name}</span></div></td>
                      {subjectOptions.map((sub) => (
                        <td key={sub} className="px-3 py-4 text-center hidden lg:table-cell">
                          <span className={`inline-flex items-center justify-center w-10 h-10 rounded-full text-xs font-bold ${student.smartScores[sub] >= 70 ? "bg-green-100 text-green-700" : student.smartScores[sub] >= 40 ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700"}`}>
                            {student.smartScores[sub] || 50}
                          </span>
                        </td>
                      ))}
                      <td className="px-4 py-4 text-center"><div className="flex items-center justify-center gap-1"><Flame className="w-4 h-4 text-orange-500" /><span className="font-bold text-orange-600">{student.streak}</span></div></td>
                      <td className="px-4 py-4 text-center"><div className="flex items-center justify-center gap-1 text-sm"><span className="font-medium text-slate-600">{student.dailyMinutes}</span><span className="text-slate-400">/</span><span className="text-slate-500">{student.dailyGoalMinutes}m</span></div></td>
                      <td className="px-4 py-4 text-center"><span className={"inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold " + (student.errorBookCount > 0 ? "bg-red-50 text-red-600" : "bg-green-50 text-green-600")}><BookOpen className="w-3 h-3" />{student.errorBookCount}</span></td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => openUserModal(student)} className="inline-flex items-center gap-1 text-sm font-medium text-purple-600 hover:text-purple-700 transition-colors">Details</button>
                          <span className="text-slate-300">|</span>
                          <button onClick={() => handleViewStudent(student.id)} className="inline-flex items-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors">View</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-700 mb-4 flex items-center gap-2"><Users className="w-5 h-5 text-indigo-500" />Quick Access</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {students.map((student) => (
              <button key={student.id} onClick={() => openUserModal(student)} className="group relative overflow-hidden rounded-2xl p-5 bg-white border border-slate-100 shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5 text-left">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center shadow-sm">
                    <span className="text-3xl">{student.avatar}</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-slate-800">{student.name}</h3>
                    <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
                      <span className="flex items-center gap-1"><Flame className="w-3 h-3 text-orange-500" />{student.streak}</span>
                      <span className="flex items-center gap-1"><BookOpen className="w-3 h-3 text-red-400" />{student.errorBookCount}</span>
                    </div>
                  </div>
                </div>
                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity"><ChevronRight className="w-5 h-5 text-purple-500" /></div>
              </button>
            ))}
          </div>
        </section>
      </div>

      {selectedUser && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] sm:max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <div className="flex items-center gap-4">
                <span className="text-4xl">{selectedUser.avatar}</span>
                <div>
                  <h2 className="text-xl font-bold text-slate-800">{selectedUser.name}</h2>
                  <p className="text-sm text-slate-500">{selectedUser.streak} day streak · {selectedUser.totalPoints.toLocaleString()} XP</p>
                </div>
              </div>
              <button onClick={closeModal} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">SmartScores</h3>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                  {subjectOptions.map((sub) => {
                    const score = selectedUser.smartScores[sub] || 50;
                    return (
                      <div key={sub} className={`text-center p-3 rounded-xl ${score >= 70 ? "bg-green-50 border border-green-200" : score >= 40 ? "bg-yellow-50 border border-yellow-200" : "bg-red-50 border border-red-200"}`}>
                        <div className={`text-xl font-bold ${score >= 70 ? "text-green-600" : score >= 40 ? "text-yellow-600" : "text-red-600"}`}>{score}</div>
                        <div className="text-xs text-slate-500 mt-1">{sub.charAt(0).toUpperCase() + sub.slice(1)}</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />Error Book ({selectedUserErrorBook.length})
                </h3>
                {selectedUserErrorBook.length === 0 ? (
                  <div className="flex items-center gap-3 p-4 bg-green-50 rounded-xl text-green-700">
                    <Check className="w-5 h-5 text-green-500" />
                    <span className="font-medium">No errors — student is all caught up!</span>
                  </div>
                ) : (
                  <>
                    <div className="flex flex-wrap gap-2 mb-4">
                      <button onClick={() => setActiveErrorSubject("all")} className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${activeErrorSubject === "all" ? "bg-indigo-500 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>
                        All ({selectedUserErrorBook.length})
                      </button>
                      {Object.keys(selectedUserBySubject).map((sub) => (
                        <button key={sub} onClick={() => setActiveErrorSubject(sub)} className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${activeErrorSubject === sub ? "bg-indigo-500 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>
                          {sub.charAt(0).toUpperCase() + sub.slice(1)} ({selectedUserBySubject[sub].length})
                        </button>
                      ))}
                    </div>
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {displayedErrorBook.map((entry, i) => (
                        <div key={`${entry.question.id}-${i}`} className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs font-semibold text-indigo-500 uppercase">{entry.question.subject}</span>
                                <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${entry.question.difficulty === "easy" ? "bg-green-100 text-green-700" : entry.question.difficulty === "medium" ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700"}`}>{entry.question.difficulty}</span>
                              </div>
                              <p className="text-sm text-slate-700 font-medium">{entry.question.question}</p>
                              <p className="text-xs text-slate-400 mt-1">Reviewed {entry.timesReviewed}x · Last: {entry.lastReviewedAt ? new Date(entry.lastReviewedAt).toLocaleDateString() : "Never"}</p>
                            </div>
                            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3">
              <button onClick={closeModal} className="px-5 py-2.5 bg-slate-100 text-slate-700 font-semibold rounded-xl hover:bg-slate-200 transition-all">Close</button>
              <button onClick={() => { handleViewStudent(selectedUser.id); closeModal(); }} className="px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-semibold rounded-xl hover:from-indigo-600 hover:to-purple-600 transition-all">Open Student View</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminDashboard() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-10 w-10 border-2 border-indigo-500 border-t-transparent" /></div>}>
      <AdminContent />
    </Suspense>
  );
}