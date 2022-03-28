from api.models import Room
from django.http import HttpRequest
from django.shortcuts import redirect, render
from requests import Request, post
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from .credentials import CLIENT_ID, CLIENT_SECRET, REDIRECT_URI
from .models import Vote
from .util import (execute_spotify_api_request, is_spotify_authenticated,
                   pause_song, play_song, skip_song,
                   update_or_create_user_tokens)


class AuthURL(APIView):
    def get(self, request: HttpRequest, format=None):
        scope = 'user-read-playback-state user-modify-playback-state user-read-currently-playing'
        url = Request('GET', 'https://accounts.spotify.com/authorize', params={
            'scope': scope,
            'response_type': 'code',
            'redirect_uri': REDIRECT_URI,
            'client_id': CLIENT_ID,
        }).prepare().url

        return Response({'url': url}, status=status.HTTP_200_OK)


def spotify_callback(request: HttpRequest, format=None):
    code = request.GET.get('code')
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

    if not request.session.exists(request.session.session_key):
        request.session.create()

    update_or_create_user_tokens(
        request.session.session_key,
        access_token,
        token_type,
        expires_in,
        refresh_token=refresh_token
    )

    return redirect('frontend:index')


class IsAuthenticated(APIView):
    def get(self, request, format=None):
        is_authenticated = is_spotify_authenticated(
            self.request.session.session_key)
        return Response({'status': is_authenticated}, status=status.HTTP_200_OK)


class CurrentSong(APIView):
    def get(self, request, format=None):
        room_code = self.request.session.get('room_code')
        room: Room | None = Room.objects.filter(code=room_code).first()
        if not room:
            return Response({'error': 'Room not found'}, status=status.HTTP_404_NOT_FOUND)

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
