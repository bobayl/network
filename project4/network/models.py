from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils.timezone import now
import datetime


class User(AbstractUser):
    pass

class Post(models.Model):
    content = models.CharField(max_length = 1000)
    likes = models.PositiveIntegerField(default = 0)
    timestamp = models.DateTimeField(auto_now_add = True)
    author = models.ForeignKey(User, on_delete = models.CASCADE)

    def __str__(self):
        return f"Post by {self.author} on {self.timestamp}"

    def serialize(self):
        return {
            "id": self.id,
            "content": self.content,
            "likes": self.likes,
            "timestamp": self.timestamp.strftime("%b %-d %Y, %-I:%M %p"),
            "author": self.author.username}

class Comment(models.Model):
    post = models.ForeignKey(Post, on_delete = models.CASCADE)
    comment = models.CharField(max_length = 500)
    commenter = models.ForeignKey(User, on_delete = models.CASCADE)
    timestamp = models.DateTimeField(auto_now_add = True)
    thumb_up = models.PositiveIntegerField(default = 0)
    thumb_dn = models.PositiveIntegerField(default = 0)

    def __str__(self):
        return f"Comment by {self.commenter} on post {self.post.id}"

class Follower(models.Model):
    user = models.ForeignKey(User, on_delete = models.CASCADE, related_name = "followedUser")
    follower = models.ManyToManyField(User, related_name = "followers")
