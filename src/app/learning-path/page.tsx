'use client';

import { useState } from 'react';

const goals = [
  'Improve my grammar',
  'Expand my vocabulary',
  'Become more fluent in conversation',
  'Prepare for an English exam',
  'Learn business English',
  'Be able to travel abroad confidently'
];

const learningPath = {
  'Improve my grammar': [
    { title: 'Introduction to English Grammar', type: 'video' },
    { title: 'Grammar Quiz 1', type: 'quiz' },
    { title: 'Advanced Verb Tenses', type: 'video' },
  ],
  'Expand my vocabulary': [
    { title: '100 Most Common English Words', type: 'video' },
    { title: 'Vocabulary Quiz 1', type: 'quiz' },
    { title: 'Advanced Vocabulary: Idioms and Phrasal Verbs', type: 'video' },
  ],
  'Become more fluent in conversation': [
    { title: 'Mastering English Pronunciation', type: 'video' },
    { title: 'Role-playing: At the Restaurant', type: 'exercise' },
    { title: 'Advanced English Conversation', type: 'video' },
  ],
  'Prepare for an English exam': [
    { title: 'TOEFL/IELTS Vocabulary', type: 'video' },
    { title: 'Exam Grammar Review', type: 'quiz' },
    { title: 'Practice Exam 1', type: 'exercise' },
  ],
  'Learn business English': [
    { title: 'Business English Essentials', type: 'video' },
    { title: 'Writing Effective Emails in English', type: 'video' },
    { title: 'Business Vocabulary Quiz', type: 'quiz' },
  ],
  'Be able to travel abroad confidently': [
    { title: 'English for Travel', type: 'video' },
    { title: 'Role-playing: At the Airport', type: 'exercise' },
    { title: 'Travel Vocabulary Quiz', type: 'quiz' },
  ]
};

export default function LearningPathPage() {
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [showPath, setShowPath] = useState(false);

  const handleGoalSelection = (goal: string) => {
    setSelectedGoals(prevGoals =>
      prevGoals.includes(goal) ? prevGoals.filter(g => g !== goal) : [...prevGoals, goal]
    );
  };

  const generatePath = () => {
    setShowPath(true);
  };

  return (
    <div className='flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900'>
      <div className='w-full max-w-4xl p-8 bg-white rounded-lg shadow-lg dark:bg-gray-800'>
        {!showPath ? (
          <div>
            <h2 className='text-3xl font-bold text-center text-gray-900 dark:text-white mb-8'>What are your learning goals?</h2>
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8'>
              {goals.map((goal, index) => (
                <button
                  key={index}
                  onClick={() => handleGoalSelection(goal)}
                  className={`p-4 text-lg font-medium text-left rounded-lg transition-colors ${selectedGoals.includes(goal)
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-900 hover:bg-gray-300 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600'
                    }`}
                >
                  {goal}
                </button>
              ))}
            </div>
            <button
              onClick={generatePath}
              disabled={selectedGoals.length === 0}
              className='w-full py-3 text-lg font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed'
            >
              Generate My Learning Path
            </button>
          </div>
        ) : (
          <div>
            <h2 className='text-3xl font-bold text-center text-gray-900 dark:text-white mb-8'>Your Personalized Learning Path</h2>
            <div className='space-y-4'>
              {selectedGoals.map(goal => (
                <div key={goal}>
                  <h3 className='text-2xl font-bold text-gray-900 dark:text-white mb-4'>{goal}</h3>
                  <ul className='space-y-2'>
                    {learningPath[goal as keyof typeof learningPath].map((item, index) => (
                      <li key={index} className='flex items-center p-4 bg-gray-200 rounded-lg dark:bg-gray-700'>
                        <span className='text-lg font-medium text-gray-900 dark:text-white'>{item.title}</span>
                        <span className='ml-auto px-2 py-1 text-sm text-white bg-blue-600 rounded-full'>{item.type}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}