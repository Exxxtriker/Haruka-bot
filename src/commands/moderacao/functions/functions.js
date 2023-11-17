exports.verifiPermission = (interaction, toVerifi) => {
    if (toVerifi.roles.highest.rawPosition >= interaction.member.roles.highest.rawPosition) return true;
};
