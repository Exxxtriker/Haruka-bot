require('dotenv').config();
const axios = require('axios');

class SpotifyAPI {
    constructor() {
        this.clientID = process.env.SPOTIFY_CLIENT_ID;
        this.clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
        this.token = null;
        this.tokenExpiration = null;
    }

    /**
     * Obtém um token de acesso do Spotify.
     */
    async getAccessToken() {
        // Verifica se o token ainda é válido
        if (this.token && this.tokenExpiration > Date.now()) {
            return this.token;
        }

        try {
            const response = await axios.post(
                'https://accounts.spotify.com/api/token',
                'grant_type=client_credentials',
                {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        Authorization: `Basic ${Buffer.from(`${this.clientID}:${this.clientSecret}`).toString('base64')}`,
                    },
                },
            );

            this.token = response.data.access_token;
            this.tokenExpiration = Date.now() + response.data.expires_in * 1000; // Converte para milissegundos
            return this.token;
        } catch (error) {
            console.error('Erro ao obter token de acesso:', error.response?.data || error.message);
            throw new Error('Não foi possível autenticar com o Spotify.');
        }
    }

    /**
     * Faz uma solicitação autenticada para a API do Spotify.
     * @param {string} endpoint - Endpoint da API (ex: `/v1/tracks/{id}`).
     * @param {Object} [params] - Parâmetros da solicitação.
     */
    async makeRequest(endpoint, params = {}) {
        const token = await this.getAccessToken();

        try {
            const response = await axios.get(`https://api.spotify.com${endpoint}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                params,
            });

            return response.data;
        } catch (error) {
            console.error('Erro ao fazer solicitação para o Spotify:', error.response?.data || error.message);
            throw new Error('Erro na solicitação para o Spotify.');
        }
    }

    /**
     * Obtém informações sobre uma música pelo ID ou URL.
     * @param {string} trackID - ID ou URL da música no Spotify.
     */
    async getTrack(trackID) {
        // Extrai o ID da URL, caso seja fornecida
        if (trackID.startsWith('https://')) {
            const match = trackID.match(/track\/([a-zA-Z0-9]+)/);
            if (match) {
                // eslint-disable-next-line prefer-destructuring
                trackID = match[1];
            } else {
                throw new Error('URL de música inválida.');
            }
        }

        return this.makeRequest(`/v1/tracks/${trackID}`);
    }

    /**
     * Obtém informações sobre uma playlist pelo ID ou URL.
     * @param {string} playlistID - ID ou URL da playlist no Spotify.
     */
    async getPlaylist(playlistID) {
        // Extrai o ID da URL, caso seja fornecida
        if (playlistID.startsWith('https://')) {
            const match = playlistID.match(/playlist\/([a-zA-Z0-9]+)/);
            if (match) {
                // eslint-disable-next-line prefer-destructuring
                playlistID = match[1];
            } else {
                throw new Error('URL de playlist inválida.');
            }
        }

        return this.makeRequest(`/v1/playlists/${playlistID}`);
    }

    /**
     * Obtém informações sobre um álbum pelo ID ou URL.
     * @param {string} albumID - ID ou URL do álbum no Spotify.
     */
    async getAlbum(albumID) {
        // Extrai o ID da URL, caso seja fornecida
        if (albumID.startsWith('https://')) {
            const match = albumID.match(/album\/([a-zA-Z0-9]+)/);
            if (match) {
                // eslint-disable-next-line prefer-destructuring
                albumID = match[1];
            } else {
                throw new Error('URL de álbum inválida.');
            }
        }

        return this.makeRequest(`/v1/albums/${albumID}`);
    }
}

module.exports = SpotifyAPI;
