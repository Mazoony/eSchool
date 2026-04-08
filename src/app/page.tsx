import { AuthProvider } from './AuthContext';
import SocialFeed from './components/SocialFeed';

export default function Page() {
  return (
    <AuthProvider>
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">eSchool</h1>
        <SocialFeed />
      </div>
    </AuthProvider>
  );
}
