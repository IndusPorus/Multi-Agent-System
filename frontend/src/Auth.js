import { useState } from "react";


export default function Auth({ onLogin }) {

  const [isLogin, setIsLogin] =
    useState(true);

  const [username, setUsername] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [message, setMessage] =
    useState("");


  const apiBase =
    "http://127.0.0.1:8000";


  const handleSubmit = async () => {

    try {

      const endpoint = isLogin
        ? "/login"
        : "/signup";


      const res = await fetch(

        `${apiBase}${endpoint}`,

        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({

            username,
            password,
          }),
        }
      );

      const data = await res.json();


      if (data.error) {

        setMessage(data.error);

        return;
      }


      // LOGIN SUCCESS
      if (isLogin) {

        localStorage.setItem(
          "token",
          data.access_token
        );

        localStorage.setItem(
          "username",
          username
        );

        onLogin(username);
      }

      setMessage(

        isLogin
          ? "Login successful"
          : "Signup successful"
      );

    } catch (err) {

      console.error(err);

      setMessage(
        "Connection error"
      );
    }
  };


  return (

    <div className="auth-container">

      <h2>
        {
          isLogin
            ? "Login"
            : "Signup"
        }
      </h2>

      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) =>
          setUsername(
            e.target.value
          )
        }
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) =>
          setPassword(
            e.target.value
          )
        }
      />

      <button onClick={handleSubmit}>

        {
          isLogin
            ? "Login"
            : "Signup"
        }

      </button>

      <p>{message}</p>

      <button
        onClick={() =>
          setIsLogin(!isLogin)
        }
      >

        Switch to {
          isLogin
            ? "Signup"
            : "Login"
        }

      </button>

    </div>
  );
}