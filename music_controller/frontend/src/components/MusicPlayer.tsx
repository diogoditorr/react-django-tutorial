import React from "react";
import {
    Grid,
    Typography,
    Card,
    IconButton,
    LinearProgress,
} from "@material-ui/core";
import { PlayArrow, SkipNext, Pause } from "@material-ui/icons";
import { Song } from "./Room";

type MusicPlayerProps = {
    song: Song | Record<string, never>;
};

export default function MusicPlayer(props: MusicPlayerProps) {
    function getSongProgressFormated() {
        return (props.song.time / props.song.duration) * 100;
    }

    async function pauseSong() {
        const requestOptions = {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
        };
        await fetch("/spotify/pause", requestOptions);
    }

    async function playSong() {
        const requestOptions = {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
        };
        await fetch("/spotify/play", requestOptions);
    }

    async function skipSong() {
        const requestOptions = {
            method: "POST",
            headers: { "Content-Type": "application/json" },
        }
        await fetch("/spotify/skip", requestOptions);
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
                            {props.song.votes + " "} / {props.song.votes_required}
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