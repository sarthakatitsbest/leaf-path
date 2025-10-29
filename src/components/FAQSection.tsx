const faqs = [
  { q: "Is this data accurate?", a: "Estimates are based on published emission factors and are intended as guidance, not legal proof." },
  { q: "Do I need an account to try it?", a: "No — explore features without signing up. Save real data when you register." },
  { q: "How private is my data?", a: "Your data is stored with Supabase. You control sharing, and we never sell data." },
  { q: "How does verification work?", a: "Certificates contain a short verification code checked by our verify endpoint." },
];

export default function FAQSection() {
  return (
    <section className="mt-12 max-w-6xl mx-auto px-6 mb-16">
      <h2 className="text-3xl font-bold text-center text-primary mb-8">Frequently Asked Questions</h2>
      <div className="grid md:grid-cols-2 gap-6">
        {faqs.map((faq) => (
          <div key={faq.q} className="p-6 bg-card rounded-xl shadow-sm border border-border">
            <h3 className="font-semibold text-lg text-foreground mb-2">{faq.q}</h3>
            <p className="text-sm text-muted-foreground">{faq.a}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
