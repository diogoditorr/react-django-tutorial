import React, { useState } from "react";
import { TextField, Button, Grid, Typography } from "@material-ui/core";
import { Link, useHistory } from "react-router-dom";
import { useCookies } from "react-cookie";

export default function RoomJoinPage() {
    const [cookies, setCookie, removeCookie] = useCookies(['csrftoken']);
    const history = useHistory();

    const [roomCode, setRoomCode] = useState("");
    const [error, setError] = useState("");

    function handleTextFieldChange(e) {
        setRoomCode(e.target.value);
    }

    function roomButtonPressed() {
        fetch("/api/join-room", {
            method: "POST",
            headers: { 
                "Content-Type": "application/json",
                "X-CSRFToken": cookies.csrftoken
            },
            body: JSON.stringify({
                code: roomCode,
            }),
        })
            .then((response) => {
                if (response.ok) {
                    history.push(`/room/${roomCode}`);
                } else {
                    setError("Room not found.");
                }
            })
            .catch((error) => {
                console.log(error);
            });
        // console.log(roomCode);
    }

    return (
        <Grid container spacing={1}>
            <Grid item xs={12} align="center">
                <Typography variant="h4" component="h4">
                    Join a Room
                </Typography>
            </Grid>

            <Grid item xs={12} align="center">
                <TextField
                    error={error ? true : false}
                    label="Code"
                    placeholder="Enter a Room Code"
                    value={roomCode}
                    helperText={error}
                    variant="outlined"
                    onChange={handleTextFieldChange}
                ></TextField>
            </Grid>

            <Grid item xs={12} align="center">
                <Button
                    variant="contained"
                    color="primary"
                    onClick={roomButtonPressed}
                >
                    Enter Room
                </Button>
            </Grid>
            <Grid item xs={12} align="center">
                <Button
                    variant="contained"
                    color="secondary"
                    to="/"
                    component={Link}
                >
                    Back
                </Button>
            </Grid>
        </Grid>
    );
}
