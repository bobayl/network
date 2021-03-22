
from django.urls import path

from . import views

urlpatterns = [
    path("", views.entry, name="entry"),
    path("index", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),
    path("create_post", views.create_post, name="create_post"),

    # API routes:
    path("posts/<str:user>", views.posts, name="posts"),
    path("userPage/<str:username>", views.userPage, name="userPage"),
    path("follow/<str:user>", views.follow, name="follow"),
    path("unfollow/<str:user>", views.unfollow, name="unfollow"),
    path("followers/<str:username>", views.followers, name="followers"),
    path("likes/<int:post>", views.likes, name="likes"),
    path("update_paginator/<str:user>", views.update_paginator, name="update_paginator"),
    path("update_post/<int:post>", views.update_post, name="update_post"),
    path("comment_post/<int:post>", views.comment_post, name="comment_post"),
    path("load_comments/<int:post>", views.load_comments, name="load_comments")
]
