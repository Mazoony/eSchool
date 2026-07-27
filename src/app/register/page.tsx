
import { Metadata } from 'next';
import RegisterForm from './RegisterForm';

export const metadata: Metadata = {
  title: 'Register for eSchool',
  description: 'Create an account with eSchool to start learning English online in Sudan. Access courses, connect with instructors, and join our community.',
  keywords: ['eSchool sign up', 'learn English Sudan', 'online English courses', 'IELTS preparation Sudan'],
  alternates: {
    canonical: 'https://eschool.com/register',
  },
};

export default function RegisterPage() {
  return <RegisterForm />;
}
