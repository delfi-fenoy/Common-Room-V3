package com.thecommonroom.TheCommonRoom.exception;

public class MovieNotInPlaylistException extends RuntimeException {
    public MovieNotInPlaylistException(String message) {
        super(message);
    }
}
