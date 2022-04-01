import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { RoomContextProvider } from "../contexts/RoomContext";
import CreateRoomPage from "./CreateRoomPage";
import HomePage from "./HomePage";
import Room from "./Room";
import RoomJoinPage from "./RoomJoinPage";
import RoomSettings from "./RoomSettings";
import Info from './Info';

export default function App() {
    return (
        <div className="center">
            <RoomContextProvider>
                <BrowserRouter>
                    <Routes>
                        <Route path="/" element={<HomePage />} />
                        <Route path="join" element={<RoomJoinPage />} />
                        <Route path="info" element={<Info />} />
                        <Route path="create" element={<CreateRoomPage />} />
                        <Route path="room">
                            <Route path=":roomCode" element={<Room />} />
                            <Route path=":roomCode/settings" element={<RoomSettings />} />
                        </Route>
                    </Routes>
                </BrowserRouter>
            </RoomContextProvider>
        </div>
    );
}
