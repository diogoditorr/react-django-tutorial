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
import PropTypes from "prop-types";
import React, { useState } from "react";
import { useCookies } from "react-cookie";
import { Link, useHistory } from "react-router-dom";

CreateRoomPage.propTypes = {
    votesToSkip: PropTypes.number.isRequired,
    guestCanPause: PropTypes.bool.isRequired,
    update: PropTypes.bool.isRequired,
    roomCode: PropTypes.string.isRequired,
    updateCallback: PropTypes.func.isRequired,
};

CreateRoomPage.defaultProps = {
    votesToSkip: 2,
    guestCanPause: true,
    update: false,
    roomCode: "",
    updateCallback: () => {},
};

export default function CreateRoomPage(props) {
    const history = useHistory();
    const [cookies, setCookie, removeCookie] = useCookies(["csrftoken"]);

    const title = props.update ? "Update Room" : "Create a Room";
    const [guestCanPause, setGuestCanPause] = useState(props.guestCanPause);
    const [defaultGuestCanPause, setDefaultGuestCanPause] = useState(
        props.guestCanPause
    );
    const [votesToSkip, setVotesToSkip] = useState(props.votesToSkip);
    const [logMessage, setLogMessage] = useState("");
    const [updateError, setUpdateError] = useState(false);

    function handleVotesChange(e) {
        setVotesToSkip(Number(e.target.value));
    }

    function handleGuestCanPauseChange(e) {
        setGuestCanPause(e.target.value === "true" ? true : false);
    }

    function handleRoomButtonPressed() {
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
            .then((data) => history.push("/room/" + data.code));
    }

    function handleUpdateButtonPressed() {
        const requestOptions = {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": cookies.csrftoken,
            },
            body: JSON.stringify({
                votes_to_skip: votesToSkip,
                guest_can_pause: guestCanPause,
                code: props.roomCode,
            }),
        };

        fetch("/api/update-room", requestOptions).then((response) => {
            if (response.ok) setLogMessage("Room updated successfully!");
            else setLogMessage("Error updating room...");

            props.updateCallback();
        });
    }

    function renderCreateButtons() {
        return (
            <Grid container spacing={1}>
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
        );
    }

    function renderUpdateButtons() {
        return (
            <Grid item xs={12} align="center">
                <Button
                    color="primary"
                    variant="contained"
                    onClick={handleUpdateButtonPressed}
                >
                    Update Room
                </Button>
            </Grid>
        );
    }

    return (
        <Grid container spacing={1}>
            <Grid item xs={12} align="center">
                <Collapse in={logMessage != ""}>
                    {updateError === true ? (
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
                    {title}
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
                        defaultValue={defaultGuestCanPause.toString()}
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
                        defaultValue={votesToSkip}
                        inputProps={{
                            min: 1,
                            style: { textAlign: "center" },
                        }}
                        onChange={handleVotesChange}
                    />
                    <FormHelperText>
                        <span align="center">Votes Required To Skip Song</span>
                    </FormHelperText>
                </FormControl>
            </Grid>
            {props.update ? renderUpdateButtons() : renderCreateButtons()}
        </Grid>
    );
}
