from typing import Union

from django.http import HttpRequest
from django.http.request import HttpRequest
from django.http.response import HttpResponse
from django.shortcuts import redirect, render
from requests import Request, post
from rest_framework import generics, serializers, status
from rest_framework.response import Response
from rest_framework.views import APIView

from api.models import Room

from .credentials import CLIENT_ID, CLIENT_SECRET, REDIRECT_URI
from .models import Room, Vote
from .serializers import (CreateRoomSerializer, RoomSerializer,
                          UpdateRoomSerializer)
from .util import (execute_spotify_api_request, is_spotify_authenticated,
                   pause_song, play_song, skip_song,
                   update_or_create_user_tokens)


# Create your views here.
class RoomView(generics.ListAPIView):
    queryset = Room.objects.all()
    serializer_class = RoomSerializer


class GetRoom(APIView):
    serializer_class = RoomSerializer
    lookup_url_kwarg = 'code'

    def get(self, request: HttpRequest, format=None):
        code = request.GET.get(self.lookup_url_kwarg)
        if code != None:
            room = Room.objects.filter(code=code)

            if len(room) > 0:
                data = RoomSerializer(room[0]).data
                data['is_host'] = self.request.session.session_key == room[0].host

                return Response(
                    data,
                    status=status.HTTP_200_OK
                )

            return Response(
                {'Room Not Found': 'Invalid Room Code.'},
                status=status.HTTP_404_NOT_FOUND
            )

        return Response(
            {'Bad Request': 'Code parameter not found in request'},
            status=status.HTTP_400_BAD_REQUEST
        )


class JoinRoom(APIView):
    lookup_url_kwarg = 'code'

    def post(self, request: HttpRequest, format=None):
        if not self.request.session.exists(self.request.session.session_key):
            self.request.session.create()

        code = request.data.get(self.lookup_url_kwarg)
        if code != None:
            room_result = Room.objects.filter(code=code)
            if len(room_result) > 0:
                room = room_result[0]
                self.request.session['room_code'] = code

                return Response(
                    {'message': 'Room Joined!'},
                    status=status.HTTP_200_OK
                )

            return Response(
                {'Error': 'Invalid Room Code'},
                status=status.HTTP_404_NOT_FOUND
            )

        return Response(
            {'Bad Request': 'Invalid post data, did not find a code key'},
            status=status.HTTP_400_BAD_REQUEST
        )


class CreateRoomView(APIView):
    serializer_class = CreateRoomSerializer

    def post(self, request, format=None):
        if not self.request.session.exists(self.request.session.session_key):
            self.request.session.create()

        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            guest_can_pause = serializer.data.get('guest_can_pause')
            votes_to_skip = serializer.data.get('votes_to_skip')
            host = self.request.session.session_key

            queryset = Room.objects.filter(host=host)
            if queryset.exists():
                room: Room = queryset[0]
                room.guest_can_pause = guest_can_pause
                room.votes_to_skip = votes_to_skip
                room.save(update_fields=['guest_can_pause', 'votes_to_skip'])
                self.request.session['room_code'] = room.code

                return Response(
                    RoomSerializer(room).data,
                    status=status.HTTP_200_OK
                )
            else:
                room = Room(
                    host=host,
                    guest_can_pause=guest_can_pause,
                    votes_to_skip=votes_to_skip
                )
                room.save()
                self.request.session['room_code'] = room.code

                return Response(
                    RoomSerializer(room).data,
                    status=status.HTTP_201_CREATED
                )

        return Response(
            {'Bad Request': 'Invalid data...'},
            status=status.HTTP_400_BAD_REQUEST
        )


class UserInRoom(APIView):
    def get(self, request: HttpRequest, format=None):
        if not self.request.session.exists(self.request.session.session_key):
            self.request.session.create()

        data = {
            'code': self.request.session.get('room_code')
        }

        return Response(data, status=status.HTTP_200_OK)


class LeaveRoom(APIView):
    def post(self, request: HttpRequest, format=None):
        if 'room_code' in self.request.session:
            code = self.request.session.pop('room_code')
            host_id = self.request.session.session_key

            room_results = Room.objects.filter(host=host_id)
            if len(room_results) > 0:
                room = room_results[0]
                room.delete()

        return Response(
            {'Message': 'Success'},
            status=status.HTTP_200_OK
        )


class UpdateRoom(APIView):
    serializer_class = UpdateRoomSerializer

    def patch(self, request, format=None):
        if not self.request.session.exists(self.request.session.session_key):
            self.request.session.create()

        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            guest_can_pause = serializer.data.get('guest_can_pause')
            votes_to_skip = serializer.data.get('votes_to_skip')
            code = serializer.data.get('code')

            queryset = Room.objects.filter(code=code)
            if not queryset.exists():
                return Response(
                    {'message': 'Room not found'},
                    status=status.HTTP_404_NOT_FOUND
                )

            room: Union[Room, None] = queryset[0]
            user_id = self.request.session.session_key
            if room.host != user_id:
                return Response(
                    {'message': 'You are not the host of this room.'},
                    status=status.HTTP_403_FORBIDDEN
                )

            room.guest_can_pause = guest_can_pause
            room.votes_to_skip = votes_to_skip
            room.save(update_fields=['guest_can_pause', 'votes_to_skip'])
            return Response(
                RoomSerializer(room).data,
                status=status.HTTP_200_OK
            )

        return Response(
            {'Bad Request': 'Invalid data...'},
            status=status.HTTP_400_BAD_REQUEST
        )


class IsAuthenticated(APIView):
    def get(self, request, format=None):
        is_authenticated = is_spotify_authenticated(
            self.request.session.session_key)
        return Response({'status': is_authenticated}, status=status.HTTP_200_OK)


class IsHostAuthenticatedInRoom(APIView):
    def get(self, request, format=None):
        room_code = self.request.GET.get('room_code')
        if not room_code:
            return Response(
                {'Bad Request': 'Room code not found in request'},
                status=status.HTTP_400_BAD_REQUEST
            )

        room: Room = Room.objects.filter(code=room_code).first()
        is_authenticated = is_spotify_authenticated(
            room.host)
        return Response({'status': is_authenticated}, status=status.HTTP_200_OK)

class AuthURL(APIView):
    def get(self, request: HttpRequest, format=None):
        scope = 'user-read-playback-state user-modify-playback-state user-read-currently-playing'
        prepared_request = Request('GET', 'https://accounts.spotify.com/authorize', params={
            'scope': scope,
            'response_type': 'code',
            'redirect_uri': REDIRECT_URI,
            'client_id': CLIENT_ID,
            'state': self.request.session.session_key
        }).prepare()

        return Response({'url': prepared_request.url}, status=status.HTTP_200_OK)


def spotify_callback(request: HttpRequest, format=None):
    code = request.GET.get('code')
    state = request.GET.get('state')
    error = request.GET.get('error')

    response = post('https://accounts.spotify.com/api/token', data={
        'grant_type': 'authorization_code',
        'code': code,
        'redirect_uri': REDIRECT_URI,
        'client_id': CLIENT_ID,
        'client_secret': CLIENT_SECRET,
    }).json()

    access_token = response.get('access_token')
    refresh_token = response.get('refresh_token')
    token_type = response.get('token_type')
    expires_in = response.get('expires_in')
    error = response.get('error')

    if not request.session.exists(state):
        return redirect('http://localhost:3000/')

    if error:
        print(error)
        return redirect('http://localhost:3000/')

    if not all([access_token, refresh_token, token_type, expires_in]):
        return redirect('http://localhost:3000/')

    update_or_create_user_tokens(
        state,
        access_token,
        token_type,
        expires_in,
        refresh_token=refresh_token
    )

    return redirect('http://localhost:3000')


class CurrentSong(APIView):
    def get(self, request, format=None):
        room_code = self.request.session.get('room_code')
        room: Room | None = Room.objects.filter(code=room_code).first()
        if not room:
            return Response({'error': 'Room not found in your session'}, status=status.HTTP_404_NOT_FOUND)

        data, status_code = execute_spotify_api_request(
            room.host,
            "player/currently-playing"
        )
        if 'error' in data or data.get('item') is None:
            return Response(data, status=status.HTTP_404_NOT_FOUND)

        votes = len(Vote.objects.filter(room=room, song_id=data['item']['id']))
        song = {
            'id': data['item']['id'],
            'title': data['item']['name'],
            'artist': self.parse_artists(data['item']['artists']),
            'duration': data['item']['duration_ms'],
            'time': data['progress_ms'],
            'image_url': data['item']['album']['images'][0]['url'],
            'is_playing': data['is_playing'],
            'votes': votes,
            'votes_required': room.votes_to_skip
        }

        self.update_room_song(room, song['id'])

        return Response(song, status=status.HTTP_200_OK)

    def parse_artists(self, artists: dict) -> str:
        artists_string = ""
        for i, artist in enumerate(artists):
            if i > 0:
                artists_string += ", "
            artists_string += artist['name']
        return artists_string

    def update_room_song(self, room: Room, song_id: int):
        current_song = room.current_song

        if current_song != song_id:
            room.current_song = song_id
            room.save(update_fields=['current_song'])
            votes = Vote.objects.filter(room=room).delete()


class PauseSong(APIView):
    def put(self, request, format=None):
        room_code = self.request.session.get('room_code')
        room: Room | None = Room.objects.filter(code=room_code).first()
        if not room:
            return Response({'error': 'Room not found'}, status=status.HTTP_404_NOT_FOUND)

        if self.request.session.session_key == room.host or room.guest_can_pause:
            data, status_code = pause_song(room.host)
            # return Response({}, status=status.HTTP_204_NO_CONTENT)
            return Response(data, status=status_code)

        return Response({}, status=status.HTTP_403_FORBIDDEN)


class PlaySong(APIView):
    def put(self, request, format=None):
        room_code = self.request.session.get('room_code')
        room: Room | None = Room.objects.filter(code=room_code).first()
        if not room:
            return Response({'error': 'Room not found'}, status=status.HTTP_404_NOT_FOUND)

        if self.request.session.session_key == room.host or room.guest_can_pause:
            data, status_code = play_song(room.host)
            # return Response({}, status=status.HTTP_204_NO_CONTENT)
            return Response(data, status=status_code)

        return Response({}, status=status.HTTP_403_FORBIDDEN)


class SkipSong(APIView):
    def post(self, request, format=None):
        room_code = self.request.session.get('room_code')
        room: Room | None = Room.objects.filter(code=room_code).first()
        votes = Vote.objects.filter(room=room, song_id=room.current_song)
        votes_needed = room.votes_to_skip

        if self.request.session.session_key == room.host or len(votes) + 1 >= votes_needed:
            votes.delete()
            data, status_code = skip_song(room.host)
        else:
            vote = Vote(
                user=self.request.session.session_key,
                room=room,
                song_id=room.current_song
            )
            vote.save()
            return Response({}, status=status.HTTP_200_OK)

        return Response(data, status=status_code)
