interface LegalContactProps {
  sectionNumber?: number;
}

export default function LegalContact({ sectionNumber = 11 }: LegalContactProps) {
  return (
    <section className="mb-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">
        {sectionNumber}. Contact Information
      </h2>
      <p className="text-gray-700 leading-relaxed mb-4">
        If you have questions, requests, or complaints regarding this policy, please contact us:
      </p>
      <div className="text-gray-700 leading-relaxed space-y-2">
        <p>Sleep Coder LLC</p>
        <p>(207) 358-9026</p>
        <p>
          <a 
            href="mailto:contact@sleepcoding.me"
            className="text-cyan-950 hover:text-cyan-800 transition-colors duration-200"
          >
            contact@sleepcoding.me
          </a>
        </p>
        <p className="mt-4">
          PO BOX 2803<br />
          South Portland, ME 04116
        </p>
      </div>
    </section>
  );
}
