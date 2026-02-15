'use client';

import { Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const progressData = {
  labels: ['Grammar', 'Vocabulary', 'Conversation', 'Pronunciation'],
  datasets: [
    {
      label: 'Progress (%)',
      data: [75, 60, 85, 70],
      backgroundColor: 'rgba(54, 162, 235, 0.6)',
      borderColor: 'rgba(54, 162, 235, 1)',
      borderWidth: 1,
    },
  ],
};

const overallProgressData = {
  labels: ['Completed', 'Remaining'],
  datasets: [
    {
      data: [72.5, 27.5],
      backgroundColor: ['#36A2EB', '#FF6384'],
      hoverBackgroundColor: ['#36A2EB', '#FF6384'],
    },
  ],
};

export default function ProgressPage() {
  return (
    <div className='flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 p-8'>
      <div className='w-full max-w-4xl p-8 bg-white rounded-lg shadow-lg dark:bg-gray-800'>
        <h2 className='text-3xl font-bold text-center text-gray-900 dark:text-white mb-8'>Your Progress</h2>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
          <div>
            <h3 className='text-2xl font-bold text-gray-900 dark:text-white mb-4'>Progress by Category</h3>
            <Bar data={progressData} />
          </div>
          <div>
            <h3 className='text-2xl font-bold text-gray-900 dark:text-white mb-4'>Overall Progress</h3>
            <Pie data={overallProgressData} />
          </div>
        </div>
        <div className='mt-8'>
          <h3 className='text-2xl font-bold text-gray-900 dark:text-white mb-4'>Statistics</h3>
          <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
            <div className='p-4 text-center bg-gray-200 rounded-lg dark:bg-gray-700'>
              <p className='text-3xl font-bold text-gray-900 dark:text-white'>12</p>
              <p className='text-gray-600 dark:text-gray-400'>Lessons Completed</p>
            </div>
            <div className='p-4 text-center bg-gray-200 rounded-lg dark:bg-gray-700'>
              <p className='text-3xl font-bold text-gray-900 dark:text-white'>5</p>
              <p className='text-gray-600 dark:text-gray-400'>Quizzes Passed</p>
            </div>
            <div className='p-4 text-center bg-gray-200 rounded-lg dark:bg-gray-700'>
              <p className='text-3xl font-bold text-gray-900 dark:text-white'>8.5</p>
              <p className='text-gray-600 dark:text-gray-400'>Average Quiz Score</p>
            </div>
            <div className='p-4 text-center bg-gray-200 rounded-lg dark:bg-gray-700'>
              <p className='text-3xl font-bold text-gray-900 dark:text-white'>24</p>
              <p className='text-gray-600 dark:text-gray-400'>Hours Spent Learning</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}