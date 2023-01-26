/* eslint-disable react-hooks/exhaustive-deps */
import React, { useCallback, useEffect, useState } from "react";
import { POSTS_INTERVAL } from "../../config";
import {
  Media,
  MediaResponse,
  Post,
  PostsResponse,
  User,
  UserResponse,
} from "./types";
import { fetchMedia, fetchPosts, fetchUser } from "./fetch";
import { Render } from "./render";

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

  //fetch Media json for post
  const fetchMediaPromise = (mediaId: string) =>
    fetchMedia(mediaId)
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

  //fetch User json for post
  const fetchUserPromise = (userName: string) =>
    fetchUser(userName)
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

  //going to fetch them once on mount and loop
  const fetchPostsPromise = useCallback(
    () =>
      fetchPosts()
        .then((data: PostsResponse) => {
          const firstPost = data.response.posts[0];
          (async function () {
            await getNewMedia(firstPost.mediaId);
            await getNewUser(firstPost.user.username);
            setPosts(data.response.posts);
          })();
        })
        .catch((error) => {
          console.error(error);
          setError(error);
        })
        .finally(() => {
          setLoading(false);
        }),
    []
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
      const newMedia = await fetchMediaPromise(newMediaId);
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
      const newUser = await (() => fetchUserPromise(newUsername))();
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
  const useTimeout = useCallback(() => {
    const timeout = setTimeout(onTimeToChange, POSTS_INTERVAL);
    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    fetchPostsPromise();
  }, []);

  useEffect(useTimeout, [posts, postNumber]);

  const currentPost = posts?.[postNumber];
  const currentImage = medias.get(currentPost?.mediaId);
  const currentUser = users.get(currentPost?.user.username);
  return error ? (
    <h1>Error happen</h1>
  ) : (
    <Render
      currentPost={currentPost!}
      currentImage={currentImage}
      currentUser={currentUser}
      loading={loading}
    />
  );
}

export default PostSlider;
