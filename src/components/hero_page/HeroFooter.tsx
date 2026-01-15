import React from "react";

const FooterLinks: React.FC = () => {
  return (
    <footer className="footer-nav">
      <div className="footer-item">
        Our Name <span>→</span>
      </div>
      <div className="footer-item">
        Our People <span>→</span>
      </div>
      <div className="footer-item">
        Our Mission <span>→</span>
      </div>
      <div className="footer-item active">Our Way</div>
    </footer>
  );
};

export default FooterLinks;
