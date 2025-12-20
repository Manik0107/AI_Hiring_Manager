import { useNavigate } from "react-router-dom";

function RolesSection() {
  const navigate = useNavigate();

  const roles = [
    {
      title: "Data Science",
      desc: "Advanced analytics and predictive modeling initiatives",
      icon: "📊",
      jd: "/jd/data-science.docx",
      gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    },
    {
      title: "Data Analytics",
      desc: "Business intelligence and data-driven insights",
      icon: "📈",
      jd: "/jd/data-analytics.docx",
      gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
    },
    {
      title: "Digital Innovation",
      desc: "Driving next-generation digital transformation",
      icon: "💡",
      jd: "/jd/digital-innovation.docx",
      gradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
    },
    {
      title: "Web Applications",
      desc: "Scalable and secure web application development",
      icon: "🌐",
      jd: "/jd/web-applications.docx",
      gradient: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
    },
    {
      title: "Platform Engineering",
      desc: "Building resilient and scalable technology platforms",
      icon: "⚙️",
      jd: "/jd/platform-engineering.docx",
      gradient: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
    },
    {
      title: "Automation",
      desc: "Intelligent automation and process optimization",
      icon: "🤖",
      jd: "/jd/automation.docx",
      gradient: "linear-gradient(135deg, #30cfd0 0%, #330867 100%)",
    },
    {
      title: "Software Development",
      desc: "Enterprise software engineering and solutions",
      icon: "💻",
      jd: "/jd/software-development.docx",
      gradient: "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)",
    },
  ];

  return (
    <section style={styles.section}>
      {/* Section Header */}
      <div style={styles.headerContainer}>
        <div style={styles.decorativeLine}></div>
        <h2 style={styles.heading}>
          Current Hiring Opportunities at Our Global Capability Centers
        </h2>
        <p style={styles.subheading}>
          Join our team of innovators and shape the future of technology
        </p>
      </div>

      {/* Roles Grid */}
      <div style={styles.grid}>
        {roles.map((role, index) => (
          <div
            key={index}
            style={styles.card}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-8px)";
              e.currentTarget.style.boxShadow =
                "0 20px 40px rgba(0, 170, 243, 0.3)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 10px 30px rgba(0, 0, 0, 0.3)";
            }}
          >
            {/* Gradient border effect */}
            <div
              style={{
                ...styles.gradientBorder,
                background: role.gradient,
              }}
            ></div>

            {/* Icon */}
            <div style={styles.iconContainer}>
              <span style={styles.roleIcon}>{role.icon}</span>
            </div>

            {/* Content */}
            <h3 style={styles.roleTitle}>{role.title}</h3>
            <p style={styles.roleDesc}>{role.desc}</p>

            {/* Job Description Link */}
            <a
              href={role.jd}
              style={styles.jdBtn}
              target="_blank"
              rel="noreferrer"
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(0, 170, 243, 0.15)";
                e.currentTarget.style.borderColor = "#00aaf3ff";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.3)";
              }}
            >
              View Job Description →
            </a>
          </div>
        ))}
      </div>

      {/* Call to Action */}
      <div style={styles.ctaContainer}>
        <button
          style={styles.applyBtn}
          onClick={() => navigate("/login")}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "scale(1.05)";
            e.currentTarget.style.boxShadow = "0 15px 40px rgba(0, 170, 243, 0.5)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "scale(1)";
            e.currentTarget.style.boxShadow = "0 10px 30px rgba(0, 170, 243, 0.3)";
          }}
        >
          Apply Now →
        </button>
        <p style={styles.ctaSubtext}>
          Start your journey with us today
        </p>
      </div>
    </section>
  );
}

const styles = {
  section: {
    padding: "120px 40px 100px",
    background: "linear-gradient(180deg, #0b1c2d 0%, #1a2f42 50%, #0b1c2d 100%)",
    textAlign: "center",
    position: "relative",
  },
  headerContainer: {
    marginBottom: "80px",
    maxWidth: "900px",
    marginLeft: "auto",
    marginRight: "auto",
  },
  decorativeLine: {
    width: "80px",
    height: "4px",
    background: "linear-gradient(90deg, #00aaf3ff 0%, #667eea 100%)",
    margin: "0 auto 30px",
    borderRadius: "2px",
  },
  heading: {
    fontSize: "42px",
    marginBottom: "20px",
    fontFamily: "'Poppins', sans-serif",
    fontWeight: "700",
    background: "linear-gradient(135deg, #ffffff 0%, #00aaf3ff 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    lineHeight: "1.3",
  },
  subheading: {
    fontSize: "18px",
    opacity: 0.85,
    fontWeight: "400",
    color: "#ffffff",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
    gap: "35px",
    maxWidth: "1200px",
    margin: "0 auto",
  },
  card: {
    position: "relative",
    minHeight: "240px",
    padding: "35px 30px",
    background: "rgba(255,255,255,0.06)",
    borderRadius: "20px",
    backdropFilter: "blur(12px)",
    border: "1px solid rgba(255,255,255,0.1)",
    textAlign: "left",
    transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
    boxShadow: "0 10px 30px rgba(0, 0, 0, 0.3)",
    overflow: "hidden",
  },
  gradientBorder: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "4px",
    opacity: 0.8,
  },
  iconContainer: {
    width: "70px",
    height: "70px",
    background: "rgba(0, 170, 243, 0.15)",
    borderRadius: "16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "20px",
    border: "1px solid rgba(0, 170, 243, 0.3)",
  },
  roleIcon: {
    fontSize: "32px",
  },
  roleTitle: {
    fontSize: "24px",
    fontWeight: "700",
    marginBottom: "12px",
    color: "#ffffff",
  },
  roleDesc: {
    fontSize: "15px",
    opacity: 0.85,
    marginBottom: "25px",
    lineHeight: "1.6",
    color: "#ffffff",
  },
  jdBtn: {
    display: "inline-block",
    padding: "12px 24px",
    borderRadius: "8px",
    border: "1px solid rgba(255,255,255,0.3)",
    color: "#ffffff",
    textDecoration: "none",
    fontSize: "14px",
    fontWeight: "500",
    transition: "all 0.3s ease",
  },
  ctaContainer: {
    marginTop: "100px",
  },
  applyBtn: {
    padding: "20px 70px",
    fontSize: "20px",
    fontWeight: "700",
    background: "linear-gradient(135deg, #00aaf3ff 0%, #0088cc 100%)",
    color: "white",
    border: "none",
    borderRadius: "50px",
    cursor: "pointer",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    boxShadow: "0 10px 30px rgba(0, 170, 243, 0.3)",
    letterSpacing: "0.5px",
  },
  ctaSubtext: {
    marginTop: "20px",
    fontSize: "14px",
    opacity: 0.7,
    color: "#ffffff",
  },
};

export default RolesSection;
