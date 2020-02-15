console.log("Initiating User.js...");

helpers = {};
helpers.GenerateID = function () {
    function s8() {
        return Math.floor((1 + Math.random()) * 0x100000000).toString(16).substring(1);
    }
    let result = s8() + s8() + '-' + s8();
    return result;
};

module.exports.HELPERS = helpers;