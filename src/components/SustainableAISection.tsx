export default function SustainableAISection() {
  return (
    <section className="mt-8 max-w-5xl mx-auto px-6">
      <h3 className="text-2xl font-bold text-primary">How We Use Sustainable AI</h3>
      <ol className="mt-4 list-decimal pl-6 space-y-3 text-muted-foreground">
        <li className="text-base">
          <strong className="text-foreground">Use existing datasets:</strong> We rely on published emission factors and open datasets.
        </li>
        <li className="text-base">
          <strong className="text-foreground">Explainable estimates:</strong> Each result shows the factors and assumptions used.
        </li>
        <li className="text-base">
          <strong className="text-foreground">Lightweight inference:</strong> We call small, prebuilt models/APIs (no training) to keep energy low.
        </li>
        <li className="text-base">
          <strong className="text-foreground">Actionable tips:</strong> Recommendations are short, localized and realistic for students.
        </li>
      </ol>
    </section>
  );
}
