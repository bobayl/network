// Load the DOM and attach the event listeners to the menu items:
document.addEventListener('DOMContentLoaded', function() {
  const user_name = JSON.parse(document.getElementById('user_name').textContent);

  document.querySelector('#createPostView').style.display = 'block';
  document.querySelector('#userView').style.display = 'none';
  document.querySelector('#postsView').style.display = 'block';

  // Use Nav-Bar-Links to toggle between sites:
  document.querySelector('#userPage').addEventListener('click', () => show_user(user_name));
  document.querySelector('#network').addEventListener('click', () => load_posts('all'));
  document.querySelector('#following').addEventListener('click', () => showFollowing('currentUser'));
  document.querySelector('#followers').addEventListener('click', () => showFollowers('currentUser'));

  // Load the New Post section
  create_post();
  // Load all posts
  load_posts('all');
});


// Function that returns the list of followers of a user and the list of the users the user is following.
function followers(user) {
  console.log('followers() called on ' + user);
  let route = `/followers/${user}`;
  fetch(route)
  .then(response => response.json())
  .then(data => {
    console.log(data);

    document.querySelector('#numberOfFollowers').innerHTML = data.numberOfFollowers;
    document.querySelector('#numberOfFollowing').innerHTML = data.numberOfFollowing;
  })
}

function showFollowers(user){
  console.log("showFollowers() called on " + user);

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
  console.log("showFollowing() called on " + user);

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
    title.innerHTML = "Following";
    document.querySelector('#followingView').append(title);
    // Store the guys the user is following in the variable "followings":
    let followings = data.following;
    // Loop over the followings to list all of them:
    for (following of followings) {
      let followingContainer = document.createElement('div');
      followingContainer.id = "followingContainer"
      let name = following;
      followingContainer.innerHTML = name;
      document.querySelector('#followingView').append(followingContainer);
    }

    // Display all post of the guys the user is following:
    load_posts('following');
    document.querySelector('#postsView').style.display = 'block';

  })
}

// Shows the user profile followed by all posts of that user:
function show_user(username) {

  console.log('show_user() called on: ' + username);
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
    console.log(data);
    // Display the username in the h1 title:
    document.querySelector('#profileName').innerHTML = data.username;

    // Display the follow button:
    const currentUser = JSON.parse(document.getElementById('user_name').textContent);
    // Show or not show the follow-button:
    if (data.username != currentUser) {
      document.querySelector('#followButton').style.display = 'block';
    }
    document.querySelector('#userEmail').innerHTML = data.email;
    // Load and display number of followers and following of the user:
    followers(username);
  })

  // Load and display all posts of that user
  load_posts(username);
  followButton(username);
}

function followButton(username) {
  console.log('followButton() called on: ' + username);
  const currentUser = JSON.parse(document.getElementById('user_name').textContent);
  route = `/followers/${username}`;
  // Retrieve the follower data:
  fetch(route)
  .then(response => response.json())
  .then(data => {
    console.log(data);
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
  console.log('follow() called on ' + user);
  let route = `/follow/${user}`;
  //Fetch the route via GET request. This calls the "follow" function in views.py with a GET request.
  fetch(route);


}
function unfollow(user) {
  console.log('unfollow() called on ' + user);
  let route = `/unfollow/${user}`;
  //Fetch the route via GET request. This calls the "follow" function in views.py with a GET request.
  fetch(route);

  //document.querySelector('#followButton').innerHTML = "Follow";
}

// Loads the post for a user (user can also be "all". Then all posts are shown)
function load_posts(user) {
  const user_name = JSON.parse(document.getElementById('user_name').textContent);
  console.log('load posts() called on: ' + user);
  // Show compose view and hide other views.
  let route = `/posts/${user}`;
  fetch(route)
  .then(response => response.json())
  .then(posts => {
    // console.log(posts);
    //document.querySelector('#followingView').style.display = 'none';
    document.querySelector('#postsView').innerHTML = "";
    var title = document.createElement('h1');
    title.innerHTML = "Posts";
    document.querySelector('#postsView').append(title);

    var post;
    //console.log(posts);
    for (post of posts) {
      const postId = post.id;
      //console.log(post);
      let likes = Object.values(post.likes);
      //console.log(likes);
      //console.log(post.id);
      //console.log(post.likes);
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
      content.id = 'postContent';
      content.innerHTML = post.content;
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
      postContainer.appendChild(timestamp);
      postContainer.appendChild(postLikes);

      document.querySelector('#postsView').append(postContainer);
    }
  })
}

// Create a new post:
function create_post() {
  console.log('create post() called');
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
      console.log('in here');
    });
  }
}
