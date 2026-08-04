package com.thecommonroom.TheCommonRoom.client;

import com.thecommonroom.TheCommonRoom.dto.RawMovieDTO;
import com.thecommonroom.TheCommonRoom.dto.RawMovieListDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

/**
 * Clase encargada de conectarse a la API The Movie Database y hacer los requests.
 */
@Component
@RequiredArgsConstructor
public class TMDbClient {

    // Inyecta el valor de la propiedad "themoviedb.api.key" definida en el application.properties
    @Value("${themoviedb.api.key}")
    private String key;

    @Value("${themoviedb.api.base-url}")
    private String baseUrl;

    private final RestTemplate restTemplate; // Clase de Spring para hacer peticiones HTTP

    public RawMovieDTO getMovieById(Long id){
        String url = String.format("%s/movie/%d?api_key=%s&language=en-US", baseUrl, id, key);
        return restTemplate.getForObject(url, RawMovieDTO.class);
    }

    ///  PAGINACION DE PELICULAS | Llama a la API de TMDb y devuelve películas populares (paginadas)
    public RawMovieListDTO getPopularMovies(int page) {
        String url = String.format("%s/movie/popular?api_key=%s&page=%d&language=en-US", baseUrl, key, page);
        return restTemplate.getForObject(url, RawMovieListDTO.class);
    }

    public RawMovieListDTO getRecentMovies(int page) {
        String url = String.format("%s/movie/now_playing?api_key=%s&page=%d&language=en-US&region=AR", baseUrl, key, page);
        return restTemplate.getForObject(url, RawMovieListDTO.class);
    }

    public RawMovieListDTO getAllMovies(int page){
        String url = String.format("%s/discover/movie?api_key=%s" +
                                    "&page=%d" +
                                    "&language=en-US" +
                                    "&region=AR" +
                                    "&sort_by=popularity.desc", baseUrl, key, page);
        return restTemplate.getForObject(url, RawMovieListDTO.class);
    }

    public RawMovieListDTO getUpcomingMovies(int page){
        String url = String.format("%s/movie/upcoming?api_key=%s" +
                                    "&page=%d" +
                                    "&language=en-US" +
                                    "&region=AR", baseUrl, key, page);
        return restTemplate.getForObject(url, RawMovieListDTO.class);
    }

    ///  BARRA DE BUSQUEDA | Llama a la API de TMDb y devuelve las peliculas que contengan la query en el nombre
    // Mandamos año porque es lo único que soporta tmdb
    public RawMovieListDTO searchMovies(String query, int page, String year) {

        StringBuilder url = new StringBuilder(
                String.format("%s/search/movie?api_key=%s&query=%s&page=%d&language=en-US",
                baseUrl, key, query, page)
        );

        if(year != null && !year.isEmpty())
        {
            url.append("&year=").append(year);
        }
        return restTemplate.getForObject(url.toString(), RawMovieListDTO.class);
    }

}
