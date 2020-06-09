import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';

import { Post } from '../post.model';
import { PostsService } from '../posts.service';

@Component({
  selector: 'app-post-list',
  templateUrl: './post-list.component.html',
  styleUrls: ['./post-list.component.css']
})
export class PostListComponent implements OnInit, OnDestroy {
  posts: Post[] = [];
  private postsSub: Subscription;

  //postsService: PostService;
  //with keyword public it will create an instance of postsService
  constructor(public postsService: PostsService) {
    //this.postService = postsService;
  }

  //called when the component is created
  ngOnInit() {
    this.postsService.getPosts();
    this.postsSub = this.postsService.getPostUpdateListener()
      .subscribe((posts: Post[]) => { //get notified when the array is changed
        this.posts = posts;
      });
  }

  ngOnDestroy() {
    this.postsSub.unsubscribe(); //remove subscription and memory leak
  }
}
