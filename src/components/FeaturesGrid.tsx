const features = [
  { title: "Quick Capture", desc: "Receipts, trips, and short surveys — fast and mobile-friendly." },
  { title: "Explainable Estimates", desc: "We show how each number is computed using public data." },
  { title: "Local AQ Comparison", desc: "See how your footprint compares to nearby users." },
  { title: "Weekly Reports", desc: "Auto-generated summaries showing progress over time." },
  { title: "Rewards & Badges", desc: "Earn certificates and badges you can share." },
  { title: "Privacy-first", desc: "Your data stays with you — opt-in sharing only." }
];

export default function FeaturesGrid() {
  return (
    <section className="mt-12 max-w-6xl mx-auto px-6">
      <h2 className="text-3xl font-bold text-center text-primary mb-8">Key Features</h2>
      <div className="grid md:grid-cols-3 gap-5">
        {features.map((feature) => (
          <div key={feature.title} className="p-6 bg-card rounded-xl shadow-sm border border-border hover:shadow-md transition-shadow">
            <h3 className="font-semibold text-lg text-primary">{feature.title}</h3>
            <p className="text-sm text-muted-foreground mt-3">{feature.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
