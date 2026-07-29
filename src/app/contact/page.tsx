
import { createMetadata } from '../metadata';

export const metadata = createMetadata({
  title: 'Contact eSchool - English Courses in Sudan',
  description: 'Get in touch with the eSchool team. We are here to answer your questions about our English courses, platform, and partnerships in Sudan.',
  path: '/contact',
});

export default function ContactPage() {
  return (
    <div className="container mx-auto px-6 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
            <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white">Contact Our Team</h1>
            <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">We'd love to hear from you. Please fill out the form below or reach out to us using the contact details provided for any questions about our English programs.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Send Us a Message</h2>
                <form action="#" method="POST" className="space-y-6">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Full Name</label>
                        <div className="mt-1">
                        <input type="text" name="name" id="name" autoComplete="name" className="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2 px-4 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
                        </div>
                    </div>
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email Address</label>
                        <div className="mt-1">
                        <input type="email" name="email" id="email" autoComplete="email" className="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2 px-4 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
                        </div>
                    </div>
                    <div>
                        <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Message</label>
                        <div className="mt-1">
                        <textarea id="message" name="message" rows={4} className="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2 px-4 shadow-sm focus:border-blue-500 focus:ring-blue-500"></textarea>
                        </div>
                    </div>
                    <div>
                        <button type="submit" className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                        Send Message
                        </button>
                    </div>
                </form>
            </div>
            <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Our Contact Information</h2>
                <div className="space-y-4 text-gray-600 dark:text-gray-300">
                    <p><strong>Address:</strong><br />123 Education Street, Khartoum, Sudan</p>
                    <p><strong>Email:</strong><br /> <a href="mailto:info@eschool.com" className="text-blue-600 dark:text-blue-400 hover:underline">info@eschool.com</a></p>
                    <p><strong>Phone:</strong><br /> +249 12 345 6789</p>
                    <p><strong>Business Hours:</strong><br />Sunday - Thursday, 9:00 AM - 5:00 PM</p>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
