
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'FAQ - eSchool',
  description: 'Frequently Asked Questions about eSchool, the leading online platform for English education in Sudan.',
  alternates: {
    canonical: '/faq',
  },
};

const FAQPage = () => {

    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
            {
                "@type": "Question",
                "name": "What is eSchool?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "eSchool is an online platform for Sudanese students to learn English, connect with instructors, and access high-quality educational resources. We help students prepare for the IELTS exam, improve their conversation skills, and join a vibrant community of learners."
                }
            },
            {
                "@type": "Question",
                "name": "Who can use eSchool?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "eSchool is designed for Sudanese students of all ages and proficiency levels who want to improve their English language skills."
                }
            },
            {
                "@type": "Question",
                "name": "How much does eSchool cost?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "eSchool offers a variety of free and paid courses. Please visit our pricing page for more information."
                }
            },
            {
                "@type": "Question",
                "name": "How do I sign up for eSchool?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "You can sign up for eSchool by visiting our website and clicking on the \"Sign Up\" button. You will be asked to provide your name, email address, and a password."
                }
            }
        ]
    };

  return (
    <div className="container mx-auto px-4 py-8">
         <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <h1 className="text-4xl font-extrabold text-center text-gray-900 dark:text-gray-50 mb-12">Frequently Asked Questions</h1>
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-50 mb-4">What is eSchool?</h2>
          <p className="text-lg text-gray-600 dark:text-gray-300">eSchool is an online platform for Sudanese students to learn English, connect with instructors, and access high-quality educational resources. We help students prepare for the IELTS exam, improve their conversation skills, and join a vibrant community of learners.</p>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-50 mb-4">Who can use eSchool?</h2>
          <p className="text-lg text-gray-600 dark:text-gray-300">eSchool is designed for Sudanese students of all ages and proficiency levels who want to improve their English language skills.</p>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-50 mb-4">How much does eSchool cost?</h2>
          <p className="text-lg text-gray-600 dark:text-gray-300">eSchool offers a variety of free and paid courses. Please visit our pricing page for more information.</p>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-50 mb-4">How do I sign up for eSchool?</h2>
          <p className="text-lg text-gray-600 dark:text-gray-300">You can sign up for eSchool by visiting our website and clicking on the "Sign Up" button. You will be asked to provide your name, email address, and a password.</p>
        </div>
      </div>
    </div>
  );
};

export default FAQPage;
