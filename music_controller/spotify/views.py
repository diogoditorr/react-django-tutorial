from api.models import Room
from django.http import HttpRequest
from django.shortcuts import redirect, render
from requests import Request, post
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from .credentials import CLIENT_ID, CLIENT_SECRET, REDIRECT_URI
from .util import execute_spotify_api_request, is_spotify_authenticated, update_or_create_user_tokens


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
            return Response({'status': 'error'}, status=status.HTTP_404_NOT_FOUND)
        
        response = execute_spotify_api_request(
            room.host, 
            "player/currently-playing"
        )
        if 'error' in response or response.get('item') is None:
            return Response(response, status=status.HTTP_404_NOT_FOUND)

        song = {
            'id': response['item']['id'],
            'title': response['item']['name'],
            'artist': parse_artists(response['item']['artists']),
            'duration': response['item']['duration_ms'],
            'time': response['progress_ms'],
            'image_url': response['item']['album']['images'][0]['url'],
            'is_playing': response['is_playing'],
            'votes': 0,
        }

        return Response(song, status=status.HTTP_200_OK)


def parse_artists(artists: dict) -> str:
    artists_string = ""
    for i, artist in enumerate(artists):
        if i > 0:
            artists_string += ", "
        artists_string += artist['name']
    return artists_string