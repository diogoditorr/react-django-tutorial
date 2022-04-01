import { Button, Grid, Typography } from "@material-ui/core";
import React, { useContext, useEffect, useState } from "react";
import { useCookies } from "react-cookie";
import { useNavigate, useParams } from "react-router-dom";
import { RoomContext } from "../contexts/RoomContext";
import api from "../services/api";
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
    const navigate = useNavigate();
    const { roomCode } = useParams<RoomParams>();
    const { setRoomCode, getRoom, getUserRoom } = useContext(RoomContext);
    const [cookies, setCookie, removeCookie] = useCookies(["csrftoken"]);

    const [isHost, setIsHost] = useState<boolean | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(
        null
    );
    const [song, setSong] = useState<Song | Record<string, never>>({});
    const [getCurrentSongError, setGetCurrentSongError] = useState(false);
    const [hostAuthenticationError, setHostAuthenticationError] =
        useState(false);

    async function fetchData() {
        if (roomCode === undefined) return;

        const result = await getRoom(roomCode);
        if (result.response.status !== 200) {
            clearRoomCode();
            navigate("/");
        }
        setIsHost(result.data.is_host);
        setRoomCode(roomCode);
    }

    async function isHostAuthenticated() {
        const response = await api.get("/api/spotify/is-authenticated");
        const isAuthenticatedData: IsAuthenticatedData = await response.data;

        return isAuthenticatedData.status ? true : false;
    }

    async function checkHostInRoomAuthentication() {
        const hostAuthenticated = await isHostAuthenticatedInRoom(roomCode);
        if (!hostAuthenticated) {
            setIsAuthenticated(false);
            setHostAuthenticationError(true);
        } else {
            setIsAuthenticated(true);
            setHostAuthenticationError(false);
        }
    }

    async function isHostAuthenticatedInRoom(roomCode: string | undefined) {
        const response = await api.get(
            `/api/spotify/is-host-authenticated-in-room?room_code=${roomCode}`
        );
        const isAuthenticatedData: IsAuthenticatedData = await response.data;

        return isAuthenticatedData.status ? true : false;
    }

    async function authenticateSpotify() {
        const response = await api.get("/api/spotify/get-auth-url");
        const getAuthData: GetAuthData = await response.data;
        window.location.replace(getAuthData.url);
    }

    async function getCurrentSong(): Promise<Song | Record<string, never>> {
        const response = await api.get("/api/spotify/current-song");
        return response.status === 200 ? response.data : {};
    }

    async function leaveRoom() {
        await api.post(
            "/api/leave-room",
            {},
            {
                headers: {
                    "X-CSRFToken": cookies.csrftoken,
                },
            }
        );

        clearRoomCode();
        navigate("/");
    }

    function clearRoomCode() {
        setRoomCode("");
    }

    useEffect(() => {
        async function handleUserJoin() {
            const userRoomCode = await getUserRoom();

            if (userRoomCode !== roomCode && userRoomCode !== null) {
                navigate("/room/" + userRoomCode);
                return;
            } else if (userRoomCode === null) {
                navigate("/");
                return;
            }

            fetchData();
        }

        handleUserJoin();
    }, []);

    useEffect(() => {
        if (isHost === null) return;

        (async () => {
            if (isHost) {
                const hostAuthenticated = await isHostAuthenticated();
                setIsAuthenticated(hostAuthenticated);
            } else {
                await checkHostInRoomAuthentication();
            }
        })();
    }, [isHost]);

    useEffect(() => {
        if (!isAuthenticated) return;

        if (hostAuthenticationError) return;

        if (getCurrentSongError) return;

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
    }, [isAuthenticated, getCurrentSongError, hostAuthenticationError]);

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
            {hostAuthenticationError && (
                <>
                    <Typography variant="h5" component="h5">
                        Host is not authenticated. Please try again in a minute.
                    </Typography>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={checkHostInRoomAuthentication}
                    >
                        Try again
                    </Button>
                </>
            )}
            {isHost ? (
                <>
                    <Grid item xs={12}>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={() =>
                                navigate(`/room/${roomCode}/settings`)
                            }
                        >
                            Settings
                        </Button>
                    </Grid>
                    {isAuthenticated === false && (
                        <Grid item xs={12}>
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={authenticateSpotify}
                            >
                                Authenticate Spotify
                            </Button>
                        </Grid>
                    )}
                </>
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
