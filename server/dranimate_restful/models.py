from django.db import models
from django.contrib.auth.models import User
from django.conf import settings
from datetime import datetime
from django.contrib.postgres.fields import ArrayField
from django.utils.safestring import mark_safe
import os


class Puppet(models.Model):
    user = models.ForeignKey(User)

    def update_filename(instance, filename):
        time = datetime.utcnow()
        filename = instance.user.username + time.strftime("%Y_%m_%d_%H_%M_%S.%f")
        path = os.path.join(filename)
        return path

    def update_meshname(instance, filename):
        time = datetime.utcnow()
        filename = instance.user.username + time.strftime("%Y_%m_%d_%H_%M_%S.%f")
        path = os.path.join("meshes", filename + ".ply")
        return path

    name = models.CharField(max_length=200)
    description = models.CharField(max_length=500)
    date = models.DateTimeField("upload date", auto_now_add=True)
    mesh = models.FileField("mesh data (encoded in ply)", upload_to=update_meshname)
    rig = models.FileField("rig data (encoded in xml)", upload_to='meshes/')
    image = models.ImageField("image data (encoded in jpg)", upload_to='imgs/')

    def __unicode__(self):
        return "Puppet: \{ Id:{0} {1} {2} {3} \}".format(self.id, self.rig, self.mesh, self.image)

    def __str__(self):
        return "{{Puppet id:{0} rig:{1} mesh:{2} img:{3} }}".format(self.id, self.rig, self.mesh, self.image)


class Recording(models.Model):
    name = models.CharField(max_length=200)
    user = models.ForeignKey(User)
    description = models.CharField(max_length=500)
    puppet = models.ForeignKey(Puppet)


class Scene(models.Model):
    name = models.CharField(max_length=200)
    user = models.ForeignKey(User)
    description = models.CharField(max_length=500)
    date = models.DateTimeField("upload date", auto_now_add=True)


class RecordSceneAssociation(models.Model):
    user = models.ForeignKey(User)
    record = models.ForeignKey(Recording)
    scene = models.ForeignKey(Scene)
    puppet_x_position = models.DecimalField(max_digits=19, decimal_places=10)
    puppet_y_position = models.DecimalField(max_digits=19, decimal_places=10)
    puppet_x_scale = models.DecimalField(max_digits=19, decimal_places=10)
    puppet_y_scale = models.DecimalField(max_digits=19, decimal_places=10)
    puppet_rotate = models.DecimalField(max_digits=19, decimal_places=10)
