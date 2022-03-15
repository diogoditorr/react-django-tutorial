import { Button, ButtonGroup, Grid, Typography } from "@material-ui/core";
import React, { useContext, useEffect } from "react";
import { Link, useHistory } from "react-router-dom";
import { RoomContext } from "../contexts/RoomContext";

export default function HomePage() {
    const { setRoomCode } = useContext(RoomContext);
    const history = useHistory();

    useEffect(() => {
        fetch("/api/user-in-room")
            .then((response) => response.json())
            .then((data) => {
                if (data.code !== null) {
                    setRoomCode(data.code);
                    history.push("/room/" + data.code);
                }
            });
    }, []);

    return (
        <Grid container spacing={3}>
            <Grid item xs={12} align="center">
                <Typography variant="h3" compact="h3">
                    House Party
                </Typography>
            </Grid>
            <Grid item xs={12} align="center">
                <ButtonGroup
                    disableElevation
                    variant="contained"
                    color="primary"
                >
                    <Button color="primary" to="/join" component={Link}>
                        Join a Room
                    </Button>
                    <Button color="secondary" to="/create" component={Link}>
                        Create a Room
                    </Button>
                </ButtonGroup>
            </Grid>
        </Grid>
    );
}
