import { LegalDocument } from '~/components/legal_document'

export default function Privacy() {
  return (
    <LegalDocument title="Privacy Policy" lastUpdated="July 1, 2026">
      <p>
        DestinationZM (&ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;) respects your
        privacy. This Privacy Policy explains how we collect, use, disclose, and protect personal
        information when you use our tour and travel management platform, including staff admin and
        client portal access.
      </p>

      <h2>1. Information we collect</h2>
      <p>We may collect the following categories of information:</p>
      <ul>
        <li>
          <strong>Account information:</strong> name, email address, phone number, company, and role
        </li>
        <li>
          <strong>Travel and booking data:</strong> enquiries, itineraries, passenger details,
          quotations, invoices, and payment references
        </li>
        <li>
          <strong>Usage data:</strong> login timestamps, device/browser type, IP address, and
          activity logs for security and support
        </li>
        <li>
          <strong>Communications:</strong> messages submitted through portal forms or support
          channels
        </li>
      </ul>

      <h2>2. How we use information</h2>
      <p>We use personal information to:</p>
      <ul>
        <li>Provide, operate, and improve DestinationZM</li>
        <li>Process travel enquiries, bookings, billing, and client communications</li>
        <li>Authenticate users and protect against fraud or unauthorized access</li>
        <li>Comply with legal, tax, and regulatory obligations</li>
        <li>Send service-related notices and respond to support requests</li>
      </ul>

      <h2>3. Legal bases (where applicable)</h2>
      <p>
        Depending on your jurisdiction, we process personal data based on contract performance,
        legitimate business interests (such as platform security), legal obligations, and consent
        where required.
      </p>

      <h2>4. Sharing of information</h2>
      <p>We may share information with:</p>
      <ul>
        <li>
          <strong>Service providers:</strong> hosting, email, payment, accounting (e.g.,
          QuickBooks), and analytics vendors under contractual safeguards
        </li>
        <li>
          <strong>Travel suppliers and partners:</strong> when necessary to fulfill bookings you
          authorize
        </li>
        <li>
          <strong>Legal and safety:</strong> when required by law or to protect rights, safety, and
          security
        </li>
      </ul>
      <p>We do not sell personal information.</p>

      <h2>5. Data retention</h2>
      <p>
        We retain personal information for as long as needed to provide services, meet legal and
        accounting requirements, resolve disputes, and enforce agreements. Retention periods may
        vary by record type and applicable law.
      </p>

      <h2>6. Security</h2>
      <p>
        We implement administrative, technical, and organizational measures designed to protect
        personal information. No method of transmission or storage is completely secure; please use
        strong passwords and protect your credentials.
      </p>

      <h2>7. Your rights</h2>
      <p>
        Depending on your location, you may have rights to access, correct, delete, restrict, or
        export your personal information, and to object to or withdraw consent for certain
        processing. Contact us to exercise these rights.
      </p>

      <h2>8. International transfers</h2>
      <p>
        If data is processed or stored outside your country, we take steps designed to ensure
        appropriate safeguards consistent with applicable data protection laws.
      </p>

      <h2>9. Children</h2>
      <p>
        DestinationZM is intended for business and authorized client use. We do not knowingly
        collect personal information from children without appropriate consent.
      </p>

      <h2>10. Changes to this policy</h2>
      <p>
        We may update this Privacy Policy periodically. The &ldquo;Last updated&rdquo; date above
        reflects the most recent revision. Material changes will be posted on this page.
      </p>

      <h2>11. Contact</h2>
      <p>
        Privacy questions or requests may be sent to{' '}
        <a href="mailto:privacy@destinationzm.com">privacy@destinationzm.com</a> or through your
        DestinationZM administrator.
      </p>

      <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
        <strong>Template notice:</strong> This is placeholder privacy text for DestinationZM.
        Replace with counsel-reviewed policy before production use or regulatory submission.
      </p>
    </LegalDocument>
  )
}
