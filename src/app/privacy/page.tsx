
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy - eSchool',
  description: 'Read the privacy policy for eSchool to understand how we collect, use, and protect your personal information.',
  alternates: {
    canonical: 'https://eschool.com/privacy',
  },
};

export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-6 py-12">
      <div className="prose dark:prose-invert max-w-4xl mx-auto">
        <h1>Privacy Policy</h1>
        <p><em>Last Updated: October 26, 2023</em></p>

        <h2>1. Introduction</h2>
        <p>Welcome to eSchool. We are committed to protecting your personal information and your right to privacy. This Privacy Policy explains what information we collect, how we use it, and what rights you have in relation to it.</p>

        <h2>2. Information We Collect</h2>
        <p>We may collect personal information that you provide to us, such as your name, email address, and profile picture when you register for an account, participate in our courses, or interact with our social features.</p>
        <p>We also collect certain information automatically when you visit our platform, such as your IP address, browser type, and device information.</p>

        <h2>3. How We Use Your Information</h2>
        <p>We use the information we collect to:</p>
        <ul>
          <li>Create and manage your account.</li>
          <li>Provide, operate, and maintain our services.</li>
          <li>Personalize and improve your learning experience.</li>
          <li>Communicate with you, including sending you updates and educational content.</li>
          <li>Facilitate community interaction and social features.</li>
        </ul>

        <h2>4. Sharing Your Information</h2>
        <p>We do not sell, trade, or otherwise transfer your personally identifiable information to outside parties. This does not include trusted third parties who assist us in operating our platform, so long as those parties agree to keep this information confidential.</p>

        <h2>5. Data Security</h2>
        <p>We implement a variety of security measures to maintain the safety of your personal information. However, no electronic transmission or storage is 100% secure, and we cannot guarantee its absolute security.</p>

        <h2>6. Your Privacy Rights</h2>
        <p>You have the right to access, update, or delete the personal information we have on you. You can update your account information through your profile settings.</p>

        <h2>7. Changes to This Policy</h2>
        <p>We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page.</p>

        <h2>8. Contact Us</h2>
        <p>If you have any questions about this Privacy Policy, please <a href="/contact">contact us</a>.</p>
      </div>
    </div>
  );
}
