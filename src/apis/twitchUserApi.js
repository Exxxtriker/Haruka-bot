const axios = require('axios');
const { twitchClientId } = require('../../config');
const { tokenRegister } = require('./twitchNewAccessToken');

exports.twitchUserAPI = async (twitchChannelName) => {
    const apiFetch = await axios.get(`https://api.twitch.tv/helix/users?login=${twitchChannelName}`, {
        headers: {
            'Client-ID': twitchClientId,
            Authorization: `Bearer ${await tokenRegister}`,
        },
    }).catch((e) => console.log(e));
    return apiFetch.data;
};
