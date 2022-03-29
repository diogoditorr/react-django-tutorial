import debug_toolbar
from django.conf import settings
from django.urls import include, path

from .views import CreateRoomView, GetRoom, JoinRoom, LeaveRoom, RoomView, UpdateRoom, UserInRoom

urlpatterns = [
    path('room', RoomView.as_view()),
    path('create-room', CreateRoomView.as_view()),
    path('get-room', GetRoom.as_view()),
    path('join-room', JoinRoom.as_view()),
    path('user-in-room', UserInRoom.as_view()),
    path('leave-room', LeaveRoom.as_view()),
    path('update-room', UpdateRoom.as_view()),
    path('__debug__/', include(debug_toolbar.urls)),
]
