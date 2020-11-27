document.addEventListener('DOMContentLoaded', function() {

  // Use Nav-Bar-Links to toggle between sites:
  document.querySelector('#userPage').addEventListener('click', () => load_posts('userPosts'));
  document.querySelector('#allPosts').addEventListener('click', () => load_posts('all'));
  document.querySelector('#following').addEventListener('click', () => load_all_posts('following'));
  // Load the New Post section
  create_post();
  load_all_posts();
});

function load_posts(postSet) {
  // Show compose view and hide other views.
  // This doesn't work yet...
  document.querySelector('#allPostsView').style.display = 'block';
  document.querySelector('#followingView').style.display = 'none';
  document.querySelector('#profileView').style.display = 'none';

  let route = '/all_posts';
  fetch(route)
  .then(response => response.json())
  .then(posts => {
    //console.log(posts);
    list(posts);
  })
}

function list(posts) {
  var post;
  for (post of posts) {
    // Create a container for each post:
    var postContainer = document.createElement('div');
    postContainer.id = 'postContainer';

    var author = document.createElement('div');
    author.id = 'postAuthor';
    author.innerHTML = post.author;
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

    document.querySelector('#allPostsView').append(postContainer);
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
