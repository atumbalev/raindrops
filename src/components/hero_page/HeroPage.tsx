import React from "react";
import "./HeroPage.css";

import Nav from "./Nav";
import HeroBody from "./HeroBody";
import FooterLinks from "./HeroFooter";


const HeroPage: React.FC = () => {
  return (
    <div className="page">
      <Nav />
      <HeroBody />
      <FooterLinks />
    </div>
  );
};

export default HeroPage;
