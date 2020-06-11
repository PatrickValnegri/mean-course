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
          id: post._id //_ from _id is getting removed
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
    return this.http.get<{message: string, post: any}>('http://localhost:3000/api/posts/' + id);
  }

  getPostUpdateListener() {
    return this.postsUpdated.asObservable();
  }

  addPost(title: string, content: string) {
    const post: Post = {
      id: null,
      title: title,
      content: content
    };

    this.http.post<{message: string, postId: string}>('http://localhost:3000/api/posts', post)
    .subscribe((responseData) => {
      console.log(responseData.message);
      post.id = responseData.postId; //remove null with real id
      this.posts.push(post); //local data only for succesfull response
      this.postsUpdated.next([...this.posts]); //notify the array is changed
      this.router.navigate(["/"]);
    });
  }

  updatePost(id: string, title: string, content: string) {
    const post: Post = {
      id: id,
      title: title,
      content: content
    }

    this.http.patch<{message: string}>('http://localhost:3000/api/posts/' + id, post)
    .subscribe(response => {
      console.log(response.message)
      const updatePost = [...this.posts];
      const oldPostIndex = updatePost.findIndex(p => p.id === post.id);
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
