import json
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render
from django.urls import reverse
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from django.core.paginator import Paginator

from .models import User, Post, Comment, Follower

# Global variables:
numberOfPostsPerPage = 10

def entry(request):
    return render(request, "network/entry.html")

def index(request):
    return render(request, "network/index.html")

@csrf_exempt
@login_required
def create_post(request):
    # Posting must be via POST request
    if request.method != "POST":
        return JsonResponse({"error": "POST request required."}, status=400)

    data = json.loads(request.body)
    content = data.get("content")
    newPost = Post(content = content, author = request.user)
    newPost.save()
    return render(request, "network/index.html")

@csrf_exempt
@login_required
def comment_post(request, post):
    if request.method == "POST":
        data = json.loads(request.body)
        comment = data.get("content")
        post_to_comment = Post.objects.get(id = post)
        commenter = request.user
        newComment = Comment(post = post_to_comment, comment = comment, commenter = commenter)
        newComment.save()
        numberOfComments = Comment.objects.filter(post = post).count()
        return JsonResponse({"numberOfComments": numberOfComments}, status=200)
    else:
        return JsonResponse({"error": "POST request required."}, status=400)



@login_required
def load_comments(request, post):
    if request.method == "GET":
        comments = Comment.objects.filter(post = post)
        comments = comments.order_by("-timestamp").all()
        comments = [comment.serialize() for comment in comments]
        return JsonResponse(comments, safe=False)
    else:
        return JsonResponse({"error": "GET request required."}, status=400)



@csrf_exempt
@login_required
def update_post(request, post):
    if request.method != "POST":
        return JsonResponse({"error": "POST request required."}, status=400)

    data = json.loads(request.body)
    content = data.get("content")
    post_to_edit = Post.objects.get(id = post)
    post_to_edit.content = content
    post_to_edit.save()
    return JsonResponse({"new text": content}, status=200)

@login_required
def likes(request, post):
    user = request.user
    print(user)
    post = Post.objects.get(pk = post)
    print(post)
    print(f"postlikes: {post.likes.all()}")
    if user in post.likes.all():
        post.likes.remove(user)
    else:
        post.likes.add(user)
    post.save()
    post = post.serialize()
    return JsonResponse(post, safe = False)

# Updating the paginator:
@login_required
def update_paginator(request, user):
    numberOfPosts = 0
    numberOfPages = 0
    # Filter posts depending on which posts to show.
    if user == "all":
        posts = Post.objects.all()
    elif user == "following":
        currentUser = request.user
        followings = Follower.objects.get(user = currentUser)
        followings = followings.serialize()
        followings = followings["following"]
        posts = Post.objects.filter(author__username__in = followings)
    else:
        thisUser = User.objects.get(username = user)
        posts = Post.objects.filter(author = thisUser)

    numberOfPosts = posts.count()
    lastPage = numberOfPosts%numberOfPostsPerPage
    if lastPage == 0:
        numberOfPages = int(numberOfPosts/numberOfPostsPerPage)
    else:
        numberOfPages = int(numberOfPosts/numberOfPostsPerPage) + 1
    mydata = {"numberOfPages": numberOfPages}
    return JsonResponse(mydata)



# Loading posts:
@login_required
def posts(request, user):
    # For pagination: Extract the page number requested from the GET request.
    pageNumber = int(request.GET.get("page") or 1)

    # Filter posts depending on which posts to show.
    if user == "all":
        posts = Post.objects.all()
    elif user == "following":
        currentUser = request.user
        followings = Follower.objects.get(user = currentUser)
        followings = followings.serialize()
        followings = followings["following"]
        posts = Post.objects.filter(author__username__in = followings)
    else:
        try:
            thisUser = User.objects.get(username = user)
            posts = Post.objects.filter(author = thisUser)
        except:
            return JsonResponse({"Error": "No such user"}, safe=False)

    posts = posts.order_by("-timestamp").all()
    paginator = Paginator(posts, numberOfPostsPerPage)
    posts = paginator.get_page(pageNumber)
    posts = [post.serialize() for post in posts]

    return JsonResponse(posts, safe=False)

@login_required
def userPage(request, username):
    user = User.objects.get(username = username)
    user = user.serialize()
    return JsonResponse(user, safe=False)

@login_required
def followers(request, username):
    # Check if the request is for the logged in user:
    if username == 'currentUser':
        user = request.user
    else:
        user = User.objects.get(username = username)
    followers = Follower.objects.get(user = user)
    followers = followers.serialize()
    return JsonResponse(followers, safe=False)


# Function triggered to follow or unfollow a user
@csrf_exempt
@login_required
def follow(request, user): #'user' is the user to be followed, e.g. user "foo"
    follower = request.user # The logged in user is the follower.
    author = User.objects.get(username = user) # The function argument 'user' is the author
    # Set the follow status via PUT request:
    if request.method == 'GET':
        # Get the Follower object of the author:
        f = Follower.objects.get(user = author)
        f.follower.add(follower)
        f.save()
        g = Follower.objects.get(user = follower)
        g.following.add(author)
        g.save()
        return HttpResponse(status=204)
    else:
        return JsonResponse({
            "error": "GET or PUT request required."
        }, status=400)

@csrf_exempt
@login_required
def unfollow(request, user):
    follower = request.user # The logged in user is the follower.
    author = User.objects.get(username = user) # The function argument 'user' is the author
    # Set the follow status via PUT request:
    if request.method == 'GET':
        # Get the Follower object of the author:
        f = Follower.objects.get(user = author)
        f.follower.remove(follower)
        f.save()
        g = Follower.objects.get(user = follower)
        g.following.remove(author)
        g.save()
        return HttpResponse(status=204)
    else:
        return JsonResponse({
            "error": "GET or PUT request required."
        }, status=400)


def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "network/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "network/login.html")


def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("entry"))


def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "network/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
            follower = Follower.objects.create(user = user)
            follower.save()

        except IntegrityError:
            return render(request, "network/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "network/register.html")
