"use client";

// 학생 성적 조회 테이블 — 반별 필터 + 이름/학번 실시간 검색
// Recharts 없음, Client Component는 useState/useMemo 필요

import { useState, useMemo } from "react";
import { Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { StudentGrade, ClassCode } from "@/types/grades";

// ---------------------------------------------------------------------------
// 타입 정의
// ---------------------------------------------------------------------------

interface StudentTableProps {
  students: StudentGrade[];
}

// 필터 타입 — 전체 또는 특정 반
type ClassFilter = "all" | ClassCode;

// ---------------------------------------------------------------------------
// 컴포넌트
// ---------------------------------------------------------------------------

/**
 * 학생 성적 조회 테이블
 * - 반별 필터 버튼 그룹 (전체/A반/B반/C반)
 * - 이름 또는 학번 실시간 검색 (대소문자 무시, string.includes 방식)
 * - useMemo로 필터링 최적화
 */
export function StudentTable({ students }: StudentTableProps) {
  // 반별 필터 상태 — 초기값: 전체
  const [classFilter, setClassFilter] = useState<ClassFilter>("all");
  // 검색어 상태
  const [searchQuery, setSearchQuery] = useState("");

  // 필터링된 학생 목록 — 반 필터 + 검색어 조합 (메모이제이션)
  const filteredStudents = useMemo(() => {
    const query = searchQuery.toLowerCase();

    return students.filter((student) => {
      // 반 필터: 'all'이면 전체, 아니면 해당 반만
      const passClass =
        classFilter === "all" || student.classCode === classFilter;

      // 검색 필터: 이름 또는 학번에 검색어 포함 여부 (대소문자 무시)
      const passSearch =
        query === "" ||
        student.name.toLowerCase().includes(query) ||
        student.studentId.toLowerCase().includes(query);

      return passClass && passSearch;
    });
  }, [students, classFilter, searchQuery]);

  // ---------------------------------------------------------------------------
  // 필터 버튼 스타일 헬퍼
  // ---------------------------------------------------------------------------

  const filterBtnClass = (value: ClassFilter) =>
    value === classFilter
      ? "rounded-md px-3 py-1.5 text-sm font-medium transition-colors bg-primary text-primary-foreground"
      : "rounded-md px-3 py-1.5 text-sm font-medium transition-colors bg-muted text-muted-foreground hover:bg-muted/80";

  return (
    <Card>
      <CardHeader>
        <CardTitle>학생 성적 조회</CardTitle>
      </CardHeader>
      <CardContent>
        {/* 컨트롤 영역 — 반 필터 + 검색창 */}
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {/* 반별 필터 버튼 그룹 */}
          <div className="flex gap-2">
            {(["all", "A", "B", "C"] as const).map((value) => (
              <button
                key={value}
                onClick={() => setClassFilter(value)}
                className={filterBtnClass(value)}
              >
                {value === "all" ? "전체" : `${value}반`}
              </button>
            ))}
          </div>

          {/* 이름/학번 검색창 */}
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="이름 또는 학번 검색"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9 w-full rounded-md border border-input bg-background pl-8 pr-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring sm:w-60"
            />
          </div>
        </div>

        {/* 결과 카운트 */}
        <p className="mb-3 text-sm text-muted-foreground">
          {filteredStudents.length}명 표시 중 (전체 {students.length}명)
        </p>

        {/* 성적 테이블 */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>이름</TableHead>
                <TableHead>학번</TableHead>
                <TableHead>반</TableHead>
                <TableHead className="text-right">사전학습</TableHead>
                <TableHead className="text-right">보고서</TableHead>
                <TableHead className="text-right">실습지도교수</TableHead>
                <TableHead className="text-right">현장지도자</TableHead>
                <TableHead className="text-right">총점</TableHead>
                <TableHead className="text-right">핵심간호술</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudents.length === 0 ? (
                // 검색 결과 없음
                <TableRow>
                  <TableCell
                    colSpan={9}
                    className="py-8 text-center text-muted-foreground"
                  >
                    검색 결과가 없습니다
                  </TableCell>
                </TableRow>
              ) : (
                filteredStudents.map((student) => (
                  // key에 studentId 사용 — 익명화된 이름 동명이인 방지
                  <TableRow key={student.studentId}>
                    <TableCell className="font-medium">{student.name}</TableCell>
                    <TableCell>{student.studentId}</TableCell>
                    <TableCell>{student.classCode}반</TableCell>
                    <TableCell className="text-right">{student.preLearning}</TableCell>
                    <TableCell className="text-right">{student.reportTotal}</TableCell>
                    <TableCell className="text-right">{student.profTotal}</TableCell>
                    <TableCell className="text-right">{student.fieldTotal}</TableCell>
                    <TableCell className="text-right font-semibold">{student.totalScore}</TableCell>
                    {/* 핵심간호술 — 총점과 시각적으로 구분되는 색상 */}
                    <TableCell className="text-right text-blue-600 dark:text-blue-400">
                      {student.nursingSkills}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
