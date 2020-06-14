import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { Router } from '@angular/router';

import { Post } from "./post.model";

@Injectable({providedIn: 'root'}) //provide it on the root level (only one instance)
export class PostsService {
  private posts: Post[] = [];
  private postsUpdated = new Subject<Post[]>();

  constructor(private http: HttpClient, private router: Router) {}

  getPosts() {
    this.http
    .get<{message: string, posts: any}>('http://localhost:3000/api/posts')
    .pipe(map((postData) => {
      return postData.posts.map(post => {
        return {
          title: post.title,
          content: post.content,
          id: post._id, //_ from _id is getting removed
          imagePath: post.imagePath
        };
      });
    }))
    .subscribe((transformedPosts) => {
      this.posts = transformedPosts;
      this.postsUpdated.next([...this.posts]); //notify the array is changed
    });
    //return [...this.posts]; //return a copy of the array
  }

  getPost(id: string) {
    return this.http.get<{
      message: string,
      post: any
    }>(
      'http://localhost:3000/api/posts/' + id
    );
  }

  getPostUpdateListener() {
    return this.postsUpdated.asObservable();
  }

  addPost(title: string, content: string, image: File) {
    const postData = new FormData(); //text + file
    postData.append("title", title);
    postData.append("content", content);
    postData.append("image", image, title);

    this.http.post<{message: string, post: Post}>('http://localhost:3000/api/posts', postData)
    .subscribe((responseData) => {
      console.log(responseData.message);
      const post: Post = {
        id: responseData.post.id,   //remove null with real id
        title: title,
        content: content,
        imagePath: responseData.post.imagePath
      };
      this.posts.push(post); //local data only for succesfull response
      this.postsUpdated.next([...this.posts]); //notify the array is changed
      this.router.navigate(["/"]);
    });
  }

  updatePost(id: string, title: string, content: string, image: File | string) {
    let postData: Post | FormData;
    if (typeof(image) === 'object') {
      postData = new FormData();
      postData.append('id', id);
      postData.append('title', title);
      postData.append('content', content);
      postData.append('image', image, title);
    } else {
      postData = {
        id: id,
        title: title,
        content: content,
        imagePath: image
      };
    }

    this.http.patch<{message: string}>('http://localhost:3000/api/posts/' + id, postData)
    .subscribe(response => {
      console.log(response.message)
      const updatePost = [...this.posts];
      const oldPostIndex = updatePost.findIndex(p => p.id === id);
      const post: Post = {
        id: id,
        title: title,
        content: content,
        imagePath: ''
      }
      updatePost[oldPostIndex] = post; //locally updating the array
      this.posts = updatePost;
      this.postsUpdated.next([...this.posts]); //notify the array is changed
      this.router.navigate(["/"]);
    });
  }

  deletePost(postId: string) {
    this.http.delete<{message: string}>('http://localhost:3000/api/posts/' + postId)
    .subscribe((responseData) => {
      console.log(responseData.message);
      const updatedPosts = this.posts.filter(post => post.id !== postId);
      this.posts = updatedPosts;
      this.postsUpdated.next([...this.posts]); //notify the array is changed
    });
  }
}
