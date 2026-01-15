import React, { useState, useEffect } from "react";
import { useLocation } from "react-router";
import "../styles/SetupSurvey.css";
import { useHeader } from "./HeaderContext";
import { deriveConfigFromSurveyAnswers } from "../utils/surveyMapping";
import ringImg from "../../images/ring.png";
import braceletImg from "../../images/bracelet.png";
import necklaceImg from "../../images/necklace.png";
import earringsImg from "../../images/earrings.png";

const SetupSurvey = ({ onComplete }) => {
  const location = useLocation();
  const [step, setStep] = useState(1);
  const [answers, setAnswers] = useState({
    category: null,
    survey: {},
  });

  const categoryOptions = [
    { id: "ring", label: "Ring", img: ringImg },
    { id: "bracelet", label: "Bracelet", img: braceletImg, disabled: true },
    { id: "necklace", label: "Necklace", img: necklaceImg, disabled: true },
    { id: "earrings", label: "Earrings", img: earringsImg, disabled: true },
  ];

  const surveyQuestions = [
    {
      id: "q1",
      label: "What is their typical style?",
      options: [
        { id: "classic", label: "Classic & Elegant", img: "q1.1.png" },
        { id: "modern", label: "Modern & Minimalist", img: "q1.2.png" },
        { id: "vintage", label: "Vintage & Ornate", img: "q1.3.png" },
        { id: "bold", label: "Bold & Artistic", img: "q1.4.png" },
      ],
    },
    {
      id: "q2",
      label: "Which colors do they wear?",
      options: [
        { id: "neutral", label: "Neutral", img: "q2.1.png" },
        { id: "warm", label: "Warm Tones", img: "q2.2.png" },
        { id: "cool", label: "Cool Tones", img: "q2.3.png" },
        { id: "vibrant", label: "Bright & Vibrant", img: "q2.4.png" },
      ],
    },
    {
      id: "q3",
      label: "Which kind of shapes do they prefer?",
      options: [
        { id: "curves", label: "Curves", img: "q3.1.png" },
        { id: "leaves", label: "Leaves", img: "q3.2.png" },
        { id: "organic", label: "Organic", img: "q3.3.png" },
        { id: "asymmetrical", label: "Asymmetrical", img: "q3.4.png" },
      ],
    },
    {
      id: "q4",
      label: "What color of metal do they most frequently wear?",
      options: [
        { id: "yellow", label: "Yellow", img: "q4.4.png" },
        { id: "white", label: "White / Silver", img: "q4.2.png" },
        { id: "pink", label: "Pink / Red", img: "q4.3.png" },
        { id: "mixed", label: "Mix of colors", img: "q4.1.png" },
      ],
    },
    {
      id: "q5",
      label: "What kind of finish do you think they would prefer?",
      options: [
        { id: "matte", label: "Matte & Brushed", img: "q5.1.png" },
        { id: "textured", label: "Textured", img: "q5.2.png" },
        { id: "polished", label: "Polished & Shiny", img: "q5.3.png" },
        { id: "hammered", label: "Hammered", img: "q5.4.png" },
      ],
    },
    {
      id: "q6",
      label: "Should this piece feature a stone?",
      options: [
        { id: "accent", label: "Yes, but only as small accent stones", img: "q6.1.png" },
        { id: "lots", label: "Yes, lots of stones", img: "q6.2.png" },
        { id: "none", label: "No, I prefer a metal-only design", img: "q6.3.png" },
        { id: "centerpiece", label: "Yes, as the main centerpiece", img: "q6.4.png" },
      ],
    },
    {
      id: "q7",
      label: "Which mood feels right for them?",
      options: [
        { id: "passionate", label: "Passionate & Energetic", img: "q7.1.png" },
        { id: "royal", label: "Royal & Luxurious", img: "q7.2.png" },
        { id: "happy", label: "Happy & Bright", img: "q7.3.png" },
        { id: "calm", label: "Calm & Serene", img: "q7.4.png" },
      ],
    },
    {
      id: "q8",
      label: "What is the primary occasion for this jewel?",
      options: [
        { id: "birthday", label: "Birthday Milestone", img: "q8.1.png" },
        { id: "wedding", label: "Wedding / Romantic", img: "q8.2.png" },
        { id: "achievement", label: "Personal Achievement", img: "q8.3.png" },
        { id: "justbecause", label: "Just because", img: "q8.4.png" },
      ],
    },
    {
      id: "q9",
      label: "How often will the jewel be worn?",
      options: [
        { id: "daily", label: "Every single day", img: "q9.4.png" },
        { id: "frequently", label: "Frequently, not daily", img: "q9.2.png" },
        { id: "occasionally", label: "Every 2-3 months", img: "q9.3.png" },
        { id: "special", label: "Only on special occasions", img: "q9.1.png" },
      ],
    },
    {
      id: "q10",
      label: "How active is the wearer in their daily life?",
      options: [
        { id: "veryactive", label: "Very Active", img: "q10.1.png" },
        { id: "average", label: "Average Activity", img: "q10.3.png" },
        { id: "light", label: "Light Activity", img: "q10.2.png" },
        { id: "noactivity", label: "No Activity", img: "q10.4.png" },
      ],
    },
    {
      id: "q11",
      label: "Which word must describe the jewel?",
      options: [
        { id: "meaningful", label: "Meaningful", img: "q11.2.png" },
        { id: "timeless", label: "Timeless", img: "q11.4.png" },
        { id: "simple", label: "Simple", img: "q11.1.png" },
        { id: "impressive", label: "Impressive", img: "q11.3.png" },
      ],
    },
  ];

  // Initialize survey answers if not already present
  React.useEffect(() => {
    // If survey answers empty, initialize with null selections
    if (Object.keys(answers.survey).length === 0) {
      const map = {};
      surveyQuestions.forEach((q) => {
        map[q.id] = null;
      });
      setAnswers((prev) => ({ ...prev, survey: map }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Set initial step based on navigation state (ex: coming back from concepts)
  useEffect(() => {
    const incomingStep = location?.state?.step;
    if (incomingStep && [1, 2].includes(incomingStep)) {
      setStep(incomingStep);
    }
  }, [location?.state]);


  const handleSelectAnswer = (key, value) => {
    setAnswers((prev) => ({ ...prev, [key]: value }));
  };

  const selectSurveyOption = (questionId, optionId) => {
    setAnswers((prev) => ({
      ...prev,
      survey: { ...prev.survey, [questionId]: optionId },
    }));
  };


  const handleNext = () => {
    if (step === 1) {
      setStep(2);
      return;
    }

    // On step 2: deterministically map answers to a jewel config
    const config = deriveConfigFromSurveyAnswers({
      category: answers.category,
      survey: answers.survey,
    });

    onComplete({
      category: answers.category,
      survey: answers.survey,
      config,
    });
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="survey-step">
            <h2>STEP 1</h2>
            <p className="survey-subtitle">What are we going to design?</p>
            <div className="options-grid">
              {categoryOptions.map((option) => (
                <button
                  key={option.id}
                  className={`option-card ${answers.category === option.id ? "selected" : ""}`}
                  onClick={() => !option.disabled && handleSelectAnswer("category", option.id)}
                  disabled={option.disabled}
                  style={option.disabled ? { cursor: "not-allowed" } : {}}
                >
                  <img src={option.img} alt={option.label} className="option-image" />
                  <div className="option-label">{option.label}</div>
                  {option.disabled && (
                    <div className="coming-soon-badge">Available Soon</div>
                  )}
                </button>
              ))}
            </div>
          </div>
        );
      case 2:
        return (
          <div className="survey-step">
            <h2>Step 2</h2>
            <p className="survey-subtitle">Tell us your preferences</p>
            {surveyQuestions.map((q) => (
              <div key={q.id} className="question-card">
                <h3 className="question-title">{q.label}</h3>
                <div className="options-grid">
                  {q.options.map((option) => {
                    const selected = answers.survey[q.id] === option.id;
                    const imgSrc = `../../images/${option.img}`;
                    return (
                      <button
                        key={option.id}
                        className={`option-card ${selected ? "selected" : ""}`}
                        onClick={() => selectSurveyOption(q.id, option.id)}
                      >
                        <img 
                            src={imgSrc} 
                            alt={option.label} 
                            className="option-image"
                          />
                        <div className="option-label">{option.label}</div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        );
      default:
        return null;
    }
  };

  const isAnswerSelected = () => {
    if (step === 1) return answers.category !== null;
    if (step === 2) {
      // ensure all questions have a single selected option
      return Object.values(answers.survey || {}).every((val) => val !== null && val !== undefined);
    }
    return false;
  };

  const { setLeft, setRight } = useHeader();
  const mainRef = React.useRef(null);

  React.useEffect(() => {
    setLeft(<button className="back-btn" onClick={handleBack} disabled={step === 1}>← Go back</button>);
    setRight(null);
    return () => {
      setLeft(null);
      setRight(null);
    };
  }, [step]);

  React.useEffect(() => {
    if (mainRef.current) {
      mainRef.current.scrollTo({ top: 0, behavior: 'auto' });
    }
  }, [step]);

  return (
    <div className="survey-container">
      <main ref={mainRef} className={`survey-main ${step === 1 ? 'center-step' : ''}`}>
        {renderStep()}
      </main>

      <footer className="survey-footer">
        <button
          className="btn-send"
          onClick={handleNext}
          disabled={!isAnswerSelected()}
          aria-label={step === 2 ? "Generate Jewel" : "Next Step"}
        >
          {step === 2 ? "Generate Jewel" : "Next Step"}
        </button>
      </footer>
    </div>
  );
};

export default SetupSurvey;
