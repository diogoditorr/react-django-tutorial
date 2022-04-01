import {
    Card, Grid, IconButton,
    LinearProgress, Typography
} from "@material-ui/core";
import { Pause, PlayArrow, SkipNext } from "@material-ui/icons";
import React from "react";
import api from "../services/api";
import { Song } from "./Room";

type MusicPlayerProps = {
    song: Song | Record<string, never>;
};

export default function MusicPlayer(props: MusicPlayerProps) {
    function getSongProgressFormated() {
        return (props.song.time / props.song.duration) * 100;
    }

    async function pauseSong() {
        await api.put("/api/spotify/pause", {});
    }

    async function playSong() {
        await api.put("/api/spotify/play", {});
    }

    async function skipSong() {
        await api.post("/api/spotify/skip", {});
    }

    return (
        <Card>
            <Grid container alignItems="center">
                <Grid item xs={4}>
                    <img
                        src={props.song.image_url}
                        height="100%"
                        width="100%"
                        alt=""
                    />
                </Grid>
                <Grid item xs={8}>
                    <Typography component="h5" variant="h5" align="center">
                        {props.song.title}
                    </Typography>
                    <Typography
                        color="textSecondary"
                        variant="subtitle1"
                        align="center"
                    >
                        {props.song.artist}
                    </Typography>
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        <IconButton
                            onClick={() =>
                                props.song.is_playing ? pauseSong() : playSong()
                            }
                        >
                            {props.song.is_playing ? <Pause /> : <PlayArrow />}
                        </IconButton>
                        <IconButton onClick={() => skipSong()}>
                            <SkipNext />
                        </IconButton>
                        <p>
                            {props.song.votes + " "} /{" "}
                            {props.song.votes_required}
                        </p>
                    </div>
                </Grid>
            </Grid>
            <LinearProgress
                variant="determinate"
                value={getSongProgressFormated()}
            />
        </Card>
    );
}
