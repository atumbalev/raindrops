import React from "react";
import Raindrops from "../raindrops/Raindrops";

const HeroBody: React.FC = () => {
  return (
    <main className="hero">
      <Raindrops rainSound={true} rainVolume={1.0} umbrella={true} />

      <div className="hero-content">
        <p>
          <span className="highlight">Herd immunity</span> is only achievable
          through the vaccination of the general population.
        </p>

        <p>
          To protect immunocompromised loved ones, members of your community, and
          young children, make sure you are up to date on your vaccinations.
        </p>

        <a className="blog-link" href="#">
          Read more about the topic on our blog.
        </a>
      </div>
    </main>
  );
};

export default HeroBody;
