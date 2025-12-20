function VideoBanner() {
  return (
    <section style={styles.hero}>
      <video style={styles.video} autoPlay loop muted>
        <source src="/gcc-video.mp4" type="video/mp4" />
      </video>

      <div style={styles.overlay}>
        <h1 style={styles.title}>Global Capability Centers</h1>
        <p style={styles.subtitle}>
          Powering innovation through global talent and technology
        </p>
      </div>
    </section>
  );
}

const styles = {
  hero: {
    position: "relative",
    height: "100vh", // FULL PAGE
    width: "100%",
    overflow: "hidden",
  },
  video: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    filter: "brightness(1.15)",
  },
  overlay: {
    position: "absolute",
    inset: 0,
    background:"linear-gradient(180deg, rgba(11,28,45,0.35), rgba(11,28,45,0.55))",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
    padding: "20px",
  },
  title: {
    fontSize: "56px",
    fontWeight: "700",
    marginBottom: "20px",
    animation: "fadeIn 1.2s ease",
  },
  subtitle: {
    fontSize: "20px",
    maxWidth: "700px",
    opacity: 0.9,
    animation: "fadeIn 1.8s ease",
  },
};

export default VideoBanner;
