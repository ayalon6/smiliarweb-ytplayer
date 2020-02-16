import axios from "axios";

export default axios.create({
  baseURL: "http://localhost:6969/api",
  responseType: "json"
});