export interface Post {
  created: string;
  description: string;
  id: string;
  likes: number;
  mediaId: string;
  title: string;
  user: {
    id: string;
    username: string;
  };
}

export interface PostsResponse {
  success: boolean;
  response: {
    posts: Post[];
  };
}

export interface User {
  id: string;
  username: string;
  first_name: string;
  last_name: string;
  profile_images: {
    small: string;
    medium: string;
    large: string;
  };
}

export interface UserResponse {
  success: boolean;
  response: {
    user: User;
  };
}

export interface Media {
  id: string;
  type: string;
  statistics: {
    views: number;
    downloads: number;
    likes: number;
    created: number;
  };
  urls: {
    raw: string;
    full: string;
    regular: string;
    small: string;
    thumb: string;
    small_s3: string;
  };
  owner: {
    id: string;
    username: string;
  };
}

export interface MediaResponse {
  success: boolean;
  response: {
    media: Media;
    __trace: {
      mediaId: string;
      requestId: string;
      requestTook: number;
    };
  };
}
