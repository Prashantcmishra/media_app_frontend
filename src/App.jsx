import { useState } from "react";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import MediaSection from "./components/MediaSection";
import "./App.css";

// screen: "login" | "dashboard" | "image" | "video"
function App() {
  const [screen, setScreen] = useState(
    localStorage.getItem("token") ? "dashboard" : "login"
  );
  const [username, setUsername] = useState(
    localStorage.getItem("username") || ""
  );

  const handleLoginSuccess = (name) => {
    setUsername(name);
    setScreen("dashboard");
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    setUsername("");
    setScreen("login");
  };

  return (
    <div className="app-container">
      {screen === "login" && <Login onLoginSuccess={handleLoginSuccess} />}

      {screen === "dashboard" && (
        <Dashboard
          username={username}
          onSelectSection={(section) => setScreen(section)}
          onLogout={handleLogout}
        />
      )}

      {(screen === "image" || screen === "video") && (
        <MediaSection
          mediaType={screen}
          onBack={() => setScreen("dashboard")}
        />
      )}
    </div>
  );
}

export default App;
