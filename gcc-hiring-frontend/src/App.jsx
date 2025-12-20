import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import AuthPage from "./pages/AuthPage";
import ApplyPage from "./pages/ApplyPage";
import ProfilePage from "./pages/ProfilePage";
import RecruiterPage from "./pages/RecruiterPage";
import QuizGateway from "./pages/QuizGateway";
import InterviewPage from "./pages/InterviewPage";




function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<AuthPage />} />
        <Route path="/apply" element={<ApplyPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/recruiter" element={<RecruiterPage />} />
        <Route path="/quiz" element={<QuizGateway />} />
        <Route path="/interview" element={<InterviewPage />} />




      </Routes>
    </BrowserRouter>
  );
}

export default App;
