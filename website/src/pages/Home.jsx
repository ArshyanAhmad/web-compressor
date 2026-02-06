/**
 * Home Page (Marketing Page)
 *
 * This is the landing page that:
 * - Explains what Compressor does
 * - Shows product features and benefits
 * - Displays use cases and target audience
 * - Provides download extension button
 * - Clean, professional, impactful design
 */

import { Link } from "react-router-dom";

function Home() {
   return (
      <div className="min-h-screen bg-gradient-to-br from-light-grey via-white to-light-grey">
         {/* Header */}
         <header className="bg-white shadow-sm sticky top-0 z-50">
            <div className="container mx-auto px-6 py-4">
               <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                     <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-purple-800 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-xl">C</span>
                     </div>
                     <span className="text-2xl font-bold text-blackish">
                        Compressor
                     </span>
                  </div>
                  <nav className="hidden md:flex space-x-6">
                     <a
                        href="#features"
                        className="text-dark-grey hover:text-purple-600 transition"
                     >
                        Features
                     </a>
                     <a
                        href="#how-it-works"
                        className="text-dark-grey hover:text-purple-600 transition"
                     >
                        How It Works
                     </a>
                     <a
                        href="#benefits"
                        className="text-dark-grey hover:text-purple-600 transition"
                     >
                        Benefits
                     </a>
                  </nav>
                  <Link to="/dashboard" className="btn-secondary">
                     Dashboard
                  </Link>
               </div>
            </div>
         </header>

         {/* Hero Section */}
         <section className="container mx-auto px-6 py-20 text-center">
            <h1 className="text-6xl md:text-7xl font-bold mb-6">
               <span className="gradient-text">Speed Up</span> Your Web
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
               Remove images, CSS, videos, and fonts to dramatically improve
               page load times. Experience the web at lightning speed.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
               <a
                  href="#"
                  className="btn-primary text-lg px-8 py-4"
                  onClick={(e) => {
                     e.preventDefault();
                     window.open(
                        "https://chromewebstore.google.com/detail/compressor/gbminkpofeomkdaodbihmlimgbidlhmk",
                        "_blank",
                     );
                  }}
               >
                  Download Now
               </a>
            </div>
         </section>

         {/* Features Section */}
         <section id="features" className="container mx-auto px-6 py-16">
            <h2 className="text-4xl font-bold text-center mb-12">
               What Compressor Does
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
               <div className="card text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-purple-800 rounded-full flex items-center justify-center mx-auto mb-4">
                     <span className="text-white text-2xl">⚡</span>
                  </div>
                  <h3 className="text-xl font-bold mb-3">Lightning Fast</h3>
                  <p className="text-gray-600">
                     Remove heavy content like images, videos, and fonts to
                     reduce page load time by up to 90%.
                  </p>
               </div>

               <div className="card text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-purple-800 rounded-full flex items-center justify-center mx-auto mb-4">
                     <span className="text-white text-2xl">🎯</span>
                  </div>
                  <h3 className="text-xl font-bold mb-3">VPN-Like Behavior</h3>
                  <p className="text-gray-600">
                     Works on all websites automatically. Toggle on/off
                     instantly. No configuration needed.
                  </p>
               </div>

               <div className="card text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-purple-800 rounded-full flex items-center justify-center mx-auto mb-4">
                     <span className="text-white text-2xl">📊</span>
                  </div>
                  <h3 className="text-xl font-bold mb-3">Real-Time Metrics</h3>
                  <p className="text-gray-600">
                     See performance improvements instantly. Track speed, size
                     reduction, and optimization stats.
                  </p>
               </div>
            </div>
         </section>

         {/* How It Works */}
         <section id="how-it-works" className="bg-white py-16">
            <div className="container mx-auto px-6">
               <h2 className="text-4xl font-bold text-center mb-12">
                  How It Works
               </h2>
               <div className="max-w-4xl mx-auto">
                  <div className="space-y-8">
                     <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0 w-12 h-12 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold text-xl">
                           1
                        </div>
                        <div>
                           <h3 className="text-xl font-bold mb-2">
                              Install Extension
                           </h3>
                           <p className="text-gray-600">
                              Download and install the Compressor Chrome
                              extension in seconds.
                           </p>
                        </div>
                     </div>

                     <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0 w-12 h-12 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold text-xl">
                           2
                        </div>
                        <div>
                           <h3 className="text-xl font-bold mb-2">Toggle On</h3>
                           <p className="text-gray-600">
                              Click the extension icon and toggle it ON. It
                              works like a VPN - affects all websites you visit.
                           </p>
                        </div>
                     </div>

                     <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0 w-12 h-12 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold text-xl">
                           3
                        </div>
                        <div>
                           <h3 className="text-xl font-bold mb-2">
                              Browse Faster
                           </h3>
                           <p className="text-gray-600">
                              Images, CSS, videos, and fonts are automatically
                              removed. Pages load instantly with plain text and
                              structure.
                           </p>
                        </div>
                     </div>

                     <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0 w-12 h-12 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold text-xl">
                           4
                        </div>
                        <div>
                           <h3 className="text-xl font-bold mb-2">
                              View Analytics
                           </h3>
                           <p className="text-gray-600">
                              Click "Get Full Info" to see detailed performance
                              metrics and optimization statistics on our
                              dashboard.
                           </p>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         </section>

         {/* Benefits Section */}
         <section id="benefits" className="container mx-auto px-6 py-16">
            <h2 className="text-4xl font-bold text-center mb-12">
               Who Benefits
            </h2>
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
               <div className="card">
                  <h3 className="text-2xl font-bold mb-3">
                     Students & Researchers
                  </h3>
                  <p className="text-gray-600 mb-4">
                     Access college ERPs and research websites faster. Focus on
                     content without waiting for heavy pages to load.
                  </p>
                  <ul className="space-y-2 text-gray-600">
                     <li>✓ Faster access to educational portals</li>
                     <li>✓ Reduced data usage</li>
                     <li>✓ Better performance on slow connections</li>
                  </ul>
               </div>

               <div className="card">
                  <h3 className="text-2xl font-bold mb-3">
                     Slow Connection Users
                  </h3>
                  <p className="text-gray-600 mb-4">
                     Perfect for users with limited bandwidth or slow internet
                     connections. Get the information you need quickly.
                  </p>
                  <ul className="space-y-2 text-gray-600">
                     <li>✓ 90% faster page loads</li>
                     <li>✓ Minimal data consumption</li>
                     <li>✓ Works on any connection speed</li>
                  </ul>
               </div>

               <div className="card">
                  <h3 className="text-2xl font-bold mb-3">
                     Content-Focused Users
                  </h3>
                  <p className="text-gray-600 mb-4">
                     If you only care about text content, remove all
                     distractions and focus on what matters.
                  </p>
                  <ul className="space-y-2 text-gray-600">
                     <li>✓ Clean, distraction-free browsing</li>
                     <li>✓ Faster reading experience</li>
                     <li>✓ Reduced visual clutter</li>
                  </ul>
               </div>

               <div className="card">
                  <h3 className="text-2xl font-bold mb-3">
                     Developers & Testers
                  </h3>
                  <p className="text-gray-600 mb-4">
                     Test website performance and see how your site performs
                     without heavy assets.
                  </p>
                  <ul className="space-y-2 text-gray-600">
                     <li>✓ Performance testing tool</li>
                     <li>✓ Analytics and metrics</li>
                     <li>✓ Optimization insights</li>
                  </ul>
               </div>
            </div>
         </section>

         {/* CTA Section */}
         <section className="bg-gradient-to-r from-purple-600 to-purple-800 text-white py-16">
            <div className="container mx-auto px-6 text-center">
               <h2 className="text-4xl font-bold mb-4">
                  Ready to Speed Up Your Web?
               </h2>
               <p className="text-xl mb-8 opacity-90">
                  Download Compressor extension and experience the difference
               </p>
               <a
                  href="#"
                  className="bg-white text-purple-600 px-8 py-4 rounded-lg font-semibold text-lg shadow-lg hover:shadow-xl transition inline-block"
                  onClick={(e) => {
                     e.preventDefault();
                     alert(
                        "Extension download will be available after building the extension!",
                     );
                  }}
               >
                  Download Now
               </a>
            </div>
         </section>

         {/* Footer */}
         <footer className="bg-blackish text-white py-8">
            <div className="container mx-auto px-6 text-center">
               <p className="text-gray-400">
                  © 2025 Compressor. All rights reserved. |
                  <Link
                     to="/dashboard"
                     className="ml-2 hover:text-white transition"
                  >
                     Dashboard
                  </Link>
               </p>
            </div>
         </footer>
      </div>
   );
}

export default Home;
