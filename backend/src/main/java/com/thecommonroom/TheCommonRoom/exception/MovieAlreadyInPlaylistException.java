package com.thecommonroom.TheCommonRoom.exception;

public class MovieAlreadyInPlaylistException extends RuntimeException {
    public MovieAlreadyInPlaylistException(String message) {
        super(message);
    }
}
