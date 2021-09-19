import React from "react";
import {
    BrowserRouter as Router,
    Switch,
    Route,
    Link,
    Redirect,
} from "react-router-dom";

import RoomJoinPage from "./RoomJoinPage";
import CreateRoomPage from "./CreateRoomPage";
import Room from "./Room";

export default function HomePage() {
    return (
        <Router>
            <Switch>
                <Route exact path='/'><p>This is the home page</p></Route>
                <Route path='/join' component={RoomJoinPage}/>
                <Route path='/create' component={CreateRoomPage}/>
                <Route path='/room/:roomCode' component={Room} />
            </Switch>
        </Router>
    );
}
