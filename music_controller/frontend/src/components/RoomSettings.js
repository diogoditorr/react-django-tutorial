import {
    Button,
    Collapse,
    FormControl,
    FormControlLabel,
    FormHelperText,
    Grid,
    Radio,
    RadioGroup,
    TextField,
    Typography,
} from "@material-ui/core";
import { Alert } from "@material-ui/lab";
import React, { useContext, useEffect, useState } from "react";
import { useCookies } from "react-cookie";
import { useHistory, useParams } from "react-router-dom";
import { RoomContext } from "../contexts/RoomContext";

export default function RoomSettings() {
    const history = useHistory();
    const { getRoomDetails, defaultRoomProps } = useContext(RoomContext);
    const { roomCode } = useParams();
    const [cookies, setCookie, removeCookie] = useCookies(["csrftoken"]);

    const [guestCanPause, setGuestCanPause] = useState(
        defaultRoomProps.guestCanPause
    );
    const [votesToSkip, setVotesToSkip] = useState(
        defaultRoomProps.votesToSkip
    );

    const [logMessage, setLogMessage] = useState("");
    const [error, setError] = useState(false);

    function handleVotesChange(e) {
        setVotesToSkip(Number(e.target.value));
    }

    function handleGuestCanPauseChange(e) {
        setGuestCanPause(e.target.value === "true" ? true : false);
    }

    function handleUpdateButton() {
        const requestOptions = {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": cookies.csrftoken,
            },
            body: JSON.stringify({
                votes_to_skip: votesToSkip,
                guest_can_pause: guestCanPause,
                code: roomCode,
            }),
        };

        fetch("/api/update-room", requestOptions).then((response) => {
            if (response.ok) {
                setError(false);
                setLogMessage("Room updated successfully!");
            } else {
                setError(true);
                setLogMessage("Error updating room...");
            }
        });
    }

    useEffect(async () => {
        const result = await getRoomDetails(roomCode);
        if (result.response.status !== 200) {
            history.push("/");
        }

        setGuestCanPause(result.data.guest_can_pause);
        setVotesToSkip(result.data.votes_to_skip);
    }, []);

    return (
        <Grid container spacing={1}>
            <Grid item xs={12} align="center">
                <Grid container spacing={1}>
                    <Grid item xs={12} align="center">
                        <Collapse in={logMessage != ""}>
                            {error === true ? (
                                <Alert
                                    severity="error"
                                    onClose={() => setLogMessage("")}
                                >
                                    {logMessage}
                                </Alert>
                            ) : (
                                <Alert
                                    severity="success"
                                    onClose={() => setLogMessage("")}
                                >
                                    {logMessage}
                                </Alert>
                            )}
                        </Collapse>
                    </Grid>
                    <Grid item xs={12} align="center">
                        <Typography component="h4" variant="h4">
                            Update Room
                        </Typography>
                    </Grid>
                    <Grid item xs={12} align="center">
                        <FormControl component="fieldset">
                            <FormHelperText>
                                <span align="center">
                                    Guest Control of Playback State
                                </span>
                            </FormHelperText>
                            <RadioGroup
                                row
                                value={guestCanPause.toString()}
                                onChange={handleGuestCanPauseChange}
                            >
                                <FormControlLabel
                                    value="true"
                                    control={<Radio color="primary" />}
                                    label="Play/Pause"
                                    labelPlacement="bottom"
                                />
                                <FormControlLabel
                                    value="false"
                                    control={<Radio color="secondary" />}
                                    label="No control"
                                    labelPlacement="bottom"
                                />
                            </RadioGroup>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} align="center">
                        <FormControl>
                            <TextField
                                required={true}
                                type="number"
                                value={votesToSkip}
                                inputProps={{
                                    min: 1,
                                    style: { textAlign: "center" },
                                }}
                                onChange={handleVotesChange}
                            />
                            <FormHelperText>
                                <span align="center">
                                    Votes Required To Skip Song
                                </span>
                            </FormHelperText>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} align="center">
                        <Button
                            color="primary"
                            variant="contained"
                            onClick={handleUpdateButton}
                        >
                            Update Room
                        </Button>
                    </Grid>
                </Grid>
            </Grid>
            <Grid item xs={12} align="center">
                <Button
                    variant="contained"
                    color="secondary"
                    onClick={() => history.push(`/room/${roomCode}`)}
                >
                    Go back
                </Button>
            </Grid>
        </Grid>
    );
}
