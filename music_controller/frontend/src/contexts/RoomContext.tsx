import PropTypes from "prop-types";
import React, { Dispatch, SetStateAction, useState } from "react";


type DefaultRoomProps = {
    votesToSkip: number;
    guestCanPause: boolean;
}

type RoomData = {
    code: string;
    host: string;
    is_host: boolean;
    votes_to_skip: number;
    guest_can_pause: boolean;
    created_at: string;
}

type RoomContextType = {
    defaultRoomProps: DefaultRoomProps;
    roomCode: string;
    setRoomCode: Dispatch<SetStateAction<string>>;
    getRoomDetails: (roomCode: string) => Promise<{
        data: RoomData;
        response: Response;
    }>;
}

type RoomContextProviderProps = {
    children: React.ReactNode;
}

export const RoomContext = React.createContext({} as RoomContextType);

export function RoomContextProvider(props: RoomContextProviderProps) {
    const [roomCode, setRoomCode] = useState("");
    const [defaultRoomProps, setDefaultRoomProps] = useState({
        votesToSkip: 2,
        guestCanPause: true,
    })

    async function getRoomDetails(roomCode: string) {
        const response = await fetch("/api/get-room" + "?code=" + roomCode);
        const data: RoomData = await response.json();

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
