import {
  API_MEDIAS,
  API_POSTS,
  API_USERS,
  POSTS_LIMIT,
  POSTS_OFFSET,
} from "../../config";

const API_KEY = process.env.REACT_APP_API_KEY || "";

const statusCheck = (r: any) => {
  if (r.ok) {
    return r.json();
  } else {
    throw new Error(r.status);
  }
};

//fetch Media json for post
export const fetchMedia = (mediaId: string) => {
  const url = new URL(`${API_MEDIAS}/${mediaId}`);
  const params = url.searchParams;
  params.set("api_key", API_KEY);

  return fetch(url.href).then(statusCheck);
};

//fetch User json for post
export const fetchUser = (userName: string) => {
  const url = new URL(`${API_USERS}/${userName}`);
  const params = url.searchParams;
  params.set("api_key", API_KEY);

  return fetch(url.href).then(statusCheck);
};

//going to fetch them once on mount and loop
export const fetchPosts = () => {
  const url = new URL(API_POSTS);
  const params = url.searchParams;
  params.set("offset", String(POSTS_OFFSET));
  params.set("limit", String(POSTS_LIMIT));
  params.set("api_key", API_KEY);

  return fetch(url.href).then(statusCheck);
};
