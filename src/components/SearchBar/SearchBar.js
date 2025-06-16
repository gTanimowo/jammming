import React, { useState } from "react";
import styles from "./SearchBar.module.css";
import Button from "../Button/Button";

const SearchBar = () => {
  const [song, setSong] = useState("");

  const handleChange = (e) => {
    setSong(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Searching for:", song);
    setSong("");
  };

  return (
    <form
      className={styles.searchBar}
      onSubmit={handleSubmit}
      role="search"
      aria-label="Search songs"
    >
      <input
        type="text"
        id="searchInput"
        name="search"
        value={song}
        onChange={handleChange}
        placeholder="Search song"
        aria-label="Search input"
        className={styles.searchInput}
      />
      <Button text="Search" />
    </form>
  );
};

export default SearchBar;
