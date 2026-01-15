import React from "react";

const Nav: React.FC = () => {
  return (
    <header className="nav">
      <div className="nav-left">21GRAMS</div>

      <nav className="nav-center">
        <a href="#">Who We Are</a>
        <a href="#">What We Do</a>
        <a href="#">Work With Us</a>
      </nav>

      <div className="nav-right">
        <button className="cta">Let's Have Dinner</button>
      </div>
    </header>
  );
};

export default Nav;
