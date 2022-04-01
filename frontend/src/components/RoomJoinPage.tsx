import React, { useState } from "react";
import { TextField, Button, Grid, Typography } from "@material-ui/core";
import { Link, useNavigate } from "react-router-dom";
import { useCookies } from "react-cookie";
import api from "../services/api";

export default function RoomJoinPage() {
    const navigate = useNavigate();
    const [roomCode, setRoomCode] = useState("");
    const [cookies, setCookie, removeCookie] = useCookies(["csrftoken"]);

    const [error, setError] = useState("");

    function handleTextFieldChange(e: React.ChangeEvent<HTMLInputElement>) {
        setRoomCode(e.target.value);
    }

    async function roomButtonPressed() {
        try {
            const response = await api.post(
                "/api/join-room",
                {
                    code: roomCode,
                },
                {
                    headers: {
                        "X-CSRFToken": cookies.csrftoken,
                    },
                }
            );

            if (response.status === 200) {
                navigate(`/room/${roomCode}`);
            } else {
                setError("Room not found.");
            }
        } catch (error) {
            console.log(error);
        }
    }

    return (
        <Grid container spacing={1} direction="column" alignItems="center">
            <Grid item xs={12} alignItems="center">
                <Typography variant="h4" component="h4">
                    Join a Room
                </Typography>
            </Grid>

            <Grid item xs={12} alignItems="center">
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

            <Grid item xs={12} alignItems="center">
                <Button
                    variant="contained"
                    color="primary"
                    onClick={roomButtonPressed}
                >
                    Enter Room
                </Button>
            </Grid>
            <Grid item xs={12} alignItems="center">
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
