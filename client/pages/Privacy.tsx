import { Navigation } from "@/components/ui/navigation";
import { Footer } from "@/components/ui/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Lock, Eye, Download, Trash2, Globe } from "lucide-react";

const privacyPrinciples = [
  {
    icon: Shield,
    title: "Data Protection",
    description:
      "Your mental health data is encrypted using industry-standard AES-256 encryption, both in transit and at rest.",
  },
  {
    icon: Lock,
    title: "Access Control",
    description:
      "Only you have access to your personal data. We never share your information with third parties without explicit consent.",
  },
  {
    icon: Eye,
    title: "Transparency",
    description:
      "We're completely transparent about what data we collect, how we use it, and how long we keep it.",
  },
  {
    icon: Download,
    title: "Data Portability",
    description:
      "You can export all your data at any time in a standard JSON format that you own and control.",
  },
];

export default function Privacy() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-mint-50 via-white to-sky-50">
      <Navigation />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-mint-500 to-sky-500 rounded-2xl mb-6">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Privacy Policy
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Your privacy is fundamental to our mission. Learn how we protect
            your mental health data and respect your privacy.
          </p>
          <Badge className="mt-4 bg-mint-100 text-mint-700">
            Last updated: January 2024
          </Badge>
        </div>

        {/* Privacy Principles */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {privacyPrinciples.map((principle, index) => (
            <Card
              key={index}
              className="shadow-lg border-0 bg-white/90 backdrop-blur-sm"
            >
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-mint-100 to-sky-100 rounded-xl flex items-center justify-center">
                    <principle.icon className="w-6 h-6 text-mint-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {principle.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {principle.description}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Privacy Policy Content */}
        <div className="space-y-8">
          <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Information We Collect</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-gray max-w-none">
              <div className="space-y-4 text-gray-700">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">
                    Account Information
                  </h4>
                  <p>
                    When you create an account, we collect your name, email
                    address, and password (which is encrypted and never stored
                    in plain text).
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">
                    Wellness Data
                  </h4>
                  <p>
                    Your mood entries, journal posts, conversations with Buddy,
                    and any tags or notes you add. This is the core of your
                    MindSync experience and is always kept private.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">
                    Usage Analytics
                  </h4>
                  <p>
                    We collect anonymous usage statistics to improve the app,
                    such as which features are most helpful. This data cannot be
                    linked back to your identity.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>How We Use Your Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 text-gray-700">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">
                    Personalized Experience
                  </h4>
                  <p>
                    Your wellness data helps Buddy provide more relevant
                    responses and helps you track your progress over time.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">
                    Service Improvement
                  </h4>
                  <p>
                    Anonymous, aggregated data helps us understand how to make
                    MindSync more helpful for everyone.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">
                    Safety & Security
                  </h4>
                  <p>
                    We monitor for potential safety concerns and may provide
                    crisis resources when appropriate.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Data Security</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 text-gray-700">
                <p>
                  We implement multiple layers of security to protect your data:
                </p>
                <ul className="space-y-2 list-disc list-inside">
                  <li>
                    <strong>Encryption:</strong> All data is encrypted using
                    AES-256 encryption both in transit (HTTPS) and at rest.
                  </li>
                  <li>
                    <strong>Access Controls:</strong> Strict access controls
                    ensure only authorized personnel can access systems, and
                    never your personal data.
                  </li>
                  <li>
                    <strong>Regular Audits:</strong> We conduct regular security
                    audits and penetration testing.
                  </li>
                  <li>
                    <strong>Data Minimization:</strong> We only collect and
                    store data that's necessary for providing our service.
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Your Rights</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 text-gray-700">
                <p>You have complete control over your data:</p>
                <ul className="space-y-2 list-disc list-inside">
                  <li>
                    <strong>Access:</strong> View all the data we have about you
                    in your profile settings.
                  </li>
                  <li>
                    <strong>Export:</strong> Download all your data in a
                    portable JSON format.
                  </li>
                  <li>
                    <strong>Correction:</strong> Update or correct any
                    information in your profile.
                  </li>
                  <li>
                    <strong>Deletion:</strong> Permanently delete your account
                    and all associated data.
                  </li>
                  <li>
                    <strong>Portability:</strong> Take your data with you if you
                    choose to leave MindSync.
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>What We Don't Do</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 text-gray-700">
                <p className="font-semibold text-gray-900">
                  We are committed to NOT doing the following:
                </p>
                <ul className="space-y-2 list-disc list-inside">
                  <li>Sell your personal data to third parties</li>
                  <li>
                    Share your mental health information with anyone without
                    explicit consent
                  </li>
                  <li>Use your data for advertising purposes</li>
                  <li>
                    Store your conversations or journal entries longer than
                    necessary
                  </li>
                  <li>Track you across other websites or apps</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Contact Us</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-gray-700">
                <p className="mb-4">
                  If you have any questions about this Privacy Policy or how we
                  handle your data, please contact us:
                </p>
                <div className="space-y-2">
                  <p>
                    <strong>Email:</strong> privacy@mindsync.app
                  </p>
                  <p>
                    <strong>Data Protection Officer:</strong> dpo@mindsync.app
                  </p>
                  <p>
                    <strong>Address:</strong> MindSync Privacy Team, 123
                    Wellness St, Mental Health City, MH 12345
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
}
