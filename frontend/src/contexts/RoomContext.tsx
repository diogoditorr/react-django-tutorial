import { AxiosResponse } from "axios";
import React, { Dispatch, SetStateAction, useState } from "react";
import api from "../services/api";

type DefaultRoomProps = {
    votesToSkip: number;
    guestCanPause: boolean;
};

type RoomData = {
    code: string;
    host: string;
    is_host: boolean;
    votes_to_skip: number;
    guest_can_pause: boolean;
    created_at: string;
};

type UserInRoomData = {
    code: string | null;
}

type RoomContextType = {
    defaultRoomProps: DefaultRoomProps;
    roomCode: string;
    getRoom: (roomCode: string) => Promise<{
        data: RoomData;
        response: AxiosResponse;
    }>;
    getUserRoom: () => Promise<string | null>;
    setRoomCode: Dispatch<SetStateAction<string>>;
};

type RoomContextProviderProps = {
    children: React.ReactNode;
};

export const RoomContext = React.createContext({} as RoomContextType);

export function RoomContextProvider(props: RoomContextProviderProps) {
    const [roomCode, setRoomCode] = useState("");
    const [defaultRoomProps, setDefaultRoomProps] = useState({
        votesToSkip: 2,
        guestCanPause: true,
    });

    async function getRoom(roomCode: string) {
        const response = await api.get("/api/get-room" + "?code=" + roomCode);
        const data: RoomData = response.data;

        return { data, response };
    }

    async function getUserRoom() {
        const response = await api.get("/api/user-in-room");
        const data: UserInRoomData = response.data;

        return data.code
    }

    return (
        <RoomContext.Provider
            value={{
                defaultRoomProps,
                roomCode,
                getRoom,
                getUserRoom,
                setRoomCode,
            }}
        >
            {props.children}
        </RoomContext.Provider>
    );
}
