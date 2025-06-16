import Header from "../Header/Header";
import SearchBar from "../SearchBar/SearchBar";
import SearchResults from "../SearchResults/SearchResults";
import styles from "./App.module.css";
import Playlist from "../PlayList/PlayList";

function App() {
  return (
    <div className={styles.container}>
      <Header />
      <SearchBar />
      <div className={styles.mainContent}>
        <SearchResults />
        <Playlist />
      </div>
    </div>
  );
}

export default App;
