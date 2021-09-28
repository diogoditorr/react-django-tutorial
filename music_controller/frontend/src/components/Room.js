import { Button, Grid, Typography } from "@material-ui/core";
import PropTypes from "prop-types";
import React, { useEffect, useState } from "react";
import { useCookies } from "react-cookie";
import { useHistory, useParams } from "react-router-dom";
import CreateRoomPage from "./CreateRoomPage";

Room.propTypes = {
    leaveRoomCallback: PropTypes.func.isRequired,
};

export default function Room({ leaveRoomCallback }) {
    const history = useHistory();
    const [cookies, setCookie, removeCookie] = useCookies(["csrftoken"]);
    const { roomCode } = useParams();

    const [votesToSkip, setVotesToSkip] = useState(2);
    const [guestCanPause, setGuestCanPause] = useState(false);
    const [isHost, setIsHost] = useState(false);
    const [showSettings, setShowSettings] = useState(false);

    function leaveButtonPressed() {
        fetch("/api/leave-room", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": cookies.csrftoken,
            },
        }).then((response) => {
            leaveRoomCallback();
            history.push("/");
        });
    }

    function updateShowSettings(value) {
        setShowSettings(value);
    }

    function renderSettingsButton() {
        return (
            <Grid item xs={12} align="center">
                <Button
                    variant="contained"
                    color="primary"
                    onClick={() => updateShowSettings(true)}
                >
                    Settings
                </Button>
            </Grid>
        );
    }

    function renderSettings() {
        return (
            <Grid container spacing={1}>
                <Grid item xs={12} align="center">
                    <CreateRoomPage
                        update={true}
                        votesToSkip={votesToSkip}
                        guestCanPause={guestCanPause}
                        roomCode={roomCode}
                        updateCallback={() => {}}
                    />
                </Grid>
                <Grid item xs={12} align="center">
                    <Button
                        variant="contained"
                        color="secondary"
                        onClick={() => updateShowSettings(false)}
                    >
                        Close
                    </Button>
                </Grid>
            </Grid>
        );
    }

    function getRoomDetails() {
        fetch("/api/get-room" + "?code=" + roomCode)
            .then((response) => {
                if (!response.ok) {
                    leaveRoomCallback();
                    history.push("/");
                }

                return response.json();
            })
            .then((data) => {
                setVotesToSkip(data.votes_to_skip);
                setGuestCanPause(data.guest_can_pause);
                setIsHost(data.is_host);
            });
    }

    useEffect(() => {
        getRoomDetails();
    }, []);

    if (showSettings) {
        return renderSettings();
    }

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
            {isHost ? renderSettingsButton() : null}
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
