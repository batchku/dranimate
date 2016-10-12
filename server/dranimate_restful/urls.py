from django.contrib.auth.models import User
from .models import Puppet, Recording, Scene, RecordSceneAssociation

from rest_framework import routers, serializers, viewsets


# Serializers define the API representation.
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email')


# ViewSets define the view behavior.
class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer


class PuppetSerializer(serializers.ModelSerializer):
    class Meta:
        model = Puppet
        fields = ('id', 'name', 'user', 'description', 'date', 'mesh', 'rig', 'image')


# ViewSets define the view behavior.
class PuppetViewSet(viewsets.ModelViewSet):
    queryset = Puppet.objects.all()
    serializer_class = PuppetSerializer


class RecordingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Recording
        fields = ('id', 'name', 'user', 'description', 'puppet')


# ViewSets define the view behavior.
class RecordingViewSet(viewsets.ModelViewSet):
    queryset = Recording.objects.all()
    serializer_class = RecordingSerializer


class SceneSerializer(serializers.ModelSerializer):
    class Meta:
        model = Scene
        fields = ('id', 'name', 'user', 'description', 'date')


# ViewSets define the view behavior.
class SceneViewSet(viewsets.ModelViewSet):
    queryset = Scene.objects.all()
    serializer_class = SceneSerializer


class RecordSceneAssociationSerializer(serializers.ModelSerializer):
    class Meta:
        model = RecordSceneAssociation
        fields = ('id', 'user', 'record', 'scene', 'puppet_x_position',
                  'puppet_y_position', 'puppet_x_scale', 'puppet_y_scale', 'puppet_rotate')


# ViewSets define the view behavior.
class RecordSceneAssociationViewSet(viewsets.ModelViewSet):
    queryset = RecordSceneAssociation.objects.all()
    serializer_class = RecordSceneAssociationSerializer


# Routers provide an easy way of automatically determining the URL conf.
router = routers.DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'puppets', PuppetViewSet)
router.register(r'recordings', RecordingViewSet)
router.register(r'scenes', SceneViewSet)
router.register(r'record_scene_associations', RecordSceneAssociationViewSet)
