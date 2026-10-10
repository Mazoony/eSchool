import { notFound } from 'next/navigation';
import ClassLessonsClient from '../../ClassLessonsClient';
import { getGrade } from '../../curriculum';

export default async function ClassLessonsPage({
  params,
}: {
  params: Promise<{ id: string; class: string }>;
}) {
  const { id, class: classSlug } = await params;
  const grade = getGrade(id);
  const classMatch = /^class-([1-6])$/.exec(classSlug);
  const classNumber = classMatch ? Number(classMatch[1]) : NaN;

  if (!grade || !Number.isInteger(classNumber) || classNumber > grade.classCount) notFound();

  return <ClassLessonsClient gradeId={grade.id} classNumber={classNumber} />;
}
