const stats = [
  { value: "50K+", label: "Interviews Conducted" },
  { value: "70%", label: "Time Saved" },
  { value: "92%", label: "Hiring Accuracy" },
  { value: "4.9/5", label: "User Rating" },
];

export function Stats() {
  return (
    <section className="py-16 bg-primary text-primary-foreground">
      <div className="section-container">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-3xl md:text-4xl font-bold mb-2">
                {stat.value}
              </div>
              <div className="text-sm text-primary-foreground/80">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
