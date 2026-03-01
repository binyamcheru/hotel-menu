import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-6 py-6 max-w-7xl mx-auto backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
            <span className="text-white font-black text-xl italic">A</span>
          </div>
          <span className="text-2xl font-black tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
            Antigravity
          </span>
        </div>
        <div className="hidden md:flex items-center gap-8 font-medium text-gray-600">
          <a href="#features" className="hover:text-indigo-600 transition-colors">Features</a>
          <a href="#pricing" className="hover:text-indigo-600 transition-colors">Pricing</a>
          <Link href="/login" className="px-6 py-2.5 bg-gray-900 text-white rounded-full hover:bg-indigo-600 transition-all shadow-xl shadow-gray-200 active:scale-95">
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="px-6 pt-20 pb-32 max-w-7xl mx-auto text-center">
        <div className="inline-block px-4 py-1.5 mb-6 text-sm font-bold text-indigo-600 bg-indigo-50 rounded-full border border-indigo-100 animate-pulse">
          ✨ New: Analytics Dashboard 2.0
        </div>
        <h1 className="text-5xl md:text-8xl font-black tracking-tighter leading-none mb-8">
          The Digital Menu for <br />
          <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 bg-clip-text text-transparent">
            Modern Hotels.
          </span>
        </h1>
        <p className="max-w-2xl mx-auto text-xl text-gray-500 mb-12 leading-relaxed">
          Transform your dining experience with elegant QR menus, real-time analytics,
          and seamless manager controls. Boost sales and delight your guests today.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/login" className="w-full sm:w-auto px-10 py-5 bg-indigo-600 text-white rounded-2xl font-bold text-lg hover:bg-indigo-700 hover:shadow-2xl hover:shadow-indigo-200 transition-all active:scale-95">
            Start Your Free Trial
          </Link>
          <button className="w-full sm:w-auto px-10 py-5 bg-white text-gray-900 border-2 border-gray-100 rounded-2xl font-bold text-lg hover:border-indigo-100 hover:bg-gray-50 transition-all">
            Watch Demo
          </button>
        </div>

        {/* Mock App Preview */}
        <div className="mt-20 relative">
          <div className="absolute inset-0 bg-indigo-200 blur-[130px] opacity-30 rounded-full"></div>
          <div className="relative bg-white border border-gray-100 rounded-[32px] shadow-2xl overflow-hidden p-2">
            <div className="bg-gray-50 rounded-[24px] aspect-video flex items-center justify-center border border-gray-100">
              <span className="text-gray-400 font-medium italic">Premium Dashboad UI Preview</span>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Section */}
      <section id="features" className="px-6 py-32 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-black mb-4">Everything you need to scale</h2>
            <p className="text-gray-500">Powerful features built specifically for the hospitality industry.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: 'Dynamic QR Menus', desc: 'Update prices and items instantly without reprinting codes.' },
              { title: 'Real-time Analytics', desc: 'Track popular dishes and peak scan times with beautiful charts.' },
              { title: 'Multi-tenant Support', desc: 'Manage multiple hotel properties from a single super-admin dashboard.' }
            ].map((f, i) => (
              <div key={i} className="bg-white p-10 rounded-[32px] border border-gray-100 shadow-sm hover:shadow-xl transition-all group">
                <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-indigo-600 transition-colors">
                  <div className="w-6 h-6 bg-indigo-600 rounded group-hover:bg-white"></div>
                </div>
                <h3 className="text-2xl font-bold mb-4">{f.title}</h3>
                <p className="text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-20 border-t border-gray-100 max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center italic text-white font-black">A</div>
          <span className="text-xl font-bold tracking-tight">Antigravity</span>
        </div>
        <div className="flex gap-10 text-gray-500 font-medium">
          <a href="#" className="hover:text-indigo-600">Privacy</a>
          <a href="#" className="hover:text-indigo-600">Terms</a>
          <a href="#" className="hover:text-indigo-600">Contact</a>
        </div>
        <div className="text-gray-400">
          © 2024 Antigravity SaaS. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
