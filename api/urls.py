import debug_toolbar
from django.conf import settings
from django.urls import include, path

from .views import (AuthURL, CreateRoomView, CurrentSong, GetRoom,
                    IsAuthenticated, IsHostAuthenticatedInRoom, JoinRoom, LeaveRoom, PauseSong, PlaySong,
                    RoomView, SkipSong, UpdateRoom, UserInRoom,
                    spotify_callback)

urlpatterns = [
    path('room', RoomView.as_view()),
    path('create-room', CreateRoomView.as_view()),
    path('get-room', GetRoom.as_view()),
    path('join-room', JoinRoom.as_view()),
    path('user-in-room', UserInRoom.as_view()),
    path('leave-room', LeaveRoom.as_view()),
    path('update-room', UpdateRoom.as_view()),
    path('__debug__/', include(debug_toolbar.urls)),
    path('spotify/get-auth-url', AuthURL.as_view()),
    path('spotify/is-authenticated', IsAuthenticated.as_view()),
    path('spotify/is-host-authenticated-in-room', IsHostAuthenticatedInRoom.as_view()),
    path('spotify/redirect', spotify_callback),
    path('spotify/current-song', CurrentSong.as_view()),
    path('spotify/pause', PauseSong.as_view()),
    path('spotify/play', PlaySong.as_view()),
    path('spotify/skip', SkipSong.as_view()),
]
