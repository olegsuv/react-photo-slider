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
  const [error, setError] = useState<Error | null>(null);
  const [postNumber, setPostNumber] = useState<number>(0);
  const [medias, setMedias] = useState(new Map());
  const [users, setUsers] = useState(new Map());

  const errorHandler = (error: Error) => {
    console.error(error);
    setError(error);
  };

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
  const loadImage = useCallback(
    (url: string) =>
      new Promise((resolve, reject) => {
        const img = new Image();
        img.addEventListener("load", () => resolve(img));
        img.addEventListener("error", (err) => reject(err));
        img.src = url;
      })
        .then(() => {
          return true;
        })
        .catch(errorHandler),
    []
  );

  //checking current map and request new json + image in case for media
  const getNewMedia = useCallback(async (newMediaId: string) => {
    if (newMediaId && !medias.has(newMediaId)) {
      //insert media json data into Map
      const newMedia = await fetchMedia(newMediaId)
        .then((data: MediaResponse) => {
          const { media } = data.response;
          return media;
        })
        .catch(errorHandler);
      newMedia && updateMedias(newMediaId, newMedia);

      //preload new media image
      const newImageData = medias.get(newMediaId);
      const newImageUrl = newImageData.urls.full;
      await loadImage(newImageUrl);
    }
    return;
  }, []);

  //checking current map and request new json + image in case for user
  const getNewUser = useCallback(async (newUsername: string) => {
    if (newUsername && !users.has(newUsername)) {
      //insert user json data into Map
      const newUser = await fetchUser(newUsername)
        .then((data: UserResponse) => {
          const { user } = data.response;
          return user;
        })
        .catch(errorHandler);
      newUser && updateUsers(newUsername, newUser);

      //preload new user image
      const newImageData = users.get(newUsername);
      const newImageUrl = newImageData.profile_images.medium;
      await loadImage(newImageUrl);
    }
    return;
  }, []);

  useEffect(() => {
    fetchPosts()
      .then((data: PostsResponse) => {
        const firstPost = data.response.posts[0];
        (async function () {
          await getNewMedia(firstPost.mediaId);
          await getNewUser(firstPost.user.username);
          setPosts(data.response.posts);
        })();
      })
      .catch(errorHandler);
  }, []);

  useEffect(() => {
    const timeout = setTimeout(async () => {
      const postsAvailable = posts?.length || 0;
      const isLastPost = postNumber >= postsAvailable - 1;
      const getNewPostNumber = isLastPost ? 0 : postNumber + 1;
      const newPost = posts?.[getNewPostNumber];
      newPost && (await getNewMedia(newPost.mediaId));
      newPost && (await getNewUser(newPost.user.username));
      setPostNumber(getNewPostNumber);
    }, POSTS_INTERVAL);
    return () => clearTimeout(timeout);
  }, [posts, postNumber]);

  if (error) {
    return <h1>Error happen</h1>;
  }

  const currentPost = posts?.[postNumber];
  const currentImage = medias.get(currentPost?.mediaId);
  const currentUser = users.get(currentPost?.user.username);

  if (currentPost) {
    return (
      <Render
        currentPost={currentPost}
        currentImage={currentImage}
        currentUser={currentUser}
      />
    );
  }

  return <>Loading...</>;
}

export default PostSlider;
