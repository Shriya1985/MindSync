import { Navigation } from "@/components/ui/navigation";
import { Footer } from "@/components/ui/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, AlertTriangle, Shield, Heart } from "lucide-react";

export default function Terms() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-mint-50 via-white to-sky-50">
      <Navigation />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-mint-500 to-sky-500 rounded-2xl mb-6">
            <FileText className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Terms of Service
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Please read these terms carefully. By using MindSync, you agree to
            these terms and conditions.
          </p>
          <Badge className="mt-4 bg-mint-100 text-mint-700">
            Last updated: January 2024
          </Badge>
        </div>

        {/* Important Notice */}
        <Card className="mb-8 shadow-lg border-0 bg-orange-50 border-l-4 border-l-orange-500">
          <CardContent className="p-6">
            <div className="flex items-start space-x-4">
              <AlertTriangle className="w-6 h-6 text-orange-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-orange-900 mb-2">
                  Important Medical Disclaimer
                </h3>
                <p className="text-orange-800 leading-relaxed">
                  MindSync is not a substitute for professional medical advice,
                  diagnosis, or treatment. If you are experiencing a mental
                  health crisis or having thoughts of self-harm, please contact
                  emergency services immediately or call a crisis helpline.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Terms Content */}
        <div className="space-y-8">
          <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Heart className="w-5 h-5 text-mint-600" />
                <span>Acceptance of Terms</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 text-gray-700">
                <p>
                  By accessing and using MindSync ("the Service"), you accept
                  and agree to be bound by the terms and provision of this
                  agreement. If you do not agree to abide by the above, please
                  do not use this service.
                </p>
                <p>
                  These Terms of Service ("Terms") govern your use of MindSync,
                  including your conversations with Buddy (our AI companion),
                  mood tracking features, journaling tools, and all related
                  services.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Use of the Service</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 text-gray-700">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">
                    Permitted Uses
                  </h4>
                  <p>You may use MindSync to:</p>
                  <ul className="list-disc list-inside space-y-1 mt-2">
                    <li>Track your mood and emotional wellbeing</li>
                    <li>Journal your thoughts and experiences</li>
                    <li>Have supportive conversations with Buddy</li>
                    <li>Access mental health resources and information</li>
                    <li>Monitor your wellness progress over time</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">
                    Prohibited Uses
                  </h4>
                  <p>You agree not to:</p>
                  <ul className="list-disc list-inside space-y-1 mt-2">
                    <li>Use the service for any unlawful purpose</li>
                    <li>
                      Attempt to reverse engineer or extract our AI algorithms
                    </li>
                    <li>Share your account credentials with others</li>
                    <li>Use the service to harm yourself or others</li>
                    <li>
                      Upload malicious content or attempt to compromise our
                      systems
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Medical Disclaimer</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 text-gray-700">
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="font-semibold text-red-900 mb-2">
                    Critical Notice:
                  </p>
                  <p className="text-red-800">
                    MindSync and Buddy are not medical devices and do not
                    provide medical advice, diagnosis, or treatment. Our AI
                    companion is designed for emotional support and wellness
                    tracking only.
                  </p>
                </div>
                <ul className="space-y-2 list-disc list-inside">
                  <li>
                    Always consult with qualified healthcare professionals for
                    medical advice
                  </li>
                  <li>
                    Do not use MindSync as a replacement for therapy,
                    counseling, or psychiatric care
                  </li>
                  <li>
                    If you're experiencing thoughts of self-harm or suicide,
                    contact emergency services immediately
                  </li>
                  <li>
                    MindSync provides crisis resources but is not a crisis
                    intervention service
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Account Responsibilities</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 text-gray-700">
                <p>
                  You are responsible for maintaining the confidentiality of
                  your account and password and for restricting access to your
                  computer or device.
                </p>
                <ul className="space-y-2 list-disc list-inside">
                  <li>
                    Use a strong, unique password for your MindSync account
                  </li>
                  <li>
                    Log out of your account when using shared or public devices
                  </li>
                  <li>
                    Notify us immediately if you suspect unauthorized account
                    access
                  </li>
                  <li>
                    Keep your contact information up to date in case we need to
                    reach you
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Privacy and Data</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 text-gray-700">
                <p>
                  Your privacy is fundamental to our service. Please review our
                  Privacy Policy to understand how we collect, use, and protect
                  your information.
                </p>
                <div className="p-4 bg-mint-50 border border-mint-200 rounded-lg">
                  <p className="font-semibold text-mint-900 mb-2">
                    Key Privacy Points:
                  </p>
                  <ul className="space-y-1 text-mint-800 list-disc list-inside">
                    <li>Your mental health data is encrypted and secure</li>
                    <li>We never sell your personal information</li>
                    <li>You can export or delete your data at any time</li>
                    <li>
                      We only use your data to provide and improve our service
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Service Availability</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 text-gray-700">
                <p>
                  We strive to keep MindSync available 24/7, but we cannot
                  guarantee uninterrupted service. We may need to:
                </p>
                <ul className="space-y-2 list-disc list-inside">
                  <li>Perform maintenance or updates</li>
                  <li>Address security vulnerabilities</li>
                  <li>Comply with legal requirements</li>
                  <li>Improve service performance</li>
                </ul>
                <p>
                  We will provide reasonable notice for planned maintenance when
                  possible.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Limitation of Liability</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 text-gray-700">
                <p>
                  MindSync is provided "as is" without warranties of any kind.
                  We shall not be liable for any indirect, incidental, special,
                  consequential, or punitive damages.
                </p>
                <p>
                  Our liability is limited to the maximum extent permitted by
                  law. In jurisdictions that do not allow the exclusion of
                  certain warranties, some of the above exclusions may not apply
                  to you.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Changes to Terms</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 text-gray-700">
                <p>
                  We may update these Terms from time to time. When we do, we
                  will:
                </p>
                <ul className="space-y-2 list-disc list-inside">
                  <li>Post the updated Terms on this page</li>
                  <li>Update the "Last updated" date</li>
                  <li>
                    Notify you via email or in-app notification for significant
                    changes
                  </li>
                  <li>
                    Give you reasonable time to review changes before they take
                    effect
                  </li>
                </ul>
                <p>
                  Continued use of MindSync after changes take effect
                  constitutes acceptance of the new Terms.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-gray-700">
                <p className="mb-4">
                  If you have questions about these Terms of Service, please
                  contact us:
                </p>
                <div className="space-y-2">
                  <p>
                    <strong>Email:</strong> legal@mindsync.app
                  </p>
                  <p>
                    <strong>Support:</strong> support@mindsync.app
                  </p>
                  <p>
                    <strong>Address:</strong> MindSync Legal Department, 123
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
