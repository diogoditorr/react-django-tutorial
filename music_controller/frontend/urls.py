from django.urls import path
from .views import index

app_name = 'frontend'

urlpatterns = [
    path('', index, name='index'),
    path('join', index),
    path('create', index),
    path('room/<str:roomCode>', index),
    path('room/<str:roomCode>/settings', index),
    path('join/1', index)
]