import axios from "axios";

const API_URL = "http://localhost:3000/auth/register";

export const register = async (
  phoneNumber: string,
  password: string,
  fullName: string,
) => {
  try {
    const response = await axios.post(API_URL, {
      phoneNumber,
      password,
      fullName,
    });

    return response.data;
  } catch (error) {
    console.error("Registration failed:", error);
    throw error;
  }
};
