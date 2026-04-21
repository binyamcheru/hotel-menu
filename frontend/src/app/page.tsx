import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-6 py-6 max-w-7xl mx-auto backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-100">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h7" />
            </svg>
          </div>
          <span className="text-2xl font-black tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
            Digital Menu
          </span>
        </div>
        <div className="hidden md:flex items-center gap-8 font-medium text-gray-600">
          <a href="#features" className="hover:text-indigo-600 transition-colors">Features</a>
          <Link href="/login" className="px-6 py-2.5 bg-gray-900 text-white rounded-full hover:bg-indigo-600 transition-all shadow-xl shadow-gray-200 active:scale-95">
            Admin Login
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="px-6 pt-20 pb-32 max-w-7xl mx-auto text-center">
        <div className="inline-block px-4 py-1.5 mb-6 text-sm font-bold text-indigo-600 bg-indigo-50 rounded-full border border-indigo-100 uppercase tracking-wider">
          Premium Digital Menu Solution
        </div>
        <h1 className="text-5xl md:text-8xl font-black tracking-tighter leading-none mb-8">
          Seamless Dining <br />
          <span className="bg-gradient-to-r from-indigo-600 via-indigo-500 to-indigo-400 bg-clip-text text-transparent">
            Experiences.
          </span>
        </h1>
        <p className="max-w-2xl mx-auto text-xl text-gray-500 mb-12 leading-relaxed">
          Transform your restaurant with elegant QR menus, real-time analytics,
          and effortless management. Boost sales and delight your guests today.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/login" className="w-full sm:w-auto px-10 py-5 bg-indigo-600 text-white rounded-2xl font-bold text-lg hover:bg-indigo-700 hover:shadow-2xl hover:shadow-indigo-200 transition-all active:scale-95">
            Get Started
          </Link>
          <a href="#features" className="w-full sm:w-auto px-10 py-5 bg-white text-gray-900 border-2 border-gray-100 rounded-2xl font-bold text-lg hover:border-indigo-100 hover:bg-gray-50 transition-all">
            Explore Features
          </a>
        </div>

        {/* Platform Mockup */}
        <div className="mt-20 relative px-4">
          <div className="absolute inset-0 bg-indigo-200 blur-[130px] opacity-30 rounded-full"></div>
          <div className="relative bg-white border border-gray-100 rounded-[32px] shadow-2xl overflow-hidden p-2">
            <img
              src="/images/mockup.png"
              alt="Digital Menu Platform Mockup"
              className="w-full h-auto rounded-[24px] object-cover"
            />
          </div>
        </div>
      </section>

      {/* Feature Section */}
      <section id="features" className="px-6 py-32 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-black mb-6 tracking-tight text-gray-900">Everything you need to scale</h2>
            <p className="text-xl text-gray-500 max-w-2xl mx-auto">Powerful features built specifically for the hospitality industry, designed to streamline operations and enhance guest satisfaction.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: 'Dynamic QR Menus',
                desc: 'Update prices, items, and availability instantly without the need for reprinting physical menus.',
                icon: (
                  <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 011 1v2a1 1 0 01-1 1h-2a1 1 0 01-1-1V9a1 1 0 011-1zM5 16h2a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1v-2a1 1 0 011-1z" />
                  </svg>
                )
              },
              {
                title: 'Real-time Analytics',
                desc: 'Track popular dishes, peak scan times, and guest preferences with beautiful, actionable charts.',
                icon: (
                  <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                )
              },
              {
                title: 'Multi-tenant Support',
                desc: 'Manage multiple hotel properties, menus, and staff from a central, secure administrative dashboard.',
                icon: (
                  <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                )
              }
            ].map((f, i) => (
              <div key={i} className="bg-white p-10 rounded-[32px] border border-gray-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 group">
                <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-indigo-600 group-hover:rotate-6 transition-all duration-300">
                  <div className="group-hover:text-white transition-colors">
                    {f.icon}
                  </div>
                </div>
                <h3 className="text-2xl font-bold mb-4 text-gray-900">{f.title}</h3>
                <p className="text-gray-500 leading-relaxed text-lg">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-20 border-t border-gray-100 max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-10">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-100">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h7" />
            </svg>
          </div>
          <span className="text-xl font-bold tracking-tight">Digital Menu</span>
        </div>
        <div className="flex gap-10 text-gray-500 font-medium">
          <a href="#" className="hover:text-indigo-600">Privacy</a>
          <a href="#" className="hover:text-indigo-600">Terms</a>
          <a href="#" className="hover:text-indigo-600">Contact</a>
        </div>
        <div className="text-gray-400">
          © 2024 Digital Menu SaaS. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
