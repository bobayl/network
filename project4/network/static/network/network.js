// Load the DOM and attach the event listeners to the menu items:
document.addEventListener('DOMContentLoaded', function() {
  const user_name = JSON.parse(document.getElementById('user_name').textContent);
  console.log('user_name: ' + user_name);

  document.querySelector('#createPostView').style.display = 'block';
  document.querySelector('#userView').style.display = 'none';
  document.querySelector('#postsView').style.display = 'block';

  // Use Nav-Bar-Links to toggle between sites:
  document.querySelector('#userPage').addEventListener('click', () => show_user(user_name));
  document.querySelector('#allPosts').addEventListener('click', () => load_posts('all'));
  document.querySelector('#following').addEventListener('click', () => showFollowing('currentUser'));

  // Load the New Post section
  create_post();
  // Load all posts
  load_posts('all');
});


// Function that returns the list of followers of a user and the list of the users the user is following.
function followers(user) {
  console.log('followers called on ' + user);
  let route = `/followers/${user}`;
  fetch(route)
  .then(response => response.json())
  .then(data => {
    console.log(data);

    document.querySelector('#numberOfFollowers').innerHTML = data.numberOfFollowers;
    document.querySelector('#numberOfFollowing').innerHTML = data.numberOfFollowing;
  })
}

function showFollowing(user){
  document.querySelector('#createPostView').style.display = 'none';
  document.querySelector('#followButton').style.display = 'none';
  document.querySelector('#followingView').style.display = 'block';
  document.querySelector('#userView').style.display = 'none';
  document.querySelector('#postsView').style.display = 'block';

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
      console.log(name);
      followingContainer.innerHTML = name;
      document.querySelector('#followingView').append(followingContainer);
    }

    // Display all post of the guys the user is following:
    
  })
}

// Shows the user profile followed by all posts of that user:
function show_user(username) {

  console.log('show_user() called on: ' + username);

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
    console.log('currentUser: ' + currentUser);
    if (data.username != currentUser) {
      document.querySelector('#followButton').style.display = 'block';
    }
    document.querySelector('#userEmail').innerHTML = data.email;
    followers(username);
  })

  // Get followers and following of the selected user.
  route = `/followers/${username}`;
  fetch(route)
  .then(response => response.json())
  .then(data => {
    if (currentUser in data.follower) {
      //console.log("is following ");
      document.querySelector('#followButton').innerHTML = "Unfollow";
    } else {
      //console.log("not following");
      document.querySelector('#followButton').innerHTML = "Follow";
    }
  })
  // Load and display all posts of that user
  load_posts(username);
}


function follow(user) {
  // Check if the user is following the author
  // And set the button text accordingly
  let route = `/follow/${user}`;
  //Fetch the route via GET request. This calls the "follow" function in views.py with a GET request.
  fetch(route)
  .then(response => response.json())
  .then(data => {
    console.log(data);
    // Analyze the returned data and update the button text and the follower.
    if (data.isFollower == "False") {
      followButton.innerHTML = "Follow " + postAuthor;
      followButton.onclick = function() {
        fetch(route, {
        method: 'PUT',
        body: JSON.stringify({
            addFollower: "True"
          })
        })
        followButton.innerHTML = "Unfollow " + postAuthor;
      }
    }
    else {
      followButton.innerHTML = "Unfollow " + postAuthor;
      followButton.onclick = function() {
        fetch(route, {
        method: 'PUT',
        body: JSON.stringify({
            addFollower: "False"
          })
        })
        followButton.innerHTML = "Follow " + postAuthor;
      }
    }
  })
}

// Loads the post for a user (user can also be "all". Then all posts are shown)
function load_posts(user) {
  console.log('load posts() called on: ' + user);
  // Show compose view and hide other views.
  let route = `/posts/${user}`;
  fetch(route)
  .then(response => response.json())
  .then(posts => {
    // console.log(posts);
    document.querySelector('#followingView').style.display = 'none';
    document.querySelector('#postsView').innerHTML = "";
    var title = document.createElement('h1');
    title.innerHTML = "Posts";
    document.querySelector('#postsView').append(title);

    var post;
    for (post of posts) {
      const postAuthor = post.author;
      // Create a container for each post:
      var postContainer = document.createElement('div');
      postContainer.id = 'postContainer';

      var author = document.createElement('div');
      author.id = 'postAuthor';
      author.innerHTML = post.author;
      author.onmouseover = function() {
        this.style = "color: grey;"
      }
      author.onmouseout = function() {
        this.style = "color: black;"
      }
      author.onclick = function() {
        console.log('onClick: ' + postAuthor);
        show_user(postAuthor);
      }

      var content = document.createElement('div');
      content.id = 'postContent';
      content.innerHTML = post.content;
      var timestamp = document.createElement('div');
      timestamp.id = 'postTimestamp';
      timestamp.innerHTML = post.timestamp;
      var likes = document.createElement('div');
      likes.id = 'postLikes';
      likes.innerHTML = "&#128154; " + post.likes;

      postContainer.appendChild(author);
      postContainer.appendChild(content);
      postContainer.appendChild(timestamp);
      postContainer.appendChild(likes);

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
