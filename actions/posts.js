"use server";

import { uploadImage } from "@/lib/cloudinary";
import { storePost, updatePostLikeStatus } from "@/lib/posts";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createPost(prevState, formData) {
  //best pratice is to have server action in separate file as we can have many server action in same file
  //server action
  const title = formData.get("title");
  const image = formData.get("image");
  const content = formData.get("content");
  let errors = [];
  if (!title || title.trim().length === 0) {
    errors.push("Title is required");
  }
  if (!content || content.trim().length === 0) {
    errors.push("content is required");
  }
  if (!image || image.size === 0) {
    errors.push("image is required");
  }
  if (errors.length > 0) {
    //image size 0 means invalid image file
    return { errors };
  }
  let imageUrl;
  try {
    imageUrl = await uploadImage(image);
  } catch (error) {
    throw new Error("Image upload failed ");
  }

  await storePost({ imageUrl: imageUrl, title, content, userId: 1 });
  revalidatePath('/','layout'); // in prod this will be needed due to aggresive caching
  redirect("feed");
}

export async function togglePostLikeStaus(postId){
  await updatePostLikeStatus(postId,2);
  revalidatePath('/','layout');
  // revalidatePath("/feed");
}