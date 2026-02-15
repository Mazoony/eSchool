'use client';

import { useState } from 'react';

const questions = [
  {
    question: 'What is the correct past tense of the verb \'to go\'? ',
    options: ['Goed', 'Went', 'Gone', 'Going'],
    answer: 'Went'
  },
  {
    question: 'Which of the following is a synonym for \'happy\'? ',
    options: ['Sad', 'Joyful', 'Angry', 'Tired'],
    answer: 'Joyful'
  },
  {
    question: 'What is the plural of \'child\'? ',
    options: ['Childs', 'Children', 'Childes', 'Childer'],
    answer: 'Children'
  }
];

export default function QuizPage() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [showScore, setShowScore] = useState(false);

  const handleAnswer = (option: string) => {
    if (option === questions[currentQuestion].answer) {
      setScore(score + 1);
    }

    const nextQuestion = currentQuestion + 1;
    if (nextQuestion < questions.length) {
      setCurrentQuestion(nextQuestion);
    } else {
      setShowScore(true);
    }
  };

  return (
    <div className='flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900'>
      <div className='w-full max-w-2xl p-8 bg-white rounded-lg shadow-lg dark:bg-gray-800'>
        {showScore ? (
          <div className='text-center'>
            <h2 className='text-3xl font-bold text-gray-900 dark:text-white'>Your Score: {score} out of {questions.length}</h2>
          </div>
        ) : (
          <div>
            <div className='mb-4'>
              <h2 className='text-2xl font-bold text-gray-900 dark:text-white'>{questions[currentQuestion].question}</h2>
            </div>
            <div className='grid grid-cols-2 gap-4'>
              {questions[currentQuestion].options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswer(option)}
                  className='p-4 text-lg font-medium text-left text-gray-900 bg-gray-200 rounded-lg hover:bg-gray-300 dark:text-white dark:bg-gray-700 dark:hover:bg-gray-600'
                >
                  {option}
                </button>
              ))}
            </div>
            <div className='mt-8'>
              <div className='w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700'>
                <div
                  className='bg-blue-600 h-2.5 rounded-full'
                  style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
                ></div>
              </div>
              <p className='mt-2 text-sm text-gray-600 dark:text-gray-400'>Question {currentQuestion + 1} of {questions.length}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}