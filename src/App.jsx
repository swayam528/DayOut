import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import ButtonGradient from "./assets/svg/ButtonGradient";
import Hero from "./components/Hero";
import DayOutForm from "./components/DayOutForm";

const App = () => {
  return (
    <Router>
      <div className="min-h-screen bg-color-darkBlue">
        <Routes>
          <Route
            path="/"
            element={
              <div className="flex flex-col min-h-screen">
                <Hero />
              </div>
            }
          />
          <Route
            path="/dayout"
            element={
              <div className="flex flex-col min-h-screen p-6">
                <DayOutForm />
              </div>
            }
          />
        </Routes>
      </div>
      <ButtonGradient />
    </Router>
  );
};

export default App;
