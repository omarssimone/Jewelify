import React from "react";
import ClickableTitle from "./ClickableTitle";
import { useHeader } from "./HeaderContext";
import "../styles/ClickableTitle.css";
import "../styles/Navbar.css";

const Navbar = () => {
  const { left, right } = useHeader();

  return (
    <header className="app-navbar">
      <div className="navbar-left">{left}</div>
      <div className="navbar-center">
        <ClickableTitle />
      </div>
      <div className="navbar-right">{right}</div>
    </header>
  );
};

export default Navbar;
