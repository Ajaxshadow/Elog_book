import {
  AiFillEye,
  AiFillEyeInvisible,
  AiFillGoogleCircle,
} from "react-icons/ai";
import {
  GoogleAuthProvider,
  getAdditionalUserInfo,
  getAuth,
  signInWithPopup,
} from "firebase/auth";
import React, { ChangeEvent, useEffect, useState } from "react";
import { login, setFirstTime, setRole } from "../features/app/appSlice";

import Button from "../components/Button";
import { InfinitySpin } from "react-loader-spinner";
import InstructorBgSVG from "../assets/Instructor.svg";
import { LOGIN_EMAIL } from "../hooks/firestoreHooks";
import { useAppDispatch } from "../app/hooks";
import { useNavigate } from "react-router-dom";

export interface LoginHandlerProps {
  email: string;
  password: string;
  role?: "supervisor" | "student";
}

export default function Login() {
  const auth = getAuth();
  const navigate = useNavigate();
  const [authing, setAuthing] = useState(false);
  const [loginError, setLoginError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [loginData, setLoginData] = useState<LoginHandlerProps>({
    email: "",
    password: "",
    role:undefined
  });
  const dispatch = useAppDispatch();

  const signInWithGoogle = async () => {
    setAuthing(true);
    signInWithPopup(auth, new GoogleAuthProvider())
      .then((response) => {
        console.log(response);
        navigate("/");
      })
      .catch((error) => {
        console.log(error);
        setAuthing(false);
      });
  };
  const updateLoginData = (target: string, text: string, role:"supervisor" | "student") => {
    setLoginError(false);
    
    switch (target) {
      case "email":
        setLoginData((prev) => ({ ...prev, email: text }));
        break;
      case "password":
        setLoginData((prev) => ({ ...prev, password: text }));
        break;
      default:
        break;
    }
    setLoginData((p)=>({...p, role:role}))
  };
  const signInWithEmail = async () => {
    setAuthing(true);
    console.log(loginData.role)
    const user = await LOGIN_EMAIL(loginData).catch((error) => {
      setLoginError(true);
      setAuthing(false);
      console.log(error.code);
      if (error.code === "auth/network-request-failed") {
        setErrorMessage("Check your Internet connection");
      }
    });
    if (user) {
      localStorage.setItem("@UserRole","student")
      localStorage.setItem("@User",JSON.stringify(user))
      const newUser = getAdditionalUserInfo(user)?.isNewUser;
      newUser&&dispatch(setFirstTime(newUser));
      loginData.role&&dispatch(setRole({role:loginData.role}))
      dispatch(login(user.user));
      navigate("/");
    }
  };
  const [hidePassword, setHidePassword] = useState(true);

  // Set loading state to true initially
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Loading function to load data or
    // fake it using setTimeout;
    const loadData = async () => {
      // Wait for two second
      await new Promise((r) => setTimeout(r, 2000));

      // Toggle loading state
      setLoading((loading) => !loading);
    };

    // loadData();
  }, []);

  if (loading) {
    return (
      <div className=" w-full h-[90vh] grid place-items-center">
        <InfinitySpin color="#FF4A1C" />
      </div>
    );
  }

  return (
    <div className=" w-screen h-[90vh] flex ">
     
      <div className=" w-1/2 h-full flex flex-col gap-5 items-center justify-center">
        <div className="bg-[#283044] overflow-hidden  z-10 relative w-fit self-center flex flex-col  gap-5 rounded-md">
          <h1 className=" text-white font-bold text-3xl m-5">Student Login</h1>
          <div className="p-20 pt-0 flex flex-col gap-2 items-center">
            <input
              onChange={(event: ChangeEvent<HTMLInputElement>) =>
                updateLoginData("email", event.target.value, "student")
              }
              className="bg-black/20 rounded-md py-2 px-5 w-full text-white"
              type="email" //toyin3516@bazeuniversity.edu.ng
              placeholder="Email"
              name="studentEmail"
            ></input>
            <div className=" flex flex-row gap-2">
              <input
                onChange={(event: ChangeEvent<HTMLInputElement>) =>
                  updateLoginData("password", event.target.value, "student")
                }
                className="bg-black/20 rounded-l-md py-2 px-5 text-white max-h-fit"
                type={hidePassword ? "password" : "text"}
                placeholder="Password"
                name="studentPassword"
              ></input>
              <div
                onClick={() => {
                  setHidePassword(!hidePassword);
                }}
                className="togglePass group overflow-hidden relative cursor-pointer text-sm h-full self-center px-2  rounded-r-md  bg-black/20 grid place-items-center text-white"
              >
                <div className=" absolute w-full h-full bg-white top-full left-0 group-hover:top-0 transition-all"></div>
                {hidePassword ? (
                  <AiFillEye
                    className=" z-10 text-white group-hover:text-[#FF4A1C] transition-colors"
                    size={20}
                  />
                ) : (
                  <AiFillEyeInvisible
                    className="z-10 text-white group-hover:text-[#FF4A1C] transition-colors"
                    size={20}
                  />
                )}
              </div>
            </div>
            <div className="mt-3">
              <Button
                loading={authing}
                handleClick={signInWithEmail}
                value="Log In"
                secondary
                slimmer
              ></Button>
            </div>
            <AiFillGoogleCircle
              size={30}
              className=" cursor-pointer"
              color="white"
              onClick={signInWithGoogle}
            ></AiFillGoogleCircle>
          </div>
          <div
            className={`${
              loginError ? "bottom-0" : "-bottom-full"
            } absolute error bg-[#FF4A1C] w-full text-center text-white py-2 transition-all duration-1000`}
          >
            {errorMessage ? errorMessage : "Username or Password Incorrect"}
          </div>
        </div>
        <div className="flex flex-row items-center gap-3">
          <p>Don't have an Account? </p>
          <Button linkTO="/register" value="Register"></Button>
        </div>
      </div>
    </div>
  );
}
