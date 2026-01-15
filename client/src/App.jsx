import "bootstrap/dist/css/bootstrap.min.css";
import { useState } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router";
import Home from "./Home.jsx";
import { HeaderProvider } from "./components/HeaderContext";
import Navbar from "./components/Navbar";
import SetupSurvey from "./components/SetupSurvey.jsx";
import DesignIterator from "./components/DesignIterator.jsx";
import GeneratingPage from "./components/GeneratingPage.jsx";
import ConceptSelectionPage from "./components/ConceptSelectionPage.jsx";
import InspirationPage from "./components/InspirationPage.jsx";
import "./App.css"

function App() {
  const [surveyAnswers, setSurveyAnswers] = useState(null);
  const navigate = useNavigate();

  const handleSurveyComplete = (answers) => {
    setSurveyAnswers(answers);
    navigate('/generating', { state: { from: 'survey', surveyAnswers: answers } });
  };

  const handleExitDesign = () => {
    setSurveyAnswers(null);
    navigate('/');
  };

  return (
    <HeaderProvider>
      <Navbar/>
      <Routes>
        <Route path="/" element={<Home onStartDesign={() => navigate('/survey')} />} />
        <Route path="/survey" element={<SetupSurvey onComplete={handleSurveyComplete} />} />
        <Route path="/concepts" element={<ConceptSelectionPage surveyAnswers={surveyAnswers} />} />
        <Route path="/inspiration/:category" element={<InspirationPage />} />
        <Route path="/generating" element={<GeneratingPage />} />
        <Route path="/design" element={<DesignIterator surveyAnswers={surveyAnswers} onExit={handleExitDesign}/>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HeaderProvider>
  );
}

export default App;
