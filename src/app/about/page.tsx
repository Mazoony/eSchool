
import { createMetadata } from '../metadata';

export const metadata = createMetadata({
  title: 'About eSchool: Our Mission to Teach English in Sudan',
  description: 'Learn about the mission and vision of eSchool, the leading online platform for English language education in Sudan, and how we empower students.',
  path: '/about',
});

export default function AboutPage() {
  return (
    <div className="container mx-auto px-6 py-12">
      <div className="prose dark:prose-invert max-w-4xl mx-auto">
        <h1>About eSchool</h1>
        <p>eSchool was founded with a simple yet powerful mission: to make high-quality English language education accessible to every student in Sudan. We believe that language is a bridge to opportunity, and we are committed to providing the tools and support necessary for our students to succeed in a globalized world.</p>
        
        <h2>Our Vision for English Learning in Sudan</h2>
        <p>Our vision is a Sudan where every young person has the confidence and ability to express themselves in English, opening doors to international education, career opportunities, and cultural exchange. We aim to be the leading online learning community, known for our innovative approach, dedicated instructors, and vibrant student network.</p>

        <h2>What We Offer Students</h2>
        <ul>
          <li><strong>Comprehensive English Courses:</strong> From beginner lessons to advanced IELTS preparation, our curriculum is designed to meet the diverse needs of our learners in Sudan.</li>
          <li><strong>Expert Sudanese Instructors:</strong> Our team of certified educators is passionate about teaching and dedicated to providing personalized feedback and support.</li>
          <li><strong>Interactive Learning Platform:</strong> Our social learning platform encourages practice, collaboration, and connection, making the learning process engaging and effective.</li>
          <li><strong>Flexible & Accessible Education:</strong> Learn at your own pace, on your own schedule, from anywhere in Sudan.</li>
        </ul>

        <h2>Join Our eSchool Community</h2>
        <p>We are more than just a language school; we are a community. Whether you are a student ready to start your learning journey, an instructor eager to make a difference, or a partner who shares our vision, we invite you to join us. Together, we can build a brighter future for the next generation of Sudanese leaders.</p>
      </div>
    </div>
  );
}
