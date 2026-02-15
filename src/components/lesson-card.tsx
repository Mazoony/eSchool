import Link from "next/link";
import Image from "next/image";

interface LessonCardProps {
  title: string;
  description: string;
  thumbnail: string;
  href: string;
}

export default function LessonCard({ title, description, thumbnail, href }: LessonCardProps) {
  return (
    <Link href={href}>
      <div className="rounded-lg border bg-card text-card-foreground shadow-sm bg-white dark:bg-gray-800 hover:shadow-lg transition-all duration-200">
        <Image
          src={thumbnail}
          alt={title}
          width={400}
          height={225}
          className="rounded-t-lg object-cover"
        />
        <div className="p-6">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-50">{title}</h3>
          <p className="text-gray-500 dark:text-gray-400 mt-2">{description}</p>
        </div>
      </div>
    </Link>
  );
}
