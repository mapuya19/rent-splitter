import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Privacy Policy for Rent Splitter - Learn how we protect your data and privacy.',
  robots: {
    index: true,
    follow: true,
  },
};

export default function PrivacyPolicy() {
  return (
    <main className="min-h-screen bg-gray-50 pt-8 pb-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg border border-gray-200 p-8 shadow-sm">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
          <p className="text-sm text-gray-600 mb-8">
            Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>

          <div className="prose prose-gray max-w-none space-y-6">
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-3">Introduction</h2>
              <p className="text-gray-700 leading-relaxed">
                Welcome to Rent Splitter. We respect your privacy and are committed to protecting your personal data. 
                This privacy policy explains how we handle your information when you use our rent splitting calculator.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-3">Information We Collect</h2>
              <p className="text-gray-700 leading-relaxed mb-3">
                Rent Splitter operates as a client-side application. We collect the following types of information:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li><strong>Calculation Data:</strong> When you use the calculator, data such as rent amounts, roommate information, income, and room sizes is processed locally in your browser.</li>
                <li><strong>Shared Links:</strong> If you generate a shareable link, the calculation data is encoded in the URL. This data exists only in the URL and is not stored on our servers.</li>
                <li><strong>Usage Analytics:</strong> We may collect anonymous usage statistics to improve our service (if analytics are enabled).</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-3">How We Use Your Information</h2>
              <p className="text-gray-700 leading-relaxed">
                All calculations are performed locally in your browser. We do not store, transmit, or have access to your personal financial information. 
                Shareable links contain encoded data in the URL, which you control - anyone with the link can access the encoded data.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-3">Data Storage</h2>
              <p className="text-gray-700 leading-relaxed">
                Rent Splitter does not store your calculation data on any server. All data processing happens in your browser. 
                Shareable links contain data in the URL itself, which means the data only exists where you share it.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-3">Third-Party Services</h2>
              <p className="text-gray-700 leading-relaxed">
                Rent Splitter may use third-party services for hosting and analytics. These services may collect anonymous usage data 
                in accordance with their own privacy policies. We do not share your personal calculation data with third parties.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-3">Chatbot Feature</h2>
              <p className="text-gray-700 leading-relaxed">
                Our AI chatbot feature uses the Groq API (Llama 3.1 model). Messages you send to the chatbot are processed by Groq's service 
                to generate responses. We do not store your chat history, but please be mindful of the information you share in chat messages.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-3">Cookies and Tracking</h2>
              <p className="text-gray-700 leading-relaxed">
                Rent Splitter uses minimal cookies, primarily for essential functionality. We do not use cookies for advertising or 
                extensive tracking purposes.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-3">Your Rights</h2>
              <p className="text-gray-700 leading-relaxed">
                Since we do not store your personal data, you have full control over your information. You can:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700 mt-3">
                <li>Clear your browser data at any time to remove any locally stored information</li>
                <li>Choose not to use shareable links if you prefer not to encode data in URLs</li>
                <li>Stop using the service at any time</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-3">Security</h2>
              <p className="text-gray-700 leading-relaxed">
                While we strive to protect your information, please remember that shareable links contain your data in the URL. 
                Only share these links with trusted parties. Be cautious about sharing links in public forums or social media.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-3">Changes to This Policy</h2>
              <p className="text-gray-700 leading-relaxed">
                We may update this privacy policy from time to time. We will notify users of any material changes by updating 
                the "Last updated" date at the top of this page.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-3">Contact Us</h2>
              <p className="text-gray-700 leading-relaxed">
                If you have questions about this privacy policy, please contact us through our website or GitHub repository.
              </p>
            </section>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <Link
              href="/"
              className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

