"use client";

// 하 등급 학생 드릴다운 패널 (Client Component)
// PO 탭 선택 → 반 필터 → 하 등급 학생 목록 → 학생 선택 시 세부점수 표시

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { StudentGrade } from "@/types/grades";
import type { PoKey } from "@/lib/grade-po";
import { getLowGradeStudents } from "@/lib/grade-po";

// ---------------------------------------------------------------------------
// 상수
// ---------------------------------------------------------------------------

/** PO 탭 목록 — LO2/LO5/LO3 순 */
const PO_TABS: { key: PoKey; label: string }[] = [
  { key: "po2", label: "LO2 대상자간호" },
  { key: "po5", label: "LO5 안전과질" },
  { key: "po3", label: "LO3 전문직" },
];

/** 반 필터 목록 */
const CLASS_FILTERS: { key: "all" | "A" | "B" | "C"; label: string }[] = [
  { key: "all", label: "전체" },
  { key: "A", label: "A반" },
  { key: "B", label: "B반" },
  { key: "C", label: "C반" },
];

/** PO 키 → 표시 이름 매핑 */
const PO_LABEL: Record<PoKey, string> = {
  po2: "LO2 대상자간호",
  po5: "LO5 안전과질",
  po3: "LO3 전문직",
};

// ---------------------------------------------------------------------------
// 타입
// ---------------------------------------------------------------------------

interface PoLowGradePanelProps {
  /** 전체 학생 배열 — Server Component에서 props로 전달받음 */
  students: StudentGrade[];
}

// ---------------------------------------------------------------------------
// 컴포넌트
// ---------------------------------------------------------------------------

/**
 * 하 등급 학생 드릴다운 패널
 * - PO 탭 선택 → 반 필터 → 하 등급 학생 목록 → 학생 클릭 시 세부점수 표시
 * - getGradeData()를 직접 호출하지 않음 — students는 Server Component에서 전달받음
 * - getLowGradeStudents()는 순수 TypeScript 함수이므로 Client에서 import 가능
 */
export function PoLowGradePanel({ students }: PoLowGradePanelProps) {
  // PO 탭 선택 상태 (기본값: po2)
  const [selectedPo, setSelectedPo] = useState<PoKey>("po2");
  // 반 필터 상태 (기본값: 전체)
  const [selectedClass, setSelectedClass] = useState<"all" | "A" | "B" | "C">(
    "all"
  );
  // 선택된 학생 (기본값: 없음)
  const [selectedStudent, setSelectedStudent] = useState<StudentGrade | null>(
    null
  );

  // 하 등급 학생 목록 계산 (순수 함수 — 클라이언트에서 호출 가능)
  const lowGradeStudents = getLowGradeStudents(
    students,
    selectedPo,
    selectedClass === "all" ? undefined : selectedClass
  );

  // PO 탭 변경 핸들러 — selectedStudent, selectedClass 초기화
  function handlePoChange(poKey: PoKey) {
    setSelectedPo(poKey);
    setSelectedStudent(null);
    setSelectedClass("all");
  }

  // 반 필터 변경 핸들러 — selectedStudent 초기화
  function handleClassChange(classKey: "all" | "A" | "B" | "C") {
    setSelectedClass(classKey);
    setSelectedStudent(null);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>하 등급 학생 드릴다운</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* PO 탭 */}
        <div className="flex gap-2 flex-wrap">
          {PO_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => handlePoChange(tab.key)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                selectedPo === tab.key
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* 반 필터 */}
        <div className="flex gap-2 flex-wrap">
          {CLASS_FILTERS.map((filter) => (
            <button
              key={filter.key}
              onClick={() => handleClassChange(filter.key)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                selectedClass === filter.key
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {/* 목록 + 세부점수 그리드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 좌: 하 등급 학생 목록 */}
          <div className="space-y-2">
            {/* 카운트 헤더 */}
            <p className="text-sm text-muted-foreground">
              하 등급 학생{" "}
              <span className="font-semibold text-foreground">
                {lowGradeStudents.length}명
              </span>
            </p>

            {/* 빈 상태 */}
            {lowGradeStudents.length === 0 ? (
              <div className="flex items-center justify-center h-24 text-sm text-muted-foreground rounded-lg border border-dashed">
                하 등급 학생 없음
              </div>
            ) : (
              <ul className="space-y-1">
                {lowGradeStudents.map((student) => (
                  <li key={student.studentId}>
                    <button
                      onClick={() => setSelectedStudent(student)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-sm transition-colors ${
                        selectedStudent?.studentId === student.studentId
                          ? "bg-accent text-accent-foreground"
                          : "hover:bg-muted"
                      }`}
                    >
                      {/* 이름 + 반 */}
                      <span className="font-medium">
                        {student.name}{" "}
                        <span className="text-muted-foreground font-normal">
                          ({student.classCode}반)
                        </span>
                      </span>
                      {/* 해당 PO 점수 */}
                      <span className="text-muted-foreground">
                        {student[selectedPo]}점
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* 우: 선택된 학생 세부점수 패널 */}
          {selectedStudent ? (
            <div className="border rounded-lg p-4 space-y-3">
              {/* 학생 이름 (익명화 상태 그대로) */}
              <h3 className="font-semibold text-base">
                {selectedStudent.name}{" "}
                <span className="text-muted-foreground font-normal text-sm">
                  ({selectedStudent.classCode}반)
                </span>
              </h3>

              {/* 세부점수 목록 */}
              <dl className="space-y-2">
                <div className="flex justify-between text-sm">
                  <dt className="text-muted-foreground">사전학습</dt>
                  <dd>
                    {selectedStudent.preLearning}점{" "}
                    <span className="text-muted-foreground">/ 10점</span>
                  </dd>
                </div>

                <div className="flex justify-between text-sm">
                  <dt className="text-muted-foreground">보고서</dt>
                  <dd>
                    {selectedStudent.reportTotal}점{" "}
                    <span className="text-muted-foreground">/ 30점</span>
                  </dd>
                </div>

                <div className="flex justify-between text-sm">
                  <dt className="text-muted-foreground">실습지도교수</dt>
                  <dd>
                    {selectedStudent.profTotal}점{" "}
                    <span className="text-muted-foreground">/ 20점</span>
                  </dd>
                </div>

                <div className="flex justify-between text-sm">
                  <dt className="text-muted-foreground">현장지도자</dt>
                  <dd>
                    {selectedStudent.fieldTotal}점{" "}
                    <span className="text-muted-foreground">/ 20점</span>
                  </dd>
                </div>

                {/* 해당 PO 점수 — border-t로 구분, 빨강 강조 */}
                <div className="flex justify-between text-sm pt-2 border-t font-medium">
                  <dt>{PO_LABEL[selectedPo]} 점수</dt>
                  <dd className="text-red-500 dark:text-red-400">
                    {selectedStudent[selectedPo]}점
                  </dd>
                </div>
              </dl>
            </div>
          ) : (
            /* 선택 전 안내 메시지 */
            <div className="flex items-center justify-center h-full min-h-24 text-sm text-muted-foreground rounded-lg border border-dashed">
              학생을 선택하면 세부점수가 표시됩니다
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
