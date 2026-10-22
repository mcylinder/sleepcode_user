interface LegalContactProps {
  sectionNumber?: number;
}

export default function LegalContact({ sectionNumber = 11 }: LegalContactProps) {
  return (
    <section>
      <h2>{sectionNumber}. Contact Information</h2>
      <p>If you have questions, requests, or complaints regarding this policy, please contact us:</p>
      <p>
        Sleep Coder LLC
        <br />
        <a href="mailto:contact@sleepcoding.me">contact@sleepcoding.me</a>
        <br />
        PO Box 442, South Wellfleet, MA 02663
      </p>
    </section>
  );
}
