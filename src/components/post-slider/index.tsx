/* eslint-disable react-hooks/exhaustive-deps */
import React, { useCallback, useEffect, useState } from "react";
import "./styles.css";
import LikeIcon from "../../images/facebook.svg";
import {
  API_KEY,
  API_POSTS,
  API_MEDIAS,
  POSTS_LIMIT,
  POSTS_INTERVAL,
  API_USERS,
  POSTS_OFFSET,
} from "../../config";
import {
  Media,
  MediaResponse,
  Post,
  PostsResponse,
  User,
  UserResponse,
} from "./types";

function PostSlider() {
  const [posts, setPosts] = useState<Post[] | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [postNumber, setPostNumber] = useState<number>(0);
  const [medias, setMedias] = useState(new Map());
  const [users, setUsers] = useState(new Map());

  //storing json data for media and users as Map objects
  const updateMedias = useCallback(
    (key: string, value: Media) => {
      setMedias(new Map(medias.set(key, value)));
    },
    [medias]
  );
  const updateUsers = useCallback(
    (key: string, value: User) => {
      setUsers(new Map(users.set(key, value)));
    },
    [users]
  );

  //preloading image as Promise
  const loadImage = (url: string) =>
    new Promise((resolve, reject) => {
      const img = new Image();
      img.addEventListener("load", () => resolve(img));
      img.addEventListener("error", (err) => reject(err));
      img.src = url;
    })
      .then(() => {
        return true;
      })
      .catch((err) => console.error(err));

  //checking current map and request new json + image in case for media
  const getNewMedia = async (newMediaId: string) => {
    if (newMediaId && !medias.has(newMediaId)) {
      //insert media json data into Map
      const newMedia = await (() => fetchMedia(newMediaId))();
      newMedia && updateMedias(newMediaId, newMedia);

      //preload new media image
      const newImageData = medias.get(newMediaId);
      const newImageUrl = newImageData.urls.full;
      await loadImage(newImageUrl);
    }
    return;
  };

  //checking current map and request new json + image in case for user
  const getNewUser = async (newUsername: string) => {
    if (newUsername && !users.has(newUsername)) {
      //insert user json data into Map
      const newUser = await (() => fetchUser(newUsername))();
      newUser && updateUsers(newUsername, newUser);

      //preload new user image
      const newImageData = users.get(newUsername);
      const newImageUrl = newImageData.profile_images.medium;
      await loadImage(newImageUrl);
    }
    return;
  };

  //we need (for the first time only) media json + media image + user json + user image and then show
  const onTimeToChange = async () => {
    const postsAvailable = posts?.length || 0;
    const isLastPost = postNumber >= postsAvailable - 1;
    const getNewPostNumber = isLastPost ? 0 : postNumber + 1;
    const newPost = posts?.[getNewPostNumber];
    newPost && (await getNewMedia(newPost.mediaId));
    newPost && (await getNewUser(newPost.user.username));
    setPostNumber(getNewPostNumber);
  };

  //timeout here as set time is a minimal view of slide, then loading jsons/images happening, then show of next slide
  const useTimeout = () => {
    const timeout = setTimeout(onTimeToChange, POSTS_INTERVAL);
    return () => clearTimeout(timeout);
  };

  //fetch Media json for post
  const fetchMedia = (mediaId: string) => {
    const url = new URL(`${API_MEDIAS}/${mediaId}`);
    const params = url.searchParams;
    params.set("api_key", API_KEY);

    return fetch(url.href)
      .then((r) => r.json())
      .then((data: MediaResponse) => {
        const { media } = data.response;
        return media;
      })
      .catch((error) => {
        console.error(error);
        setError(error);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  //fetch User json for post
  const fetchUser = (userName: string) => {
    const url = new URL(`${API_USERS}/${userName}`);
    const params = url.searchParams;
    params.set("api_key", API_KEY);

    return fetch(url.href)
      .then((r) => r.json())
      .then((data: UserResponse) => {
        const { user } = data.response;
        return user;
      })
      .catch((error) => {
        console.error(error);
        setError(error);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  //going to fetch them once on mount and loop
  const fetchPosts = () => {
    const url = new URL(API_POSTS);
    const params = url.searchParams;
    params.set("offset", String(POSTS_OFFSET));
    params.set("limit", String(POSTS_LIMIT));
    params.set("api_key", API_KEY);
    setLoading(true);

    fetch(url.href)
      .then((r) => r.json())
      .then(async (data: PostsResponse) => {
        const firstPost = data.response.posts[0];
        await getNewMedia(firstPost.mediaId);
        await getNewUser(firstPost.user.username);
        setPosts(data.response.posts);
      })
      .catch((error) => {
        console.error(error);
        setError(error);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(fetchPosts, []);

  useEffect(useTimeout, [posts, postNumber]);

  const currentPost = posts?.[postNumber];
  const currentImage = medias.get(currentPost?.mediaId);
  const currentUser = users.get(currentPost?.user.username);
  return (
    <div className="post-slider">
      {loading && <div className="loading">Loading...</div>}
      {error && <div className="error">Error: {error}</div>}
      {currentPost && (
        <div className="post-item">
          <div className="post-image-holder">
            <div
              className="post-image-blur"
              style={{ backgroundImage: `url(${currentImage?.urls.full})` }}
            ></div>
            <img
              className="post-image"
              src={currentImage?.urls.full}
              alt={currentPost.description}
            />
          </div>
          <div className="post-info">
            <div className="user">
              {currentUser?.first_name} {currentUser?.last_name}
              <img
                className="user-image"
                src={currentUser?.profile_images.medium}
                alt={currentPost.description}
              />
            </div>
            <div>
              {currentPost.title && (
                <h1 className="title">{currentPost.title}</h1>
              )}
              {currentPost.description}
            </div>
            <div>
              <div className="likes">
                <img className="likes-image" src={LikeIcon} alt="Like icon" />
                {currentPost.likes} personnes
              </div>
              <div>{new Date(currentPost.created).toDateString()}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PostSlider;
