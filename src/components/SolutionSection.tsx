export default function SolutionSection() {
  return (
    <section className="mt-8 max-w-6xl mx-auto px-6">
      <div className="bg-gradient-to-br from-primary/5 to-accent/5 p-8 rounded-2xl shadow-md border border-border">
        <h2 className="text-3xl font-bold text-primary">Our Solution — Sustainable AI for Everyone</h2>
        <p className="mt-4 text-lg text-foreground leading-relaxed">
          We propose building a web-based platform with backend support that promotes sustainable living.
          Users can input simple details like daily travel mode, energy usage, and lifestyle habits. The
          system will use predefined AI/ML APIs and existing sustainability datasets (instead of training
          new models) to estimate the carbon footprint. Based on this data, the website will give easy,
          actionable suggestions such as using a bicycle for short trips, turning off unused appliances,
          or switching to reusable bottles.
        </p>

        <div className="mt-6 grid sm:grid-cols-2 gap-4">
          <div className="p-5 bg-card rounded-xl border border-border">
            <h3 className="font-semibold text-lg text-primary">Why Sustainable AI?</h3>
            <p className="text-sm text-muted-foreground mt-2">
              We reuse trusted models and datasets to minimize compute, energy costs, and bias — focusing on
              explainability and actionable outcomes.
            </p>
          </div>
          <div className="p-5 bg-card rounded-xl border border-border">
            <h3 className="font-semibold text-lg text-primary">Student-friendly & Practical</h3>
            <p className="text-sm text-muted-foreground mt-2">
              A simple form-first UI that any student can use — capture trips, receipts or daily habits in minutes.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
