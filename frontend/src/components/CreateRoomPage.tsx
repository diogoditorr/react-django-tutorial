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
import React, { useContext, useState } from "react";
import { useCookies } from "react-cookie";
import { Link, useHistory } from "react-router-dom";
import { RoomContext } from "../contexts/RoomContext";

export default function CreateRoomPage() {
    const history = useHistory();
    const { setRoomCode, defaultRoomProps } = useContext(RoomContext);
    const [cookies, setCookie, removeCookie] = useCookies(["csrftoken"]);

    const [guestCanPause, setGuestCanPause] = useState(
        defaultRoomProps.guestCanPause
    );
    const [votesToSkip, setVotesToSkip] = useState(
        defaultRoomProps.votesToSkip
    );

    function handleVotesChange(e: React.ChangeEvent<HTMLInputElement>) {
        setVotesToSkip(Number(e.target.value));
    }

    function handleGuestCanPauseChange(e: React.ChangeEvent<HTMLInputElement>) {
        setGuestCanPause(e.target.value === "true" ? true : false);
    }

    function handleCreateRoomButton() {
        const requestOptions = {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": cookies.csrftoken,
            },
            body: JSON.stringify({
                votes_to_skip: votesToSkip,
                guest_can_pause: guestCanPause,
            }),
        };

        fetch("/api/create-room", requestOptions)
            .then((response) => response.json())
            .then((data) => {
                if (data.code === null) history.push("/");
                else {
                    setRoomCode(data.code);
                    history.push("/room/" + data.code);
                }
            });
    }

    return (
        <Grid container spacing={1} direction="column" alignItems="center">
            <Grid item xs={12}>
                <Typography component="h4" variant="h4">
                    Create a Room
                </Typography>
            </Grid>
            <Grid item xs={12}>
                <FormControl component="fieldset">
                    <FormHelperText>
                        <span>
                            Guest Control of Playback State
                        </span>
                    </FormHelperText>
                    <RadioGroup
                        row
                        defaultValue={defaultRoomProps.guestCanPause.toString()}
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
            <Grid item xs={12}>
                <FormControl>
                    <TextField
                        required={true}
                        type="number"
                        defaultValue={votesToSkip}
                        inputProps={{
                            min: 1,
                            style: { textAlign: "center" },
                        }}
                        onChange={handleVotesChange}
                    />
                    <FormHelperText>
                        <span>Votes Required To Skip Song</span>
                    </FormHelperText>
                </FormControl>
            </Grid>
            <Grid container spacing={1} direction="column" alignItems="center">
                <Grid item xs={12}>
                    <Button
                        color="primary"
                        variant="contained"
                        onClick={handleCreateRoomButton}
                    >
                        Create A Room
                    </Button>
                </Grid>

                <Grid item xs={12}>
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
        </Grid>
    );
}
