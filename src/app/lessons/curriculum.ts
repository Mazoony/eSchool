export const grades = [
  {
    id: 'elementary-school',
    title: 'Elementary School',
    description: 'Build strong foundations across six classes.',
    classCount: 6,
    accent: 'from-sky-500 to-blue-700',
  },
  {
    id: 'high-school',
    title: 'High School',
    description: 'Grow your skills through three classes.',
    classCount: 3,
    accent: 'from-violet-500 to-purple-700',
  },
  {
    id: 'secondary-school',
    title: 'Secondary School',
    description: 'Prepare for your next steps in three classes.',
    classCount: 3,
    accent: 'from-emerald-500 to-teal-700',
  },
] as const;

export type GradeId = (typeof grades)[number]['id'];

export function isGradeId(value: string): value is GradeId {
  return grades.some((grade) => grade.id === value);
}

export function getGrade(gradeId: string) {
  return grades.find((grade) => grade.id === gradeId);
}
