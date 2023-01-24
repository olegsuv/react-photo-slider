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

  const updateMedias = useCallback((key: string, value: Media) => {
    setMedias(new Map(medias.set(key, value)));
  }, [medias]);
  const updateUsers = useCallback((key: string, value: User) => {
    setUsers(new Map(users.set(key, value)));
  }, [users]);
  const currentPost = posts?.[postNumber];
  const currentImage = medias.get(currentPost?.mediaId);
  const currentUser = users.get(currentPost?.user.username);

  const fetchPosts = () => {
    const url = new URL(API_POSTS);
    const params = url.searchParams;
    params.set("offset", String(POSTS_OFFSET));
    params.set("limit", String(POSTS_LIMIT));
    params.set("api_key", API_KEY);
    setLoading(true);

    fetch(url.href)
      .then((r) => r.json())
      .then((data: PostsResponse) => {
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

  const useInterval = useCallback(() => {
    const interval = setTimeout(() => {
      const postsAvailable = posts?.length || 0;
      const isLastPost = postNumber >= postsAvailable - 1;
      const getNewValue = (postNumber: number) =>
        isLastPost ? 0 : postNumber + 1;
      setPostNumber(getNewValue);
    }, POSTS_INTERVAL);
    return () => clearTimeout(interval);
  }, [posts, postNumber]);

  const getMedia = useCallback(
    (mediaId: string) => {
      const url = new URL(`${API_MEDIAS}/${mediaId}`);
      const params = url.searchParams;
      params.set("api_key", API_KEY);

      fetch(url.href)
        .then((r) => r.json())
        .then((data: MediaResponse) => {
          const { media } = data.response;
          updateMedias(mediaId, media);
        })
        .catch((error) => {
          console.error(error);
          setError(error);
        })
        .finally(() => {
          setLoading(false);
        });
    },
    [updateMedias]
  );

  const getUser = useCallback(
    (userName: string) => {
      const url = new URL(`${API_USERS}/${userName}`);
      const params = url.searchParams;
      params.set("api_key", API_KEY);

      fetch(url.href)
        .then((r) => r.json())
        .then((data: UserResponse) => {
          const { user } = data.response;
          updateUsers(userName, user);
        })
        .catch((error) => {
          console.error(error);
          setError(error);
        })
        .finally(() => {
          setLoading(false);
        });
    },
    [updateUsers]
  );

  const checkMedia = useCallback(() => {
    const mediaId = currentPost?.mediaId;
    if (mediaId && !medias.has(mediaId)) {
      getMedia(mediaId);
    }
  }, [currentPost?.mediaId, getMedia, medias]);

  const checkUser = useCallback(() => {
    const userName = currentPost?.user.username;
    if (userName && !users.has(userName)) {
      getUser(userName);
    }
  }, [currentPost?.user.username, getUser, users]);

  useEffect(fetchPosts, []);

  useEffect(useInterval, [useInterval]);

  useEffect(checkMedia, [checkMedia]);

  useEffect(checkUser, [checkUser]);

  return (
    <div className="post-slider">
      {loading && <div className="loading">Loading...</div>}
      {error && <div className="error">Error: {error}</div>}
      {currentPost && (
        <div className="post-item">
          <div
            className="post-image-holder"
            style={{ backgroundImage: `url(${currentImage?.urls.full})` }}
          >
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
