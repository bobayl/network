document.addEventListener('DOMContentLoaded', function() {
  // Get the current user:
  const currentUser = document.querySelector('#currentUser').innerHTML;

  // Use Nav-Bar-Links to toggle between sites:
  document.querySelector('#userPage').addEventListener('click', () => show_user(currentUser));
  document.querySelector('#allPosts').addEventListener('click', () => load_posts('all'));
  document.querySelector('#following').addEventListener('click', () => load_posts('following'));
  // Load the New Post section
  create_post();
  load_posts('all');
});

function show_user(username) {
  document.querySelector('#createPostView').style.display = 'none';
  document.querySelector('#userView').style.display = 'block';
  document.querySelector('#postsView').style.display = 'block';

  let route = `/userPage/${username}`;
  console.log(route);
  // This fetch returns the user data:
  fetch(route)
  .then(response => response.json())
  .then(data => {
    console.log(data);
    document.querySelector('#userView').innerHTML = "";
    var profileTitle = document.createElement('h1');
    profileTitle.innerHTML = "User: " + data.username;
    document.querySelector('#userView').append(profileTitle);
  })

  load_posts(username);
}

function load_posts(user) {
  // Show compose view and hide other views.
  let route = `/posts/${user}`;
  fetch(route)
  .then(response => response.json())
  .then(posts => {
    //console.log(posts);
    list(posts);
  })
}

function list(posts) {
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
      this.style = "color: lightblue;"
      console.log(postAuthor);
    }
    author.onmouseout = function() {
      this.style = "color: #7E96C4;"
    }
    author.onclick = function() {
      console.log(postAuthor);
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
}

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
      console.log('in here');
    });
  }
}
