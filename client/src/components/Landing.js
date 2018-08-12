import React from "react";
import LandingImg from "../../src/images/landing.jpg";

const Landing = () => {
  return (
    <div>
      <div className="heading">
        <h4>Collect feedback from your users</h4>
      </div>
      <div className="landingImg">
        <img src={LandingImg} />
      </div>
      <footer className="footer">&copy; Meghna Srivastava</footer>
    </div>
  );
};

export default Landing;
