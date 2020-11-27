
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
    path("all_posts", views.all_posts, name="all_posts"),
    path("posts/<str:postSet>", views.posts, name="posts")
]
