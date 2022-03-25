from datetime import datetime, timedelta
from typing import Union

from django.utils import timezone
from requests import post, put, get

from .credentials import CLIENT_ID, CLIENT_SECRET
from .models import SpotifyToken

BASE_URL = "https://api.spotify.com/v1/me/"


def get_user_tokens(session_key) -> SpotifyToken | None:
    user_tokens = SpotifyToken.objects.filter(user=session_key)
    if user_tokens.exists():
        return user_tokens.first()
    else:
        return None


def update_or_create_user_tokens(
    session_key,
    access_token,
    token_type,
    expires_in: int,
    refresh_token: None | str = None,
):
    tokens = get_user_tokens(session_key)
    expires_in: datetime = timezone.now() + timedelta(seconds=expires_in)

    if tokens:
        tokens.access_token = access_token
        tokens.token_type = token_type
        tokens.expires_in = expires_in
        tokens.save(update_fields=[
            'access_token',
            'token_type',
            'expires_in',
        ])
    else:
        tokens = SpotifyToken(
            user=session_key,
            access_token=access_token,
            refresh_token=refresh_token,
            token_type=token_type,
            expires_in=expires_in
        )
        tokens.save()


def is_spotify_authenticated(session_key):
    tokens = get_user_tokens(session_key)
    if tokens:
        expiry = tokens.expires_in
        if expiry <= timezone.now():
            refresh_spotify_token(session_key)

        return True

    return False


def refresh_spotify_token(session_key):
    refresh_token = get_user_tokens(session_key).refresh_token

    response = post('https://accounts.spotify.com/api/token', data={
        'grant_type': 'refresh_token',
        'refresh_token': refresh_token,
        'client_id': CLIENT_ID,
        'client_secret': CLIENT_SECRET,
    }).json()

    access_token = response.get('access_token')
    token_type = response.get('token_type')
    expires_in = response.get('expires_in')

    update_or_create_user_tokens(
        session_key,
        access_token,
        token_type,
        expires_in,
        refresh_token=None
    )


def execute_spotify_api_request(session_key, endpoint, post_=False, put_=False):
    tokens = get_user_tokens(session_key)
    headers = {'Content-Type': 'application/json',
               'Authorization': "Bearer " + tokens.access_token}

    if post_:
        response = post(BASE_URL + endpoint, headers=headers)
        return (response.json(), response.status_code)

    if put_:
        response = put(BASE_URL + endpoint, headers=headers)
        return (response.json(), response.status_code)

    response = get(BASE_URL + endpoint, {}, headers=headers)
    try:
        return (response.json(), response.status_code)
    except:
        return {'error': 'An issue occured while trying to retrieve data from Spotify'}, 500


def play_song(session_key):
    return execute_spotify_api_request(session_key, 'player/play', put_=True)


def pause_song(session_key):
    return execute_spotify_api_request(session_key, 'player/pause', put_=True)
