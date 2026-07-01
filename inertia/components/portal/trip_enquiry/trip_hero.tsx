/** Optimised local hero (960×640 JPEG, ~144KB) — served from /public with long cache headers. */
export const PORTAL_ENQUIRY_HERO_IMAGE = '/images/portal-enquiry-hero.jpg'

export default function TripHero() {
  return (
    <div className="relative isolate overflow-hidden bg-slate-900 px-6 pb-20 pt-10 text-center md:px-12 md:pb-24 md:pt-12">
      <img
        src={PORTAL_ENQUIRY_HERO_IMAGE}
        alt=""
        aria-hidden="true"
        width={960}
        height={640}
        fetchPriority="high"
        decoding="async"
        className="pointer-events-none absolute inset-0 h-full w-full object-cover object-center"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#1a2744]/92 via-[#243656]/88 to-[#1a2744]/96"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-50"
        style={{
          backgroundImage:
            'radial-gradient(circle at 20% 20%, rgba(96,165,250,0.35), transparent 40%), radial-gradient(circle at 80% 10%, rgba(34,211,238,0.2), transparent 35%), linear-gradient(to top, rgba(15,23,42,0.55), transparent 60%)',
        }}
      />
      <h1 className="relative text-3xl font-bold tracking-tight text-white drop-shadow-md md:text-4xl">
        Your enquiry
      </h1>
    </div>
  )
}
