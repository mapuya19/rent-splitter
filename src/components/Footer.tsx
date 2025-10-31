import { Github, ExternalLink } from 'lucide-react';
import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 mt-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col gap-6">
          {/* Links Section */}
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
            <Link
              href="/privacy"
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              Privacy Policy
            </Link>
            <span className="text-gray-300">•</span>
            <Link
              href="/terms"
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              Terms of Use
            </Link>
            <span className="text-gray-300">•</span>
            <a
              href="https://github.com/mapuya19/rent-splitter"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              <Github className="h-4 w-4" />
              GitHub
            </a>
            <span className="text-gray-300">•</span>
            <a
              href="https://matthewapuya.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ExternalLink className="h-4 w-4" />
              matthewapuya.com
            </a>
          </div>
          
          {/* Copyright */}
          <div className="text-center text-sm text-gray-600">
            © 2025 Rent Splitter. Built with Next.js and Tailwind CSS.
          </div>
        </div>
      </div>
    </footer>
  );
}