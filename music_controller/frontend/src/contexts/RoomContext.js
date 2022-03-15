import PropTypes from "prop-types";
import React, { useState } from "react";

export const RoomContext = React.createContext({
    roomCode: "",
    setRoomCode: () => {},
    getRoomDetails: async () => {},
});

export function RoomContextProvider(props) {
    const [roomCode, setRoomCode] = useState("");
    const [defaultRoomProps, setDefaultRoomProps] = useState({
        votesToSkip: 2,
        guestCanPause: true,
    })

    async function getRoomDetails(roomCode) {
        const response = await fetch("/api/get-room" + "?code=" + roomCode);
        const data = await response.json();

        return { data, response };
    }

    return (
        <RoomContext.Provider
        value={{
                defaultRoomProps,
                roomCode,
                getRoomDetails,
                setRoomCode,
            }}
        >
            {props.children}
        </RoomContext.Provider>
    );
}

RoomContextProvider.propTypes = {
    children: PropTypes.node.isRequired,
};
