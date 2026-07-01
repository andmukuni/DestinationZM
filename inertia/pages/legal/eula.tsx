import { LegalDocument } from '~/components/legal_document'

export default function Eula() {
  return (
    <LegalDocument title="End-User License Agreement" lastUpdated="July 1, 2026">
      <p>
        This End-User License Agreement (&ldquo;Agreement&rdquo;) governs your access to and use of
        DestinationZM, a tour and travel management platform operated by DestinationZM
        (&ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;). By accessing or using our
        software, staff admin portal, or client portal, you agree to this Agreement.
      </p>

      <h2>1. License grant</h2>
      <p>
        We grant you a limited, non-exclusive, non-transferable, revocable license to use
        DestinationZM solely for lawful travel agency, booking, and customer management purposes in
        accordance with this Agreement and any applicable order or subscription terms.
      </p>

      <h2>2. Acceptable use</h2>
      <p>You agree not to:</p>
      <ul>
        <li>Use the platform for unlawful, fraudulent, or misleading travel arrangements</li>
        <li>Attempt to reverse engineer, copy, or resell the software without authorization</li>
        <li>Interfere with system security, availability, or other users&apos; access</li>
        <li>Upload malicious code or content that infringes third-party rights</li>
      </ul>

      <h2>3. Accounts and access</h2>
      <p>
        You are responsible for safeguarding login credentials and for activity under your account.
        Staff accounts are provisioned by your organization. Client portal accounts may be created
        by administrators or through approved self-registration requests.
      </p>

      <h2>4. Travel and booking data</h2>
      <p>
        DestinationZM helps manage enquiries, quotations, bookings, invoices, and related travel
        records. You remain responsible for the accuracy of travel data you enter and for compliance
        with applicable tourism, consumer protection, and financial regulations.
      </p>

      <h2>5. Third-party integrations</h2>
      <p>
        The platform may connect to third-party services such as accounting, payment, or mapping
        providers. Your use of those services is subject to their separate terms and privacy
        policies. We are not responsible for third-party service availability or practices.
      </p>

      <h2>6. Intellectual property</h2>
      <p>
        DestinationZM, including its software, branding, and documentation, is owned by us or our
        licensors. This Agreement does not transfer any ownership rights to you.
      </p>

      <h2>7. Disclaimer</h2>
      <p>
        The platform is provided &ldquo;as is&rdquo; and &ldquo;as available.&rdquo; To the fullest
        extent permitted by law, we disclaim warranties of merchantability, fitness for a particular
        purpose, and non-infringement. We do not guarantee uninterrupted or error-free operation.
      </p>

      <h2>8. Limitation of liability</h2>
      <p>
        To the maximum extent permitted by law, we shall not be liable for indirect, incidental,
        special, consequential, or punitive damages, or for lost profits, bookings, or data arising
        from your use of the platform.
      </p>

      <h2>9. Termination</h2>
      <p>
        We may suspend or terminate access if you breach this Agreement or if required for security
        or legal reasons. Upon termination, your license ends and you must stop using the platform.
      </p>

      <h2>10. Changes</h2>
      <p>
        We may update this Agreement from time to time. Material changes will be reflected on this
        page with an updated &ldquo;Last updated&rdquo; date. Continued use after changes
        constitutes acceptance.
      </p>

      <h2>11. Contact</h2>
      <p>
        Questions about this Agreement may be directed to your DestinationZM administrator or to{' '}
        <a href="mailto:legal@destinationzm.com">legal@destinationzm.com</a>.
      </p>

      <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
        <strong>Template notice:</strong> This is placeholder legal text for DestinationZM. Replace
        with counsel-reviewed terms before production use or regulatory submission.
      </p>
    </LegalDocument>
  )
}
