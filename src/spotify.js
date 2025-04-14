
// import axios from "axios";

const authEndpoint = "https://accounts.spotify.com/authorize?";
const clientId = "14ddf12b0d754cb59dfa8d37247dd792"; // Your client id
// const clientSecret = "64f5037ca4b546debd8644443090dbf1"; // Your secret
const redirectUri = "https://ridly-taupe.vercel.app/"; // Your redirect uri
const scopes = ["user-library-read", "playlist-read-private"];




export const loginEndpoint = `${authEndpoint}client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scopes.join(
  "%20"
)}&response_type=token&show_dialog=true`;

// const apiClient = axios.create({
//   baseURL: "https://api.spotify.com/v1/",
// });

// export const setClientToken = (token) => {
//   apiClient.interceptors.request.use(async function (config) {
//     config.headers.Authorization = "Bearer " + token;
//     return config;
//   });
// };

// export default apiClient;