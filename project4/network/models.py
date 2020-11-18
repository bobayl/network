from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils.timezone import now
import datetime


class User(AbstractUser):
    pass

class Post(models.Model):
    content = models.CharField(max_length = 1000)
    likes = models.PositiveIntegerField()
    timestamp = models.DateTimeField(auto_now_add = True)
    author = models.ForeignKey(User, on_delete = models.CASCADE)

    def __str__(self):
        return f"Post by {self.author} on {self.timestamp}"

class Comment(models.Model):
    post = models.ForeignKey(Post, on_delete = models.CASCADE)
    comment = models.CharField(max_length = 500)
    commenter = models.ForeignKey(User, on_delete = models.CASCADE)
    timestamp = models.DateTimeField(auto_now_add = True)
    thumb_up = models.PositiveIntegerField()
    thumb_dn = models.PositiveIntegerField()

    def __str__(self):
        return f"Comment by {self.commenter} on post {self.post.id}"
