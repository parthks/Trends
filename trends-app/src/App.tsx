import { HashRouter, Routes, Route } from "react-router-dom";
import { Link } from "react-router-dom";
import Search from "./Search";
import Query from "./Query";
import Home from "./Home";

function App() {
  return (
    <HashRouter>
      <nav
        style={{
          padding: "1rem",
          display: "flex",
          alignItems: "center",
          gap: "1rem",
          borderBottom: "1px solid #eaeaea",
        }}
      >
        <Link to="/" style={{ display: "flex", alignItems: "center" }}>
          <img src="trends.svg" alt="Trends Logo" style={{ height: "2rem" }} />
        </Link>
        <div style={{ display: "flex", gap: "1rem" }}>
          <Link to="/" style={{ textDecoration: "none", color: "#333" }}>
            Home
          </Link>
          <Link to="/search" style={{ textDecoration: "none", color: "#333" }}>
            Search
          </Link>
          <Link to="/query" style={{ textDecoration: "none", color: "#333" }}>
            Query
          </Link>
        </div>
      </nav>
      <main className="p-4 max-w-7xl mx-auto">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<Search />} />
          <Route path="/query" element={<Query />} />
        </Routes>
      </main>
    </HashRouter>
  );
}

export default App;
