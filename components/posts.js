"use client";

import { formatDate } from '@/lib/format';
import LikeButton from './like-icon';
import { togglePostLikeStaus } from '@/actions/posts';
import { useOptimistic } from 'react';

function Post({ post, updatePost }) {
  
  return (
    <article className="post">
      <div className="post-image">
        <img src={post.image} alt={post.title} />
      </div>
      <div className="post-content">
        <header>
          <div>
            <h2>{post.title}</h2>
            <p>
              Shared by {post.userFirstName} on{' '}
              <time dateTime={post.createdAt}>
                {formatDate(post.createdAt)}
              </time>
            </p>
          </div>
          <div>
            <form action={updatePost.bind(null, post.id)} className={post.isLiked ? 'liked':''}>
            <LikeButton />
            </form>
          </div>
        </header>
        <p>{post.content}</p>
      </div>
    </article>
  );
}

export default function Posts({ posts }) {

  const [optimisticPosts, updateOptimisticPosts] = useOptimistic(posts,(prevPosts, updatedPostId)=>{
    const updatedPostIndex = prevPosts.findIndex(post => post.id === updatedPostId);
    if(updatedPostId === -1){
      return prevPosts;
    }
    const updatedPosts = {...prevPosts[updatedPostIndex]};
    updatedPosts.likes = updatedPosts.likes + (updatedPosts.isLiked ? -1 : 1 ); // we need to set here oppositely
    updatedPosts.isLiked = !updatedPosts.isLiked; 
    const newPosts = [...prevPosts];
    newPosts[updatedPostIndex] = updatedPosts;
    return newPosts;
  });

  if (!optimisticPosts || optimisticPosts.length === 0) {
    return <p>There are no posts yet. Maybe start sharing some?</p>;
  }
  async function updatePost(postId){
    updateOptimisticPosts(postId);
    await togglePostLikeStaus(postId);
  }
  return (
    <ul className="posts">
      {optimisticPosts.map((post) => (
        <li key={post.id}>
          <Post post={post} updatePost={updatePost}/>
        </li>
      ))}
    </ul>
  );
}
