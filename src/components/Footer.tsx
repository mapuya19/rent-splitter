import { Github, ExternalLink } from 'lucide-react';
import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col gap-2 text-center">
          {/* Links Section */}
          <div className="flex flex-col sm:flex-row flex-wrap justify-center items-center gap-1 sm:gap-4">
            <Link
              href="/privacy"
              className="text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              Privacy Policy
            </Link>
            <span className="hidden sm:inline text-gray-300 dark:text-gray-600">•</span>
            <Link
              href="/terms"
              className="text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              Terms of Use
            </Link>
            <span className="hidden sm:inline text-gray-300 dark:text-gray-600">•</span>
            <a
              href="https://github.com/mapuya19/rent-splitter"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <span className="inline-flex items-center">
                <Github className="h-4 w-4 mr-1" />
                GitHub
              </span>
            </a>
            <span className="hidden sm:inline text-gray-300 dark:text-gray-600">•</span>
            <a
              href="https://matthewapuya.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <span className="inline-flex items-center">
                <ExternalLink className="h-4 w-4 mr-1" />
                matthewapuya.com
              </span>
            </a>
          </div>
          
          {/* Copyright */}
          <div className="text-sm text-gray-600 dark:text-gray-400">
            © 2025 Rent Splitter. Built with Next.js and Tailwind CSS.
          </div>
        </div>
      </div>
    </footer>
  );
}
