import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import ButtonGradient from "./assets/svg/ButtonGradient";
import Footer from "./components/Footer";
import Hero from "./components/Hero";
import Services from "./components/Services";
import DayOutForm from "./components/DayOutForm";

const App = () => {
  return (
    <Router>
      <div className="pt-[4.75rem] lg:pt-[5.25rem] overflow-hidden bg-color-darkBlue">
        <Routes>
          <Route path="/" element={<Hero />} />
          <Route path="/dayout" element={<DayOutForm />} />
        </Routes>
        <Footer />
      </div>
      <ButtonGradient />
    </Router>
  );
};

export default App;
