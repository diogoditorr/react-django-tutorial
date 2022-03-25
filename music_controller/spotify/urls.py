from django.urls import path

from .views import AuthURL, CurrentSong, IsAuthenticated, spotify_callback

urlpatterns = [
    path('get-auth-url', AuthURL.as_view()),
    path('is-authenticated', IsAuthenticated.as_view()),
    path('redirect', spotify_callback),
    path('current-song', CurrentSong.as_view()),
]
