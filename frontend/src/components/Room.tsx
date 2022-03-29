import { Button, Grid, Typography } from "@material-ui/core";
import React, { useContext, useEffect, useState } from "react";
import { useCookies } from "react-cookie";
import { useHistory, useParams } from "react-router-dom";
import { RoomContext } from "../contexts/RoomContext";
import MusicPlayer from "./MusicPlayer";

type RoomParams = {
    roomCode: string;
};

type IsAuthenticatedData = {
    status: boolean;
};

type GetAuthData = {
    url: string;
};

export type Song = {
    id: string;
    title: string;
    artist: string;
    duration: number;
    time: number;
    image_url: string;
    is_playing: boolean;
    votes: number;
    votes_required: number;
    current_playing_type?: string;
};

export default function Room() {
    const history = useHistory();
    const { roomCode } = useParams<RoomParams>();
    const { setRoomCode, getRoom } = useContext(RoomContext);
    const [cookies, setCookie, removeCookie] = useCookies(["csrftoken"]);

    const [votesToSkip, setVotesToSkip] = useState(2);
    const [guestCanPause, setGuestCanPause] = useState(false);
    const [isHost, setIsHost] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [song, setSong] = useState<Song | Record<string, never>>({});
    const [getCurrentSongError, setGetCurrentSongError] = useState(false);

    function leaveRoom() {
        fetch("/api/leave-room", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": cookies.csrftoken,
            },
        }).then((response) => {
            clearRoomCode();
            history.push("/");
        });
    }

    function clearRoomCode() {
        setRoomCode("");
    }

    async function authenticateSpotify() {
        let response = await fetch("/spotify/is-authenticated");
        const isAuthenticatedData: IsAuthenticatedData = await response.json();

        if (isAuthenticatedData.status === false) {
            response = await fetch("/spotify/get-auth-url");
            const getAuthData: GetAuthData = await response.json();
            window.location.replace(getAuthData.url);
        }
        setIsAuthenticated(isAuthenticatedData.status);
    }

    async function getCurrentSong(): Promise<Song | Record<string, never>> {
        const response = await fetch("/spotify/current-song");
        return response.ok ? await response.json() : {};
    }

    async function fetchData() {
        const result = await getRoom(roomCode);
        if (result.response.status !== 200) {
            clearRoomCode();
            history.push("/");
        }
        setVotesToSkip(result.data.votes_to_skip);
        setGuestCanPause(result.data.guest_can_pause);
        setIsHost(result.data.is_host);
        setRoomCode(roomCode);
    }

    useEffect(() => {
        fetchData();
    }, []);
    
    useEffect(() => {
        if (isHost) {
            authenticateSpotify();
        }
    }, [isHost]);

    useEffect(() => {
        if (getCurrentSongError) {
            return;
        }
        
        let count = 0;
        const interval = setInterval(async () => {
            const currentSong = await getCurrentSong();
            setSong(currentSong);
            if (Object.keys(currentSong).length < 1 && count < 3) {
                count++;
            }

            if (count >= 3) {
                clearInterval(interval);
                setGetCurrentSongError(true);
            }
        }, 3000);

        return () => clearInterval(interval);
    }, [getCurrentSongError]);

    return (
        <Grid container spacing={1} direction="column" alignItems="center">
            <Grid item xs={12}>
                <Typography variant="h4" component="h4">
                    Code: {roomCode}
                </Typography>
            </Grid>
            {Object.keys(song).length > 0 && <MusicPlayer song={song} />}
            {getCurrentSongError && (
                <>
                    <Typography variant="h5" component="h5">
                        Could not get current song. Please try again in a
                        minute.
                    </Typography>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={() => setGetCurrentSongError(false)}
                    >
                        Try again
                    </Button>
                </>
            )}
            {isHost ? (
                <Grid item xs={12}>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={() =>
                            history.push(`/room/${roomCode}/settings`)
                        }
                    >
                        Settings
                    </Button>
                </Grid>
            ) : (
                ""
            )}
            <Grid item xs={12}>
                <Button
                    variant="contained"
                    color="secondary"
                    onClick={leaveRoom}
                >
                    Leave Room
                </Button>
            </Grid>
        </Grid>
    );
}
