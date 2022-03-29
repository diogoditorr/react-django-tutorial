import React, { useEffect, useState } from "react";
import { Grid, Button, Typography, IconButton } from "@material-ui/core";
import { NavigateBefore, NavigateNext } from "@material-ui/icons";

import { Link } from "react-router-dom";

const pages = {
    JOIN: "pages.join",
    CREATE: "pages.create",
};

export default function Info() {
    const [page, setPage] = useState(pages.JOIN);

    function joinInfo() {
        return "Join page";
    }

    function createInfo() {
        return "Create page";
    }

    useEffect(() => {
        console.log("ran");

        return () => {
            console.log("unmounted");
        }
    });

    return (
        <Grid container spacing={1}>
            <Grid
                container
                item
                xs={12}
                alignItems="center"
                justifyContent="center"
            >
                <Typography variant="h4" component="h4">
                    What is House Party?
                </Typography>
            </Grid>
            <Grid
                container
                item
                xs={12}
                alignItems="center"
                justifyContent="center"
            >
                <Typography variant="body1">
                    {page === pages.JOIN ? joinInfo() : createInfo()}
                </Typography>
            </Grid>
            <Grid
                container
                item
                xs={12}
                alignItems="center"
                justifyContent="center"
            >
                <IconButton
                    onClick={() => {
                        page === pages.CREATE
                            ? setPage(pages.JOIN)
                            : setPage(pages.CREATE);
                    }}
                >
                    {page === pages.CREATE ? (
                        <NavigateBefore />
                    ) : (
                        <NavigateNext />
                    )}
                </IconButton>
            </Grid>
            <Grid
                container
                item
                xs={12}
                alignItems="center"
                justifyContent="center"
            >
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
