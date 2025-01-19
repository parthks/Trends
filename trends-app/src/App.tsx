import { HashRouter, Routes, Route } from "react-router-dom";
import Search from "./Search";

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route
          path="/search"
          element={
            <div>
              <Search />
            </div>
          }
        />
      </Routes>
    </HashRouter>
  );
}

export default App;
