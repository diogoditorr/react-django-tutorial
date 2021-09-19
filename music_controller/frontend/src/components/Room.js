import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

export default function Room() {
    const { roomCode } = useParams();
    const [votesToSkip, setVotesToSkip] = useState(2);
    const [guestCanPause, setGuestCanPause] = useState(false);
    const [isHost, setIsHost] = useState(false);

    function getRoomDetails() {
        fetch("/api/get-room" + "?code=" + roomCode)
            .then((response) => response.json())
            .then((data) => {
                setVotesToSkip(data.votes_to_skip);
                setGuestCanPause(data.guest_can_pause);
                setIsHost(data.is_host);
            });
    }
    
    useEffect(() => {
        getRoomDetails();
    }, [])

    return (
        <div>
            <h3>{roomCode}</h3>
            <p>{votesToSkip}</p>
            <p>Guest Can Pause: {guestCanPause ? 'yes' : 'no'}</p>
            <p>Host: {isHost ? 'yes' : 'no'}</p>
        </div>
    );
}
