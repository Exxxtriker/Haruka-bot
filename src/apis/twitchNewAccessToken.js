const axios = require('axios');
const { twitchClientId, twitchClientToken } = require('../../config');

exports.tokenRegister = (async () => {
    const apiFetch = await axios.post('https://id.twitch.tv/oauth2/token', { client_id: twitchClientId, client_secret: twitchClientToken, grant_type: 'client_credentials' })
        .catch((e) => console.log(e));
    return apiFetch.data.access_token;
})();
