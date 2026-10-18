import axios from "axios";
import { installAycoroWebSeal } from "./aycoroWebSeal";
import { AycoroClientType } from "./aycoroSealProtocol";

const API_URL = process.env.REACT_APP_API_URL;

export const aycoroWebApi = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

installAycoroWebSeal(
  aycoroWebApi,
  AycoroClientType.ManageWeb,
  process.env.REACT_APP_AYCORO_SEAL_SECRET,
  API_URL,
);
