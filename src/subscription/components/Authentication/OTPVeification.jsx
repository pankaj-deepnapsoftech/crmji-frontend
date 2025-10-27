import React, { useEffect, useState } from "react";
import { MdVerifiedUser } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const OTPVeification = ({
  email,
  setIsRegistering,
  setForgetPassword,
  setOtpVerfication,
  setEmail,
}) => {
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [canResend, setCanResend] = useState(true);
  const [otp, setOtp] = useState("");
  const [isResending, setIsResending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const navigate = useNavigate();

  const getOTPHandler = async () => {
    if (isResending) return;

    setIsResending(true);
    const baseUrl = process.env.REACT_APP_BACKEND_URL;

    try {
      const response = await fetch(baseUrl + "organization/get-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
        }),
      });
      const data = await response.json();
      if (!data.success) {
        throw new Error(data.message);
      }
      toast.success(data.message);
      setCanResend(false);
      setSecondsLeft(30);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsResending(false);
    }
  };

  const handleOTPVerification = async (e) => {
    e.preventDefault();

    if (isVerifying) return;

    if (otp.trim().length < 4 || otp.trim().length > 4) {
      toast.error("OTP field should be 4 digits long");
      return;
    }

    setIsVerifying(true);

    try {
      const url = process.env.REACT_APP_BACKEND_URL + "organization/verify";
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          otp,
        }),
      });
      const data = await response.json();
      if (!data.success) {
        throw new Error(data.message);
      }
      toast.success(data.message);
      setIsRegistering(false);
      setOtpVerfication(false);
      setForgetPassword(false);
      setEmail("");
      navigate("/");
      toast.success("OTP verified successfully");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = () => {
    getOTPHandler();
  };

  useEffect(() => {
    if (!canResend) {
      const interval = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [canResend]);

  useEffect(() => {
    if (email) {
      getOTPHandler();
    }
  }, []);

  return (
    <div className="text-center flex-1 flex justify-center items-center flex-col py-10">
      <h1 className="subscription-font text-[#24243e] text-4xl mb-10">
        OTP Verification
      </h1>

      <form onSubmit={handleOTPVerification} className="space-y-3">
        <div className="relative w-[20rem] mx-auto">
          <div className="absolute top-[10px] left-3">
            <MdVerifiedUser color="#a3a3a3" size={20} />
          </div>
          <input
            className="subscription-font w-full font-light outline-none px-10 py-[10px] rounded-sm bg-[#e3e3e3]"
            type="number"
            id="otp"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            placeholder="OTP"
            required
          ></input>
        </div>

        <div className="pt-4">
          <button
            type="button"
            disabled={!canResend || isResending}
            className="subscription-font w-[12rem] lg:w-[12rem] py-1 lg:py-2 text-lg border border-[#2e2a5b] text-white bg-[#2e2a5b] rounded-full font-light hover:bg-white hover:text-[#2e2a5b] ease-in-out duration-300 disabled:border-[#b7b6b6] disabled:cursor-not-allowed disabled:bg-[#b7b6b6] disabled:opacity-50 mr-2"
            onClick={handleResend}
          >
            {isResending ? "Sending..." : `Resend OTP (${secondsLeft})`}
          </button>
          <button
            type="submit"
            disabled={isVerifying}
            className="subscription-font w-[8rem] mb-2 lg:mb-0 lg:w-[8rem] py-1 lg:py-2 text-lg border border-[#2e2a5b] text-white bg-[#2e2a5b] rounded-full font-light hover:bg-white hover:text-[#2e2a5b] ease-in-out duration-300 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isVerifying ? "Verifying..." : "Verify OTP"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default OTPVeification;
