import LoginPage from "./LoginPage";
import HostPage from "./HostPage";
import PlayerPage from "./PlayerPage";
import QuestionPreview from "./components/question-preview";
import { QuestionDisplay } from "./components/question-display";
import { useState } from "react";

function App() {
  const [page, setPage] = useState("login-page");

  const handleLogin = (password, role) => {
    // TODO password validation
    if (role === "host" && password === "123") {
      setPage("host-page");
    } else {
      alert("password or role incorrect!");
    }
  };

  if (page === "login-page") {
    return <LoginPage onLogin={handleLogin} />;
  } else if (page === "host-page") {
    return <HostPage />;
  }
  return <div>404</div>;
  // return <HostPage />;
  // return <PlayerPage username="ABC" />;
  // return <QuestionPreview question={mockQuestions[0]} />;
}

export default App;
