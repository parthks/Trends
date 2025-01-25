import { HashRouter, Routes, Route, useLocation } from "react-router-dom";
import { Link } from "react-router-dom";
import Search from "./pages/Search";
import Query from "./pages/Query";
import Home from "./pages/Home";
import Create from "./pages/Create";
import TrendSnapshot from "./pages/TrendSnapshot";

function NavLinks() {
  const location = useLocation();

  const getLinkStyle = (path: string) => ({
    textDecoration: "none",
    color: "#333",
    fontWeight: location.pathname === path ? "bold" : "normal",
  });

  return (
    <div className="flex gap-4 justify-between w-full">
      <div className="flex gap-4">
        <Link to="/" style={getLinkStyle("/")}>
          Home
        </Link>
        <Link to="/search" style={getLinkStyle("/search")}>
          Search
        </Link>
        <Link to="/query" style={getLinkStyle("/query")}>
          Query
        </Link>
      </div>
      <div className="flex gap-4">
        <Link to="/create" style={getLinkStyle("/create")}>
          Create Trend Snapshot
        </Link>
      </div>
    </div>
  );
}

function App() {
  return (
    <HashRouter>
      <div className="h-screen w-full fixed overflow-hidden">
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
          <NavLinks />
        </nav>
        <main className="h-[calc(100vh-64px)] overflow-hidden">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/search" element={<Search />} />
            <Route path="/query" element={<Query />} />
            <Route path="/create" element={<Create />} />
            <Route path="/trend/:id" element={<TrendSnapshot />} />
          </Routes>
        </main>
      </div>
    </HashRouter>
  );
}

export default App;
