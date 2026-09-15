'use client';
import { useState, useEffect } from 'react';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, getDocs, doc, setDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';

const DOMAINS = [
  'Organizer', 'Co-Organizer', 'Host', 'Co-Host', 
  'Documentation', 'Media', 'Outreach', 'Graphics', 'Finance', 'Other'
];

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [sections, setSections] = useState<any[]>([]);
  const [contributions, setContributions] = useState<{ [key: string]: { domains: string[], details: string } }>({});
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        router.push('/');
      } else {
        setUser(currentUser);
        fetchSections();
      }
    });
    return () => unsubscribe();
  }, [router]);

  const fetchSections = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'sections'));
      const list = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setSections(list);
    } catch (error) {
      console.error("Error fetching sections:", error);
    }
    setLoading(false);
  };

  const handleDomainChange = (sectionId: string, domain: string) => {
    setContributions(prev => {
      const currentSection = prev[sectionId] || { domains: [], details: '' };
      const domains = currentSection.domains.includes(domain)
        ? currentSection.domains.filter(d => d !== domain)
        : [...currentSection.domains, domain];
      return { ...prev, [sectionId]: { ...currentSection, domains } };
    });
  };

  const handleDetailsChange = (sectionId: string, details: string) => {
    setContributions(prev => {
      const currentSection = prev[sectionId] || { domains: [], details: '' };
      return { ...prev, [sectionId]: { ...currentSection, details } };
    });
  };

  const saveContribution = async (sectionId: string, sectionTitle: string) => {
    try {
      const data = contributions[sectionId];
      if (!data || data.domains.length === 0) {
        alert("Please select at least one domain/role!");
        return;
      }

      const docId = `${user.uid}_${sectionId}`;
      await setDoc(doc(db, 'contributions', docId), {
        userId: user.uid,
        email: user.email,
        sectionId,
        sectionTitle,
        domains: data.domains,
        details: data.details,
        updatedAt: new Date()
      });

      alert(`Contributions for "${sectionTitle}" saved successfully!`);
    } catch (error: any) {
      alert("Error saving: " + error.message);
    }
  };

  if (loading) return <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">Loading dashboard...</div>;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto flex justify-between items-center mb-8 bg-gray-800 p-4 rounded-xl shadow">
        <div>
          <h1 className="text-xl font-bold">Welcome, {user?.email}</h1>
          <p className="text-sm text-gray-400">Select your roles and contributions for each club section.</p>
        </div>
        <button 
          onClick={() => signOut(auth).then(() => router.push('/'))}
          className="bg-red-600 px-4 py-2 rounded hover:bg-red-700 text-sm font-semibold"
        >
          Logout
        </button>
      </div>

      <div className="max-w-4xl mx-auto space-y-6">
        {sections.length === 0 ? (
          <p className="text-center text-gray-400">No sections found in Firestore. Please add documents to the 'sections' collection.</p>
        ) : (
          sections.map((section) => (
            <div key={section.id} className="bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700">
              <h2 className="text-lg font-bold text-blue-400 mb-4">{section.title}</h2>
              
              <label className="block text-sm font-medium text-gray-300 mb-2">Select Roles / Domains:</label>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-4">
                {DOMAINS.map((domain) => {
                  const isSelected = contributions[section.id]?.domains?.includes(domain);
                  return (
                    <button
                      type="button"
                      key={domain}
                      onClick={() => handleDomainChange(section.id, domain)}
                      className={`py-1.5 px-3 text-xs font-medium rounded border transition ${
                        isSelected 
                          ? 'bg-blue-600 border-blue-500 text-white' 
                          : 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      {domain}
                    </button>
                  );
                })}
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-1">Specific Contribution Details:</label>
                <input
                  type="text"
                  placeholder="e.g., Managed registration desk and coordinated with speakers..."
                  value={contributions[section.id]?.details || ''}
                  onChange={(e) => handleDetailsChange(section.id, e.target.value)}
                  className="w-full px-3 py-2 rounded bg-gray-700 border border-gray-600 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <button
                onClick={() => saveContribution(section.id, section.title)}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm font-semibold transition"
              >
                Save Contributions
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}