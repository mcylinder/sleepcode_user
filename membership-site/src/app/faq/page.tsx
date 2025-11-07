export default function FAQPage() {
  const faqs = [
    {
      question: "How does SleepCoding track my sleep?",
      answer: "SleepCoding uses advanced algorithms and your device's sensors to monitor your sleep patterns. The app tracks sleep duration, quality, and provides insights based on your movement and sleep cycles. You can also manually log your sleep data for more accurate tracking."
    },
    {
      question: "What devices are supported?",
      answer: "SleepCoding is available on iOS and Android devices. The app works with most smartphones and tablets, and we're constantly expanding our device compatibility. You can also access your data through our web account page for a comprehensive view of your sleep patterns."
    },
    {
      question: "Is my sleep data private and secure?",
      answer: "Absolutely. We take your privacy seriously. All sleep data is encrypted and stored securely. We never share your personal information with third parties without your explicit consent. You have full control over your data and can delete it at any time."
    },
    {
      question: "What's the difference between free and premium features?",
      answer: "The free version includes basic sleep tracking, duration monitoring, and simple insights. Premium membership unlocks advanced analytics, AI-powered recommendations, sleep quality scoring, personalized coaching, and priority customer support. Premium features provide deeper insights to help you optimize your sleep."
    },
    {
      question: "Can I export my sleep data?",
      answer: "Yes, premium users can export their sleep data in various formats including CSV and PDF. This allows you to share your sleep insights with healthcare providers or keep personal records. Free users have limited export options."
    },
    {
      question: "How accurate is the sleep tracking?",
      answer: "Our sleep tracking is highly accurate for most users. The app uses multiple data points including movement, heart rate (when available), and user input to provide comprehensive sleep analysis. However, accuracy may vary based on device placement and individual sleep patterns."
    },
    {
      question: "Do you offer customer support?",
      answer: "Yes, we provide customer support through multiple channels. Free users can access our help center and community forums. Premium members receive priority support with faster response times and direct access to our support team via email and chat."
    },
    {
      question: "Can I use SleepCoding without an internet connection?",
      answer: "Yes, the app works offline for basic sleep tracking. Your data will sync automatically when you reconnect to the internet. However, some features like AI recommendations and cloud backup require an internet connection."
    },
    {
      question: "What if I have trouble sleeping?",
      answer: "SleepCoding provides personalized recommendations based on your sleep patterns. Premium users get access to sleep coaching and advanced insights that can help identify potential sleep issues. However, if you're experiencing persistent sleep problems, we recommend consulting with a healthcare professional."
    },
    {
      question: "How do I cancel my subscription?",
      answer: "You can cancel your premium subscription at any time through your account settings or by contacting our support team. You'll continue to have access to premium features until the end of your current billing period. After cancellation, your account will revert to the free plan."
    }
  ];

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl">
            Frequently Asked Questions
          </h1>
          <p className="mt-4 text-xl text-gray-600">
            Find answers to common questions about SleepCode
          </p>
        </div>

        <div className="space-y-6">
          {faqs.map((faq, index) => (
            <div key={index} className="bg-[#dfeaf0] shadow-sm rounded-lg">
              <div className="px-6 py-8">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  {faq.question}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {faq.answer}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <div className="bg-[#dfeaf0] shadow-sm p-8 rounded-lg">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Still have questions?
            </h2>
            <p className="text-gray-600 mb-6">
              Can&apos;t find the answer you&apos;re looking for? Our support team is here to help.
            </p>
            <a
              href="/contact"
              className="btn-primary"
            >
              Contact Support
            </a>
          </div>
        </div>
      </div>
    </div>
  );
} 