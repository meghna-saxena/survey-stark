import React, { Component } from "react";
import myImg from '../images/google.png';

class Header extends Component {
   
  render() {
    return (
      <nav>
        <div className="nav-wrapper">
          <a className="left brand-logo">SurveyStark</a>
          <ul className="right">
            <li>
              <a>Login with Google</a>
            </li>
          </ul>
        </div>
      </nav>
    );
  }
}

export default Header;
