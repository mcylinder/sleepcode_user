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
        (207) 358-9026
        <br />
        <a href="mailto:contact@sleepcoding.me">contact@sleepcoding.me</a>
        <br />
        PO BOX 2803, South Portland, ME 04116
      </p>
    </section>
  );
}
