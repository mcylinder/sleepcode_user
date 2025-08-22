import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <p className="text-sm text-gray-300">
              © {currentYear} Sleep Coder LLC. All rights reserved.
            </p>
          </div>
          
          <nav className="flex flex-wrap justify-center gap-6">
            <Link 
              href="/terms" 
              className="text-sm text-gray-300 hover:text-white transition-colors duration-200"
            >
              Terms
            </Link>
            <Link 
              href="/privacy" 
              className="text-sm text-gray-300 hover:text-white transition-colors duration-200"
            >
              Privacy
            </Link>
            <Link 
              href="/cookies" 
              className="text-sm text-gray-300 hover:text-white transition-colors duration-200"
            >
              Cookies
            </Link>
            <Link 
              href="/contact" 
              className="text-sm text-gray-300 hover:text-white transition-colors duration-200"
            >
              Contact
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
