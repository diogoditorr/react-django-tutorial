import { Button, ButtonGroup, Grid, Typography } from "@material-ui/core";
import React, { useContext, useEffect } from "react";
import { Link, useHistory } from "react-router-dom";
import { RoomContext } from "../contexts/RoomContext";

type UserInRoomData = {
    code: string | null;
}

export default function HomePage() {
    const { roomCode, setRoomCode } = useContext(RoomContext);
    const history = useHistory();

    useEffect(() => {
        if (!roomCode)
            fetch("/api/user-in-room")
                .then((response) => response.json())
                .then((data: UserInRoomData) => {
                    if (data.code !== null) {
                        setRoomCode(data.code);
                        history.push("/room/" + data.code);
                    }
                });
        else
            history.push("/room/" + roomCode);
    }, []);

    return (
        <Grid container spacing={3} direction="column" alignItems="center">
            <Grid item xs={12} alignItems="center">
                <Typography variant="h3">
                    House Party
                </Typography>
            </Grid>
            <Grid item xs={12} alignItems="center">
                <ButtonGroup
                    disableElevation
                    variant="contained"
                    color="primary"
                >
                    <Button color="primary" to="/join" component={Link}>
                        Join a Room
                    </Button>
                    <Button color="default" to="/info" component={Link}>
                        Info
                    </Button>
                    <Button color="secondary" to="/create" component={Link}>
                        Create a Room
                    </Button>
                </ButtonGroup>
            </Grid>
        </Grid>
    );
}
