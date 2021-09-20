import {
    Button,
    FormControl,
    FormControlLabel,
    FormHelperText,
    Grid,
    Radio,
    RadioGroup,
    TextField,
    Typography
} from "@material-ui/core";
import React, { useState } from "react";
import { Link, useHistory } from "react-router-dom";

export default function CreateRoomPage() {
    const history = useHistory();
    const defaultVotes = 2;
    const [guestCanPause, setGuestCanPause] = useState(true);
    const [votesToSkip, setVotesToSkip] = useState(defaultVotes);

    function handleVotesChange(e) {
        setVotesToSkip(Number(e.target.value));
    }

    function handleGuestCanPauseChange(e) {
        setGuestCanPause(e.target.value === "true" ? true : false);
    }

    function handleRoomButtonPressed() {
        const requestOptions = {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                votes_to_skip: votesToSkip,
                guest_can_pause: guestCanPause,
            }),
        };

        fetch("/api/create-room", requestOptions)
            .then((response) => response.json())
            .then((data) => history.push("/room/" + data.code));
    }

    return (
        <>
            <Grid container spacing={1}>
                <Grid item xs={12} align="center">
                    <Typography component="h4" variant="h4">
                        Create Room
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
                            defaultValue="true"
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
                            defaultValue={defaultVotes}
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
                        onClick={handleRoomButtonPressed}
                    >
                        Create A Room
                    </Button>
                </Grid>

                <Grid item xs={12} align="center">
                    <Button
                        color="secondary"
                        variant="contained"
                        to="/"
                        component={Link}
                    >
                        Back
                    </Button>
                </Grid>
            </Grid>
        </>
    );
}
