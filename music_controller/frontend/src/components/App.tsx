import React from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import { RoomContextProvider } from "../contexts/RoomContext";
import CreateRoomPage from "./CreateRoomPage";
import HomePage from "./HomePage";
import Room from "./Room";
import RoomJoinPage from "./RoomJoinPage";
import RoomSettings from "./RoomSettings";

export default function App() {
    return (
        <div className="center">
            <RoomContextProvider>
                <Router>
                    <Switch>
                        <Route path="/" exact component={HomePage} />
                        <Route path="/join" component={RoomJoinPage} />
                        <Route path="/create" component={CreateRoomPage} />
                        <Route path="/room/:roomCode" exact component={Room} />
                        <Route path="/room/:roomCode/settings" component={RoomSettings} />
                    </Switch>
                </Router>
            </RoomContextProvider>
        </div>
    );
}
