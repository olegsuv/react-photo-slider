import LikeIcon from "../../images/facebook.svg";
import React from "react";
import { Media, Post, User } from "./types";
import "./styles.css";

interface Props {
  currentPost: Post;
  currentImage: Media;
  currentUser: User;
}

export const Render = ({ currentPost, currentImage, currentUser }: Props) => {
  return (
    <div className="post-slider">
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
    </div>
  );
};
