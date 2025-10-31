import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Terms of Use',
  description: 'Terms of Use for Rent Splitter - Read our terms and conditions for using the rent calculator service.',
  robots: {
    index: true,
    follow: true,
  },
};

export default function TermsOfUse() {
  return (
    <main className="min-h-screen bg-gray-50 pt-8 pb-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg border border-gray-200 p-8 shadow-sm">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Terms of Use</h1>
          <p className="text-sm text-gray-600 mb-8">
            Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>

          <div className="prose prose-gray max-w-none space-y-6">
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-3">Acceptance of Terms</h2>
              <p className="text-gray-700 leading-relaxed">
                By accessing and using Rent Splitter, you accept and agree to be bound by the terms and provision of this agreement. 
                If you do not agree to these terms, please do not use this service.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-3">Description of Service</h2>
              <p className="text-gray-700 leading-relaxed">
                Rent Splitter is a free web-based calculator that helps you split rent and utilities among roommates. 
                The service calculates rent splits based on income or room size, and splits utilities evenly between roommates. 
                You can generate shareable links to collaborate with others.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-3">Use of Service</h2>
              <p className="text-gray-700 leading-relaxed mb-3">You agree to use Rent Splitter only for lawful purposes and in accordance with these Terms. You agree not to:</p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Use the service for any illegal or unauthorized purpose</li>
                <li>Attempt to gain unauthorized access to any part of the service</li>
                <li>Interfere with or disrupt the service or servers connected to the service</li>
                <li>Use automated systems (bots, scrapers) to access the service without permission</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-3">No Warranties</h2>
              <p className="text-gray-700 leading-relaxed">
                Rent Splitter is provided "as is" and "as available" without any warranties of any kind, either express or implied. 
                We do not guarantee the accuracy, completeness, or usefulness of any calculations or results. 
                You should verify all calculations independently before making financial decisions.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-3">Limitation of Liability</h2>
              <p className="text-gray-700 leading-relaxed">
                In no event shall Rent Splitter, its creators, or contributors be liable for any indirect, incidental, special, 
                consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly, 
                or any loss of data, use, goodwill, or other intangible losses resulting from your use of the service.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-3">Financial Disclaimer</h2>
              <p className="text-gray-700 leading-relaxed">
                Rent Splitter is a calculation tool only. The results provided are estimates and should not be considered as 
                financial, legal, or professional advice. Always consult with roommates and verify calculations independently. 
                We are not responsible for any disputes or financial issues that arise from using this calculator.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-3">Privacy and Data</h2>
              <p className="text-gray-700 leading-relaxed">
                Your use of Rent Splitter is also governed by our <Link href="/privacy" className="text-blue-600 hover:text-blue-800 underline">Privacy Policy</Link>. 
                Please review it to understand our data practices. You are responsible for maintaining the confidentiality of any 
                shareable links you generate.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-3">Intellectual Property</h2>
              <p className="text-gray-700 leading-relaxed">
                The service and its original content, features, and functionality are owned by Rent Splitter and are protected by 
                international copyright, trademark, patent, trade secret, and other intellectual property laws.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-3">Modifications to Service</h2>
              <p className="text-gray-700 leading-relaxed">
                We reserve the right to modify, suspend, or discontinue the service at any time, with or without notice. 
                We shall not be liable to you or any third party for any modification, suspension, or discontinuation of the service.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-3">Termination</h2>
              <p className="text-gray-700 leading-relaxed">
                We may terminate or suspend your access to the service immediately, without prior notice or liability, for any reason, 
                including if you breach these Terms.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-3">Changes to Terms</h2>
              <p className="text-gray-700 leading-relaxed">
                We reserve the right to modify these Terms at any time. We will notify users of any material changes by updating 
                the "Last updated" date at the top of this page. Your continued use of the service after any changes constitutes 
                acceptance of those changes.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-3">Governing Law</h2>
              <p className="text-gray-700 leading-relaxed">
                These Terms shall be governed by and construed in accordance with applicable laws, without regard to its conflict of law provisions.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-3">Contact Information</h2>
              <p className="text-gray-700 leading-relaxed">
                If you have any questions about these Terms of Use, please contact us through our website or GitHub repository.
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

