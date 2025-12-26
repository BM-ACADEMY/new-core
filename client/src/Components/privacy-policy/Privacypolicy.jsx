import React from "react";

const Privacypolicy = () => {
  return (
    <div className="min-h-screen bg-gray-50 px-4 py-12">
      <div className="max-w-4xl mx-auto mt-24 bg-white rounded-2xl shadow-lg p-8 md:p-12">
        
        {/* Header */}
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
          Privacy Policy
        </h1>
        <p className="text-gray-600 mb-10">
          At <span className="font-semibold text-gray-800">CoreTalents</span>, we respect your privacy and are committed to protecting your personal data.
        </p>

        {/* Section */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-3">
            Information We Collect
          </h2>
          <p className="text-gray-600 leading-relaxed">
            We may collect personal information such as your name, email address,
            phone number, and other details when you interact with our website,
            contact forms, advertisements, or WhatsApp services.
          </p>
        </section>

        {/* Section */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-3">
            How We Use Your Information
          </h2>
          <ul className="list-disc pl-6 text-gray-600 space-y-2">
            <li>Provide educational and recruitment-related services</li>
            <li>Communicate with users via WhatsApp, email, or phone</li>
            <li>Improve our services and overall user experience</li>
          </ul>
        </section>

        {/* Section */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-3">
            Use of Meta & WhatsApp Services
          </h2>
          <p className="text-gray-600 leading-relaxed">
            Our application uses Meta platforms, including Facebook and WhatsApp
            Business APIs, to communicate with users. All user data is processed
            strictly in accordance with Meta Platform Policies.
          </p>
        </section>

        {/* Section */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-3">
            Data Sharing
          </h2>
          <p className="text-gray-600 leading-relaxed">
            We do not sell or rent personal data. Your data may be shared only with
            Meta (Facebook / WhatsApp) and trusted service providers solely for
            communication and service-related purposes.
          </p>
        </section>

        {/* Section */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-3">
            Data Retention
          </h2>
          <p className="text-gray-600 leading-relaxed">
            We retain personal data only for as long as necessary to fulfill
            service requirements or comply with legal obligations.
          </p>
        </section>

        {/* Section */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-3">
            User Data Deletion
          </h2>
          <p className="text-gray-600 leading-relaxed">
            Users can request deletion of their personal data at any time by
            contacting us at:
          </p>
          <p className="mt-2 font-medium text-blue-600">
            support@coretalents.in
          </p>
        </section>

        {/* Footer */}
        <section className="border-t pt-6 mt-10 text-sm text-gray-600">
          <p><span className="font-semibold">Company:</span> CoreTalents</p>
          <p>
            <span className="font-semibold">Website:</span>{" "}
            <a
              href="https://coretalents.in"
              target="_blank"
              rel="noreferrer"
              className="text-blue-600 hover:underline"
            >
              https://coretalents.in
            </a>
          </p>
          <p><span className="font-semibold">Email:</span> support@coretalents.in</p>
        </section>

      </div>
    </div>
  );
};

export default Privacypolicy;
