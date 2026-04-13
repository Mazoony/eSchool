import Link from 'next/link';

const SubHeader = () => {
  return (
    <div className="bg-white shadow-md">
      <div className="container mx-auto px-4">
        <nav className="flex items-center justify-between py-4">
          <ul className="flex items-center space-x-6">
            <li>
              <Link href="/lessons" className="text-gray-600 hover:text-gray-900 font-medium">
                All Lessons
              </Link>
            </li>
            <li>
              <Link href="/quiz" className="text-gray-600 hover:text-gray-900 font-medium">
                Quizzes
              </Link>
            </li>
            <li>
              <Link href="/progress" className="text-gray-600 hover:text-gray-900 font-medium">
                My Progress
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
};

export default SubHeader;
