import axios, { AxiosError } from "axios";
import Router from "next/router";
import { parseCookies, setCookie, destroyCookie } from "nookies";
import { AuthTokenError } from "./errors/AuthTokenError";

let isRefreshingToken = false
let failRequestQueue = [];


function signOut() {
  destroyCookie(undefined, "@dashgo.token")
  destroyCookie(undefined, "@dashgo.refreshToken")

  Router.push("/");
}

export const setupApiClient = (ctx = null) => {
  let cookies = parseCookies(ctx);

  const api = axios.create({
    baseURL: "http://localhost:3333",
    headers: { Authorization: `Bearer ${cookies["@dashgo.token"]}` }
  });

  api.interceptors.response.use(
    response => {
      return response
    },
    function (error: AxiosError) {
      cookies = parseCookies();
      const refreshToken = cookies["@dashgo.refreshToken"];
      const originalConfig = error.config;
      
      if (
        error.response.status === 401
      ) {

        if (error.response.data?.code === "token.expired" ){

          if (!isRefreshingToken) {
            isRefreshingToken = true;   

            api.post('/refresh', {
              refreshToken,
            }).then(response => {
              setCookie(ctx, "@dashgo.token", response.data.token, {
                maxAge: 60*60*24*30,
                path: '/'
              });
      
              setCookie(ctx, "@dashgo.refreshToken", response.data.refreshToken, {
                maxAge: 60*60*24*30,
                path: '/'
              });
      
              api.defaults.headers.Authorization = `Bearer ${response.data.token}`      
            
              failRequestQueue.forEach((request) => request.onSuccess(response.data.token))
            
              failRequestQueue = [];
            })
            .catch(err => {
              failRequestQueue.forEach((request) => request.onFailure(err))
              failRequestQueue = [];

              if (process.browser){
                signOut()
              }
            })
            .finally(() => {
              isRefreshingToken = false;  
            })
          }

          return new Promise((resolve, reject)=>{
            failRequestQueue.push({
              onSuccess: (token: string) => {
                originalConfig.headers.Authorization = `Bearer ${token}`
              
                resolve(api(originalConfig));
              }, 
              onFailure: (err: AxiosError) => {
                reject(err);
              }, 
            })
          }) 

        }
        else {
          if (process.browser){
            signOut()
          }
          else {
            return Promise.reject(new AuthTokenError())
          }
        }
      }

      return Promise.reject(error)
    },
  )

  return api;
}