import { Github, ExternalLink } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 mt-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-sm text-gray-600">
            © 2025 Rent Splitter. Built with Next.js and Tailwind CSS.
          </div>
          <div className="flex items-center gap-6">
            <a
              href="https://github.com/mapuya19/rent-splitter"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              <Github className="h-4 w-4" />
              GitHub
            </a>
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
        </div>
      </div>
    </footer>
  );
}