import { Button, ButtonGroup, Grid, Typography } from "@material-ui/core";
import React, { useContext, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { RoomContext } from "../contexts/RoomContext";

export default function HomePage() {
    const { roomCode, getUserRoom, setRoomCode } = useContext(RoomContext);
    const navigate = useNavigate();

    async function fetchUserRoom() {
        const userRoomCode = await getUserRoom();

        if (userRoomCode) {
            setRoomCode(userRoomCode);
            navigate("/room/" + userRoomCode);
        }
    }

    useEffect(() => {
        if (!roomCode) {
            fetchUserRoom();
        } else navigate("/room/" + roomCode);
    }, []);

    return (
        <Grid container spacing={3} direction="column" alignItems="center">
            <Grid container item xs={12} alignItems="center">
                <Typography variant="h3">House Party</Typography>
            </Grid>
            <Grid container item xs={12} alignItems="center">
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
