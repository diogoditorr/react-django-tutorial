import { Button, Grid, Typography } from "@material-ui/core";
import React, { useContext, useEffect, useState } from "react";
import { useCookies } from "react-cookie";
import { useHistory, useParams } from "react-router-dom";
import { RoomContext } from "../contexts/RoomContext";

type RoomParams = {
    roomCode: string;
};

export default function Room() {
    const history = useHistory();
    const { roomCode } = useParams<RoomParams>();
    const { setRoomCode, getRoom } = useContext(RoomContext);
    const [cookies, setCookie, removeCookie] = useCookies(["csrftoken"]);

    const [votesToSkip, setVotesToSkip] = useState(2);
    const [guestCanPause, setGuestCanPause] = useState(false);
    const [isHost, setIsHost] = useState(false);

    function leaveButtonPressed() {
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

    useEffect(() => {
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

        fetchData();
    }, []);

    return (
        <Grid container spacing={1} direction="column" alignItems="center">
            <Grid item xs={12}>
                <Typography variant="h4" component="h4">
                    Code: {roomCode}
                </Typography>
            </Grid>
            <Grid item xs={12}>
                <Typography variant="h6" component="h6">
                    Votes: {votesToSkip}
                </Typography>
            </Grid>
            <Grid item xs={12}>
                <Typography variant="h6" component="h6">
                    Guest Can Pause: {guestCanPause ? "yes" : "no"}
                </Typography>
            </Grid>
            <Grid item xs={12}>
                <Typography variant="h6" component="h6">
                    Host: {isHost ? "yes" : "no"}
                </Typography>
            </Grid>
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
                    onClick={leaveButtonPressed}
                >
                    Leave Room
                </Button>
            </Grid>
        </Grid>
    );
}
