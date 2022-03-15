import { Button, Grid, Typography } from "@material-ui/core";
import PropTypes from "prop-types";
import React, { useContext, useEffect, useState } from "react";
import { useCookies } from "react-cookie";
import { Redirect, useHistory, useParams } from "react-router-dom";
import { RoomContext } from "../contexts/RoomContext";

export default function Room(props) {
    const history = useHistory();
    const { roomCode } = useParams();
    const { setRoomCode, getRoomDetails } = useContext(RoomContext);
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
    
    useEffect(async () => {
        const result = await getRoomDetails(roomCode);
        if (result.response.status !== 200) {
            clearRoomCode();
            history.push("/");
        }

        setVotesToSkip(result.data.votes_to_skip);
        setGuestCanPause(result.data.guest_can_pause);
        setIsHost(result.data.is_host);
        setRoomCode(roomCode);
    }, []);

    return (
        <Grid container spacing={1}>
            <Grid item xs={12} align="center">
                <Typography variant="h4" component="h4">
                    Code: {roomCode}
                </Typography>
            </Grid>
            <Grid item xs={12} align="center">
                <Typography variant="h6" component="h6">
                    Votes: {votesToSkip}
                </Typography>
            </Grid>
            <Grid item xs={12} align="center">
                <Typography variant="h6" component="h6">
                    Guest Can Pause: {guestCanPause ? "yes" : "no"}
                </Typography>
            </Grid>
            <Grid item xs={12} align="center">
                <Typography variant="h6" component="h6">
                    Host: {isHost ? "yes" : "no"}
                </Typography>
            </Grid>
            {isHost ? (
                <Grid item xs={12} align="center">
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={() => history.push(`/room/${roomCode}/settings`)}
                    >
                        Settings
                    </Button>
                </Grid>
            ) : (
                ''
            )}
            <Grid item xs={12} align="center">
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
