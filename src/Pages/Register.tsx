// "use client"  // Next.js kullanıyorsan aç
import { Fragment, useEffect, useRef, useState } from "react";

import { Button } from "../ui/components/Button";
import { TextField } from "../ui/components/TextField";
import type { RegisterDTO } from "../models/dto/RegisterDTO";
import { useNavigate } from "react-router";
import { API } from "../utils/API";
import type { ApiResponse } from "../models/responsetype/ApiResponse";
import type { ApplicationUserEntity } from "../models/entity/ApplicationUserEntity";
import { showErrorToast, showSuccessToast } from "../utils/Toaster";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGgCircle } from "@fortawesome/free-brands-svg-icons";
import { useAppContext } from "../context/AppContext";

function RegisterPage() {
  const vantaRef = useRef(null);
  const [vantaEffect, setVantaEffect] = useState(null);
  const [formData, setFormData] = useState<RegisterDTO>({
    FirstName: "",
    LastName: "",
    UserName: "",
    Email: "",
    Password: "",
  });
  const navigate = useNavigate();
  const [errorMessages, setErrorMessages] = useState<string[]>([]);
  const { setIsLoading } = useAppContext();

  useEffect(() => {
    // Function to load scripts from CDN
    const loadScript = (src, onLoad) => {
      const script = document.createElement("script");
      script.src = src;
      script.async = true;
      script.onload = onLoad;
      document.head.appendChild(script);
      return script;
    };

    // Check if scripts are already loaded
    if (window.THREE && window.VANTA) {
      initVanta();
      return;
    }

    // Load Three.js first, then Vanta
    if (!window.THREE) {
      loadScript(
        "https://cdnjs.cloudflare.com/ajax/libs/three.js/r134/three.min.js",
        () => {
          if (!window.VANTA) {
            loadScript(
              "https://cdn.jsdelivr.net/npm/vanta@latest/dist/vanta.waves.min.js",
              initVanta
            );
          } else {
            initVanta();
          }
        }
      );
    } else if (!window.VANTA) {
      loadScript(
        "https://cdn.jsdelivr.net/npm/vanta@latest/dist/vanta.waves.min.js",
        initVanta
      );
    }

    function initVanta() {
      if (vantaRef.current && window.VANTA) {
        const effect = window.VANTA.WAVES({
          el: vantaRef.current,
          mouseControls: true,
          touchControls: true,
          gyroControls: false,
          minHeight: 200.0,
          minWidth: 200.0,
          scale: 1.0,
          scaleMobile: 1.0,
          color: 0x29292f,
          shininess: 50.0,
          waveHeight: 20.0,
          waveSpeed: 1.15,
          zoom: 0.65,
        });
        setVantaEffect(effect);
      }
    }

    // Cleanup function
    return () => {
      if (vantaEffect) {
        vantaEffect.destroy();
      }
    };
  }, []);

  async function handleRegister() {
    try {
      setIsLoading(true);
      setErrorMessages([]); // clear error messages
      const response: ApiResponse<ApplicationUserEntity> = (
        await API.post("/auth/register", formData)
      ).data;

      console.log(response.errors);

      if (!response.success) {
        showErrorToast(
          response.message || "unknown error occured try again later"
        );
        setErrorMessages([...response.errors]);
        return;
      }

      showSuccessToast(response.message || "registered successfully");
      navigate("/login");
    } catch (error) {
      showErrorToast("unknown error occured try again later");
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div
      ref={vantaRef}
      className="flex w-screen h-screen justify-center items-center align-middle"
    >
      <div
        className="flex w-full max-w-md mx-auto relative flex-col items-center gap-8 
                p-6 md:p-8 rounded-xl 
                max-h-screen overflow-y-auto"
      >
        <div className="absolute inset-0 bg-white opacity-40 rounded-xl z-0"></div>

        <div className="flex w-full flex-col items-center gap-2 relative z-10">
          <span className="text-xl md:text-2xl font-bold text-gray-800 text-center">
            Create your account
          </span>
          <span className="text-sm md:text-base text-gray-600 text-center">
            Fill in your details to get started
          </span>
        </div>
        <div className="flex w-full flex-col items-start gap-4 md:gap-6 relative z-10">
          <div className="flex w-full flex-col md:flex-row items-start gap-4">
            <TextField
              className="h-auto w-full md:grow md:shrink-0 md:basis-0"
              label="First name"
              helpText=""
            >
              <TextField.Input
                placeholder="Enter your first name"
                value={formData.FirstName}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                  setFormData({ ...formData, FirstName: event.target.value });
                }}
              />
            </TextField>
            <TextField
              className="h-auto w-full md:grow md:shrink-0 md:basis-0"
              label="Last name"
              helpText=""
            >
              <TextField.Input
                placeholder="Enter your last name"
                value={formData.LastName}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                  setFormData({ ...formData, LastName: event.target.value });
                }}
              />
            </TextField>
          </div>
          <TextField
            className="h-auto w-full flex-none"
            label="Username"
            helpText=""
          >
            <TextField.Input
              placeholder="Choose a username"
              value={formData.UserName}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                setFormData({ ...formData, UserName: event.target.value });
              }}
            />
          </TextField>
          <TextField
            className="h-auto w-full flex-none"
            label="Email"
            helpText=""
          >
            <TextField.Input
              placeholder="Enter your email address"
              value={formData.Email}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                setFormData({ ...formData, Email: event.target.value });
              }}
            />
          </TextField>
          <TextField
            className="h-auto w-full flex-none"
            label="Password"
            helpText=""
          >
            <TextField.Input
              type="password"
              placeholder="Create a password"
              value={formData.Password}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                setFormData({ ...formData, Password: event.target.value });
              }}
            />
          </TextField>
          <Button
            className="h-10 w-full flex-none"
            size="large"
            onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
              event.preventDefault();
              handleRegister();
            }}
          >
            Create account
          </Button>
          <a
            className="text-blue-600 hover:text-blue-800 cursor-pointer text-sm md:text-base self-center"
            onMouseUp={() => {
              navigate("/login");
            }}
          >
            Click here if you already have an account
          </a>
          <ul>
            {errorMessages.map((e, i) => {
              return (
                <div className="flex flex-row items-center align-middle">
                  <FontAwesomeIcon
                    icon={faGgCircle}
                    className="text-blue-600"
                  />
                  <li key={i} className="text-red-700 mx-5  ">
                    {e}
                  </li>
                </div>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}

export { RegisterPage };
