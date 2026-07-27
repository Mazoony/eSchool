
import { Metadata } from 'next';
import LoginForm from './LoginForm';

export const metadata: Metadata = {
  title: 'Login to eSchool',
  description: 'Login to your eSchool account to access your English courses and connect with the community.',
  keywords: ['eSchool login', 'learn English online', 'Sudan English courses'],
  alternates: {
    canonical: 'https://eschool.com/login',
  },
};

export default function LoginPage() {
  return <LoginForm />;
}
