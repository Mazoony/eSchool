
'use client';

import { useState } from 'react';

const faqs = [
    {
        question: "What is eSchool?",
        answer: "eSchool is an online platform for Sudanese students to learn English, connect with instructors, and access high-quality educational resources. We help students prepare for the IELTS exam, improve their conversation skills, and join a vibrant community of learners."
    },
    {
        question: "Who can use eSchool?",
        answer: "eSchool is designed for Sudanese students of all ages and proficiency levels who want to improve their English language skills."
    },
    {
        question: "How much does eSchool cost?",
        answer: "eSchool offers a variety of free and paid courses. Please visit our pricing page for more information."
    },
    {
        question: "How do I sign up for eSchool?",
        answer: "You can sign up for eSchool by visiting our website and clicking on the \"Sign Up\" button. You will be asked to provide your name, email address, and a password."
    }
];

const FAQPage = () => {
    const [open, setOpen] = useState<number | null>(null);

    const toggle = (index: number) => {
        setOpen(open === index ? null : index);
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-4xl font-extrabold text-center text-gray-900 dark:text-gray-50 mb-12">Frequently Asked Questions</h1>
            <div className="space-y-4">
                {faqs.map((faq, index) => (
                    <div key={index} className="border-b border-gray-200 dark:border-gray-700 pb-4">
                        <button
                            onClick={() => toggle(index)}
                            className="w-full flex justify-between items-center text-left text-xl font-semibold text-gray-900 dark:text-gray-50 focus:outline-none focus-visible:ring focus-visible:ring-blue-500 focus-visible:ring-opacity-75"
                            aria-expanded={open === index}
                            aria-controls={`faq-answer-${index}`}
                        >
                            <span>{faq.question}</span>
                            <span className={`transform transition-transform ${open === index ? 'rotate-180' : ''}`}>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </span>
                        </button>
                        <div
                            id={`faq-answer-${index}`}
                            className={`overflow-hidden transition-max-height duration-500 ease-in-out ${open === index ? 'max-h-screen' : 'max-h-0'}`}
                        >
                            <p className="text-lg text-gray-600 dark:text-gray-300 mt-2">
                                {faq.answer}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default FAQPage;
