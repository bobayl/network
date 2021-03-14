import json
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render
from django.urls import reverse
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse

from .models import User, Post, Comment, Follower

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

@login_required
def likes(request, post):
    print(f"likes() called on post {post}")
    user = request.user
    post = Post.objects.get(pk = post)
    post.likes.add(user)
    post.save()
    post = post.serialize()
    return JsonResponse(post, safe = False)


# The home page: Shows all posts. No need to be logged in.
@login_required
def posts(request, user):
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
