import Image from "next/image";
import FirebaseTest from "@/components/FirebaseTest";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-8 mb-6">
          <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">
            Cayee Guru Queue System
          </h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <Link href="/background-page" className="block p-6 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors">
              <h3 className="text-xl font-semibold text-blue-800 mb-2">Background Display</h3>
              <p className="text-blue-600">Main queue display for customers</p>
            </Link>
            
            <Link href="/management-page" className="block p-6 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors">
              <h3 className="text-xl font-semibold text-green-800 mb-2">Management</h3>
              <p className="text-green-600">Manage queue numbers and system</p>
            </Link>
            
            <Link href="/print-test-page" className="block p-6 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors">
              <h3 className="text-xl font-semibold text-purple-800 mb-2">Print Test</h3>
              <p className="text-purple-600">Test printer functionality</p>
            </Link>
            
            <Link href="/settings-page" className="block p-6 bg-orange-50 border border-orange-200 rounded-lg hover:bg-orange-100 transition-colors">
              <h3 className="text-xl font-semibold text-orange-800 mb-2">Settings</h3>
              <p className="text-orange-600">Configure printer IP and system settings</p>
            </Link>
            
            <Link href="/a-page" className="block p-6 bg-pink-50 border border-pink-200 rounded-lg hover:bg-pink-100 transition-colors">
              <h3 className="text-xl font-semibold text-pink-800 mb-2">Company A</h3>
              <p className="text-pink-600">Company A queue page</p>
            </Link>
            
            <Link href="/b-page" className="block p-6 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-colors">
              <h3 className="text-xl font-semibold text-emerald-800 mb-2">Company B</h3>
              <p className="text-emerald-600">Company B queue page</p>
            </Link>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <FirebaseTest />
        </div>
      </div>
    </div>
  );
}
