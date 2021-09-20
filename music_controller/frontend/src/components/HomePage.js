import React, { useEffect, useState } from "react";
import {
    BrowserRouter as Router,
    Switch,
    Route,
    Link,
    Redirect,
} from "react-router-dom";
import { Grid, Button, ButtonGroup, Typography } from "@material-ui/core";

import RoomJoinPage from "./RoomJoinPage";
import CreateRoomPage from "./CreateRoomPage";
import Room from "./Room";

export default function HomePage() {
    const [roomCode, setRoomCode] = useState(null);

    useEffect(async () => {
        fetch("/api/user-in-room")
            .then((response) => response.json())
            .then((data) => {
                setRoomCode(data.code);
            });
    }, []);

    function renderHomePage() {
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

    return (
        <Router>
            <Switch>
                <Route
                    exact
                    path="/"
                    render={() => {
                        return roomCode ? (
                            <Redirect to={`/room/${roomCode}`} />
                        ) : (
                            renderHomePage()
                        );
                    }}
                />
                <Route path="/join" component={RoomJoinPage} />
                <Route path="/create" component={CreateRoomPage} />
                <Route path="/room/:roomCode" component={Room} />
            </Switch>
        </Router>
    );
}
