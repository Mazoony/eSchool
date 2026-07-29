
import { createMetadata } from '../metadata';

export const metadata = createMetadata({
  title: 'Terms of Service - eSchool Sudan',
  description: 'Read the terms of service for eSchool to understand your rights and responsibilities when using our English learning platform in Sudan.',
  path: '/terms',
});

export default function TermsPage() {
  return (
    <div className="container mx-auto px-6 py-12">
      <div className="prose dark:prose-invert max-w-4xl mx-auto">
        <h1>eSchool Terms of Service</h1>
        <p><em>Last Updated: October 26, 2023</em></p>

        <h2>1. Introduction</h2>
        <p>Welcome to eSchool. By accessing or using our platform, you agree to be bound by these Terms of Service. If you do not agree with any part of these terms, you may not use our services.</p>

        <h2>2. User Accounts</h2>
        <p>To access certain features of our platform, you must create an account. You are responsible for safeguarding your account information and for all activities that occur under your account. You must be at least 13 years old to use our services.</p>

        <h2>3. User Conduct</h2>
        <p>You agree to use our platform only for lawful purposes. You will not post or transmit any material that is defamatory, obscene, or that infringes on the intellectual property rights of others. Cheating, plagiarism, or any form of academic dishonesty is strictly prohibited.</p>

        <h2>4. Intellectual Property</h2>
        <p>All content on the eSchool platform, including courses, text, graphics, and logos, is the property of eSchool and is protected by copyright and other intellectual property laws. Content created by users remains the property of the user, but you grant eSchool a license to use it in connection with the platform.</p>

        <h2>5. Payments and Refunds</h2>
        <p>Fees for our courses and services are due at the time of purchase. All fees are non-refundable, except as required by law or as otherwise stated in our refund policy.</p>

        <h2>6. Disclaimers</h2>
        <p>Our platform is provided on an "as is" and "as available" basis. We make no warranties, express or implied, that the service will be uninterrupted, error-free, or that you will achieve specific results from our courses.</p>

        <h2>7. Limitation of Liability</h2>
        <p>In no event shall eSchool be liable for any indirect, incidental, special, or consequential damages arising out of or in connection with your use of the platform.</p>

        <h2>8. Governing Law</h2>
        <p>These Terms of Service shall be governed by and construed in accordance with the laws of Sudan, without regard to its conflict of law provisions.</p>

        <h2>9. Changes to These Terms</h2>
        <p>We reserve the right to modify these terms at any time. We will provide notice of any significant changes by posting the new terms on this page.</p>

        <h2>10. Contact Us</h2>
        <p>If you have any questions about these Terms of Service, please <a href="/contact">contact us</a>.</p>
      </div>
    </div>
  );
}
