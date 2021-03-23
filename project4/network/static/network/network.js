// Define global variables:
var pageNumber = 1;

// Load the DOM and attach the event listeners to the menu items:
document.addEventListener('DOMContentLoaded', function() {
  const user_name = JSON.parse(document.getElementById('user_name').textContent);

  document.querySelector('#createPostView').style.display = 'block';
  document.querySelector('#userView').style.display = 'none';
  document.querySelector('#postsView').style.display = 'block';

  // Use Nav-Bar-Links to toggle between sites:
  document.querySelector('#userPage').addEventListener('click', () => {
    pageNumber = 1;
    show_user(user_name);
  });
  document.querySelector('#network').addEventListener('click', () => {
    pageNumber = 1;
    load_posts('all');
  });

  document.querySelector('#following').addEventListener('click', () => {
    pageNumber = 1;
    showFollowing('currentUser');
  });


  // Load the New Post section
  create_post();
  // Load all posts
  load_posts('all');
});


// Function that returns the list of followers of a user and the list of the users the user is following.
function followers(user) {
  let route = `/followers/${user}`;
  fetch(route)
  .then(response => response.json())
  .then(data => {
    document.querySelector('#numberOfFollowers').innerHTML = data.numberOfFollowers;
    document.querySelector('#numberOfFollowing').innerHTML = data.numberOfFollowing;
  })
}

function showFollowers(user){
  document.querySelector('#createPostView').style.display = 'none';
  document.querySelector('#followButton').style.display = 'none';
  document.querySelector('#followingView').style.display = 'block';
  document.querySelector('#userView').style.display = 'none';
  document.querySelector('#postsView').style.display = 'none';

  let route = `/followers/${user}`;
  fetch(route)
  .then(response => response.json())
  .then(data => {
    // Clear the Following View:
    document.querySelector('#followingView').innerHTML = "";
    // Create the Following title:
    let title = document.createElement('h1');
    title.innerHTML = "Followers";
    document.querySelector('#followingView').append(title);
    // Store the guys the user is following in the variable "followings":
    let followers = data.follower;
    // Loop over the followings to list all of them:
    for (follower of followers) {
      let followerContainer = document.createElement('div');
      followerContainer.id = "followerContainer"
      let name = follower;
      followerContainer.innerHTML = name;
      document.querySelector('#followingView').append(followerContainer);
    }
  })
}

function showFollowing(user){
  document.querySelector('#createPostView').style.display = 'none';
  document.querySelector('#followButton').style.display = 'none';
  document.querySelector('#followingView').style.display = 'block';
  document.querySelector('#userView').style.display = 'none';
  document.querySelector('#postsView').style.display = 'none';

  let route = `/followers/${user}`;
  fetch(route)
  .then(response => response.json())
  .then(data => {
    console.log(data);
    // Clear the Following View:
    document.querySelector('#followingView').innerHTML = "";
    // Create the Following title:
    let title = document.createElement('h1');
    title.innerHTML = "Following";
    document.querySelector('#followingView').append(title);
    // Store the guys the user is following in the variable "followings":
    let followings = data.following;
    // Loop over the followings to list all of them:
    for (following of followings) {
      const followingUser = following;
      let followingContainer = document.createElement('div');
      followingContainer.id = "followingContainer"
      let followingUserLink = document.createElement('a');
      followingUserLink.innerHTML = followingUser;

      followingUserLink.onclick = function() {
        show_user(followingUser);
      };
      followingUserLink.href = 'javascript:void(0)';
      followingContainer.appendChild(followingUserLink);
      //let name = following;
      //followingContainer.innerHTML = name;
      document.querySelector('#followingView').append(followingContainer);
    }

    // Display all post of the guys the user is following:
    load_posts('following');
    document.querySelector('#postsView').style.display = 'block';
  })
}

// Shows the user profile followed by all posts of that user:
function show_user(username) {

  // Display and hid the relevant blocks:
  document.querySelector('#createPostView').style.display = 'none';
  document.querySelector('#followButton').style.display = 'none';
  document.querySelector('#followingView').style.display = 'none';
  document.querySelector('#userView').style.display = 'block';
  document.querySelector('#postsView').style.display = 'block';

  let route = `/userPage/${username}`;
  // This fetch returns the user data:
  fetch(route)
  .then(response => response.json())
  .then(data => {
    // Display the username in the h1 title:
    document.querySelector('#profileName').innerHTML = data.username;

    // Display the follow button:
    const currentUser = JSON.parse(document.getElementById('user_name').textContent);
    // Show or not show the follow-button:
    if (data.username != currentUser) {
      document.querySelector('#followButton').style.display = 'block';
    }
    document.querySelector('#userEmail').innerHTML = data.email;
    document.querySelector('#userEmail').href = "mailto:" + data.email;
    // Load and display number of followers and following of the user:
    followers(username);
  })

  // Load and display all posts of that user
  load_posts(username);
  followButton(username);
}

function followButton(username) {
  const currentUser = JSON.parse(document.getElementById('user_name').textContent);
  route = `/followers/${username}`;
  // Retrieve the follower data:
  fetch(route)
  .then(response => response.json())
  .then(data => {
    // Extract the followers
    const followers = Object.values(data.follower);
    // If the current user is in the list of followers:
    if (followers.includes(currentUser)) {
      document.querySelector('#followButton').innerHTML = "Unfollow";
      document.querySelector('#followButton').onclick = function() {
        unfollow(username);
        show_user(username);
        document.querySelector('#followButton').innerHTML = "Follow";
      }
    } else {
      document.querySelector('#followButton').innerHTML = "Follow";
      document.querySelector('#followButton').onclick = function() {
        follow(username);
        show_user(username);
        document.querySelector('#followButton').innerHTML = "Unfollow";
      }
    }
  })
}

function follow(user) {
  let route = `/follow/${user}`;
  //Fetch the route via GET request. This calls the "follow" function in views.py with a GET request.
  fetch(route);


}
function unfollow(user) {
  let route = `/unfollow/${user}`;
  //Fetch the route via GET request. This calls the "follow" function in views.py with a GET request.
  fetch(route);

  //document.querySelector('#followButton').innerHTML = "Follow";
}

function update_paginator(user) {
  document.querySelector('#nextPage').onclick = function() {
    pageNumber++;
    load_posts(user);
  }
  document.querySelector('#previousPage').onclick = function() {
    pageNumber--;
    load_posts(user);
  }
  let route = `/update_paginator/${user}`;
  fetch(route)
  .then(response => response.json())
  .then(data => {
    let numberOfPages = data.numberOfPages;
    if (pageNumber <= 1) {
      pageNumber = 1;
      document.querySelector('#previousPage').disabled = true;
      if (pageNumber < numberOfPages){
        document.querySelector('#nextPage').disabled = false;
      }
    } else if (pageNumber < numberOfPages) {
      document.querySelector('#nextPage').disabled = false;
      if (pageNumber > 1) {
        document.querySelector('#previousPage').disabled = false;
      }
    } else {
      pageNumber = numberOfPages;
      document.querySelector('#nextPage').disabled = true;
      document.querySelector('#previousPage').disabled = false;
    }
  })
}

// Loads the post for a user (user can also be "all". Then all posts are shown)
function load_posts(user) {
  update_paginator(user);
  // Get the current user:
  const user_name = JSON.parse(document.getElementById('user_name').textContent);

  // Show compose view and hide other views.
  let route = `/posts/${user}?page=${pageNumber}`;
  fetch(route)
  .then(response => response.json())
  .then(posts => {
    //document.querySelector('#followingView').style.display = 'none';
    document.querySelector('#postsView').innerHTML = "";
    var title = document.createElement('h1');
    title.innerHTML = "Posts";
    document.querySelector('#postsView').append(title);

    var post;
    for (post of posts) {
      const postId = post.id;
      let likes = Object.values(post.likes);
      const postAuthor = post.author;
      // Create a container for each post:
      let postContainer = document.createElement('div');
      postContainer.id = 'postContainer';
      // Create the author line (1st part of the post):
      let author = document.createElement('div');
      author.id = 'postAuthor';
      author.innerHTML = post.author;
      author.onmouseover = function() {
        this.style = "color: grey; cursor: pointer;"
      }
      author.onmouseout = function() {
        this.style = "color: black;"
      }
      author.onclick = function() {
        show_user(postAuthor);
      }

      // Create the text content of the post:
      let content = document.createElement('div');
      content.id = 'postContent' + postId;
      content.innerHTML = post.content;

      // Create the editing field:
      let editForm = document.createElement('form');
      editForm.id = "editForm" + postId;
      editForm.className = "form-group";
      let editField = document.createElement('textarea');
      editField.className = "form-control";
      editField.id = "editField" + postId;
      editField.rows = "5";
      editForm.appendChild(editField);
      editForm.style.display = "none";

      // Create the timestamp of the post:
      let timestamp = document.createElement('div');
      timestamp.id = 'postTimestamp';
      timestamp.innerHTML = post.timestamp;
      // Create the likes section of the post:
      let postLikes = document.createElement('div');
      postLikes.id = 'postLikes';
      // Check if the post is already liked by the user:
      if (likes.includes(user_name)) {
        postLikes.innerHTML = "&#128154; " + likes.length;
        postLikes.style = "opacity: 0.5;"
        postLikes.onmouseover = function() {
          this.style = "cursor: pointer; opacity: 0.5;"
        }
      } else {
        postLikes.innerHTML = "&#128154; " + likes.length;
        postLikes.onmouseover = function() {
          this.innerHTML = "&#128153; " + likes.length;
          this.style = "cursor: pointer;"
        }
        postLikes.onmouseout = function() {
          this.innerHTML = "&#128154; " + likes.length;
        }
        postLikes.onclick = function() {
          if (!likes.includes(user_name)){
            // Add the user to the likes list of the post
            route = `/likes/${postId}`;
            fetch(route)
            .then(response => response.json())
            .then(data => {
              likes = Object.values(data.likes);
              postLikes.innerHTML = "&#128154; " + likes.length;
              postLikes.style = "opacity: 0.5;"
              postLikes.onmouseover = function() {
                this.style = "cursor: pointer; opacity: 0.5;"
              }
              postLikes.onmouseout = function() {
                postLikes.style = "opacity: 0.5;"
              }
            })
          }
        }
      }

      postContainer.appendChild(author);
      postContainer.appendChild(content);
      postContainer.appendChild(editForm);

      // Create the edit link for an own post:
      if (post.author == user_name) {
        let editLink = document.createElement('a');
        editLink.className = "editLink";
        editLink.id = "editLink" + postId;
        editLink.innerHTML = "Edit";
        editLink.href = 'javascript:void(0)';
        editLink.onclick = function() {
          editPost(postId);
        }
        let cancelLink = document.createElement('a');
        cancelLink.className = "cancelLink";
        cancelLink.id = "cancelLink" + postId;
        cancelLink.innerHTML = "Cancel";
        cancelLink.href = 'javascript:void(0)';
        cancelLink.style.display = "none";
        cancelLink.onclick = function() {
          cancelEdit(postId);
        }
        postContainer.appendChild(editLink);
        postContainer.appendChild(cancelLink);
      }

      postContainer.appendChild(timestamp);
      postContainer.appendChild(postLikes);

      // Create the comment button for the own posts:
      // Check if the post is not from a logged in user:
      if (post.author != user_name) {
        let commentField = document.createElement('textarea');

        commentField.className = "form-control";
        commentField.id = "commentField" + postId;
        commentField.rows = "2";
        postContainer.appendChild(commentField);
        commentField.style.display = "none";

        let commentButton = document.createElement('button');
        commentButton.id = "commentButton" + postId;
        commentButton.type = "button";
        commentButton.innerHTML = "Comment";
        commentButton.className = "btn btn-outline-dark";
        commentButton.style = "height: 20px; padding: 0px; font-size: small; padding-left: 5px; padding-right: 5px";
        commentButton.onclick = function() {
          commentPost(postId);
        }
        postContainer.appendChild(commentButton);

        let commentCancel = document.createElement('button');
        commentCancel.id = "commentCancel" + postId;
        commentCancel.type = "button";
        commentCancel.innerHTML = "Cancel";
        commentCancel.className = "btn btn-outline-dark";
        commentCancel.style = "height: 20px; padding: 0px; font-size: small; padding-left: 5px; padding-right: 5px; margin-top: 3px; margin-bottom: 3px;";
        postContainer.appendChild(commentCancel);
        commentCancel.style.display = "none";
        commentCancel.onclick = function() {
          cancelComment(postId);
        }
      }

      // Create the comments link for each post
      let commentContainer = document.createElement('div');
      commentContainer.id = "commentContainer" + postId;
      let commentLinkContainer = document.createElement('div');
      commentLinkContainer.className = "commentLinkContainer";
      if (post.comments > 0) {
        let numberOfComments = document.createElement('span');
        numberOfComments.id = "numberOfComments" + postId;
        numberOfComments.className = "showCommentLink";
        numberOfComments.innerHTML = post.comments;
        numberOfComments.style.display = "none";

        let showCommentLink = document.createElement('a');
        showCommentLink.id = "showCommentLink" + postId;
        showCommentLink.className = "showCommentLink";
        showCommentLink.innerHTML = "Show " + numberOfComments.innerHTML + " Comments";
        showCommentLink.href = 'javascript:void(0)';
        showCommentLink.onclick = function() {
          showComments(postId);
        }
        commentLinkContainer.appendChild(showCommentLink);
        commentLinkContainer.appendChild(numberOfComments);
        postContainer.appendChild(commentLinkContainer);
      } else {
        let showCommentLink = document.createElement('a');
        showCommentLink.id = "showCommentLink" + postId;
        showCommentLink.className = "showCommentLink";
        showCommentLink.innerHTML = "No comments to show";
        showCommentLink.href = 'javascript:void(0)';
        showCommentLink.disabled = true;
        commentLinkContainer.appendChild(showCommentLink);
        postContainer.appendChild(commentLinkContainer);
      }

      postContainer.appendChild(commentContainer);


      // Append the Post to the list of posts:
      document.querySelector('#postsView').append(postContainer);
    }
  })
}

// Function to display the comments of a post:
function showComments(postId) {
  let linkRoute = `/load_comments/${postId}`;
  fetch(linkRoute)
  .then(response => response.json())
  .then(comments => {
    console.log(comments);
    for (comment of comments){
      let commentText = document.createElement('div');
      commentText.innerHTML = comment.commentText;
      let commentAuthor = document.createElement('div');
      commentAuthor.className = "commentAuthor";
      commentAuthor.innerHTML = "Comment by: " + comment.commenter;
      let commentBox = document.createElement('div');
      commentBox.className = "commentBox";
      commentBox.appendChild(commentText);
      commentBox.appendChild(commentAuthor);
      document.querySelector("#commentContainer" + postId).appendChild(commentBox);
      document.querySelector("#commentContainer" + postId).style.display = "block";
      document.querySelector("#showCommentLink" + postId).innerHTML = "Hide Comments";
      document.querySelector("#showCommentLink" + postId).onclick = function(){
        hideComments(postId);
      }
    }
  })
}

// Function to hide the comments of a post if displayed:
function hideComments(postId) {
  let commentCount =  document.querySelector("#numberOfComments" + postId).innerHTML;
  document.querySelector("#commentContainer" + postId).style.display = "none";
  document.querySelector("#commentContainer" + postId).innerHTML = "";
  document.querySelector("#showCommentLink" + postId).innerHTML = "Show " + commentCount + " Comments";
  document.querySelector("#showCommentLink" + postId).onclick = function(){
    showComments(postId);
  }
}

// Comment on a post:
function commentPost(postId){
  // Display the comment field and set it empty:
  let newComment = document.querySelector('#commentField' + postId);
  newComment.value = "";
  newComment.style.display = "block";
  newComment.autofocus = true;

  // Change the text of the comment button and disable it:
  let commentButton = document.querySelector('#commentButton' + postId);
  commentButton.innerHTML = "Save Comment";
  commentButton.disabled = true;
  commentButton.onclick = function() {
    sendComment(postId);
  }
  // Display the cancel button:
  let commentCancelButton = document.querySelector('#commentCancel' + postId)
  commentCancelButton.style.display = "block";

  // If text is entered in the comment field, enable the save comment button:
  newComment.onkeyup = function(){
    if (newComment.value.length > 0){
      commentButton.disabled = false;
    } else {
      commentButton.disabled = true;
    }
  }
}

// Function to cancel commenting:
function cancelComment(postId) {
  let commentButton = document.querySelector('#commentButton' + postId);
  commentButton.innerHTML = "Comment";
  commentButton.disabled = false;
  commentButton.onclick = function() {
    commentPost(postId);
  }
  document.querySelector('#commentCancel' + postId).style.display = "none";
  document.querySelector('#commentField' + postId).style.display = "none";
}

function sendComment(postId) {
  let content = document.querySelector('#commentField' + postId).value;
  //document.querySelector('#postContent' + postId).innerHTML = content;
  let route = `/comment_post/${postId}`
  fetch(route, {
    method: 'POST',
    body: JSON.stringify({
      content: content
    })
  })
  .then(response => response.json())
  .then(data => {
    // Print result
    let commentCount = data.numberOfComments;
    document.querySelector('#commentField' + postId).style.display = "none";
    document.querySelector('#commentField' + postId).value = "";      document.querySelector('#commentCancel' + postId).style.display = "none";
    document.querySelector('#commentButton' + postId).innerHTML = "Comment";
    document.querySelector('#commentButton' + postId).onclick = function() {
      commentPost(postId);
    };
    document.querySelector("#showCommentLink" + postId).innerHTML = "Show " + commentCount + " Comments";
    document.querySelector("#numberOfComments" + postId).innerHTML = commentCount;
  });
}

// Edit a post:
function editPost(postId) {
  document.querySelector('#editForm' + postId).style.display = "block";
  let postText = document.querySelector('#postContent' + postId).innerHTML;
  document.querySelector('#editField' + postId).innerHTML = postText;
  document.querySelector('#postContent' + postId).style.display = "none";
  document.querySelector('#editLink' + postId).innerHTML = "Save";
  document.querySelector('#cancelLink' + postId).style.display = "block";

  // Submit the edit:
  document.querySelector('#editLink' + postId).onclick = function() {
    let content = document.querySelector('#editField' + postId).value;
    document.querySelector('#postContent' + postId).innerHTML = content;
    let route = `/update_post/${postId}`
    fetch(route, {
      method: 'POST',
      body: JSON.stringify({
        content: content
      })
    })
    .then(response => response.json())
    .then(data => {
      // Print result
      document.querySelector('#editForm' + postId).style.display = "none";
      document.querySelector('#postContent' + postId).style.display = "block";
      document.querySelector('#cancelLink' + postId).style.display = "none";
      document.querySelector('#editLink' + postId).innerHTML = "Edit";
      document.querySelector('#editLink' + postId).onclick = function() {
        editPost(postId);
      };
    });
  }
}
function cancelEdit(postId) {
  document.querySelector('#editForm' + postId).style.display = "none";
  document.querySelector('#postContent' + postId).style.display = "block";
  document.querySelector('#editLink' + postId).innerHTML = "Edit";
  document.querySelector('#editLink' + postId).onclick = function() {
    editPost(postId);
  };
  document.querySelector('#cancelLink' + postId).style.display = "none";
}

// Create a new post:
function create_post() {
  // Clear compose text area.
  document.querySelector('#postText').value = '';

  // Submit post:
  document.querySelector('#postForm').onsubmit = function() {
    let content = document.querySelector('#postText').value;
    //console.log(content);
    // Send post request to '/create_post'
    fetch('/create_post', {
      method: 'POST',
      body: JSON.stringify({
        content: content
      })
    })
    .then(response => response.json())
    .then(data => {
      // Print result
      console.log(`Success: sent ${data}`);
    });
  }
}
